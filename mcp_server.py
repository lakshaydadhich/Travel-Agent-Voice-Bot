from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

from mcp.server.fastmcp import FastMCP

# Import tools
from mcp_tools.hotel import get_hotels
from mcp_tools.weather import get_weather
from mcp_tools.places import get_places
from mcp_tools.flight import search_flights
from mcp_tools.plan_maker import generate_itinerary

mcp = FastMCP("travel-agent")

# ========================
# TOOLS
# ========================

@mcp.tool()
def places(city: str):
    print("📍 Places tool called:", city)
    try:
        result = get_places(city)
        return f"Here are the top places to visit in {city}: {result}"
    except Exception as e:
        return f"Sorry, I couldn't fetch places for {city}. Error: {str(e)}"



@mcp.tool()
def hotels(city: str):
    result = get_hotels(city)

    hotels = result.get("hotels", [])

    if not hotels:
        return f"No hotels found in {city}"

    response = f"Top hotels in {city}:\n"

    for h in hotels:
        response += f"\n- {h['name']} ({h['address']})"

    return response   # ✅ simple string is fine
    
@mcp.tool()
def weather(city: str):
    print("🌦 Weather tool called:", city)
    
    try:
        result = get_weather(city)

        # Handle API error
        if "error" in result:
            return f"❌ Weather error: {result['error']}"

        # Extract values
        city_name = result["city"]
        temp = result["temperature"]
        condition = result["condition"]

        # Return clean natural language
        return f"The current weather in {city_name} is {temp}°C with {condition}."

    except Exception as e:
        return f"Sorry, I couldn't fetch weather for {city}. Error: {str(e)}"

@mcp.tool()
async def flights(origin: str, destination: str):
    print("✈️ Flight tool called:", origin, "→", destination)
    try:
        result = await search_flights(origin, destination)
        return f"Here are available flights from {origin} to {destination}: {result}"
    except Exception as e:
        return f"Sorry, I couldn't find flights. Error: {str(e)}"


@mcp.tool()
async def itinerary(destination: str, days: int):
    print("🧭 Itinerary tool called:", destination)
    try:
        result = await generate_itinerary(destination, days)
        return f"Here is your {days}-day travel plan for {destination}: {result}"
    except Exception as e:
        return f"Sorry, I couldn't create itinerary. Error: {str(e)}"


# ========================
# RUN SERVER
# ========================
if __name__ == "__main__":
    print("🚀 MCP Server running on http://127.0.0.1:8000/sse")
    mcp.run(transport="sse")