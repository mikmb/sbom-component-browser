import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, name: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { name?: string };
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json(
      { error: "Project name required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: { ownerId: session.user.id, name },
    select: { id: true, name: true, createdAt: true },
  });

  return NextResponse.json({ project }, { status: 201 });
}
