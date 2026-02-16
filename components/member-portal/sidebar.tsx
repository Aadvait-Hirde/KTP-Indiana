"use client";

import React from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { SignOutButton } from "@clerk/nextjs";
import {
  Calendar,
  Megaphone,
  Users,
  CreditCard,
  ShoppingBag,
  Home,
  Briefcase,
  FileText,
  ChevronUp,
  Slack,
  MessageCircle,
  Shield,
  KeyRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";

export function MemberPortalSidebar() {
  //   const [isCollapsed, setIsCollapsed] = useState(false);
  //   const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const { open, setOpenMobile, isMobile } = useSidebar();

  // Close mobile sidebar when route changes.
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, pathname, setOpenMobile]);

  // const canPostAnnouncements = user?.role === 'admin' || user?.role === 'exec' || user?.role === 'director'

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/member-portal" },
    { icon: Calendar, label: "Calendar", href: "/member-portal/calendar" },
    {
      icon: Briefcase,
      label: "Internships",
      href: "/member-portal/internships",
    },
    {
      icon: Megaphone,
      label: "Announcements",
      href: "/member-portal/announcements",
    },
    { icon: Users, label: "Alumni Directory", href: "/member-portal/alumni" },
    { icon: ShoppingBag, label: "Merch Store", href: "/member-portal/merch" },
    { icon: CreditCard, label: "Finances", href: "/member-portal/finances" },
    // { icon: Vote, label: "Elections", href: "/member-portal/elections" },
    { icon: FileText, label: "Forms", href: "/member-portal/forms" },
  ];

  const externalLinks = [
    {
      icon: Slack,
      label: "Slack",
      href: "https://app.slack.com",
      external: true,
    },
    {
      icon: MessageCircle,
      label: "GroupMe",
      href: "https://web.groupme.com/chats",
      external: true,
    },
  ];

  const adminItems = [
    {
      icon: Shield,
      label: "User Management",
      href: "/member-portal/admin/users",
    },
    {
      icon: KeyRound,
      label: "Role Management",
      href: "/member-portal/admin/roles",
    },
  ];

  const logoSrc =
    open && theme === "dark"
      ? "/ktp-logos/KTP Logo Dark Plain No BG Slim.png"
      : "/ktp-logos/KTP Logo Plain Text Slim.png";

  // Use dark sidebar for both themes - exact same styling

  // Check if current path matches navigation item
  const isActiveRoute = (href: string) => {
    if (href === "/member-portal") {
      return pathname === "/member-portal";
    }
    return pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="flex items-center justify-center relative my-2">
        <Image src={logoSrc} alt={""} width={100} height={100} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveRoute(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user?.role === "exec" && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveRoute(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>External Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {externalLinks.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} prefetch={false} target="_blank">
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="h-full">
                <SidebarMenuButton>
                  <Avatar className="w-10 h-10 rounded-lg">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="w-10 h-10 rounded-lg">
                      {user
                        ? user.name.charAt(0) +
                          user.name.split(" ")[1].charAt(0)
                        : ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <div className="font-bold">{user?.name}</div>
                    <div>
                      {user?.role
                        ? user.role.charAt(0).toUpperCase() +
                          user.role.slice(1).toLowerCase()
                        : ""}
                    </div>
                  </div>

                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-(--radix-dropdown-menu-trigger-width)"
              >
                <SignOutButton>
                  <DropdownMenuItem>
                    <span className="font-bold text-red-500">Sign out</span>
                  </DropdownMenuItem>
                </SignOutButton>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
