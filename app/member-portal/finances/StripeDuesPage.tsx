"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function StripeDuesPage() {
  const { user: clerkUser } = useUser();
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStripeCustomerId() {
      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("stripe_customer_id")
          .eq("email", clerkUser.emailAddresses[0].emailAddress)
          .single();

        if (error) {
          setError(error.message);
          setStripeCustomerId(null);
        } else {
          setStripeCustomerId(data?.stripe_customer_id || null);
        }
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <p>stripe!</p>
      <p>
        Stripe Customer ID: {stripeCustomerId ? stripeCustomerId : "Not set"}
      </p>
    </div>
  );
}
