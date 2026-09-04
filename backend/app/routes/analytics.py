from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import (
    Problem,
    User,
    Solution,
    Team,
    ProblemStatus,
    UserRole,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total_problems = db.query(func.count(Problem.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_solutions = db.query(func.count(Solution.id)).scalar() or 0
    total_teams = db.query(func.count(Team.id)).scalar() or 0

    # Problems by category
    problems_by_category = (
        db.query(Problem.category, func.count(Problem.id))
        .group_by(Problem.category)
        .all()
    )

    # Problems by status
    problems_by_status = (
        db.query(Problem.status, func.count(Problem.id))
        .group_by(Problem.status)
        .all()
    )

    # Users by role
    users_by_role = (
        db.query(User.role, func.count(User.id)).group_by(User.role).all()
    )

    # Solutions by status
    solutions_by_status = (
        db.query(Solution.status, func.count(Solution.id))
        .group_by(Solution.status)
        .all()
    )

    # Top problems by priority
    top_problems = (
        db.query(Problem.id, Problem.title, Problem.priority_score)
        .order_by(Problem.priority_score.desc())
        .limit(10)
        .all()
    )

    return {
        "total_problems": total_problems,
        "total_users": total_users,
        "total_solutions": total_solutions,
        "total_teams": total_teams,
        "problems_by_category": [
            {"category": cat, "count": count} for cat, count in problems_by_category
        ],
        "problems_by_status": [
            {"status": status, "count": count} for status, count in problems_by_status
        ],
        "users_by_role": [
            {"role": role, "count": count} for role, count in users_by_role
        ],
        "solutions_by_status": [
            {"status": status, "count": count}
            for status, count in solutions_by_status
        ],
        "top_problems": [
            {"id": p[0], "title": p[1], "priority_score": p[2]} for p in top_problems
        ],
    }


@router.get("/impact")
def get_impact_metrics(db: Session = Depends(get_db)):
    """Get impact metrics."""
    
    # Calculate impact metrics
    implemented_problems = (
        db.query(func.count(Problem.id))
        .filter(Problem.status == ProblemStatus.IMPLEMENTED)
        .scalar()
        or 0
    )
    
    active_teams = db.query(func.count(Team.id)).scalar() or 0
    
    total_contributors = (
        db.query(func.count(User.id))
        .filter(User.role.in_(["student", "researcher", "mentor"]))
        .scalar()
        or 0
    )

    universities = db.query(User.organization).filter(
        User.role.in_(["student", "researcher"])
    ).distinct().count()

    return {
        "problems_implemented": implemented_problems,
        "active_teams": active_teams,
        "total_contributors": total_contributors,
        "universities_involved": universities,
        "estimated_people_impacted": implemented_problems * 500,  # Mock calculation
    }
