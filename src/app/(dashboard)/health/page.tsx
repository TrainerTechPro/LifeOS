"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Moon, Flame, Timer, Dumbbell, Trash2, Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useHealthStore } from "@/stores/health";
import type { HealthLog } from "@/stores/health";

/* ───────────────────────── animation variants ───────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } },
};

/* ───────────────────────── lifting protocol data ────────────────────── */

const liftingProtocol = [
  { day: "Monday", workout: "Smolov Squat + Accessories", sets: "6x6 @ 80%" },
  { day: "Wednesday", workout: "Smolov Squat + Upper Pull", sets: "7x5 @ 85%" },
  { day: "Friday", workout: "Smolov Squat + Upper Push", sets: "8x4 @ 87%" },
];

/* ───────────────────────── helper: workout accent color ─────────────── */

function getWorkoutAccentColor(workoutType: string): string {
  const lower = workoutType.toLowerCase();
  if (lower.includes("jiu-jitsu") || lower.includes("mat")) return "var(--rose)";
  if (lower.includes("smolov") || lower.includes("squat") || lower.includes("lift") || lower.includes("upper")) return "var(--violet)";
  if (lower.includes("zone 2") || lower.includes("cardio")) return "var(--cyan)";
  if (lower.includes("throws")) return "var(--amber)";
  if (lower.includes("rest")) return "var(--muted-foreground)";
  return "var(--blue)";
}

/* ───────────────────────── ProgressRing ──────────────────────────────── */

function ProgressRing({
  value,
  size = 56,
  strokeWidth = 4,
  color,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── MetricCard ────────────────────────────────── */

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  target,
  current,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit?: string;
  color: string;
  target?: number;
  current?: number;
}) {
  const ringValue = target && current !== undefined ? (current / target) * 100 : undefined;

  return (
    <motion.div variants={item}>
      <Card className="gradient-border shadow-inner-glow">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {ringValue !== undefined ? (
              <ProgressRing value={ringValue} size={52} strokeWidth={4} color={color}>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </ProgressRing>
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold tracking-tight">
                {value}
                {unit && <span className="text-sm font-normal text-[var(--muted-foreground)] ml-1">{unit}</span>}
              </p>
            </div>
          </div>
          {target && current !== undefined && (
            <p className="text-xs text-[var(--muted-foreground)] mt-3 pl-1">
              {current}/{target} {unit} this week &middot; {Math.round((current / target) * 100)}%
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ───────────────────────── tooltip styles (recharts) ────────────────── */

const tooltipStyle = {
  background: "rgba(20,20,30,0.95)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  fontSize: 12,
  color: "#fff",
};

const axisProps = {
  stroke: "#6B6B80",
  fontSize: 11,
  tickLine: false as const,
  axisLine: false as const,
};

/* ───────────────────────── empty form state ─────────────────────────── */

const emptyForm = {
  sleepScore: "",
  workoutType: "",
  zone2Minutes: "",
  calories: "",
  matTimeMin: "",
  liftVolume: "",
  notes: "",
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*                            MAIN PAGE                                  */
/* ═══════════════════════════════════════════════════════════════════════ */

export default function HealthPage() {
  const { logs, addLog, updateLog, removeLog } = useHealthStore();

  /* ── dialog state ─────────────────────────────────────────────────── */
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  /* ── derived metrics ──────────────────────────────────────────────── */
  const avgSleep = logs.length ? (logs.reduce((s, l) => s + l.sleepScore, 0) / logs.length).toFixed(1) : "0";
  const totalZone2 = logs.reduce((s, l) => s + l.zone2Minutes, 0);
  const totalMatTime = logs.reduce((s, l) => s + (l.matTimeMin || 0), 0);
  const avgCalories = logs.length ? Math.round(logs.reduce((s, l) => s + l.calories, 0) / logs.length) : 0;

  /* ── chart data (memoized) ────────────────────────────────────────── */

  const sleepChartData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-14).map((l) => ({
      date: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sleep: l.sleepScore,
    }));
  }, [logs]);

  const weeklyZone2Data = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const last7 = sorted.slice(-7);
    return last7
      .filter((l) => l.zone2Minutes > 0)
      .map((l) => ({
        day: new Date(l.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        minutes: l.zone2Minutes,
      }));
  }, [logs]);

  const liftVolumeData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    return sorted
      .slice(-14)
      .filter((l) => l.liftVolume && l.liftVolume > 0)
      .map((l) => ({
        date: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        volume: l.liftVolume! / 1000,
      }));
  }, [logs]);

  /* ── add log handler ──────────────────────────────────────────────── */

  const handleAddLog = () => {
    const entry: HealthLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      sleepScore: parseInt(form.sleepScore) || 0,
      workoutType: form.workoutType || "General",
      zone2Minutes: parseInt(form.zone2Minutes) || 0,
      calories: parseInt(form.calories) || 0,
      matTimeMin: form.matTimeMin ? parseInt(form.matTimeMin) : undefined,
      liftVolume: form.liftVolume ? parseInt(form.liftVolume) : undefined,
      notes: form.notes || undefined,
    };
    addLog(entry);
    setForm(emptyForm);
    setShowAddDialog(false);
  };

  /* ── edit log handlers ────────────────────────────────────────────── */

  const openEditDialog = (log: HealthLog) => {
    setEditingLog(log);
    setForm({
      sleepScore: String(log.sleepScore),
      workoutType: log.workoutType,
      zone2Minutes: String(log.zone2Minutes),
      calories: String(log.calories),
      matTimeMin: log.matTimeMin ? String(log.matTimeMin) : "",
      liftVolume: log.liftVolume ? String(log.liftVolume) : "",
      notes: log.notes || "",
    });
  };

  const handleUpdateLog = () => {
    if (!editingLog) return;
    updateLog(editingLog.id, {
      sleepScore: parseInt(form.sleepScore) || 0,
      workoutType: form.workoutType || "General",
      zone2Minutes: parseInt(form.zone2Minutes) || 0,
      calories: parseInt(form.calories) || 0,
      matTimeMin: form.matTimeMin ? parseInt(form.matTimeMin) : null,
      liftVolume: form.liftVolume ? parseInt(form.liftVolume) : null,
      notes: form.notes || null,
    });
    setEditingLog(null);
    setForm(emptyForm);
  };

  /* ── delete handler ───────────────────────────────────────────────── */

  const handleDelete = (id: string) => {
    removeLog(id);
    setConfirmDeleteId(null);
  };

  /* ═══════════════════════════════════════════════════════════════════ */
  /*                             RENDER                                */
  /* ═══════════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">System 3</p>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mt-1">
            Health OS
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Track your body like an engineering system
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowAddDialog(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Log Today
        </Button>
      </div>

      {/* Key Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <MetricCard icon={Moon} label="Avg Sleep Score" value={avgSleep} unit="/10" color="#BF5AF2" />
        <MetricCard icon={Timer} label="Zone 2 This Week" value={String(totalZone2)} unit="min" color="var(--cyan)" target={150} current={totalZone2} />
        <MetricCard icon={Dumbbell} label="Mat Time This Week" value={String(totalMatTime)} unit="min" color="var(--rose)" target={180} current={totalMatTime} />
        <MetricCard icon={Flame} label="Avg Calories" value={String(avgCalories)} unit="kcal" color="var(--amber)" />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="log" className="space-y-6">
        <TabsList>
          <TabsTrigger value="log">Activity Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="protocol">Lifting Protocol</TabsTrigger>
        </TabsList>

        {/* ─────────── TAB: Activity Log ─────────── */}
        <TabsContent value="log" className="space-y-3">
          {logs.length === 0 && (
            <Card className="gradient-border shadow-inner-glow">
              <CardContent className="py-12 text-center text-[var(--muted-foreground)] text-sm">
                No logs yet. Click &ldquo;Log Today&rdquo; to start tracking.
              </CardContent>
            </Card>
          )}
          {logs.map((log, i) => {
            const accentColor = getWorkoutAccentColor(log.workoutType);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="gradient-border shadow-inner-glow overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div
                        className="w-1 shrink-0 rounded-l-xl"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div className="flex items-center justify-between flex-1 p-4">
                        <div
                          className="space-y-1 cursor-pointer flex-1 min-w-0"
                          onClick={() => openEditDialog(log)}
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{log.workoutType}</p>
                            {log.beltRank && (
                              <Badge variant="outline" className="text-xs">{log.beltRank} Belt</Badge>
                            )}
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            {log.notes && <span className="ml-2 italic">&mdash; {log.notes}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-4 text-right">
                            <div>
                              <p className="text-xs text-[var(--muted-foreground)]">Sleep</p>
                              <p className="text-sm font-semibold">{log.sleepScore}/10</p>
                            </div>
                            {log.zone2Minutes > 0 && (
                              <div>
                                <p className="text-xs text-[var(--muted-foreground)]">Zone 2</p>
                                <p className="text-sm font-semibold" style={{ color: "var(--cyan)" }}>{log.zone2Minutes}m</p>
                              </div>
                            )}
                            {log.matTimeMin && log.matTimeMin > 0 && (
                              <div>
                                <p className="text-xs text-[var(--muted-foreground)]">Mat</p>
                                <p className="text-sm font-semibold" style={{ color: "var(--rose)" }}>{log.matTimeMin}m</p>
                              </div>
                            )}
                            {log.liftVolume && log.liftVolume > 0 && (
                              <div>
                                <p className="text-xs text-[var(--muted-foreground)]">Volume</p>
                                <p className="text-sm font-semibold" style={{ color: "var(--violet)" }}>{(log.liftVolume / 1000).toFixed(1)}k</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-[var(--muted-foreground)]">Cal</p>
                              <p className="text-sm font-semibold" style={{ color: "var(--amber)" }}>{log.calories}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditDialog(log); }}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--muted-foreground)] hover:text-white transition-colors"
                              aria-label="Edit log"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(log.id); }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                              aria-label="Delete log"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* ─────────── TAB: Analytics ─────────── */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Sleep Trend */}
          <Card className="gradient-border shadow-inner-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Moon className="h-4 w-4" style={{ color: "#BF5AF2" }} />
                Sleep Trend (Last 14 Days)
              </CardTitle>
              <CardDescription>Track your nightly sleep quality scores</CardDescription>
            </CardHeader>
            <CardContent>
              {sleepChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={sleepChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" {...axisProps} />
                    <YAxis domain={[0, 10]} {...axisProps} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`${value}/10`, "Sleep Score"]}
                    />
                    <ReferenceLine y={8} stroke="rgba(191,90,242,0.3)" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="#BF5AF2"
                      strokeWidth={2}
                      dot={{ fill: "#BF5AF2", r: 3 }}
                      activeDot={{ fill: "#BF5AF2", r: 5, stroke: "rgba(191,90,242,0.3)", strokeWidth: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No data to display</p>
              )}
            </CardContent>
          </Card>

          {/* Zone 2 (Last 7 Days) */}
          <Card className="gradient-border shadow-inner-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-4 w-4" style={{ color: "#00D4FF" }} />
                Zone 2 (Last 7 Days)
              </CardTitle>
              <CardDescription>150 min/week target for aerobic base building</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyZone2Data.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyZone2Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" {...axisProps} />
                    <YAxis {...axisProps} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`${value} min`, "Zone 2"]}
                    />
                    <ReferenceLine y={150} stroke="rgba(0,212,255,0.4)" strokeDasharray="4 4" label={{ value: "Target", fill: "#6B6B80", fontSize: 10, position: "right" }} />
                    <Bar dataKey="minutes" fill="#00D4FF" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No data to display</p>
              )}
            </CardContent>
          </Card>

          {/* Lift Volume Trend */}
          <Card className="gradient-border shadow-inner-glow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="h-4 w-4" style={{ color: "#7C5CFC" }} />
                Lift Volume Trend
              </CardTitle>
              <CardDescription>Total volume per lifting session (thousands of kg)</CardDescription>
            </CardHeader>
            <CardContent>
              {liftVolumeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={liftVolumeData}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" {...axisProps} />
                    <YAxis {...axisProps} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [`${value.toFixed(1)}k kg`, "Volume"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#7C5CFC"
                      strokeWidth={2}
                      fill="url(#volumeGradient)"
                      dot={{ fill: "#7C5CFC", r: 3 }}
                      activeDot={{ fill: "#7C5CFC", r: 5, stroke: "rgba(124,92,252,0.3)", strokeWidth: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No data to display</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─────────── TAB: Lifting Protocol ─────────── */}
        <TabsContent value="protocol" className="space-y-4">
          <Card className="gradient-border shadow-inner-glow">
            <CardHeader>
              <CardTitle className="text-base">Smolov Squat Cycle</CardTitle>
              <CardDescription>3x/week lifting protocol - Current: Week 3</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {liftingProtocol.map((p) => (
                <div
                  key={p.day}
                  className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{p.day}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{p.workout}</p>
                  </div>
                  <Badge variant="secondary">{p.sets}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="gradient-border shadow-inner-glow">
            <CardHeader>
              <CardTitle className="text-base">Zone 2 Cardio Minimums</CardTitle>
              <CardDescription>150 min/week target for aerobic base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-5">
                <ProgressRing
                  value={(totalZone2 / 150) * 100}
                  size={72}
                  strokeWidth={5}
                  color="var(--cyan)"
                >
                  <span className="text-sm font-bold">{Math.round((totalZone2 / 150) * 100)}%</span>
                </ProgressRing>
                <div>
                  <p className="text-2xl font-bold tracking-tight">
                    {totalZone2}<span className="text-sm font-normal text-[var(--muted-foreground)] ml-1">/ 150 min</span>
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {150 - totalZone2 > 0 ? `${150 - totalZone2} minutes remaining this week` : "Weekly target reached"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─────────── Add Log Dialog ─────────── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setForm(emptyForm); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Health Data</DialogTitle>
            <DialogDescription>Record today&apos;s health metrics</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Sleep Score (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.sleepScore}
                  onChange={(e) => setForm({ ...form, sleepScore: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Calories</label>
                <Input
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Workout Type</label>
              <Select
                value={form.workoutType}
                onValueChange={(val) => setForm({ ...form, workoutType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Smolov Squat">Smolov Squat</SelectItem>
                  <SelectItem value="Upper Body">Upper Body</SelectItem>
                  <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
                  <SelectItem value="Throws Practice">Throws Practice</SelectItem>
                  <SelectItem value="Zone 2 Cardio">Zone 2 Cardio</SelectItem>
                  <SelectItem value="Zone 2 + Upper Body">Zone 2 + Upper Body</SelectItem>
                  <SelectItem value="Rest Day">Rest Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Zone 2 (min)</label>
                <Input
                  type="number"
                  value={form.zone2Minutes}
                  onChange={(e) => setForm({ ...form, zone2Minutes: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Mat Time (min)</label>
                <Input
                  type="number"
                  value={form.matTimeMin}
                  onChange={(e) => setForm({ ...form, matTimeMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Lift Volume (kg)</label>
                <Input
                  type="number"
                  value={form.liftVolume}
                  onChange={(e) => setForm({ ...form, liftVolume: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Notes</label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes..."
              />
            </div>
            <Button onClick={handleAddLog} className="w-full">Log Entry</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────── Edit Log Dialog ─────────── */}
      <Dialog open={!!editingLog} onOpenChange={(open) => { if (!open) { setEditingLog(null); setForm(emptyForm); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Log Entry</DialogTitle>
            <DialogDescription>
              {editingLog && new Date(editingLog.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Sleep Score (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.sleepScore}
                  onChange={(e) => setForm({ ...form, sleepScore: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Calories</label>
                <Input
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Workout Type</label>
              <Select
                value={form.workoutType}
                onValueChange={(val) => setForm({ ...form, workoutType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Smolov Squat">Smolov Squat</SelectItem>
                  <SelectItem value="Smolov Squat W2D1">Smolov Squat W2D1</SelectItem>
                  <SelectItem value="Smolov Squat W2D2">Smolov Squat W2D2</SelectItem>
                  <SelectItem value="Smolov Squat W2D3">Smolov Squat W2D3</SelectItem>
                  <SelectItem value="Smolov Squat W3D1">Smolov Squat W3D1</SelectItem>
                  <SelectItem value="Smolov Squat W3D2">Smolov Squat W3D2</SelectItem>
                  <SelectItem value="Upper Body">Upper Body</SelectItem>
                  <SelectItem value="Jiu-Jitsu">Jiu-Jitsu</SelectItem>
                  <SelectItem value="Throws Practice">Throws Practice</SelectItem>
                  <SelectItem value="Zone 2 Cardio">Zone 2 Cardio</SelectItem>
                  <SelectItem value="Zone 2 + Upper Body">Zone 2 + Upper Body</SelectItem>
                  <SelectItem value="Rest Day">Rest Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Zone 2 (min)</label>
                <Input
                  type="number"
                  value={form.zone2Minutes}
                  onChange={(e) => setForm({ ...form, zone2Minutes: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Mat Time (min)</label>
                <Input
                  type="number"
                  value={form.matTimeMin}
                  onChange={(e) => setForm({ ...form, matTimeMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Lift Volume (kg)</label>
                <Input
                  type="number"
                  value={form.liftVolume}
                  onChange={(e) => setForm({ ...form, liftVolume: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Notes</label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any notes..."
              />
            </div>
            <Button onClick={handleUpdateLog} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─────────── Delete Confirmation Dialog ─────────── */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Log Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this log entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
