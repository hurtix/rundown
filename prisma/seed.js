const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a sample rundown
  const rundown = await prisma.rundown.create({
    data: {
      title: "Morning Show - March 14, 2024",
      description: "Live morning broadcast with headlines, weather, and interviews",
      event_date: new Date("2024-03-14T08:00:00Z"),
      segments: {
        create: [
          {
            order: 1,
            title: "INTRO",
          },
          {
            order: 2,
            title: "NEWS",
          },
          {
            order: 3,
            title: "COMMERCIAL",
          },
          {
            order: 4,
            title: "INTERVIEW",
          },
          {
            order: 5,
            title: "CLOSING",
          },
        ],
      },
    },
    include: { segments: true },
  });

  // Get segments to assign to cues
  const segments = await prisma.segment.findMany({
    where: { rundown_id: rundown.id },
    orderBy: { order: "asc" },
  });

  // Create cues with segment assignments
  const cues = await Promise.all([
    // INTRO segment
    prisma.cue.create({
      data: {
        rundown_id: rundown.id,
        segment_id: segments[0].id,
        order: 1,
        title: "Intro",
        duration_seconds: 30,
        color: "blue",
        camera: "Cam 1",
        audio: "Theme Music",
        graphics: null,
        notes: "Open with theme, introduce host",
      },
    }),
    // NEWS segment
    prisma.cue.create({
      data: {
        rundown_id: rundown.id,
        segment_id: segments[1].id,
        order: 2,
        title: "Top Stories Headlines",
        duration_seconds: 120,
        color: "green",
        camera: "Cam 1",
        audio: "Desk Audio",
        graphics: "Lower Third",
        notes: "Read top 3 news stories",
      },
    }),
    prisma.cue.create({
      data: {
        rundown_id: rundown.id,
        segment_id: segments[1].id,
        order: 3,
        title: "Weather Segment",
        duration_seconds: 120,
        color: "yellow",
        camera: "Cam 2",
        audio: "Green Screen Audio",
        graphics: "Weather Graphics",
        notes: "3-day forecast",
      },
    }),
    // COMMERCIAL segment
    prisma.cue.create({
      data: {
        rundown_id: rundown.id,
        segment_id: segments[2].id,
        order: 4,
        title: "Commercial Break",
        duration_seconds: 180,
        color: "red",
        camera: null,
        audio: "Commercial Audio",
        graphics: null,
        notes: "Roll prerecorded commercials",
      },
    }),
    // INTERVIEW segment
    prisma.cue.create({
      data: {
        rundown_id: rundown.id,
        segment_id: segments[3].id,
        order: 5,
        title: "Interview: CEO John Smith",
        duration_seconds: 300,
        color: "blue",
        camera: "Cam 1 + Cam 3",
        audio: "Desk Audio + Wireless Mic",
        graphics: "Interview Graphics",
        notes: "Discussion about new product launch",
      },
    }),
    // CLOSING segment
    prisma.cue.create({
      data: {
        rundown_id: rundown.id,
        segment_id: segments[4].id,
        order: 6,
        title: "Closing Remarks",
        duration_seconds: 60,
        color: "green",
        camera: "Cam 1",
        audio: "Desk Audio",
        graphics: null,
        notes: "Thank guests and tease tomorrow's show",
      },
    }),
  ]);

  console.log(
    `Created rundown "${rundown.title}" with ${segments.length} segments and ${cues.length} cues`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed!");
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
