"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TriangleAlert } from "lucide-react";

type FinanceNotSetupProps = {
  onEnablePortal: () => Promise<void>;
  creatingCustomer: boolean;
};

export function FinanceNotSetup({
  onEnablePortal,
  creatingCustomer,
}: FinanceNotSetupProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Finances not Setup</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t enabled the finance portal yet. Please enable the
          portal to proceed.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button onClick={onEnablePortal} disabled={creatingCustomer}>
          {creatingCustomer ? "Enabling..." : "Enable Portal"}
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export default function StripeDuesPage() {
  const { user: clerkUser } = useUser();
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStripeCustomerId() {
      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/stripe/customer", { method: "GET" });
        const payload = (await response.json()) as {
          customerId?: string | null;
          error?: string;
        };

        if (!response.ok) {
          setError(payload.error ?? "Failed to fetch Stripe customer.");
          setStripeCustomerId(null);
          return;
        }

        setStripeCustomerId(payload.customerId ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStripeCustomerId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStripeCustomerId();
  }, [clerkUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-10 w-36 mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  async function handleEnablePortal() {
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      setError("No email found for your account.");
      return;
    }

    try {
      setCreatingCustomer(true);
      setError(null);

      const response = await fetch("/api/stripe/customer", {
        method: "POST",
      });

      const payload = (await response.json()) as {
        customerId?: string | null;
        error?: string;
        requiresInitialization?: boolean;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create Stripe customer.");
      }

      if (payload.requiresInitialization) {
        setStripeCustomerId(null);
        return;
      }

      if (!payload.customerId) {
        throw new Error("Failed to create Stripe customer.");
      }

      setStripeCustomerId(payload.customerId);
      toast.success("Finance portal enabled.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast.error(message);
    } finally {
      setCreatingCustomer(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      {stripeCustomerId ? (
        <></>
      ) : (
        <>
          <FinanceNotSetup
            onEnablePortal={handleEnablePortal}
            creatingCustomer={creatingCustomer}
          />
        </>
      )}
    </div>
  );
}
