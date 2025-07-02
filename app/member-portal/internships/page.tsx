"use client"

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Search, ExternalLink, RefreshCw, Calendar, MapPin, Building2 } from 'lucide-react'
import { format } from 'date-fns'

interface Internship {
  company: string
  jobTitle: string
  location: string
  workModel: string
  datePosted: string
  applicationLink: string
}

function InternshipsPageContent() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [filteredInternships, setFilteredInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [workModelFilter, setWorkModelFilter] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchInternships = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/internships')
      if (response.ok) {
        const data = await response.json()
        setInternships(data.internships)
        setFilteredInternships(data.internships)
        setLastUpdated(new Date(data.lastUpdated))
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

  useEffect(() => {
    let filtered = internships

    if (searchTerm) {
      filtered = filtered.filter(internship => 
        internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (locationFilter) {
      filtered = filtered.filter(internship => 
        internship.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    if (workModelFilter) {
      filtered = filtered.filter(internship => 
        internship.workModel.toLowerCase() === workModelFilter.toLowerCase()
      )
    }

    setFilteredInternships(filtered)
  }, [internships, searchTerm, locationFilter, workModelFilter])

  const getWorkModelBadge = (workModel: string) => {
    const variants = {
      'remote': 'bg-green-100 text-green-800 hover:bg-green-200',
      'on site': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'hybrid': 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    }
    return variants[workModel.toLowerCase() as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Summer 2026 Internships</h1>
            <p className="text-muted-foreground mt-2">
              Latest internship opportunities updated daily from top companies
            </p>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Last updated: {format(lastUpdated, 'MMM d, yyyy • h:mm a')}
              </p>
            )}
          </div>
          <Button 
            onClick={fetchInternships} 
            disabled={isLoading}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search by company or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Work Model</label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={workModelFilter}
                  onChange={(e) => setWorkModelFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Remote">Remote</option>
                  <option value="On Site">On Site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <Briefcase className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Total Internships</h3>
              <p className="text-2xl font-bold text-primary">{filteredInternships.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Companies</h3>
              <p className="text-2xl font-bold text-primary">
                {new Set(filteredInternships.map(i => i.company)).size}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Remote Positions</h3>
              <p className="text-2xl font-bold text-primary">
                {filteredInternships.filter(i => i.workModel.toLowerCase() === 'remote').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Internships List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Internships</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading internships...</span>
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No internships found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInternships.map((internship, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{internship.jobTitle}</h3>
                            <Badge className={getWorkModelBadge(internship.workModel)}>
                              {internship.workModel}
                            </Badge>
                          </div>
                          <p className="text-base font-medium text-primary mb-1">{internship.company}</p>
                          <div className="flex items-center text-sm text-muted-foreground gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {internship.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {internship.datePosted}
                            </span>
                          </div>
                        </div>
                        <Button asChild className="w-full sm:w-auto">
                          <a 
                            href={internship.applicationLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            Apply Now
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function InternshipsPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <InternshipsPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
} 