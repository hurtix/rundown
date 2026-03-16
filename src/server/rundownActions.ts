"use server"

import { prisma } from "@/lib/prisma"
import { Rundown } from "@/modules/rundown/types"

// Helper to convert Prisma Rundown to Rundown type
function prismaToAppRundown(prismaRundown: any): Rundown {
  return {
    id: prismaRundown.id,
    title: prismaRundown.title,
    description: prismaRundown.description,
    event_date: prismaRundown.event_date ? (typeof prismaRundown.event_date === 'string' ? prismaRundown.event_date : prismaRundown.event_date.toISOString()) : null,
    created_at: typeof prismaRundown.created_at === 'string' ? prismaRundown.created_at : prismaRundown.created_at.toISOString(),
    updated_at: typeof prismaRundown.updated_at === 'string' ? prismaRundown.updated_at : prismaRundown.updated_at.toISOString(),
  }
}

export async function createRundown(
  title: string,
  description?: string,
  event_date?: string
): Promise<Rundown> {
  const rundown = await prisma.rundown.create({
    data: {
      title,
      description,
      event_date: event_date ? new Date(event_date) : null,
    },
  })
  return prismaToAppRundown(rundown)
}

export async function getRundown(id: string): Promise<Rundown | null> {
  const rundown = await prisma.rundown.findUnique({
    where: { id },
  })
  return rundown ? prismaToAppRundown(rundown) : null
}

export async function listRundowns(): Promise<Rundown[]> {
  const rundowns = await prisma.rundown.findMany({
    orderBy: { created_at: "desc" },
  })
  return rundowns.map(prismaToAppRundown)
}

export async function updateRundown(
  id: string,
  data: Partial<Rundown>
): Promise<Rundown> {
  const updateData: any = {}
  
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.event_date !== undefined) updateData.event_date = data.event_date ? new Date(data.event_date) : null

  const rundown = await prisma.rundown.update({
    where: { id },
    data: updateData,
  })
  return prismaToAppRundown(rundown)
}

export async function deleteRundown(id: string): Promise<void> {
  await prisma.rundown.delete({
    where: { id },
  })
}
