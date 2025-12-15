import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/sboms/[id]
 * Returns SBOM details + components (first 100)
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const { id: sbomId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const sbom = await prisma.sbom.findFirst({
    where: {
      id: sbomId,
      project: { ownerId: userId },
    },
    select: {
      id: true,
      name: true,
      filename: true,
      format: true,
      status: true,
      uploadedAt: true,
      parsedAt: true,
      project: { select: { id: true, name: true } },
      components: {
        take: 100,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          version: true,
          purl: true,
          group: true,
          type: true,
          supplier: true,
          license: true,
          scope: true,
        },
      },
      _count: { select: { components: true } },
    },
  });

  if (!sbom) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...sbom,
    componentCount: sbom._count.components,
  });
}

/**
 * DELETE /api/sboms/[id]
 */
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id: sbomId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const sbom = await prisma.sbom.findFirst({
    where: {
      id: sbomId,
      project: { ownerId: userId },
    },
    select: { id: true },
  });

  if (!sbom) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.sbom.delete({
    where: { id: sbomId },
  });

  return NextResponse.json({ ok: true });
}
