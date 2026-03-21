import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user-id";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  const goals = await prisma.goal.findMany({
    where: {
      userId: DEMO_USER_ID,
      ...(type ? { type } : {}),
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { children: true },
  });

  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const goal = await prisma.goal.create({
    data: {
      userId: DEMO_USER_ID,
      title: body.title,
      description: body.description,
      type: body.type,
      status: body.status || "IN_PROGRESS",
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      order: body.order || 0,
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const goal = await prisma.goal.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.targetDate !== undefined && {
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
      }),
    },
  });

  return NextResponse.json(goal);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
