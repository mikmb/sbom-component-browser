import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export default async function SbomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sbom = await prisma.sbom.findFirst({
    where: {
      id,
      project: { ownerId: session.user.id },
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
      _count: { select: { components: true } },
    },
  });

  if (!sbom) notFound();

  const totalComponents = sbom._count.components;
  const totalPages = Math.max(1, Math.ceil(totalComponents / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // If user requested a page beyond the end, redirect to last valid page
  if (safePage !== page) {
    redirect(`/sboms/${id}?page=${safePage}`);
  }

  const components = await prisma.component.findMany({
    where: { sbomId: sbom.id },
    orderBy: { name: "asc" },
    skip,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      version: true,
      purl: true,
      license: true,
    },
  });

  return (
    <main className="p-6 space-y-4">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{sbom.name}</h1>
          <p className="text-sm text-gray-500">Project · {sbom.project.name}</p>
        </div>

        <div className="rounded-md border bg-gray-50 px-3 py-2">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium text-gray-500">FILE</dt>
              <dd className="text-gray-900 truncate" title={sbom.filename}>
                {sbom.filename}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium text-gray-500">FORMAT</dt>
              <dd className="text-gray-900">{sbom.format}</dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium text-gray-500">
                UPLOADED
              </dt>
              <dd className="text-gray-900">
                {new Date(sbom.uploadedAt).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium text-gray-500">
                COMPONENTS
              </dt>
              <dd className="text-gray-900">
                {totalComponents.toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <Pagination sbomId={sbom.id} page={safePage} totalPages={totalPages} />

      <div className="border rounded overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b bg-gray-100 text-sm font-semibold text-gray-800">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Version</div>
          <div className="col-span-3">PURL</div>
          <div className="col-span-2">License</div>
        </div>

        {components.length === 0 ? (
          <div className="p-3 text-sm">No components found.</div>
        ) : (
          components.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-12 gap-2 px-3 py-2 border-b text-sm"
            >
              <div className="col-span-5 font-medium">{c.name}</div>
              <div className="col-span-2">{c.version ?? "-"}</div>
              <div className="col-span-3 truncate" title={c.purl ?? ""}>
                {c.purl ?? "-"}
              </div>
              <div className="col-span-2">{c.license ?? "-"}</div>
            </div>
          ))
        )}
      </div>

      <Pagination sbomId={sbom.id} page={safePage} totalPages={totalPages} />
    </main>
  );
}

function Pagination({
  sbomId,
  page,
  totalPages,
}: {
  sbomId: string;
  page: number;
  totalPages: number;
}) {
  const windowSize = 7;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-gray-600">
        Page <span className="font-medium text-gray-800">{page}</span> of{" "}
        <span className="font-medium text-gray-800">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1">
        <PageLink sbomId={sbomId} page={1} disabled={page === 1}>
          « First
        </PageLink>
        <PageLink sbomId={sbomId} page={page - 1} disabled={page === 1}>
          ‹ Prev
        </PageLink>

        {start > 1 && <span className="px-2 text-gray-500">…</span>}

        {pages.map((p) => (
          <Link
            key={p}
            href={`/sboms/${sbomId}?page=${p}`}
            className={
              "min-w-9 text-center rounded px-3 py-1 text-sm border " +
              (p === page
                ? "bg-black text-white border-black"
                : "hover:bg-gray-50")
            }
          >
            {p}
          </Link>
        ))}

        {end < totalPages && <span className="px-2 text-gray-500">…</span>}

        <PageLink
          sbomId={sbomId}
          page={page + 1}
          disabled={page === totalPages}
        >
          Next ›
        </PageLink>
        <PageLink
          sbomId={sbomId}
          page={totalPages}
          disabled={page === totalPages}
        >
          Last »
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  sbomId,
  page,
  disabled,
  children,
}: {
  sbomId: string;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded px-3 py-1 text-sm border text-gray-400 cursor-not-allowed">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`/sboms/${sbomId}?page=${page}`}
      className="rounded px-3 py-1 text-sm border hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}
