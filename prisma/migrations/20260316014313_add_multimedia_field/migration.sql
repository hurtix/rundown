-- CreateEnum
CREATE TYPE "CueColor" AS ENUM ('red', 'blue', 'green', 'yellow');

-- CreateTable
CREATE TABLE "Rundown" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rundown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "rundown_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cue" (
    "id" TEXT NOT NULL,
    "rundown_id" TEXT NOT NULL,
    "segment_id" TEXT,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "color" "CueColor",
    "notes" TEXT,
    "camera" TEXT,
    "multimedia" TEXT,
    "audio" TEXT,
    "graphics" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Segment_rundown_id_idx" ON "Segment"("rundown_id");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_rundown_id_order_key" ON "Segment"("rundown_id", "order");

-- CreateIndex
CREATE INDEX "Cue_rundown_id_idx" ON "Cue"("rundown_id");

-- CreateIndex
CREATE INDEX "Cue_segment_id_idx" ON "Cue"("segment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cue_rundown_id_order_key" ON "Cue"("rundown_id", "order");

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_rundown_id_fkey" FOREIGN KEY ("rundown_id") REFERENCES "Rundown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cue" ADD CONSTRAINT "Cue_rundown_id_fkey" FOREIGN KEY ("rundown_id") REFERENCES "Rundown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cue" ADD CONSTRAINT "Cue_segment_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "Segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
