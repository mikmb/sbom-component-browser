"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { SbomListItem } from "@/lib/types";
import { fetchSboms } from "@/lib/api/sboms";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import UploadModal from "@/components/dashboard/UploadModal";
import SbomList from "@/components/dashboard/SbomList";

type State = {
  items: SbomListItem[];
  status: "idle" | "loading" | "error";
  error: string;
};

type Action =
  | { type: "LOAD" }
  | { type: "SUCCESS"; items: SbomListItem[] }
  | { type: "ERROR"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOAD":
      return { ...state, status: "loading", error: "" };
    case "SUCCESS":
      return { items: action.items, status: "idle", error: "" };
    case "ERROR":
      return { ...state, status: "error", error: action.error };
    default:
      return state;
  }
}

export default function DashboardClient() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 500);

  const [showUpload, setShowUpload] = useState(false);

  const [state, dispatch] = useReducer(reducer, {
    items: [],
    status: "loading",
    error: "",
  });

  const loading = state.status === "loading";
  const items = state.items;
  const error = state.error;

  async function refreshList(search?: string) {
    dispatch({ type: "LOAD" });
    try {
      const data = await fetchSboms(search);
      dispatch({ type: "SUCCESS", items: data });
    } catch (e: unknown) {
      dispatch({
        type: "ERROR",
        error: e instanceof Error ? e.message : "Error",
      });
    }
  }

  async function deleteSbom(id: string) {
    if (!confirm("Delete this SBOM? This cannot be undone.")) return;

    const prev = state.items;
    dispatch({ type: "SUCCESS", items: prev.filter((x) => x.id !== id) });

    const res = await fetch(`/api/sboms/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      // rollback
      dispatch({ type: "SUCCESS", items: prev });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      dispatch({
        type: "ERROR",
        error: data?.error ?? "Failed to delete SBOM",
      });
      return;
    }

    // refresh from server to keep counts perfect
    void refreshList(debouncedQ.trim() || undefined);
  }

  useEffect(() => {
    let cancelled = false;

    dispatch({ type: "LOAD" });

    fetchSboms(debouncedQ.trim() || undefined)
      .then((data) => {
        if (!cancelled) dispatch({ type: "SUCCESS", items: data });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          dispatch({
            type: "ERROR",
            error: e instanceof Error ? e.message : "Error",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const countLabel = useMemo(() => {
    if (loading) return "Loading…";
    if (debouncedQ.trim())
      return `${items.length} SBOM(s) match "${debouncedQ.trim()}"`;
    return `${items.length} SBOM(s)`;
  }, [items.length, loading, debouncedQ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for a component by name"
            className="w-full sm:w-96 border rounded px-3 py-2"
          />
          <div className="text-sm text-gray-600">{countLabel}</div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="shrink-0 inline-flex items-center gap-2 rounded bg-purple-800 text-white px-4 py-2 hover:bg-purple-900 hover:cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>Upload SBOM</span>
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <SbomList items={items} loading={loading} onDelete={deleteSbom} />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            void refreshList(debouncedQ.trim() || undefined);
          }}
        />
      )}
    </div>
  );
}
