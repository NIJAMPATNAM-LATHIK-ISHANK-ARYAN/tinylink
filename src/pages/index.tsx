// src/pages/index.tsx
import React, { useEffect, useState } from "react";

type LinkItem = {
  id: number;
  code: string;
  target: string;
  clicks: number;
  lastClicked?: string | null;
  createdAt: string;
};

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function Dashboard() {
  const [toast, setToast] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading links", err);
      setError("Failed to fetch links");
    }
  }

  function validateUrl(u: string) {
    try {
      const parsed = new URL(u);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateUrl(target)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setLoading(true);

    const payload: any = { target }; // IMPORTANT
    if (code.trim()) payload.code = code.trim();

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const created = await res.json();
        setLinks((prev) => [created, ...prev]);
        setTarget("");
        setCode("");
      } else {
        const err = await res.json();
        setError(err.error || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(codeToDelete: string) {
    if (!confirm(`Delete "${codeToDelete}"?`)) return;
    await fetch(`/api/links/${codeToDelete}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.code !== codeToDelete));
  }

  function copyShort(code: string) {
    const shortUrl = `${baseUrl}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setToast("Copied!");
    setTimeout(() => setToast(null), 1200);
  }

  return (
    <main className="min-h-screen p-6 bg-white text-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">TinyLink — Dashboard</h1>

        <form onSubmit={handleCreate} className="mt-5 flex gap-3">
          <input
            className="flex-1 p-2 border rounded"
            placeholder="https://example.com"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <input
            className="w-48 p-2 border rounded"
            placeholder="Optional code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            className="px-4 bg-black text-white rounded"
            disabled={loading}
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </form>

        {error && <div className="text-red-600 mt-2">{error}</div>}

        <table className="w-full mt-6 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Short</th>
              <th className="p-2">Target</th>
              <th className="p-2">Clicks</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No links yet.
                </td>
              </tr>
            )}

            {links.map((l) => (
              <tr key={l.code} className="border-t">
                <td className="p-2">
                  <a
                    className="text-sky-600 underline"
                    href={`/${l.code}`}
                    target="_blank"
                  >
                    {l.code}
                  </a>
                </td>
                <td className="p-2">{l.target}</td>
                <td className="p-2">{l.clicks}</td>
                <td className="p-2">{formatDate(l.createdAt)}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => copyShort(l.code)}
                    className="px-2 py-1 border rounded"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(l.code)}
                    className="px-2 py-1 border rounded text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {toast && (
          <div className="fixed bottom-6 right-6 bg-black text-white p-3 rounded shadow">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}
