import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Relationship } from "@prisma/client";

const DEMO_USER_ID = "demo-user-id";

export async function GET() {
  const relationships = await prisma.relationship.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { lastContactDate: "asc" },
  });

  // Add "overdue" flag
  const now = new Date();
  const enriched = relationships.map((r: Relationship) => {
    const lastContact = r.lastContactDate ? new Date(r.lastContactDate) : null;
    const daysSinceContact = lastContact
      ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      : Infinity;

    return {
      ...r,
      daysSinceContact,
      isOverdue: daysSinceContact > r.contactFrequency,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const relationship = await prisma.relationship.create({
    data: {
      userId: DEMO_USER_ID,
      name: body.name,
      relationType: body.relationType,
      birthday: body.birthday ? new Date(body.birthday) : null,
      lastContactDate: body.lastContactDate ? new Date(body.lastContactDate) : new Date(),
      contactFrequency: body.contactFrequency,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(relationship, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const relationship = await prisma.relationship.update({
    where: { id: body.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.relationType !== undefined && { relationType: body.relationType }),
      ...(body.lastContactDate !== undefined && {
        lastContactDate: new Date(body.lastContactDate),
      }),
      ...(body.contactFrequency !== undefined && {
        contactFrequency: body.contactFrequency,
      }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return NextResponse.json(relationship);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.relationship.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
