// Rundown types
export type Rundown = {
  id: string
  title: string
  description: string | null
  event_date: string | null
  created_at: string
  updated_at: string
}

export type RundownWithCues = Rundown & {
  cues: Cue[]
  segments?: Segment[]
}

// Segment types
export type Segment = {
  id: string
  rundown_id: string
  order: number
  title: string
  created_at: string
  updated_at: string
}

export type SegmentWithCues = Segment & {
  cues: Cue[]
}

// Cue types
export type Cue = {
  id: string
  rundown_id: string
  segment_id: string | null
  order: number
  title: string
  duration_seconds: number
  color: "red" | "blue" | "green" | "yellow" | null
  notes: string | null
  camera: string | null
  multimedia: string | null
  audio: string | null
  graphics: string | null
  created_at: string
  updated_at: string
}

// Input types
export type CueInput = Omit<Cue, "id" | "created_at" | "updated_at">

// Calculated types
export type CueCalculated = Cue & {
  start_time_seconds: number
  end_time_seconds: number
}
