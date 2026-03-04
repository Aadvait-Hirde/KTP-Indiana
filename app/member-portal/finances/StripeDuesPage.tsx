"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/auth-store";
import BalanceBar from "@/components/member-portal/finance/BalanceBar";
import ManagePaymentMethods from "@/components/member-portal/finance/ManagePaymentMethods";
import Ledger, {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/components/member-portal/finance/Ledger";
import {
  formatPaymentMethodLabel,
  StripePaymentMethodSummary,
} from "@/lib/stripe-payment-methods";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

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
  const { user: appUser, isLoading: isAuthLoading } = useAuthStore();
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [databaseCustomerId, setDatabaseCustomerId] = useState<string | null>(
    null,
  );
  const [ledger, setLedger] = useState<Transaction[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<
    StripePaymentMethodSummary[]
  >([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null
  >(null);
  const [payingBalance, setPayingBalance] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchStripeCustomerId() {
      if (isAuthLoading) {
        return;
      }

      if (!appUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("customers")
          .select("*")
          .eq("user_id", appUser.id)
          .maybeSingle();

        if (fetchError) {
          setError(fetchError.message || "Failed to fetch Stripe customer.");
          setStripeCustomerId(null);
          setDatabaseCustomerId(null);
          return;
        }

        const stripeId = data?.stripe_id ?? null;
        if (stripeId) {
          // Validate the Stripe customer ID by calling a serverless API route
          const res = await fetch(
            `/api/stripe/customer/validate?id=${stripeId}`,
          );
          const result = await res.json();
          if (!res.ok || !result.valid) {
            // Delete the invalid row from the database
            await supabase.from("customers").delete().eq("user_id", appUser.id);
            setStripeCustomerId(null);
            setDatabaseCustomerId(null);
            return;
          }
        }
        setStripeCustomerId(stripeId);
        setDatabaseCustomerId(data?.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStripeCustomerId(null);
        setDatabaseCustomerId(null);
      } finally {
        setLoading(false);
      }
    }

    fetchStripeCustomerId();
  }, [appUser?.id, isAuthLoading]);

  const fetchLedger = useCallback(async () => {
    if (!databaseCustomerId) {
      setLedger([]);
      setLoadingLedger(false);
      return;
    }

    try {
      setLoadingLedger(true);
      const { data, error: ledgerError } = await supabase
        .from("transactions")
        .select("*")
        .eq("customer_id", databaseCustomerId)
        .order("created_at", { ascending: false });

      if (ledgerError) {
        throw ledgerError;
      }

      setLedger((data as Transaction[]) ?? []);
    } catch (err) {
      console.error("Failed to load ledger:", err);
      setLedger([]);
    } finally {
      setLoadingLedger(false);
    }
  }, [databaseCustomerId]);

  useEffect(() => {
    void fetchLedger();
  }, [fetchLedger]);

  const selectedPaymentMethod = useMemo(() => {
    if (!selectedPaymentMethodId) {
      return null;
    }

    return (
      paymentMethods.find((method) => method.id === selectedPaymentMethodId) ??
      null
    );
  }, [paymentMethods, selectedPaymentMethodId]);

  const balanceCents = useMemo(() => {
    return ledger.reduce((sum, transaction) => {
      if (transaction.type === TransactionType.CHARGE) {
        return sum + transaction.amount;
      }

      if (transaction.type === TransactionType.PAYMENT) {
        if (
          transaction.status === TransactionStatus.FAILED ||
          transaction.status === TransactionStatus.REFUNDED
        ) {
          return sum;
        }

        return sum - transaction.amount;
      }

      return sum;
    }, 0);
  }, [ledger]);

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

  async function handlePayBalance() {
    if (!stripeCustomerId) {
      toast.error("Stripe customer is not set up.");
      return;
    }

    if (!databaseCustomerId) {
      toast.error("Database customer record is missing.");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Select a payment method before paying.");
      return;
    }

    if (
      selectedPaymentMethod.type === "us_bank_account" &&
      selectedPaymentMethod.usBankAccount?.verification?.state !== "verified"
    ) {
      toast.error("This bank account must be verified before payment.");
      return;
    }

    if (balanceCents <= 0) {
      return;
    }

    try {
      setPayingBalance(true);

      const paymentResponse = await fetch("/api/stripe/payment-intents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          databaseCustomerId,
          paymentMethodId: selectedPaymentMethod.id,
          paymentMethodLabel: formatPaymentMethodLabel(selectedPaymentMethod),
          amount: balanceCents,
        }),
      });
      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.id) {
        throw new Error(paymentResult.error || "Failed to submit payment.");
      }

      const paymentStatus = paymentResult.status as string | undefined;
      if (
        paymentStatus &&
        !["processing", "succeeded", "requires_capture"].includes(paymentStatus)
      ) {
        throw new Error(
          `Payment requires additional steps (status: ${paymentStatus}).`,
        );
      }

      const insertedTransaction =
        (paymentResult.transaction as Transaction | undefined) ?? null;

      if (
        insertedTransaction &&
        insertedTransaction.stripe_intent_id === paymentResult.id
      ) {
        setLedger((current) => [insertedTransaction, ...current]);
      } else {
        await fetchLedger();
      }

      setPayDialogOpen(false);
      toast.success(
        "Payment submitted. Status is pending until Stripe finalizes it.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message);
    } finally {
      setPayingBalance(false);
    }
  }

  async function handleEnablePortal() {
    if (!appUser?.id) {
      setError("No user found for your account.");
      return;
    }

    try {
      setCreatingCustomer(true);
      setError(null);

      // Call API route to create Stripe customer on the server
      const response = await fetch("/api/stripe/customer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: appUser.name, email: appUser.email }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to create customer");

      const customerId = result.id;

      const { data, error } = await supabase
        .from("customers")
        .upsert({ user_id: appUser.id, stripe_id: customerId })
        .select();

      if (error) throw error;

      setStripeCustomerId(customerId);
      setDatabaseCustomerId(data?.[0]?.id ?? null);
      setPaymentMethods([]);
      setSelectedPaymentMethodId(null);
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
    <div className="flex items-center justify-center h-full">
      {stripeCustomerId ? (
        <div className="w-full h-full flex flex-col gap-5">
          <div className="flex-none">
            <BalanceBar
              balanceCents={balanceCents}
              payingBalance={payingBalance}
              onPayBalanceClick={() => setPayDialogOpen(true)}
              onManagePaymentMethodsClick={() => setManageDialogOpen(true)}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <Ledger ledger={ledger} loadingLedger={loadingLedger} />
          </div>

          <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Pay balance</DialogTitle>
                <DialogDescription>
                  Select a saved payment method or add a new one to pay $
                  {(balanceCents / 100).toFixed(2)}.
                </DialogDescription>
              </DialogHeader>

              <ManagePaymentMethods
                stripeCustomerId={stripeCustomerId}
                selectedPaymentMethodId={selectedPaymentMethodId}
                onSelectedPaymentMethodChange={setSelectedPaymentMethodId}
                onPaymentMethodsChange={setPaymentMethods}
                isOpen={payDialogOpen}
                enforceVerifiedSelection
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPayDialogOpen(false)}
                  disabled={payingBalance}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    void handlePayBalance();
                  }}
                  disabled={
                    payingBalance || balanceCents <= 0 || !selectedPaymentMethodId
                  }
                >
                  {payingBalance ? (
                    <>
                      <Spinner className="size-4" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${(balanceCents / 100).toFixed(2)}`
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Manage payment methods</DialogTitle>
                <DialogDescription>
                  Add a new card or ACH account, or remove an existing payment
                  method.
                </DialogDescription>
              </DialogHeader>

              <ManagePaymentMethods
                stripeCustomerId={stripeCustomerId}
                selectedPaymentMethodId={selectedPaymentMethodId}
                onSelectedPaymentMethodChange={setSelectedPaymentMethodId}
                onPaymentMethodsChange={setPaymentMethods}
                allowDelete
                isOpen={manageDialogOpen}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <FinanceNotSetup
            onEnablePortal={handleEnablePortal}
            creatingCustomer={creatingCustomer}
          />
        </div>
      )}
    </div>
  );
}
