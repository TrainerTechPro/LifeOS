"use client";

import { motion } from "framer-motion";
import {
  Target,
  Clock,
  Heart,
  Users,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 500, damping: 35 } },
};

function SystemCard({
  title,
  icon: Icon,
  href,
  color,
  children,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={item}>
      <Link href={href}>
        <Card className="group hover:border-[var(--primary)]/30 transition-all duration-300 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-[var(--muted-foreground)] mt-1">{dateStr}</p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-4"
      >
        <motion.div variants={item}>
          <Card className="text-center py-4">
            <div className="text-2xl font-bold text-[#0A84FF]">
              <Zap className="h-5 w-5 mx-auto mb-1" />
              Focus
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Deep Work Mode</p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="text-center py-4">
            <div className="text-2xl font-bold text-[#30D158]">
              <TrendingUp className="h-5 w-5 mx-auto mb-1" />
              On Track
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Weekly Progress</p>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="text-center py-4">
            <div className="text-2xl font-bold text-[#FF9F0A]">
              <Heart className="h-5 w-5 mx-auto mb-1" />
              7.5
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Health Score</p>
          </Card>
        </motion.div>
      </motion.div>

      {/* System Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <SystemCard
          title="Goals & Vision"
          icon={Target}
          href="/goals"
          color="#0A84FF"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Q1 2026 Progress</span>
              <span className="text-[var(--muted-foreground)]">3/5 quests</span>
            </div>
            <Progress value={60} />
            <div className="flex gap-2">
              <Badge variant="default">2 Active</Badge>
              <Badge variant="success">1 Complete</Badge>
            </div>
          </div>
        </SystemCard>

        <SystemCard
          title="Time Blocks"
          icon={Clock}
          href="/time"
          color="#5E5CE6"
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Today&apos;s Schedule</span>
              <Badge variant="secondary">6 blocks</Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#5E5CE6]" />
                <span className="text-[var(--muted-foreground)]">Deep Work: 9:00 - 11:30</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#30D158]" />
                <span className="text-[var(--muted-foreground)]">Fitness: 12:00 - 13:00</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#FF9F0A]" />
                <span className="text-[var(--muted-foreground)]">Lecture Prep: 14:00 - 16:00</span>
              </div>
            </div>
          </div>
        </SystemCard>

        <SystemCard
          title="Health OS"
          icon={Heart}
          href="/health"
          color="#FF453A"
        >
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[var(--muted-foreground)]">Sleep</p>
                <p className="text-lg font-semibold">8/10</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Zone 2</p>
                <p className="text-lg font-semibold">35 min</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Workout</p>
                <p className="text-lg font-semibold">Squat Day</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)]">Mat Time</p>
                <p className="text-lg font-semibold">60 min</p>
              </div>
            </div>
          </div>
        </SystemCard>

        <SystemCard
          title="Relationships"
          icon={Users}
          href="/relationships"
          color="#30D158"
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Overdue check-ins</span>
              <Badge variant="warning">3 people</Badge>
            </div>
            <div className="space-y-1.5 text-[var(--muted-foreground)]">
              <p>Alex M. - 12 days overdue</p>
              <p>Sarah K. - 5 days overdue</p>
              <p>Coach D. - 3 days overdue</p>
            </div>
          </div>
        </SystemCard>

        <SystemCard
          title="Financial Autopilot"
          icon={DollarSign}
          href="/finance"
          color="#FF9F0A"
        >
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Active Rules</span>
              <Badge variant="secondary">2 sources</Badge>
            </div>
            <div className="space-y-1.5 text-[var(--muted-foreground)]">
              <p>University Salary: Auto-split active</p>
              <p>LLC Revenue: Auto-split active</p>
            </div>
          </div>
        </SystemCard>
      </motion.div>
    </div>
  );
}
