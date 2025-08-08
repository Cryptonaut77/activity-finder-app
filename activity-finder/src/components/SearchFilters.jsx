import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select.jsx'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover.jsx'
import { 
  Filter, 
  Music, 
  Utensils, 
  Code, 
  Palette, 
  Dumbbell, 
  Calendar, 
  Users,
  X
} from 'lucide-react'

const categories = [
  { id: 'music', label: 'Music & Concerts', icon: Music, color: 'bg-purple-500' },
  { id: 'food', label: 'Food & Drink', icon: Utensils, color: 'bg-orange-500' },
  { id: 'tech', label: 'Tech & Business', icon: Code, color: 'bg-blue-500' },
  { id: 'art', label: 'Arts & Culture', icon: Palette, color: 'bg-pink-500' },
  { id: 'fitness', label: 'Health & Fitness', icon: Dumbbell, color: 'bg-green-500' },
  { id: 'social', label: 'Social & Networking', icon: Users, color: 'bg-indigo-500' }
]

const timeFilters = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'this-week', label: 'This Week' },
  { id: 'this-weekend', label: 'This Weekend' },
  { id: 'next-week', label: 'Next Week' },
  { id: 'this-month', label: 'This Month' }
]

export function SearchFilters({ filters, onFiltersChange, onQuickSearch }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleCategoryToggle = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const handleTimeFilterChange = (timeFilter) => {
    onFiltersChange({ ...filters, timeFilter })
  }

  const clearFilters = () => {
    onFiltersChange({ categories: [], timeFilter: null })
  }

  const activeFiltersCount = filters.categories.length + (filters.timeFilter ? 1 : 0)

  // Quick search suggestions
  const quickSearches = [
    { query: 'live music', location: 'New York', icon: Music },
    { query: 'food festival', location: 'San Francisco', icon: Utensils },
    { query: 'tech meetup', location: 'Seattle', icon: Code },
    { query: 'art gallery', location: 'Los Angeles', icon: Palette }
  ]

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="relative h-11 rounded-xl border-2 hover:border-primary/50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-6" align="start">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter Events</h3>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              
              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    const isSelected = filters.categories.includes(category.id)
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`flex items-center p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border hover:border-primary/30 hover:bg-muted/50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md mr-3 ${category.color} text-white`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium">{category.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Filter */}
              <div>
                <h4 className="font-medium mb-3">When</h4>
                <Select value={filters.timeFilter || ''} onValueChange={handleTimeFilterChange}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any time</SelectItem>
                    {timeFilters.map((filter) => (
                      <SelectItem key={filter.id} value={filter.id}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {filters.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.categories.map((categoryId) => {
              const category = categories.find(c => c.id === categoryId)
              if (!category) return null
              const Icon = category.icon
              return (
                <Badge 
                  key={categoryId} 
                  variant="secondary" 
                  className="h-8 pl-2 pr-1 rounded-full bg-primary/10 text-primary border-primary/20"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {category.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    onClick={() => handleCategoryToggle(categoryId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}
          </div>
        )}

        {filters.timeFilter && (
          <Badge 
            variant="secondary" 
            className="h-8 pl-2 pr-1 rounded-full bg-primary/10 text-primary border-primary/20"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {timeFilters.find(f => f.id === filters.timeFilter)?.label}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={() => handleTimeFilterChange(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Quick Search Suggestions */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((search, index) => {
            const Icon = search.icon
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 rounded-full border-border hover:border-primary/50 hover:bg-primary/5"
                onClick={() => onQuickSearch(search.query, search.location)}
              >
                <Icon className="h-3 w-3 mr-1.5" />
                {search.query} in {search.location}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}