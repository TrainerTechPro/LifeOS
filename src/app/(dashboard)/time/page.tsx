"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";
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

interface TimeBlock {
  id: string;
  title: string;
  category: string;
  startHour: number;
  endHour: number;
  dayOfWeek: number;
  color: string;
}

const categoryColors: Record<string, string> = {
  DEEP_WORK: "#5E5CE6",
  FITNESS: "#30D158",
  SOCIAL: "#FF9F0A",
  ADMIN: "#98989D",
};

const categoryLabels: Record<string, string> = {
  DEEP_WORK: "Deep Work",
  FITNESS: "Fitness",
  SOCIAL: "Social",
  ADMIN: "Admin",
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6AM to 9PM

const demoBlocks: TimeBlock[] = [
  { id: "1", title: "Kinesiology Lecture Prep", category: "DEEP_WORK", startHour: 7, endHour: 9, dayOfWeek: 0, color: "#5E5CE6" },
  { id: "2", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 0, color: "#5E5CE6" },
  { id: "3", title: "Strength Training", category: "FITNESS", startHour: 6, endHour: 7.5, dayOfWeek: 0, color: "#30D158" },
  { id: "4", title: "Research Writing", category: "DEEP_WORK", startHour: 9, endHour: 12, dayOfWeek: 1, color: "#5E5CE6" },
  { id: "5", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 1, color: "#5E5CE6" },
  { id: "6", title: "Jiu-Jitsu", category: "FITNESS", startHour: 18, endHour: 19.5, dayOfWeek: 1, color: "#30D158" },
  { id: "7", title: "Kinesiology Lecture", category: "DEEP_WORK", startHour: 8, endHour: 10, dayOfWeek: 2, color: "#5E5CE6" },
  { id: "8", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 2, color: "#5E5CE6" },
  { id: "9", title: "Strength Training", category: "FITNESS", startHour: 6, endHour: 7.5, dayOfWeek: 2, color: "#30D158" },
  { id: "10", title: "Zone 2 Cardio", category: "FITNESS", startHour: 7, endHour: 7.75, dayOfWeek: 3, color: "#30D158" },
  { id: "11", title: "Admin & Email", category: "ADMIN", startHour: 9, endHour: 10, dayOfWeek: 3, color: "#98989D" },
  { id: "12", title: "Recruit Calls", category: "SOCIAL", startHour: 10, endHour: 12, dayOfWeek: 3, color: "#FF9F0A" },
  { id: "13", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 3, color: "#5E5CE6" },
  { id: "14", title: "Jiu-Jitsu", category: "FITNESS", startHour: 18, endHour: 19.5, dayOfWeek: 3, color: "#30D158" },
  { id: "15", title: "Strength Training", category: "FITNESS", startHour: 6, endHour: 7.5, dayOfWeek: 4, color: "#30D158" },
  { id: "16", title: "D1 Team Coaching", category: "DEEP_WORK", startHour: 14, endHour: 17, dayOfWeek: 4, color: "#5E5CE6" },
  { id: "17", title: "Throws Practice", category: "FITNESS", startHour: 8, endHour: 10, dayOfWeek: 5, color: "#30D158" },
  { id: "18", title: "Family Time", category: "SOCIAL", startHour: 12, endHour: 17, dayOfWeek: 5, color: "#FF9F0A" },
  { id: "19", title: "Jiu-Jitsu Open Mat", category: "FITNESS", startHour: 10, endHour: 12, dayOfWeek: 6, color: "#30D158" },
  { id: "20", title: "Weekly Review", category: "ADMIN", startHour: 17, endHour: 18, dayOfWeek: 6, color: "#98989D" },
];

export default function TimePage() {
  const [blocks, setBlocks] = useState(demoBlocks);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [newBlock, setNewBlock] = useState({
    title: "",
    category: "DEEP_WORK",
    startHour: 9,
    endHour: 10,
    dayOfWeek: 0,
  });
  const [reviewAnswers, setReviewAnswers] = useState({
    adherence: "",
    wins: "",
    adjustments: "",
  });

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    blocks.forEach((b) => {
      const hours = b.endHour - b.startHour;
      stats[b.category] = (stats[b.category] || 0) + hours;
    });
    return stats;
  }, [blocks]);

  const addBlock = () => {
    if (!newBlock.title.trim()) return;
    const block: TimeBlock = {
      id: crypto.randomUUID(),
      ...newBlock,
      color: categoryColors[newBlock.category] || "#98989D",
    };
    setBlocks([...blocks, block]);
    setNewBlock({ title: "", category: "DEEP_WORK", startHour: 9, endHour: 10, dayOfWeek: 0 });
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Management</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Weekly time blocking calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowReviewDialog(true)}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Weekly Review
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Block
          </Button>
        </div>
      </div>

      {/* Category Summary */}
      <div className="flex gap-4">
        {Object.entries(categoryStats).map(([cat, hrs]) => (
          <div key={cat} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: categoryColors[cat] }}
            />
            <span className="text-xs text-[var(--muted-foreground)]">
              {categoryLabels[cat]}: {hrs}h
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div
            className="grid min-w-[800px]"
            style={{
              gridTemplateColumns: "60px repeat(7, 1fr)",
              gridTemplateRows: `40px repeat(${hours.length}, 48px)`,
            }}
          >
            {/* Header */}
            <div className="border-b border-r border-[var(--border)] p-2" />
            {days.map((day, i) => (
              <div
                key={day}
                className="border-b border-r border-[var(--border)] p-2 text-center text-sm font-medium"
              >
                {day}
              </div>
            ))}

            {/* Time rows */}
            {hours.map((hour) => (
              <>
                <div
                  key={`hour-${hour}`}
                  className="border-b border-r border-[var(--border)] p-1 text-xs text-[var(--muted-foreground)] text-right pr-2 flex items-center justify-end"
                >
                  {hour % 12 || 12}{hour >= 12 ? "p" : "a"}
                </div>
                {days.map((_, dayIdx) => (
                  <div
                    key={`cell-${hour}-${dayIdx}`}
                    className="relative border-b border-r border-[var(--border)]"
                  />
                ))}
              </>
            ))}

            {/* Blocks overlay */}
            {blocks.map((block) => {
              const topRow = (block.startHour - 6) + 1; // +1 for header
              const height = block.endHour - block.startHour;
              const col = block.dayOfWeek + 2; // +2 for time col + 0-index

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute rounded-lg px-2 py-1 text-xs font-medium overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                  style={{
                    gridColumn: col,
                    gridRow: `${topRow + 1} / span ${Math.ceil(height)}`,
                    backgroundColor: `${block.color}30`,
                    borderLeft: `3px solid ${block.color}`,
                    color: block.color,
                    position: "relative",
                  }}
                >
                  <div className="truncate">{block.title}</div>
                  <div className="text-[10px] opacity-70">
                    {block.startHour % 12 || 12}-{block.endHour % 12 || 12}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Block Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
            <DialogDescription>Schedule a new block on your calendar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Block title"
              value={newBlock.title}
              onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
            />
            <Select
              value={newBlock.category}
              onValueChange={(val) => setNewBlock({ ...newBlock, category: val })}
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
            <div className="grid grid-cols-3 gap-3">
              <Select
                value={String(newBlock.dayOfWeek)}
                onValueChange={(val) => setNewBlock({ ...newBlock, dayOfWeek: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d, i) => (
                    <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={6}
                max={21}
                value={newBlock.startHour}
                onChange={(e) => setNewBlock({ ...newBlock, startHour: parseInt(e.target.value) })}
                placeholder="Start"
              />
              <Input
                type="number"
                min={6}
                max={22}
                value={newBlock.endHour}
                onChange={(e) => setNewBlock({ ...newBlock, endHour: parseInt(e.target.value) })}
                placeholder="End"
              />
            </div>
            <Button onClick={addBlock} className="w-full">Add Block</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weekly Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weekly Review</DialogTitle>
            <DialogDescription>Sunday 5PM check-in on schedule adherence</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                How well did you follow your time blocks this week? (1-10)
              </label>
              <Input
                value={reviewAnswers.adherence}
                onChange={(e) => setReviewAnswers({ ...reviewAnswers, adherence: e.target.value })}
                placeholder="Rate 1-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                What were your biggest wins?
              </label>
              <Input
                value={reviewAnswers.wins}
                onChange={(e) => setReviewAnswers({ ...reviewAnswers, wins: e.target.value })}
                placeholder="List your wins..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                What adjustments will you make next week?
              </label>
              <Input
                value={reviewAnswers.adjustments}
                onChange={(e) => setReviewAnswers({ ...reviewAnswers, adjustments: e.target.value })}
                placeholder="Planned adjustments..."
              />
            </div>
            <Button
              onClick={() => {
                setShowReviewDialog(false);
                setReviewAnswers({ adherence: "", wins: "", adjustments: "" });
              }}
              className="w-full"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
