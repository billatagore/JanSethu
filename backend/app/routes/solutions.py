from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Solution, Problem, User, SolutionStatus
from app.schemas import SolutionCreate, SolutionResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/problems", tags=["solutions"])


@router.post("/{problem_id}/solutions")
def create_solution(
    problem_id: int,
    solution_data: SolutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a solution for a problem."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Create solution
    new_solution = Solution(
        title=solution_data.title,
        description=solution_data.description,
        problem_id=problem_id,
        submitted_by=current_user.id,
        technology=solution_data.technology,
        expected_impact=solution_data.expected_impact,
        estimated_cost=solution_data.estimated_cost,
        implementation_timeline=solution_data.implementation_timeline,
        prototype_link=solution_data.prototype_link,
        status=SolutionStatus.PROPOSED,
    )

    db.add(new_solution)
    db.commit()
    db.refresh(new_solution)

    return {
        "id": new_solution.id,
        "title": new_solution.title,
        "problem_id": problem_id,
        "message": "Solution submitted successfully",
    }


@router.get("/{problem_id}/solutions", response_model=List[SolutionResponse])
def list_solutions(problem_id: int, db: Session = Depends(get_db)):
    """List all solutions for a problem."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    solutions = db.query(Solution).filter(Solution.problem_id == problem_id).all()
    return solutions


@router.get("/{problem_id}/solutions/{solution_id}")
def get_solution(
    problem_id: int,
    solution_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific solution."""
    solution = (
        db.query(Solution)
        .filter(Solution.id == solution_id, Solution.problem_id == problem_id)
        .first()
    )

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    return {
        "id": solution.id,
        "title": solution.title,
        "description": solution.description,
        "problem_id": solution.problem_id,
        "submitted_by": solution.submitted_by,
        "technology": solution.technology,
        "expected_impact": solution.expected_impact,
        "estimated_cost": solution.estimated_cost,
        "implementation_timeline": solution.implementation_timeline,
        "prototype_link": solution.prototype_link,
        "status": solution.status,
        "created_at": solution.created_at,
    }


@router.put("/{problem_id}/solutions/{solution_id}")
def update_solution(
    problem_id: int,
    solution_id: int,
    solution_data: SolutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a solution."""
    solution = (
        db.query(Solution)
        .filter(Solution.id == solution_id, Solution.problem_id == problem_id)
        .first()
    )

    if not solution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solution not found",
        )

    if solution.submitted_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own solutions",
        )

    solution.title = solution_data.title
    solution.description = solution_data.description
    solution.technology = solution_data.technology
    solution.expected_impact = solution_data.expected_impact
    solution.estimated_cost = solution_data.estimated_cost
    solution.implementation_timeline = solution_data.implementation_timeline
    solution.prototype_link = solution_data.prototype_link

    db.commit()
    db.refresh(solution)

    return {
        "id": solution.id,
        "message": "Solution updated successfully",
    }


@router.patch("/{problem_id}/solutions/{solution_id}/stage")
def update_solution_stage(
    problem_id: int,
    solution_id: int,
    stage_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Move a solution through its supported workflow stages."""
    solution = db.query(Solution).filter(
        Solution.id == solution_id,
        Solution.problem_id == problem_id,
    ).first()
    if not solution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solution not found")
    if solution.submitted_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the solution owner can update its stage")

    allowed_stages = {"proposed", "under_review", "approved", "rejected", "implemented"}
    stage = stage_data.get("status")
    if stage not in allowed_stages:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid solution stage")

    solution.status = SolutionStatus(stage)
    db.commit()
    return {"id": solution.id, "status": solution.status}
