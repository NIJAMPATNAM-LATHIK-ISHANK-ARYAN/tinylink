// src/pages/index.tsx
import React, { useEffect, useState } from "react";

type LinkItem = {
  id: number;
  code: string;
  url: string;
  hitCount: number;
  lastClicked?: string | null;
  createdAt: string;
};

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

export default function Dashboard() {
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
    } catch {
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

    console.log("Target entered:", target); // DEBUG
    console.log("Code entered:", code);     // DEBUG

    if (!validateUrl(target)) {
      setError("Please enter a valid URL (must start with http:// or https://).");
      return;
    }

    setLoading(true);

    try {
      const payload: any = { target }; // <-- IMPORTANT: use target!
      if (code.trim()) payload.code = code.trim();

      console.log("Payload being sent:", payload); // DEBUG

      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 201) {
        setTarget("");
        setCode("");
        setLinks((prev) => [data as LinkItem, ...prev]);
      } else {
        console.log("Error Response:", data); // DEBUG
        setError(data?.error || "Unknown error");
      }
    } catch (err) {
      console.log("Network error:", err);
      setError("Network error");
    }

    setLoading(false);
  }

  async function handleDelete(codeToDelete: string) {
    if (!confirm(`Delete short link "${codeToDelete}"?`)) return;
    await fetch(`/api/links/${codeToDelete}`, { method: "DELETE" });
    setLinks((s) => s.filter((l) => l.code !== codeToDelete));
  }

  function copyShortUrl(codeToCopy: string) {
    const url = `${baseUrl}/${codeToCopy}`;
    navigator.clipboard.writeText(url);
    alert("Copied!");
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">TinyLink — Dashboard</h1>

        <form onSubmit={handleCreate} className="mt-6 bg-gray-50 p-4 border rounded flex gap-3">
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 p-2 border rounded"
          />

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Optional code"
            className="w-52 p-2 border rounded"
          />

          <button type="submit" className="px-4 py-2 bg-black text-white rounded">
            {loading ? "Creating..." : "Create"}
          </button>
        </form>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        <table className="w-full mt-8 border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Short</th>
              <th className="p-2">URL</th>
              <th className="p-2">Clicks</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.code} className="border-t">
                <td className="p-2">
                  <a href={`/${l.code}`} target="_blank" className="text-blue-600 underline">
                    {l.code}
                  </a>
                </td>
                <td className="p-2">{l.url}</td>
                <td className="p-2">{l.hitCount}</td>
                <td className="p-2">{formatDate(l.createdAt)}</td>
                <td className="p-2">
                  <button onClick={() => copyShortUrl(l.code)} className="mr-2 text-sm border p-1">
                    Copy
                  </button>
                  <button onClick={() => handleDelete(l.code)} className="text-sm border p-1 text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
