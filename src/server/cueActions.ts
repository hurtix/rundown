"use server"

import { prisma } from "@/lib/prisma"
import { Cue } from "@/modules/rundown/types"

// Helper to convert Prisma Cue to Cue type
function prismaToAppCue(prismaCue: any): Cue {
  return {
    id: prismaCue.id,
    rundown_id: prismaCue.rundown_id,
    segment_id: prismaCue.segment_id || null,
    order: prismaCue.order,
    title: prismaCue.title,
    duration_seconds: prismaCue.duration_seconds,
    color: prismaCue.color,
    notes: prismaCue.notes,
    camera: prismaCue.camera,
    multimedia: prismaCue.multimedia,
    audio: prismaCue.audio,
    graphics: prismaCue.graphics,
    created_at: typeof prismaCue.created_at === 'string' ? prismaCue.created_at : prismaCue.created_at.toISOString(),
    updated_at: typeof prismaCue.updated_at === 'string' ? prismaCue.updated_at : prismaCue.updated_at.toISOString(),
  }
}

export async function createCue(data: Omit<Cue, "id" | "created_at" | "updated_at">): Promise<Cue> {
  const createData: any = {
    rundown_id: data.rundown_id,
    order: data.order,
    title: data.title,
    duration_seconds: data.duration_seconds,
    color: data.color,
    notes: data.notes,
    camera: data.camera,
    multimedia: data.multimedia,
    audio: data.audio,
    graphics: data.graphics,
  }

  // Solo incluir segment_id si no es null
  if (data.segment_id) {
    createData.segment_id = data.segment_id
  }

  const cue = await prisma.cue.create({
    data: createData,
  })
  return prismaToAppCue(cue)
}

export async function getCue(id: string): Promise<Cue | null> {
  const cue = await prisma.cue.findUnique({
    where: { id },
  })
  return cue ? prismaToAppCue(cue) : null
}

export async function listCuesByRundown(rundownId: string): Promise<Cue[]> {
  const cues = await prisma.cue.findMany({
    where: { rundown_id: rundownId },
    orderBy: { order: "asc" },
  })
  return cues.map(prismaToAppCue)
}

export async function updateCue(
  id: string,
  data: Partial<Cue>
): Promise<Cue> {
  const updateData: any = {}

  // Solo incluir campos que fueron explícitamente pasados
  if (data.title !== undefined) updateData.title = data.title
  if (data.duration_seconds !== undefined) updateData.duration_seconds = data.duration_seconds
  if (data.color !== undefined) updateData.color = data.color
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.camera !== undefined) updateData.camera = data.camera
  if (data.audio !== undefined) updateData.audio = data.audio
  if (data.graphics !== undefined) updateData.graphics = data.graphics
  if (data.order !== undefined) updateData.order = data.order
  if (data.segment_id !== undefined) updateData.segment_id = data.segment_id

  const cue = await prisma.cue.update({
    where: { id },
    data: updateData,
  })
  return prismaToAppCue(cue)
}

export async function deleteCue(id: string): Promise<void> {
  await prisma.cue.delete({
    where: { id },
  })
}

export async function reorderCues(
  rundownId: string,
  cueIds: string[]
): Promise<void> {
  // Get all cues currently in this rundown
  const allCuesInRundown = await prisma.cue.findMany({
    where: { rundown_id: rundownId },
    orderBy: { id: "asc" },
  })

  // Build complete ordering: provided cueIds first, then any others
  const orderedIds = [...cueIds]
  const providedIdSet = new Set(cueIds)
  
  // Add any cues that weren't in cueIds (shouldn't happen, but be safe)
  for (const cue of allCuesInRundown) {
    if (!providedIdSet.has(cue.id)) {
      orderedIds.push(cue.id)
    }
  }

  // Two-phase reordering to avoid constraint violations
  // Phase 1: Move all to temporary negative orders
  let tempOrder = -100000
  for (const id of orderedIds) {
    await prisma.cue.update({
      where: { id },
      data: { order: tempOrder++ },
    })
  }

  // Phase 2: Assign final sequential positive orders
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.cue.update({
      where: { id: orderedIds[i] },
      data: { order: i + 1 },
    })
  }
}

export async function resetCueOrders(rundownId: string): Promise<void> {
  // Get all cues sorted by their current order, then reset to 1, 2, 3, etc.
  const cues = await prisma.cue.findMany({
    where: { rundown_id: rundownId },
    orderBy: { order: "asc" },
  })

  // Update each cue with sequential order starting from 1
  for (let i = 0; i < cues.length; i++) {
    await prisma.cue.update({
      where: { id: cues[i].id },
      data: { order: i + 1 },
    })
  }
}
