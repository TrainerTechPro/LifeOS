"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, Bell, Phone, Calendar, MoreHorizontal } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Contact {
  id: string;
  name: string;
  relationType: string;
  lastContactDate: string;
  contactFrequency: number;
  birthday?: string;
  notes?: string;
}

const demoContacts: Contact[] = [
  { id: "1", name: "Sarah", relationType: "SPOUSE", lastContactDate: "2026-03-21", contactFrequency: 1, birthday: "1994-08-15", notes: "Always there" },
  { id: "2", name: "Coach Davidson", relationType: "MENTOR", lastContactDate: "2026-03-08", contactFrequency: 7, notes: "Discuss program periodization" },
  { id: "3", name: "Alex Martinez", relationType: "FRIEND", lastContactDate: "2026-03-05", contactFrequency: 14, birthday: "1992-11-02", notes: "Training partner, brown belt" },
  { id: "4", name: "Dr. Williams", relationType: "COLLEAGUE", lastContactDate: "2026-03-10", contactFrequency: 14, notes: "Department chair - tenure committee" },
  { id: "5", name: "Mom & Dad", relationType: "FAMILY", lastContactDate: "2026-03-14", contactFrequency: 7, notes: "Sunday calls" },
  { id: "6", name: "Jake Thompson", relationType: "FRIEND", lastContactDate: "2026-02-28", contactFrequency: 30, notes: "College roommate" },
  { id: "7", name: "Prof. Nakamura", relationType: "COLLEAGUE", lastContactDate: "2026-03-01", contactFrequency: 21, notes: "Research collaborator" },
  { id: "8", name: "Marcus Rivera", relationType: "FRIEND", lastContactDate: "2026-03-18", contactFrequency: 14, birthday: "1993-05-20", notes: "BJJ blue belt" },
];

const relationTypeLabels: Record<string, string> = {
  SPOUSE: "Spouse",
  FAMILY: "Family",
  FRIEND: "Friend",
  COLLEAGUE: "Colleague",
  MENTOR: "Mentor",
};

const relationTypeColors: Record<string, string> = {
  SPOUSE: "#FF6B8A",
  FAMILY: "#FFB347",
  FRIEND: "#06D6A0",
  COLLEAGUE: "#7C5CFC",
  MENTOR: "#BF5AF2",
};

function getDaysSince(dateStr: string): number {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RelationshipsPage() {
  const [contacts, setContacts] = useState(demoContacts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [newContact, setNewContact] = useState({
    name: "",
    relationType: "FRIEND",
    contactFrequency: "14",
    notes: "",
  });

  const enrichedContacts = contacts.map((c) => {
    const daysSince = getDaysSince(c.lastContactDate);
    return {
      ...c,
      daysSince,
      isOverdue: daysSince > c.contactFrequency,
      urgency: daysSince / c.contactFrequency,
    };
  }).sort((a, b) => b.urgency - a.urgency);

  const overdueCount = enrichedContacts.filter((c) => c.isOverdue).length;
  const filtered = filter === "all"
    ? enrichedContacts
    : filter === "overdue"
      ? enrichedContacts.filter((c) => c.isOverdue)
      : enrichedContacts.filter((c) => c.relationType === filter);

  const markContacted = (id: string) => {
    setContacts(
      contacts.map((c) =>
        c.id === id ? { ...c, lastContactDate: new Date().toISOString().split("T")[0] } : c
      )
    );
  };

  const addContact = () => {
    if (!newContact.name.trim()) return;
    const contact: Contact = {
      id: crypto.randomUUID(),
      name: newContact.name,
      relationType: newContact.relationType,
      lastContactDate: new Date().toISOString().split("T")[0],
      contactFrequency: parseInt(newContact.contactFrequency) || 14,
      notes: newContact.notes || undefined,
    };
    setContacts([...contacts, contact]);
    setNewContact({ name: "", relationType: "FRIEND", contactFrequency: "14", notes: "" });
    setShowAddDialog(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">System 4</p>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[var(--rose)] to-[var(--violet)] bg-clip-text text-transparent">
            Relationship CRM
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Never lose touch with the people who matter
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-[var(--amber)]/20 bg-[var(--amber)]/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Bell className="h-5 w-5 text-[var(--amber)]" />
              <div>
                <p className="text-sm font-medium">
                  {overdueCount} {overdueCount === 1 ? "person needs" : "people need"} a check-in
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Time to reach out and maintain these connections
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "overdue", label: `Overdue (${overdueCount})` },
          ...Object.entries(relationTypeLabels).map(([k, v]) => ({ value: k, label: v })),
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Contact List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={`${contact.isOverdue ? "border-[var(--amber)]/20 border-l-2 border-l-[var(--amber)]" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: relationTypeColors[contact.relationType] || "#98989D" }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          color: relationTypeColors[contact.relationType],
                          borderColor: `${relationTypeColors[contact.relationType]}40`,
                        }}
                      >
                        {relationTypeLabels[contact.relationType]}
                      </Badge>
                      {contact.isOverdue && (
                        <Badge variant="warning" className="text-[10px]">Overdue</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      {contact.daysSince === 0
                        ? "Today"
                        : `${contact.daysSince} days ago`}{" "}
                      &middot; Every {contact.contactFrequency} days
                    </p>
                    {contact.notes && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markContacted(contact.id)}
                    className="shrink-0"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Contacted
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
            <DialogDescription>Add someone to your relationship CRM</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            />
            <Select
              value={newContact.relationType}
              onValueChange={(val) => setNewContact({ ...newContact, relationType: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPOUSE">Spouse</SelectItem>
                <SelectItem value="FAMILY">Family</SelectItem>
                <SelectItem value="FRIEND">Friend</SelectItem>
                <SelectItem value="COLLEAGUE">Colleague</SelectItem>
                <SelectItem value="MENTOR">Mentor</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                Contact every (days)
              </label>
              <Input
                type="number"
                value={newContact.contactFrequency}
                onChange={(e) => setNewContact({ ...newContact, contactFrequency: e.target.value })}
              />
            </div>
            <Input
              placeholder="Notes"
              value={newContact.notes}
              onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
            />
            <Button onClick={addContact} className="w-full">Add Person</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
