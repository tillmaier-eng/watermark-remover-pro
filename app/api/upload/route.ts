import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { saveImageFile, validateImageFile } from "@/lib/image-storage";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate
    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Check user credits
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });
    if (!dbUser || dbUser.credits < 1) {
      return NextResponse.json({ error: "No credits remaining" }, { status: 402 });
    }

    // Save file
    const saved = await saveImageFile(user.id, file);

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        filename: saved.filename,
        originalUrl: saved.publicUrl,
        publicId: saved.filename,
        fileSize: saved.size,
        status: "PENDING",
        creditsUsed: 0, // Will be deducted when processing happens
      },
      select: {
        id: true,
        filename: true,
        originalUrl: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      upload,
      message: "Image uploaded successfully",
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Server error during upload" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploads = await prisma.upload.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        filename: true,
        originalUrl: true,
        processedUrl: true,
        status: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ uploads });
  } catch (e) {
    console.error("List uploads error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}