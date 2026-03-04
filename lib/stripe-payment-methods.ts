export type StripePaymentMethodType = "card" | "us_bank_account";
export type StripeUsBankVerificationState =
  | "verified"
  | "pending_microdeposits"
  | "processing"
  | "failed"
  | "unknown";

export interface StripeUsBankVerificationSummary {
  state: StripeUsBankVerificationState;
  setupIntentId: string | null;
  arrivalDate: number | null;
  microdepositType: "amounts" | "descriptor_code" | null;
  hostedVerificationUrl: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
}

export interface StripePaymentMethodSummary {
  id: string;
  type: StripePaymentMethodType;
  isDefault: boolean;
  created: number;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  usBankAccount?: {
    bankName: string | null;
    last4: string;
    accountType: string | null;
    verification?: StripeUsBankVerificationSummary;
  };
}

export function formatPaymentMethodLabel(
  paymentMethod: StripePaymentMethodSummary,
): string {
  if (paymentMethod.type === "card" && paymentMethod.card) {
    return `${paymentMethod.card.brand.toUpperCase()} •••• ${paymentMethod.card.last4}`;
  }

  if (paymentMethod.type === "us_bank_account" && paymentMethod.usBankAccount) {
    return `${paymentMethod.usBankAccount.bankName ?? "Bank account"} •••• ${paymentMethod.usBankAccount.last4}`;
  }

  return paymentMethod.id;
}

export function formatPaymentMethodDetails(
  paymentMethod: StripePaymentMethodSummary,
): string {
  if (paymentMethod.type === "card" && paymentMethod.card) {
    const month = String(paymentMethod.card.expMonth).padStart(2, "0");
    return `Expires ${month}/${paymentMethod.card.expYear}`;
  }

  if (paymentMethod.type === "us_bank_account" && paymentMethod.usBankAccount) {
    if (paymentMethod.usBankAccount.accountType) {
      return paymentMethod.usBankAccount.accountType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return "US bank account";
  }

  return "Saved payment method";
}
