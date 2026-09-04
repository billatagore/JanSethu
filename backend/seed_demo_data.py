"""Database seeding script for demo data."""
import json
from datetime import datetime
from app.database import SessionLocal, engine, Base
from app.models import (
    User,
    Problem,
    ProblemAnalysis,
    Solution,
    Team,
    Team,
    Comment,
    Profile,
    UserRole,
    UrgencyLevel,
    ProblemStatus,
)
from app.services.auth import hash_password


def seed_demo_data():
    """Populate database with demo data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(Comment).delete()
        db.query(Solution).delete()
        db.query(Team).delete()
        db.query(ProblemAnalysis).delete()
        db.query(Problem).delete()
        db.query(Profile).delete()
        db.query(User).delete()
        db.commit()

        # Create demo users
        users_data = [
            {
                "email": "student@example.com",
                "password": "password123",
                "name": "Arjun Kumar",
                "role": UserRole.STUDENT,
                "organization": "IIT Delhi",
                "location": "New Delhi",
                "skills": ["Python", "Machine Learning", "IoT"],
            },
            {
                "email": "researcher@example.com",
                "password": "password123",
                "name": "Dr. Priya Sharma",
                "role": UserRole.RESEARCHER,
                "organization": "Delhi University",
                "location": "New Delhi",
                "skills": ["Environmental Science", "Data Analytics", "Research"],
            },
            {
                "email": "citizen@example.com",
                "password": "password123",
                "name": "Rajesh Singh",
                "role": UserRole.CITIZEN,
                "organization": "Community Project",
                "location": "Hyderabad",
                "skills": ["Community Building", "Waste Management"],
            },
            {
                "email": "industry@example.com",
                "password": "password123",
                "name": "Amir Patel",
                "role": UserRole.INDUSTRY,
                "organization": "TechCorp India",
                "location": "Bangalore",
                "skills": ["IoT", "Embedded Systems", "Hardware"],
            },
            {
                "email": "ngo@example.com",
                "password": "password123",
                "name": "Anjali Desai",
                "role": UserRole.NGO,
                "organization": "Green Earth Foundation",
                "location": "Mumbai",
                "skills": ["Sustainability", "Community Outreach", "Project Management"],
            },
            {
                "email": "mentor@example.com",
                "password": "password123",
                "name": "Prof. Vikram Rao",
                "role": UserRole.MENTOR,
                "organization": "IIT Bombay",
                "location": "Mumbai",
                "skills": ["Mentoring", "Innovation", "Business Strategy"],
            },
            {
                "email": "admin@example.com",
                "password": "password123",
                "name": "Admin User",
                "role": UserRole.ADMIN,
                "organization": "Societal Solutions Hub",
                "location": "India",
                "skills": ["Administration"],
            },
        ]

        users = []
        for user_data in users_data:
            skills = user_data.pop("skills")
            password = user_data.pop("password")
            user = User(
                **user_data,
                password_hash=hash_password(password),
            )
            db.add(user)
            users.append((user, skills))

        db.commit()

        # Create profiles for users
        user_objects = []
        for user, skills in users:
            user_objects.append(user)
            profile = Profile(
                user_id=user.id,
                skills=json.dumps(skills),
                interests=json.dumps(["Social Impact", "Innovation"]),
                experience="Experienced in solving real-world problems",
                portfolio_url="https://example.com/portfolio",
            )
            db.add(profile)

        db.commit()

        # Create demo problems
        problems_data = [
            {
                "title": "Biomedical Waste Management in Hospitals",
                "description": "Government hospital biomedical waste is not being properly segregated and disposed. This creates serious health risks for sanitation workers and nearby communities. Current manual segregation is inefficient and dangerous.",
                "category": "Waste Management",
                "location": "Hyderabad",
                "affected_population": "Healthcare workers, sanitation staff, local residents",
                "number_affected": 1500,
                "urgency": UrgencyLevel.HIGH,
                "submitted_by": user_objects[2].id,  # Citizen
            },
            {
                "title": "Rural Drinking Water Quality Issues",
                "description": "Many villages lack access to clean drinking water. Testing and purification systems are expensive and not easily accessible.",
                "category": "Water & Sanitation",
                "location": "Rajasthan",
                "affected_population": "Rural communities",
                "number_affected": 50000,
                "urgency": UrgencyLevel.CRITICAL,
                "submitted_by": user_objects[4].id,  # NGO
            },
            {
                "title": "Traffic Congestion Near Schools",
                "description": "Morning and evening school hours cause severe traffic congestion, creating safety hazards for children and increasing pollution.",
                "category": "Transportation",
                "location": "Bangalore",
                "affected_population": "School children, working professionals",
                "number_affected": 10000,
                "urgency": UrgencyLevel.MEDIUM,
                "submitted_by": user_objects[0].id,  # Student
            },
            {
                "title": "Food Wastage in College Canteens",
                "description": "Significant food wastage in college cafeterias contributes to environmental problems and is economically wasteful.",
                "category": "Waste Management",
                "location": "New Delhi",
                "affected_population": "College communities",
                "number_affected": 5000,
                "urgency": UrgencyLevel.MEDIUM,
                "submitted_by": user_objects[0].id,  # Student
            },
            {
                "title": "Wheelchair Accessibility in Public Transport",
                "description": "Public buses and trains lack proper accessibility features for people with disabilities, limiting their mobility.",
                "category": "Accessibility",
                "location": "Mumbai",
                "affected_population": "People with disabilities",
                "number_affected": 2000,
                "urgency": UrgencyLevel.HIGH,
                "submitted_by": user_objects[1].id,  # Researcher
            },
            {
                "title": "Crop Disease Detection and Prevention",
                "description": "Farmers need quick and accurate methods to identify and respond to crop diseases to prevent massive yield losses.",
                "category": "Agriculture",
                "location": "Punjab",
                "affected_population": "Farming communities",
                "number_affected": 100000,
                "urgency": UrgencyLevel.HIGH,
                "submitted_by": user_objects[4].id,  # NGO
            },
            {
                "title": "Women's Safety in Public Spaces",
                "description": "Enhancing safety measures and enabling quick emergency response for women in public spaces.",
                "category": "Women's Safety",
                "location": "Across India",
                "affected_population": "Women and girls",
                "number_affected": 500000,
                "urgency": UrgencyLevel.CRITICAL,
                "submitted_by": user_objects[1].id,  # Researcher
            },
            {
                "title": "Plastic Waste Segregation System",
                "description": "Need for small-scale, affordable plastic segregation and processing systems for local communities.",
                "category": "Environment",
                "location": "Pune",
                "affected_population": "Local communities",
                "number_affected": 8000,
                "urgency": UrgencyLevel.HIGH,
                "submitted_by": user_objects[2].id,  # Citizen
            },
            {
                "title": "Rural Digital Literacy Programs",
                "description": "Rural populations lack digital skills needed for online education, banking, and job opportunities.",
                "category": "Digital Inclusion",
                "location": "Uttar Pradesh",
                "affected_population": "Rural residents",
                "number_affected": 200000,
                "urgency": UrgencyLevel.MEDIUM,
                "submitted_by": user_objects[1].id,  # Researcher
            },
            {
                "title": "Emergency Response Optimization",
                "description": "During natural disasters, emergency services face challenges in coordination and resource allocation.",
                "category": "Disaster Management",
                "location": "Across India",
                "affected_population": "Disaster victims",
                "number_affected": 50000,
                "urgency": UrgencyLevel.CRITICAL,
                "submitted_by": user_objects[4].id,  # NGO
            },
        ]

        problems = []
        for problem_data in problems_data:
            problem = Problem(
                title=problem_data["title"],
                description=problem_data["description"],
                category=problem_data["category"],
                location=problem_data["location"],
                affected_population=problem_data["affected_population"],
                number_affected=problem_data["number_affected"],
                urgency=problem_data["urgency"],
                submitted_by=problem_data["submitted_by"],
                status=ProblemStatus.AI_ANALYZED,
                priority_score=75 + (hash(problem_data["title"]) % 20),
            )
            db.add(problem)
            problems.append(problem)

        db.commit()

        # Create sample analyses for problems
        analyses_data = [
            {
                "ai_category": "Waste Management",
                "ai_summary": "Smart biomedical waste segregation and monitoring system needed",
                "root_causes": json.dumps(
                    [
                        "Lack of awareness",
                        "Inadequate training",
                        "Manual labor challenges",
                    ]
                ),
                "priority_score": 87,
                "urgency_level": "HIGH",
                "required_skills": json.dumps(
                    ["IoT", "Python", "Embedded Systems", "Environmental Science"]
                ),
                "suggested_solutions": json.dumps(
                    [
                        "Smart waste segregation system",
                        "IoT sensors for tracking",
                        "Mobile app for reporting",
                    ]
                ),
                "complexity": "Medium",
                "affected_population_detailed": "Hospital staff and local communities at risk",
                "potential_stakeholders": json.dumps(
                    ["Municipality", "Hospital Authority", "NGOs"]
                ),
                "potential_collaborators": json.dumps(
                    ["IIT researchers", "Tech companies", "Environmental orgs"]
                ),
                "suggested_technologies": json.dumps(
                    ["IoT Sensors", "Mobile App", "Cloud Platform", "AI Analytics"]
                ),
                "expected_social_impact": "Improved safety and environment",
                "risks_challenges": json.dumps(
                    ["Implementation cost", "Stakeholder coordination"]
                ),
                "recommended_next_steps": json.dumps(
                    ["Form team", "Develop prototype", "Secure funding"]
                ),
            },
        ]

        for i, analysis_data in enumerate(analyses_data):
            analysis = ProblemAnalysis(
                problem_id=problems[i].id,
                **analysis_data,
            )
            db.add(analysis)

        db.commit()

        # Create a sample team
        if len(user_objects) > 2 and len(problems) > 0:
            team = Team(
                name="Smart Waste Management Team",
                description="Developing IoT solution for biomedical waste",
                problem_id=problems[0].id,
                created_by=user_objects[0].id,
                required_roles=json.dumps(
                    ["Backend Developer", "IoT Engineer", "Mobile Developer"]
                ),
            )
            db.add(team)
            db.flush()

            # Add team members
            team.members.append(user_objects[0])
            team.members.append(user_objects[3])
            team.members.append(user_objects[5])

            db.commit()

        # Create sample comments
        if len(problems) > 0:
            comment = Comment(
                content="This problem is critical and needs immediate attention. We have expertise in IoT solutions.",
                problem_id=problems[0].id,
                user_id=user_objects[3].id,
            )
            db.add(comment)

            comment2 = Comment(
                content="Can we schedule a meeting to discuss implementation strategy?",
                problem_id=problems[0].id,
                user_id=user_objects[5].id,
            )
            db.add(comment2)

            db.commit()

        # Create sample solutions
        if len(problems) > 0:
            solution = Solution(
                title="IoT-Based Waste Segregation Module",
                description="An automated waste segregation system using AI and IoT sensors",
                problem_id=problems[0].id,
                submitted_by=user_objects[0].id,
                technology="Python, IoT, Machine Learning",
                expected_impact="80% reduction in segregation errors",
                estimated_cost="₹5-10 lakhs",
                implementation_timeline="6 months",
                prototype_link="https://github.com/example/waste-system",
            )
            db.add(solution)

            db.commit()

        print("✅ Demo data created successfully!")
        print("\nDemo Accounts:")
        print("=" * 50)
        for user_data in users_data:
            print(
                f"Email: {user_data['email']:<25} Role: {user_data['role']:<15} Password: password123"
            )

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
