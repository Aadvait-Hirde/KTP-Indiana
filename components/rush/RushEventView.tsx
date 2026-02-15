"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Shirt } from "lucide-react";
import { Separator } from "../ui/separator";
import { Textfit } from "react-textfit";

export interface RushEvent {
  title: string;
  date: Date;
  endDate?: Date;
  locationName: string;
  locationURL?: string;
  dressCode?: string;
  backgroundImageSrc?: string;
  description: string;
}

interface RushEventViewProps {
  event: RushEvent;
}

const fallbackImgSrc = "/bg.jpg";

export default function RushEventView({ event }: RushEventViewProps) {
  return (
    <div className="bg-accent h-[400px] overflow-hidden rounded-xl flex flex-col">
      {/* Header */}
      <div className="relative h-48 select-none">
        <Image
          src={event.backgroundImageSrc ?? fallbackImgSrc}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />

        {/* Date badge */}
        <div
          className="
            absolute top-3 left-3
            h-14 w-14 rounded-md
            bg-accent text-accent-foreground
            flex flex-col items-center justify-center
          "
        >
          <span className="text-sm">
            {event.date
              .toLocaleDateString("en-US", { month: "short" })
              .toUpperCase()}
          </span>
          <span className="text-sm font-extrabold">
            {event.date.toLocaleDateString("en-US", { day: "numeric" })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 flex flex-col flex-1">
        <h3 className="font-bold text-2xl">
          <Textfit
            mode="single"
            max={32}
            min={18}
            className="font-bold leading-tight"
          >
            {event.title}
          </Textfit>
        </h3>

        <span className="block text-muted-foreground">
          {event.date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          })}
          {event.endDate
            ? ` – ${event.endDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
              })}`
            : null}
        </span>

        <Separator />

        <p>{event.description}</p>

        {/* Footer (pushed to bottom) */}
        <div className="mt-auto">
          <Separator />

          <div className="flex flex-col gap-3 pt-2 text-md">
            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.locationURL ? (
                  <Link href={event.locationURL} className="underline">
                    {event.locationName}
                  </Link>
                ) : (
                  event.locationName
                )}
              </span>
            </div>

            {/* Separator + Dress Code */}
            {event.dressCode && (
              <>
                <div className="flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-muted-foreground" />
                  <span>{event.dressCode}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
