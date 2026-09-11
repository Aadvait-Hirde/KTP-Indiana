import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchBoardMembers } from "@/lib/members";
import type { BoardMember } from "@/lib/members";

const GRID_CLASS =
  "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 justify-items-center";

const getInitials = (name: string) => {
  return name.charAt(0) + name.charAt(name.lastIndexOf(" ") + 1);
};

function BoardMemberCard({
  member,
  fallbackTitle,
}: {
  member: BoardMember;
  fallbackTitle: string;
}) {
  return (
    <Card className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/20 w-full">
      <CardHeader className="text-center pb-2">
        <Avatar className="h-24 w-24 mx-auto mb-3 ring-4 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
          <AvatarImage
            src={member.avatar}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent className="text-center space-y-2 pb-4">
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors duration-300">
          {member.name}
        </h3>
        <p className="text-sm font-medium text-muted-foreground">
          {member.position.name || fallbackTitle}
        </p>
      </CardContent>
    </Card>
  );
}

function SkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="group border-2 w-full">
          <CardHeader className="text-center pb-2">
            <div className="h-24 w-24 mx-auto mb-3 rounded-full bg-muted animate-pulse" />
          </CardHeader>
          <CardContent className="text-center space-y-2 pb-4">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="flex justify-center space-x-2 pt-2">
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function ExecBoardSection() {
  const [execMembers, setExecMembers] = useState<BoardMember[] | null>(null);
  const [directors, setDirectors] = useState<BoardMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [exec, dir] = await Promise.all([
          fetchBoardMembers("exec"),
          fetchBoardMembers("director"),
        ]);
        if (!mounted) return;
        setExecMembers(exec);
        setDirectors(dir);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setExecMembers(null);
        setDirectors(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-24 bg-muted/50 relative overflow-hidden">
      {/* Updated Triangle Background */}
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none">
        <svg
          viewBox="0 0 100 100"
          className="absolute bottom-0 left-0 w-full h-full opacity-10"
          preserveAspectRatio="none"
        >
          <path
            d="M -10 100 L 20 10 Q 21 9 22 10 L 100 70 L 100 100 Z"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
            Executive Board
          </h2>
          <p className="text-lg text-muted-foreground">
            Meet the leaders driving our chapter forward
          </p>
        </div>

        <div className={GRID_CLASS}>
          {execMembers ? (
            execMembers.map((member) => (
              <BoardMemberCard
                key={member.id}
                member={member}
                fallbackTitle="Executive Board Member"
              />
            ))
          ) : loading ? (
            <SkeletonCards count={10} />
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                Error loading executive board: {error}
              </p>
            </div>
          )}
        </div>

        {directors && directors.length > 0 && (
          <>
            <div className="text-center mt-16 mb-10">
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tighter">
                Directors
              </h3>
            </div>
            <div className={GRID_CLASS}>
              {directors.map((member) => (
                <BoardMemberCard
                  key={member.id}
                  member={member}
                  fallbackTitle="Director"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
