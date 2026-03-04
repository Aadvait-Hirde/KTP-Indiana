"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  formatPaymentMethodLabel,
  StripePaymentMethodSummary,
} from "@/lib/stripe-payment-methods";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type VerifyInputMode = "amounts" | "descriptor_code";

type VerifyMicrodepositsDialogProps = {
  open: boolean;
  stripeCustomerId: string;
  paymentMethod: StripePaymentMethodSummary | null;
  onOpenChange: (open: boolean) => void;
  onVerified: () => Promise<void>;
};

export default function VerifyMicrodepositsDialog({
  open,
  stripeCustomerId,
  paymentMethod,
  onOpenChange,
  onVerified,
}: VerifyMicrodepositsDialogProps) {
  const [verifyInputMode, setVerifyInputMode] = useState<VerifyInputMode>(
    "amounts",
  );
  const [verifyAmountOne, setVerifyAmountOne] = useState("");
  const [verifyAmountTwo, setVerifyAmountTwo] = useState("");
  const [verifyDescriptorCode, setVerifyDescriptorCode] = useState("");
  const [verifyingDeposits, setVerifyingDeposits] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setVerifyInputMode("amounts");
    setVerifyAmountOne("");
    setVerifyAmountTwo("");
    setVerifyDescriptorCode("");
  }, [open, paymentMethod?.id]);

  async function handleVerifyMicrodeposits() {
    if (!paymentMethod) {
      return;
    }

    try {
      setVerifyingDeposits(true);

      let payload: {
        customerId: string;
        paymentMethodId: string;
        amounts?: [number, number];
        descriptorCode?: string;
      } = {
        customerId: stripeCustomerId,
        paymentMethodId: paymentMethod.id,
      };

      if (verifyInputMode === "amounts") {
        const amountOne = Number(verifyAmountOne);
        const amountTwo = Number(verifyAmountTwo);

        if (
          !Number.isInteger(amountOne) ||
          !Number.isInteger(amountTwo) ||
          amountOne <= 0 ||
          amountTwo <= 0
        ) {
          throw new Error("Enter both micro-deposit amounts as positive cents.");
        }

        payload = {
          ...payload,
          amounts: [amountOne, amountTwo],
        };
      } else {
        const normalizedCode = verifyDescriptorCode.trim().toUpperCase();
        if (!/^SM[A-Z0-9]{4}$/.test(normalizedCode)) {
          throw new Error(
            "Descriptor code must be six characters and start with SM.",
          );
        }

        payload = {
          ...payload,
          descriptorCode: normalizedCode,
        };
      }

      const response = await fetch("/api/stripe/setup-intents/verify-microdeposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to verify micro-deposits.");
      }

      const setupIntentStatus = result.setupIntent?.status as string | undefined;
      if (setupIntentStatus === "succeeded") {
        toast.success("Bank account verified successfully.");
      } else if (setupIntentStatus === "processing") {
        toast.success("Verification submitted. Stripe is processing it.");
      } else {
        toast.success("Verification submitted.");
      }

      await onVerified();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to verify micro-deposits.",
      );
    } finally {
      setVerifyingDeposits(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (verifyingDeposits) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Verify micro-deposits</DialogTitle>
          <DialogDescription>
            Confirm the two deposit amounts or the descriptor code for{" "}
            {paymentMethod
              ? formatPaymentMethodLabel(paymentMethod)
              : "your bank account"}
            .
          </DialogDescription>
        </DialogHeader>

        {paymentMethod?.usBankAccount?.verification?.hostedVerificationUrl ? (
          <p className="text-muted-foreground text-xs">
            You can also verify on Stripe&apos;s hosted page:{" "}
            <a
              href={paymentMethod.usBankAccount.verification.hostedVerificationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              Open hosted verification
            </a>
          </p>
        ) : null}

        <Tabs
          value={verifyInputMode}
          onValueChange={(value) => setVerifyInputMode(value as VerifyInputMode)}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="amounts">Amounts</TabsTrigger>
            <TabsTrigger value="descriptor_code">Descriptor code</TabsTrigger>
          </TabsList>

          <TabsContent value="amounts" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="microdeposit-amount-one">Amount 1 (cents)</Label>
                <Input
                  id="microdeposit-amount-one"
                  inputMode="numeric"
                  value={verifyAmountOne}
                  onChange={(event) => setVerifyAmountOne(event.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="microdeposit-amount-two">Amount 2 (cents)</Label>
                <Input
                  id="microdeposit-amount-two"
                  inputMode="numeric"
                  value={verifyAmountTwo}
                  onChange={(event) => setVerifyAmountTwo(event.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="descriptor_code" className="space-y-1">
            <Label htmlFor="microdeposit-descriptor-code">Descriptor code</Label>
            <Input
              id="microdeposit-descriptor-code"
              placeholder="SM11AA"
              value={verifyDescriptorCode}
              onChange={(event) => setVerifyDescriptorCode(event.target.value)}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={verifyingDeposits}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!paymentMethod || verifyingDeposits}
            onClick={() => {
              void handleVerifyMicrodeposits();
            }}
          >
            {verifyingDeposits ? (
              <>
                <Spinner className="size-4" />
                Verifying...
              </>
            ) : (
              "Submit verification"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
