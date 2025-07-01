import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Mail, LogIn } from 'lucide-react'
import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Restricted</CardTitle>
          <CardDescription>
            Your email address is not authorized to access the KTP member portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Only current KTP members and alumni can access this portal. If you believe this is an error, please contact an administrator or try a different account.
          </p>
          <div className="space-y-2">
            <SignOutButton>
              <Button variant="outline" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Try Different Account
              </Button>
            </SignOutButton>
            <Button asChild className="w-full">
              <a href="mailto:ktpindiana@gmail.com">
                <Mail className="w-4 h-4 mr-2" />
                Contact Admin
              </a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                Return to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 