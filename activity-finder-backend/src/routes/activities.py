import os
import requests
import json
import re
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

activities_bp = Blueprint('activities', __name__)

# API keys from environment variables - set these in production
YELP_API_KEY = os.getenv('YELP_API_KEY')
MEETUP_API_KEY = os.getenv('MEETUP_API_KEY')
EVENTBRITE_API_KEY = os.getenv('EVENTBRITE_API_KEY')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

@activities_bp.route('/search', methods=['POST'])
@cross_origin()
def search_activities():
    """
    Search for activities based on query and location
    """
    try:
        data = request.get_json()
        query = data.get('query', '')
        location = data.get('location', '')
        
        if not query or not location:
            return jsonify({'error': 'Query and location are required'}), 400
        
        activities = []
        
        # Try Eventbrite API first (most reliable free tier)
        eventbrite_activities = search_eventbrite_events(query, location)
        if eventbrite_activities:
            activities.extend(eventbrite_activities)
        
        # Try Ticketmaster API for entertainment events
        if len(activities) < 10:
            ticketmaster_activities = search_ticketmaster_events(query, location)
            if ticketmaster_activities:
                activities.extend(ticketmaster_activities)
        
        # Try Yelp API
        if len(activities) < 15:
            yelp_activities = search_yelp_events(query, location)
            if yelp_activities:
                activities.extend(yelp_activities)
        
        # Try Meetup API as fallback
        if len(activities) < 20:
            meetup_activities = search_meetup_events(query, location)
            if meetup_activities:
                activities.extend(meetup_activities)
        
        # If still no results, return enhanced mock data for demonstration
        if not activities:
            activities = get_enhanced_mock_activities(query, location)
        
        # Normalize all activity data for consistent formatting
        activities = normalize_activity_data(activities)
        
        return jsonify({
            'success': True,
            'activities': activities,
            'total': len(activities)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def search_eventbrite_events(query, location):
    """
    Search Eventbrite API for events
    """
    try:
        if not EVENTBRITE_API_KEY:
            return []
            
        headers = {
            'Authorization': f'Bearer {EVENTBRITE_API_KEY}',
        }
        
        params = {
            'q': query,
            'location.address': location,
            'location.within': '25mi',
            'start_date.range_start': '2025-01-01T00:00:00',
            'start_date.range_end': '2025-12-31T23:59:59',
            'sort_by': 'date',
            'expand': 'venue,organizer',
            'page_size': 20
        }
        
        response = requests.get('https://www.eventbriteapi.com/v3/events/search/', 
                              headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return parse_eventbrite_events(data.get('events', []))
        else:
            print(f"Eventbrite API error: {response.status_code}")
            return []
        
    except Exception as e:
        print(f"Eventbrite API error: {e}")
        return []

def search_ticketmaster_events(query, location):
    """
    Search Ticketmaster Discovery API for events
    """
    try:
        if not TICKETMASTER_API_KEY:
            return []
            
        params = {
            'apikey': TICKETMASTER_API_KEY,
            'keyword': query,
            'city': location,
            'radius': '25',
            'unit': 'miles',
            'size': 20,
            'sort': 'date,asc'
        }
        
        response = requests.get('https://app.ticketmaster.com/discovery/v2/events.json', 
                              params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            events = data.get('_embedded', {}).get('events', [])
            return parse_ticketmaster_events(events)
        else:
            print(f"Ticketmaster API error: {response.status_code}")
            return []
        
    except Exception as e:
        print(f"Ticketmaster API error: {e}")
        return []

def search_yelp_events(query, location):
    """
    Search Yelp Events API
    """
    try:
        # Note: Yelp Events API requires authentication
        # This is a placeholder implementation
        headers = {
            'Authorization': f'Bearer {YELP_API_KEY}',
        }
        
        params = {
            'location': location,
            'categories': map_query_to_yelp_categories(query),
            'limit': 10
        }
        
        # Uncomment when you have a valid API key
        # response = requests.get('https://api.yelp.com/v3/events', headers=headers, params=params)
        # if response.status_code == 200:
        #     data = response.json()
        #     return parse_yelp_events(data.get('events', []))
        
        return []
        
    except Exception as e:
        print(f"Yelp API error: {e}")
        return []

def search_meetup_events(query, location):
    """
    Search Meetup API using GraphQL
    """
    try:
        # Note: Meetup API requires OAuth authentication
        # This is a placeholder implementation
        
        # Uncomment when you have valid authentication
        # graphql_query = """
        # query {
        #   keywordSearch(filter: {
        #     query: "%s",
        #     location: "%s"
        #   }) {
        #     edges {
        #       node {
        #         ... on Event {
        #           title
        #           description
        #           dateTime
        #           venue {
        #             name
        #             address
        #           }
        #           eventUrl
        #         }
        #       }
        #     }
        #   }
        # }
        # """ % (query, location)
        
        # headers = {
        #     'Authorization': f'Bearer {MEETUP_API_KEY}',
        #     'Content-Type': 'application/json'
        # }
        
        # response = requests.post('https://api.meetup.com/gql', 
        #                         headers=headers, 
        #                         json={'query': graphql_query})
        
        # if response.status_code == 200:
        #     data = response.json()
        #     return parse_meetup_events(data)
        
        return []
        
    except Exception as e:
        print(f"Meetup API error: {e}")
        return []

def map_query_to_yelp_categories(query):
    """
    Map search query to Yelp event categories
    """
    query_lower = query.lower()
    
    if any(word in query_lower for word in ['music', 'concert', 'festival', 'band']):
        return 'music'
    elif any(word in query_lower for word in ['food', 'restaurant', 'dining', 'wine', 'beer']):
        return 'food-and-drink'
    elif any(word in query_lower for word in ['tech', 'technology', 'programming', 'coding']):
        return 'business'
    elif any(word in query_lower for word in ['art', 'gallery', 'exhibition']):
        return 'visual-arts'
    elif any(word in query_lower for word in ['sport', 'fitness', 'running', 'yoga']):
        return 'sports-and-fitness'
    else:
        return 'other'

def parse_yelp_events(events):
    """
    Parse Yelp events into our standard format
    """
    activities = []
    for event in events:
        activity = {
            'id': event.get('id'),
            'title': event.get('name', ''),
            'description': event.get('description', ''),
            'location': event.get('location', {}).get('display_address', [''])[0] if event.get('location') else '',
            'date': event.get('time_start', ''),
            'time': '',  # Extract time from datetime if needed
            'category': event.get('category', ''),
            'image': event.get('image_url', ''),
            'source': 'Yelp',
            'link': event.get('event_site_url', '')
        }
        activities.append(activity)
    
    return activities

def parse_meetup_events(data):
    """
    Parse Meetup events into our standard format
    """
    activities = []
    edges = data.get('data', {}).get('keywordSearch', {}).get('edges', [])
    
    for edge in edges:
        event = edge.get('node', {})
        venue = event.get('venue', {})
        
        activity = {
            'id': event.get('id'),
            'title': event.get('title', ''),
            'description': event.get('description', ''),
            'location': f"{venue.get('name', '')}, {venue.get('address', '')}" if venue else '',
            'date': event.get('dateTime', ''),
            'time': '',  # Extract time from datetime if needed
            'category': 'Meetup',
            'image': '',  # Meetup might not always have images
            'source': 'Meetup',
            'link': event.get('eventUrl', '')
        }
        activities.append(activity)
    
    return activities

def parse_eventbrite_events(events):
    """
    Parse Eventbrite events into our standard format
    """
    activities = []
    for event in events:
        venue = event.get('venue', {}) or {}
        start = event.get('start', {}) or {}
        
        activity = {
            'id': event.get('id'),
            'title': event.get('name', {}).get('text', '') if event.get('name') else '',
            'description': event.get('description', {}).get('text', '') if event.get('description') else '',
            'location': f"{venue.get('name', '')}, {venue.get('address', {}).get('localized_area_display', '')}" if venue else '',
            'date': start.get('local', '').split('T')[0] if start.get('local') else '',
            'time': start.get('local', '').split('T')[1][:5] if start.get('local') and 'T' in start.get('local', '') else '',
            'category': event.get('category', {}).get('name', '') if event.get('category') else 'Event',
            'image': event.get('logo', {}).get('url', '') if event.get('logo') else '',
            'source': 'Eventbrite',
            'link': event.get('url', '')
        }
        activities.append(activity)
    
    return activities

def parse_ticketmaster_events(events):
    """
    Parse Ticketmaster events into our standard format
    """
    activities = []
    for event in events:
        venues = event.get('_embedded', {}).get('venues', []) if event.get('_embedded') else []
        venue = venues[0] if venues else {}
        dates = event.get('dates', {}) or {}
        start = dates.get('start', {}) or {}
        
        activity = {
            'id': event.get('id'),
            'title': event.get('name', ''),
            'description': event.get('info', '') or event.get('pleaseNote', '') or '',
            'location': f"{venue.get('name', '')}, {venue.get('city', {}).get('name', '')}" if venue else '',
            'date': start.get('localDate', ''),
            'time': start.get('localTime', ''),
            'category': event.get('classifications', [{}])[0].get('segment', {}).get('name', '') if event.get('classifications') else 'Entertainment',
            'image': event.get('images', [{}])[0].get('url', '') if event.get('images') else '',
            'source': 'Ticketmaster',
            'link': event.get('url', '')
        }
        activities.append(activity)
    
    return activities

def get_enhanced_mock_activities(query, location):
    """
    Return enhanced mock activities with category-specific templates and realistic venues
    """
    
    query_lower = query.lower()
    
    # Category-specific mock data templates
    if any(word in query_lower for word in ['music', 'concert', 'festival', 'band', 'jazz', 'rock']):
        return get_music_mock_activities(query, location)
    elif any(word in query_lower for word in ['food', 'restaurant', 'dining', 'wine', 'beer', 'cooking']):
        return get_food_mock_activities(query, location)
    elif any(word in query_lower for word in ['tech', 'technology', 'programming', 'coding', 'startup']):
        return get_tech_mock_activities(query, location)
    elif any(word in query_lower for word in ['art', 'gallery', 'exhibition', 'painting', 'sculpture']):
        return get_art_mock_activities(query, location)
    elif any(word in query_lower for word in ['sport', 'fitness', 'running', 'yoga', 'gym']):
        return get_fitness_mock_activities(query, location)
    else:
        return get_general_mock_activities(query, location)

def get_music_mock_activities(query, location):
    """Music-specific mock activities"""
    base_date = datetime.now() + timedelta(days=7)
    return [
        {
            'id': 'music_1',
            'title': f"Live {query.title()} Night at The Blue Room",
            'description': f"Experience the best {query} artists in an intimate venue. Features local and touring musicians with amazing acoustics.",
            'location': f"The Blue Room Music Hall, {location}",
            'date': (base_date + timedelta(days=3)).strftime('%Y-%m-%d'),
            'time': "20:00",
            'category': "Music",
            'image': "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        },
        {
            'id': 'music_2',
            'title': f"{location} {query.title()} Festival",
            'description': f"Three-day outdoor festival celebrating {query} with food trucks, craft vendors, and multiple stages.",
            'location': f"Riverside Park, {location}",
            'date': (base_date + timedelta(days=10)).strftime('%Y-%m-%d'),
            'time': "14:00",
            'category': "Festival",
            'image': "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        }
    ]

def get_food_mock_activities(query, location):
    """Food-specific mock activities"""
    base_date = datetime.now() + timedelta(days=5)
    return [
        {
            'id': 'food_1',
            'title': f"{query.title()} Tasting Experience",
            'description': f"Join Chef Maria for an exclusive {query} tasting featuring locally sourced ingredients and wine pairings.",
            'location': f"Culinary Institute of {location}",
            'date': (base_date + timedelta(days=2)).strftime('%Y-%m-%d'),
            'time': "18:30",
            'category': "Culinary",
            'image': "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        },
        {
            'id': 'food_2',
            'title': f"{location} Food Truck Festival",
            'description': f"Sample diverse cuisines from 20+ local food trucks featuring {query} and more. Live music and family activities.",
            'location': f"Central Square, {location}",
            'date': (base_date + timedelta(days=8)).strftime('%Y-%m-%d'),
            'time': "11:00",
            'category': "Food Festival",
            'image': "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        }
    ]

def get_tech_mock_activities(query, location):
    """Tech-specific mock activities"""
    base_date = datetime.now() + timedelta(days=4)
    return [
        {
            'id': 'tech_1',
            'title': f"{query.title()} Meetup & Networking",
            'description': f"Connect with {query} professionals, share knowledge, and explore the latest trends. Refreshments provided.",
            'location': f"Tech Hub {location}",
            'date': (base_date + timedelta(days=6)).strftime('%Y-%m-%d'),
            'time': "18:00",
            'category': "Technology",
            'image': "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        },
        {
            'id': 'tech_2',
            'title': f"Hands-on {query.title()} Workshop",
            'description': f"Learn practical {query} skills in this interactive workshop. Bring your laptop and get ready to code!",
            'location': f"Innovation Center, {location}",
            'date': (base_date + timedelta(days=12)).strftime('%Y-%m-%d'),
            'time': "10:00",
            'category': "Workshop",
            'image': "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        }
    ]

def get_art_mock_activities(query, location):
    """Art-specific mock activities"""
    base_date = datetime.now() + timedelta(days=6)
    return [
        {
            'id': 'art_1',
            'title': f"Contemporary {query.title()} Exhibition",
            'description': f"Explore cutting-edge {query} works by local and international artists in this curated exhibition.",
            'location': f"Modern Art Gallery, {location}",
            'date': (base_date + timedelta(days=1)).strftime('%Y-%m-%d'),
            'time': "10:00",
            'category': "Art Exhibition",
            'image': "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        },
        {
            'id': 'art_2',
            'title': f"{query.title()} Workshop for Beginners",
            'description': f"Learn the fundamentals of {query} in this beginner-friendly workshop. All materials provided.",
            'location': f"Community Arts Center, {location}",
            'date': (base_date + timedelta(days=9)).strftime('%Y-%m-%d'),
            'time': "14:00",
            'category': "Art Workshop",
            'image': "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        }
    ]

def get_fitness_mock_activities(query, location):
    """Fitness-specific mock activities"""
    base_date = datetime.now() + timedelta(days=2)
    return [
        {
            'id': 'fitness_1',
            'title': f"Outdoor {query.title()} Class",
            'description': f"Join our certified instructor for a refreshing {query} session in the great outdoors. All levels welcome.",
            'location': f"Lakeside Park, {location}",
            'date': (base_date + timedelta(days=3)).strftime('%Y-%m-%d'),
            'time': "07:00",
            'category': "Fitness",
            'image': "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        },
        {
            'id': 'fitness_2',
            'title': f"{location} {query.title()} Challenge",
            'description': f"Test your limits in this friendly {query} competition. Prizes for all participants and healthy snacks included.",
            'location': f"Recreation Center, {location}",
            'date': (base_date + timedelta(days=11)).strftime('%Y-%m-%d'),
            'time': "09:00",
            'category': "Sports",
            'image': "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        }
    ]

def get_general_mock_activities(query, location):
    """General mock activities for unspecified queries"""
    base_date = datetime.now() + timedelta(days=5)
    return [
        {
            'id': 'general_1',
            'title': f"{query.title()} Community Event",
            'description': f"Join your neighbors for a fun {query} activity. Meet new people and enjoy refreshments.",
            'location': f"Community Center, {location}",
            'date': (base_date + timedelta(days=4)).strftime('%Y-%m-%d'),
            'time': "18:00",
            'category': query.title(),
            'image': "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        },
        {
            'id': 'general_2',
            'title': f"Weekend {query.title()} Workshop",
            'description': f"Learn something new in this hands-on {query} workshop. Perfect for beginners and enthusiasts alike.",
            'location': f"Learning Center, {location}",
            'date': (base_date + timedelta(days=7)).strftime('%Y-%m-%d'),
            'time': "10:00",
            'category': query.title(),
            'image': "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
            'source': "Mock Data",
            'link': "#"
        }
    ]

def normalize_activity_data(activities):
    """
    Normalize activity data to ensure consistent format across all sources
    """
    normalized = []
    
    for activity in activities:
        normalized_activity = {
            'id': str(activity.get('id', '')),
            'title': clean_text(activity.get('title', '')),
            'description': clean_text(activity.get('description', '')),
            'location': clean_text(activity.get('location', '')),
            'date': normalize_date(activity.get('date', '')),
            'time': normalize_time(activity.get('time', '')),
            'category': clean_text(activity.get('category', 'Event')),
            'image': activity.get('image', ''),
            'source': activity.get('source', 'Unknown'),
            'link': activity.get('link', '#')
        }
        
        # Only add activities with required fields
        if normalized_activity['title'] and normalized_activity['location']:
            normalized.append(normalized_activity)
    
    return normalized

def clean_text(text):
    """Clean and standardize text fields"""
    if not text:
        return ''
    
    # Remove HTML tags if present
    text = re.sub(r'<[^>]+>', '', str(text))
    
    # Normalize whitespace
    text = ' '.join(text.split())
    
    # Truncate if too long
    if len(text) > 500:
        text = text[:497] + '...'
    
    return text.strip()

def normalize_date(date_str):
    """Normalize date to YYYY-MM-DD format"""
    if not date_str:
        return ''
    
    try:
        
        # Try common date formats
        formats = [
            '%Y-%m-%d',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%SZ',
            '%m/%d/%Y',
            '%d/%m/%Y'
        ]
        
        for fmt in formats:
            try:
                parsed_date = datetime.strptime(date_str[:len(fmt)], fmt)
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        # If no format matches, return original
        return str(date_str)
        
    except Exception:
        return str(date_str)

def normalize_time(time_str):
    """Normalize time to HH:MM format"""
    if not time_str:
        return ''
    
    try:
        
        # Try common time formats
        formats = [
            '%H:%M',
            '%H:%M:%S',
            '%I:%M %p',
            '%I:%M:%S %p'
        ]
        
        for fmt in formats:
            try:
                parsed_time = datetime.strptime(time_str, fmt)
                return parsed_time.strftime('%H:%M')
            except ValueError:
                continue
        
        # If no format matches, return original
        return str(time_str)
        
    except Exception:
        return str(time_str)

