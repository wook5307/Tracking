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
                              role,
                          }: {
    status: "COMPLETED" | "CURRENT" | null;
    role: "START" | "WAYPOINT" | "END";
}) {
    const base = {
        width: 20,
        height: 20,
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
        const isStart = role === "START";
        return (
            <div style={{ ...base, position: "relative", display: "inline-flex" }}>
                {/* 펄스 링: 도트의 자식이라 항상 도트 중심에 고정 */}
                <span
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: isStart ? "rgba(34,197,94,0.35)" : "rgba(59,130,246,0.35)",
                        animation: isStart
                            ? "pulse-ring-green 1.6s ease-out infinite"
                            : "pulse-ring 1.6s ease-out infinite",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        ...base,
                        position: "relative",
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
                                             isLight,
                                         }: TrackingStep & { onClick?: () => void; customBadge?: string; isLight?: boolean }) {  // ✅ 타입 확장
    const timeStatus: { label: string; variant: "ON_TIME" | "DELAYED" | "EARLY" | null } | null = (() => {
        if (!tpTimeAct) return null;
        if (!tpTimeEst) return { label: "On Time", variant: "ON_TIME" };
        const act = new Date(tpTimeAct).getTime();
        const est = new Date(tpTimeEst).getTime();
        const diffMin = Math.round((act - est) / 60000);
        if (diffMin === 0) return { label: "On Time", variant: "ON_TIME" };

        // 예정 대비 차이를 "1D 2H" / "3H" / "40M" 형태로 (1시간 미만은 분 단위)
        const abs = Math.abs(diffMin);
        const days = Math.floor(abs / 1440);
        const hours = Math.floor((abs % 1440) / 60);
        const gap = days > 0
            ? `${days}D${hours > 0 ? ` ${hours}H` : ""}`
            : hours > 0 ? `${hours}H` : `${abs}M`;

        if (diffMin > 0) return { label: `Delayed +${gap}`, variant: "DELAYED" };
        return { label: `Early -${gap}`, variant: "EARLY" };
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
                <span style={{ fontWeight: 600, color: isLight ? "#0f172a" : "#e2e8f0", fontSize: 15 }}>{title}</span>
                {customBadge
                    ? <Badge label={customBadge} variant={null} />
                    : timeStatus && <Badge label={timeStatus.label} variant={timeStatus.variant} />
                }
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                {tpTimeEst && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 16, height: 16, borderRadius: "50%",
                            background: isLight ? "#dbeafe" : "#bfdbfe",
                            color: "#1d4ed8",
                            fontSize: 9, fontWeight: 700, flexShrink: 0,
                        }}>E</span>
                        <span style={{ fontSize: 12, color: isLight ? "#64748b" : "#94a3b8" }}>
                            {tpTimeEst.slice(0, 16)}
                        </span>
                    </div>
                )}
                {tpTimeAct && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 16, height: 16, borderRadius: "50%",
                            background: isLight ? "#1d4ed8" : "#1d4ed8",
                            color: "#bfdbfe",
                            fontSize: 9, fontWeight: 700, flexShrink: 0,
                        }}>A</span>
                        <span style={{ fontSize: 12, color: isLight ? "#1e293b" : "#cbd5e1", fontWeight: 600 }}>
                            {tpTimeAct.slice(0, 16)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}