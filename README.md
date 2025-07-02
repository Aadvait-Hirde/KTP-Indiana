# Kappa Theta Pi - Alpha Eta Website

This is the official repository for Kappa Theta Pi - Alpha Eta's website, built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Public Website
- Hero section with fraternity branding
- About section showcasing our mission
- Executive board profiles
- Alumni work showcase
- Rush information and FAQ
- Tech passion highlights
- Community impact section

### Member Portal
- **Dashboard**: Personalized welcome with role-based content
- **Calendar**: Integrated events and meetings
- **Announcements**: Role-based announcement system
- **Internships**: Daily-updated internship opportunities from top companies
- **Alumni Directory**: Member networking and connections
- **Dues Payment**: Streamlined payment system
- **Merchandise Store**: KTP branded items (coming soon)

## Internships Feature

The internships feature automatically pulls the latest internship opportunities from the [PrepAIJobs Summer 2026 Internships repository](https://github.com/PrepAIJobs/Summer2026-Internships) and presents them in an easy-to-browse format.

### Key Features:
- **Daily Updates**: Automatically refreshes internship data daily at 8 AM UTC
- **Search & Filter**: Filter by company, location, and work model (Remote/Hybrid/On Site)
- **Dashboard Widget**: Shows latest 3 internships on the member portal dashboard
- **Direct Applications**: One-click application links to company job portals
- **Real-time Statistics**: Shows total internships, companies, and remote positions

### Technical Implementation:
- **API Endpoint**: `/api/internships` fetches and parses the GitHub README markdown table
- **Caching**: 1-hour cache to reduce API calls and improve performance
- **Cron Job**: Vercel cron runs daily to refresh the cache
- **Error Handling**: Graceful fallbacks and loading states

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI with custom theming
- **Authentication**: Clerk
- **Database**: Supabase
- **Deployment**: Vercel
- **External APIs**: GitHub API for internships data

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your environment variables
4. Run development server: `npm run dev`

### Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication
- `CLERK_SECRET_KEY`: Clerk server-side key
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public key
- `CRON_SECRET`: Optional secret for securing cron endpoints

## Deployment

The site is automatically deployed on Vercel with:
- Automatic deployments from main branch
- Daily cron job for internships updates
- Environment variable management
- Custom domain configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.
