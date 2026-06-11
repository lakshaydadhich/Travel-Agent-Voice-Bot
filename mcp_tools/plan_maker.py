import os
from typing import List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel


class DayPlan(BaseModel):
    day: int
    morning: str
    afternoon: str
    evening: str


class ItineraryPlan(BaseModel):
    destination: str
    total_days: int
    days: List[DayPlan]
    travel_tips: List[str]


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.6,
    google_api_key=os.getenv("GOOGLE_API_KEY"),
).with_structured_output(ItineraryPlan)

prompt = ChatPromptTemplate.from_template("""
Create a {days}-day itinerary for {destination}.
- Use real places
- Short activities
- Add 2 travel tips
""")


async def generate_itinerary(destination: str, days: int):
    chain = prompt | llm
    result = await chain.ainvoke({"destination": destination, "days": days})
    return result.model_dump()
