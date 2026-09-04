from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Table, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    STUDENT = "student"
    RESEARCHER = "researcher"
    INDUSTRY = "industry"
    NGO = "ngo"
    MENTOR = "mentor"
    ADMIN = "admin"


class UrgencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ProblemStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    AI_ANALYZED = "ai_analyzed"
    UNDER_REVIEW = "under_review"
    TEAM_FORMED = "team_formed"
    SOLUTION_PROPOSED = "solution_proposed"
    PROTOTYPE = "prototype"
    VALIDATION = "validation"
    IMPLEMENTED = "implemented"
    IMPACT_MEASURED = "impact_measured"
    CLOSED = "closed"


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class SolutionStatus(str, enum.Enum):
    PROPOSED = "proposed"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    IMPLEMENTED = "implemented"


# Association tables for many-to-many relationships
problem_skills = Table(
    'problem_skills',
    Base.metadata,
    Column('problem_id', Integer, ForeignKey('problem.id')),
    Column('skill_id', Integer, ForeignKey('skill.id'))
)

problem_sdgs = Table(
    'problem_sdgs',
    Base.metadata,
    Column('problem_id', Integer, ForeignKey('problem.id')),
    Column('sdg_id', Integer, ForeignKey('sdg.id'))
)

team_members = Table(
    'team_members',
    Base.metadata,
    Column('team_id', Integer, ForeignKey('team.id')),
    Column('user_id', Integer, ForeignKey('user.id'))
)


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    role = Column(Enum(UserRole))
    organization = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    problems = relationship("Problem", back_populates="submitted_by_user")
    solutions = relationship("Solution", back_populates="submitted_by_user")
    comments = relationship("Comment", back_populates="user")
    teams = relationship("Team", secondary=team_members, back_populates="members")
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    notifications = relationship("Notification", back_populates="user")


class Profile(Base):
    __tablename__ = "profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user.id'), unique=True)
    skills = Column(Text, nullable=True)  # JSON string
    interests = Column(Text, nullable=True)  # JSON string
    experience = Column(Text, nullable=True)
    portfolio_url = Column(String, nullable=True)
    availability = Column(String, nullable=True)
    sdg_interests = Column(Text, nullable=True)  # JSON string

    user = relationship("User", back_populates="profile")


class Skill(Base):
    __tablename__ = "skill"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, nullable=True)


class SDG(Base):
    __tablename__ = "sdg"

    id = Column(Integer, primary_key=True, index=True)
    sdg_number = Column(Integer, unique=True)
    title = Column(String)
    description = Column(Text)
    color = Column(String)


class Organization(Base):
    __tablename__ = "organization"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # University, Company, NGO, Government, Community
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    problems = relationship("Problem", back_populates="organization")


class Problem(Base):
    __tablename__ = "problem"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    location = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    affected_population = Column(String, nullable=True)
    number_affected = Column(Integer, nullable=True)
    current_situation = Column(Text, nullable=True)
    existing_solutions = Column(Text, nullable=True)
    why_insufficient = Column(Text, nullable=True)
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    expected_outcome = Column(Text, nullable=True)
    status = Column(Enum(ProblemStatus), default=ProblemStatus.SUBMITTED)
    priority_score = Column(Float, default=0)
    submitted_by = Column(Integer, ForeignKey('user.id'))
    organization_id = Column(Integer, ForeignKey('organization.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    submitted_by_user = relationship("User", back_populates="problems")
    organization = relationship("Organization", back_populates="problems")
    analysis = relationship("ProblemAnalysis", back_populates="problem", uselist=False)
    solutions = relationship("Solution", back_populates="problem")
    skills = relationship("Skill", secondary=problem_skills)
    sdgs = relationship("SDG", secondary=problem_sdgs)
    comments = relationship("Comment", back_populates="problem")
    teams = relationship("Team", back_populates="problem")
    updates = relationship("ProblemUpdate", back_populates="problem")
    votes = relationship("ProblemVote", back_populates="problem", cascade="all, delete-orphan")
    follows = relationship("ProblemFollow", back_populates="problem", cascade="all, delete-orphan")


class ProblemVote(Base):
    __tablename__ = "problem_vote"
    __table_args__ = (UniqueConstraint("problem_id", "user_id", name="uq_problem_vote_user"),)

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problem.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="votes")
    user = relationship("User")


class ProblemFollow(Base):
    __tablename__ = "problem_follow"
    __table_args__ = (UniqueConstraint("problem_id", "user_id", name="uq_problem_follow_user"),)

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problem.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="follows")
    user = relationship("User")


class ProblemAnalysis(Base):
    __tablename__ = "problem_analysis"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey('problem.id'), unique=True)
    ai_category = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)
    root_causes = Column(Text, nullable=True)  # JSON string
    affected_population_detailed = Column(Text, nullable=True)
    priority_score = Column(Float)
    urgency_level = Column(String)
    required_skills = Column(Text, nullable=True)  # JSON string
    required_expertise = Column(Text, nullable=True)  # JSON string
    suggested_solutions = Column(Text, nullable=True)  # JSON string
    complexity = Column(String)  # Low, Medium, High
    potential_stakeholders = Column(Text, nullable=True)  # JSON string
    potential_collaborators = Column(Text, nullable=True)  # JSON string
    suggested_technologies = Column(Text, nullable=True)  # JSON string
    expected_social_impact = Column(Text, nullable=True)
    risks_challenges = Column(Text, nullable=True)  # JSON string
    recommended_next_steps = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="analysis")


class Solution(Base):
    __tablename__ = "solution"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    problem_id = Column(Integer, ForeignKey('problem.id'))
    submitted_by = Column(Integer, ForeignKey('user.id'))
    technology = Column(Text, nullable=True)
    expected_impact = Column(Text, nullable=True)
    estimated_cost = Column(String, nullable=True)
    implementation_timeline = Column(String, nullable=True)
    prototype_link = Column(String, nullable=True)
    status = Column(Enum(SolutionStatus), default=SolutionStatus.PROPOSED)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    problem = relationship("Problem", back_populates="solutions")
    submitted_by_user = relationship("User", back_populates="solutions")
    comparisons = relationship("SolutionComparison", back_populates="solution")


class SolutionComparison(Base):
    __tablename__ = "solution_comparison"

    id = Column(Integer, primary_key=True, index=True)
    solution_id = Column(Integer, ForeignKey('solution.id'))
    metric = Column(String)
    score = Column(Float)

    solution = relationship("Solution", back_populates="comparisons")


class Team(Base):
    __tablename__ = "team"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    problem_id = Column(Integer, ForeignKey('problem.id'))
    created_by = Column(Integer, ForeignKey('user.id'), nullable=True)
    required_roles = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="teams")
    members = relationship("User", secondary=team_members, back_populates="teams")
    tasks = relationship("Task", back_populates="team")
    join_requests = relationship("TeamJoinRequest", back_populates="team")


class Task(Base):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    team_id = Column(Integer, ForeignKey('team.id'))
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    assigned_to = Column(Integer, ForeignKey('user.id'), nullable=True)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="tasks")


class TeamJoinRequest(Base):
    __tablename__ = "team_join_request"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    team_id = Column(Integer, ForeignKey('team.id'))
    requested_role = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="join_requests")


class Comment(Base):
    __tablename__ = "comment"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    problem_id = Column(Integer, ForeignKey('problem.id'))
    user_id = Column(Integer, ForeignKey('user.id'))
    parent_id = Column(Integer, ForeignKey('comment.id'), nullable=True)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="comments")
    user = relationship("User", back_populates="comments")
    replies = relationship("Comment", remote_side=[id])


class Message(Base):
    __tablename__ = "message"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey('user.id'))
    receiver_id = Column(Integer, ForeignKey('user.id'))
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="messages_received")


class Notification(Base):
    __tablename__ = "notification"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    type = Column(String)  # problem_submitted, analysis_completed, team_joined, etc.
    title = Column(String)
    message = Column(Text)
    related_id = Column(Integer, nullable=True)  # problem_id, team_id, etc.
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class MentorRequest(Base):
    __tablename__ = "mentor_request"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey('team.id'), nullable=True)
    problem_id = Column(Integer, ForeignKey('problem.id'), nullable=True)
    mentor_id = Column(Integer, ForeignKey('user.id'))
    requester_id = Column(Integer, ForeignKey('user.id'))
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=datetime.utcnow)


class ProblemUpdate(Base):
    __tablename__ = "problem_update"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey('problem.id'))
    title = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="updates")


class ImpactMetric(Base):
    __tablename__ = "impact_metric"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey('problem.id'), nullable=True)
    metric_type = Column(String)  # people_impacted, communities_impacted, etc.
    value = Column(Float)
    unit = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
