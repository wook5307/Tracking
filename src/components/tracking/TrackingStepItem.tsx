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
    variant?: "START" | "COMPLETED" | "CURRENT" | null;
}) {
    const styles = {
        START: { bg: "#eff6ff", color: "#1d4ed8" },
        COMPLETED: { bg: "#ecfdf5", color: "#065f46" },
        CURRENT: { bg: "#eff6ff", color: "#1d4ed8" },
        // PENDING: { bg: "#f3f4f6", color: "#374151" },
    };

// ✅ 기본 스타일 별도 정의
    const defaultStyle = { bg: "#f3f4f6", color: "#374151" };

    const s = variant ? styles[variant] : defaultStyle;
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
function getModeIcon(mode: string | null) {
    if (!mode) return "🖥️";

    const modeUpper = mode.toUpperCase();

    // 육상 운송 (Land/Inland)
    if (modeUpper === "LO" || modeUpper === "LI") return "🚚";

    // 해상 운송 (Ocean)
    if (modeUpper === "OE" || modeUpper === "OI") return "🚢";

    // 항공 운송 (Air)
    if (modeUpper === "AE" || modeUpper === "AI") return "✈️";

    // 철도 운송
    if (modeUpper === "RAIL") return "🚆";

    return "🖥️";
}

export function StatusDot({
                              status,
                              role
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

    if (role === "START") {
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
                                             datetime,
                                             mode,
                                             status,
                                             role,
                                             onClick,  // ✅ props에 추가
                                         }: TrackingStep & { onClick?: () => void }) {  // ✅ 타입 확장
    const locationLabel = getLocationBadgeLabel(role);

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
            <div style={{ fontWeight: 600, color: "#111", lineHeight: "22px" }}>
                {title}
            </div>

            {(datetime || location) && (
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    {datetime}
                    {datetime && location && " · "}
                    {location}
                </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Badge label={mode || "undefined"} icon={getModeIcon(mode)} />
                {/* ✅ status가 null이 아닐 때만 렌더링 */}
                {status && <Badge label={status} variant={status} />}

                {locationLabel && (
                    <Badge label={locationLabel} variant="CURRENT" />
                )}
            </div>
        </div>
    );
}