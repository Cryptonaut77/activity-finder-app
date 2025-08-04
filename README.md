# Activity Finder Project

A full-stack web application for discovering events and activities near you. Built with React (frontend) and Flask (backend).

## Features

- Search for activities by type and location
- Real-time search with loading states
- Responsive design for mobile and desktop
- Error handling and fallback UI
- Mock data for demonstration purposes

## Project Structure

```
activity-finder-project/
├── activity-finder/          # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.jsx          # Main application
├── activity-finder-backend/  # Flask backend
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   └── main.py          # Flask application
│   └── requirements.txt     # Python dependencies
└── README.md
```

## Recent Fixes Applied

The following errors have been fixed in this codebase:

### Frontend (React)
1. ✅ **Fixed deprecated `onKeyPress` event handler** - Changed to `onKeyDown`
2. ✅ **Fixed missing CSS animation class** - Replaced `animate-fade-in` with `animate-pulse`
3. ✅ **Fixed missing line-clamp classes** - Replaced with standard CSS classes
4. ✅ **Added input validation** - Minimum 2 characters for search and location
5. ✅ **Added Error Boundary** - Catches React errors and shows fallback UI
6. ✅ **Fixed potential memory leak** - Improved event listener cleanup in `use-mobile` hook
7. ✅ **Added loading state** - Initial page load spinner

### Backend (Flask)
8. ✅ **Fixed hardcoded secret key** - Now uses environment variables
9. ✅ **Fixed placeholder API keys** - Now uses environment variables
10. ✅ **Added python-dotenv** - For environment variable support

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd activity-finder
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

The frontend will run on `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd activity-finder-backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your values
   SECRET_KEY=your-secret-key-here
   YELP_API_KEY=your-yelp-api-key-here  # Optional
   MEETUP_API_KEY=your-meetup-api-key-here  # Optional
   ```

5. Start the Flask server:
   ```bash
   python src/main.py
   ```

The backend will run on `http://localhost:5000`

## Environment Variables

### Required
- `SECRET_KEY`: Flask secret key for session management

### Optional (for real API integration)
- `YELP_API_KEY`: Yelp API key for event search
- `MEETUP_API_KEY`: Meetup API key for event search

If API keys are not provided, the application will use mock data for demonstration.

## API Endpoints

- `POST /api/activities/search` - Search for activities
  - Body: `{"query": "search term", "location": "location"}`
  - Returns: List of activities with details

## Development Notes

- The frontend uses Vite for fast development
- The backend uses Flask with CORS enabled
- All UI components are built with Radix UI primitives
- Styling is done with Tailwind CSS
- Error boundaries catch React errors gracefully
- Input validation prevents invalid API requests

## Security Improvements

- Secret keys are now loaded from environment variables
- API keys are properly configured for production use
- Input validation prevents malicious requests
- Error boundaries prevent app crashes from being exposed

## Performance Improvements

- Fixed memory leaks in event listeners
- Added proper loading states
- Optimized component re-renders
- Improved error handling and recovery 