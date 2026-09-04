from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Comment, Problem, User
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/comments", tags=["comments"])


@router.post("/problems/{problem_id}")
def create_comment(
    problem_id: int,
    comment_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a comment on a problem."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    # Create comment
    comment = Comment(
        content=comment_data.get("content"),
        problem_id=problem_id,
        user_id=current_user.id,
        parent_id=comment_data.get("parent_id"),
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "content": comment.content,
        "message": "Comment created successfully",
    }


@router.get("/problems/{problem_id}")
def get_problem_comments(problem_id: int, db: Session = Depends(get_db)):
    """Get all comments for a problem."""
    problem = db.query(Problem).filter(Problem.id == problem_id).first()

    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found",
        )

    comments = db.query(Comment).filter(Comment.problem_id == problem_id, Comment.parent_id == None).all()

    return {
        "problem_id": problem_id,
        "comments": [
            {
                "id": c.id,
                "content": c.content,
                "user_id": c.user_id,
                "user_name": c.user.name if c.user else "Unknown",
                "created_at": c.created_at,
                "likes": c.likes,
            }
            for c in comments
        ],
    }
