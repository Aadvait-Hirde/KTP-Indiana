"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { AnnouncementsSection } from "@/components/member-portal/announcements";
import { CalendarWidget } from "@/components/member-portal/calendar-widget";
import { InternshipsWidget } from "@/components/member-portal/internships-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, CreditCard, Vote, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MemberPortalPage() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState("");
  const [viewingAsRole, setViewingAsRole] = useState<string | null>(null);

  // Use the viewing role or actual user role
  const effectiveRole = viewingAsRole || user?.role;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }
  }, []);

  const getDuesLink = () => {
    // Different payment links based on effective role
    if (effectiveRole === "newmember") {
      return "https://collect.crowded.me/collection/4fac4104-27d2-46ea-8bac-2b22803de573";
    }
    return "https://collect.crowded.me/collection/3afb7113-1cab-47d1-894d-117c6ed06ec4";
  };

  const getDuesImage = () => {
    if (effectiveRole === "newmember") {
      return "/portal-images/new-member-dues/new-member-dues.png";
    }
    return "/portal-images/active-dues/active-dues.png";
  };

  const getDisplayRole = (role: string) => {
    switch (role) {
      case "newmember":
        return "New Member";
      case "admin":
        return "Admin";
      case "exec":
        return "Exec";
      case "director":
        return "Director";
      default:
        return "Member";
    }
  };

  const getRoleColor = () => {
    // Use zinc-600 in light mode, zinc-300 in dark mode for better legibility
    return "text-zinc-600 dark:text-zinc-300";
  };

  const handleRoleChange = (newRole: string) => {
    setViewingAsRole(newRole === user?.role ? null : newRole);
  };

  // Create effective user object for child components
  const effectiveUser = user
    ? {
        ...user,
        role: effectiveRole || user.role,
      }
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Greeting */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        {greeting}, {user?.name?.split(" ")[0]}!
      </h1>

      {/* Dashboard Content */}
      <main className="space-y-4 md:space-y-6">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Announcements with effective user */}
          <AnnouncementsSection user={effectiveUser} />

          {/* Calendar */}
          <CalendarWidget />
        </div>

        {/* Main Content Section - Internships and Pay Dues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">
          <InternshipsWidget />

          {/* Pay Dues */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Pay Dues</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 m-0">
              <a
                href={getDuesLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Image
                  src={getDuesImage()}
                  alt={
                    effectiveRole === "newmember"
                      ? "New Member Dues"
                      : "Active Member Dues"
                  }
                  width={800}
                  height={600}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity rounded-b-lg !mb-0 !margin-bottom-0"
                  style={{ marginBottom: 0 }}
                  quality={100}
                  priority
                />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Merch Store */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>KTP Merch Store</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Get the latest KTP merchandise including hoodies, t-shirts,
                stickers, and more!
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Merch store out now!
                </p>
                <Link href="/member-portal/merch" className="w-full">
                  <Button className="w-full">View Store</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Elections */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="h-5 w-5" />
                <span>Elections</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                View candidate videos and positions for the upcoming elections.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Vote className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Elections are open!
                </p>
                <Link href="/member-portal/elections" className="w-full">
                  <Button className="w-full">View Elections</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Applications and Forms */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Forms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Access important forms and applications for KTP members.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Forms available
                </p>
                <Link href="/member-portal/forms" className="w-full">
                  <Button className="w-full">View Forms</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
