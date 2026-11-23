import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const data = await req.formData();
  const file = data.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Format non supporté" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "articles", "inline");
  await fs.mkdir(dir, { recursive: true });

  const name = crypto.randomBytes(12).toString("hex") + "." + ext;
  await fs.writeFile(
    path.join(dir, name),
    Buffer.from(await file.arrayBuffer())
  );

  return NextResponse.json({ url: `/uploads/articles/inline/${name}` });
}