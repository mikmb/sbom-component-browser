import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseSbomJson } from "@/lib/sbom/parse";
import { Prisma, SbomFormat, SbomStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const form = await req.formData();
  const file = form.get("file");
  const name = String(form.get("name") ?? "").trim();
  const projectId = String(form.get("projectId") ?? "").trim();

  if (!(file instanceof File) || !name || !projectId) {
    return NextResponse.json(
      { error: "Missing file/name/projectId" },
      { status: 400 }
    );
  }

  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 25MB)" },
      { status: 413 }
    );
  }

  // ownership check
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Invalid project" }, { status: 403 });
  }

  const text = await file.text();

  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSbomJson(json);

  if (parsed.format === SbomFormat.OTHER || parsed.components.length === 0) {
    return NextResponse.json(
      { error: "Unsupported or empty SBOM" },
      { status: 400 }
    );
  }

  const chunkSize = 2000;

  const rawJson = json as Prisma.InputJsonValue;

  const sbomId = await prisma.$transaction(async (tx) => {
    const sbom = await tx.sbom.create({
      data: {
        projectId,
        name,
        filename: file.name,
        format: parsed.format,
        specVersion: parsed.specVersion ?? undefined,
        status: SbomStatus.PARSING,
        rawJson,
      },
      select: { id: true },
    });

    for (let i = 0; i < parsed.components.length; i += chunkSize) {
      const chunk = parsed.components.slice(i, i + chunkSize);

      await tx.component.createMany({
        data: chunk.map((c) => ({
          sbomId: sbom.id,
          name: c.name,
          version: c.version ?? undefined,
          purl: c.purl ?? undefined,
          group: c.group ?? undefined,
          type: c.type ?? undefined,
          supplier: c.supplier ?? undefined,
          license: c.license ?? undefined,
          scope: c.scope ?? undefined,
          metadata: (c.metadata ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
        })),
      });
    }

    await tx.sbom.update({
      where: { id: sbom.id },
      data: { status: SbomStatus.READY, parsedAt: new Date() },
    });

    return sbom.id;
  });

  return NextResponse.json({ sbomId }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();

  const items = await prisma.sbom.findMany({
    where: {
      project: { ownerId: userId },
      ...(search
        ? {
            components: {
              some: { name: { contains: search, mode: "insensitive" } },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      filename: true,
      format: true,
      status: true,
      uploadedAt: true,
      project: { select: { id: true, name: true } },
      _count: { select: { components: true } },
    },
    orderBy: { uploadedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    items: items.map((x) => ({ ...x, componentCount: x._count.components })),
  });
}
