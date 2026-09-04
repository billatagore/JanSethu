# Societal Solutions Hub

**Turning societal challenges into collaborative solutions.**

A comprehensive web platform that crowdsources real-world societal problems and connects them with students, universities, researchers, NGOs, citizens, government organizations, mentors, and industries to develop and implement solutions.

## 🎯 Vision

Societal Solutions Hub is an AI-powered platform designed to bridge the gap between real-world problems and innovative solutions. By leveraging collective intelligence, we connect diverse stakeholders to accelerate problem-solving and social impact.

## ✨ Key Features

### Core Features
- **Problem Submission**: Citizens and organizations can submit real-world challenges
- **AI Problem Analysis**: Intelligent analysis of problems using machine learning with structured output
- **Smart Prioritization**: AI-powered priority scoring based on impact, urgency, and scale
- **SDG Mapping**: Automatic mapping to UN Sustainable Development Goals
- **User Matching**: Connect problems with skilled solvers based on expertise
- **Collaborative Teams**: Form and manage teams around specific challenges
- **Solution Management**: Submit, review, and compare proposed solutions
- **Impact Tracking**: Measure real-world outcomes and social impact
- **Discussion Forums**: Community-driven conversations and idea sharing
- **Notification System**: Real-time updates on problems and opportunities

### Role-Based Access
- **Citizen**: Report problems, follow challenges
- **Student**: Find opportunities to solve problems
- **Researcher/Professor**: Provide expertise and mentorship
- **Industry Partner**: Sponsor solutions and provide resources
- **NGO/Community Organization**: Manage challenges and implementations
- **Mentor**: Guide teams and review solutions
- **Admin**: Manage platform, verify problems, track metrics

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with Vite for fast development
- Tailwind CSS for responsive design
- React Router for navigation
- Lucide React for icons
- Recharts for data visualization
- Axios for API calls

**Backend:**
- FastAPI (Python) for high-performance APIs
- SQLAlchemy ORM for database operations
- SQLite for local development
- Pydantic for data validation
- OpenAI API for intelligent analysis (with fallback)
- JWT for authentication
- Passlib for password hashing

**Database:**
- SQLite (development)
- SQLAlchemy models with proper relationships
- Full-text search capabilities

**AI/ML:**
- OpenAI GPT-3.5-turbo for problem analysis
- Local fallback analyzer for offline functionality
- Structured JSON output for consistency

## 📁 Project Structure

```
SIH/
├── frontend/                    # React Vite application
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API integration
│   │   ├── context/            # Authentication context
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main app with routing
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles with Tailwind
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
│
└── backend/                     # FastAPI application
    ├── app/
    │   ├── models/             # SQLAlchemy models
    │   ├── schemas/            # Pydantic schemas
    │   ├── routes/             # API endpoints
    │   ├── services/           # Business logic & AI service
    │   ├── database.py         # Database configuration
    │   └── __init__.py
    ├── main.py                 # FastAPI app entry point
    ├── seed_demo_data.py       # Demo data seeding script
    ├── requirements.txt        # Python dependencies
    ├── .env.example            # Environment variables template
    └── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+ (for backend)
- Node.js 16+ (for frontend)
- Git
- A terminal/command prompt

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env if needed (API keys, database URL, etc.)
   ```

5. **Run database seed (optional but recommended for demo):**
   ```bash
   python seed_demo_data.py
   ```

6. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **In a new terminal, navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file (if needed):**
   ```bash
   # .env or .env.local
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🔐 Demo Credentials

After seeding the database, use these credentials to explore the platform:

| Email | Password | Role |
|-------|----------|------|
| student@example.com | password123 | Student |
| researcher@example.com | password123 | Researcher |
| citizen@example.com | password123 | Citizen |
| industry@example.com | password123 | Industry |
| ngo@example.com | password123 | NGO |
| mentor@example.com | password123 | Mentor |
| admin@example.com | password123 | Admin |

## 📊 Demo Flow (3-5 minutes)

1. **Login**: Use student@example.com / password123
2. **Dashboard**: View platform statistics
3. **Submit Challenge**: 
   - Click "Submit a Challenge"
   - Title: "Biomedical Waste Management in Hospitals"
   - Description: "Government hospital biomedical waste is not being properly segregated..."
   - Category: Waste Management
   - Click "Submit & Analyze with AI"
4. **AI Analysis**: 
   - View AI-generated analysis including priority score, required skills, and solutions
5. **Create Team**:
   - Return to problem details
   - Click "Create Team"
   - Enter team name
6. **Collaboration**:
   - Access team workspace
   - Create tasks
   - Assign team members
7. **Propose Solution**:
   - Click "Propose Solution"
   - Describe your solution approach
   - Submit
8. **Impact Dashboard**:
   - View platform-wide impact metrics
   - See statistics on problems, teams, and contributors

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Problems
- `GET /api/problems` - List all problems (with filters)
- `POST /api/problems` - Create new problem
- `GET /api/problems/{id}` - Get problem details
- `POST /api/problems/{id}/analyze` - Trigger AI analysis
- `GET /api/problems/{id}/matches` - Get matched solvers

### Solutions
- `POST /api/problems/{id}/solutions` - Submit solution
- `GET /api/problems/{id}/solutions` - List problem solutions

### Teams
- `POST /api/teams` - Create team
- `GET /api/teams/{id}` - Get team details
- `POST /api/teams/{id}/join` - Request to join team
- `GET /api/teams/{id}/tasks` - List team tasks
- `POST /api/teams/{id}/tasks` - Create task

### Comments
- `POST /api/comments/problems/{id}` - Add comment
- `GET /api/comments/problems/{id}` - Get comments

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/impact` - Impact metrics

### Metadata
- `GET /api/categories` - Get problem categories
- `GET /api/sdgs` - Get SDG data

## 🤖 AI Features

### Problem Analysis
The platform uses AI to automatically analyze problems and generate:
- Problem category and summary
- Root causes analysis
- Priority score (0-100) with transparent scoring
- Urgency level (LOW, MEDIUM, HIGH, CRITICAL)
- Required skills and expertise
- Suggested solution approaches
- Relevant SDG mappings
- Potential stakeholders and collaborators
- Expected social impact
- Implementation complexity
- Recommended next steps

### AI Fallback
If OpenAI API is unavailable, the system uses a deterministic local analyzer that:
- Generates realistic, contextual analysis
- Maintains structured JSON output format
- Ensures application remains fully functional
- Uses keyword-based intelligence for impact assessment

### Smart Matching
Connect problems with solvers based on:
- Skill similarity scores
- Domain expertise alignment
- Experience level matching
- Interest in specific problem categories

## 🔍 Database Models

Key models include:
- **User**: Account and profile information
- **Problem**: Submitted challenges and their metadata
- **ProblemAnalysis**: AI-generated insights for problems
- **Solution**: Proposed solutions for problems
- **Team**: Collaborative groups working on problems
- **SDG**: UN Sustainable Development Goals mapping
- **Comment**: Discussion threads
- **Notification**: User notifications
- **Task**: Team task management
- **ImpactMetric**: Outcome tracking

## 🎨 UI/UX Highlights

- **Modern Dashboard**: Clean, professional interface with real-time statistics
- **Responsive Design**: Mobile-optimized across all devices
- **Role-Based Views**: Customized experience for each user type
- **Interactive Charts**: Visualizations using Recharts
- **Card-Based Layout**: Organized information presentation
- **Smooth Animations**: Professional transitions and effects
- **Accessible Design**: WCAG-compliant with proper labels and contrast
- **Error Handling**: User-friendly error messages and recovery

## ⚙️ Configuration

### Environment Variables (Backend)

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./societal_solutions.db

# Authentication
SECRET_KEY=your-secret-key-change-this-in-production

# AI Service
OPENAI_API_KEY=your-openai-key-here  # Optional

# Server
HOST=0.0.0.0
PORT=8000
```

### Frontend Configuration

The frontend proxy is configured in `vite.config.js` to forward API requests to the backend automatically.

## 📈 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Problem submission
- [ ] AI analysis triggers and displays correctly
- [ ] Problem filtering and searching
- [ ] Team creation and member joining
- [ ] Task creation and status updates
- [ ] Solution submission
- [ ] Comments and discussions
- [ ] Dashboard statistics load
- [ ] Responsive design on mobile

### API Testing
Use Swagger UI at `http://localhost:8000/docs` to test all endpoints interactively.

## 🚨 Known Limitations & Future Improvements

### Current Limitations
- Local SQLite database (not production-ready)
- Simple authentication (no OAuth/2FA)
- Mock messaging system
- Limited file upload capabilities
- Single-server deployment only

### Recommended Improvements
- PostgreSQL database for production
- OAuth2 and multi-factor authentication
- Real-time WebSocket messaging
- File storage (S3/cloud storage)
- Email notifications
- Mobile app (React Native)
- Advanced recommendation engine
- Computer vision for image analysis
- Blockchain for solution verification
- Multilingual support (Hindi, Telugu, English)
- Real-time collaboration features
- Advanced geospatial analytics
- Government and university API integrations

## 📝 API Documentation

Full API documentation is available at:
```
http://localhost:8000/docs
```

Interactive Swagger UI with test functionality.

## 🤝 Contributing

The architecture is designed to be easily extensible. To add new features:

1. Create new models in `backend/app/models/__init__.py`
2. Create schemas in `backend/app/schemas/__init__.py`
3. Create routes in `backend/app/routes/[feature].py`
4. Create pages in `frontend/src/pages/[Feature].jsx`
5. Create components in `frontend/src/components/[Component].jsx`

## 📄 License

This project is part of the Smart India Hackathon (SIH) initiative.

## 🎓 Educational Value

This prototype demonstrates:
- Full-stack web development (React + FastAPI)
- AI integration in real-world applications
- Database design and relationships
- RESTful API design
- Authentication and authorization
- Real-time data processing
- Responsive UI development
- Problem-solving through technology

## 🏥 Health Check

**Backend**: `http://localhost:8000/api/health` → `{"status": "ok"}`

**Frontend**: Opens at `http://localhost:5173` without errors

## 🎯 Quick Start Commands

### Terminal 1 (Backend)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python seed_demo_data.py  # Optional
uvicorn main:app --reload
```

### Terminal 2 (Frontend)
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser and login with demo credentials.

## 📱 Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 📞 Support & Feedback

For issues or suggestions, please refer to the documentation or examine the API logs at `http://localhost:8000/docs`.

---

**Built with ❤️ for societal impact** 🌍
