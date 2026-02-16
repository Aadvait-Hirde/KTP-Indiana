import { stripeFinanceFlag } from "@/lib/flags";
import OGDuesPage from "./OGDuesPage";
import StripeDuesPage from "./StripeDuesPage";

export default async function DuesPage() {
  const useStripe = await stripeFinanceFlag();

  return <>{useStripe ? <StripeDuesPage /> : <OGDuesPage />}</>;
}
