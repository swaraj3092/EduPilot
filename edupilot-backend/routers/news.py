from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import random
from datetime import datetime

router = APIRouter()

class NewsArticle(BaseModel):
    id: str
    title: str
    summary: str
    category: str
    date: str
    readTime: str
    country: str

@router.get("/latest")
async def get_latest_news(country: str = "USA"):
    # Simulated AI News Generation based on Country
    all_news = [
        {
            "id": "1",
            "title": f"New 2026 Visa Regulations for {country}",
            "summary": f"The government has announced a streamlined visa process for Indian students pursuing STEM degrees in {country}.",
            "category": "Visa Update",
            "date": "2 hours ago",
            "readTime": "3 min",
            "country": country
        },
        {
            "id": "2",
            "title": "Shift in Tech Hiring Trends",
            "summary": "AI and Machine Learning graduates are seeing a 40% higher starting salary compared to traditional CS roles in 2026.",
            "category": "Job Market",
            "date": "5 hours ago",
            "readTime": "5 min",
            "country": "Global"
        },
        {
            "id": "3",
            "title": f"Top 5 Scholarships for {country} in 2027",
            "summary": "Applications are now open for the Global Excellence Scholarship and the merit-based Future Leaders grant.",
            "category": "Scholarship",
            "date": "1 day ago",
            "readTime": "4 min",
            "country": country
        },
        {
            "id": "4",
            "title": "Poonawalla Fincorp Education Loan Rates Drop",
            "summary": "Financing your dream is now more affordable with a 0.5% reduction in interest rates for elite university admissions.",
            "category": "Financing",
            "date": "Today",
            "readTime": "2 min",
            "country": "India"
        }
    ]
    
    # Filter by country or return all
    return {"articles": all_news}
