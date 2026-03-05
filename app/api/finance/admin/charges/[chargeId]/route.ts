import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  assertFinanceViewPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import {
  loadAllBasicRoles,
  loadBasicUsersByIds,
  loadObligationBalancesForCharge,
} from "@/lib/finance-server";

type ChargeTargetRoleRow = {
  role_id: string | null;
  amount_cents?: number | null;
};

type ChargeTargetUserRow = {
  user_id: string | null;
  amount_cents?: number | null;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ chargeId: string }> },
) {
  try {
    const authContext = await requireAppAuthContext();
    assertFinanceViewPermission(authContext);

    const { chargeId } = await context.params;

    const [chargeRes, obligations, roles, includeRolesRes, excludeRolesRes, includeUsersRes, excludeUsersRes] =
      await Promise.all([
        supabase
          .from("finance_charges")
          .select("id, title, description, due_at, default_amount_cents, currency, created_at")
          .eq("id", chargeId)
          .maybeSingle(),
        loadObligationBalancesForCharge(chargeId),
        loadAllBasicRoles(),
        supabase
          .from("finance_charge_include_roles")
          .select("role_id, amount_cents")
          .eq("charge_id", chargeId),
        supabase
          .from("finance_charge_exclude_roles")
          .select("role_id")
          .eq("charge_id", chargeId),
        supabase
          .from("finance_charge_include_users")
          .select("user_id, amount_cents")
          .eq("charge_id", chargeId),
        supabase
          .from("finance_charge_exclude_users")
          .select("user_id")
          .eq("charge_id", chargeId),
      ]);

    if (chargeRes.error) throw chargeRes.error;
    if (includeRolesRes.error) throw includeRolesRes.error;
    if (excludeRolesRes.error) throw excludeRolesRes.error;
    if (includeUsersRes.error) throw includeUsersRes.error;
    if (excludeUsersRes.error) throw excludeUsersRes.error;

    if (!chargeRes.data || typeof chargeRes.data.id !== "string") {
      return NextResponse.json({ error: "Charge not found." }, { status: 404 });
    }

    const roleNameById = new Map(roles.map((role) => [role.id, role.name]));

    const allUserIds = new Set<string>([
      ...obligations.map((item) => item.user_id),
      ...((includeUsersRes.data ?? []) as ChargeTargetUserRow[])
        .flatMap((item) => (item.user_id ? [item.user_id] : [])),
      ...((excludeUsersRes.data ?? []) as ChargeTargetUserRow[])
        .flatMap((item) => (item.user_id ? [item.user_id] : [])),
    ]);

    const usersById = await loadBasicUsersByIds(Array.from(allUserIds));

    const recipients = obligations.map((obligation) => {
      const user = usersById.get(obligation.user_id);
      return {
        obligationId: obligation.id,
        userId: obligation.user_id,
        name: user?.name ?? "Unknown User",
        email: user?.email ?? "",
        amountCents: obligation.amount_cents,
        paidCents: obligation.paid_cents,
        remainingCents: obligation.remaining_cents,
        paymentState: obligation.payment_state,
        isOverdue: obligation.is_overdue,
        dueAt: obligation.due_at,
      };
    });

    const includeRoles = ((includeRolesRes.data ?? []) as ChargeTargetRoleRow[])
      .filter((row) => typeof row.role_id === "string")
      .map((row) => ({
        roleId: row.role_id as string,
        roleName: roleNameById.get(row.role_id as string) ?? "Unknown Role",
        amountCents: typeof row.amount_cents === "number" ? row.amount_cents : null,
      }));

    const excludeRoles = ((excludeRolesRes.data ?? []) as ChargeTargetRoleRow[])
      .filter((row) => typeof row.role_id === "string")
      .map((row) => ({
        roleId: row.role_id as string,
        roleName: roleNameById.get(row.role_id as string) ?? "Unknown Role",
      }));

    const includeUsers = ((includeUsersRes.data ?? []) as ChargeTargetUserRow[])
      .filter((row) => typeof row.user_id === "string")
      .map((row) => {
        const user = usersById.get(row.user_id as string);
        return {
          userId: row.user_id as string,
          name: user?.name ?? "Unknown User",
          email: user?.email ?? "",
          amountCents: typeof row.amount_cents === "number" ? row.amount_cents : null,
        };
      });

    const excludeUsers = ((excludeUsersRes.data ?? []) as ChargeTargetUserRow[])
      .filter((row) => typeof row.user_id === "string")
      .map((row) => {
        const user = usersById.get(row.user_id as string);
        return {
          userId: row.user_id as string,
          name: user?.name ?? "Unknown User",
          email: user?.email ?? "",
        };
      });

    const charge = {
      id: chargeRes.data.id,
      title: chargeRes.data.title,
      description:
        typeof chargeRes.data.description === "string"
          ? chargeRes.data.description
          : null,
      dueAt: typeof chargeRes.data.due_at === "string" ? chargeRes.data.due_at : null,
      defaultAmountCents:
        typeof chargeRes.data.default_amount_cents === "number"
          ? chargeRes.data.default_amount_cents
          : null,
      currency:
        typeof chargeRes.data.currency === "string" ? chargeRes.data.currency : "usd",
      createdAt:
        typeof chargeRes.data.created_at === "string" ? chargeRes.data.created_at : null,
    };

    return NextResponse.json(
      {
        charge,
        targets: {
          includeRoles,
          excludeRoles,
          includeUsers,
          excludeUsers,
        },
        recipients,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof RouteAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load finance charge details.",
      },
      { status: 500 },
    );
  }
}
