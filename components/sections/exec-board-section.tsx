import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Instagram } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/supabase";

export function ExecBoardSection() {
  const [boardMembers, setBoardMembers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchExecMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "exec");

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setBoardMembers(null);
      } else {
        const sortedMembers = (data as User[] | null)?.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setBoardMembers(sortedMembers as User[] | null);
      }
      setLoading(false);
    };

    fetchExecMembers();
    return () => {
      mounted = false;
    };
  }, []);

  const getInitials = (name: string) => {
    return name.charAt(0) + name.charAt(name.lastIndexOf(" ") + 1);
  };

  const renderCard = (member: User, index: number) => (
    <Card
      key={index}
      className="group hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 hover:border-primary/20 w-full"
    >
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
          {member.title ? member.title : "Executive Board Member"}
        </p>
        {/* <div className="flex justify-center space-x-2 pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Linkedin className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Instagram className="h-3 w-3" />
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );

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

        {/* First row - 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 justify-items-center">
          {boardMembers ? (
            boardMembers
              .slice(0, 5)
              .map((member, index) => renderCard(member, index))
          ) : loading ? (
            Array.from({ length: 5 }).map((_, index) => (
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
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                Error loading executive board: {error}
              </p>
            </div>
          )}
        </div>

        {/* Second row - remaining cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 justify-items-center">
          {boardMembers
            ? boardMembers
                .slice(5)
                .map((member, index) => renderCard(member, index + 5))
            : loading
            ? Array.from({ length: 5 }).map((_, index) => (
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
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
