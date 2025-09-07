import { useEffect, useMemo, useState, useCallback } from "react";
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";

export default function MapUsers({ users = [], activeId, setActiveId }) {
  const { isLoaded } = useJsApiLoader({
    id: "gmaps",
    googleMapsApiKey: import.meta.env.VITE_GMAPS_API_KEY,
  });

  const [map, setMap] = useState(null);
  const onLoad = useCallback((m) => setMap(m), []);

  // Keep only users with finite coordinates (prevents NaN crashes)
  const validUsers = useMemo(
    () =>
      (users || []).filter(
        (u) =>
          Number.isFinite(+u?.latitude) && Number.isFinite(+u?.longitude)
      ),
    [users]
  );

  // Center derived from valid users (uses new field names)
  const center = useMemo(
    () =>
      validUsers[0]
        ? { lat: +validUsers[0].latitude, lng: +validUsers[0].longitude }
        : { lat: 39.5, lng: -98.35 },
    [validUsers]
  );

  // Fit bounds only with valid points
  useEffect(() => {
    if (!map || !isLoaded || validUsers.length === 0 || !window.google) return;
    const b = new window.google.maps.LatLngBounds();
    validUsers.forEach((u) =>
      b.extend({ lat: +u.latitude, lng: +u.longitude })
    );
    map.fitBounds(b, 48);
  }, [map, validUsers, isLoaded]);

  if (!isLoaded) return null;

  const activeUser = validUsers.find((u) => u.id === activeId);

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: 420, borderRadius: 12 }}
      center={center}
      zoom={3}
      onLoad={onLoad}
      onClick={() => setActiveId?.(null)}
      options={{ mapTypeControl: false, streetViewControl: false }}
    >
      {validUsers.map((u) => {
        const isActive = u.id === activeId;
        const anim =
          isActive && window.google
            ? window.google.maps.Animation.BOUNCE
            : undefined;
        return (
          <MarkerF
            key={u.id}
            position={{ lat: +u.latitude, lng: +u.longitude }}
            animation={anim}
            onClick={() => setActiveId?.(u.id)}
          />
        );
      })}

      {activeUser && (
        <InfoWindowF
          position={{
            lat: +activeUser.latitude,
            lng: +activeUser.longitude,
          }}
          onCloseClick={() => setActiveId?.(null)}
        >
          <div style={{ color: "#111", minWidth: 200, lineHeight: 1.35 }}>
            <strong>{activeUser.name}</strong>
            <br />
            ZIP: {activeUser.zip}
            <br />
            TZ: {activeUser.timezone}
            <br />
            {(+activeUser.latitude).toFixed(4)},{" "}
            {(+activeUser.longitude).toFixed(4)}
            <br />
            <a
              href={`https://maps.google.com/?q=${activeUser.latitude},${activeUser.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
