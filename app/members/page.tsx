"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/footer";
import { Linkedin, Instagram } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/lib/supabase";

export default function CommunityPage() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("users").select("*");
      if (!mounted) return;
      if (error) {
        setFetchError(error.message);
        setUsers(null);
      } else {
        const sortedUsers = (data as User[] | null)?.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setUsers(sortedUsers as User[] | null);
      }
      setLoading(false);
    };

    fetchUsers();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar scrollToSection={scrollToSection} />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-16">
              {users ? (
                users.map((user, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border hover:border-primary/30 flex flex-col h-full"
                  >
                    <CardHeader className="text-center p-3 flex-none">
                      <Avatar className="h-14 w-14 mx-auto mb-3 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-300">
                        <AvatarImage />
                        <AvatarFallback className="text-sm bg-linear-to-br from-primary/20 to-primary/10">
                          {user.name.charAt(0) +
                            user.name.charAt(user.name.lastIndexOf(" ") + 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="h-12 flex flex-col justify-center">
                        <CardTitle className="text-sm group-hover:text-primary transition-colors leading-normal mb-1">
                          {user.name}
                        </CardTitle>
                      </div>
                      <div className="h-8 flex items-center justify-center">
                        <CardDescription className="text-xs leading-tight line-clamp-2 text-center">
                          {user.class ? user.class : "Unknown class"} •{" "}
                          {user.pledgeClass
                            ? user.pledgeClass + " Class"
                            : "Unknown PC"}{" "}
                          • {user.major ? user.major : "Unknown major"}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    {/* <CardContent className="text-center pt-0 pb-2 px-3 mt-auto">
                    <div className="flex justify-center items-center space-x-1 h-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Instagram className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent> */}
                  </Card>
                ))
              ) : loading ? (
                Array.from({ length: 12 }).map((_, index) => (
                  <Card key={index} className="flex flex-col h-full">
                    <CardHeader className="text-center p-3 flex-none">
                      <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-muted animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No members found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="alumni"
            className="mt-8 animate-in fade-in-50 duration-500"
          >
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4">No Alumni Yet</h3>
                <p className="text-muted-foreground">
                  As our first generation of brothers, current members will
                  become our founding alumni. Check back soon to see where they
                  land!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
