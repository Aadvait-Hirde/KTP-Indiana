import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

export const stripeFinanceFlag = flag({
  key: "stripe-payments",
  adapter: vercelAdapter(),
});
