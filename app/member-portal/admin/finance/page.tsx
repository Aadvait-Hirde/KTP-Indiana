"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import {
  canEditFinanceAdmin,
  canViewFinanceAdmin,
} from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FinanceMember = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  roleIds: string[];
  roleNames: string[];
  financeEnabled: boolean;
  outstandingCents: number;
  overdueCount: number;
};

type FinanceRole = {
  id: string;
  name: string;
};

type ChargeSummary = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  defaultAmountCents: number | null;
  currency: string;
  createdAt: string | null;
  totalAssigned: number;
  unpaidCount: number;
  overdueCount: number;
  outstandingCents: number;
};

type PaymentSummary = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  source: string;
  status: string;
  amountCents: number;
  allocatedCents: number;
  createdAt: string;
  notes: string | null;
};

type ChargePreview = {
  recipients: Array<{
    userId: string;
    name: string;
    email: string;
    amountCents: number;
    source: string;
  }>;
  conflicts: Array<{
    userId: string;
    name: string;
    email: string;
    roleAmounts: Array<{
      roleId: string;
      roleName: string;
      amountCents: number;
    }>;
  }>;
  missingAmounts: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
  recipientCount: number;
};

type ChargeDetail = {
  charge: {
    id: string;
    title: string;
    description: string | null;
    dueAt: string | null;
    defaultAmountCents: number | null;
    currency: string;
    createdAt: string | null;
  };
  targets: {
    includeRoles: Array<{ roleId: string; roleName: string; amountCents: number | null }>;
    excludeRoles: Array<{ roleId: string; roleName: string }>;
    includeUsers: Array<{ userId: string; name: string; email: string; amountCents: number | null }>;
    excludeUsers: Array<{ userId: string; name: string; email: string }>;
  };
  recipients: Array<{
    obligationId: string;
    userId: string;
    name: string;
    email: string;
    amountCents: number;
    paidCents: number;
    remainingCents: number;
    paymentState: string;
    isOverdue: boolean;
    dueAt: string | null;
  }>;
};

function formatCents(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function parseDollarsToCents(input: string) {
  if (!input.trim()) return null;
  const normalized = Number(input);
  if (!Number.isFinite(normalized) || normalized <= 0) return null;
  return Math.round(normalized * 100);
}

function formatDate(dateValue: string | null) {
  if (!dateValue) return "-";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-US");
}

export default function AdminFinancePage() {
  const { permissions } = useAuthStore();

  const canView = canViewFinanceAdmin(permissions);
  const canEdit = canEditFinanceAdmin(permissions);

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FinanceMember[]>([]);
  const [roles, setRoles] = useState<FinanceRole[]>([]);
  const [charges, setCharges] = useState<ChargeSummary[]>([]);
  const [payments, setPayments] = useState<PaymentSummary[]>([]);

  const [enablingMemberId, setEnablingMemberId] = useState<string | null>(null);
  const [creatingCharge, setCreatingCharge] = useState(false);
  const [previewingCharge, setPreviewingCharge] = useState(false);
  const [chargePreview, setChargePreview] = useState<ChargePreview | null>(null);

  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);
  const [selectedChargeDetail, setSelectedChargeDetail] =
    useState<ChargeDetail | null>(null);
  const [loadingChargeDetail, setLoadingChargeDetail] = useState(false);

  const [recordingManualPayment, setRecordingManualPayment] = useState(false);

  const [chargeTitle, setChargeTitle] = useState("");
  const [chargeDescription, setChargeDescription] = useState("");
  const [chargeDueAt, setChargeDueAt] = useState("");
  const [defaultAmountInput, setDefaultAmountInput] = useState("");

  const [includedRoleIds, setIncludedRoleIds] = useState<string[]>([]);
  const [excludedRoleIds, setExcludedRoleIds] = useState<string[]>([]);
  const [roleAmountById, setRoleAmountById] = useState<Record<string, string>>({});

  const [includedUserIds, setIncludedUserIds] = useState<string[]>([]);
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  const [includeUserAmountById, setIncludeUserAmountById] = useState<
    Record<string, string>
  >({});

  const [manualAmountByUserId, setManualAmountByUserId] = useState<
    Record<string, string>
  >({});

  const [manualPaymentUserId, setManualPaymentUserId] = useState("");
  const [manualPaymentAmount, setManualPaymentAmount] = useState("");
  const [manualPaymentNotes, setManualPaymentNotes] = useState("");

  const loadMembers = useCallback(async () => {
    const response = await fetch("/api/finance/admin/members");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to load members.");
    }

    setMembers(result.members ?? []);
    setRoles(result.roles ?? []);
  }, []);

  const loadCharges = useCallback(async () => {
    const response = await fetch("/api/finance/admin/charges");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to load charges.");
    }

    setCharges(result.charges ?? []);
  }, []);

  const loadPayments = useCallback(async () => {
    const response = await fetch("/api/finance/admin/payments");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to load payments.");
    }

    setPayments(result.payments ?? []);
  }, []);

  const loadFinanceData = useCallback(async () => {
    if (!canView) {
      return;
    }

    setLoading(true);

    try {
      await Promise.all([loadMembers(), loadCharges(), loadPayments()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load finance admin data.");
    } finally {
      setLoading(false);
    }
  }, [canView, loadCharges, loadMembers, loadPayments]);

  useEffect(() => {
    void loadFinanceData();
  }, [loadFinanceData]);

  const buildChargePayload = useCallback(() => {
    const defaultAmountCents = parseDollarsToCents(defaultAmountInput);

    const roleAmounts: Record<string, number | null> = {};
    for (const roleId of includedRoleIds) {
      const cents = parseDollarsToCents(roleAmountById[roleId] ?? "");
      roleAmounts[roleId] = cents;
    }

    const includeUsers = includedUserIds.map((userId) => ({
      userId,
      amountCents: parseDollarsToCents(includeUserAmountById[userId] ?? ""),
    }));

    const manualUserAmounts: Record<string, number> = {};
    for (const [userId, value] of Object.entries(manualAmountByUserId)) {
      const cents = parseDollarsToCents(value);
      if (cents) {
        manualUserAmounts[userId] = cents;
      }
    }

    return {
      title: chargeTitle,
      description: chargeDescription,
      dueAt: chargeDueAt ? new Date(chargeDueAt).toISOString() : null,
      defaultAmountCents,
      includeRoleIds: includedRoleIds,
      excludeRoleIds: excludedRoleIds,
      includeUsers,
      excludeUserIds: excludedUserIds,
      roleAmounts,
      manualUserAmounts,
    };
  }, [
    chargeDescription,
    chargeDueAt,
    chargeTitle,
    defaultAmountInput,
    excludedRoleIds,
    excludedUserIds,
    includeUserAmountById,
    includedRoleIds,
    includedUserIds,
    manualAmountByUserId,
    roleAmountById,
  ]);

  const handlePreviewCharge = async () => {
    try {
      setPreviewingCharge(true);
      const payload = buildChargePayload();

      const response = await fetch("/api/finance/admin/charges/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to preview charge.");
      }

      setChargePreview(result as ChargePreview);
      toast.success("Charge preview generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to preview charge.");
    } finally {
      setPreviewingCharge(false);
    }
  };

  const resetChargeForm = () => {
    setChargeTitle("");
    setChargeDescription("");
    setChargeDueAt("");
    setDefaultAmountInput("");
    setIncludedRoleIds([]);
    setExcludedRoleIds([]);
    setRoleAmountById({});
    setIncludedUserIds([]);
    setExcludedUserIds([]);
    setIncludeUserAmountById({});
    setManualAmountByUserId({});
    setChargePreview(null);
  };

  const handleCreateCharge = async () => {
    try {
      setCreatingCharge(true);

      const payload = buildChargePayload();
      const response = await fetch("/api/finance/admin/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.conflicts || result.missingAmountUserIds) {
          toast.error("Resolve conflicts/missing amounts before creating this charge.");
          await handlePreviewCharge();
          return;
        }

        throw new Error(result.error || "Failed to create charge.");
      }

      toast.success(`Charge created for ${result.recipientCount ?? 0} recipients.`);
      resetChargeForm();
      await Promise.all([loadCharges(), loadMembers()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create charge.");
    } finally {
      setCreatingCharge(false);
    }
  };

  const handleEnableMember = async (userId: string) => {
    try {
      setEnablingMemberId(userId);

      const response = await fetch(`/api/finance/admin/members/${userId}/enable`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to enable finance for user.");
      }

      toast.success("Finance enabled for member.");
      await loadMembers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to enable finance for user.",
      );
    } finally {
      setEnablingMemberId(null);
    }
  };

  const loadChargeDetail = useCallback(async (chargeId: string) => {
    setLoadingChargeDetail(true);
    try {
      const response = await fetch(`/api/finance/admin/charges/${chargeId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load charge details.");
      }

      setSelectedChargeDetail(result as ChargeDetail);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load charge details.");
      setSelectedChargeDetail(null);
    } finally {
      setLoadingChargeDetail(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedChargeId) {
      setSelectedChargeDetail(null);
      return;
    }

    void loadChargeDetail(selectedChargeId);
  }, [loadChargeDetail, selectedChargeId]);

  const handleRecordManualPayment = async () => {
    const amountCents = parseDollarsToCents(manualPaymentAmount);

    if (!manualPaymentUserId) {
      toast.error("Select a member for manual payment.");
      return;
    }

    if (!amountCents) {
      toast.error("Enter a valid manual payment amount.");
      return;
    }

    try {
      setRecordingManualPayment(true);
      const response = await fetch("/api/finance/admin/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: manualPaymentUserId,
          amountCents,
          notes: manualPaymentNotes,
          allocationMode: "auto_fifo",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to record manual payment.");
      }

      toast.success("Manual payment recorded.");
      setManualPaymentAmount("");
      setManualPaymentNotes("");
      await Promise.all([loadPayments(), loadMembers(), loadCharges()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record manual payment.");
    } finally {
      setRecordingManualPayment(false);
    }
  };

  if (!canView) {
    return (
      <div className="p-4 md:p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Finance Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            You do not have permission to view this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Loading finance admin data...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold">Finance Admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage finance access, charges, and payment tracking.
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Finance Enablement</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Finance</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.roleNames.length > 0 ? (
                            member.roleNames.map((roleName) => (
                              <Badge key={roleName} variant="secondary">
                                {roleName}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No roles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.financeEnabled ? "default" : "outline"}>
                          {member.financeEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCents(member.outstandingCents)}</TableCell>
                      <TableCell>
                        {member.overdueCount > 0 ? (
                          <Badge variant="destructive">{member.overdueCount}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            !canEdit || member.financeEnabled || enablingMemberId === member.id
                          }
                          onClick={() => {
                            void handleEnableMember(member.id);
                          }}
                        >
                          {enablingMemberId === member.id ? "Enabling..." : "Enable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Charge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="charge-title">Title</Label>
                  <Input
                    id="charge-title"
                    value={chargeTitle}
                    onChange={(event) => setChargeTitle(event.target.value)}
                    placeholder="Semester Dues"
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="charge-description">Description</Label>
                  <Textarea
                    id="charge-description"
                    value={chargeDescription}
                    onChange={(event) => setChargeDescription(event.target.value)}
                    placeholder="Optional charge description"
                    disabled={!canEdit}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="charge-due">Due Date (optional)</Label>
                    <Input
                      id="charge-due"
                      type="date"
                      value={chargeDueAt}
                      onChange={(event) => setChargeDueAt(event.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="charge-default-amount">Default Amount ($)</Label>
                    <Input
                      id="charge-default-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={defaultAmountInput}
                      onChange={(event) => setDefaultAmountInput(event.target.value)}
                      placeholder="95.00"
                      disabled={!canEdit}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Include Roles</p>
                  <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-2">
                    {roles.map((role) => {
                      const included = includedRoleIds.includes(role.id);

                      return (
                        <div key={role.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={included}
                            onChange={(event) => {
                              setIncludedRoleIds((current) =>
                                event.target.checked
                                  ? Array.from(new Set([...current, role.id]))
                                  : current.filter((id) => id !== role.id),
                              );
                            }}
                            disabled={!canEdit}
                          />
                          <span className="text-sm flex-1">{role.name}</span>
                          {included ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="h-8 w-28"
                              placeholder="$ override"
                              value={roleAmountById[role.id] ?? ""}
                              onChange={(event) =>
                                setRoleAmountById((current) => ({
                                  ...current,
                                  [role.id]: event.target.value,
                                }))
                              }
                              disabled={!canEdit}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Exclude Roles</p>
                  <div className="max-h-32 overflow-y-auto rounded-md border p-2 space-y-2">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={excludedRoleIds.includes(role.id)}
                          onChange={(event) => {
                            setExcludedRoleIds((current) =>
                              event.target.checked
                                ? Array.from(new Set([...current, role.id]))
                                : current.filter((id) => id !== role.id),
                            );
                          }}
                          disabled={!canEdit}
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Include Users</p>
                  <div className="max-h-44 overflow-y-auto rounded-md border p-2 space-y-2">
                    {members.map((member) => {
                      const included = includedUserIds.includes(member.id);
                      return (
                        <div key={member.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={included}
                            onChange={(event) => {
                              setIncludedUserIds((current) =>
                                event.target.checked
                                  ? Array.from(new Set([...current, member.id]))
                                  : current.filter((id) => id !== member.id),
                              );
                            }}
                            disabled={!canEdit}
                          />
                          <span className="text-sm flex-1 truncate">{member.name}</span>
                          {included ? (
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="h-8 w-28"
                              placeholder="$ override"
                              value={includeUserAmountById[member.id] ?? ""}
                              onChange={(event) =>
                                setIncludeUserAmountById((current) => ({
                                  ...current,
                                  [member.id]: event.target.value,
                                }))
                              }
                              disabled={!canEdit}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Exclude Users</p>
                  <div className="max-h-32 overflow-y-auto rounded-md border p-2 space-y-2">
                    {members.map((member) => (
                      <label key={member.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={excludedUserIds.includes(member.id)}
                          onChange={(event) => {
                            setExcludedUserIds((current) =>
                              event.target.checked
                                ? Array.from(new Set([...current, member.id]))
                                : current.filter((id) => id !== member.id),
                            );
                          }}
                          disabled={!canEdit}
                        />
                        {member.name}
                      </label>
                    ))}
                  </div>
                </div>

                {chargePreview?.conflicts.length ? (
                  <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3">
                    <p className="text-sm font-medium">
                      Resolve amount conflicts before creating the charge.
                    </p>
                    {chargePreview.conflicts.map((conflict) => (
                      <div key={conflict.userId} className="space-y-1">
                        <div className="text-sm font-medium">{conflict.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {conflict.roleAmounts
                            .map(
                              (roleAmount) =>
                                `${roleAmount.roleName}: ${formatCents(roleAmount.amountCents)}`,
                            )
                            .join(" | ")}
                        </div>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Manual amount override ($)"
                          value={manualAmountByUserId[conflict.userId] ?? ""}
                          onChange={(event) =>
                            setManualAmountByUserId((current) => ({
                              ...current,
                              [conflict.userId]: event.target.value,
                            }))
                          }
                          disabled={!canEdit}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                {chargePreview?.missingAmounts.length ? (
                  <div className="rounded-md border border-red-300 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-700">
                      Missing amount for: {chargePreview.missingAmounts.map((item) => item.name).join(", ")}
                    </p>
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      void handlePreviewCharge();
                    }}
                    disabled={!canEdit || previewingCharge}
                  >
                    {previewingCharge ? "Previewing..." : "Preview"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      void handleCreateCharge();
                    }}
                    disabled={!canEdit || creatingCharge}
                  >
                    {creatingCharge ? "Creating..." : "Create Charge"}
                  </Button>
                </div>

                {chargePreview ? (
                  <p className="text-sm text-muted-foreground">
                    Preview resolved {chargePreview.recipientCount} recipients.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Charges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-[420px] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead className="text-right">View</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {charges.map((charge) => (
                        <TableRow key={charge.id}>
                          <TableCell>
                            <div className="font-medium">{charge.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {charge.overdueCount > 0 ? `${charge.overdueCount} overdue` : "No overdue"}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(charge.dueAt)}</TableCell>
                          <TableCell>{charge.totalAssigned}</TableCell>
                          <TableCell>{formatCents(charge.outstandingCents)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedChargeId(charge.id)}
                            >
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {loadingChargeDetail ? (
                  <p className="text-sm text-muted-foreground">Loading charge detail...</p>
                ) : selectedChargeDetail ? (
                  <div className="space-y-2 rounded-md border p-3">
                    <div className="font-medium">{selectedChargeDetail.charge.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Due: {formatDate(selectedChargeDetail.charge.dueAt)}
                    </div>
                    <div className="max-h-48 overflow-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Remaining</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedChargeDetail.recipients.map((recipient) => (
                            <TableRow key={recipient.obligationId}>
                              <TableCell>
                                <div className="font-medium">{recipient.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {recipient.email}
                                </div>
                              </TableCell>
                              <TableCell>{formatCents(recipient.amountCents)}</TableCell>
                              <TableCell>{formatCents(recipient.remainingCents)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    recipient.paymentState === "paid"
                                      ? "default"
                                      : recipient.isOverdue
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {recipient.paymentState}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a charge to inspect recipient payment states.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Record Manual Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-[1fr_180px_1fr_auto] md:items-end">
              <div className="space-y-1">
                <Label htmlFor="manual-user">Member</Label>
                <select
                  id="manual-user"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={manualPaymentUserId}
                  onChange={(event) => setManualPaymentUserId(event.target.value)}
                  disabled={!canEdit}
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="manual-amount">Amount ($)</Label>
                <Input
                  id="manual-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualPaymentAmount}
                  onChange={(event) => setManualPaymentAmount(event.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="manual-notes">Notes (optional)</Label>
                <Input
                  id="manual-notes"
                  value={manualPaymentNotes}
                  onChange={(event) => setManualPaymentNotes(event.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <Button
                onClick={() => {
                  void handleRecordManualPayment();
                }}
                disabled={!canEdit || recordingManualPayment}
              >
                {recordingManualPayment ? "Recording..." : "Record"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[420px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Allocated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{payment.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {payment.userEmail}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{payment.source}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "failed" || payment.status === "canceled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCents(payment.amountCents)}</TableCell>
                        <TableCell>{formatCents(payment.allocatedCents)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
