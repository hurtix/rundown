import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create a sample rundown
  const rundown = await prisma.rundown.create({
    data: {
      title: "Morning Show - March 14, 2024",
      description: "Live morning broadcast with headlines, weather, and interviews",
      event_date: new Date("2024-03-14T08:00:00Z"),
      cues: {
        create: [
          {
            order: 1,
            title: "Intro",
            duration_seconds: 30,
            camera: "Cam 1",
            multimedia: null,
            audio: "Theme Music",
            graphics: null,
            notes: "Open with theme, introduce host",
          },
          {
            order: 2,
            title: "Top Stories Headlines",
            duration_seconds: 120,
            camera: "Cam 1",
            multimedia: null,
            audio: "Desk Audio",
            graphics: "Lower Third",
            notes: "Read top 3 news stories",
          },
          {
            order: 3,
            title: "Weather Segment",
            duration_seconds: 120,
            camera: "Cam 2",
            multimedia: null,
            audio: "Green Screen Audio",
            graphics: "Weather Graphics",
            notes: "3-day forecast",
          },
          {
            order: 4,
            title: "Commercial Break",
            duration_seconds: 180,
            camera: null,
            multimedia: null,
            audio: "Commercial Audio",
            graphics: null,
            notes: "Roll prerecorded commercials",
          },
          {
            order: 5,
            title: "Interview: CEO John Smith",
            duration_seconds: 300,
            camera: "Cam 1 + Cam 3",
            multimedia: null,
            audio: "Desk Audio + Wireless Mic",
            graphics: "Interview Graphics",
            notes: "Discussion about new product launch",
          },
          {
            order: 6,
            title: "Closing Remarks",
            duration_seconds: 60,
            camera: "Cam 1",
            multimedia: null,
            audio: "Desk Audio",
            graphics: null,
            notes: "Thank guests and tease tomorrow's show",
          },
        ],
      },
    },
    include: { cues: true },
  })

  console.log(
    `Created rundown "${rundown.title}" with ${rundown.cues.length} cues`
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log("Seed completed!")
  })
  .catch(async (e) => {
    console.error("Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
