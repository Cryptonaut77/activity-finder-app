import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Share2, 
  Heart,
  Star,
  Users
} from 'lucide-react'

export function ActivityModal({ activity, isOpen, onClose }) {
  if (!activity) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    try {
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString
      }
      const time = new Date(`2000-01-01T${timeString}`)
      if (isNaN(time.getTime())) return timeString
      return time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    } catch {
      return timeString
    }
  }

  const shareActivity = () => {
    if (navigator.share) {
      navigator.share({
        title: activity.title,
        text: activity.description,
        url: activity.link
      })
    } else {
      navigator.clipboard.writeText(activity.link)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          {/* Image */}
          <div className="relative h-64 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
            <img 
              src={activity.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop'} 
              alt={activity.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm">
                {activity.source}
              </Badge>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Badge variant="secondary" className="bg-background/90 text-foreground border-0 backdrop-blur-sm">
                {activity.category}
              </Badge>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold leading-tight pr-8">
            {activity.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm text-foreground">{activity.location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm text-foreground">{formatDate(activity.date)}</p>
              </div>
            </div>

            {activity.time && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="text-sm text-foreground">{formatTime(activity.time)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organizer</p>
                <p className="text-sm text-foreground">{activity.source}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">About this event</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{activity.description?.replace(/<[^>]*>/g, '') || 'No description available for this event.'}</p>
            </div>
          </div>

          {/* Mock additional details */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-2">Event Highlights</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                Highly Rated
              </Badge>
              <Badge variant="outline">Photography Allowed</Badge>
              <Badge variant="outline">All Ages Welcome</Badge>
              <Badge variant="outline">Food & Drinks Available</Badge>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 h-12 rounded-xl font-semibold eventbrite-hero-gradient hover:opacity-90 transition-all duration-300 shadow-lg" 
              onClick={() => window.open(activity.link, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Get Tickets
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="h-12 w-12 rounded-xl border-2"
                onClick={shareActivity}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="h-12 w-12 rounded-xl border-2"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}