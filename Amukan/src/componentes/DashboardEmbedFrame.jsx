import { useEffect, useState } from "react";

export default function EmbeddedMetabaseFrame({
  endpoint = "/api/metabase/org-dashboard",
  height = 420,                      // ← opcional: más alto por defecto
  className = "",
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  // Helper para obtener el access token 
  const getAccessToken = () =>
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  useEffect(() => {
    const accessToken = getAccessToken();

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    fetch(endpoint, {
      method: "GET",
      headers,                // ← ENVÍA JWT si lo tienes
      credentials: "include", // ← sigue mandando la cookie de sesión si existe
    })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((d) => setUrl(d.url))
      .catch((e) => setError(e.message));
  }, [endpoint]);

  if (!url && !error) {
    return (
      <div
        className={`w-full rounded-lg bg-gray-200 animate-pulse ${className}`}
        style={{ height }}
      />
    );
  }

  if (error || !url) {
    return (
      <div
        className={`w-full rounded-lg bg-red-50 text-red-700 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        No se pudo cargar el dashboard. {error}
      </div>
    );
  }

  return (
    <iframe
      title="Metabase embed"
      src={url}
      className={`w-full rounded-lg shadow-sm ${className}`}
      style={{ height }}
      frameBorder={0}
      allowTransparency
    />
  );
}