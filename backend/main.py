from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.models import *
import logging

# Import routes
from app.routes import router as auth_router
from app.routes.problems import router as problems_router
from app.routes.solutions import router as solutions_router
from app.routes.teams import router as teams_router
from app.routes.comments import router as comments_router
from app.routes.users import router as users_router
from app.routes.analytics import router as analytics_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Societal Solutions Hub",
    description="AI-powered platform for solving societal challenges",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(problems_router)
app.include_router(solutions_router)
app.include_router(teams_router)
app.include_router(comments_router)
app.include_router(users_router)
app.include_router(analytics_router)


@app.on_event("startup")
def startup_event():
    """Initialize database with demo data."""
    db = next(get_db())
    
    # Check if data already exists
    problem_count = db.query(Problem).count()
    if problem_count > 0:
        db.close()
        return
    
    from datetime import datetime
    
    # Initialize SDGs
    sdg_descriptions = {
        1: ("No Poverty", "End poverty in all its forms everywhere"),
        2: ("Zero Hunger", "End hunger, achieve food security"),
        3: ("Good Health and Well-being", "Ensure healthy lives and promote well-being"),
        4: ("Quality Education", "Ensure inclusive and equitable quality education"),
        5: ("Gender Equality", "Achieve gender equality and empower women and girls"),
        6: ("Clean Water and Sanitation", "Ensure access to water and sanitation"),
        7: ("Affordable and Clean Energy", "Ensure access to modern energy services"),
        8: ("Decent Work and Economic Growth", "Promote sustained, inclusive economic growth"),
        9: ("Industry Innovation and Infrastructure", "Build resilient infrastructure"),
        10: ("Reduced Inequalities", "Reduce inequality within and among countries"),
        11: ("Sustainable Cities and Communities", "Make cities inclusive and sustainable"),
        12: ("Responsible Consumption and Production", "Ensure sustainable consumption"),
        13: ("Climate Action", "Take urgent action on climate change"),
        14: ("Life Below Water", "Conserve and sustainably use oceans and seas"),
        15: ("Life On Land", "Protect, restore and promote sustainable use of land"),
        16: ("Peace, Justice and Strong Institutions", "Promote just and inclusive societies"),
        17: ("Partnerships for the Goals", "Strengthen global partnership for sustainable development"),
    }
    
    colors = [
        "#E5243B",
        "#DDA540",
        "#4CA146",
        "#C6192B",
        "#DD3E39",
        "#26BDE2",
        "#FCC400",
        "#A21942",
        "#FD6925",
        "#DD1C3B",
        "#FD6925",
        "#BF8B2E",
        "#407D52",
        "#0A97D9",
        "#56C596",
        "#00689D",
        "#0EB582",
    ]
    
    for i, (num, (title, desc)) in enumerate(sdg_descriptions.items()):
        sdg = SDG(
            sdg_number=num,
            title=title,
            description=desc,
            color=colors[i] if i < len(colors) else "#000000",
        )
        db.add(sdg)
    
    db.commit()
    
    logger.info("Database initialized")
    db.close()


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "message": "Societal Solutions Hub API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/categories")
def get_categories():
    """Get all problem categories."""
    categories = [
        "Healthcare",
        "Education",
        "Environment",
        "Waste Management",
        "Agriculture",
        "Water & Sanitation",
        "Transportation",
        "Public Safety",
        "Accessibility",
        "Women's Safety",
        "Rural Development",
        "Energy",
        "Employment",
        "Digital Inclusion",
        "Disaster Management",
        "Other",
    ]
    
    icons = {
        "Healthcare": "🏥",
        "Education": "📚",
        "Environment": "🌍",
        "Waste Management": "♻️",
        "Agriculture": "🌾",
        "Water & Sanitation": "💧",
        "Transportation": "🚗",
        "Public Safety": "🚔",
        "Accessibility": "♿",
        "Women's Safety": "👩",
        "Rural Development": "🏘️",
        "Energy": "⚡",
        "Employment": "💼",
        "Digital Inclusion": "💻",
        "Disaster Management": "🚨",
        "Other": "📌",
    }
    
    return {
        "categories": [
            {"name": cat, "icon": icons.get(cat, "📌")} for cat in categories
        ]
    }


@app.get("/api/sdgs")
def get_sdgs(db: Session = Depends(get_db)):
    """Get all SDGs."""
    sdgs = db.query(SDG).all()
    return {
        "sdgs": [
            {
                "id": s.id,
                "number": s.sdg_number,
                "title": s.title,
                "description": s.description,
                "color": s.color,
            }
            for s in sdgs
        ]
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
