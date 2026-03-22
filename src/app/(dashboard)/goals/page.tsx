"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
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

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: "VISION" | "QUARTERLY_QUEST" | "WEEKLY";
  status: "IN_PROGRESS" | "COMPLETED";
  targetDate?: string;
}

// Demo data
const demoVision: Goal[] = [
  { id: "v1", title: "Become a tenured professor in kinesiology", type: "VISION", status: "IN_PROGRESS" },
  { id: "v2", title: "Build a nationally competitive D1 throws program", type: "VISION", status: "IN_PROGRESS" },
  { id: "v3", title: "Achieve financial independence through LLC + investments", type: "VISION", status: "IN_PROGRESS" },
];

const demoQuests: Goal[] = [
  { id: "q1", title: "Publish biomechanics research paper", description: "Submit to Journal of Sports Science", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30" },
  { id: "q2", title: "Recruit 3 elite-level throwers", description: "Focus on shot put and discus athletes", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30" },
  { id: "q3", title: "Complete Smolov squat cycle", description: "Target: 500lb squat", type: "QUARTERLY_QUEST", status: "COMPLETED", targetDate: "2026-03-31" },
  { id: "q4", title: "Set up automated investment pipeline", description: "Monthly auto-invest into index funds", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30" },
  { id: "q5", title: "Earn next Jiu-Jitsu belt promotion", description: "3x/week mat time minimum", type: "QUARTERLY_QUEST", status: "IN_PROGRESS", targetDate: "2026-06-30" },
];

const demoWeekly: Goal[] = [
  { id: "w1", title: "Draft intro section of paper", type: "WEEKLY", status: "IN_PROGRESS" },
  { id: "w2", title: "Contact recruits from Texas meet", type: "WEEKLY", status: "IN_PROGRESS" },
  { id: "w3", title: "Squat session: Week 2, Day 1", type: "WEEKLY", status: "COMPLETED" },
  { id: "w4", title: "Review investment allocations", type: "WEEKLY", status: "IN_PROGRESS" },
];

function GoalCard({ goal, onToggle }: { goal: Goal; onToggle: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      <Card className="group">
        <CardContent className="p-4 flex items-start gap-3">
          <button
            onClick={onToggle}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              goal.status === "COMPLETED"
                ? "border-[var(--cyan)] bg-[var(--cyan)]"
                : "border-[var(--border)] hover:border-[var(--violet)]"
            }`}
          >
            {goal.status === "COMPLETED" && <Check className="h-3 w-3 text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${goal.status === "COMPLETED" ? "line-through text-[var(--muted-foreground)]" : ""}`}>
              {goal.title}
            </p>
            {goal.description && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{goal.description}</p>
            )}
            {goal.targetDate && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Due: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <GripVertical className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GoalsPage() {
  const [vision, setVision] = useState(demoVision);
  const [quests, setQuests] = useState(demoQuests);
  const [weekly, setWeekly] = useState(demoWeekly);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalType, setNewGoalType] = useState<"VISION" | "QUARTERLY_QUEST" | "WEEKLY">("QUARTERLY_QUEST");
  const [visionExpanded, setVisionExpanded] = useState(true);

  const toggleGoal = (list: Goal[], setList: React.Dispatch<React.SetStateAction<Goal[]>>, id: string) => {
    setList(
      list.map((g) =>
        g.id === id
          ? { ...g, status: g.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED" }
          : g
      )
    );
  };

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: newGoalTitle,
      type: newGoalType,
      status: "IN_PROGRESS",
    };
    if (newGoalType === "VISION") setVision([...vision, newGoal]);
    else if (newGoalType === "QUARTERLY_QUEST") setQuests([...quests, newGoal]);
    else setWeekly([...weekly, newGoal]);
    setNewGoalTitle("");
    setShowAddDialog(false);
  };

  const completedQuests = quests.filter((q) => q.status === "COMPLETED").length;
  const totalQuests = quests.length;
  const pct = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">System 1</p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Goals & Vision</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Your 3-year vision broken into quarterly quests
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="space-y-6">
        <TabsList>
          <TabsTrigger value="kanban">Quarterly Quests</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="space-y-6">
          {/* Vision Section */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setVisionExpanded(!visionExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[var(--amber)]" />
                  <div>
                    <CardTitle className="text-base">3-Year Vision</CardTitle>
                    <CardDescription>Your north star directions</CardDescription>
                  </div>
                </div>
                {visionExpanded ? (
                  <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                )}
              </div>
            </CardHeader>
            <AnimatePresence>
              {visionExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <CardContent className="space-y-2">
                    {vision.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] px-4 py-3"
                      >
                        <div className="h-2 w-2 rounded-full bg-[var(--amber)]" />
                        <span className="text-sm">{v.title}</span>
                      </div>
                    ))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Quarterly Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Q1 2026 Quests</h2>
              <span className="text-sm text-[var(--muted-foreground)]">
                {completedQuests}/{totalQuests} completed
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[#A78BFA]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--violet)]" />
                <h3 className="text-sm font-medium">In Progress</h3>
                <Badge variant="secondary" className="text-xs">
                  {quests.filter((q) => q.status === "IN_PROGRESS").length}
                </Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {quests
                    .filter((q) => q.status === "IN_PROGRESS")
                    .map((quest) => (
                      <GoalCard
                        key={quest.id}
                        goal={quest}
                        onToggle={() => toggleGoal(quests, setQuests, quest.id)}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--cyan)]" />
                <h3 className="text-sm font-medium">Completed</h3>
                <Badge variant="success" className="text-xs">
                  {quests.filter((q) => q.status === "COMPLETED").length}
                </Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {quests
                    .filter((q) => q.status === "COMPLETED")
                    .map((quest) => (
                      <GoalCard
                        key={quest.id}
                        goal={quest}
                        onToggle={() => toggleGoal(quests, setQuests, quest.id)}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Balanced Week Blueprint</CardTitle>
              <CardDescription>
                Tasks extracted from your active quarterly quests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AnimatePresence>
                {weekly.map((w) => (
                  <GoalCard
                    key={w.id}
                    goal={w}
                    onToggle={() => toggleGoal(weekly, setWeekly, w.id)}
                  />
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>Create a new goal in your system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="What do you want to achieve?"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
            />
            <div className="flex gap-2">
              {(["VISION", "QUARTERLY_QUEST", "WEEKLY"] as const).map((type) => (
                <Button
                  key={type}
                  variant={newGoalType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewGoalType(type)}
                >
                  {type === "VISION" ? "Vision" : type === "QUARTERLY_QUEST" ? "Quest" : "Weekly"}
                </Button>
              ))}
            </div>
            <Button onClick={addGoal} className="w-full">
              Add Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
