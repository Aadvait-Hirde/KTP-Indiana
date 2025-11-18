"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Vote } from 'lucide-react'

function ElectionsPageContent() {
  // Elections data
  const electionsData = [
    { position: 'President', candidates: [] },
    { position: 'VP of Membership', candidates: [] },
    { position: 'VP of Operations', candidates: [] },
    { position: 'VP of Professional Development', candidates: [] },
    { position: 'VP of Internal Affairs', candidates: [] },
    { position: 'VP of External Affairs', candidates: [] },
    { position: 'VP of Tech Infrastructure', candidates: [] },
    { position: 'VP of Social Engagement', candidates: [] },
    { position: 'VP of Marketing', candidates: [{ name: 'Elizabeth Vander Bie', videoUrl: 'https://youtu.be/b6L9IMg7mK8' }] },
    { position: 'VP of Finance', candidates: [] },
    { position: 'Director of New Member Education', candidates: [] },
    { position: 'Director of Community Outreach', candidates: [{ name: 'Alex Balon', videoUrl: 'https://youtu.be/cCdIjPXX0t8' }] },
    { position: 'Director of Procurement Committee', candidates: [] },
    { position: 'Director of Merch Committee', candidates: [] },
    { position: 'Director of Rush Committee', candidates: [] },
    { position: 'Pledge Educator', candidates: [] },
  ]

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    // Handle youtu.be format
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Handle youtube.com format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Fallback
    const videoId = url.split('/').pop()?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold">Elections</h1>

        {/* Voting Link Placeholder */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Button className="w-full" disabled>
                <Vote className="h-4 w-4 mr-2" />
                Voting Link (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Positions and Candidates */}
        <div className="space-y-6">
          {electionsData.map((election, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{election.position}</CardTitle>
              </CardHeader>
              <CardContent>
                {election.candidates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {election.candidates.map((candidate, candidateIndex) => (
                      <div key={candidateIndex} className="space-y-2">
                        <p className="font-medium text-sm">{candidate.name}</p>
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                          <iframe
                            src={getYouTubeEmbedUrl(candidate.videoUrl)}
                            title={`${candidate.name} - ${election.position}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No candidates on the ballot yet.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ElectionsPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <ElectionsPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
}

