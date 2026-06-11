import os
import aiohttp
import airportsdata

API_KEY = os.getenv("AVIATIONSTACK_KEY")
BASE_URL = "http://api.aviationstack.com/v1"

_airports = airportsdata.load("IATA")


def get_iata(city: str):
    city = city.lower()
    for code, info in _airports.items():
        if city == info.get("city", "").lower():
            return code
    raise ValueError(f"No airport found for '{city}'")


async def search_flights(origin: str, destination: str):
    origin_code = get_iata(origin)
    destination_code = get_iata(destination)

    params = {
        "access_key": API_KEY,
        "dep_iata": origin_code,
        "arr_iata": destination_code,
        "limit": 5,
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BASE_URL}/flights", params=params) as resp:
            data = await resp.json()

    flights = [
        {
            "airline": f.get("airline", {}).get("name"),
            "flight": f.get("flight", {}).get("iata"),
            "status": f.get("flight_status"),
        }
        for f in data.get("data", [])
    ]
    return {"flights": flights}
