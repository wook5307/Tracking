"use client";

import { TrackingHeader, TrackingStep } from "@/types/trackingMapper";
import TrackingTimeline from "./TrackingTimeLine";

interface TrackingSummaryProps {
    header: TrackingHeader;
    steps: TrackingStep[];
    flntNo?: string;
    onStepClick?: (step: TrackingStep, index: number) => void;
    isLight?: boolean;
}

/* =========================
   전체 화물 상태 판단
   - DELIVERED : 마지막 단계까지 완료 (header.status === "ARRIVED")
   - IN_TRANSIT: 일부 단계 완료 (운송 진행 중)
   - PENDING   : 완료된 단계 없음 (운송 시작 전)
========================= */
type OverallStatus = "DELIVERED" | "IN_TRANSIT" | "PENDING";

function getOverallStatus(header: TrackingHeader, steps: TrackingStep[]): OverallStatus {
    if (header.status === "ARRIVED") return "DELIVERED";
    const completedCount = steps.filter((s) => s.status === "COMPLETED").length;
    return completedCount === 0 ? "PENDING" : "IN_TRANSIT";
}

/* =========================
   KPI 3분할 요약 (Status / Total / On-time)
   - Status : 전체 화물 상태
   - Total  : 출발~도착 총 소요 일수
   - On-time: 도착 예정(E) 대비 실제(A) 차이
             늦음 +Nd(빨강) / 빠름 -Nd(초록) / 정시 On time
========================= */
function KpiSummary({
    header,
    steps,
    isLight,
}: {
    header: TrackingHeader;
    steps: TrackingStep[];
    isLight?: boolean;
}) {
    const overallStatus = getOverallStatus(header, steps);

    const departStep = steps.find((s) => s.role === "START");
    const arriveStep = [...steps].reverse().find((s) => s.role === "END");

    // Total: 문전-to-문전(door-to-door) — 체크포인트 첫 단계~마지막 단계 기준.
    // 체크포인트에 시간이 없는 레거시 데이터만 trk_master의 출발/도착일로 대체.
    const departTime = departStep?.tpTimeAct ?? departStep?.tpTimeEst ?? header.atd ?? null;
    const arriveTime = arriveStep?.tpTimeAct ?? arriveStep?.tpTimeEst ?? header.ata ?? null;
    const startMs = departTime ? new Date(departTime).getTime() : null;
    const endMs = arriveTime ? new Date(arriveTime).getTime() : null;
    const transitDays =
        startMs && endMs && endMs > startMs ? Math.round((endMs - startMs) / 86400000) : null;

    // On-time: 도착 예정 대비 실제 (실제 도착이 있을 때만 확정)
    const estMs = (header.etaDate ?? arriveStep?.tpTimeEst) ? new Date((header.etaDate ?? arriveStep?.tpTimeEst)!).getTime() : null;
    const actMs = (header.ata ?? arriveStep?.tpTimeAct) ? new Date((header.ata ?? arriveStep?.tpTimeAct)!).getTime() : null;
    const onTimeDelta =
        estMs && actMs ? Math.round((actMs - estMs) / 86400000) : null;

    const textPrimary = isLight ? "#0f172a" : "#f1f5f9";
    const textLabel = isLight ? "#94a3b8" : "#64748b";
    const divider = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";

    const statusConfig = {
        DELIVERED: { label: "Delivered", color: isLight ? "#16a34a" : "#4ade80" },
        IN_TRANSIT: { label: "In Transit", color: isLight ? "#2563eb" : "#60a5fa" },
        PENDING: { label: "Pending", color: isLight ? "#64748b" : "#cbd5e1" },
    }[overallStatus];

    let onTimeText = "-";
    let onTimeColor = textPrimary;
    if (onTimeDelta !== null) {
        if (onTimeDelta > 0) {
            onTimeText = `+${onTimeDelta}d`;
            onTimeColor = isLight ? "#dc2626" : "#f87171";
        } else if (onTimeDelta < 0) {
            onTimeText = `${onTimeDelta}d`;
            onTimeColor = isLight ? "#16a34a" : "#4ade80";
        } else {
            onTimeText = "On time";
            onTimeColor = isLight ? "#16a34a" : "#4ade80";
        }
    }

    const cell = (label: string, value: string, valueColor: string) => (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span style={{ fontSize: 11, color: textLabel, fontWeight: 600 }}>{label}</span>
            <span
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: valueColor,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {value}
            </span>
        </div>
    );

    return (
        <div style={{ padding: "12px 16px 4px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${divider}`,
                }}
            >
                {cell("Status", statusConfig.label, statusConfig.color)}
                <div style={{ width: 1, background: divider, flexShrink: 0 }} />
                {cell("Total", transitDays !== null ? `${transitDays} days` : "-", textPrimary)}
                <div style={{ width: 1, background: divider, flexShrink: 0 }} />
                {cell("On-time", onTimeText, onTimeColor)}
            </div>
        </div>
    );
}

export default function TrackingSummary({ header, steps, flntNo, onStepClick, isLight }: TrackingSummaryProps) {
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <KpiSummary header={header} steps={steps} isLight={isLight} />
            <TrackingTimeline steps={steps} onStepClick={onStepClick} isLight={isLight} />
        </div>
    );
}
