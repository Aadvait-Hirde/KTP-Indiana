import { CreditCard, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BalanceBarObligation = {
  remaining_cents: number;
  due_at: string | null;
  is_overdue: boolean;
};

type BalanceBarProps = {
  balanceCents: number;
  payingBalance: boolean;
  obligations?: BalanceBarObligation[];
  onPayBalanceClick: () => void;
  onManagePaymentMethodsClick: () => void;
};

function formatDate(date: string | null): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

function getNextDueInfo(
  obligations: BalanceBarObligation[] = [],
): { date: string; amountCents: number } | null {
  const unpaidWithDueDate = obligations
    .filter((o) => o.remaining_cents > 0 && o.due_at)
    .sort(
      (a, b) =>
        (new Date(a.due_at!).getTime() || 0) -
        (new Date(b.due_at!).getTime() || 0),
    );

  if (unpaidWithDueDate.length === 0) return null;

  const nextDueDate = unpaidWithDueDate[0].due_at!;
  const amountDueOnDate = unpaidWithDueDate
    .filter((o) => o.due_at === nextDueDate)
    .reduce((sum, o) => sum + o.remaining_cents, 0);

  return {
    date: formatDate(nextDueDate),
    amountCents: amountDueOnDate,
  };
}

export default function BalanceBar({
  balanceCents,
  payingBalance,
  obligations = [],
  onPayBalanceClick,
  onManagePaymentMethodsClick,
}: BalanceBarProps) {
  const balance = balanceCents / 100;
  const payDisabled = balanceCents <= 0 || payingBalance;
  const nextDueInfo = getNextDueInfo(obligations);
  const nextDueAmount = nextDueInfo
    ? `$${(nextDueInfo.amountCents / 100).toFixed(2)}`
    : "$0.00";
  const nextDueDate = nextDueInfo?.date ?? "";

  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col space-y-1">
            <h1 className="font-bold text-xl">Balance</h1>
            <span className="text-4xl">${balance.toFixed(2)}</span>
            <p className="text-muted-foreground text-sm">
              {balance <= 0
                ? "No payment is currently due."
                : nextDueInfo
                  ? `You have a ${nextDueAmount} payment due on ${nextDueDate}.`
                  : 'Select "Pay Balance" to make a full or partial payment.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="lg"
              disabled={payDisabled}
              onClick={onPayBalanceClick}
            >
              Pay Balance
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10"
                  aria-label="Payment options"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onManagePaymentMethodsClick();
                  }}
                >
                  <CreditCard /> Payment Methods
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
