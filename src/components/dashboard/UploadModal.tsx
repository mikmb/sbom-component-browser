import { useState, useRef, useEffect } from "react";
import { formatBytes } from "@/components/dashboard/icons";

type Project = { id: string; name: string };

export default function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/projects")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load projects");
        const data = (await r.json()) as { projects: Project[] };
        if (!cancelled) {
          setProjects(data.projects);
          setProjectId(data.projects[0]?.id ?? "");
        }
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Error loading projects");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function createProject() {
    setError("");
    const projName = newProjectName.trim();
    if (!projName) return;

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: projName }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Failed to create project");
      return;
    }

    const data = (await res.json()) as { project: Project };
    setProjects((prev) => [...prev, data.project]);
    setProjectId(data.project.id);
    setNewProjectName("");
  }

  async function upload() {
    setError("");

    if (!file) return setError("Pick a JSON file");
    if (!name.trim()) return setError("Enter an SBOM name");
    if (!projectId) return setError("Select a project");

    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name.trim());
    fd.append("projectId", projectId);

    const res = await fetch("/api/sboms", { method: "POST", body: fd });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Upload failed");
      return;
    }

    onUploaded();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upload SBOM</h2>
          <button
            onClick={onClose}
            className="text-sm underline hover:cursor-pointer"
          >
            Close
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="SBOM name"
          className="w-full border rounded px-3 py-2"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {projects.length === 0 ? (
              <option value="">No projects</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>

          <div className="flex gap-2">
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name"
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={() => void createProject()}
              className="rounded bg-purple-800 text-white  hover:bg-purple-900 px-3 py-2 hover:cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">SBOM file</label>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded bg-purple-800 text-white  hover:bg-purple-900 px-3 py-2 text-sm hover:cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V3.75m0 0L7.5 8.25M12 3.75l4.5 4.5M3.75 16.5v3.75A2.25 2.25 0 006 22.5h12A2.25 2.25 0 0020.25 20.25V16.5"
                />
              </svg>
              {file ? "Change file" : "Choose file"}
            </button>

            {file ? (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {file ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatBytes(file.size)}
                  </div>
                </div>
                <span className="text-xs text-gray-500">JSON</span>
              </div>
            ) : (
              <div className="text-gray-600">
                No file selected. Choose a{" "}
                <span className="font-medium">.json</span> SBOM.
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          onClick={() => void upload()}
          className="w-full rounded  bg-purple-800 text-white  hover:bg-purple-900 py-2 disabled:opacity-60 hover:cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
