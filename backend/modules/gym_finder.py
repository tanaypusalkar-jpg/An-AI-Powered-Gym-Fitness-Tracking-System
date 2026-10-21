"""Location-based gym finder backed by OpenStreetMap / Overpass.

Listings are live community-mapped data, not a complete or verified directory.
"""
import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/gym-finder", tags=["Location-based Gym Finder"])
USER_AGENT = "AIGymFitnessAssistant/1.0 (Maharashtra gym finder)"


def _get_json(url: str, timeout: int = 25):
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


@router.get("/search")
def search_gyms(
    city: str = Query(..., min_length=2, max_length=100, description="City or district in Maharashtra"),
    limit: int = Query(50, ge=1, le=100),
):
    """Find mapped gyms in a Maharashtra city/district, with map links."""
    place = city.strip()
    if not place:
        raise HTTPException(status_code=422, detail="Enter a city or district.")

    # Restrict geocoding to Maharashtra, India so same-named places elsewhere
    # are less likely to be selected.
    geocode_url = "https://nominatim.openstreetmap.org/search?" + urlencode({
        "q": f"{place}, Maharashtra, India",
        "format": "json",
        "limit": 1,
        "countrycodes": "in",
        "addressdetails": 1,
    })
    try:
        locations = _get_json(geocode_url, timeout=15)
        if not locations:
            raise HTTPException(
                status_code=404,
                detail=f"Couldn't locate '{place}' in Maharashtra. Try a city or district name.",
            )

        location = locations[0]
        south, north, west, east = map(float, location["boundingbox"])
        # Avoid unexpectedly huge Overpass queries for broad geocoding results.
        if north - south > 1.5 or east - west > 1.5:
            raise HTTPException(
                status_code=400,
                detail="That area is too broad. Search for a city or district headquarters instead.",
            )

        bbox = f"{south},{west},{north},{east}"
        query = f"""[out:json][timeout:20];
(
  nwr["leisure"="fitness_centre"]({bbox});
  nwr["sport"~"fitness|gym",i]({bbox});
  nwr["amenity"="gym"]({bbox});
);
out center tags;"""
        overpass_url = "https://overpass-api.de/api/interpreter"
        request = Request(
            overpass_url,
            # Overpass expects form-encoded data=... for POST requests.
            data=urlencode({"data": query}).encode("utf-8"),
            headers={"User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urlopen(request, timeout=25) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPException:
        raise
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=502,
            detail="The open map service is temporarily unavailable. Please try again shortly.",
        ) from exc

    gyms = []
    seen = set()
    for element in payload.get("elements", []):
        tags = element.get("tags", {})
        name = tags.get("name") or tags.get("brand") or tags.get("operator")
        if not name:
            continue
        lat = element.get("lat", (element.get("center") or {}).get("lat"))
        lon = element.get("lon", (element.get("center") or {}).get("lon"))
        key = (name.casefold(), round(lat, 5) if lat is not None else None,
               round(lon, 5) if lon is not None else None)
        if key in seen:
            continue
        seen.add(key)

        address_parts = [
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
            tags.get("addr:suburb") or tags.get("addr:neighbourhood"),
            tags.get("addr:city") or tags.get("addr:town") or tags.get("addr:village"),
        ]
        address = ", ".join(part for part in address_parts if part) or tags.get("addr:full")
        gym = {
            "id": f"{element.get('type', 'node')}/{element.get('id')}",
            "name": name,
            "address": address or "Address not listed",
            "city": tags.get("addr:city") or tags.get("addr:town") or place,
            "latitude": lat,
            "longitude": lon,
            "phone": tags.get("phone") or tags.get("contact:phone"),
            "website": tags.get("website") or tags.get("contact:website"),
            "opening_hours": tags.get("opening_hours"),
            "map_url": (
                f"https://www.openstreetmap.org/{element.get('type')}/{element.get('id')}"
                if element.get("type") and element.get("id") else
                f"https://www.google.com/maps/search/?api=1&query={quote(name + ', ' + place + ', Maharashtra')}"
            ),
            "directions_url": (
                f"https://www.google.com/maps/dir/?api=1&destination={lat},{lon}"
                if lat is not None and lon is not None else
                f"https://www.google.com/maps/dir/?api=1&destination={quote(name + ', ' + place + ', Maharashtra')}"
            ),
            "source": "OpenStreetMap",
        }
        gyms.append(gym)

    gyms.sort(key=lambda item: item["name"].casefold())
    return {
        "city": place,
        "matched_location": location.get("display_name", place),
        "count": min(len(gyms), limit),
        "total_mapped_results": len(gyms),
        "source": "OpenStreetMap",
        "notice": "Community-mapped listings may be incomplete or out of date. Confirm details with the gym before visiting.",
        "gyms": gyms[:limit],
    }
