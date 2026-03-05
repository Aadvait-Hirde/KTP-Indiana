import { NextRequest, NextResponse } from "next/server";
import {
  assertFinanceEditPermission,
  requireAppAuthContext,
  RouteAuthError,
} from "@/lib/server-auth";
import { parseFinanceChargeInput } from "@/lib/finance-charge-input";
import {
  loadAllBasicRoles,
  loadAllBasicUsers,
  loadUserRoleRows,
} from "@/lib/finance-server";
import { resolveChargeRecipients } from "@/lib/finance-utils";

export async function POST(req: NextRequest) {
  try {
    const context = await requireAppAuthContext();
    assertFinanceEditPermission(context);

    const rawBody = await req.json();
    const parsed = parseFinanceChargeInput(rawBody);
    if (!parsed.value) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const [users, roles, userRoles] = await Promise.all([
      loadAllBasicUsers(),
      loadAllBasicRoles(),
      loadUserRoleRows(),
    ]);

    const usersById = new Map(users.map((user) => [user.id, user]));
    const rolesById = new Map(roles.map((role) => [role.id, role]));

    const preview = resolveChargeRecipients({
      input: parsed.value,
      usersById,
      userRoles,
    });

    const resolvedRecipients = preview.recipients.map((recipient) => {
      const user = usersById.get(recipient.userId);
      return {
        userId: recipient.userId,
        name: user?.name ?? "Unknown User",
        email: user?.email ?? "",
        amountCents: recipient.amountCents,
        source: recipient.source,
      };
    });

    const conflicts = preview.conflicts.map((conflict) => {
      const user = usersById.get(conflict.userId);
      return {
        userId: conflict.userId,
        name: user?.name ?? "Unknown User",
        email: user?.email ?? "",
        roleAmounts: conflict.roleAmounts.map((entry) => ({
          roleId: entry.roleId,
          roleName: rolesById.get(entry.roleId)?.name ?? "Unknown Role",
          amountCents: entry.amountCents,
        })),
      };
    });

    const missingAmounts = preview.missingAmountUserIds.map((userId) => {
      const user = usersById.get(userId);
      return {
        userId,
        name: user?.name ?? "Unknown User",
        email: user?.email ?? "",
      };
    });

    return NextResponse.json(
      {
        recipients: resolvedRecipients,
        conflicts,
        missingAmounts,
        recipientCount: resolvedRecipients.length,
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
            : "Failed to preview finance charge recipients.",
      },
      { status: 500 },
    );
  }
}
