"use client";

import { motion } from "framer-motion";
import {
  Target,
  Clock,
  Heart,
  Users,
  DollarSign,
  ChevronRight,
  Zap,
  Moon,
  Dumbbell,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const offset = circumference - (value / 100) * circumference;

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
        <motion.div variants={item}>
          <Card className="flex items-center gap-5 p-5">
            <ProgressRing value={75} color="var(--violet)" size={52} strokeWidth={4}>
              <Zap className="h-4 w-4 text-[var(--violet)]" />
            </ProgressRing>
            <div>
              <p className="text-2xl font-bold">6.5h</p>
              <p className="text-xs text-[var(--muted-foreground)]">Deep Work Today</p>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="flex items-center gap-5 p-5">
            <ProgressRing value={60} color="var(--cyan)" size={52} strokeWidth={4}>
              <TrendingUp className="h-4 w-4 text-[var(--cyan)]" />
            </ProgressRing>
            <div>
              <p className="text-2xl font-bold">3/5</p>
              <p className="text-xs text-[var(--muted-foreground)]">Quests On Track</p>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="flex items-center gap-5 p-5">
            <ProgressRing value={85} color="var(--rose)" size={52} strokeWidth={4}>
              <Heart className="h-4 w-4 text-[var(--rose)]" />
            </ProgressRing>
            <div>
              <p className="text-2xl font-bold">8.5</p>
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
              <p className="text-3xl font-bold">60%</p>
              <span className="text-xs text-[var(--muted-foreground)]">Q1 2026 Progress</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[#A78BFA]"
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="default">4 Active</Badge>
              <Badge variant="success">1 Complete</Badge>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Moon className="h-3.5 w-3.5 text-[#BF5AF2]" />
                <span className="text-xs text-[var(--muted-foreground)]">Sleep</span>
              </div>
              <p className="text-xl font-bold">8<span className="text-sm font-normal text-[var(--muted-foreground)]">/10</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--cyan)]" />
                <span className="text-xs text-[var(--muted-foreground)]">Zone 2</span>
              </div>
              <p className="text-xl font-bold">35<span className="text-sm font-normal text-[var(--muted-foreground)]"> min</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-3.5 w-3.5 text-[var(--amber)]" />
                <span className="text-xs text-[var(--muted-foreground)]">Workout</span>
              </div>
              <p className="text-lg font-bold">Squat Day</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-[var(--rose)]" />
                <span className="text-xs text-[var(--muted-foreground)]">Mat Time</span>
              </div>
              <p className="text-xl font-bold">60<span className="text-sm font-normal text-[var(--muted-foreground)]"> min</span></p>
            </div>
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
              <p className="text-2xl font-bold">6</p>
              <span className="text-xs text-[var(--muted-foreground)]">blocks today</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Deep Work", time: "9:00–11:30", color: "#5E5CE6" },
                { label: "Fitness", time: "12:00–13:00", color: "#30D158" },
                { label: "Lecture Prep", time: "14:00–16:00", color: "#FF9F0A" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="text-xs text-[var(--muted-foreground)] flex-1">{b.label}</span>
                  <span className="text-xs font-medium tabular-nums">{b.time}</span>
                </div>
              ))}
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
              <Badge variant="warning">3 overdue</Badge>
            </div>
            <div className="space-y-2">
              {[
                { name: "Alex M.", days: 12, color: "#30D158" },
                { name: "Sarah K.", days: 5, color: "#FF9F0A" },
                { name: "Coach D.", days: 3, color: "#BF5AF2" },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: p.color }}>
                    {p.name.charAt(0)}
                  </div>
                  <span className="text-xs flex-1">{p.name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{p.days}d ago</span>
                </div>
              ))}
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
              <p className="text-2xl font-bold">2</p>
              <span className="text-xs text-[var(--muted-foreground)]">active rules</span>
            </div>
            <div className="space-y-2">
              {[
                { source: "University Salary", status: "Auto-split" },
                { source: "LLC Revenue", status: "Auto-split" },
              ].map((r) => (
                <div key={r.source} className="flex items-center justify-between">
                  <span className="text-xs">{r.source}</span>
                  <Badge variant="success" className="text-[10px]">{r.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>
      </motion.div>
    </div>
  );
}
