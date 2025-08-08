import { Card, CardContent, CardHeader } from '@/components/ui/card.jsx'
import { Skeleton } from '@/components/ui/skeleton.jsx'

export function ActivitySkeleton() {
  return (
    <Card className="overflow-hidden border-2 border-border/50">
      <div className="relative h-56 bg-muted">
        <Skeleton className="w-full h-full" />
        {/* Source badge skeleton */}
        <div className="absolute top-4 right-4">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        {/* Category badge skeleton */}
        <div className="absolute bottom-4 left-4">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
      <CardHeader className="pb-3">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 mb-6">
          {/* Location skeleton */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-3 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Date skeleton */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-3 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          {/* Time skeleton */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-3 rounded-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        {/* Button skeleton */}
        <Skeleton className="w-full h-12 rounded-xl" />
      </CardContent>
    </Card>
  )
}

export function ActivitySkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ActivitySkeleton key={index} />
      ))}
    </div>
  )
}