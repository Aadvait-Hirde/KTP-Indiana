"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Linkedin } from "lucide-react";
import { getSocialUrl } from "@/components/member-portal/admin/users/users-utils";
import {
  fetchPublicMembers,
  getGradeLabel,
  getPledgeClassRole,
  type PublicMember,
} from "@/lib/members";

function getInitials(name: string) {
  return name.charAt(0) + name.charAt(name.lastIndexOf(" ") + 1);
}

function MemberCard({ member }: { member: PublicMember }) {
  const grade = getGradeLabel(member.graduation_year, member.is_alumni);
  const pledgeClass = getPledgeClassRole(member.roles);
  const linkedinUrl = getSocialUrl(member, "linkedin");

  const details = [
    grade,
    pledgeClass?.name ?? null,
    member.major ? member.major : null,
  ].filter((line): line is string => Boolean(line));

  return (
    <Card className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border hover:border-primary/30 flex flex-col h-full">
      <CardHeader className="text-center p-3 flex-none">
        <Avatar className="h-24 w-24 mx-auto mb-3 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300">
          <AvatarImage src={member.avatar} />
          <AvatarFallback className="text-xl font-bold bg-linear-to-br from-primary/20 to-primary/10">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="h-12 flex flex-col justify-center">
          <CardTitle className="text-md group-hover:text-primary transition-colors leading-normal mb-1">
            {member.name}
          </CardTitle>
        </div>
        <div className="h-14 flex flex-col items-center justify-start gap-0.5 text-xs leading-tight text-muted-foreground">
          {details.map((line, index) => (
            <span
              key={index}
              className={index === details.length - 1 ? "line-clamp-2" : "truncate max-w-full"}
              title={line}
            >
              {line}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="text-center pt-0 pb-2 px-3 mt-auto">
        <div className="flex justify-center items-center space-x-1 h-6">
          {linkedinUrl ? (
            <a href={linkedinUrl} target="_blank" rel="noreferrer">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Linkedin className="h-3 w-3" />
              </Button>
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function MemberGrid({
  members,
  loading,
  error,
  emptyTitle,
  emptyDescription,
}: {
  members: PublicMember[];
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-16">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader className="text-center p-3 flex-none">
              <div className="h-24 w-24 mx-auto mb-3 rounded-full bg-muted animate-pulse" />
              <div className="h-6 bg-muted rounded animate-pulse mb-2" />
              <div className="h-14 bg-muted rounded animate-pulse" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error fetching members: {error}</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">{emptyTitle}</h3>
          <p className="text-muted-foreground">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-16">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPublicMembers()
      .then((data) => {
        if (!mounted) return;
        setMembers(data);
        setFetchError(null);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        setFetchError(
          error instanceof Error ? error.message : "Unknown error",
        );
        setMembers([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeMembers = useMemo(
    () => members.filter((member) => !member.is_alumni),
    [members],
  );
  const alumni = useMemo(
    () => members.filter((member) => member.is_alumni),
    [members],
  );

  return (
    <div className="min-h-screen min-w-screen bg-background">
      {/* Wave Pattern Background similar to About section */}
      <div className="absolute inset-0 opacity-5">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,220 C400,160 800,280 1200,220 L1200,400 L0,400 Z"
            fill="currentColor"
            className="text-primary"
          />
          <path
            d="M0,260 C300,200 600,320 1200,240 L1200,400 L0,400 Z"
            fill="currentColor"
            className="text-primary opacity-60"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 mt-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Our Community
          </h2>
          <p className="text-lg text-muted-foreground">
            Connect with active members and alumni
          </p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-12 bg-muted/50">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-md font-medium"
            >
              Active Members
            </TabsTrigger>
            <TabsTrigger
              value="alumni"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 rounded-md font-medium"
            >
              Alumni
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="active"
            className="mt-8 animate-in fade-in-50 duration-500"
          >
            <MemberGrid
              members={activeMembers}
              loading={loading}
              error={fetchError}
              emptyTitle="No Active Members"
              emptyDescription="Check back soon."
            />
          </TabsContent>

          <TabsContent
            value="alumni"
            className="mt-8 animate-in fade-in-50 duration-500"
          >
            <MemberGrid
              members={alumni}
              loading={loading}
              error={fetchError}
              emptyTitle="No Alumni Yet"
              emptyDescription="As our first generation of brothers, current members will become our founding alumni. Check back soon to see where they land!"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
