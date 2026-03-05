"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BadgeAlert,
  BadgeCheck,
  Banknote,
  CreditCard,
  MoreVertical,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPaymentMethodDetails,
  formatPaymentMethodLabel,
  StripePaymentMethodSummary,
  StripeUsBankVerificationSummary,
} from "@/lib/stripe-payment-methods";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import AddPaymentMethodDialog from "@/components/member-portal/finance/AddPaymentMethodDialog";
import VerifyMicrodepositsDialog from "@/components/member-portal/finance/VerifyMicrodepositsDialog";
import ActionConfirmationDialog from "@/components/member-portal/finance/ActionConfirmationDialog";

type ManagePaymentMethodsProps = {
  stripeCustomerId: string;
  selectedPaymentMethodId: string | null;
  onSelectedPaymentMethodChange: (paymentMethodId: string | null) => void;
  onPaymentMethodsChange: (
    paymentMethods: StripePaymentMethodSummary[],
  ) => void;
  allowDelete?: boolean;
  isOpen?: boolean;
  enforceVerifiedSelection?: boolean;
};

function isSelectableForPayment(
  paymentMethod: StripePaymentMethodSummary,
  enforceVerifiedSelection: boolean,
) {
  if (!enforceVerifiedSelection) {
    return true;
  }

  if (paymentMethod.type !== "us_bank_account") {
    return true;
  }

  return paymentMethod.usBankAccount?.verification?.state === "verified";
}

function getDefaultSelectablePaymentMethodId(
  paymentMethods: StripePaymentMethodSummary[],
  enforceVerifiedSelection: boolean,
): string | null {
  const defaultSelectableMethod = paymentMethods.find(
    (paymentMethod) =>
      paymentMethod.isDefault &&
      isSelectableForPayment(paymentMethod, enforceVerifiedSelection),
  );

  if (defaultSelectableMethod) {
    return defaultSelectableMethod.id;
  }

  const firstSelectableMethod = paymentMethods.find((paymentMethod) =>
    isSelectableForPayment(paymentMethod, enforceVerifiedSelection),
  );

  return firstSelectableMethod?.id ?? null;
}

function formatArrivalDate(arrivalDate: number | null): string | null {
  if (!arrivalDate) {
    return null;
  }

  return new Date(arrivalDate * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getVerificationMessage(
  verification: StripeUsBankVerificationSummary | undefined,
): string | null {
  if (!verification) {
    return "Verification status unavailable.";
  }

  switch (verification.state) {
    case "verified":
      return null;
    case "pending_microdeposits": {
      const arrivalDate = formatArrivalDate(verification.arrivalDate);
      if (arrivalDate) {
        return `Micro-deposits should arrive by ${arrivalDate}.`;
      }

      return "Verify the micro-deposit amounts or descriptor code to finish setup.";
    }
    case "processing":
      return "Verification is processing. Check back shortly.";
    case "failed":
      return (
        verification.lastErrorMessage ||
        "Verification failed. Remove and re-add this bank account if needed."
      );
    case "unknown":
    default:
      return "Verification status unavailable.";
  }
}

function PaymentMethodRow({
  paymentMethod,
  isSelected,
  onSelect,
  allowDelete,
  deleting,
  settingDefault,
  onRequestSetDefault,
  onRequestDelete,
  enforceVerifiedSelection,
  onRequestVerify,
}: {
  paymentMethod: StripePaymentMethodSummary;
  isSelected: boolean;
  onSelect: () => void;
  allowDelete: boolean;
  deleting: boolean;
  settingDefault: boolean;
  onRequestSetDefault: () => void;
  onRequestDelete: () => void;
  enforceVerifiedSelection: boolean;
  onRequestVerify: () => void;
}) {
  const verification = paymentMethod.usBankAccount?.verification;
  const showVerifyButton = verification?.state === "pending_microdeposits";
  const blockedForPayment =
    enforceVerifiedSelection &&
    paymentMethod.type === "us_bank_account" &&
    verification?.state !== "verified";
  const canSetAsDefault =
    paymentMethod.type !== "us_bank_account" ||
    verification?.state === "verified";

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-full flex-col gap-2 rounded-md border p-2 sm:flex-row sm:items-start",
        isSelected && !allowDelete ? "bg-secondary" : "bg-background",
      )}
    >
      <button
        type="button"
        className="flex min-w-0 max-w-full flex-1 items-start justify-between gap-3 rounded-md px-2 py-2 text-left"
        onClick={onSelect}
      >
        <div className="flex min-w-0 items-start gap-3">
          {paymentMethod.type === "card" ? (
            <CreditCard className="mt-0.5 size-4 shrink-0" />
          ) : (
            <Banknote className="mt-0.5 size-4 shrink-0" />
          )}
          <div className="min-w-0 space-y-0.5">
            <p className="truncate whitespace-nowrap font-medium">
              {formatPaymentMethodLabel(paymentMethod)}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatPaymentMethodDetails(paymentMethod)}
            </p>
            {paymentMethod.type === "us_bank_account" ? (
              <p className="text-muted-foreground wrap-break-word text-xs">
                {getVerificationMessage(verification)}
                {blockedForPayment
                  ? " Verification required before payment."
                  : ""}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {paymentMethod.type === "us_bank_account" &&
          verification?.state === "verified" ? (
            <Badge variant="secondary">
              <BadgeCheck className="size-3" />
              Verified
            </Badge>
          ) : null}
          {showVerifyButton ? (
            <Badge variant="destructive">
              <BadgeAlert className="size-3" />
              Unverified
            </Badge>
          ) : null}
          {paymentMethod.isDefault ? <Badge>Default</Badge> : null}
        </div>
      </button>

      {/* {showVerifyButton ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          onClick={onRequestVerify}
        >
          Verify deposits
        </Button>
      ) : null} */}

      {allowDelete ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={deleting || settingDefault}
              aria-label="Payment method actions"
            >
              {deleting || settingDefault ? (
                <Spinner className="size-4" />
              ) : (
                <MoreVertical className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="space-y-0.5">
            {showVerifyButton ? (
              <DropdownMenuItem
                onSelect={() => {
                  onRequestVerify();
                }}
              >
                Verify
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={
                  paymentMethod.isDefault ||
                  deleting ||
                  settingDefault ||
                  !canSetAsDefault
                }
                onSelect={() => {
                  onRequestSetDefault();
                }}
              >
                Make default
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              variant="destructive"
              disabled={deleting || settingDefault}
              onSelect={() => {
                onRequestDelete();
              }}
              className="font-bold"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

export default function ManagePaymentMethods({
  stripeCustomerId,
  selectedPaymentMethodId,
  onSelectedPaymentMethodChange,
  onPaymentMethodsChange,
  allowDelete = false,
  isOpen,
  enforceVerifiedSelection = false,
}: ManagePaymentMethodsProps) {
  const shouldLoad = isOpen ?? true;

  const [paymentMethods, setPaymentMethods] = useState<
    StripePaymentMethodSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeletePaymentMethod, setPendingDeletePaymentMethod] =
    useState<StripePaymentMethodSummary | null>(null);
  const [deletingPaymentMethodId, setDeletingPaymentMethodId] = useState<
    string | null
  >(null);
  const [settingDefaultPaymentMethodId, setSettingDefaultPaymentMethodId] =
    useState<string | null>(null);

  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [pendingVerifyPaymentMethod, setPendingVerifyPaymentMethod] =
    useState<StripePaymentMethodSummary | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/stripe/payment-methods?customerId=${stripeCustomerId}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch payment methods.");
      }

      const methods = (result.paymentMethods ||
        []) as StripePaymentMethodSummary[];
      setPaymentMethods(methods);
      onPaymentMethodsChange(methods);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load payment methods.",
      );
      setPaymentMethods([]);
      onPaymentMethodsChange([]);
      onSelectedPaymentMethodChange(null);
    } finally {
      setLoading(false);
    }
  }, [onPaymentMethodsChange, onSelectedPaymentMethodChange, stripeCustomerId]);

  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    void fetchPaymentMethods();
  }, [fetchPaymentMethods, shouldLoad]);

  useEffect(() => {
    const selectedMethod = paymentMethods.find(
      (paymentMethod) => paymentMethod.id === selectedPaymentMethodId,
    );

    if (
      selectedMethod &&
      isSelectableForPayment(selectedMethod, enforceVerifiedSelection)
    ) {
      return;
    }

    const nextSelectablePaymentMethodId = getDefaultSelectablePaymentMethodId(
      paymentMethods,
      enforceVerifiedSelection,
    );

    if (nextSelectablePaymentMethodId !== selectedPaymentMethodId) {
      onSelectedPaymentMethodChange(nextSelectablePaymentMethodId);
    }
  }, [
    enforceVerifiedSelection,
    onSelectedPaymentMethodChange,
    paymentMethods,
    selectedPaymentMethodId,
  ]);

  async function handleSetDefaultPaymentMethod(
    paymentMethod: StripePaymentMethodSummary,
  ) {
    if (paymentMethod.type === "us_bank_account") {
      const verificationState =
        paymentMethod.usBankAccount?.verification?.state;
      if (verificationState !== "verified") {
        toast.error("Verify this bank account before setting it as default.");
        return;
      }
    }

    try {
      setSettingDefaultPaymentMethodId(paymentMethod.id);

      const response = await fetch("/api/stripe/payment-methods/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          paymentMethodId: paymentMethod.id,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to set default payment method.",
        );
      }

      onSelectedPaymentMethodChange(paymentMethod.id);
      toast.success("Default payment method updated.");
      await fetchPaymentMethods();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to set default payment method.",
      );
    } finally {
      setSettingDefaultPaymentMethodId(null);
    }
  }

  async function handleDeletePaymentMethod(paymentMethodId: string) {
    try {
      setDeletingPaymentMethodId(paymentMethodId);

      const response = await fetch("/api/stripe/payment-methods/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId, customerId: stripeCustomerId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete payment method.");
      }

      toast.success("Payment method removed.");
      await fetchPaymentMethods();
      setDeleteDialogOpen(false);
      setPendingDeletePaymentMethod(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete payment method.",
      );
    } finally {
      setDeletingPaymentMethodId(null);
    }
  }

  function handleSelectPaymentMethod(
    paymentMethod: StripePaymentMethodSummary,
  ) {
    if (!isSelectableForPayment(paymentMethod, enforceVerifiedSelection)) {
      toast.error("This bank account must be verified before payment.");
      return;
    }

    onSelectedPaymentMethodChange(paymentMethod.id);
  }

  return (
    <>
      <div className="min-w-0 w-full space-y-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No payment methods yet. Add one to continue.
          </p>
        ) : (
          <div className="min-w-0 w-full space-y-2">
            {paymentMethods.map((paymentMethod) => (
              <PaymentMethodRow
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                isSelected={selectedPaymentMethodId === paymentMethod.id}
                onSelect={() => handleSelectPaymentMethod(paymentMethod)}
                allowDelete={allowDelete}
                deleting={deletingPaymentMethodId === paymentMethod.id}
                settingDefault={
                  settingDefaultPaymentMethodId === paymentMethod.id
                }
                onRequestSetDefault={() => {
                  void handleSetDefaultPaymentMethod(paymentMethod);
                }}
                onRequestDelete={() => {
                  setPendingDeletePaymentMethod(paymentMethod);
                  setDeleteDialogOpen(true);
                }}
                enforceVerifiedSelection={enforceVerifiedSelection}
                onRequestVerify={() => {
                  setPendingVerifyPaymentMethod(paymentMethod);
                  setVerifyDialogOpen(true);
                }}
              />
            ))}
            <button
              type="button"
              onClick={() => setSetupDialogOpen(true)}
              className="flex w-full min-w-0 max-w-full flex-col gap-2 rounded-md border border-dashed p-2 text-left hover:bg-muted/50 sm:flex-row sm:items-start"
            >
              <div className="flex min-w-0 max-w-full flex-1 items-start gap-3 px-2 py-2">
                <Plus className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium">Add another account</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      <AddPaymentMethodDialog
        open={setupDialogOpen}
        stripeCustomerId={stripeCustomerId}
        onOpenChange={setSetupDialogOpen}
        onAdded={async () => {
          toast.success("Payment method saved.");
          await fetchPaymentMethods();
        }}
      />

      <ActionConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(nextOpen) => {
          if (deletingPaymentMethodId) {
            return;
          }

          setDeleteDialogOpen(nextOpen);
          if (!nextOpen) {
            setPendingDeletePaymentMethod(null);
          }
        }}
        title="Delete payment method?"
        description={
          <>
            This removes{" "}
            {pendingDeletePaymentMethod
              ? formatPaymentMethodLabel(pendingDeletePaymentMethod)
              : "the selected payment method"}{" "}
            from your account.
          </>
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        isProcessing={Boolean(deletingPaymentMethodId)}
        processingLabel="Deleting..."
        disableConfirm={!pendingDeletePaymentMethod}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setPendingDeletePaymentMethod(null);
        }}
        onConfirm={async () => {
          if (!pendingDeletePaymentMethod) {
            return;
          }

          await handleDeletePaymentMethod(pendingDeletePaymentMethod.id);
        }}
      />

      <VerifyMicrodepositsDialog
        open={verifyDialogOpen}
        stripeCustomerId={stripeCustomerId}
        paymentMethod={pendingVerifyPaymentMethod}
        onOpenChange={(nextOpen) => {
          setVerifyDialogOpen(nextOpen);
          if (!nextOpen) {
            setPendingVerifyPaymentMethod(null);
          }
        }}
        onVerified={fetchPaymentMethods}
      />
    </>
  );
}
