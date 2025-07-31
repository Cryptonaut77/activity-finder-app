# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack activity finder application with a React frontend and Flask backend:

- **Frontend** (`activity-finder/`): React 19 + Vite + Tailwind CSS + Radix UI components
- **Backend** (`activity-finder-backend/`): Flask + SQLAlchemy + CORS + environment variable configuration

The frontend uses a proxy configuration to route `/api` requests to the Flask backend at `http://localhost:5000`.

## Development Commands

### Frontend (activity-finder/)
```bash
cd activity-finder
pnpm install          # Install dependencies
pnpm dev              # Start development server (http://localhost:5173)
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm preview          # Preview production build
```

### Backend (activity-finder-backend/)
```bash
cd activity-finder-backend
python -m venv venv                    # Create virtual environment
source venv/bin/activate               # Activate (Linux/Mac)
# or venv\Scripts\activate            # Activate (Windows)
pip install -r requirements.txt       # Install dependencies
python src/main.py                     # Start Flask server (http://localhost:5000)
```

## Code Architecture

### Frontend Structure
- **Components**: Uses shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom animations and responsive design
- **State Management**: React hooks (useState, useEffect) for local component state
- **API Communication**: Fetch API with POST requests to `/api/activities/search`
- **Error Handling**: Error boundaries and comprehensive try-catch blocks
- **Path Aliases**: `@/` maps to `./src/` for clean imports

### Backend Structure
- **Route Organization**: Blueprints for modular API endpoints (`/api` for users, `/api/activities` for activities)
- **Database**: SQLite with SQLAlchemy ORM, models in `src/models/`
- **Environment Configuration**: Uses python-dotenv for `.env` file support
- **Security**: Environment-based secret keys, CORS configuration, input validation

### Key Architectural Patterns
- **API Design**: RESTful endpoints with JSON request/response format
- **Error Handling**: Consistent error responses with success/error flags
- **Environment Variables**: All sensitive data (API keys, secrets) externalized
- **Static File Serving**: Flask serves built React app from `static/` folder
- **Database Initialization**: Automatic table creation on app startup

## Environment Setup

Backend requires a `.env` file (copy from `env.example`):
- `SECRET_KEY`: Flask session secret (required)
- `YELP_API_KEY`: Optional, falls back to mock data
- `MEETUP_API_KEY`: Optional, falls back to mock data
- `ALLOWED_ORIGINS`: CORS origins (defaults to localhost:5173,3000)

## Testing

No test framework is currently configured. The project uses mock data for API responses when external API keys are not provided.