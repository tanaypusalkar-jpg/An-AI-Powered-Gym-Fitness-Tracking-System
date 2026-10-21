"""Location-based gym finder backed by OpenStreetMap / Overpass.

Listings are live community-mapped data, not a complete or verified directory.

Changes from the previous version:
- Successful search results are cached in memory for one hour, so repeat
  searches for the same city never call Nominatim or Overpass again.
- Overpass endpoints get a longer per-request timeout (35 s) because the public
  servers are often slow under load, which caused the 503 errors.
- Failures are not cached, so the next search retries the network.
"""
import json
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/gym-finder", tags=["Location-based Gym Finder"])
USER_AGENT = "AIGymFitnessAssistant/1.0 (Maharashtra gym finder)"
logger = logging.getLogger(__name__)

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
OVERPASS_SERVER_TIMEOUT = 25      # [timeout:...] inside the Overpass query
OVERPASS_CLIENT_TIMEOUT = 35      # how long we wait for each endpoint over the network
GEOCODE_TIMEOUT = 15
RESULT_CACHE_TTL = 60 * 60        # seconds

NOTICE = "Community-mapped listings may be incomplete or out of date. Confirm details with the gym before visiting."
NETWORK_ERRORS = (HTTPError, URLError, TimeoutError, OSError, ValueError, KeyError)

# place (casefolded) -> (timestamp, full search result before the limit is applied)
_result_cache: dict = {}


def _get_json(url: str, timeout: int = 25):
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _geocode(place: str) -> dict:
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
        locations = _get_json(geocode_url, timeout=GEOCODE_TIMEOUT)
    except NETWORK_ERRORS as exc:
        raise HTTPException(
            status_code=502,
            detail="The open map service is temporarily unavailable. Please try again shortly.",
        ) from exc
    if not locations:
        raise HTTPException(
            status_code=404,
            detail=f"Couldn't locate '{place}' in Maharashtra. Try a city or district name.",
        )
    return locations[0]


def _query_overpass(latitude: float, longitude: float, radius_m: int = 8000) -> dict:
    query = f"""[out:json][timeout:{OVERPASS_SERVER_TIMEOUT}];
(
  nwr["leisure"="fitness_centre"](around:{radius_m},{latitude},{longitude});
  nwr["amenity"="gym"](around:{radius_m},{latitude},{longitude});
);
out center tags;"""
    encoded_query = urlencode({"data": query}).encode("utf-8")

    # Ask every Overpass server at the same time and use the first good answer.
    # Sequential attempts made a slow server add its full timeout to the search.
    pool = ThreadPoolExecutor(max_workers=len(OVERPASS_ENDPOINTS))
    try:
        futures = {pool.submit(_query_one_endpoint, url, encoded_query): url for url in OVERPASS_ENDPOINTS}
        last_error = None
        for future in as_completed(futures):
            try:
                return future.result()
            except NETWORK_ERRORS as exc:
                last_error = exc
                logger.info("Overpass endpoint %s failed: %s", futures[future], exc)
    finally:
        # wait=False so we don't block on slow servers that are still running
        pool.shutdown(wait=False, cancel_futures=True)

    logger.warning("All Overpass endpoints failed: %s", last_error)
    raise HTTPException(
        status_code=503,
        detail="The gym map service is busy or temporarily unavailable. Wait a moment and try again.",
    )


def _query_one_endpoint(overpass_url: str, encoded_query: bytes) -> dict:
    request = Request(
        overpass_url,
        data=encoded_query,
        headers={
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        method="POST",
    )
    with urlopen(request, timeout=OVERPASS_CLIENT_TIMEOUT) as response:
        return json.loads(response.read().decode("utf-8"))


def _build_gym_list(payload: dict, place: str) -> list:
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
        gyms.append({
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
        })
    gyms.sort(key=lambda item: item["name"].casefold())
    return gyms


def _search_place(place: str) -> dict:
    location = _geocode(place)
    try:
        latitude = float(location["lat"])
        longitude = float(location["lon"])
    except (KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="The open map service returned an unexpected location. Please try again.",
        ) from exc
    payload = _query_overpass(latitude, longitude)
    gyms = _build_gym_list(payload, place)
    return {
        "city": place,
        "matched_location": location.get("display_name", place),
        "total_mapped_results": len(gyms),
        "source": "OpenStreetMap",
        "notice": NOTICE,
        "gyms": gyms,
    }


@router.get("/search")
def search_gyms(
    city: str = Query(..., min_length=2, max_length=100, description="City or district in Maharashtra"),
    limit: int = Query(50, ge=1, le=100),
):
    """Find mapped gyms in a Maharashtra city/district, with map links. Results are cached for one hour."""
    place = city.strip()
    if not place:
        raise HTTPException(status_code=422, detail="Enter a city or district.")

    key = place.casefold()
    now = time.time()
    cached = _result_cache.get(key)
    if cached and now - cached[0] < RESULT_CACHE_TTL:
        data = cached[1]
    else:
        data = _search_place(place)          # raises HTTPException on failure, so nothing is cached
        _result_cache[key] = (now, data)

    return {
        **data,
        "count": min(len(data["gyms"]), limit),
        "gyms": data["gyms"][:limit],
    }