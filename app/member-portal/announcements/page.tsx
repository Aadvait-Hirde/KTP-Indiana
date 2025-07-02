"use client"

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { PageLayout } from '@/components/member-portal/page-layout'
import { useAuthStore } from '@/lib/auth-store'
import { supabase, Announcement } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/member-portal/rich-text-editor'
import { Megaphone, Plus, Calendar, User, Edit, Trash2, X, Check } from 'lucide-react'
import { format } from 'date-fns'

function AnnouncementsPageContent() {
  const { 
    user, 
    announcements, 
    isAnnouncementsLoading,
    fetchAnnouncements, 
    hideAnnouncement 
  } = useAuthStore()
  
  const [isPosting, setIsPosting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const canPost = user?.role === 'admin' || user?.role === 'exec' || user?.role === 'director'

  useEffect(() => {
    fetchAnnouncements()
    
    // Subscribe to real-time changes and just refetch everything
    const channel = supabase
      .channel('announcements-page-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          // Simply refetch all announcements instead of trying to manage state manually
          fetchAnnouncements()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAnnouncements])

  const handlePost = async () => {
    if (!title.trim() || !content.trim() || !user) return

    setError('')

    try {
      const { error } = await supabase
        .from('announcements')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            author_id: user.id,
            author_name: user.name,
            hidden: false // Default to not hidden
          }
        ])

      if (error) throw error

      setTitle('')
      setContent('')
      setIsPosting(false)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to post announcement')
    }
  }

  const handleEdit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return

    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      setEditTitle('')
      setEditContent('')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to update announcement')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return

    await hideAnnouncement(id)
  }

  const startEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setEditTitle(announcement.title)
    setEditContent(announcement.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const canEditDelete = (announcement: Announcement) => {
    return user?.role === 'admin' || announcement.author_id === user?.id
  }

  if (isAnnouncementsLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-muted-foreground">Loading announcements...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Announcements</h1>
          {canPost && (
            <Button onClick={() => setIsPosting(true)} disabled={isPosting} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>

        {/* Post new announcement */}
        {isPosting && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Announcement title..."
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              />
              <div className="min-h-[200px]">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your announcement here..."
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  onClick={handlePost} 
                  disabled={!title.trim() || !content.trim()}
                  className="w-full sm:w-auto"
                >
                  Post Announcement
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsPosting(false)
                    setTitle('')
                    setContent('')
                    setError('')
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements list */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
                <p className="text-muted-foreground">
                  {canPost ? 'Be the first to post an announcement!' : 'Check back later for updates from leadership.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-4 md:p-6">
                  {editingId === announcement.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <Input
                        value={editTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                      />
                      <div className="min-h-[200px]">
                        <RichTextEditor
                          content={editContent}
                          onChange={setEditContent}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button
                          onClick={() => handleEdit(announcement.id)}
                          disabled={!editTitle.trim() || !editContent.trim()}
                          className="w-full sm:w-auto"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          className="w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
                        <h2 className="text-xl font-semibold">{announcement.title}</h2>
                        <div className="flex items-center space-x-2">
                          {canEditDelete(announcement) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(announcement)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(announcement.id)}
                                className="text-orange-600 hover:text-orange-700"
                                title="Delete announcement"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div 
                        className="prose prose-sm max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: announcement.content }}
                      />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{announcement.author_name}</span>
                            <Badge variant="outline" className="text-xs">
                              Leadership
                            </Badge>
                          </div>
                          {announcement.updated_at !== announcement.created_at && (
                            <Badge variant="secondary" className="text-xs">
                              Edited
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs sm:text-sm">{format(new Date(announcement.created_at), 'MMM d, yyyy • h:mm a')}</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnnouncementsPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <AnnouncementsPageContent />
      </PageLayout>
    </ProtectedRoute>
  )
} 