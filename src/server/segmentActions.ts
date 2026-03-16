"use server"

import { prisma } from "@/lib/prisma"
import { Segment } from "@/modules/rundown/types"

// Helper to convert Prisma Segment to Segment type
function prismaToAppSegment(prismaSegment: any): Segment {
  return {
    id: prismaSegment.id,
    rundown_id: prismaSegment.rundown_id,
    order: prismaSegment.order,
    title: prismaSegment.title,
    created_at: typeof prismaSegment.created_at === 'string' ? prismaSegment.created_at : prismaSegment.created_at.toISOString(),
    updated_at: typeof prismaSegment.updated_at === 'string' ? prismaSegment.updated_at : prismaSegment.updated_at.toISOString(),
  }
}

export async function createSegment(
  data: Omit<Segment, "id" | "created_at" | "updated_at">
): Promise<Segment> {
  const segment = await prisma.segment.create({
    data: {
      rundown_id: data.rundown_id,
      order: data.order,
      title: data.title,
    },
  })
  return prismaToAppSegment(segment)
}

export async function getSegment(id: string): Promise<Segment | null> {
  const segment = await prisma.segment.findUnique({
    where: { id },
  })
  return segment ? prismaToAppSegment(segment) : null
}

export async function listSegmentsByRundown(rundownId: string): Promise<Segment[]> {
  const segments = await prisma.segment.findMany({
    where: { rundown_id: rundownId },
    orderBy: { order: "asc" },
  })
  return segments.map(prismaToAppSegment)
}

export async function updateSegment(
  id: string,
  data: Partial<Segment>
): Promise<Segment> {
  const segment = await prisma.segment.update({
    where: { id },
    data: {
      title: data.title,
      order: data.order,
    },
  })
  return prismaToAppSegment(segment)
}

export async function deleteSegment(id: string): Promise<void> {
  // Cuando se borra un segmento, sus cues quedan sin segmento (segment_id = null)
  await prisma.cue.updateMany({
    where: { segment_id: id },
    data: { segment_id: null },
  })
  
  await prisma.segment.delete({
    where: { id },
  })
}

export async function reorderSegments(
  _rundownId: string,
  segmentIds: string[]
): Promise<void> {
  // Reorder segments by updating in a safe order that avoids unique constraint violations
  const segmentUpdateMap = new Map<string, number>()
  segmentIds.forEach((id, index) => {
    segmentUpdateMap.set(id, index + 1)
  })

  // Get current orders for all segments being reordered
  const currentSegments = await prisma.segment.findMany({
    where: { id: { in: segmentIds } },
    select: { id: true, order: true },
  })

  const currentOrderMap = new Map(currentSegments.map(c => [c.id, c.order]))

  // Partition into segments moving down (decreasing order) and up (increasing order)
  const movingDown: string[] = []
  const movingUp: string[] = []

  for (const [id, newOrder] of segmentUpdateMap) {
    const currentOrder = currentOrderMap.get(id) || 0
    if (newOrder < currentOrder) {
      movingDown.push(id)
    } else if (newOrder > currentOrder) {
      movingUp.push(id)
    }
  }

  // Sort moving down by new order ascending (update from highest first)
  movingDown.sort((a, b) => (segmentUpdateMap.get(b) ?? 0) - (segmentUpdateMap.get(a) ?? 0))
  
  // Sort moving up by new order descending (update from lowest first)
  movingUp.sort((a, b) => (segmentUpdateMap.get(a) ?? 0) - (segmentUpdateMap.get(b) ?? 0))

  // Update in safe order
  const updateOrder = [...movingDown, ...movingUp]
  
  for (const id of updateOrder) {
    const newOrder = segmentUpdateMap.get(id)
    if (newOrder !== undefined) {
      await prisma.segment.update({
        where: { id },
        data: { order: newOrder },
      })
    }
  }
}
