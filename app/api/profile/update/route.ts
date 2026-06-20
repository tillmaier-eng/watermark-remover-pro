import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (typeof name !== "string") {
    return NextResponse.json({ error: "Name must be a string" }, { status: 400 });
  }
  if (name.length > 100) {
    return NextResponse.json({ error: "Name too long (max 100 chars)" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: name.trim() || null },
  });

  return NextResponse.json({ success: true });
}