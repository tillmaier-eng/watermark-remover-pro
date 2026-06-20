import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId, processingTimeMs } = await req.json();

    if (!uploadId) {
      return NextResponse.json({ error: "Upload ID required" }, { status: 400 });
    }

    // Verify ownership
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      select: { userId: true, status: true },
    });

    if (!upload || upload.userId !== user.id) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    // Check if already processed
    if (upload.status === "COMPLETED") {
      return NextResponse.json({ message: "Already processed" });
    }

    // Check credits
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    if (!dbUser || dbUser.credits < 1) {
      return NextResponse.json({ error: "No credits remaining" }, { status: 402 });
    }

    // Deduct credit and mark complete (atomic transaction)
    await prisma.$transaction([
      prisma.upload.update({
        where: { id: uploadId },
        data: {
          status: "COMPLETED",
          creditsUsed: 1,
          processingMs: processingTimeMs || null,
          processedUrl: "client-side", // Mark that processing happened in browser
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } },
      }),
    ]);

    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    return NextResponse.json({
      success: true,
      creditsRemaining: updatedUser?.credits ?? 0,
    });
  } catch (e) {
    console.error("Process error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}