import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ThemeToggle } from '@/components/ui/theme-toggle.jsx'
import { ActivitySkeleton, ActivitySkeletonGrid } from '@/components/ActivitySkeleton.jsx'
import { SearchFilters } from '@/components/SearchFilters.jsx'
import { ActivityModal } from '@/components/ActivityModal.jsx'
import { Search, MapPin, Calendar, Clock, ExternalLink, Loader2, Sparkles } from 'lucide-react'
import heroBackground from './assets/hero-background.jpg'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState('')
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [filters, setFilters] = useState({ categories: [], timeFilter: null })
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim() || !location.trim()) return
    
    // Add input validation
    if (searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters for your search')
      return
    }
    
    if (location.trim().length < 2) {
      setError('Please enter at least 2 characters for location')
      return
    }
    
    setIsLoading(true)
    setHasSearched(true)
    setError('')
    
    try {
      const response = await fetch('/api/activities/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery.trim(),
          location: location.trim()
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.activities || [])
      } else {
        throw new Error(data.error || 'Failed to fetch activities')
      }
      
    } catch (error) {
      console.error('Error fetching activities:', error)
      setError('Failed to fetch activities. Please try again.')
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }



  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    try {
      // If it's already in HH:MM format, return as is
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString
      }
      // Otherwise try to parse and format
      const time = new Date(`2000-01-01T${timeString}`)
      if (isNaN(time.getTime())) return timeString
      return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    } catch {
      return timeString
    }
  }

  // Set page as loaded when component mounts
  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  const handleQuickSearch = (query, loc) => {
    setSearchQuery(query)
    setLocation(loc)
    // Automatically trigger search
    setTimeout(() => {
      handleSearchWithFilters(query, loc, filters)
    }, 100)
  }

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const handleSearchWithFilters = async (query = searchQuery, loc = location, currentFilters = filters) => {
    if (!query.trim() || !loc.trim()) return
    
    // Add input validation
    if (query.trim().length < 2) {
      setError('Please enter at least 2 characters for your search')
      return
    }
    
    if (loc.trim().length < 2) {
      setError('Please enter at least 2 characters for location')
      return
    }
    
    setIsLoading(true)
    setHasSearched(true)
    setError('')
    
    try {
      const searchBody = {
        query: query.trim(),
        location: loc.trim(),
        filters: currentFilters
      }

      const response = await fetch('/api/activities/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.activities || [])
      } else {
        throw new Error(data.error || 'Failed to fetch activities')
      }
      
    } catch (error) {
      console.error('Error fetching activities:', error)
      setError('Failed to fetch activities. Please try again.')
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading screen until page is loaded
  if (!isPageLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Activity Finder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">ActivityFinder</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16">
        <div 
          className="relative h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70"></div>
          <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
            <div className="float-animation mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Discover Amazing
                <span className="eventbrite-hero-gradient bg-clip-text text-transparent"> Activities</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
                From concerts and workshops to festivals and meetups - find your next great experience
              </p>
            </div>
            
            {/* Enhanced Search Form */}
            <div className="bg-card/95 backdrop-blur-lg rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-2xl border border-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="What interests you? (music, food, tech...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchWithFilters()}
                    className="pl-12 h-14 text-base bg-background border-2 border-border focus:border-primary rounded-xl"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Where? (New York, San Francisco...)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchWithFilters()}
                    className="pl-12 h-14 text-base bg-background border-2 border-border focus:border-primary rounded-xl"
                  />
                </div>
              </div>
              <Button 
                onClick={() => handleSearchWithFilters()}
                disabled={isLoading || !searchQuery.trim() || !location.trim()}
                className="w-full h-14 text-lg font-semibold eventbrite-hero-gradient hover:opacity-90 transition-all duration-300 rounded-xl shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Searching for perfect events...
                  </>
                ) : (
                  <>
                    <Search className="mr-3 h-6 w-6" />
                    Find My Next Adventure
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {isLoading ? 'Discovering perfect events for you...' : 
                 error ? 'Oops! Something went wrong' :
                 `${activities.length} Amazing ${activities.length === 1 ? 'Event' : 'Events'} Found`}
              </h2>
              {!isLoading && !error && activities.length > 0 && (
                <p className="text-muted-foreground text-lg">
                  Ready to create unforgettable memories? Choose your adventure below
                </p>
              )}
            </div>

            {/* Search Filters */}
            {!error && (
              <div className="mb-8">
                <SearchFilters 
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    setFilters(newFilters)
                    if (hasSearched && !isLoading) {
                      handleSearchWithFilters(searchQuery, location, newFilters)
                    }
                  }}
                  onQuickSearch={handleQuickSearch}
                />
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">😔</div>
                  <div className="text-destructive text-lg mb-6 font-medium">{error}</div>
                  <Button onClick={handleSearch} variant="outline" size="lg" className="rounded-xl">
                    <Search className="mr-2 h-5 w-5" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <ActivitySkeletonGrid count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {activities.map((activity) => (
                  <Card 
                    key={activity.id} 
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 eventbrite-card-gradient border-2 border-border/50 hover:border-primary/50 cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="relative h-56 bg-muted overflow-hidden">
                      <img 
                        src={activity.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop'} 
                        alt={activity.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm">
                        {activity.source}
                      </Badge>
                      <Badge variant="secondary" className="absolute bottom-4 left-4 bg-background/90 text-foreground border-0 backdrop-blur-sm">
                        {activity.category}
                      </Badge>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {activity.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-base leading-relaxed">
                        {activity.description?.replace(/<[^>]*>/g, '') || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-3 text-primary" />
                          <span className="line-clamp-1">{activity.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-3 text-primary" />
                          <span>{formatDate(activity.date)}</span>
                        </div>
                        {activity.time && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-3 text-primary" />
                            <span>{formatTime(activity.time)}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full h-12 rounded-xl font-semibold eventbrite-hero-gradient hover:opacity-90 transition-all duration-300 shadow-lg" 
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(activity.link, '_blank', 'noopener,noreferrer')
                        }}
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Get Tickets
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!isLoading && activities.length === 0 && hasSearched && !error && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">No events found in your area</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                  Don't worry! Try expanding your search or exploring different activities
                </p>
                <Button onClick={handleSearch} variant="outline" size="lg" className="rounded-xl">
                  <Search className="mr-2 h-5 w-5" />
                  Search Again
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">ActivityFinder</span>
            </div>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Your gateway to unforgettable experiences. From intimate gatherings to grand celebrations, 
              we help you discover what matters most.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for event enthusiasts</span>
              <span>•</span>
              <span>Powered by real-time event data</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Activity Modal */}
      <ActivityModal 
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default App

