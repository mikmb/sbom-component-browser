import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  const e = String(email || "")
    .toLowerCase()
    .trim();
  const p = String(password || "");

  if (!e || p.length < 8) {
    return NextResponse.json(
      { error: "Invalid email or password too short" },
      { status: 400 }
    );
  }

  const exists = await prisma.user.findUnique({ where: { email: e } });
  if (exists) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hash = await bcrypt.hash(p, 12);

  const user = await prisma.user.create({
    data: { email: e, password: hash, name: name ?? null },
    select: { id: true, email: true, name: true },
  });

  // create default project
  await prisma.project.create({
    data: { ownerId: user.id, name: "Default" },
  });

  return NextResponse.json({ user }, { status: 201 });
}
