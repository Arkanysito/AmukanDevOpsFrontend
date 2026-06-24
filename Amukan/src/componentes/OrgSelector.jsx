import { useEffect, useState } from "react";

export default function OrgSelector({ onSelected }) {
  const [orgs, setOrgs] = useState([]);
  const [sel, setSel] = useState("");

  useEffect(() => {
    fetch("/api/me/orgs", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setOrgs(d.organizations || []);
        if ((d.organizations || []).length === 1) {
          setSel(d.organizations[0].id);
          onSelected?.(d.organizations[0].id);
        }
      });
  }, []);

  const change = async (e) => {
    const id = e.target.value;
    setSel(id);
    await fetch("/api/me/active-org", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "text/plain" }, // simple
      body: id,
    });
    onSelected?.(id);
  };

  return (
    <select className="border rounded px-2 py-1" value={sel} onChange={change}>
      <option value="" disabled>Selecciona organización…</option>
      {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
}