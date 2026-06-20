// Simple cookie-based session auth (no NextAuth needed for basic email/password)
// Uses HttpOnly cookies + bcrypt password hashing

import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "wrp_session";

// Generate a signed session token: base64(userId.timestamp.hmac)
export function generateSessionToken(userId: string): string {
  const timestamp = Date.now().toString();
  const payload = `${userId}.${timestamp}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${hmac}`).toString("base64");
}

export function verifySessionToken(token: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return null;
    const [userId, timestamp, hmac] = parts;

    // Verify HMAC
    const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET)
      .update(`${userId}.${timestamp}`)
      .digest("hex");

    if (hmac !== expectedHmac) return null;

    // Check expiry (30 days)
    const age = Date.now() - parseInt(timestamp);
    if (age > 30 * 24 * 60 * 60 * 1000) return null;

    return { userId };
  } catch {
    return null;
  }
}

// Get current user from cookies (server-side)
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, image: true, role: true, credits: true },
  });
  return user;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Set session cookie
export async function setSessionCookie(userId: string) {
  const token = generateSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };