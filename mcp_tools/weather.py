import os
import requests

API_KEY = os.getenv("WEATHERAPI_KEY")


def get_weather(city: str):
    url = f"http://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"
    data = requests.get(url).json()

    if "error" in data:
        return {"error": data["error"]["message"]}

    return {
        "city": data["location"]["name"],
        "temperature": data["current"]["temp_c"],
        "condition": data["current"]["condition"]["text"],
    }
