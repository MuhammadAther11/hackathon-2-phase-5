"use client";

import { useState } from "react";
import { useTags } from "@/hooks/useTags";
import { TagChip } from "./ui/TagChip";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast-provider";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280",
];

export function TagManager() {
  const { tags, isLoading, createTag, deleteTag } = useTags();
  const { showToast } = useToast();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createTag.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          showToast("Tag created", "success");
          setNewName("");
          setShowForm(false);
        },
        onError: () => {
          showToast("Failed to create tag", "error");
        },
      }
    );
  };

  const handleDelete = (tagId: string) => {
    deleteTag.mutate(tagId, {
      onSuccess: () => {
        showToast("Tag deleted", "success");
      },
      onError: () => {
        showToast("Failed to delete tag", "error");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading tags...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-semibold text-gray-700 dark:text-gray-300">Tags</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tag name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full px-3 py-2 text-sm bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg focus:outline-none focus:border-indigo-400 text-gray-900 dark:text-gray-100"
                  maxLength={50}
                />
              </div>
              <div className="flex gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? "ring-2 ring-offset-1 ring-indigo-500 scale-110" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || createTag.isPending}
                className="px-3 py-2 text-sm text-white bg-indigo-600 rounded-lg disabled:opacity-50 font-medium"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag list */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <div key={tag.id} className="group relative">
            <TagChip name={tag.name} color={tag.color} size="md" />
            <button
              onClick={() => handleDelete(tag.id)}
              className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 items-center justify-center rounded-full bg-red-500 text-white"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        {tags.length === 0 && !showForm && (
          <p className="text-xs text-gray-400 dark:text-gray-500">No tags yet</p>
        )}
      </div>
    </div>
  );
}
