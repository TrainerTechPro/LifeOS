import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user-id";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const blocks = await prisma.timeBlock.findMany({
    where: {
      userId: DEMO_USER_ID,
      ...(start && end
        ? {
            startTime: { gte: new Date(start) },
            endTime: { lte: new Date(end) },
          }
        : {}),
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(blocks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const block = await prisma.timeBlock.create({
    data: {
      userId: DEMO_USER_ID,
      title: body.title,
      category: body.category,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      isRoutine: body.isRoutine || false,
      dayOfWeek: body.dayOfWeek ?? null,
      color: body.color || null,
    },
  });

  return NextResponse.json(block, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const block = await prisma.timeBlock.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.startTime !== undefined && { startTime: new Date(body.startTime) }),
      ...(body.endTime !== undefined && { endTime: new Date(body.endTime) }),
      ...(body.isRoutine !== undefined && { isRoutine: body.isRoutine }),
    },
  });

  return NextResponse.json(block);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.timeBlock.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
