"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ExternalLink } from 'lucide-react'

function FormsPageContent() {
  // Forms data
  const formsData = [
    { title: 'Actives Information Update', url: 'https://docs.google.com/spreadsheets/d/1DnhvNZxqFRCvw9d4TT8ZTLKdtKnB7pPeF4IFIrv1qNc/edit?usp=sharing' },
    { title: 'Election Ballot Form', url: 'https://airtable.com/appl4TdIOUhX3BhBo/pag5OlLySAEM8vkiq/form' },
    { title: 'Rush Committee Application', url: 'https://airtable.com/app49dMMknDxUBFaC/pag2X1FuppCUxZnIY/form' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold">Applications and Forms</h1>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Available Forms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formsData.map((form, index) => (
              <a
                key={index}
                href={form.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{form.title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function FormsPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <FormsPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
}

