"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { Appearance } from "@stripe/stripe-js";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { getStripePromise } from "@/lib/stripe-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type AddPaymentMethodFormProps = {
  clientSecret: string;
  onSuccess: () => Promise<void>;
};

type AddPaymentMethodDialogProps = {
  open: boolean;
  stripeCustomerId: string;
  onOpenChange: (open: boolean) => void;
  onAdded: () => Promise<void>;
};

function AddPaymentMethodForm({
  clientSecret,
  onSuccess,
}: AddPaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setSubmitting(true);

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message || "Please check the form fields.");
      }

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        redirect: "if_required",
      });

      if (error) {
        throw new Error(error.message || "Unable to save payment method.");
      }

      if (!setupIntent) {
        throw new Error("Stripe did not return setup intent details.");
      }

      if (
        !["succeeded", "processing", "requires_action"].includes(
          setupIntent.status,
        )
      ) {
        throw new Error(`Unexpected setup status: ${setupIntent.status}`);
      }

      await onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add payment method.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Billing address</Label>
        <div className="rounded-md border p-3">
          <AddressElement options={{ mode: "billing" }} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment method</Label>
        <div className="rounded-md border p-3">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["us_bank_account", "card"],
            }}
          />
        </div>
      </div>

      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? (
          <>
            <Spinner className="size-4" />
            Saving...
          </>
        ) : (
          "Save payment method"
        )}
      </Button>
    </form>
  );
}

export default function AddPaymentMethodDialog({
  open,
  stripeCustomerId,
  onOpenChange,
  onAdded,
}: AddPaymentMethodDialogProps) {
  const { resolvedTheme } = useTheme();
  const stripePromise = useMemo(() => getStripePromise(), []);
  const stripeAppearance = useMemo<Appearance>(() => {
    if (resolvedTheme === "dark") {
      return { theme: "night" };
    }

    return { theme: "stripe" };
  }, [resolvedTheme]);

  const [creatingSetupIntent, setCreatingSetupIntent] = useState(false);
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!open || setupIntentClientSecret) {
      return;
    }

    let active = true;

    async function initializeSetupIntent() {
      try {
        await stripePromise;

        if (!active) {
          return;
        }

        setCreatingSetupIntent(true);

        const response = await fetch("/api/stripe/setup-intents/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId: stripeCustomerId }),
        });
        const result = await response.json();

        if (!response.ok || !result.clientSecret) {
          throw new Error(result.error || "Failed to initialize setup form.");
        }

        if (!active) {
          return;
        }

        setSetupIntentClientSecret(result.clientSecret);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to initialize payment method setup.",
        );
        onOpenChange(false);
        setSetupIntentClientSecret(null);
      } finally {
        if (active) {
          setCreatingSetupIntent(false);
        }
      }
    }

    void initializeSetupIntent();

    return () => {
      active = false;
    };
  }, [onOpenChange, open, setupIntentClientSecret, stripeCustomerId, stripePromise]);

  function handleDialogOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setSetupIntentClientSecret(null);
    }
  }

  async function handleSuccess() {
    await onAdded();
    setSetupIntentClientSecret(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add payment method</DialogTitle>
          <DialogDescription>
            Card and ACH are supported. Billing address is required.
          </DialogDescription>
        </DialogHeader>

        {creatingSetupIntent ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner className="size-4" />
            Initializing Stripe form...
          </div>
        ) : setupIntentClientSecret ? (
          <Elements
            key={`${setupIntentClientSecret}-${resolvedTheme ?? "light"}`}
            stripe={stripePromise}
            options={{
              clientSecret: setupIntentClientSecret,
              appearance: stripeAppearance,
            }}
          >
            <AddPaymentMethodForm
              clientSecret={setupIntentClientSecret}
              onSuccess={handleSuccess}
            />
          </Elements>
        ) : (
          <p className="text-destructive text-sm">Unable to load Stripe setup form.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
