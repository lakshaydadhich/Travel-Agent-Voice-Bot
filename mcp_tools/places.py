import os
import requests

API_KEY = os.getenv("GEOAPIFY_KEY")


def get_places(city: str):
    url = (
        f"https://api.geoapify.com/v2/places"
        f"?categories=tourism.sights"
        f"&filter=place:{city}"
        f"&limit=5"
        f"&apiKey={API_KEY}"
    )
    data = requests.get(url).json()

    results = [
        item["properties"].get("name", "Unknown place")
        for item in data.get("features", [])
    ]
    return ", ".join(results)
