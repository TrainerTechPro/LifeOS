"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Moon, Flame, Timer, Dumbbell } from "lucide-react";
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

interface HealthEntry {
  id: string;
  date: string;
  sleepScore: number;
  workoutType: string;
  zone2Minutes: number;
  calories: number;
  notes?: string;
  beltRank?: string;
  matTimeMin?: number;
  liftVolume?: number;
}

const demoLogs: HealthEntry[] = [
  { id: "1", date: "2026-03-21", sleepScore: 8, workoutType: "Smolov Squat W3D1", zone2Minutes: 0, calories: 3200, liftVolume: 12500 },
  { id: "2", date: "2026-03-20", sleepScore: 7, workoutType: "Jiu-Jitsu", zone2Minutes: 0, calories: 2800, matTimeMin: 90, beltRank: "Purple" },
  { id: "3", date: "2026-03-19", sleepScore: 9, workoutType: "Zone 2 + Upper Body", zone2Minutes: 45, calories: 2600, liftVolume: 8200 },
  { id: "4", date: "2026-03-18", sleepScore: 8, workoutType: "Smolov Squat W2D3", zone2Minutes: 0, calories: 3400, liftVolume: 14200 },
  { id: "5", date: "2026-03-17", sleepScore: 6, workoutType: "Jiu-Jitsu", zone2Minutes: 0, calories: 2900, matTimeMin: 75, beltRank: "Purple" },
  { id: "6", date: "2026-03-16", sleepScore: 8, workoutType: "Throws Practice", zone2Minutes: 30, calories: 3100, liftVolume: 6000 },
  { id: "7", date: "2026-03-15", sleepScore: 7, workoutType: "Rest Day", zone2Minutes: 40, calories: 2400 },
];

const liftingProtocol = [
  { day: "Monday", workout: "Smolov Squat + Accessories", sets: "6x6 @ 80%" },
  { day: "Wednesday", workout: "Smolov Squat + Upper Pull", sets: "7x5 @ 85%" },
  { day: "Friday", workout: "Smolov Squat + Upper Push", sets: "8x4 @ 87%" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } },
};

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

function getWorkoutAccentColor(workoutType: string): string {
  const lower = workoutType.toLowerCase();
  if (lower.includes("jiu-jitsu") || lower.includes("mat")) return "var(--rose)";
  if (lower.includes("smolov") || lower.includes("squat") || lower.includes("lift") || lower.includes("upper")) return "var(--violet)";
  if (lower.includes("zone 2") || lower.includes("cardio")) return "var(--cyan)";
  if (lower.includes("throws")) return "var(--amber)";
  if (lower.includes("rest")) return "var(--muted-foreground)";
  return "var(--blue)";
}

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

export default function HealthPage() {
  const [logs, setLogs] = useState(demoLogs);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newLog, setNewLog] = useState({
    sleepScore: "",
    workoutType: "",
    zone2Minutes: "",
    calories: "",
    matTimeMin: "",
    liftVolume: "",
    notes: "",
  });

  const avgSleep = (logs.reduce((sum, l) => sum + l.sleepScore, 0) / logs.length).toFixed(1);
  const totalZone2 = logs.reduce((sum, l) => sum + l.zone2Minutes, 0);
  const totalMatTime = logs.reduce((sum, l) => sum + (l.matTimeMin || 0), 0);
  const avgCalories = Math.round(logs.reduce((sum, l) => sum + l.calories, 0) / logs.length);

  const addLog = () => {
    const entry: HealthEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split("T")[0],
      sleepScore: parseInt(newLog.sleepScore) || 0,
      workoutType: newLog.workoutType || "General",
      zone2Minutes: parseInt(newLog.zone2Minutes) || 0,
      calories: parseInt(newLog.calories) || 0,
      matTimeMin: newLog.matTimeMin ? parseInt(newLog.matTimeMin) : undefined,
      liftVolume: newLog.liftVolume ? parseInt(newLog.liftVolume) : undefined,
      notes: newLog.notes || undefined,
    };
    setLogs([entry, ...logs]);
    setNewLog({ sleepScore: "", workoutType: "", zone2Minutes: "", calories: "", matTimeMin: "", liftVolume: "", notes: "" });
    setShowAddDialog(false);
  };

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
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
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

      <Tabs defaultValue="log" className="space-y-6">
        <TabsList>
          <TabsTrigger value="log">Activity Log</TabsTrigger>
          <TabsTrigger value="protocol">Lifting Protocol</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-3">
          {logs.map((log, i) => {
            const accentColor = getWorkoutAccentColor(log.workoutType);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="gradient-border shadow-inner-glow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div
                        className="w-1 shrink-0 rounded-l-xl"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div className="flex items-center justify-between flex-1 p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{log.workoutType}</p>
                            {log.beltRank && (
                              <Badge variant="outline" className="text-xs">{log.beltRank} Belt</Badge>
                            )}
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {new Date(log.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                        </div>
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
                          {log.matTimeMin && (
                            <div>
                              <p className="text-xs text-[var(--muted-foreground)]">Mat</p>
                              <p className="text-sm font-semibold" style={{ color: "var(--rose)" }}>{log.matTimeMin}m</p>
                            </div>
                          )}
                          {log.liftVolume && (
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

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

      {/* Add Log Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                  value={newLog.sleepScore}
                  onChange={(e) => setNewLog({ ...newLog, sleepScore: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Calories</label>
                <Input
                  type="number"
                  value={newLog.calories}
                  onChange={(e) => setNewLog({ ...newLog, calories: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Workout Type</label>
              <Select
                value={newLog.workoutType}
                onValueChange={(val) => setNewLog({ ...newLog, workoutType: val })}
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
                  <SelectItem value="Rest Day">Rest Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Zone 2 (min)</label>
                <Input
                  type="number"
                  value={newLog.zone2Minutes}
                  onChange={(e) => setNewLog({ ...newLog, zone2Minutes: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Mat Time (min)</label>
                <Input
                  type="number"
                  value={newLog.matTimeMin}
                  onChange={(e) => setNewLog({ ...newLog, matTimeMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Lift Volume (kg)</label>
                <Input
                  type="number"
                  value={newLog.liftVolume}
                  onChange={(e) => setNewLog({ ...newLog, liftVolume: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Notes</label>
              <Input
                value={newLog.notes}
                onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                placeholder="Any notes..."
              />
            </div>
            <Button onClick={addLog} className="w-full">Log Entry</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
