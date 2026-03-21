import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user-id";

export async function GET() {
  const rules = await prisma.financeRule.findMany({
    where: { userId: DEMO_USER_ID },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const rule = await prisma.financeRule.create({
    data: {
      userId: DEMO_USER_ID,
      incomeSource: body.incomeSource,
      taxPercentage: body.taxPercentage,
      savePercentage: body.savePercentage,
      investPercentage: body.investPercentage,
      operationsPercentage: body.operationsPercentage || 0,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const rule = await prisma.financeRule.update({
    where: { id: body.id },
    data: {
      ...(body.incomeSource !== undefined && { incomeSource: body.incomeSource }),
      ...(body.taxPercentage !== undefined && { taxPercentage: body.taxPercentage }),
      ...(body.savePercentage !== undefined && {
        savePercentage: body.savePercentage,
      }),
      ...(body.investPercentage !== undefined && {
        investPercentage: body.investPercentage,
      }),
      ...(body.operationsPercentage !== undefined && {
        operationsPercentage: body.operationsPercentage,
      }),
    },
  });

  return NextResponse.json(rule);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await prisma.financeRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
