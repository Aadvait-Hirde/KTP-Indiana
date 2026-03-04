import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export enum TransactionType {
  CHARGE = "Charge",
  PAYMENT = "Payment",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface Transaction {
  id: string;
  created_at: string;
  customer_id: string;
  name: string;
  description: string | null;
  type: TransactionType;
  stripe_intent_id: string | null;
  amount: number;
  status: TransactionStatus;
  due_date: Date | null;
}

export default function Ledger({
  ledger,
  loadingLedger,
}: {
  ledger: Transaction[];
  loadingLedger: boolean;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex-1 overflow-auto">
          {loadingLedger ? (
            <p>Loading ledger...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString(
                        "en-US",
                      )}
                    </TableCell>
                    <TableCell>{transaction.name}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.substring(1)}
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === TransactionType.CHARGE
                          ? "text-red-500"
                          : ""
                      }
                    >
                      ${(transaction.amount / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
