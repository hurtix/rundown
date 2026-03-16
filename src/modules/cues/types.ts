import { Cue } from "../rundown/types"

export type CueInput = Omit<Cue, "id" | "created_at" | "updated_at">
