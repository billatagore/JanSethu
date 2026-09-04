from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.models import Team, TeamJoinRequest, User, Problem, Task, TaskStatus
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.post("")
def create_team(
    team_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new team for a problem."""
    problem = db.query(Problem).filter(Problem.id == team_data.get("problem_id")).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Create team
    new_team = Team(
        name=team_data.get("name"),
        description=team_data.get("description"),
        problem_id=team_data.get("problem_id"),
        created_by=current_user.id,
        required_roles=json.dumps(team_data.get("required_roles", [])),
    )

    db.add(new_team)
    db.flush()

    # Add creator as team member
    new_team.members.append(current_user)

    db.commit()
    db.refresh(new_team)

    return {
        "id": new_team.id,
        "name": new_team.name,
        "problem_id": new_team.problem_id,
        "message": "Team created successfully",
    }


@router.get("/{team_id}")
def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get team details."""
    team = db.query(Team).filter(Team.id == team_id).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    required_roles = []
    if team.required_roles:
        try:
            required_roles = json.loads(team.required_roles)
        except:
            pass

    return {
        "id": team.id,
        "name": team.name,
        "description": team.description,
        "problem_id": team.problem_id,
        "created_at": team.created_at,
        "required_roles": required_roles,
        "member_count": len(team.members),
        "members": [
            {"id": m.id, "name": m.name, "role": m.role, "organization": m.organization}
            for m in team.members
        ],
    }


@router.post("/{team_id}/join")
def request_to_join_team(
    team_id: int,
    join_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Request to join a team."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    # Check if user already in team
    if current_user in team.members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already in team",
        )

    existing_request = db.query(TeamJoinRequest).filter(
        TeamJoinRequest.team_id == team_id,
        TeamJoinRequest.user_id == current_user.id,
        TeamJoinRequest.status == "pending",
    ).first()
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Join request already pending",
        )

    request = TeamJoinRequest(
        user_id=current_user.id,
        team_id=team_id,
        requested_role=join_data.get("requested_role"),
        status="pending",
    )

    db.add(request)
    db.commit()

    return {
        "message": "Join request submitted successfully",
        "team_id": team_id,
        "status": request.status,
    }


@router.get("/{team_id}/join-requests")
def list_join_requests(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List join requests for a team lead."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    if team.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the team lead can view requests")

    return {
        "team_id": team_id,
        "requests": [
            {
                "id": request.id,
                "user_id": request.user_id,
                "requested_role": request.requested_role,
                "status": request.status,
                "created_at": request.created_at,
            }
            for request in team.join_requests
        ],
    }


@router.put("/{team_id}/join-requests/{request_id}")
def update_join_request(
    team_id: int,
    request_id: int,
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve or reject a team join request."""
    team = db.query(Team).filter(Team.id == team_id).first()
    request = db.query(TeamJoinRequest).filter(
        TeamJoinRequest.id == request_id,
        TeamJoinRequest.team_id == team_id,
    ).first()
    if not team or not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found")
    if team.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the team lead can update requests")

    decision = request_data.get("status")
    if decision not in {"accepted", "rejected"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be accepted or rejected")
    if request.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Join request already decided")

    request.status = decision
    if decision == "accepted":
        user = db.query(User).filter(User.id == request.user_id).first()
        if user and user not in team.members:
            team.members.append(user)
    db.commit()

    return {"id": request.id, "status": request.status}


@router.get("/{team_id}/tasks")
def list_team_tasks(team_id: int, db: Session = Depends(get_db)):
    """List tasks for a team."""
    team = db.query(Team).filter(Team.id == team_id).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    tasks = db.query(Task).filter(Task.team_id == team_id).all()

    return {
        "team_id": team_id,
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "status": t.status,
                "assigned_to": t.assigned_to,
                "created_at": t.created_at,
            }
            for t in tasks
        ],
    }


@router.post("/{team_id}/tasks")
def create_task(
    team_id: int,
    task_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a task for a team."""
    team = db.query(Team).filter(Team.id == team_id).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    if current_user not in team.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members can create tasks",
        )

    task = Task(
        title=task_data.get("title"),
        description=task_data.get("description"),
        team_id=team_id,
        status=task_data.get("status", "todo"),
        assigned_to=task_data.get("assigned_to"),
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "message": "Task created successfully",
    }


@router.put("/{team_id}/tasks/{task_id}")
def update_task(
    team_id: int,
    task_id: int,
    task_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task status."""
    task = (
        db.query(Task).filter(Task.id == task_id, Task.team_id == team_id).first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if current_user not in task.team.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members can update tasks",
        )

    if "status" in task_data:
        task.status = task_data["status"]

    db.commit()

    return {"message": "Task updated successfully"}
