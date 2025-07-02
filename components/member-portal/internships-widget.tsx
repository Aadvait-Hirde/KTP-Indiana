"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, ExternalLink, ArrowRight, MapPin, Calendar, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Internship {
  company: string
  jobTitle: string
  location: string
  workModel: string
  datePosted: string
  applicationLink: string
}

export function InternshipsWidget() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const fetchInternships = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/internships')
      if (response.ok) {
        const data = await response.json()
        // Show only the first 3 internships
        setInternships(data.internships.slice(0, 3))
      } else {
        console.error('Failed to fetch internships')
      }
    } catch (error) {
      console.error('Error fetching internships:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInternships()
  }, [])

  const getWorkModelBadge = (workModel: string) => {
    const variants = {
      'remote': 'bg-green-100 text-green-800',
      'on site': 'bg-blue-100 text-blue-800',
      'hybrid': 'bg-purple-100 text-purple-800'
    }
    return variants[workModel.toLowerCase() as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  const handleViewAll = () => {
    router.push('/member-portal/internships')
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Latest Internships</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInternships}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading internships...</span>
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No internships available</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {internships.map((internship, index) => (
                <Card key={index} className="border-l-4 border-l-primary/50 hover:border-l-primary transition-colors">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm leading-tight truncate">
                            {internship.jobTitle}
                          </h4>
                          <p className="text-sm text-primary font-medium truncate">
                            {internship.company}
                          </p>
                        </div>
                        <Badge className={`text-xs ${getWorkModelBadge(internship.workModel)} flex-shrink-0`}>
                          {internship.workModel}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground gap-3">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{internship.location}</span>
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                          {internship.datePosted}
                        </span>
                      </div>
                      
                      <Button asChild size="sm" className="w-full h-8 text-xs">
                        <a 
                          href={internship.applicationLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          Apply Now
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleViewAll}
              >
                View All Internships
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 