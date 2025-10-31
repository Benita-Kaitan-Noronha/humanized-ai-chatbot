import React, { useEffect, useState } from "react";

// Link Cart - single-file React component
// Features:
// - Add a link (URL + optional title + tags)
// - Attempt to fetch page title (may fail due to CORS) and fall back to URL as title
// - Persist links to localStorage so cart is available next time
// - Search/filter saved links by text or tag
// - Tagging, favorite, delete, open, import/export JSON
// - Simple, modern UI using Tailwind classes

export default function LinkCart() {
  const STORAGE_KEY = "linkCartItems";

  const [items, setItems] = useState([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [loadingTitle, setLoadingTitle] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse saved items", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function normalizeUrl(u) {
    try {
      if (!/^https?:\/\//i.test(u)) u = "https://" + u;
      const parsed = new URL(u);
      return parsed.href;
    } catch (e) {
      return null;
    }
  }

  async function fetchTitle(u) {
    // Try to fetch page HTML and extract <title> — may be blocked by CORS.
    // This is a best-effort attempt; when it fails we keep the URL as title.
    setLoadingTitle(true);
    try {
      const res = await fetch(u, { method: "GET" });
      const text = await res.text();
      const td = new DOMParser().parseFromString(text, "text/html");
      const t = td.querySelector("title");
      setLoadingTitle(false);
      return (t && t.innerText.trim()) || "";
    } catch (e) {
      setLoadingTitle(false);
      return "";
    }
  }

  const addItem = async (e) => {
    e && e.preventDefault();
    const nurl = normalizeUrl(url.trim());
    if (!nurl) return alert("Please enter a valid URL");

    let finalTitle = title.trim();
    if (!finalTitle) {
      const fetched = await fetchTitle(nurl);
      finalTitle = fetched || nurl;
    }

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newItem = {
      id: Date.now() + Math.random().toString(36).slice(2, 9),
      url: nurl,
      title: finalTitle,
      tags,
      favorite: false,
      createdAt: new Date().toISOString(),
    };

    setItems((s) => [newItem, ...s]);
    setUrl("");
    setTitle("");
    setTagInput("");
  };

  const removeItem = (id) => {
    if (!confirm("Remove this link from cart?")) return;
    setItems((s) => s.filter((it) => it.id !== id));
  };

  const toggleFavorite = (id) => {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, favorite: !it.favorite } : it)));
  };

  const editItem = (id) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    const newTitle = prompt("Edit title", it.title) || it.title;
    const newTags = prompt("Edit tags (comma separated)", it.tags.join(", ")) || it.tags.join(",");
    setItems((s) =>
      s.map((x) => (x.id === id ? { ...x, title: newTitle, tags: newTags.split(",").map(t => t.trim()).filter(Boolean) } : x))
    );
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "link-cart-export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed)) {
          // make sure items have ids
          const normalized = parsed.map((it) => ({
            id: it.id || Date.now() + Math.random().toString(36).slice(2, 9),
            url: it.url,
            title: it.title || it.url,
            tags: it.tags || [],
            favorite: !!it.favorite,
            createdAt: it.createdAt || new Date().toISOString(),
          }));
          setItems((s) => [...normalized, ...s]);
        } else {
          alert("Invalid file format — expected an array of links");
        }
      } catch (err) {
        alert("Failed to import file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const allTags = Array.from(new Set(items.flatMap((it) => it.tags)));

  const filtered = items.filter((it) => {
    if (filterTag && !it.tags.includes(filterTag)) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (it.title || "").toLowerCase().includes(q) ||
      (it.url || "").toLowerCase().includes(q) ||
      it.tags.join(" ").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Link Cart</h1>
          <div className="text-sm text-slate-600">Saved: {items.length}</div>
        </header>

        <form onSubmit={addItem} className="bg-white p-4 rounded-2xl shadow-sm mb-4">
          <div className="grid grid-cols-12 gap-2">
            <input
              className="col-span-12 sm:col-span-6 p-2 border rounded"
              placeholder="Paste URL or domain (e.g. example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              className="col-span-12 sm:col-span-4 p-2 border rounded"
              placeholder="Optional title (auto fetch if left empty)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="col-span-12 sm:col-span-2 p-2 border rounded"
              placeholder="tags (comma separated)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />

            <div className="col-span-12 flex gap-2 mt-3">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-indigo-600 text-white shadow hover:opacity-95"
                disabled={loadingTitle}
              >
                {loadingTitle ? "Adding..." : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setTitle("");
                  setTagInput("");
                }}
                className="px-3 py-2 rounded border"
              >
                Clear
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportJSON}
                  className="px-3 py-2 rounded border text-sm"
                >
                  Export
                </button>
                <label className="px-3 py-2 rounded border cursor-pointer text-sm">
                  Import
                  <input
                    type="file"
                    accept="application/json"
                    onChange={(e) => importJSON(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-3 mb-4">
          <input
            placeholder="Search saved links..."
            className="flex-1 p-2 border rounded"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setQuery("");
              setFilterTag("");
            }}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
        </div>

        <section>
          {filtered.length === 0 ? (
            <div className="text-center text-slate-500 py-10">No saved links match your search.</div>
          ) : (
            <ul className="grid gap-3">
              {filtered.map((it) => (
                <li key={it.id} className="bg-white p-3 rounded shadow-sm flex gap-3 items-start">
                  <div className="w-8 h-8 flex items-center justify-center rounded bg-slate-100 text-slate-700 font-medium">
                    {it.title ? it.title[0].toUpperCase() : "L"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <a href={it.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                        {it.title}
                      </a>
                      <div className="text-xs text-slate-500">{new Date(it.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-slate-600 break-words">{it.url}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {it.tags.map((t) => (
                        <button
                          key={t}
                          className="text-xs px-2 py-1 rounded bg-slate-100"
                          onClick={() => setFilterTag(t)}
                        >
                          #{t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => toggleFavorite(it.id)} className="text-sm">
                      {it.favorite ? "★" : "☆"}
                    </button>
                    <button onClick={() => editItem(it.id)} className="text-sm">
                      Edit
                    </button>
                    <button onClick={() => removeItem(it.id)} className="text-sm text-red-500">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-8 text-sm text-slate-500 text-center">
          Tip: This demo stores links locally in your browser. To make it available across devices, connect a backend
          (Node + Express + MongoDB or Supabase) and add user accounts.
        </footer>
      </div>
    </div>
  );
}
