import { NextResponse } from 'next/server'

interface Internship {
  company: string
  jobTitle: string
  location: string
  workModel: string
  datePosted: string
  applicationLink: string
}

// Cache the data for 1 hour
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
let cachedData: { internships: Internship[], lastUpdated: Date } | null = null
let lastFetch = 0

function parseMarkdownTable(markdown: string): Internship[] {
  const internships: Internship[] = []
  
  // Split by lines and find the table section
  const lines = markdown.split('\n')
  let inTable = false
  let tableStarted = false
  
  for (const line of lines) {
    // Look for the table header with emojis
    if (line.includes('🏢 Company') && line.includes('💼 Role')) {
      inTable = true
      continue
    }
    
    // Skip table separator
    if (inTable && line.includes('---')) {
      tableStarted = true
      continue
    }
    
    // Stop when we hit an empty line or another section
    if (inTable && tableStarted && (line.trim() === '' || line.startsWith('#'))) {
      break
    }
    
    // Parse table rows
    if (inTable && tableStarted && line.startsWith('|')) {
      const columns = line.split('|').map(col => col.trim()).filter(col => col !== '')
      
      if (columns.length >= 5) {
        // Extract company name - handle HTML line breaks
        let company = columns[0]
        company = company.replace(/<br>/g, ' ').replace(/\s+/g, ' ').trim()
        
        // Extract job title - handle HTML line breaks
        let jobTitle = columns[1]
        jobTitle = jobTitle.replace(/<br>/g, ' ').replace(/\s+/g, ' ').trim()
        
        // Extract location - handle HTML line breaks
        let location = columns[2]
        location = location.replace(/<br>/g, ', ').replace(/\s+/g, ' ').trim()
        
        // Extract application link from HTML anchor tag
        let applicationLink = ''
        const applyColumn = columns[3]
        const linkMatch = applyColumn.match(/href="([^"]+)"/)
        if (linkMatch) {
          applicationLink = linkMatch[1]
        }
        
        // Extract date posted
        const datePosted = columns[4] || ''
        
        // Determine work model based on location
        let workModel = 'On Site'
        if (location.toLowerCase().includes('remote')) {
          workModel = 'Remote'
        } else if (location.toLowerCase().includes('hybrid')) {
          workModel = 'Hybrid'
        }
        
        // Only add if we have the essential data
        if (company && jobTitle && applicationLink) {
          internships.push({
            company: company.trim(),
            jobTitle: jobTitle.trim(),
            location: location.trim(),
            workModel: workModel.trim(),
            datePosted: datePosted.trim(),
            applicationLink: applicationLink.trim()
          })
        }
      }
    }
  }
  
  return internships
}

async function fetchInternshipsFromGitHub(): Promise<Internship[]> {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/PrepAIJobs/Summer2026-Internships/main/README.md',
      {
        headers: {
          'User-Agent': 'KTP-Website'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }
    
    const markdownContent = await response.text()
    return parseMarkdownTable(markdownContent)
  } catch (error) {
    console.error('Error fetching internships from GitHub:', error)
    return []
  }
}

export async function GET() {
  try {
    const now = Date.now()
    
    // Check if we have cached data that's still fresh
    if (cachedData && (now - lastFetch) < CACHE_DURATION) {
      return NextResponse.json(cachedData)
    }
    
    // Fetch fresh data
    const internships = await fetchInternshipsFromGitHub()
    
    // Update cache
    cachedData = {
      internships,
      lastUpdated: new Date()
    }
    lastFetch = now
    
    return NextResponse.json(cachedData)
  } catch (error) {
    console.error('Error in internships API:', error)
    
    // Return cached data if available, even if stale
    if (cachedData) {
      return NextResponse.json(cachedData)
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch internships' },
      { status: 500 }
    )
  }
} 