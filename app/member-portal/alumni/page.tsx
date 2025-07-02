"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, Network } from 'lucide-react'

function AlumniPageContent() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Alumni Directory</h1>
          <p className="text-muted-foreground mt-2">
            Connect with KTP alumni and explore career opportunities across top companies.
          </p>
        </div>

        {/* Alumni Connections Spreadsheet */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Alumni Connections</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse our alumni network and their career paths at leading technology companies.
            </p>
          </div>
          <div className="w-full h-[1000px] overflow-hidden">
            <iframe 
              src="https://docs.google.com/spreadsheets/d/e/2PACX-1vRhYjMqr4XZEOk7Gs7U_uu7CsvILtsXAgW92Q-RwctyAsmVm8qFbDu4SqZNQjFCvOYSkSgGBZwQLeFC/pubhtml?gid=0&single=true&widget=true&headers=false"
              className="w-full h-full border-0"
              title="KTP Alumni Connections"
              loading="lazy"
              style={{
                transform: 'scale(0.6)',
                transformOrigin: 'top left',
                width: '167%',
                height: '167%'
              }}
            />
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Top Companies</h3>
              <p className="text-sm text-muted-foreground">
                Our alumni work at leading tech companies including Google, Microsoft, Meta, and more.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Diverse Paths</h3>
              <p className="text-sm text-muted-foreground">
                From software engineering to product management, our alumni pursue varied career paths.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Network className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">
                Reach out to our alumni network via LinkedIn or email and expand your professional circle.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AlumniPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <AlumniPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
} 