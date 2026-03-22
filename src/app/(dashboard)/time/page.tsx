"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle, Trash2, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimeBlockStore } from "@/stores/time-blocks";
import type { BlockCategory } from "@/stores/time-blocks";

const categoryColors: Record<string, string> = {
  DEEP_WORK: "#7C5CFC",
  FITNESS: "#06D6A0",
  SOCIAL: "#FFB347",
  ADMIN: "#6B6B80",
};

const categoryLabels: Record<string, string> = {
  DEEP_WORK: "Deep Work",
  FITNESS: "Fitness",
  SOCIAL: "Social",
  ADMIN: "Admin",
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_HEIGHT = 60;
const START_HOUR = 6;
const END_HOUR = 22;
const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

function formatHour(h: number): string {
  const whole = Math.floor(h);
  const minutes = Math.round((h - whole) * 60);
  const ampm = whole >= 12 ? "PM" : "AM";
  const display = whole % 12 || 12;
  if (minutes === 0) return `${display}${ampm}`;
  return `${display}:${minutes.toString().padStart(2, "0")}${ampm}`;
}

function getTodayDayOfWeek(): number {
  const d = new Date().getDay();
  // Convert Sunday=0 to 6, Monday=1 to 0, etc.
  return d === 0 ? 6 : d - 1;
}

export default function TimePage() {
  const { blocks, addBlock, updateBlock, removeBlock, addReview, reviews } =
    useTimeBlockStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showPastReviews, setShowPastReviews] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formData, setFormData] = useState({
    title: "",
    category: "DEEP_WORK" as BlockCategory,
    startHour: 9,
    endHour: 10,
    dayOfWeek: 0,
  });

  const [reviewAnswers, setReviewAnswers] = useState({
    adherence: "",
    wins: "",
    adjustments: "",
  });

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const todayCol = getTodayDayOfWeek();

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    blocks.forEach((b) => {
      const hrs = b.endHour - b.startHour;
      stats[b.category] = (stats[b.category] || 0) + hrs;
    });
    return stats;
  }, [blocks]);

  const totalHours = useMemo(
    () => Object.values(categoryStats).reduce((a, b) => a + b, 0),
    [categoryStats]
  );

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      category: "DEEP_WORK",
      startHour: 9,
      endHour: 10,
      dayOfWeek: 0,
    });
  }, []);

  const handleAddBlock = () => {
    if (!formData.title.trim()) return;
    if (formData.endHour <= formData.startHour) return;
    addBlock({
      id: crypto.randomUUID(),
      title: formData.title,
      category: formData.category,
      startHour: formData.startHour,
      endHour: formData.endHour,
      dayOfWeek: formData.dayOfWeek,
      color: categoryColors[formData.category],
    });
    resetForm();
    setShowAddDialog(false);
  };

  const handleEditBlock = () => {
    if (!editingBlockId || !formData.title.trim()) return;
    if (formData.endHour <= formData.startHour) return;
    updateBlock(editingBlockId, {
      title: formData.title,
      category: formData.category,
      startHour: formData.startHour,
      endHour: formData.endHour,
      dayOfWeek: formData.dayOfWeek,
      color: categoryColors[formData.category],
    });
    setShowEditDialog(false);
    setEditingBlockId(null);
    resetForm();
  };

  const handleDeleteBlock = () => {
    if (!editingBlockId) return;
    removeBlock(editingBlockId);
    setShowEditDialog(false);
    setEditingBlockId(null);
    resetForm();
  };

  const openEditDialog = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    setEditingBlockId(blockId);
    setFormData({
      title: block.title,
      category: block.category,
      startHour: block.startHour,
      endHour: block.endHour,
      dayOfWeek: block.dayOfWeek,
    });
    setShowEditDialog(true);
  };

  const handleSubmitReview = () => {
    const adherence = parseInt(reviewAnswers.adherence);
    if (isNaN(adherence) || adherence < 1 || adherence > 10) return;
    if (!reviewAnswers.wins.trim() && !reviewAnswers.adjustments.trim()) return;
    addReview({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      adherence,
      wins: reviewAnswers.wins,
      adjustments: reviewAnswers.adjustments,
    });
    setReviewAnswers({ adherence: "", wins: "", adjustments: "" });
    setShowReviewDialog(false);
  };

  // Current time indicator position
  const now = currentTime;
  const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
  const showTimeIndicator =
    currentHourDecimal >= START_HOUR && currentHourDecimal <= END_HOUR;
  const timeIndicatorTop = (currentHourDecimal - START_HOUR) * HOUR_HEIGHT;

  // Block form shared between add and edit dialogs
  const blockFormContent = (
    <div className="space-y-4 pt-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
          Title
        </label>
        <Input
          placeholder="Block title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
          Category
        </label>
        <Select
          value={formData.category}
          onValueChange={(val) =>
            setFormData({ ...formData, category: val as BlockCategory })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEEP_WORK">Deep Work</SelectItem>
            <SelectItem value="FITNESS">Fitness</SelectItem>
            <SelectItem value="SOCIAL">Social</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
          Day
        </label>
        <Select
          value={String(formData.dayOfWeek)}
          onValueChange={(val) =>
            setFormData({ ...formData, dayOfWeek: parseInt(val) })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {days.map((d, i) => (
              <SelectItem key={i} value={String(i)}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
            Start Hour
          </label>
          <Input
            type="number"
            min={START_HOUR}
            max={END_HOUR}
            step={0.25}
            value={formData.startHour}
            onChange={(e) =>
              setFormData({ ...formData, startHour: parseFloat(e.target.value) })
            }
          />
          <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 block">
            {formatHour(formData.startHour)}
          </span>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
            End Hour
          </label>
          <Input
            type="number"
            min={START_HOUR}
            max={END_HOUR}
            step={0.25}
            value={formData.endHour}
            onChange={(e) =>
              setFormData({ ...formData, endHour: parseFloat(e.target.value) })
            }
          />
          <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 block">
            {formatHour(formData.endHour)}
          </span>
        </div>
      </div>
      {formData.endHour <= formData.startHour && (
        <p className="text-xs text-red-400">End time must be after start time.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
            System 2
          </p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Time Management
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Weekly time blocking calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowReviewDialog(true)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Weekly Review
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </div>
      </div>

      {/* Category Summary */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryStats).map(([cat, hrs]) => (
          <div
            key={cat}
            className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2"
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: categoryColors[cat] }}
            />
            <span className="text-xs text-[var(--muted-foreground)]">
              {categoryLabels[cat]}: {hrs.toFixed(1)}h
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
          <Clock className="h-3 w-3 text-[var(--muted-foreground)]" />
          <span className="text-xs text-[var(--muted-foreground)]">
            Total: {totalHours.toFixed(1)}h
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day headers */}
            <div
              className="grid"
              style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
            >
              <div className="border-b border-r border-white/[0.06] bg-white/[0.02] h-10" />
              {days.map((day, idx) => {
                const isToday = idx === todayCol;
                return (
                  <div
                    key={day}
                    className={`border-b border-r border-white/[0.06] h-10 flex items-center justify-center text-sm font-medium ${
                      isToday
                        ? "bg-white/[0.06] text-white"
                        : "bg-white/[0.02] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {day}
                    {isToday && (
                      <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time grid body */}
            <div
              className="grid"
              style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}
            >
              {/* Hour labels column */}
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={`label-${hour}`}
                    className="border-b border-r border-white/[0.06] text-[11px] text-[var(--muted-foreground)] text-right pr-2 flex items-start justify-end pt-1"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {hour % 12 || 12}
                    {hour >= 12 ? "p" : "a"}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((_, dayIdx) => {
                const isToday = dayIdx === todayCol;
                const dayBlocks = blocks.filter(
                  (b) => b.dayOfWeek === dayIdx
                );

                return (
                  <div
                    key={`col-${dayIdx}`}
                    className="relative"
                    style={{
                      height: hours.length * HOUR_HEIGHT,
                      backgroundColor: isToday
                        ? "rgba(255,255,255,0.015)"
                        : undefined,
                    }}
                  >
                    {/* Hour grid lines */}
                    {hours.map((hour) => (
                      <div
                        key={`grid-${dayIdx}-${hour}`}
                        className="absolute left-0 right-0 border-b border-r border-white/[0.06]"
                        style={{
                          top: (hour - START_HOUR) * HOUR_HEIGHT,
                          height: HOUR_HEIGHT,
                        }}
                      />
                    ))}

                    {/* Time blocks */}
                    {dayBlocks.map((block) => {
                      const top =
                        (block.startHour - START_HOUR) * HOUR_HEIGHT;
                      const height =
                        (block.endHour - block.startHour) * HOUR_HEIGHT;

                      return (
                        <motion.div
                          key={block.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => openEditDialog(block.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            openEditDialog(block.id);
                          }}
                          className="absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer hover:brightness-125 transition-all overflow-hidden z-10"
                          style={{
                            top,
                            height,
                            backgroundColor: `${block.color}20`,
                            borderLeft: `3px solid ${block.color}`,
                            color: block.color,
                          }}
                        >
                          <div className="text-xs font-medium truncate leading-tight">
                            {block.title}
                          </div>
                          {height >= 30 && (
                            <div className="text-[10px] opacity-70 leading-tight">
                              {formatHour(block.startHour)} -{" "}
                              {formatHour(block.endHour)}
                            </div>
                          )}
                          {height >= 50 && (
                            <div className="text-[10px] opacity-50 mt-0.5">
                              {categoryLabels[block.category]}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}

                    {/* Current time indicator */}
                    {isToday && showTimeIndicator && (
                      <div
                        className="absolute left-0 right-0 z-20 pointer-events-none"
                        style={{ top: timeIndicatorTop }}
                      >
                        <div className="relative flex items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-[5px] shrink-0" />
                          <div className="h-[2px] bg-red-500 flex-1" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Past Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <button
              onClick={() => setShowPastReviews(!showPastReviews)}
              className="flex items-center justify-between w-full text-left"
            >
              <CardTitle className="text-base">
                Past Weekly Reviews ({reviews.length})
              </CardTitle>
              {showPastReviews ? (
                <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
              )}
            </button>
          </CardHeader>
          <AnimatePresence>
            {showPastReviews && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardContent className="space-y-3 pt-0">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg bg-white/[0.03] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <Badge variant="outline">
                          Adherence: {review.adherence}/10
                        </Badge>
                      </div>
                      {review.wins && (
                        <div>
                          <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                            Wins
                          </span>
                          <p className="text-sm mt-0.5">{review.wins}</p>
                        </div>
                      )}
                      {review.adjustments && (
                        <div>
                          <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
                            Adjustments
                          </span>
                          <p className="text-sm mt-0.5">
                            {review.adjustments}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Add Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
            <DialogDescription>
              Schedule a new block on your calendar
            </DialogDescription>
          </DialogHeader>
          {blockFormContent}
          <Button
            onClick={handleAddBlock}
            className="w-full mt-2"
            disabled={
              !formData.title.trim() ||
              formData.endHour <= formData.startHour
            }
          >
            Add Block
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setEditingBlockId(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Block</DialogTitle>
            <DialogDescription>
              Modify or delete this block
            </DialogDescription>
          </DialogHeader>
          {blockFormContent}
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleEditBlock}
              className="flex-1"
              disabled={
                !formData.title.trim() ||
                formData.endHour <= formData.startHour
              }
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteBlock}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weekly Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weekly Review</DialogTitle>
            <DialogDescription>
              Sunday 5PM check-in on schedule adherence
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
                How well did you follow your time blocks this week? (1-10)
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={reviewAnswers.adherence}
                onChange={(e) =>
                  setReviewAnswers({
                    ...reviewAnswers,
                    adherence: e.target.value,
                  })
                }
                placeholder="Rate 1-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
                What were your biggest wins?
              </label>
              <Input
                value={reviewAnswers.wins}
                onChange={(e) =>
                  setReviewAnswers({
                    ...reviewAnswers,
                    wins: e.target.value,
                  })
                }
                placeholder="List your wins..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block text-[var(--muted-foreground)]">
                What adjustments will you make next week?
              </label>
              <Input
                value={reviewAnswers.adjustments}
                onChange={(e) =>
                  setReviewAnswers({
                    ...reviewAnswers,
                    adjustments: e.target.value,
                  })
                }
                placeholder="Planned adjustments..."
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              className="w-full"
              disabled={
                !reviewAnswers.adherence ||
                isNaN(parseInt(reviewAnswers.adherence)) ||
                parseInt(reviewAnswers.adherence) < 1 ||
                parseInt(reviewAnswers.adherence) > 10
              }
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
