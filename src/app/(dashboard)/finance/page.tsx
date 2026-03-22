"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign, PieChart, Calculator, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FinanceRule {
  id: string;
  incomeSource: string;
  taxPercentage: number;
  savePercentage: number;
  investPercentage: number;
  operationsPercentage: number;
}

const demoRules: FinanceRule[] = [
  {
    id: "1",
    incomeSource: "University Salary",
    taxPercentage: 30,
    savePercentage: 20,
    investPercentage: 25,
    operationsPercentage: 25,
  },
  {
    id: "2",
    incomeSource: "LLC Revenue",
    taxPercentage: 25,
    savePercentage: 15,
    investPercentage: 35,
    operationsPercentage: 25,
  },
];

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
  const [rules, setRules] = useState(demoRules);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [grossAmount, setGrossAmount] = useState("5000");
  const [selectedRule, setSelectedRule] = useState<string>(rules[0]?.id || "");
  const [newRule, setNewRule] = useState({
    incomeSource: "",
    taxPercentage: "30",
    savePercentage: "20",
    investPercentage: "25",
    operationsPercentage: "25",
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

  const addRule = () => {
    if (!newRule.incomeSource.trim()) return;
    const rule: FinanceRule = {
      id: crypto.randomUUID(),
      incomeSource: newRule.incomeSource,
      taxPercentage: parseFloat(newRule.taxPercentage) || 0,
      savePercentage: parseFloat(newRule.savePercentage) || 0,
      investPercentage: parseFloat(newRule.investPercentage) || 0,
      operationsPercentage: parseFloat(newRule.operationsPercentage) || 0,
    };
    setRules([...rules, rule]);
    setSelectedRule(rule.id);
    setNewRule({ incomeSource: "", taxPercentage: "30", savePercentage: "20", investPercentage: "25", operationsPercentage: "25" });
    setShowAddDialog(false);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    if (selectedRule === id) setSelectedRule(rules[0]?.id || "");
  };

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
              onClick={() => deleteRule(rule.id)}
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

      {/* Rules Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-[var(--border)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{rule.incomeSource}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Tax {rule.taxPercentage}% &middot; Save {rule.savePercentage}% &middot; Invest {rule.investPercentage}% &middot; Ops {rule.operationsPercentage}%
                </p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add Rule Dialog */}
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
            <Button onClick={addRule} className="w-full">Add Rule</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
