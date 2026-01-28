import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../../lib/api";
import pistaDefaultImg from "../../assets/pista-de-padel-.jpg";
import { useNavigate } from "react-router-dom";


function toLocalISODate(d = new Date()) {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

function formatEuro(value) {
    const num = Number(value);
    if (Number.isFinite(num)) return `${num.toFixed(2)} €`;
    return `${value} €`;
}

export default function NewReservation() {
    const [fecha, setFecha] = useState(() => toLocalISODate());

    const [pistas, setPistas] = useState([]);
    const [horarios, setHorarios] = useState([]); // catálogo completo
    const [dispByPista, setDispByPista] = useState({}); // { [pista_id]: disponibilidades[] }

    const [ui, setUi] = useState({ loading: true, error: "" });

    // seleccion por pista: { [pista_id]: number[] (horario_ids) }
    const [selected, setSelected] = useState({});
    // precio por pista
    const [pricing, setPricing] = useState({});
    // estado reserva por pista
    const [reserving, setReserving] = useState({});

    const priceTimers = useRef({}); // debounce por pista

    const navigate = useNavigate();


    // 1) cargar pistas + horarios una vez
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setUi((s) => ({ ...s, loading: true, error: "" }));

                const [pistasRes, horariosRes] = await Promise.all([
                    apiFetch("/api/pistas", { method: "GET" }),
                    apiFetch("/api/horarios", { method: "GET" }),
                ]);

                if (!alive) return;

                setPistas(pistasRes?.pistas ?? []);
                setHorarios(horariosRes?.horarios ?? []);
            } catch (e) {
                if (!alive) return;
                setUi({ loading: false, error: e?.message || "No se pudieron cargar datos iniciales." });
            } finally {
                if (!alive) return;
                setUi((s) => ({ ...s, loading: false }));
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    // 2) cargar disponibilidad cada vez que cambia fecha
    useEffect(() => {
        let alive = true;

        // resetea selección y precios al cambiar fecha
        setSelected({});
        setPricing({});
        setReserving({});

        (async () => {
            try {
                setUi((s) => ({ ...s, loading: true, error: "" }));

                const data = await apiFetch("/api/disponibilidad", {
                    method: "POST",
                    body: { fecha },
                });

                const rows = data?.disponibilidades_por_pista ?? [];
                const map = {};
                for (const r of rows) map[r.pista_id] = r.disponibilidades ?? [];

                if (!alive) return;
                setDispByPista(map);
            } catch (e) {
                if (!alive) return;
                setUi({ loading: false, error: e?.message || "No se pudo cargar la disponibilidad." });
                setDispByPista({});
            } finally {
                if (!alive) return;
                setUi((s) => ({ ...s, loading: false }));
            }
        })();

        return () => {
            alive = false;
        };
    }, [fecha]);

    const pistasOrdenadas = useMemo(() => {
        return [...pistas].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }, [pistas]);

    const turnos = useMemo(() => {
        // ordena turnos con prioridad si existen
        const uniq = Array.from(new Set(horarios.map((h) => h.turno || "otros")));
        const preferred = ["mañana", "tarde", "noche"];
        const rest = uniq.filter((t) => !preferred.includes(t)).sort();
        return preferred.filter((t) => uniq.includes(t)).concat(rest);
    }, [horarios]);

    const horariosByTurno = useMemo(() => {
        const map = {};
        for (const t of turnos) map[t] = [];
        for (const h of horarios) {
            const t = h.turno || "otros";
            (map[t] ||= []).push(h);
        }
        // orden estable por id (o por franja si algún día cambia)
        for (const t of Object.keys(map)) {
            map[t].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        }
        return map;
    }, [horarios, turnos]);

    function schedulePriceCalc(pistaId, horarioIds) {
        setReserving((prev) => ({ ...prev, [pistaId]: { loading: false, error: "", ok: "" } }));

        if (!horarioIds || horarioIds.length === 0) {
            setPricing((prev) => ({
                ...prev,
                [pistaId]: { loading: false, error: "", total_precio: null },
            }));
            return;
        }

        if (priceTimers.current[pistaId]) clearTimeout(priceTimers.current[pistaId]);

        setPricing((prev) => ({
            ...prev,
            [pistaId]: { ...(prev[pistaId] || {}), loading: true, error: "" },
        }));

        priceTimers.current[pistaId] = setTimeout(async () => {
            try {
                const data = await apiFetch("/api/calcular_precio", {
                    method: "POST",
                    body: { pista_id: pistaId, fecha, horario_ids: horarioIds },
                });

                setPricing((prev) => ({
                    ...prev,
                    [pistaId]: {
                        loading: false,
                        error: "",
                        total_precio: data?.total_precio ?? null,
                        precio_por_franja: data?.precio_por_franja ?? null,
                        extra_aplicado: data?.extra_aplicado ?? null,
                    },
                }));
            } catch (e) {
                setPricing((prev) => ({
                    ...prev,
                    [pistaId]: {
                        loading: false,
                        error: e?.message || "No se pudo calcular el precio.",
                        total_precio: null,
                    },
                }));
            }
        }, 250);
    }

    function toggleSlot(pistaId, horarioId, isAvailable) {
        if (!isAvailable) return;

        setSelected((prev) => {
            const current = prev[pistaId] ?? [];
            const exists = current.includes(horarioId);
            const next = exists ? current.filter((x) => x !== horarioId) : [...current, horarioId];
            next.sort((a, b) => a - b);

            schedulePriceCalc(pistaId, next);
            return { ...prev, [pistaId]: next };
        });
    }

    function clearSelection(pistaId) {
        setSelected((prev) => {
            const copy = { ...prev };
            delete copy[pistaId];
            return copy;
        });
        setPricing((prev) => {
            const copy = { ...prev };
            delete copy[pistaId];
            return copy;
        });
    }

    async function reservarPista(pistaId) {
        const horarioIds = selected[pistaId] ?? [];
        if (horarioIds.length === 0) return;

        const pista = pistas.find((p) => p.id === pistaId);
        const total = pricing[pistaId]?.total_precio;

        const msg =
            `Confirmar reserva\n\n` +
            `Pista: ${pista?.nombre ?? pistaId}\n` +
            `Fecha: ${fecha}\n` +
            `Franjas: ${horarioIds.join(", ")}\n` +
            `Total: ${total ? formatEuro(total) : "—"}`;

        if (!window.confirm(msg)) return;

        setReserving((prev) => ({ ...prev, [pistaId]: { loading: true, error: "", ok: "" } }));

        try {
            await apiFetch("/api/reservar", {
                method: "POST",
                body: { pista_id: pistaId, fecha, horario_ids: horarioIds },
            });

            // refrescar disponibilidad del día
            const data = await apiFetch("/api/disponibilidad", { method: "POST", body: { fecha } });
            const rows = data?.disponibilidades_por_pista ?? [];
            const map = {};
            for (const r of rows) map[r.pista_id] = r.disponibilidades ?? [];
            setDispByPista(map);

            clearSelection(pistaId);

            setReserving((prev) => ({
                ...prev,
                [pistaId]: { loading: false, error: "", ok: "Reserva creada ✅" },

            }));
            // navegar a "mis reservas"
            navigate("/app/reservas", { replace: true });
        } catch (e) {
            setReserving((prev) => ({
                ...prev,
                [pistaId]: { loading: false, error: e?.message || "No se pudo reservar.", ok: "" },
            }));
        }
    }

    return (
        <div>
            <div className="nrHeader">
                <div>
                    <h2>Nueva reserva</h2>
                    <p className="muted">Elige fecha y selecciona una o varias franjas por pista.</p>
                </div>

                <label className="field nrHeader__date">
                    <span className="field__label">Fecha</span>
                    <input
                        className="input"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </label>
            </div>

            {ui.error ? <div className="alert">{ui.error}</div> : null}
            {ui.loading ? <p className="muted">Cargando…</p> : null}

            {!ui.loading && pistasOrdenadas.length === 0 ? (
                <p className="muted">No hay pistas disponibles.</p>
            ) : null}

            <div className="nrGrid">
                {pistasOrdenadas.map((p) => {
                    const libres = dispByPista[p.id] ?? [];
                    const availableSet = new Set(libres.map((x) => x.id));

                    const selectedIds = selected[p.id] ?? [];
                    const selectedSet = new Set(selectedIds);

                    const pr = pricing[p.id] || { loading: false, error: "", total_precio: null };
                    const rv = reserving[p.id] || { loading: false, error: "", ok: "" };

                    return (
                        <div className="nrCard" key={p.id}>
                            <div className="nrCard__media">
                                <img
                                    className="nrCard__img"
                                    src={pistaDefaultImg}
                                    alt={`Imagen de ${p.nombre}`}
                                    loading="lazy"
                                />
                                <div className="nrCard__mediaBadge">
                                    {p.cubierta ? "Cubierta" : "Exterior"} · {p.plazas} plazas
                                </div>
                                <div className="nrCard__mediaTitle">{p.nombre}</div>
                            </div>

                            <div className="nrCard__body">
                                <div className="nrCard__meta">
                                    <span className="muted">Precio base</span>{" "}
                                    <strong>{formatEuro(p.precio_base)}</strong>
                                </div>

                                {horarios.length === 0 ? (
                                    <div className="muted">No hay horarios configurados.</div>
                                ) : (
                                    <div className="nrSlots">
                                        {turnos.map((turno) => {
                                            const arr = horariosByTurno[turno] ?? [];
                                            if (arr.length === 0) return null;

                                            return (
                                                <div key={turno} className="nrSlots__group">
                                                    <div className="nrSlots__groupTitle">{turno}</div>

                                                    <div className="nrSlots__wrap">
                                                        {arr.map((h) => {
                                                            const isAvailable = availableSet.has(h.id);
                                                            const active = selectedSet.has(h.id);

                                                            return (
                                                                <button
                                                                    key={h.id}
                                                                    type="button"
                                                                    disabled={!isAvailable}
                                                                    className={[
                                                                        "nrSlot",
                                                                        active ? "nrSlot--active" : "",
                                                                        !isAvailable ? "nrSlot--disabled" : "",
                                                                    ].join(" ")}
                                                                    onClick={() => toggleSlot(p.id, h.id, isAvailable)}
                                                                    title={isAvailable ? "Disponible" : "Ocupada"}
                                                                >
                                                                    {h.franja}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="nrCard__footer">
                                    <div className="nrPrice">
                                        <div className="nrPrice__row">
                                            <span className="muted">Seleccionadas</span>
                                            <strong>{selectedIds.length}</strong>
                                        </div>

                                        {pr.error ? <div className="nrPrice__error">{pr.error}</div> : null}

                                        <div className="nrPrice__row">
                                            <span className="muted">Total</span>
                                            <strong>
                                                {pr.loading
                                                    ? "Calculando…"
                                                    : pr.total_precio
                                                        ? formatEuro(pr.total_precio)
                                                        : "—"}
                                            </strong>
                                        </div>

                                        {!pr.loading && pr.extra_aplicado ? (
                                            <div className="muted nrPrice__hint">
                                                Extra: {pr.extra_aplicado.nombre} (+{formatEuro(pr.extra_aplicado.precio_extra)})
                                            </div>
                                        ) : null}
                                    </div>

                                    {rv.error ? <div className="nrReserve__error">{rv.error}</div> : null}
                                    {rv.ok ? <div className="nrReserve__ok">{rv.ok}</div> : null}

                                    <button
                                        type="button"
                                        className="btn btn--primary btn--full"
                                        disabled={selectedIds.length === 0 || pr.loading || rv.loading}
                                        onClick={() => reservarPista(p.id)}
                                    >
                                        {rv.loading ? "Reservando…" : "Reservar esta pista"}
                                    </button>

                                    {selectedIds.length > 0 ? (
                                        <button
                                            type="button"
                                            className="btn btn--ghost btn--full"
                                            onClick={() => clearSelection(p.id)}
                                            disabled={rv.loading}
                                        >
                                            Limpiar selección
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
}
