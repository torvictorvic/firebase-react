import { useEffect, useMemo, useState } from "react";
import { db, ref, onValue } from "./firebase";
import MapUsers from "./MapUsers";
import { formatInTimeZone } from "date-fns-tz";
import Footer from "./Footer";
import "./styles.css";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", zip: "" });

  const [search, setSearch] = useState("");
  const [tzFilter, setTzFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", zip: "" });
  const [activeId, setActiveId] = useState(null); // shared with Map

  useEffect(() => {
    const unsubscribe = onValue(ref(db, "users"), (snap) => {
      const val = snap.val() || {};
      
      const list = Object.entries(val).map(([id, u]) => ({
        id,
        ...u,
        // Fit the name of fields
        latitude: u.latitude ?? u.lat,
        longitude: u.longitude ?? u.lon
      }));

      // Stable sort by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setUsers(list);
    });
    return () => unsubscribe();
  }, []);

  // Simple form validation
  const zipOk = /^\d{4,10}$/.test(form.zip);
  const canCreate = form.name.trim().length > 0 && zipOk;

  const createUser = async (e) => {
    e.preventDefault();
    if (!canCreate) return;
    const resp = await fetch(`${API}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!resp.ok) console.error("Create failed", await resp.text());
    setForm({ name: "", zip: "" });
  };

  const deleteUser = async (id) => {
    const resp = await fetch(`${API}/api/users/${id}`, { method: "DELETE" });
    if (!resp.ok) console.error("Delete failed", await resp.text());
  };

  // Inline edit
  const startEdit = (u) => {
    setEditingId(u.id);
    setDraft({ name: u.name, zip: u.zip });
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = async (id) => {
    const resp = await fetch(`${API}/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!resp.ok) console.error("Update failed", await resp.text());
    setEditingId(null);
  };

  // Derive UI state
  const timezones = useMemo(
    () => Array.from(new Set(users.map((u) => u.timezone))).sort(),
    [users]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ =
        !q ||
        u.name.toLowerCase().includes(q) ||
        String(u.zip).toLowerCase().includes(q);
      const matchTz = !tzFilter || u.timezone === tzFilter;
      return matchQ && matchTz;
    });
  }, [users, search, tzFilter]);

  const nowLocal = (tz) =>
    tz ? formatInTimeZone(new Date(), tz, "EEE HH:mm") : "-";

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto" }}>
      <MapUsers users={filtered} activeId={activeId} setActiveId={setActiveId} />

      <h2>User Management</h2>

      {/* Functons toolbar */}
      <div style={{ display: "flex", gap: 8, margin: "8px 0 16px" }}>
        <input
          placeholder="Search name or ZIP"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          value={tzFilter}
          onChange={(e) => setTzFilter(e.target.value)}
          style={{ minWidth: 200 }}
        >
          <option value="">All timezones</option>
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Create form */}
      <form onSubmit={createUser} style={{ display: "flex", gap: "10px" }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          placeholder="ZIP"
          value={form.zip}
          onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
        />
        <button type="submit" disabled={!canCreate}>
          Create
        </button>
      </form>
      {!zipOk && form.zip && (
        <div style={{ color: "#f99", marginTop: 6 }}>
          ZIP should be 4–10 digits.
        </div>
      )}

      {/* List - Table */}
      <table
        border="1"
        cellPadding="6"
        style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>ZIP</th>
            <th>Lat</th>
            <th>Lon</th>
            <th>Timezone</th>
            <th>Local time</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr
              key={u.id}
              onMouseEnter={() => setActiveId(u.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              {editingId === u.id ? (
                <>
                  <td>
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={draft.zip}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, zip: e.target.value }))
                      }
                    />
                  </td>
                  <td colSpan={3} />
                  <td>{nowLocal(u.timezone)}</td>
                  <td>
                    <button onClick={() => saveEdit(u.id)}>Save</button>{" "}
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{u.name}</td>
                  <td>{u.zip}</td>
                  <td>{u.latitude}</td>
                  <td>{u.longitude}</td>
                  <td>{u.timezone}</td>
                  <td>{nowLocal(u.timezone)}</td>
                  <td>
                    <button onClick={() => setActiveId(u.id)}>Show on Map</button>{" "}
                    <button onClick={() => startEdit(u)}>Edit</button>{" "}
                    <button onClick={() => deleteUser(u.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <Footer />
    </div>
  );
}
