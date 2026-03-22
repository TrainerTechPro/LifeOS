"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Clock,
  Heart,
  Users,
  DollarSign,
  Zap,
  Moon,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useGoalStore } from "@/stores/goals";
import { useHealthStore } from "@/stores/health";
import { useTimeBlockStore } from "@/stores/time-blocks";
import { useRelationshipStore } from "@/stores/relationships";
import { useFinanceStore } from "@/stores/finance";

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } },
};

/* ------------------------------------------------------------------ */
/*  ProgressRing                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  BentoCard                                                          */
/* ------------------------------------------------------------------ */

function BentoCard({
  title,
  icon: Icon,
  href,
  color,
  glowClass,
  className,
  children,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
  color: string;
  glowClass?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={item} className={className}>
      <Link href={href}>
        <Card className={`group h-full cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:${glowClass}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                {title}
              </CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatHour(h: number): string {
  const hr = Math.floor(h);
  const min = Math.round((h - hr) * 60);
  const suffix = hr >= 12 ? "PM" : "AM";
  const display = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return min > 0 ? `${display}:${String(min).padStart(2, "0")}${suffix}` : `${display}${suffix}`;
}

function daysBetween(dateStr: string, now: Date): number {
  const d = new Date(dateStr + "T00:00:00");
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const CATEGORY_COLORS: Record<string, string> = {
  DEEP_WORK: "#7C5CFC",
  FITNESS: "#06D6A0",
  SOCIAL: "#FFB347",
  ADMIN: "#6B6B80",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TodayPage() {
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  /* ---------- Store data ---------- */
  const goals = useGoalStore((s) => s.goals);
  const healthLogs = useHealthStore((s) => s.logs);
  const blocks = useTimeBlockStore((s) => s.blocks);
  const relationships = useRelationshipStore((s) => s.relationships);
  const financeRules = useFinanceStore((s) => s.rules);
  const paychecks = useFinanceStore((s) => s.paychecks);

  /* ---------- Computed: Deep Work Today ---------- */
  // dayOfWeek: 0=Mon in the store
  const todayDow = (now.getDay() + 6) % 7; // JS Sunday=0 -> store Mon=0
  const deepWorkHours = useMemo(() => {
    return blocks
      .filter((b) => b.category === "DEEP_WORK" && b.dayOfWeek === todayDow)
      .reduce((sum, b) => sum + (b.endHour - b.startHour), 0);
  }, [blocks, todayDow]);

  /* ---------- Computed: Quests ---------- */
  const quests = useMemo(() => goals.filter((g) => g.type === "QUARTERLY_QUEST"), [goals]);
  const questsCompleted = useMemo(() => quests.filter((g) => g.status === "COMPLETED").length, [quests]);
  const questsTotal = quests.length;
  const questPercent = questsTotal > 0 ? Math.round((questsCompleted / questsTotal) * 100) : 0;

  /* ---------- Computed: Health Score (avg sleep last 7 days) ---------- */
  const last7Logs = useMemo(() => {
    const sorted = [...healthLogs].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.slice(0, 7);
  }, [healthLogs]);

  const healthScore = useMemo(() => {
    if (last7Logs.length === 0) return 0;
    const sum = last7Logs.reduce((acc, l) => acc + l.sleepScore, 0);
    return parseFloat((sum / last7Logs.length).toFixed(1));
  }, [last7Logs]);

  /* ---------- Computed: Overdue Relationships ---------- */
  const overdueContacts = useMemo(() => {
    return relationships
      .map((r) => {
        const daysSince = r.lastContactDate ? daysBetween(r.lastContactDate, now) : 999;
        const overdueDays = daysSince - r.contactFrequency;
        return { ...r, daysSince, overdueDays };
      })
      .filter((r) => r.overdueDays > 0)
      .sort((a, b) => b.overdueDays - a.overdueDays);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relationships]);

  /* ---------- Computed: Today's blocks ---------- */
  const todayBlocks = useMemo(() => {
    return blocks
      .filter((b) => b.dayOfWeek === todayDow)
      .sort((a, b) => a.startHour - b.startHour);
  }, [blocks, todayDow]);

  /* ---------- Sparkline: Goals weekly completion ---------- */
  const goalsSparkData = useMemo(() => {
    const weeklyGoals = goals.filter((g) => g.type === "WEEKLY");
    // Group by createdAt week (use the date portion)
    const weekMap = new Map<string, { total: number; done: number }>();
    weeklyGoals.forEach((g) => {
      const weekKey = g.createdAt.slice(0, 10);
      const entry = weekMap.get(weekKey) || { total: 0, done: 0 };
      entry.total++;
      if (g.status === "COMPLETED") entry.done++;
      weekMap.set(weekKey, entry);
    });
    // Convert to array sorted by date
    return Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ value: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0 }));
  }, [goals]);

  /* ---------- Sparkline: Health sleep scores last 7 days ---------- */
  const healthSparkData = useMemo(() => {
    return [...last7Logs].reverse().map((l) => ({ value: l.sleepScore }));
  }, [last7Logs]);

  /* ---------- Sparkline: Finance monthly income ---------- */
  const financeSparkData = useMemo(() => {
    const monthMap = new Map<string, number>();
    paychecks.forEach((p) => {
      const monthKey = p.date.slice(0, 7); // "YYYY-MM"
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + p.grossAmount);
    });
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ value: v }));
  }, [paychecks]);

  /* ---------- Finance computed ---------- */
  const recentPaycheckSum = useMemo(() => {
    // Sum of paychecks in the current month
    const currentMonth = now.toISOString().slice(0, 7);
    return paychecks
      .filter((p) => p.date.startsWith(currentMonth))
      .reduce((sum, p) => sum + p.grossAmount, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paychecks]);

  /* ---------- Goals completion progress ---------- */
  const activeGoals = useMemo(() => goals.filter((g) => g.type === "QUARTERLY_QUEST" && g.status === "IN_PROGRESS").length, [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.type === "QUARTERLY_QUEST" && g.status === "COMPLETED").length, [goals]);

  /* ---------- Weekly Health Streak ---------- */
  const streakData = useMemo(() => {
    const days: { label: string; logged: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const logged = healthLogs.some((l) => l.date === dateKey);
      days.push({ label: dayLabel, logged });
    }
    return days;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthLogs]);

  const streakCount = streakData.filter((d) => d.logged).length;

  /* ---------- Relationship colors ---------- */
  const REL_COLORS: Record<string, string> = {
    SPOUSE: "#FF6B8A",
    FAMILY: "#BF5AF2",
    FRIEND: "#30D158",
    COLLEAGUE: "#FFB347",
    MENTOR: "#4DA8FF",
  };

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="space-y-2"
      >
        <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
          {dateStr}
        </p>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          {greeting}
        </h1>
      </motion.div>

      {/* Quick Stats - Progress Rings */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-4"
      >
        {/* Deep Work Today */}
        <motion.div variants={item}>
          <Card className="flex items-center gap-5 p-5">
            <ProgressRing value={Math.min((deepWorkHours / 8) * 100, 100)} color="var(--violet)" size={52} strokeWidth={4}>
              <Zap className="h-4 w-4 text-[var(--violet)]" />
            </ProgressRing>
            <div>
              <p className="text-2xl font-bold">{deepWorkHours}h</p>
              <p className="text-xs text-[var(--muted-foreground)]">Deep Work Today</p>
            </div>
          </Card>
        </motion.div>

        {/* Quests On Track */}
        <motion.div variants={item}>
          <Card className="flex items-center gap-5 p-5">
            <ProgressRing value={questPercent} color="var(--cyan)" size={52} strokeWidth={4}>
              <TrendingUp className="h-4 w-4 text-[var(--cyan)]" />
            </ProgressRing>
            <div>
              <p className="text-2xl font-bold">{questsCompleted}/{questsTotal}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Quests On Track</p>
            </div>
          </Card>
        </motion.div>

        {/* Health Score */}
        <motion.div variants={item}>
          <Card className="flex items-center gap-5 p-5">
            <ProgressRing value={healthScore * 10} color="var(--rose)" size={52} strokeWidth={4}>
              <Heart className="h-4 w-4 text-[var(--rose)]" />
            </ProgressRing>
            <div>
              <p className="text-2xl font-bold">{healthScore}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Health Score</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bento-grid"
      >
        {/* Goals - Wide card */}
        <BentoCard
          title="Goals & Vision"
          icon={Target}
          href="/goals"
          color="#7C5CFC"
          glowClass="glow-violet"
          className="col-span-12 md:col-span-7"
        >
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold">{questPercent}%</p>
              <span className="text-xs text-[var(--muted-foreground)]">Quest Completion</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[#A78BFA]"
                initial={{ width: 0 }}
                animate={{ width: `${questPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="default">{activeGoals} Active</Badge>
                <Badge variant="success">{completedGoals} Complete</Badge>
              </div>
              {goalsSparkData.length > 1 && (
                <div className="w-24">
                  <ResponsiveContainer width="100%" height={40}>
                    <BarChart data={goalsSparkData}>
                      <Bar dataKey="value" fill="#7C5CFC" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Health - Compact */}
        <BentoCard
          title="Health OS"
          icon={Heart}
          href="/health"
          color="#FF6B8A"
          glowClass="glow-rose"
          className="col-span-12 md:col-span-5"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5 text-[#BF5AF2]" />
                  <span className="text-xs text-[var(--muted-foreground)]">Sleep Avg</span>
                </div>
                <p className="text-xl font-bold">
                  {healthScore}<span className="text-sm font-normal text-[var(--muted-foreground)]">/10</span>
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--cyan)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">Zone 2</span>
                </div>
                <p className="text-xl font-bold">
                  {last7Logs.length > 0 ? last7Logs[0].zone2Minutes : 0}
                  <span className="text-sm font-normal text-[var(--muted-foreground)]"> min</span>
                </p>
              </div>
              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-[var(--rose)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">Today</span>
                </div>
                <p className="text-lg font-bold">
                  {last7Logs.length > 0 ? last7Logs[0].workoutType : "No log yet"}
                </p>
              </div>
            </div>
            {healthSparkData.length > 1 && (
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={healthSparkData}>
                  <Line type="monotone" dataKey="value" stroke="#BF5AF2" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>

        {/* Time Blocks */}
        <BentoCard
          title="Time Blocks"
          icon={Clock}
          href="/time"
          color="#4DA8FF"
          glowClass="glow-blue"
          className="col-span-12 md:col-span-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{todayBlocks.length}</p>
              <span className="text-xs text-[var(--muted-foreground)]">blocks today</span>
            </div>
            <div className="space-y-2">
              {todayBlocks.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center gap-2.5">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[b.category] || b.color }}
                  />
                  <span className="text-xs text-[var(--muted-foreground)] flex-1 truncate">{b.title}</span>
                  <span className="text-xs font-medium tabular-nums">
                    {formatHour(b.startHour)}&ndash;{formatHour(b.endHour)}
                  </span>
                </div>
              ))}
              {todayBlocks.length > 4 && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  +{todayBlocks.length - 4} more
                </p>
              )}
              {todayBlocks.length === 0 && (
                <p className="text-xs text-[var(--muted-foreground)]">No blocks scheduled</p>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Relationships */}
        <BentoCard
          title="Relationships"
          icon={Users}
          href="/relationships"
          color="#34D399"
          glowClass="glow-cyan"
          className="col-span-12 md:col-span-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {overdueContacts.length > 0 ? (
                <Badge variant="warning">{overdueContacts.length} overdue</Badge>
              ) : (
                <Badge variant="success">All caught up</Badge>
              )}
            </div>
            <div className="space-y-2">
              {overdueContacts.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center gap-2.5">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: REL_COLORS[r.relationType] || "#6B6B80" }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <span className="text-xs flex-1 truncate">{r.name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{r.daysSince}d ago</span>
                </div>
              ))}
              {overdueContacts.length === 0 && (
                <p className="text-xs text-[var(--muted-foreground)]">No overdue contacts</p>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Finance */}
        <BentoCard
          title="Financial Autopilot"
          icon={DollarSign}
          href="/finance"
          color="#FFB347"
          glowClass="glow-amber"
          className="col-span-12 md:col-span-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{financeRules.length}</p>
              <span className="text-xs text-[var(--muted-foreground)]">active rules</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--muted-foreground)]">This month</span>
              <span className="text-sm font-bold">
                ${recentPaycheckSum.toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              {financeRules.map((r) => (
                <div key={r.id} className="flex items-center justify-between">
                  <span className="text-xs truncate">{r.incomeSource}</span>
                  <Badge variant="success" className="text-[10px]">Auto-split</Badge>
                </div>
              ))}
            </div>
            {financeSparkData.length > 1 && (
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={financeSparkData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFB347" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FFB347" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FFB347"
                    strokeWidth={1.5}
                    fill="url(#incomeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </BentoCard>
      </motion.div>

      {/* Weekly Health Streak */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28, delay: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--violet)]/10">
                <CheckCircle2 className="h-4 w-4 text-[var(--violet)]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)]">Weekly Health Streak</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {streakCount}/7 days logged this week
                </p>
              </div>
            </div>
            <Badge variant={streakCount === 7 ? "success" : streakCount >= 5 ? "default" : "warning"}>
              {streakCount === 7 ? "Perfect" : `${streakCount} days`}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            {streakData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
                  {d.label}
                </span>
                {d.logged ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.05, type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <CheckCircle2 className="h-6 w-6 text-[var(--cyan)]" />
                  </motion.div>
                ) : (
                  <Circle className="h-6 w-6 text-white/10" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
