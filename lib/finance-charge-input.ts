import type { FinanceChargeInput } from "@/lib/finance-types";

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asOptionalPositiveInteger(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function parseRoleAmounts(value: unknown) {
  const output: Record<string, number | null> = {};

  if (!value || typeof value !== "object") return output;

  for (const [key, rawAmount] of Object.entries(value as Record<string, unknown>)) {
    const normalized = asOptionalPositiveInteger(rawAmount);
    output[key] = normalized;
  }

  return output;
}

function parseManualUserAmounts(value: unknown) {
  const output: Record<string, number> = {};

  if (!value || typeof value !== "object") return output;

  for (const [key, rawAmount] of Object.entries(value as Record<string, unknown>)) {
    const normalized = asOptionalPositiveInteger(rawAmount);
    if (normalized) {
      output[key] = normalized;
    }
  }

  return output;
}

function parseIncludeUsers(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];

      const record = item as {
        userId?: unknown;
        amountCents?: unknown;
      };

      if (typeof record.userId !== "string") return [];

      const amountCents = asOptionalPositiveInteger(record.amountCents);

      return [
        {
          userId: record.userId,
          amountCents,
        },
      ];
    })
    .filter((item) => item.userId.length > 0);
}

export function parseFinanceChargeInput(raw: unknown): {
  value?: FinanceChargeInput;
  error?: string;
} {
  if (!raw || typeof raw !== "object") {
    return { error: "Request body must be an object." };
  }

  const body = raw as Record<string, unknown>;

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const dueAt = typeof body.dueAt === "string" && body.dueAt.length > 0 ? body.dueAt : null;
  const defaultAmountCents = asOptionalPositiveInteger(body.defaultAmountCents);

  const includeRoleIds = Array.from(new Set(asStringArray(body.includeRoleIds)));
  const excludeRoleIds = Array.from(new Set(asStringArray(body.excludeRoleIds)));
  const excludeUserIds = Array.from(new Set(asStringArray(body.excludeUserIds)));
  const includeUsers = parseIncludeUsers(body.includeUsers);

  if (
    includeRoleIds.length === 0 &&
    includeUsers.length === 0
  ) {
    return {
      error: "Choose at least one included role or included user.",
    };
  }

  if (!defaultAmountCents) {
    const hasRoleAmount = Object.values(parseRoleAmounts(body.roleAmounts)).some(
      (amount) => Boolean(amount),
    );
    const hasUserAmount = includeUsers.some((item) => Boolean(item.amountCents));

    if (!hasRoleAmount && !hasUserAmount) {
      return {
        error:
          "Provide a default amount or at least one role/user amount override.",
      };
    }
  }

  const value: FinanceChargeInput = {
    title,
    description: description.length > 0 ? description : null,
    dueAt,
    defaultAmountCents,
    includeRoleIds,
    excludeRoleIds,
    includeUsers,
    excludeUserIds,
    roleAmounts: parseRoleAmounts(body.roleAmounts),
    manualUserAmounts: parseManualUserAmounts(body.manualUserAmounts),
  };

  return { value };
}
