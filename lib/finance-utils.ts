import type {
  FinanceAllocationInput,
  FinanceAllocationResult,
  FinanceChargeInput,
  FinanceChargePreviewResult,
  FinanceObligationBalance,
} from "@/lib/finance-types";

type UserRecord = {
  id: string;
  name: string;
  email: string;
};

type UserRoleRow = {
  user_id: string | null;
  role_id: string | null;
};

function normalizePositiveInteger(value: unknown) {
  if (!Number.isInteger(value)) return null;
  const asNumber = Number(value);
  if (asNumber <= 0) return null;
  return asNumber;
}

export function sortObligationsForFifo<
  T extends Pick<FinanceObligationBalance, "due_at" | "created_at">,
>(obligations: T[]) {
  return [...obligations].sort((a, b) => {
    const aDue = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
    const bDue = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;

    if (aDue !== bDue) {
      return aDue - bDue;
    }

    const aCreated = new Date(a.created_at).getTime();
    const bCreated = new Date(b.created_at).getTime();
    return aCreated - bCreated;
  });
}

export function allocateByFifo(params: {
  obligations: Array<Pick<FinanceObligationBalance, "id" | "remaining_cents" | "due_at" | "created_at">>;
  amountCents: number;
}): FinanceAllocationResult[] {
  const amount = normalizePositiveInteger(params.amountCents);
  if (!amount) return [];

  let remainingToAllocate = amount;
  const allocations: FinanceAllocationResult[] = [];

  const sorted = sortObligationsForFifo(params.obligations).filter(
    (obligation) => obligation.remaining_cents > 0,
  );

  for (const obligation of sorted) {
    if (remainingToAllocate <= 0) break;

    const applied = Math.min(obligation.remaining_cents, remainingToAllocate);
    if (applied <= 0) continue;

    allocations.push({
      obligationId: obligation.id,
      amountCents: applied,
    });

    remainingToAllocate -= applied;
  }

  return allocations;
}

export function normalizeManualAllocations(params: {
  allocations: FinanceAllocationInput[];
  obligationById: Map<string, Pick<FinanceObligationBalance, "id" | "remaining_cents">>;
  amountCents: number;
}) {
  const maxAmount = normalizePositiveInteger(params.amountCents);
  if (!maxAmount) return [];

  const normalized: FinanceAllocationResult[] = [];
  let running = 0;

  for (const allocation of params.allocations) {
    if (!allocation || typeof allocation.obligationId !== "string") continue;
    const requested = normalizePositiveInteger(allocation.amountCents);
    if (!requested) continue;

    const obligation = params.obligationById.get(allocation.obligationId);
    if (!obligation || obligation.remaining_cents <= 0) continue;

    const remainingPayment = maxAmount - running;
    if (remainingPayment <= 0) break;

    const cappedAmount = Math.min(requested, obligation.remaining_cents, remainingPayment);
    if (cappedAmount <= 0) continue;

    normalized.push({
      obligationId: allocation.obligationId,
      amountCents: cappedAmount,
    });

    running += cappedAmount;
  }

  return normalized;
}

export function getAllocationsTotal(allocations: FinanceAllocationResult[]) {
  return allocations.reduce((sum, allocation) => sum + allocation.amountCents, 0);
}

export function resolveChargeRecipients(params: {
  input: FinanceChargeInput;
  usersById: Map<string, UserRecord>;
  userRoles: UserRoleRow[];
}): FinanceChargePreviewResult {
  const { input, usersById, userRoles } = params;

  const includeRoleIds = new Set(input.includeRoleIds);
  const excludeRoleIds = new Set(input.excludeRoleIds);
  const excludeUserIds = new Set(input.excludeUserIds);

  const includeUserAmountById = new Map<string, number>();
  for (const includeUser of input.includeUsers) {
    const normalizedAmount = normalizePositiveInteger(includeUser.amountCents);
    if (normalizedAmount) {
      includeUserAmountById.set(includeUser.userId, normalizedAmount);
    }
  }

  const manualUserAmountById = new Map<string, number>();
  for (const [userId, amount] of Object.entries(input.manualUserAmounts ?? {})) {
    const normalizedAmount = normalizePositiveInteger(amount);
    if (normalizedAmount) {
      manualUserAmountById.set(userId, normalizedAmount);
    }
  }

  const roleAmountById = new Map<string, number>();
  for (const [roleId, amount] of Object.entries(input.roleAmounts ?? {})) {
    const normalizedAmount = normalizePositiveInteger(amount);
    if (normalizedAmount) {
      roleAmountById.set(roleId, normalizedAmount);
    }
  }

  const userIdsByRoleId = new Map<string, Set<string>>();
  const roleIdsByUserId = new Map<string, Set<string>>();

  for (const row of userRoles) {
    if (!row.role_id || !row.user_id) continue;

    const roleUsers = userIdsByRoleId.get(row.role_id) ?? new Set<string>();
    roleUsers.add(row.user_id);
    userIdsByRoleId.set(row.role_id, roleUsers);

    const userRolesSet = roleIdsByUserId.get(row.user_id) ?? new Set<string>();
    userRolesSet.add(row.role_id);
    roleIdsByUserId.set(row.user_id, userRolesSet);
  }

  const recipientUserIds = new Set<string>();

  for (const includeUser of input.includeUsers) {
    if (usersById.has(includeUser.userId)) {
      recipientUserIds.add(includeUser.userId);
    }
  }

  for (const roleId of includeRoleIds) {
    const members = userIdsByRoleId.get(roleId);
    if (!members) continue;

    for (const userId of members) {
      if (usersById.has(userId)) {
        recipientUserIds.add(userId);
      }
    }
  }

  for (const userId of Array.from(recipientUserIds)) {
    if (excludeUserIds.has(userId)) {
      recipientUserIds.delete(userId);
      continue;
    }

    const userRoleIds = roleIdsByUserId.get(userId);
    if (!userRoleIds) continue;

    const excludedByRole = Array.from(userRoleIds).some((roleId) =>
      excludeRoleIds.has(roleId),
    );

    if (excludedByRole) {
      recipientUserIds.delete(userId);
    }
  }

  const conflicts: FinanceChargePreviewResult["conflicts"] = [];
  const missingAmountUserIds: string[] = [];
  const recipients: FinanceChargePreviewResult["recipients"] = [];

  const defaultAmount = normalizePositiveInteger(input.defaultAmountCents);

  for (const userId of Array.from(recipientUserIds)) {
    const manualAmount = manualUserAmountById.get(userId);
    const includeUserAmount = includeUserAmountById.get(userId);

    if (manualAmount) {
      recipients.push({
        userId,
        amountCents: manualAmount,
        source: "user_override",
      });
      continue;
    }

    if (includeUserAmount) {
      recipients.push({
        userId,
        amountCents: includeUserAmount,
        source: "user_override",
      });
      continue;
    }

    const userRoleIds = roleIdsByUserId.get(userId) ?? new Set<string>();
    const matchedRoleAmounts = Array.from(userRoleIds)
      .filter((roleId) => includeRoleIds.has(roleId))
      .flatMap((roleId) => {
        const amount = roleAmountById.get(roleId);
        return amount ? [{ roleId, amountCents: amount }] : [];
      });

    const distinctRoleAmounts = Array.from(
      new Set(matchedRoleAmounts.map((item) => item.amountCents)),
    );

    if (distinctRoleAmounts.length > 1) {
      conflicts.push({
        userId,
        roleAmounts: matchedRoleAmounts,
      });
      continue;
    }

    if (matchedRoleAmounts.length > 0) {
      recipients.push({
        userId,
        amountCents: matchedRoleAmounts[0].amountCents,
        source: "role",
      });
      continue;
    }

    if (defaultAmount) {
      recipients.push({
        userId,
        amountCents: defaultAmount,
        source: "default",
      });
      continue;
    }

    missingAmountUserIds.push(userId);
  }

  recipients.sort((a, b) => a.userId.localeCompare(b.userId));
  conflicts.sort((a, b) => a.userId.localeCompare(b.userId));
  missingAmountUserIds.sort((a, b) => a.localeCompare(b));

  return {
    recipients,
    conflicts,
    missingAmountUserIds,
  };
}
