import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

function formatEuro(value) {
  const num = Number(value);
  if (Number.isFinite(num)) return `${num.toFixed(2)} €`;
  return `${value} €`;
}

function formatDateES(iso) {
  // iso: YYYY-MM-DD
  try {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(dt);
  } catch {
    return iso;
  }
}

export default function UserReservations() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    reservas: [],
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setState({ loading: true, error: "", reservas: [] });

        // ⬇️ ajusta si tu endpoint real tiene otro path
        const data = await apiFetch("/api/mis_reservas", { method: "GET" });

        const reservas = data?.reservas ?? [];
        if (!alive) return;

        setState({ loading: false, error: "", reservas });
      } catch (e) {
        if (!alive) return;
        setState({
          loading: false,
          error: e?.message || "No se pudieron cargar tus reservas.",
          reservas: [],
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const reservasOrdenadas = useMemo(() => {
    return [...state.reservas].sort((a, b) => {
      // fecha desc; si empatan, id desc
      const fa = a.fecha || "";
      const fb = b.fecha || "";
      if (fa < fb) return 1;
      if (fa > fb) return -1;
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }, [state.reservas]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2>Mis reservas</h2>
          <p className="muted">Aquí verás tus reservas actuales e históricas.</p>
        </div>
      </div>

      {state.loading ? <p className="muted">Cargando…</p> : null}
      {state.error ? <div className="alert">{state.error}</div> : null}

      {!state.loading && !state.error && reservasOrdenadas.length === 0 ? (
        <p className="muted">Aún no tienes reservas.</p>
      ) : null}

      {!state.loading && !state.error && reservasOrdenadas.length > 0 ? (
        <div className="resList">
          {reservasOrdenadas.map((r) => {
            const horarios = r.horarios ?? [];
            const total = r.total_precio ?? null;

            return (
              <div className="resCard" key={r.id}>
                <div className="resCard__top">
                  <div>
                    <div className="resCard__title">
                      {r.pista_nombre ?? `Pista ${r.pista_id ?? "—"}`}
                    </div>
                    <div className="resCard__sub">
                      <span className="muted">{formatDateES(r.fecha)}</span>
                      <span className="dot">·</span>
                      <span className="muted">Reserva #{r.id}</span>
                    </div>
                  </div>

                  <div className="resCard__total">
                    <span className="muted">Total</span>
                    <strong>{total ? formatEuro(total) : "—"}</strong>
                  </div>
                </div>

                <div className="resCard__body">
                  {horarios.length === 0 ? (
                    <div className="muted">Sin horarios asociados.</div>
                  ) : (
                    <div className="resSlots">
                      {horarios
                        .slice()
                        .sort((a, b) => (a.horario_id ?? 0) - (b.horario_id ?? 0))
                        .map((h) => (
                          <div className="resSlot" key={h.horario_reserva_id ?? `${r.id}-${h.horario_id}`}>
                            <div className="resSlot__left">
                              <div className="resSlot__time">{h.franja}</div>
                              <div className="resSlot__meta muted">{h.turno}</div>
                            </div>
                            <div className="resSlot__right">
                              <strong>{formatEuro(h.precio)}</strong>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

     
    </div>
  );
}
