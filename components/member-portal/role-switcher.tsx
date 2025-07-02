"use client"

import { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Eye, ChevronDown, RotateCcw } from 'lucide-react'

interface RoleSwitcherProps {
  onRoleChange?: (role: string) => void
}

export function RoleSwitcher({ onRoleChange }: RoleSwitcherProps) {
  const { user } = useAuthStore()
  const [viewingAsRole, setViewingAsRole] = useState<string | null>(null)

  // Only show for admin users
  if (user?.role !== 'admin') {
    return null
  }

  const roles = [
    { value: 'admin', label: 'Admin', color: 'text-zinc-600' },
    { value: 'exec', label: 'Exec', color: 'text-zinc-600' },
    { value: 'director', label: 'Director', color: 'text-zinc-600' },
    { value: 'member', label: 'Member', color: 'text-zinc-600' },
    { value: 'newmember', label: 'New Member', color: 'text-zinc-600' },
  ]

  const handleRoleSwitch = (role: string) => {
    setViewingAsRole(role === user.role ? null : role)
    onRoleChange?.(role === user.role ? user.role : role)
  }

  const resetView = () => {
    setViewingAsRole(null)
    onRoleChange?.(user.role)
  }

  const currentRole = viewingAsRole || user.role
  const currentRoleData = roles.find(r => r.value === currentRole)

  return (
    <div className="flex items-center space-x-2">
      {viewingAsRole && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Viewing as {roles.find(r => r.value === viewingAsRole)?.label}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetView}
            className="h-7 px-2"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Eye className="h-3 w-3" />
            <span className={currentRoleData?.color}>
              {currentRoleData?.label}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>View Portal As</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {roles.map((role) => (
            <DropdownMenuItem
              key={role.value}
              onClick={() => handleRoleSwitch(role.value)}
              className={`cursor-pointer ${
                currentRole === role.value ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={role.color}>{role.label}</span>
                {currentRole === role.value && (
                  <Badge variant="outline" className="text-xs ml-2">
                    Current
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={resetView}
            className="cursor-pointer text-muted-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset to Admin View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 