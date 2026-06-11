import os
import requests

API_KEY = os.getenv("GEOAPIFY_KEY")


def get_hotels(city: str):
    geo_url = f"https://api.geoapify.com/v1/geocode/search?text={city}&apiKey={API_KEY}"
    geo_res = requests.get(geo_url).json()

    lat = geo_res["features"][0]["properties"]["lat"]
    lon = geo_res["features"][0]["properties"]["lon"]

    places_url = (
        f"https://api.geoapify.com/v2/places"
        f"?categories=accommodation.hotel"
        f"&filter=circle:{lon},{lat},5000"
        f"&limit=5"
        f"&apiKey={API_KEY}"
    )
    places_res = requests.get(places_url).json()

    hotels = []
    for place in places_res["features"]:
        prop = place["properties"]
        hotels.append({
            "name": prop.get("name", "N/A"),
            "address": prop.get("formatted", "N/A"),
        })

    return {"hotels": hotels}
