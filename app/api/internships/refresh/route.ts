import { NextResponse } from 'next/server'

// This endpoint can be called by cron jobs to refresh the internships data
export async function POST(request: Request) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // If CRON_SECRET is set, verify it matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch fresh data by calling our internships API
    const baseUrl = request.headers.get('host') 
      ? `https://${request.headers.get('host')}`
      : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/internships`, {
      method: 'GET',
      headers: {
        'User-Agent': 'KTP-Website-Cron'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to refresh internships: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Internships refreshed successfully',
      count: data.internships?.length || 0,
      lastUpdated: data.lastUpdated
    })
  } catch (error) {
    console.error('Error refreshing internships:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to refresh internships',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also allow GET for manual testing
export async function GET() {
  return NextResponse.json({
    message: 'Internships refresh endpoint',
    usage: 'Send POST request to refresh internships data',
    note: 'This endpoint is designed to be called by cron jobs'
  })
} 