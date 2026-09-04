from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CITIZEN = "citizen"
    STUDENT = "student"
    RESEARCHER = "researcher"
    INDUSTRY = "industry"
    NGO = "ngo"
    MENTOR = "mentor"
    ADMIN = "admin"


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    organization: Optional[str] = None
    location: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    organization: Optional[str]
    location: Optional[str]
    bio: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProblemCreate(BaseModel):
    title: str
    description: str
    category: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    affected_population: Optional[str] = None
    number_affected: Optional[int] = None
    current_situation: Optional[str] = None
    existing_solutions: Optional[str] = None
    why_insufficient: Optional[str] = None
    urgency: str = "medium"
    expected_outcome: Optional[str] = None


class SDGResponse(BaseModel):
    sdg_number: int
    title: str
    reason: Optional[str] = None


class AIAnalysisResponse(BaseModel):
    category: str
    summary: str
    priority_score: float
    urgency_level: str
    sdgs: List[SDGResponse]
    required_skills: List[str]
    required_expertise: List[str]
    suggested_solutions: List[str]
    complexity: str
    affected_population_detailed: str
    potential_stakeholders: List[str]
    potential_collaborators: List[str]
    suggested_technologies: List[str]
    expected_social_impact: str
    risks_challenges: List[str]
    recommended_next_steps: List[str]


class ProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    affected_population: Optional[str]
    number_affected: Optional[int]
    urgency: str
    status: str
    priority_score: float
    submitted_by: int
    created_at: datetime
    analysis: Optional[AIAnalysisResponse] = None

    class Config:
        from_attributes = True


class SolutionCreate(BaseModel):
    title: str
    description: str
    technology: Optional[str] = None
    expected_impact: Optional[str] = None
    estimated_cost: Optional[str] = None
    implementation_timeline: Optional[str] = None
    prototype_link: Optional[str] = None


class SolutionResponse(BaseModel):
    id: int
    title: str
    description: str
    problem_id: int
    submitted_by: int
    technology: Optional[str]
    expected_impact: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None
    problem_id: int
    required_roles: Optional[List[str]] = None


class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    problem_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    created_at: datetime
    likes: int

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    assigned_to: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
