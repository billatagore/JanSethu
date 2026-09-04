from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import json

from app.database import get_db
from app.models import (
    User,
    Profile,
    Problem,
    Solution,
    Team,
    Notification,
    SDG,
    ProblemStatus,
)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile."""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    profile_data = {}
    if user.profile:
        profile_data = {
            "skills": json.loads(user.profile.skills) if user.profile.skills else [],
            "interests": json.loads(user.profile.interests)
            if user.profile.interests
            else [],
            "experience": user.profile.experience,
            "portfolio_url": user.profile.portfolio_url,
        }

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "organization": user.organization,
        "location": user.location,
        "bio": user.bio,
        "profile": profile_data,
        "created_at": user.created_at,
    }


@router.put("/{user_id}")
def update_user_profile(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user_id: int = Query(None),
):
    """Update user profile."""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own profile",
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update user fields
    if "name" in user_data:
        user.name = user_data["name"]
    if "bio" in user_data:
        user.bio = user_data["bio"]
    if "location" in user_data:
        user.location = user_data["location"]
    if "organization" in user_data:
        user.organization = user_data["organization"]

    # Update or create profile
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)

    if "skills" in user_data:
        profile.skills = json.dumps(user_data["skills"])
    if "interests" in user_data:
        profile.interests = json.dumps(user_data["interests"])
    if "experience" in user_data:
        profile.experience = user_data["experience"]
    if "portfolio_url" in user_data:
        profile.portfolio_url = user_data["portfolio_url"]

    db.commit()

    return {"message": "Profile updated successfully"}


@router.get("/{user_id}/problems")
def get_user_problems(user_id: int, db: Session = Depends(get_db)):
    """Get problems submitted by a user."""
    problems = db.query(Problem).filter(Problem.submitted_by == user_id).all()

    return {
        "user_id": user_id,
        "problems": [
            {
                "id": p.id,
                "title": p.title,
                "category": p.category,
                "status": p.status,
                "priority_score": p.priority_score,
                "created_at": p.created_at,
            }
            for p in problems
        ],
    }


@router.get("/{user_id}/solutions")
def get_user_solutions(user_id: int, db: Session = Depends(get_db)):
    """Get solutions submitted by a user."""
    solutions = db.query(Solution).filter(Solution.submitted_by == user_id).all()

    return {
        "user_id": user_id,
        "solutions": [
            {
                "id": s.id,
                "title": s.title,
                "problem_id": s.problem_id,
                "status": s.status,
                "created_at": s.created_at,
            }
            for s in solutions
        ],
    }


@router.get("/{user_id}/notifications")
def get_user_notifications(user_id: int, db: Session = Depends(get_db)):
    """Get user notifications."""
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "user_id": user_id,
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in notifications
        ],
    }
