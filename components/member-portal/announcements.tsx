"use client"

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { supabase, Announcement } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from './rich-text-editor'
import { Megaphone, Plus, Calendar, User, Edit, Trash2, X, Check } from 'lucide-react'
import { format } from 'date-fns'

interface AnnouncementsSectionProps {
  user?: {
    id: string
    name: string
    email: string
    role: string
    created_at: string
  } | null
}

export function AnnouncementsSection({ user: overrideUser }: AnnouncementsSectionProps) {
  const { user: authUser } = useAuthStore()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // Use override user if provided, otherwise use auth user
  const user = overrideUser || authUser

  const canPost = user?.role === 'admin' || user?.role === 'exec' || user?.role === 'director'

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (err) {
      console.error('Error fetching announcements:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePost = async () => {
    if (!title.trim() || !content.trim() || !authUser) return // Always use real user for posting

    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            author_id: authUser.id, // Use real user ID
            author_name: authUser.name, // Use real user name
          }
        ])
        .select()
        .single()

      if (error) throw error

      setAnnouncements([data, ...announcements])
      setTitle('')
      setContent('')
      setIsPosting(false)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to post announcement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return

    try {
      const { data, error } = await supabase
        .from('announcements')
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setAnnouncements(announcements.map(ann => 
        ann.id === id ? data : ann
      ))
      setEditingId(null)
      setEditTitle('')
      setEditContent('')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to update announcement')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAnnouncements(announcements.filter(ann => ann.id !== id))
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Failed to delete announcement')
    }
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
    // Always check against real user for actual permissions
    return authUser?.role === 'admin' || announcement.author_id === authUser?.id
  }

  if (isLoading && announcements.length === 0) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Announcements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-muted-foreground">Loading announcements...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Announcements</span>
          </CardTitle>
          {canPost && !isPosting && (
            <Button onClick={() => setIsPosting(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
        {/* Post new announcement */}
        {isPosting && (
          <div className="flex-shrink-0 w-full">
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50 min-h-fit">
              <Input
                placeholder="Announcement title..."
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              />
              <div className="min-h-[180px] max-h-[300px]">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your announcement here..."
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex space-x-2">
                <Button 
                  onClick={handlePost} 
                  disabled={!title.trim() || !content.trim() || isLoading}
                  size="sm"
                >
                  {isLoading ? 'Posting...' : 'Post Announcement'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsPosting(false)
                    setTitle('')
                    setContent('')
                    setError('')
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Announcements list - scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No announcements yet</p>
              {canPost && (
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to post an announcement!
                </p>
              )}
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 border rounded-lg bg-card"
              >
                {editingId === announcement.id ? (
                  // Edit mode
                  <div className="space-y-4 w-full">
                    <Input
                      value={editTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                    />
                    <div className="min-h-[180px] max-h-[300px]">
                      <RichTextEditor
                        content={editContent}
                        onChange={setEditContent}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEdit(announcement.id)}
                        size="sm"
                        disabled={!editTitle.trim() || !editContent.trim()}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <div className="flex items-center space-x-2">
                        {canEditDelete(announcement) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(announcement)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(announcement.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(announcement.created_at), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className="text-muted-foreground mb-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: announcement.content }}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {announcement.author_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Leadership
                      </Badge>
                      {announcement.updated_at !== announcement.created_at && (
                        <Badge variant="secondary" className="text-xs">
                          Edited
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 