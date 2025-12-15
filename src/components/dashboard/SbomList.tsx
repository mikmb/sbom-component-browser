"use client";

import type { SbomListItem } from "@/lib/types";
import { TrashIcon } from "@/components/dashboard/icons";

export default function SbomList({
  items,
  loading,
  onDelete,
}: {
  items: SbomListItem[];
  loading: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border rounded overflow-hidden">
      {/* Desktop/tablet header */}
      <div className="hidden md:grid sticky top-0 z-10 grid-cols-12 gap-2 px-3 py-2 border-b bg-gray-100 text-sm font-semibold text-gray-800">
        <div className="col-span-7 lg:col-span-5">Name</div>

        {/* Hide Project on md, show on lg+ */}
        <div className="hidden lg:block lg:col-span-3">Project</div>

        <div className="col-span-3 lg:col-span-2">Format</div>
        <div className="col-span-1 text-right">Comps</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {loading ? (
        <div className="p-3 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="p-3 text-sm">No SBOMs found.</div>
      ) : (
        items.map((x) => (
          <div key={x.id} className="border-b last:border-b-0">
            {/* Mobile card */}
            <div className="md:hidden px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <a href={`/sboms/${x.id}`} className="min-w-0 flex-1">
                  <div className="font-medium truncate">{x.name}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {x.filename}
                  </div>
                </a>

                <button
                  type="button"
                  className="shrink-0 inline-flex items-center justify-center rounded p-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(x.id);
                  }}
                  aria-label={`Delete ${x.name}`}
                  title="Delete SBOM"
                >
                  <TrashIcon />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="rounded bg-gray-50 border px-2 py-1">
                  <span className="text-gray-500">Project:</span>{" "}
                  <span className="font-medium">{x.project.name}</span>
                </div>
                <div className="rounded bg-gray-50 border px-2 py-1">
                  <span className="text-gray-500">Format:</span>{" "}
                  <span className="font-medium">{x.format}</span>
                </div>
                <div className="rounded bg-gray-50 border px-2 py-1 col-span-2">
                  <span className="text-gray-500">Components:</span>{" "}
                  <span className="font-medium">{x.componentCount}</span>
                </div>
              </div>
            </div>

            {/* Desktop row */}
            <a
              href={`/sboms/${x.id}`}
              className="hidden md:grid grid-cols-12 gap-2 px-3 py-3 hover:bg-gray-50 text-sm items-center"
            >
              <div className="col-span-7 lg:col-span-5 min-w-0">
                <div className="font-medium truncate">{x.name}</div>
                <div className="text-gray-600 truncate">{x.filename}</div>
              </div>

              {/* Hide Project on md, show on lg+ */}
              <div className="hidden lg:block lg:col-span-3 truncate">
                {x.project.name}
              </div>

              <div className="col-span-3 lg:col-span-2 truncate">
                {x.format}
              </div>

              <div className="col-span-1 text-right tabular-nums">
                {x.componentCount}
              </div>

              <div className="col-span-1 text-right">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded p-1 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(x.id);
                  }}
                  aria-label={`Delete ${x.name}`}
                  title="Delete SBOM"
                >
                  <TrashIcon />
                </button>
              </div>
            </a>
          </div>
        ))
      )}
    </div>
  );
}
