import { CreditCard, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type BalanceBarProps = {
  balanceCents: number;
  payingBalance: boolean;
  onPayBalanceClick: () => void;
  onManagePaymentMethodsClick: () => void;
};

export default function BalanceBar({
  balanceCents,
  payingBalance,
  onPayBalanceClick,
  onManagePaymentMethodsClick,
}: BalanceBarProps) {
  const balance = balanceCents / 100;
  const payDisabled = balanceCents <= 0 || payingBalance;

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
                : 'Click "pay balance" to make a payment.'}
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
