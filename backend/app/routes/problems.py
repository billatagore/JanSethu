from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import asyncio

from app.database import get_db
from app.models import (
    Problem,
    ProblemAnalysis,
    User,
    Skill,
    SDG,
    ProblemStatus,
)
from app.schemas import (
    ProblemCreate,
    ProblemResponse,
    AIAnalysisResponse,
)
from app.services import analyze_problem, match_users_to_problem

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.post("")
async def create_problem(
    problem_data: ProblemCreate,
    db: Session = Depends(get_db),
    user_id: int = Query(None),
):
    """Create a new problem."""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Create problem
    new_problem = Problem(
        title=problem_data.title,
        description=problem_data.description,
        category=problem_data.category,
        location=problem_data.location,
        latitude=problem_data.latitude,
        longitude=problem_data.longitude,
        affected_population=problem_data.affected_population,
        number_affected=problem_data.number_affected,
        current_situation=problem_data.current_situation,
        existing_solutions=problem_data.existing_solutions,
        why_insufficient=problem_data.why_insufficient,
        urgency=problem_data.urgency,
        expected_outcome=problem_data.expected_outcome,
        submitted_by=user_id,
        status=ProblemStatus.SUBMITTED,
    )

    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)

    return {
        "id": new_problem.id,
        "title": new_problem.title,
        "status": new_problem.status,
        "message": "Problem submitted successfully",
    }


@router.get("")
def list_problems(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
):
    """List all problems with optional filters."""
    query = db.query(Problem)

    if category:
        query = query.filter(Problem.category == category)
    if location:
        query = query.filter(Problem.location.ilike(f"%{location}%"))
    if urgency:
        query = query.filter(Problem.urgency == urgency)

    if sort_by == "priority":
        query = query.order_by(Problem.priority_score.desc())
    elif sort_by == "newest":
        query = query.order_by(Problem.created_at.desc())
    else:
        query = query.order_by(Problem.created_at.desc())

    problems = query.all()
    
    # Convert to dict format without analysis for list view
    result = []
    for problem in problems:
        result.append({
            "id": problem.id,
            "title": problem.title,
            "description": problem.description,
            "category": problem.category,
            "location": problem.location,
            "latitude": problem.latitude,
            "longitude": problem.longitude,
            "affected_population": problem.affected_population,
            "number_affected": problem.number_affected,
            "urgency": problem.urgency,
            "status": problem.status,
            "priority_score": problem.priority_score,
            "submitted_by": problem.submitted_by,
            "created_at": problem.created_at,
            "analysis": None,
        })
    
    return result


@router.get("/{problem_id}")
def get_problem(problem_id: int, db: Session = Depends(get_db)):
    """Get a specific problem."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    analysis = None
    if problem.analysis:
        # Parse JSON fields in analysis
        try:
            root_causes = (
                json.loads(problem.analysis.root_causes)
                if problem.analysis.root_causes
                else []
            )
            required_skills = (
                json.loads(problem.analysis.required_skills)
                if problem.analysis.required_skills
                else []
            )
            suggested_solutions = (
                json.loads(problem.analysis.suggested_solutions)
                if problem.analysis.suggested_solutions
                else []
            )
            potential_stakeholders = (
                json.loads(problem.analysis.potential_stakeholders)
                if problem.analysis.potential_stakeholders
                else []
            )
            potential_collaborators = (
                json.loads(problem.analysis.potential_collaborators)
                if problem.analysis.potential_collaborators
                else []
            )
            suggested_technologies = (
                json.loads(problem.analysis.suggested_technologies)
                if problem.analysis.suggested_technologies
                else []
            )
            risks_challenges = (
                json.loads(problem.analysis.risks_challenges)
                if problem.analysis.risks_challenges
                else []
            )
            recommended_next_steps = (
                json.loads(problem.analysis.recommended_next_steps)
                if problem.analysis.recommended_next_steps
                else []
            )

            analysis = {
                "category": problem.analysis.ai_category,
                "summary": problem.analysis.ai_summary,
                "priority_score": problem.analysis.priority_score,
                "urgency_level": problem.analysis.urgency_level,
                "sdgs": [],
                "required_skills": required_skills,
                "required_expertise": (
                    json.loads(problem.analysis.required_expertise)
                    if problem.analysis.required_expertise
                    else []
                ),
                "suggested_solutions": suggested_solutions,
                "complexity": problem.analysis.complexity,
                "affected_population_detailed": problem.analysis.affected_population_detailed,
                "potential_stakeholders": potential_stakeholders,
                "potential_collaborators": potential_collaborators,
                "suggested_technologies": suggested_technologies,
                "expected_social_impact": problem.analysis.expected_social_impact,
                "risks_challenges": risks_challenges,
                "recommended_next_steps": recommended_next_steps,
            }
        except:
            analysis = None

    return {
        "id": problem.id,
        "title": problem.title,
        "description": problem.description,
        "category": problem.category,
        "location": problem.location,
        "latitude": problem.latitude,
        "longitude": problem.longitude,
        "affected_population": problem.affected_population,
        "number_affected": problem.number_affected,
        "urgency": problem.urgency,
        "status": problem.status,
        "priority_score": problem.priority_score,
        "submitted_by": problem.submitted_by,
        "created_at": problem.created_at,
        "analysis": analysis,
    }


@router.post("/{problem_id}/analyze")
async def analyze_problem_endpoint(problem_id: int, db: Session = Depends(get_db)):
    """Analyze a problem using AI."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Check if already analyzed
    if problem.analysis:
        return {
            "message": "Problem already analyzed",
            "analysis_id": problem.analysis.id,
        }

    # Prepare problem data for analysis
    problem_data = {
        "title": problem.title,
        "description": problem.description,
        "category": problem.category,
        "location": problem.location,
        "affected_population": problem.affected_population,
        "number_affected": problem.number_affected,
        "current_situation": problem.current_situation,
        "existing_solutions": problem.existing_solutions,
    }

    # Run AI analysis
    analysis_result = await analyze_problem(problem_data)

    if not analysis_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze problem",
        )

    # Store analysis in database
    sdgs_data = analysis_result.get("relevant_sdgs", [])

    analysis = ProblemAnalysis(
        problem_id=problem_id,
        ai_category=analysis_result.get("category"),
        ai_summary=analysis_result.get("summary"),
        root_causes=json.dumps(analysis_result.get("root_causes", [])),
        affected_population_detailed=analysis_result.get(
            "affected_population_detailed"
        ),
        priority_score=analysis_result.get("priority_score", 0),
        urgency_level=analysis_result.get("urgency_level"),
        required_skills=json.dumps(analysis_result.get("required_skills", [])),
        required_expertise=json.dumps(analysis_result.get("required_expertise", [])),
        suggested_solutions=json.dumps(analysis_result.get("suggested_solutions", [])),
        complexity=analysis_result.get("complexity"),
        potential_stakeholders=json.dumps(
            analysis_result.get("potential_stakeholders", [])
        ),
        potential_collaborators=json.dumps(
            analysis_result.get("potential_collaborators", [])
        ),
        suggested_technologies=json.dumps(
            analysis_result.get("suggested_technologies", [])
        ),
        expected_social_impact=analysis_result.get("expected_social_impact"),
        risks_challenges=json.dumps(analysis_result.get("risks_challenges", [])),
        recommended_next_steps=json.dumps(
            analysis_result.get("recommended_next_steps", [])
        ),
    )

    db.add(analysis)

    # Update problem priority and status
    problem.priority_score = analysis_result.get("priority_score", 0)
    problem.status = ProblemStatus.AI_ANALYZED

    # Link SDGs to problem
    for sdg_data in sdgs_data:
        sdg_num = sdg_data.get("number")
        sdg = db.query(SDG).filter(SDG.sdg_number == sdg_num).first()
        if sdg and sdg not in problem.sdgs:
            problem.sdgs.append(sdg)

    db.commit()
    db.refresh(problem)

    return {
        "message": "Problem analysis completed",
        "analysis": {
            "category": analysis.ai_category,
            "summary": analysis.ai_summary,
            "priority_score": analysis.priority_score,
            "urgency_level": analysis.urgency_level,
            "required_skills": json.loads(analysis.required_skills),
            "suggested_solutions": json.loads(analysis.suggested_solutions),
            "complexity": analysis.complexity,
        },
    }


@router.get("/{problem_id}/matches")
def get_matched_users(problem_id: int, db: Session = Depends(get_db)):
    """Get users matched to a problem based on skills."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    if not problem.analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Problem has not been analyzed yet",
        )

    # Get required skills from analysis
    required_skills = json.loads(problem.analysis.required_skills)

    # Get all users and their profiles
    users = db.query(User).all()
    available_users = []

    for user in users:
        if user.id == problem.submitted_by:
            continue  # Skip problem submitter

        skills = []
        if user.profile and user.profile.skills:
            try:
                skills = json.loads(user.profile.skills)
            except:
                skills = []

        available_users.append(
            {
                "id": user.id,
                "name": user.name,
                "role": user.role,
                "organization": user.organization,
                "skills": skills,
            }
        )

    # Match users
    matches = match_users_to_problem(required_skills, available_users)

    return {"problem_id": problem_id, "matches": matches}
