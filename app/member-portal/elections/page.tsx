"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Vote, ExternalLink } from 'lucide-react'

function ElectionsPageContent() {
  // Elections data
  const electionsData = [
    { 
      position: 'President', 
      candidates: [
        { name: 'Alexandar Spalevic', videoUrl: 'https://youtube.com/shorts/tEjSl8jIEjc', isYouTube: true },
        { name: 'Aaditya Rajvanshi', videoUrl: 'https://youtu.be/5xGHe7uTRyk', isYouTube: true }
      ] 
    },
    { 
      position: 'VP of Membership', 
      candidates: [
        { name: 'Tristan Kean', videoUrl: 'https://drive.google.com/file/d/1eeAptBMmYLwQ00hLeTzNAOADVq3fKior/view?usp=sharing', isYouTube: false }
      ] 
    },
    { 
      position: 'VP of Operations', 
      candidates: [
        { name: 'Alexandar Spalevic', videoUrl: 'https://www.youtube.com/watch?v=aT7hQaFL-lc', isYouTube: true }
      ] 
    },
    { 
      position: 'VP of Professional Development', 
      candidates: [
        { name: 'Shanmuk Gudipati', videoUrl: 'https://youtu.be/F9VaPbNb-aA', isYouTube: true },
        { name: 'Arnav Pydimukkala', videoUrl: 'https://drive.google.com/file/d/1Pu3Q2eSjBrQPFoJSxDQ9QTgXcPddDSgx/view?usp=sharing', isYouTube: false },
        { name: 'Elizabeth Vander Bie', videoUrl: 'https://youtu.be/dBbL6OC1q7w', isYouTube: true }
      ] 
    },
    { 
      position: 'VP of Internal Affairs', 
      candidates: [
        { name: 'Jorge Diaz', videoUrl: 'https://drive.google.com/file/d/10XI0a5o7ufxlHcP7BtpuGINNI09Ayl_z/view?usp=sharing', isYouTube: false },
        { name: 'Pratham Taparia', videoUrl: 'https://drive.google.com/file/d/1yTAU1DtfBsK0HYxfPZeDfNvC00-4fRNj/view?usp=sharing', isYouTube: false },
        { name: 'Nick Natale', videoUrl: 'https://youtu.be/xfFXmBXrSVE', isYouTube: true }
      ] 
    },
    { 
      position: 'VP of External Affairs', 
      candidates: [
        { name: 'Pratham Taparia', videoUrl: 'https://drive.google.com/file/d/1DBfBrsaEC3WmoSoeFl4xO-x5lOKyAEma/view?usp=sharing', isYouTube: false },
        { name: 'Arnav Pydimukkala', videoUrl: 'https://drive.google.com/file/d/1VB8fjyytvck_VtCA8630rNfccUERv3j7/view?usp=sharing', isYouTube: false }
      ] 
    },
    { 
      position: 'VP of Tech Infrastructure', 
      candidates: [
        { name: 'Jason Ballinger', videoUrl: 'https://youtu.be/3-yP8nFIyZw', isYouTube: true }
      ] 
    },
    { position: 'VP of Social Engagement', candidates: [] },
    { 
      position: 'VP of Marketing', 
      candidates: [
        { name: 'Elizabeth Vander Bie', videoUrl: 'https://youtu.be/b6L9IMg7mK8', isYouTube: true }
      ] 
    },
    { 
      position: 'VP of Finance', 
      candidates: [
        { name: 'Jorge Diaz', videoUrl: 'https://drive.google.com/file/d/1P9LRu85pqobScLlDmXPDBRTQ-CMTq20g/view?usp=sharing', isYouTube: false },
        { name: 'Arnav Pydimukkala', videoUrl: 'https://drive.google.com/file/d/1MR2eUMwJWdh3mfnc8u1hdmwtIHZEH3Q9/view?usp=sharing', isYouTube: false }
      ] 
    },
    { position: 'Director of New Member Education', candidates: [] },
    { 
      position: 'Director of Community Outreach', 
      candidates: [
        { name: 'Alexander Balon', videoUrl: 'https://youtu.be/cCdIjPXX0t8', isYouTube: true },
        { name: 'Pratham Taparia', videoUrl: 'https://drive.google.com/file/d/1CpJiF3tiDIdg5D4yzaoW3FIIWQDccpCG/view?usp=sharing', isYouTube: false }
      ] 
    },
    { position: 'Director of Procurement Committee', candidates: [] },
    { 
      position: 'Director of Merch Committee', 
      candidates: [
        { name: 'Elizabeth Vander Bie', videoUrl: 'https://youtu.be/1abwKnn8XR0', isYouTube: true },
        { name: 'Aarav Chuttani', videoUrl: 'https://drive.google.com/file/d/1ydMnt_ryrcwJxBG3FGsbAPwzPHweCrJX/view?usp=drivesdk', isYouTube: false },
        { name: 'Annanya Bitra', videoUrl: 'https://youtu.be/OzhysyUnyrs', isYouTube: true }
      ] 
    },
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
    // Handle youtube.com/watch?v= format
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Handle youtube.com/shorts/ format
    if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('shorts/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    // Fallback
    const videoId = url.split('/').pop()?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  // Convert Google Drive URL to embed URL
  const getDriveEmbedUrl = (url: string) => {
    // Extract file ID from Drive URL
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`
    }
    return url
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
                        {candidate.isYouTube ? (
                          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                            <iframe
                              src={getYouTubeEmbedUrl(candidate.videoUrl)}
                              title={`${candidate.name} - ${election.position}`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                              <iframe
                                src={getDriveEmbedUrl(candidate.videoUrl)}
                                title={`${candidate.name} - ${election.position}`}
                                className="w-full h-full"
                                allow="autoplay"
                                allowFullScreen
                              />
                            </div>
                            <a
                              href={candidate.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span>Open in Google Drive</span>
                            </a>
                          </div>
                        )}
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

