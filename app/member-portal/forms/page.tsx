"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { FileText, ExternalLink, TriangleAlert, Icon } from "lucide-react";

interface FormData {
  title: string;
  url: string;
}

export default function FormsPage() {
  // Forms data
  const formsData: FormData[] = [];

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold">
          Applications and Forms
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {/* Forms List */}
        {formsData.length > 0 ? (
          <div className="max-w-4xl w-full space-y-4 md:space-y-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Available Forms</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formsData.map((form, index) => (
                  <a
                    key={index}
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{form.title}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Empty className="items-center justify-center">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlert />
              </EmptyMedia>
              <EmptyTitle>No Forms Available</EmptyTitle>
              <EmptyDescription>
                There are currently no forms available. Please check back later
                for updates.
              </EmptyDescription>
            </EmptyHeader>
            {false ? (
              <EmptyContent>
                <Button>Add data</Button>
              </EmptyContent>
            ) : (
              <></>
            )}
          </Empty>
        )}
      </div>
    </div>
  );
}
