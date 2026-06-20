import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    // Validate file
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB for base64 storage
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP allowed" }, { status: 400 });
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Max 5MB (base64 storage limit)" }, { status: 400 });
    }

    // Check credits
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });
    if (!dbUser || dbUser.credits < 1) {
      return NextResponse.json({ error: "No credits remaining" }, { status: 402 });
    }

    // Convert to base64
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Get image dimensions (simple approach)
    const dimensions = await getImageDimensions(buffer, file.type);

    // Create upload record with base64 data
    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        filename: file.name,
        originalUrl: dataUrl,
        publicId: `upload-${Date.now()}`,
        fileSize: file.size,
        width: dimensions.width,
        height: dimensions.height,
        status: "PENDING",
        imageData: base64,
        creditsUsed: 0,
      },
      select: {
        id: true,
        filename: true,
        originalUrl: true,
        fileSize: true,
        width: true,
        height: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      upload,
      message: "Image uploaded successfully",
    });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Server error during upload: " + (e as Error).message }, { status: 500 });
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

// Get image dimensions from buffer
async function getImageDimensions(buffer: Buffer, mimeType: string): Promise<{ width: number; height: number }> {
  try {
    if (mimeType === "image/png") {
      // PNG: width/height at bytes 16-23
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    } else if (mimeType === "image/jpeg") {
      // JPEG: scan for SOF marker
      let i = 2;
      while (i < buffer.length) {
        if (buffer[i] !== 0xff) break;
        const marker = buffer[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          const height = buffer.readUInt16BE(i + 5);
          const width = buffer.readUInt16BE(i + 7);
          return { width, height };
        }
        i += 2 + buffer.readUInt16BE(i + 2);
      }
    }
    return { width: 0, height: 0 };
  } catch {
    return { width: 0, height: 0 };
  }
}