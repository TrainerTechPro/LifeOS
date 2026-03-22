"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Bell,
  Phone,
  ChevronDown,
  ChevronUp,
  Trash2,
  Cake,
  Search,
  Users,
  Heart,
  MessageCircle,
  Calendar,
  X,
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
import { useRelationshipStore } from "@/stores/relationships";
import type { RelationType } from "@/stores/relationships";

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

function isBirthdayWithin7Days(birthday?: string | null): boolean {
  if (!birthday) return false;
  const now = new Date();
  const bday = new Date(birthday);
  const thisYear = now.getFullYear();
  const upcoming = new Date(thisYear, bday.getMonth(), bday.getDate());
  if (upcoming < now) {
    upcoming.setFullYear(thisYear + 1);
  }
  const diffMs = upcoming.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

function formatBirthdayCountdown(birthday: string): string {
  const now = new Date();
  const bday = new Date(birthday);
  const thisYear = now.getFullYear();
  const upcoming = new Date(thisYear, bday.getMonth(), bday.getDate());
  if (upcoming < now) {
    upcoming.setFullYear(thisYear + 1);
  }
  const diffMs = upcoming.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today!";
  if (diffDays === 1) return "Tomorrow!";
  return `in ${diffDays} days`;
}

export default function RelationshipsPage() {
  const {
    relationships,
    addRelationship,
    updateRelationship,
    removeRelationship,
    addInteraction,
  } = useRelationshipStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit dialog state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    relationType: "FRIEND" as RelationType,
    contactFrequency: "14",
    birthday: "",
    notes: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Interaction note input
  const [contactingId, setContactingId] = useState<string | null>(null);
  const [interactionNote, setInteractionNote] = useState("");

  // Expanded interaction history
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [newContact, setNewContact] = useState({
    name: "",
    relationType: "FRIEND" as RelationType,
    contactFrequency: "14",
    birthday: "",
    notes: "",
  });

  const enrichedContacts = relationships
    .map((c) => {
      const daysSince = c.lastContactDate
        ? getDaysSince(c.lastContactDate)
        : 999;
      return {
        ...c,
        daysSince,
        isOverdue: daysSince > c.contactFrequency,
        urgency: daysSince / c.contactFrequency,
        birthdaySoon: isBirthdayWithin7Days(c.birthday),
      };
    })
    .sort((a, b) => b.urgency - a.urgency);

  const overdueCount = enrichedContacts.filter((c) => c.isOverdue).length;
  const birthdayCount = enrichedContacts.filter((c) => c.birthdaySoon).length;

  const filtered = enrichedContacts
    .filter((c) => {
      if (filter === "all") return true;
      if (filter === "overdue") return c.isOverdue;
      if (filter === "birthday") return c.birthdaySoon;
      return c.relationType === filter;
    })
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    });

  const handleContacted = (id: string) => {
    if (contactingId === id) {
      addInteraction(id, interactionNote.trim() || "Checked in");
      setContactingId(null);
      setInteractionNote("");
    } else {
      setContactingId(id);
      setInteractionNote("");
    }
  };

  const cancelContacting = () => {
    setContactingId(null);
    setInteractionNote("");
  };

  const openEditDialog = (id: string) => {
    const contact = relationships.find((c) => c.id === id);
    if (!contact) return;
    setEditId(id);
    setEditForm({
      name: contact.name,
      relationType: contact.relationType,
      contactFrequency: String(contact.contactFrequency),
      birthday: contact.birthday || "",
      notes: contact.notes || "",
    });
    setShowDeleteConfirm(false);
  };

  const saveEdit = () => {
    if (!editId || !editForm.name.trim()) return;
    updateRelationship(editId, {
      name: editForm.name,
      relationType: editForm.relationType,
      contactFrequency: parseInt(editForm.contactFrequency) || 14,
      birthday: editForm.birthday || null,
      notes: editForm.notes || null,
    });
    setEditId(null);
  };

  const confirmDelete = () => {
    if (!editId) return;
    removeRelationship(editId);
    setEditId(null);
    setShowDeleteConfirm(false);
  };

  const addContact = () => {
    if (!newContact.name.trim()) return;
    addRelationship({
      id: crypto.randomUUID(),
      name: newContact.name,
      relationType: newContact.relationType,
      lastContactDate: new Date().toISOString().split("T")[0],
      contactFrequency: parseInt(newContact.contactFrequency) || 14,
      birthday: newContact.birthday || null,
      notes: newContact.notes || null,
      interactions: [],
    });
    setNewContact({
      name: "",
      relationType: "FRIEND",
      contactFrequency: "14",
      birthday: "",
      notes: "",
    });
    setShowAddDialog(false);
  };

  // Stats
  const typeCounts = relationships.reduce(
    (acc, r) => {
      acc[r.relationType] = (acc[r.relationType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalInteractions = relationships.reduce(
    (sum, r) => sum + (r.interactions?.length || 0),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-widest">
            System 4
          </p>
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#7C5CFC]/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-[#7C5CFC]" />
            </div>
            <div>
              <p className="text-lg font-bold">{relationships.length}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Contacts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[var(--amber)]/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-[var(--amber)]" />
            </div>
            <div>
              <p className="text-lg font-bold">{overdueCount}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FF6B8A]/10 flex items-center justify-center">
              <Cake className="h-4 w-4 text-[#FF6B8A]" />
            </div>
            <div>
              <p className="text-lg font-bold">{birthdayCount}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Birthdays Soon</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#06D6A0]/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-[#06D6A0]" />
            </div>
            <div>
              <p className="text-lg font-bold">{totalInteractions}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Interactions</p>
            </div>
          </CardContent>
        </Card>
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
                  {overdueCount}{" "}
                  {overdueCount === 1 ? "person needs" : "people need"} a
                  check-in
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Time to reach out and maintain these connections
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Birthday Alert */}
      {birthdayCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-[#FF6B8A]/20 bg-[#FF6B8A]/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Cake className="h-5 w-5 text-[#FF6B8A]" />
              <div>
                <p className="text-sm font-medium">
                  {birthdayCount} upcoming{" "}
                  {birthdayCount === 1 ? "birthday" : "birthdays"} this week
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {enrichedContacts
                    .filter((c) => c.birthdaySoon && c.birthday)
                    .map((c) => (
                      <Badge
                        key={c.id}
                        variant="outline"
                        className="text-[10px] border-[#FF6B8A]/30 text-[#FF6B8A]"
                      >
                        {c.name} - {formatBirthdayCountdown(c.birthday!)}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "overdue", label: `Overdue (${overdueCount})` },
          ...(birthdayCount > 0
            ? [{ value: "birthday", label: `Birthdays (${birthdayCount})` }]
            : []),
          ...Object.entries(relationTypeLabels).map(([k, v]) => ({
            value: k,
            label: `${v} (${typeCounts[k] || 0})`,
          })),
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
            style={
              filter === f.value && relationTypeColors[f.value]
                ? { backgroundColor: relationTypeColors[f.value] }
                : undefined
            }
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Contact List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Users className="h-10 w-10 mx-auto text-[var(--muted-foreground)] mb-3 opacity-40" />
              <p className="text-sm text-[var(--muted-foreground)]">
                {searchQuery
                  ? "No contacts match your search"
                  : "No contacts in this category"}
              </p>
            </motion.div>
          )}
          {filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={`${contact.isOverdue ? "border-[var(--amber)]/20 border-l-2 border-l-[var(--amber)]" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor:
                          relationTypeColors[contact.relationType] || "#98989D",
                      }}
                      onClick={() => openEditDialog(contact.id)}
                    >
                      {contact.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => openEditDialog(contact.id)}
                    >
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
                          <Badge variant="warning" className="text-[10px]">
                            Overdue
                          </Badge>
                        )}
                        {contact.birthdaySoon && (
                          <span
                            title={`Birthday ${formatBirthdayCountdown(contact.birthday!)}`}
                            className="flex items-center gap-1"
                          >
                            <Cake className="h-4 w-4 text-[#FF6B8A]" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {contact.daysSince === 0
                          ? "Contacted today"
                          : contact.daysSince === 999
                            ? "Never contacted"
                            : `${contact.daysSince} days ago`}{" "}
                        &middot; Every {contact.contactFrequency} days
                        {contact.interactions && contact.interactions.length > 0 && (
                          <> &middot; {contact.interactions.length} interactions</>
                        )}
                      </p>
                      {contact.notes && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                          {contact.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContacted(contact.id)}
                        className={
                          contact.isOverdue
                            ? "text-[var(--amber)] hover:text-[var(--amber)]"
                            : ""
                        }
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Contacted
                      </Button>
                      {(contact.interactions?.length ?? 0) > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setExpandedId(
                              expandedId === contact.id ? null : contact.id
                            )
                          }
                        >
                          {expandedId === contact.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Interaction Note Input */}
                  {contactingId === contact.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex gap-2"
                    >
                      <Input
                        placeholder="What did you talk about?"
                        value={interactionNote}
                        onChange={(e) => setInteractionNote(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleContacted(contact.id);
                          if (e.key === "Escape") cancelContacting();
                        }}
                        autoFocus
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleContacted(contact.id)}
                      >
                        Log
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelContacting}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  )}

                  {/* Interaction History */}
                  {expandedId === contact.id &&
                    contact.interactions &&
                    contact.interactions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 border-t border-[var(--border)] pt-3 space-y-2"
                      >
                        <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                          Interaction History ({contact.interactions.length})
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {contact.interactions.map((interaction, idx) => (
                            <div
                              key={`${interaction.date}-${idx}`}
                              className="flex items-start gap-3 text-xs"
                            >
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Calendar className="h-3 w-3 text-[var(--muted-foreground)]" />
                                <span className="text-[var(--muted-foreground)] tabular-nums">
                                  {interaction.date}
                                </span>
                              </div>
                              <span>{interaction.note}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
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
            <DialogDescription>
              Add someone to your relationship CRM
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Name"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") addContact();
              }}
            />
            <Select
              value={newContact.relationType}
              onValueChange={(val) =>
                setNewContact({
                  ...newContact,
                  relationType: val as RelationType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(relationTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: relationTypeColors[key] }}
                      />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                Contact every (days)
              </label>
              <Input
                type="number"
                value={newContact.contactFrequency}
                onChange={(e) =>
                  setNewContact({
                    ...newContact,
                    contactFrequency: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                Birthday
              </label>
              <Input
                type="date"
                value={newContact.birthday}
                onChange={(e) =>
                  setNewContact({ ...newContact, birthday: e.target.value })
                }
              />
            </div>
            <Input
              placeholder="Notes"
              value={newContact.notes}
              onChange={(e) =>
                setNewContact({ ...newContact, notes: e.target.value })
              }
            />
            <Button onClick={addContact} className="w-full">
              Add Person
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog
        open={editId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditId(null);
            setShowDeleteConfirm(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact details or remove them
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <Select
              value={editForm.relationType}
              onValueChange={(val) =>
                setEditForm({
                  ...editForm,
                  relationType: val as RelationType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(relationTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: relationTypeColors[key] }}
                      />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                Contact every (days)
              </label>
              <Input
                type="number"
                value={editForm.contactFrequency}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    contactFrequency: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)] mb-1 block">
                Birthday
              </label>
              <Input
                type="date"
                value={editForm.birthday}
                onChange={(e) =>
                  setEditForm({ ...editForm, birthday: e.target.value })
                }
              />
            </div>
            <Input
              placeholder="Notes"
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
            />

            <div className="flex gap-2">
              <Button onClick={saveEdit} className="flex-1">
                Save Changes
              </Button>
              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="destructive" onClick={confirmDelete}>
                  Confirm Delete
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
