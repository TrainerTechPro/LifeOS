"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign, PieChart, Calculator, Trash2, Pencil, History, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useFinanceStore } from "@/stores/finance";

const bucketColors: Record<string, string> = {
  Tax: "#FF6B8A",
  Operations: "#FFB347",
  Investments: "#06D6A0",
  Savings: "#4DA8FF",
  "Free Spend": "#BF5AF2",
};

function DonutChart({
  segments,
  size = 200,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const segmentLength = (seg.value / total) * circumference;
          const offset = accumulatedOffset;
          accumulatedOffset += segmentLength;

          return (
            <motion.circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={28}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
              animate={{ opacity: 1, strokeDasharray: `${segmentLength} ${circumference - segmentLength}` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">${total.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Total</p>
        </div>
      </div>
    </div>
  );
}

export default function FinancePage() {
  const { rules, paychecks, addRule, updateRule, removeRule, addPaycheck, removePaycheck } = useFinanceStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPaycheckDialog, setShowPaycheckDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);

  const [grossAmount, setGrossAmount] = useState("5000");
  const [selectedRule, setSelectedRule] = useState<string>(rules[0]?.id || "");

  const [newRule, setNewRule] = useState({
    incomeSource: "",
    taxPercentage: "30",
    savePercentage: "20",
    investPercentage: "25",
    operationsPercentage: "25",
  });

  const [editRule, setEditRule] = useState({
    incomeSource: "",
    taxPercentage: "0",
    savePercentage: "0",
    investPercentage: "0",
    operationsPercentage: "0",
  });

  const [newPaycheck, setNewPaycheck] = useState({
    ruleId: "",
    grossAmount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const activeRule = rules.find((r) => r.id === selectedRule);
  const gross = parseFloat(grossAmount) || 0;

  const buckets = useMemo(() => {
    if (!activeRule || gross === 0) return [];
    const freeSpendPct =
      100 -
      activeRule.taxPercentage -
      activeRule.savePercentage -
      activeRule.investPercentage -
      activeRule.operationsPercentage;

    return [
      { label: "Tax", value: Math.round(gross * (activeRule.taxPercentage / 100)), color: bucketColors.Tax, pct: activeRule.taxPercentage },
      { label: "Operations", value: Math.round(gross * (activeRule.operationsPercentage / 100)), color: bucketColors.Operations, pct: activeRule.operationsPercentage },
      { label: "Investments", value: Math.round(gross * (activeRule.investPercentage / 100)), color: bucketColors.Investments, pct: activeRule.investPercentage },
      { label: "Savings", value: Math.round(gross * (activeRule.savePercentage / 100)), color: bucketColors.Savings, pct: activeRule.savePercentage },
      ...(freeSpendPct > 0
        ? [{ label: "Free Spend", value: Math.round(gross * (freeSpendPct / 100)), color: bucketColors["Free Spend"], pct: freeSpendPct }]
        : []),
    ];
  }, [activeRule, gross]);

  // Monthly totals for the bar chart
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of paychecks) {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + p.grossAmount);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => {
        const [y, m] = month.split("-");
        const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        return { month: label, total };
      });
  }, [paychecks]);

  const handleAddRule = () => {
    if (!newRule.incomeSource.trim()) return;
    const rule = {
      id: crypto.randomUUID(),
      incomeSource: newRule.incomeSource,
      taxPercentage: parseFloat(newRule.taxPercentage) || 0,
      savePercentage: parseFloat(newRule.savePercentage) || 0,
      investPercentage: parseFloat(newRule.investPercentage) || 0,
      operationsPercentage: parseFloat(newRule.operationsPercentage) || 0,
    };
    addRule(rule);
    setSelectedRule(rule.id);
    setNewRule({ incomeSource: "", taxPercentage: "30", savePercentage: "20", investPercentage: "25", operationsPercentage: "25" });
    setShowAddDialog(false);
  };

  const handleDeleteRule = (id: string) => {
    removeRule(id);
    if (selectedRule === id) setSelectedRule(rules[0]?.id || "");
  };

  const openEditDialog = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    setEditingRule(ruleId);
    setEditRule({
      incomeSource: rule.incomeSource,
      taxPercentage: String(rule.taxPercentage),
      savePercentage: String(rule.savePercentage),
      investPercentage: String(rule.investPercentage),
      operationsPercentage: String(rule.operationsPercentage),
    });
    setShowEditDialog(true);
  };

  const handleEditRule = () => {
    if (!editingRule || !editRule.incomeSource.trim()) return;
    updateRule(editingRule, {
      incomeSource: editRule.incomeSource,
      taxPercentage: parseFloat(editRule.taxPercentage) || 0,
      savePercentage: parseFloat(editRule.savePercentage) || 0,
      investPercentage: parseFloat(editRule.investPercentage) || 0,
      operationsPercentage: parseFloat(editRule.operationsPercentage) || 0,
    });
    setShowEditDialog(false);
    setEditingRule(null);
  };

  const handleAddPaycheck = () => {
    if (!newPaycheck.ruleId || !newPaycheck.grossAmount) return;
    addPaycheck({
      id: crypto.randomUUID(),
      ruleId: newPaycheck.ruleId,
      grossAmount: parseFloat(newPaycheck.grossAmount) || 0,
      date: newPaycheck.date,
      note: newPaycheck.note || undefined,
    });
    setNewPaycheck({
      ruleId: "",
      grossAmount: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });
    setShowPaycheckDialog(false);
  };

  const getRuleName = (ruleId: string) => {
    return rules.find((r) => r.id === ruleId)?.incomeSource || "Unknown";
  };

  const sortedPaychecks = useMemo(
    () => [...paychecks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [paychecks]
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">System 5</p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Financial Autopilot</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Automated money distribution rules
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator" className="gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Income History
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <List className="h-4 w-4" />
            All Rules
          </TabsTrigger>
        </TabsList>

        {/* ==================== Calculator Tab ==================== */}
        <TabsContent value="calculator" className="space-y-6">
          {/* Income Source Selector */}
          <div className="flex gap-2 flex-wrap">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-1">
                <Button
                  variant={selectedRule === rule.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRule(rule.id)}
                >
                  {rule.incomeSource}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Calculator + Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[var(--violet)]" />
                  <CardTitle className="text-base">Paycheck Calculator</CardTitle>
                </div>
                <CardDescription>
                  Enter gross amount to see instant distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                    Gross Paycheck Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input
                      type="number"
                      value={grossAmount}
                      onChange={(e) => setGrossAmount(e.target.value)}
                      className="pl-9 text-lg h-12"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {activeRule && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                      Distribution for {activeRule.incomeSource}
                    </p>
                    {buckets.map((bucket, i) => (
                      <motion.div
                        key={bucket.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-[var(--border)] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: bucket.color }}
                          />
                          <span className="text-sm">{bucket.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {bucket.pct}%
                          </Badge>
                        </div>
                        <span className="font-semibold">
                          ${bucket.value.toLocaleString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-[var(--primary)]" />
                  <CardTitle className="text-base">Distribution Chart</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                {buckets.length > 0 ? (
                  <>
                    <DonutChart segments={buckets} size={220} />
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                      {buckets.map((b) => (
                        <div key={b.label} className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: b.color }}
                          />
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {b.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Select a rule and enter an amount to see the chart
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== Income History Tab ==================== */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Income History
            </h2>
            <Button onClick={() => {
              setNewPaycheck({ ruleId: rules[0]?.id || "", grossAmount: "", date: new Date().toISOString().split("T")[0], note: "" });
              setShowPaycheckDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Record Paycheck
            </Button>
          </div>

          {/* Monthly Bar Chart */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fill: "#6B6B80", fontSize: 12 }} axisLine={{ stroke: "#6B6B80" }} tickLine={false} />
                      <YAxis tick={{ fill: "#6B6B80", fontSize: 12 }} axisLine={{ stroke: "#6B6B80" }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", color: "#fff" }}
                        labelStyle={{ color: "#6B6B80" }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Total"]}
                      />
                      <Bar dataKey="total" fill="#06D6A0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paycheck List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Paychecks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedPaychecks.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
                  No paychecks recorded yet. Click &quot;Record Paycheck&quot; to add one.
                </p>
              ) : (
                sortedPaychecks.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-[var(--border)] px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{getRuleName(p.ruleId)}</p>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          ${p.grossAmount.toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        {p.note && <span> &middot; {p.note}</span>}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 ml-2"
                      onClick={() => removePaycheck(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== All Rules Tab ==================== */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Rules</CardTitle>
              <CardDescription>Click a rule to edit its distribution percentages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-[var(--border)] px-4 py-3 cursor-pointer hover:bg-white/[0.06] transition-colors"
                  onClick={() => openEditDialog(rule.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rule.incomeSource}</p>
                      <Pencil className="h-3 w-3 text-[var(--muted-foreground)]" />
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Tax {rule.taxPercentage}% &middot; Save {rule.savePercentage}% &middot; Invest {rule.investPercentage}% &middot; Ops {rule.operationsPercentage}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Active</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRule(rule.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-6">
                  No rules yet. Click &quot;Add Rule&quot; to create one.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== Add Rule Dialog ==================== */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Finance Rule</DialogTitle>
            <DialogDescription>Define how to split a new income source</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Income Source (e.g., Freelance)"
              value={newRule.incomeSource}
              onChange={(e) => setNewRule({ ...newRule, incomeSource: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Tax %</label>
                <Input
                  type="number"
                  value={newRule.taxPercentage}
                  onChange={(e) => setNewRule({ ...newRule, taxPercentage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Save %</label>
                <Input
                  type="number"
                  value={newRule.savePercentage}
                  onChange={(e) => setNewRule({ ...newRule, savePercentage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Invest %</label>
                <Input
                  type="number"
                  value={newRule.investPercentage}
                  onChange={(e) => setNewRule({ ...newRule, investPercentage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Operations %</label>
                <Input
                  type="number"
                  value={newRule.operationsPercentage}
                  onChange={(e) => setNewRule({ ...newRule, operationsPercentage: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddRule} className="w-full">Add Rule</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== Edit Rule Dialog ==================== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Finance Rule</DialogTitle>
            <DialogDescription>Update the income source and distribution percentages</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Income Source"
              value={editRule.incomeSource}
              onChange={(e) => setEditRule({ ...editRule, incomeSource: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Tax %</label>
                <Input
                  type="number"
                  value={editRule.taxPercentage}
                  onChange={(e) => setEditRule({ ...editRule, taxPercentage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Save %</label>
                <Input
                  type="number"
                  value={editRule.savePercentage}
                  onChange={(e) => setEditRule({ ...editRule, savePercentage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Invest %</label>
                <Input
                  type="number"
                  value={editRule.investPercentage}
                  onChange={(e) => setEditRule({ ...editRule, investPercentage: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Operations %</label>
                <Input
                  type="number"
                  value={editRule.operationsPercentage}
                  onChange={(e) => setEditRule({ ...editRule, operationsPercentage: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleEditRule} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== Record Paycheck Dialog ==================== */}
      <Dialog open={showPaycheckDialog} onOpenChange={setShowPaycheckDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Paycheck</DialogTitle>
            <DialogDescription>Log an income payment for tracking</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Income Source</label>
              <select
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newPaycheck.ruleId}
                onChange={(e) => setNewPaycheck({ ...newPaycheck, ruleId: e.target.value })}
              >
                <option value="" disabled>Select a rule...</option>
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.incomeSource}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Gross Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <Input
                  type="number"
                  value={newPaycheck.grossAmount}
                  onChange={(e) => setNewPaycheck({ ...newPaycheck, grossAmount: e.target.value })}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Date</label>
              <Input
                type="date"
                value={newPaycheck.date}
                onChange={(e) => setNewPaycheck({ ...newPaycheck, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Note (optional)</label>
              <Input
                placeholder="e.g., March paycheck"
                value={newPaycheck.note}
                onChange={(e) => setNewPaycheck({ ...newPaycheck, note: e.target.value })}
              />
            </div>
            <Button onClick={handleAddPaycheck} className="w-full">Record Paycheck</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
