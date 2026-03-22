"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  GripVertical,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGoalStore, type Goal, type GoalType } from "@/stores/goals";

/* ------------------------------------------------------------------ */
/*  Sortable Goal Card                                                 */
/* ------------------------------------------------------------------ */

function SortableGoalCard({
  goal,
  onToggle,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
    >
      <Card className="group">
        <CardContent className="p-4 flex items-start gap-3">
          {/* Drag handle */}
          <button
            className="mt-0.5 cursor-grab active:cursor-grabbing touch-none text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Checkbox */}
          <button
            onClick={onToggle}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              goal.status === "COMPLETED"
                ? "border-[var(--cyan)] bg-[var(--cyan)]"
                : "border-[var(--border)] hover:border-[var(--violet)]"
            }`}
          >
            {goal.status === "COMPLETED" && (
              <Check className="h-3 w-3 text-white" />
            )}
          </button>

          {/* Content - click title to edit */}
          <div className="flex-1 min-w-0">
            <button
              onClick={onEdit}
              className="text-left w-full group/title"
            >
              <p
                className={`text-sm font-medium transition-colors group-hover/title:text-[var(--violet)] ${
                  goal.status === "COMPLETED"
                    ? "line-through text-[var(--muted-foreground)]"
                    : ""
                }`}
              >
                {goal.title}
              </p>
            </button>
            {goal.description && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {goal.description}
              </p>
            )}
            {goal.targetDate && (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Due: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Delete button */}
          <button
            onClick={onDelete}
            className="mt-0.5 text-[var(--muted-foreground)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Static Goal Card (for vision items — no drag)                      */
/* ------------------------------------------------------------------ */

function VisionCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-[var(--secondary)] px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-[var(--amber)] shrink-0" />
      <button onClick={onEdit} className="flex-1 text-left group/title">
        <span className="text-sm transition-colors group-hover/title:text-[var(--amber)]">
          {goal.title}
        </span>
      </button>
      <button
        onClick={onDelete}
        className="text-[var(--muted-foreground)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sortable list wrapper with DndContext                              */
/* ------------------------------------------------------------------ */

function SortableGoalList({
  goals,
  allGoals,
  onDragEnd,
  onToggle,
  onEdit,
  onDelete,
}: {
  goals: Goal[];
  allGoals: Goal[];
  onDragEnd: (event: DragEndEvent) => void;
  onToggle: (id: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={goals.map((g) => g.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          <AnimatePresence>
            {goals.map((goal) => (
              <SortableGoalCard
                key={goal.id}
                goal={goal}
                onToggle={() => onToggle(goal.id)}
                onEdit={() => onEdit(goal)}
                onDelete={() => onDelete(goal.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, reorderGoals } =
    useGoalStore();

  /* ----- Derived data ----- */
  const visionGoals = useMemo(
    () =>
      goals
        .filter((g) => g.type === "VISION")
        .sort((a, b) => a.order - b.order),
    [goals]
  );

  const questGoals = useMemo(
    () =>
      goals
        .filter((g) => g.type === "QUARTERLY_QUEST")
        .sort((a, b) => a.order - b.order),
    [goals]
  );

  const weeklyGoals = useMemo(
    () =>
      goals
        .filter((g) => g.type === "WEEKLY")
        .sort((a, b) => a.order - b.order),
    [goals]
  );

  const inProgressQuests = useMemo(
    () => questGoals.filter((q) => q.status === "IN_PROGRESS"),
    [questGoals]
  );

  const completedQuests = useMemo(
    () => questGoals.filter((q) => q.status === "COMPLETED"),
    [questGoals]
  );

  const inProgressWeekly = useMemo(
    () => weeklyGoals.filter((w) => w.status === "IN_PROGRESS"),
    [weeklyGoals]
  );

  const completedWeekly = useMemo(
    () => weeklyGoals.filter((w) => w.status === "COMPLETED"),
    [weeklyGoals]
  );

  /* ----- Progress calculations ----- */
  const questPct =
    questGoals.length > 0
      ? (completedQuests.length / questGoals.length) * 100
      : 0;

  const weeklyPct =
    weeklyGoals.length > 0
      ? (completedWeekly.length / weeklyGoals.length) * 100
      : 0;

  const visionPct =
    visionGoals.length > 0
      ? (visionGoals.filter((v) => v.status === "COMPLETED").length /
          visionGoals.length) *
        100
      : 0;

  /* ----- UI state ----- */
  const [visionExpanded, setVisionExpanded] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Add form
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
  const [newGoalType, setNewGoalType] = useState<GoalType>("QUARTERLY_QUEST");

  // Edit form
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");

  /* ----- Handlers ----- */
  const handleToggle = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    updateGoal(id, {
      status: goal.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
    });
  };

  const handleAdd = () => {
    if (!newGoalTitle.trim()) return;

    const goalsOfType = goals.filter((g) => g.type === newGoalType);
    const maxOrder = goalsOfType.reduce(
      (max, g) => Math.max(max, g.order),
      -1
    );

    addGoal({
      id: crypto.randomUUID(),
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim() || null,
      targetDate: newGoalTargetDate || null,
      type: newGoalType,
      status: "IN_PROGRESS",
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    });

    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalTargetDate("");
    setShowAddDialog(false);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDescription(goal.description ?? "");
    setEditTargetDate(goal.targetDate ?? "");
    setShowEditDialog(true);
  };

  const handleEditSave = () => {
    if (!editingGoal || !editTitle.trim()) return;
    updateGoal(editingGoal.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      targetDate: editTargetDate || null,
    });
    setShowEditDialog(false);
    setEditingGoal(null);
  };

  const handleDelete = (id: string) => {
    removeGoal(id);
  };

  /* ----- Drag end: reorder within a filtered list ----- */
  const handleDragEnd =
    (filteredGoals: Goal[]) => (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = filteredGoals.findIndex((g) => g.id === active.id);
      const newIndex = filteredGoals.findIndex((g) => g.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(filteredGoals, oldIndex, newIndex).map(
        (g, i) => ({ ...g, order: i })
      );

      // Merge reordered subset back into full goals list
      const reorderedIds = new Set(reordered.map((g) => g.id));
      const otherGoals = goals.filter((g) => !reorderedIds.has(g.id));
      reorderGoals([...otherGoals, ...reordered]);
    };

  /* ----- Sensors ----- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
            System 1
          </p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Goals & Vision
          </h1>
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

        {/* ==================== QUARTERLY QUESTS TAB ==================== */}
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
                    <CardDescription>
                      Your north star directions
                      {visionGoals.length > 0 && (
                        <span className="ml-2 text-[var(--amber)]">
                          {Math.round(visionPct)}% complete
                        </span>
                      )}
                    </CardDescription>
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
                    {visionGoals.map((v) => (
                      <VisionCard
                        key={v.id}
                        goal={v}
                        onEdit={() => openEdit(v)}
                        onDelete={() => handleDelete(v.id)}
                      />
                    ))}
                    {visionGoals.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                        No vision goals yet. Add one to get started.
                      </p>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Quarterly Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Q1 2026 Quests</h2>
              <span className="text-sm text-[var(--muted-foreground)]">
                {completedQuests.length}/{questGoals.length} completed
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[#A78BFA]"
                initial={{ width: 0 }}
                animate={{ width: `${questPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* In Progress Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--violet)]" />
                <h3 className="text-sm font-medium">In Progress</h3>
                <Badge variant="secondary" className="text-xs">
                  {inProgressQuests.length}
                </Badge>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd(inProgressQuests)}
              >
                <SortableContext
                  items={inProgressQuests.map((g) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    <AnimatePresence>
                      {inProgressQuests.map((quest) => (
                        <SortableGoalCard
                          key={quest.id}
                          goal={quest}
                          onToggle={() => handleToggle(quest.id)}
                          onEdit={() => openEdit(quest)}
                          onDelete={() => handleDelete(quest.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </DndContext>
              {inProgressQuests.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  All quests completed!
                </p>
              )}
            </div>

            {/* Completed Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--cyan)]" />
                <h3 className="text-sm font-medium">Completed</h3>
                <Badge variant="success" className="text-xs">
                  {completedQuests.length}
                </Badge>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd(completedQuests)}
              >
                <SortableContext
                  items={completedQuests.map((g) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    <AnimatePresence>
                      {completedQuests.map((quest) => (
                        <SortableGoalCard
                          key={quest.id}
                          goal={quest}
                          onToggle={() => handleToggle(quest.id)}
                          onEdit={() => openEdit(quest)}
                          onDelete={() => handleDelete(quest.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </DndContext>
              {completedQuests.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  No completed quests yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ==================== THIS WEEK TAB ==================== */}
        <TabsContent value="weekly" className="space-y-6">
          {/* Weekly Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Weekly Progress</h2>
              <span className="text-sm text-[var(--muted-foreground)]">
                {completedWeekly.length}/{weeklyGoals.length} completed ({Math.round(weeklyPct)}%)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--cyan)] to-[#67E8F9]"
                initial={{ width: 0 }}
                animate={{ width: `${weeklyPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Balanced Week Blueprint
              </CardTitle>
              <CardDescription>
                Tasks extracted from your active quarterly quests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* In Progress */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[var(--violet)]" />
                    <h3 className="text-sm font-medium">To Do</h3>
                    <Badge variant="secondary" className="text-xs">
                      {inProgressWeekly.length}
                    </Badge>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd(inProgressWeekly)}
                  >
                    <SortableContext
                      items={inProgressWeekly.map((g) => g.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        <AnimatePresence>
                          {inProgressWeekly.map((w) => (
                            <SortableGoalCard
                              key={w.id}
                              goal={w}
                              onToggle={() => handleToggle(w.id)}
                              onEdit={() => openEdit(w)}
                              onDelete={() => handleDelete(w.id)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                  {inProgressWeekly.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                      All done this week!
                    </p>
                  )}
                </div>

                {/* Completed */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[var(--cyan)]" />
                    <h3 className="text-sm font-medium">Done</h3>
                    <Badge variant="success" className="text-xs">
                      {completedWeekly.length}
                    </Badge>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd(completedWeekly)}
                  >
                    <SortableContext
                      items={completedWeekly.map((g) => g.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        <AnimatePresence>
                          {completedWeekly.map((w) => (
                            <SortableGoalCard
                              key={w.id}
                              goal={w}
                              onToggle={() => handleToggle(w.id)}
                              onEdit={() => openEdit(w)}
                              onDelete={() => handleDelete(w.id)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </SortableContext>
                  </DndContext>
                  {completedWeekly.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                      No completed items yet.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== ADD GOAL DIALOG ==================== */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Create a new goal in your system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="What do you want to achieve?"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description{" "}
                <span className="text-[var(--muted-foreground)] font-normal">
                  (optional)
                </span>
              </label>
              <Input
                placeholder="Add details or context..."
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Target Date{" "}
                <span className="text-[var(--muted-foreground)] font-normal">
                  (optional)
                </span>
              </label>
              <Input
                type="date"
                value={newGoalTargetDate}
                onChange={(e) => setNewGoalTargetDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                {(["VISION", "QUARTERLY_QUEST", "WEEKLY"] as const).map(
                  (type) => (
                    <Button
                      key={type}
                      variant={newGoalType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewGoalType(type)}
                    >
                      {type === "VISION"
                        ? "Vision"
                        : type === "QUARTERLY_QUEST"
                          ? "Quest"
                          : "Weekly"}
                    </Button>
                  )
                )}
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full">
              Add Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== EDIT GOAL DIALOG ==================== */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your goal details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Goal title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description{" "}
                <span className="text-[var(--muted-foreground)] font-normal">
                  (optional)
                </span>
              </label>
              <Input
                placeholder="Add details or context..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Target Date{" "}
                <span className="text-[var(--muted-foreground)] font-normal">
                  (optional)
                </span>
              </label>
              <Input
                type="date"
                value={editTargetDate}
                onChange={(e) => setEditTargetDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEditSave} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingGoal(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
