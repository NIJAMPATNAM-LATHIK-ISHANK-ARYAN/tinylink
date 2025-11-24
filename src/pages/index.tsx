// src/pages/index.tsx
import React, { useEffect, useState } from "react";

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

type LinkItem = {
  id: number;
  code: string;
  target: string;
  clicks: number;
  lastClicked?: string | null;
  createdAt: string;
};

export default function Dashboard() {
  const [toast, setToast] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      console.error("fetchLinks error", err);
      setError("Failed to load links");
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

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!validateUrl(target)) {
      setError("Please enter a valid URL (must start with http:// or https://).");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { url: target };
      if (code.trim()) payload.code = code.trim();

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const created = await res.json();
        setTarget("");
        setCode("");
        // prepend newest
        setLinks((s) => [created as LinkItem, ...s]);
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(err?.error ?? "Failed to create link");
      }
    } catch (err) {
      console.error(err);
      setError("Network error creating link");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(codeToDelete: string) {
    if (!confirm(`Delete short link "${codeToDelete}"?`)) return;
    try {
      await fetch(`/api/links/${codeToDelete}`, { method: "DELETE" });
      setLinks((s) => s.filter((l) => l.code !== codeToDelete));
    } catch (err) {
      console.error("delete error", err);
      setError("Failed to delete");
    }
  }

  function copyShortUrl(codeToCopy: string) {
  const url = `${baseUrl}/${codeToCopy}`;
  try {
    navigator.clipboard.writeText(url);
    setToast("Copied!");
    setTimeout(() => setToast(null), 1500);
  } catch {
    prompt("Copy this URL:", url);
  }
 }


  return (
    <main className="min-h-screen bg-white text-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">TinyLink — Dashboard</h1>
          <p className="text-sm text-slate-600">Create and manage short links.</p>
        </header>

        <section className="mb-6 bg-gray-50 border rounded p-4">
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="https://example.com/long/path"
                className="flex-1 p-2 border rounded"
                aria-label="Target URL"
              />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Optional custom code (6-8 alnum)"
                className="w-56 p-2 border rounded"
                aria-label="Custom code"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="text-xs text-slate-500">Code must be 6-8 alphanumeric characters (optional).</div>
          </form>
        </section>

        <section>
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2">Short</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Clicks</th>
                  <th className="px-3 py-2">Last Clicked</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-slate-500">
                      No links yet.
                    </td>
                  </tr>
                )}
                {links.map((l) => (
                  <tr key={l.code} className="border-t">
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${l.code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 underline"
                        >
                          {l.code}
                        </a>
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
  <div className="truncate-ellipsis" title={l.target}>{l.target}</div>
                    </td>
                    <td className="px-3 py-2 align-top">{l.clicks}</td>
                    <td className="px-3 py-2 align-top">{formatDate(l.lastClicked)}</td>
                   <td className="px-3 py-2 align-top">{formatDate(l.createdAt)}</td>

                    <td className="px-3 py-2 align-top">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyShortUrl(l.code)}
                          className="px-2 py-1 text-sm border rounded"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => handleDelete(l.code)}
                          className="px-2 py-1 text-sm border rounded text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-6 text-sm text-slate-500">
          <div>Assignment spec: <span className="text-slate-700">{"/mnt/data/Take-Home Assignment_ TinyLink (1) (2).pdf"}</span></div>
        </footer>
      </div>
      {toast && (
  <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow-lg animate-fade-in">
    {toast}
  </div>
)}

    </main>
  );
}
