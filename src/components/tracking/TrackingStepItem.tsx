"use client";

import type { TrackingStep } from "@/types/trackingMapper";

function getLocationBadgeLabel(role: "START" | "WAYPOINT" | "END") {
    if (role === "START") return "Departure";
    if (role === "END") return "Arrival";
    return null;
}

/* =========================
   Badge (이 파일 내부 전용)
========================= */
function Badge({
                   label,
                   icon,
                   variant = null,
               }: {
    label: string;
    icon?: string;
    variant?: "ON_TIME" | "DELAYED" | "EARLY" | null;
}) {
    const styles = {
        ON_TIME:  { bg: "#dcfce7", color: "#166534" },
        DELAYED:  { bg: "#fee2e2", color: "#991b1b" },
        EARLY:    { bg: "#fef9c3", color: "#854d0e" },
    };

    const defaultStyle = { bg: "#f3f4f6", color: "#374151" };

    const s = (variant && styles[variant]) ? styles[variant] : defaultStyle;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 999,
                background: s.bg,
                color: s.color,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
            }}
        >
            {icon && <span>{icon}</span>}
            {label}
        </span>
    );
}

/* =========================
   운송수단 아이콘 - DB 값 기준
========================= */
export function getModeIcon(mode: string | null) {
    if (!mode) return "🖥️";

    const modeUpper = mode.toUpperCase();

    // 육상 운송 (Land/Inland)
    if (modeUpper === "LE" || modeUpper === "LI") return "🚚";

    // 해상 운송 (Ocean)
    if (modeUpper === "OE" || modeUpper === "OI" || modeUpper === "SEA") return "🚢";

    // 항공 운송 (Air)
    if (modeUpper === "AE" || modeUpper === "AI" || modeUpper === "AIR") return "✈️";


    // 철도 운송
    if (modeUpper === "RAIL") return "🚆";

    return "🖥️";
}

export function getModeLabel(mode: string | null) {
    if (!mode) return "undefined";
    const modeUpper = mode.toUpperCase();
    if (modeUpper === "AE" || modeUpper === "AI") return "Air";
    if (modeUpper === "OE" || modeUpper === "OI") return "Ocean";
    if (modeUpper === "LE" || modeUpper === "LI") return "Land";
    return mode;
}

export function StatusDot({
                              status,
                          }: {
    status: "COMPLETED" | "CURRENT" | null;
    role: "START" | "WAYPOINT" | "END";
}) {
    const base = {
        width: 14,
        height: 14,
        borderRadius: "50%",
        flexShrink: 0,
    };

    if (status === "COMPLETED") {
        return (
            <div
                style={{
                    ...base,
                    background: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                }}
            >
                ✓
            </div>
        );
    }

    if (status === "CURRENT") {
        return (
            <div
                style={{
                    ...base,
                    border: "2px solid #3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#3b82f6",
                    }}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                ...base,
                background: "#e5e7eb",
            }}
        />
    );
}

export default function TrackingStepItem({
                                             title,
                                             location,
                                             tpTimeAct,
                                             tpTimeEst,
                                             mode,
                                             status,
                                             role,
                                             onClick,
                                             customBadge,
                                         }: TrackingStep & { onClick?: () => void; customBadge?: string }) {  // ✅ 타입 확장
    const timeStatus: { label: string; variant: "ON_TIME" | "DELAYED" | "EARLY" | null } | null = (() => {
        if (!tpTimeAct) return null;
        if (!tpTimeEst) return { label: "On Time", variant: "ON_TIME" };
        const act = new Date(tpTimeAct).getTime();
        const est = new Date(tpTimeEst).getTime();
        const diffMin = Math.round((act - est) / 60000);
        if (diffMin > 0) {
            const days = Math.floor(diffMin / 1440);
            const hours = Math.floor((diffMin % 1440) / 60);
            const delay = days > 0 ? `+${days}d${hours > 0 ? ` ${hours}h` : ""}` : `+${hours}h`;
            return { label: `Delayed`, variant: "DELAYED" };
        }
        return { label: "On Time", variant: "ON_TIME" };
    })();

    return (
        <div
            onClick={onClick}  // ✅ 클릭 이벤트
            style={{
                cursor: onClick ? "pointer" : "default",  // ✅ 커서 변경
                transition: "transform 0.2s ease, background 0.2s ease",  // ✅ 애니메이션
                borderRadius: "8px",  // ✅ 살짝 둥글게
            }}
            onMouseEnter={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.background = "rgba(0,0,0,0.02)";
                }
            }}
            onMouseLeave={(e) => {
                if (onClick) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "transparent";
                }
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", lineHeight: "16px" }}>
                <span style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>{title}</span>
                {customBadge
                    ? <Badge label={customBadge} variant={null} />
                    : timeStatus && <Badge label={timeStatus.label} variant={timeStatus.variant} />
                }
            </div>

            {(tpTimeAct || tpTimeEst) && (
                <div style={{ fontSize: 11, marginTop: 2 }}>
                    {tpTimeEst && (
                        <span style={{ color: "#9ca3af" }}>{tpTimeEst}</span>
                    )}
                    {tpTimeAct && tpTimeEst && " · "}
                    {tpTimeAct && (
                        <span style={{ color: "#111", fontWeight: 500 }}>{tpTimeAct}</span>
                    )}
                </div>
            )}
        </div>
    );
}