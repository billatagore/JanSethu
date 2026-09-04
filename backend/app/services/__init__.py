import json
import os
from typing import Dict, List, Any
import random

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def parse_ai_response(response_text: str) -> Dict[str, Any]:
    """Parse AI response and extract structured data."""
    try:
        # Try to extract JSON from response
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0]
        elif "{" in response_text:
            json_str = response_text[response_text.find("{") : response_text.rfind("}") + 1]
        else:
            return None

        return json.loads(json_str)
    except:
        return None


async def analyze_problem_with_openai(problem_data: Dict[str, Any]) -> Dict[str, Any]:
    """Use OpenAI API to analyze a problem."""
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""Analyze this societal problem and provide structured insights:

Title: {problem_data.get('title')}
Description: {problem_data.get('description')}
Category: {problem_data.get('category')}
Location: {problem_data.get('location')}
Affected Population: {problem_data.get('affected_population')}
Number Affected: {problem_data.get('number_affected')}
Current Situation: {problem_data.get('current_situation')}
Existing Solutions: {problem_data.get('existing_solutions')}

Please provide a detailed analysis in JSON format with these fields:
{{
    "category": "...",
    "summary": "...",
    "root_causes": ["..."],
    "affected_population_detailed": "...",
    "priority_score": 0-100,
    "urgency_level": "LOW|MEDIUM|HIGH|CRITICAL",
    "required_skills": ["..."],
    "required_expertise": ["..."],
    "suggested_solutions": ["..."],
    "complexity": "Low|Medium|High",
    "potential_stakeholders": ["..."],
    "potential_collaborators": ["..."],
    "suggested_technologies": ["..."],
    "expected_social_impact": "...",
    "risks_challenges": ["..."],
    "recommended_next_steps": ["..."],
    "relevant_sdgs": [
        {{"number": 1, "title": "...", "reason": "..."}}
    ]
}}"""

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        return parse_ai_response(response.choices[0].message.content)

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


def analyze_problem_with_fallback(problem_data: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback local AI analysis when OpenAI is unavailable."""

    categories = {
        "Healthcare": "SDG 3 - Good Health and Well-being",
        "Education": "SDG 4 - Quality Education",
        "Environment": "SDG 13 - Climate Action",
        "Waste Management": "SDG 12 - Responsible Consumption",
        "Agriculture": "SDG 2 - Zero Hunger",
        "Water & Sanitation": "SDG 6 - Clean Water",
        "Transportation": "SDG 11 - Sustainable Cities",
        "Public Safety": "SDG 16 - Peace and Justice",
        "Women's Safety": "SDG 5 - Gender Equality",
        "Energy": "SDG 7 - Affordable Energy",
        "Employment": "SDG 8 - Decent Work",
        "Digital Inclusion": "SDG 9 - Industry Innovation",
        "Accessibility": "SDG 10 - Reduced Inequalities",
        "Rural Development": "SDG 1 - No Poverty",
        "Disaster Management": "SDG 13 - Climate Action",
    }

    category = problem_data.get("category", "Other")
    description = problem_data.get("description", "").lower()
    title = problem_data.get("title", "").lower()
    number_affected = problem_data.get("number_affected", 100)

    # Intelligently estimate priority score
    base_score = random.randint(55, 75)

    # Boost if keywords indicate urgency
    urgency_keywords = [
        "urgent",
        "immediate",
        "critical",
        "emergency",
        "dangerous",
        "risk",
        "health",
        "safety",
    ]
    if any(kw in description or kw in title for kw in urgency_keywords):
        base_score += random.randint(10, 20)

    # Adjust based on number affected
    if number_affected and number_affected > 1000:
        base_score += random.randint(5, 15)

    priority_score = min(100, base_score)

    # Determine urgency level
    if priority_score >= 80:
        urgency = "CRITICAL"
    elif priority_score >= 65:
        urgency = "HIGH"
    elif priority_score >= 40:
        urgency = "MEDIUM"
    else:
        urgency = "LOW"

    # Skill suggestions based on category
    skill_map = {
        "Healthcare": ["Healthcare", "Data Analytics", "Python", "IoT"],
        "Education": ["Education Technology", "Web Development", "React", "Python"],
        "Environment": ["Environmental Science", "IoT", "Data Analytics", "GIS"],
        "Waste Management": ["IoT", "Python", "Embedded Systems", "Environmental Science"],
        "Agriculture": ["Agricultural Science", "IoT", "Machine Learning", "Python"],
        "Water & Sanitation": ["Civil Engineering", "IoT", "GIS", "Environmental Science"],
        "Transportation": ["Traffic Engineering", "IoT", "Data Analytics", "Mobile Dev"],
        "Public Safety": ["Data Analytics", "IoT", "Video Analytics", "Python"],
        "Women's Safety": ["Mobile Development", "IoT", "Safety Engineering", "Community Building"],
        "Energy": ["Electrical Engineering", "IoT", "Data Analytics", "Python"],
        "Employment": ["Data Analytics", "Web Development", "Mobile Dev", "Matching Algorithms"],
        "Digital Inclusion": ["Web Development", "Mobile Development", "Accessibility", "Python"],
        "Accessibility": ["UX/UI Design", "Web Development", "Assistive Technology", "Testing"],
        "Rural Development": ["Community Building", "IoT", "Agriculture", "Education"],
        "Disaster Management": ["GIS", "Data Analytics", "Early Warning Systems", "IoT"],
    }

    required_skills = skill_map.get(category, ["Python", "Data Analytics", "Web Development"])

    # Generate structured analysis
    analysis = {
        "category": category,
        "summary": f"This {category.lower()} challenge requires immediate attention and collaborative problem-solving.",
        "root_causes": [
            "Lack of awareness",
            "Resource constraints",
            "Inadequate infrastructure",
            "Coordination challenges",
        ],
        "affected_population_detailed": f"Approximately {number_affected} people are directly affected by this challenge, with potential indirect impacts on surrounding communities.",
        "priority_score": priority_score,
        "urgency_level": urgency,
        "required_skills": required_skills,
        "required_expertise": [
            "Subject Matter Expert",
            "Project Management",
            "Solution Architecture",
        ],
        "suggested_solutions": [
            "Develop a technology-based solution",
            "Create awareness campaign",
            "Build community partnerships",
            "Implement pilot project",
        ],
        "complexity": "Medium" if priority_score < 70 else "High",
        "potential_stakeholders": [
            "Local Government",
            "Community Organizations",
            "Industry Partners",
            "Research Institutions",
        ],
        "potential_collaborators": [
            "University Research Labs",
            "Tech Companies",
            "NGOs",
            "Social Enterprises",
        ],
        "suggested_technologies": [
            "IoT Sensors",
            "Mobile Application",
            "Data Analytics Platform",
            "Web Portal",
        ],
        "expected_social_impact": "Significant improvement in community welfare, improved access to services, and enhanced quality of life.",
        "risks_challenges": [
            "Implementation challenges",
            "Funding constraints",
            "Stakeholder coordination",
            "Scalability concerns",
        ],
        "recommended_next_steps": [
            "Form collaborative team",
            "Develop detailed project proposal",
            "Secure funding/resources",
            "Create implementation roadmap",
        ],
        "relevant_sdgs": [
            {
                "number": 17,
                "title": "Partnerships for the Goals",
                "reason": "This challenge requires multi-stakeholder collaboration",
            }
        ],
    }

    # Map to relevant SDGs
    sdg_mapping = {
        3: ("Good Health and Well-being", "Health-related challenges"),
        4: ("Quality Education", "Education and learning challenges"),
        5: ("Gender Equality", "Gender-related challenges"),
        6: ("Clean Water and Sanitation", "Water and sanitation challenges"),
        7: ("Affordable and Clean Energy", "Energy challenges"),
        8: ("Decent Work and Economic Growth", "Employment challenges"),
        9: ("Industry, Innovation and Infrastructure", "Technology and infrastructure"),
        10: ("Reduced Inequalities", "Equity and accessibility"),
        11: ("Sustainable Cities and Communities", "Urban and community challenges"),
        12: ("Responsible Consumption and Production", "Resource and waste management"),
        13: ("Climate Action", "Environmental and climate challenges"),
        14: ("Life Below Water", "Marine and water ecosystem challenges"),
        15: ("Life on Land", "Land and wildlife challenges"),
        16: ("Peace, Justice and Strong Institutions", "Safety and governance"),
    }

    primary_sdg = None
    if category == "Healthcare":
        primary_sdg = 3
    elif category == "Education":
        primary_sdg = 4
    elif category == "Women's Safety":
        primary_sdg = 5
    elif category == "Water & Sanitation":
        primary_sdg = 6
    elif category == "Energy":
        primary_sdg = 7
    elif category == "Employment":
        primary_sdg = 8
    elif category in ["Transportation", "Public Safety"]:
        primary_sdg = 11
    elif category == "Waste Management":
        primary_sdg = 12
    elif category == "Environment":
        primary_sdg = 13
    else:
        primary_sdg = 9

    if primary_sdg and primary_sdg in sdg_mapping:
        title, reason = sdg_mapping[primary_sdg]
        analysis["relevant_sdgs"] = [
            {"number": primary_sdg, "title": title, "reason": reason}
        ]

        # Add secondary SDGs
        secondary_sdgs = [17]  # Always include partnerships
        if primary_sdg != 17:
            for sdg_num in [1, 10, 11]:
                if sdg_num != primary_sdg:
                    secondary_sdgs.append(sdg_num)

    return analysis


async def analyze_problem(problem_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze a problem using AI (OpenAI or fallback)."""

    if OPENAI_API_KEY:
        print("Using OpenAI API for analysis...")
        result = await analyze_problem_with_openai(problem_data)
        if result:
            return result

    print("Using fallback AI analysis...")
    return analyze_problem_with_fallback(problem_data)


def match_users_to_problem(problem_skills: List[str], available_users: List[Dict]) -> List[Dict]:
    """Match users to problems based on skills."""
    matches = []

    for user in available_users:
        user_skills = user.get("skills", [])
        matching_skills = [s for s in problem_skills if s in user_skills]

        if matching_skills:
            match_percentage = (len(matching_skills) / len(problem_skills)) * 100
            matches.append(
                {
                    "user_id": user["id"],
                    "user_name": user["name"],
                    "match_percentage": round(match_percentage, 1),
                    "matching_skills": matching_skills,
                    "reason": f"{match_percentage:.0f}% match because this user has {', '.join(matching_skills)} skills.",
                }
            )

    # Sort by match percentage
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    return matches[:10]  # Return top 10 matches


def generate_solution_suggestions(
    problem_data: Dict[str, Any], analysis: Dict[str, Any]
) -> List[str]:
    """Generate solution suggestions based on analysis."""
    suggestions = analysis.get("suggested_solutions", [])

    # Enhance with technology suggestions
    tech_suggestions = analysis.get("suggested_technologies", [])
    if tech_suggestions:
        suggestions.append(f"Leverage {', '.join(tech_suggestions[:2])} technologies")

    return suggestions[:5]
