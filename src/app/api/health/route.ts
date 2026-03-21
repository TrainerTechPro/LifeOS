import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user-id";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.healthLog.findMany({
    where: {
      userId: DEMO_USER_ID,
      date: { gte: since },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const log = await prisma.healthLog.create({
    data: {
      userId: DEMO_USER_ID,
      date: body.date ? new Date(body.date) : new Date(),
      sleepScore: body.sleepScore ?? null,
      workoutType: body.workoutType || null,
      zone2Minutes: body.zone2Minutes ?? null,
      calories: body.calories ?? null,
      notes: body.notes || null,
      beltRank: body.beltRank || null,
      matTimeMin: body.matTimeMin ?? null,
      liftVolume: body.liftVolume ?? null,
    },
  });

  return NextResponse.json(log, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const log = await prisma.healthLog.update({
    where: { id: body.id },
    data: {
      ...(body.sleepScore !== undefined && { sleepScore: body.sleepScore }),
      ...(body.workoutType !== undefined && { workoutType: body.workoutType }),
      ...(body.zone2Minutes !== undefined && { zone2Minutes: body.zone2Minutes }),
      ...(body.calories !== undefined && { calories: body.calories }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.beltRank !== undefined && { beltRank: body.beltRank }),
      ...(body.matTimeMin !== undefined && { matTimeMin: body.matTimeMin }),
      ...(body.liftVolume !== undefined && { liftVolume: body.liftVolume }),
    },
  });

  return NextResponse.json(log);
}
