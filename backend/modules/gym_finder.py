""""Location-based gym finder backed by OpenStreetMap / Overpass.

Listings are live community-mapped data, not a complete or verified directory.
Only the 15 supported Indian cities listed below are accepted, and geocoding
is constrained to each city's state and India to avoid silently returning
Pune-area results for a different city name.
"""
import json
import logging
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/gym-finder", tags=["Location-based Gym Finder"])
USER_AGENT = "AIGymFitnessAssistant/1.0 (city gym finder)"
logger = logging.getLogger(__name__)

# Deliberately limited to 15 supported cities. Keep this list in sync with
# frontend/src/components/GymRecommender.jsx.
SUPPORTED_CITIES = {
    "Pune": "Maharashtra",
    "Mumbai": "Maharashtra",
    "Nagpur": "Maharashtra",
    "Nashik": "Maharashtra",
    "Bengaluru": "Karnataka",
    "Hyderabad": "Telangana",
    "Chennai": "Tamil Nadu",
    "Delhi": "Delhi",
    "Kolkata": "West Bengal",
    "Ahmedabad": "Gujarat",
    "Surat": "Gujarat",
    "Jaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh",
    "Indore": "Madhya Pradesh",
    "Bhopal": "Madhya Pradesh",
}

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
OVERPASS_SERVER_TIMEOUT = 10
OVERPASS_CLIENT_TIMEOUT = 12
GEOCODE_TIMEOUT = 5
RESULT_CACHE_TTL = 60 * 60

NOTICE = (
    "Community-mapped listings may be incomplete or out of date. "
    "Confirm details with the gym before visiting."
)
NETWORK_ERRORS = (HTTPError, URLError, TimeoutError, OSError, ValueError, KeyError)

# City (casefolded) -> (timestamp, full search result before the limit is applied)
_result_cache: dict = {}


def _get_json(url: str, timeout: int = 25):
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _geocode(city: str) -> dict:
    state = SUPPORTED_CITIES[city]
    geocode_url = "https://nominatim.openstreetmap.org/search?" + urlencode({
        "q": f"{city}, {state}, India",
        "format": "json",
        "limit": 5,
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

    # Prefer a result whose state and country match the configured city.
    for location in locations:
        address = location.get("address", {})
        country = address.get("country_code", "").casefold()
        state_name = address.get("state", "").casefold()
        if country == "in" and state.casefold() in state_name:
            return location

    if locations:
        # Query already includes city + state + India; use the first matching
        # result if Nominatim omits state details for a city-centre result.
        return locations[0]

    raise HTTPException(
        status_code=404,
        detail=f"Couldn't locate {city}, {state}, India. Please try again later.",
    )


def _query_overpass(latitude: float, longitude: float, radius_m: int = 8000) -> dict:
    query = f"""[out:json][timeout:{OVERPASS_SERVER_TIMEOUT}];
(
  nwr["leisure"="fitness_centre"](around:{radius_m},{latitude},{longitude});
  nwr["amenity"="gym"](around:{radius_m},{latitude},{longitude});
);
out center tags;"""
    encoded_query = urlencode({"data": query}).encode("utf-8")

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
                f"https://www.google.com/maps/search/?api=1&query={quote(name + ', ' + place + ', India')}"
            ),
            "directions_url": (
                f"https://www.google.com/maps/dir/?api=1&destination={lat},{lon}"
                if lat is not None and lon is not None else
                f"https://www.google.com/maps/dir/?api=1&destination={quote(name + ', ' + place + ', India')}"
            ),
            "source": "OpenStreetMap",
        })
    gyms.sort(key=lambda item: item["name"].casefold())
    return gyms


def _search_place(city: str) -> dict:
    location = _geocode(city)
    try:
        latitude = float(location["lat"])
        longitude = float(location["lon"])
    except (KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=502,
            detail="The open map service returned an unexpected location. Please try again.",
        ) from exc

    payload = _query_overpass(latitude, longitude)
    gyms = _build_gym_list(payload, city)
    return {
        "city": city,
        "matched_location": location.get("display_name", f"{city}, {SUPPORTED_CITIES[city]}, India"),
        "total_mapped_results": len(gyms),
        "source": "OpenStreetMap",
        "notice": NOTICE,
        "gyms": gyms,
    }


def _refresh_cached_city(city: str, key: str) -> None:
    """Refresh stale cached results in the background without blocking users."""
    try:
        data = _search_place(city)
        _result_cache[key] = (time.time(), data)
    except Exception as exc:
        # Keep serving the last successful snapshot if an upstream provider is down.
        logger.info("Background gym refresh failed for %s: %s", city, exc)


@router.get("/cities")
def list_supported_cities():
    """Return the fixed list of supported cities for the gym finder."""
    return [{"city": city, "state": state} for city, state in SUPPORTED_CITIES.items()]


@router.get("/search")
def search_gyms(
    city: str = Query(..., min_length=2, max_length=100, description="One of the 15 supported Indian cities"),
    limit: int = Query(50, ge=1, le=100),
):
    """Find mapped gyms in one supported city. Successful results are cached for one hour."""
    normalized_city = city.strip()
    city_lookup = {name.casefold(): name for name in SUPPORTED_CITIES}
    canonical_city = city_lookup.get(normalized_city.casefold())
    if not canonical_city:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported city. Choose one of: {', '.join(SUPPORTED_CITIES)}.",
        )

    key = canonical_city.casefold()
    now = time.time()
    cached = _result_cache.get(key)

    if cached and now - cached[0] < RESULT_CACHE_TTL:
        data = cached[1]
    elif cached:
        # Stale-while-revalidate: show the last successful results immediately
        # instead of making users wait for a slow third-party map service.
        data = cached[1]
        threading.Thread(
            target=_refresh_cached_city,
            args=(canonical_city, key),
            daemon=True,
        ).start()
    else:
        # First search has a strict upstream timeout; successful results are
        # cached so subsequent searches are fast.
        data = _search_place(canonical_city)
        _result_cache[key] = (time.time(), data)

    return {
        **data,
        "count": min(len(data["gyms"]), limit),
        "gyms": data["gyms"][:limit],
    }
