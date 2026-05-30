import type { NotesGrid } from "@/lib/game/types";
import type { SerializedNotes } from "./types";

export function serializeNotes(notes: NotesGrid): SerializedNotes {
  return {
    cells: notes.map((row) => row.map((set) => Array.from(set).sort((a, b) => a - b))),
  };
}

export function deserializeNotes(data: SerializedNotes): NotesGrid {
  return data.cells.map((row) => row.map((arr) => new Set(arr)));
}
