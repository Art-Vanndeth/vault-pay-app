"use client"

import { User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationBell } from "./notification-bell"

type NavbarProps = {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Navbar({ onMenuClick, showMenuButton = false }: NavbarProps) {
  return (
    <nav className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
          <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => window.location.assign('/')}
              role="button"
              tabIndex={0}
              aria-label="Go to home"
              onKeyPress={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                      window.location.assign('/');
                  }
              }}
          >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">FIN</span>
              </div>
              <span className="font-semibold text-lg text-foreground">FlashFin</span>
          </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Ekko</p>
                <p className="text-xs leading-none text-muted-foreground">ekko@lol.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
