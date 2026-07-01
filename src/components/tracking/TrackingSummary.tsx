"use client";

import { TrackingHeader, TrackingStep } from "@/types/trackingMapper";
import TrackingTimeline from "./TrackingTimeLine";
import { getModeIcon, getModeLabel } from "./TrackingStepItem";

interface TrackingSummaryProps {
    header: TrackingHeader;
    steps: TrackingStep[];
    flntNo?: string;
    onStepClick?: (step: TrackingStep, index: number) => void;
}

export default function TrackingSummary({
                                            header,
                                            steps,
                                            flntNo,
                                            onStepClick,
                                        }: TrackingSummaryProps) {
    // ✅ mapTrackingData에서 마지막 단계 완료 여부로 이미 계산된 상태 사용
    const isArrivedBySteps = header.status === "ARRIVED";

    const dominantMode = (() => {
        const freq: Record<string, number> = {};
        for (const s of steps) {
            if (s.mode) freq[s.mode] = (freq[s.mode] ?? 0) + 1;
        }
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    })();

    return (
            <div
            style={{
                background: "#fff",
                borderRadius: 16,
                padding: 0,
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            {/* 고정 영역 - Master 테이블 정보 */}
            <div style={{ padding: "20px 20px 0 20px", flexShrink: 0 }}>
                <div style={{ marginBottom: 12 }}>
                    <span
                        style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: isArrivedBySteps ? "#E8F5E9" : "#FFF3E0",
                            color: isArrivedBySteps ? "#2E7D32" : "#EF6C00",
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        {isArrivedBySteps ? "ARRIVED" : "IN TRANSIT"}
                    </span>
                </div>

                <h3 style={{ margin: "6px 0", color: "#111" }}>
                    📋 {header.trackingNo}
                </h3>

                {/* Master 테이블: 출발지 → 도착지 */}
                <div style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
                    📍 {header.departPortCode} → {header.arrivalPortCode}
                </div>

                <div style={{ fontSize: 13, marginBottom: 16, color: "#111" }}>
                    <div>{getModeIcon(dominantMode)} <strong>{header.carrier}</strong>{flntNo ? ` / ${flntNo}` : ""}</div>
                    <div><strong>🗓️ ETD</strong> : {header.etdDate?.replace('T', ' ').substring(0, 19) ?? "-"}</div>
                    <div><strong>🗓️ ETA</strong> : {header.etaDate?.replace('T', ' ').substring(0, 19) ?? "-"}</div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: 0 }} />
            </div>

            {/* 스크롤 영역 - Detail 테이블의 경유지 정보 (TrackingTimeline이 처리) */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 20px 20px 20px",
                    paddingTop: 4,
                    minHeight: 0,
                }}
            >
                <TrackingTimeline
                    steps={steps}
                    onStepClick={onStepClick}  // ✅ 전달
                />
            </div>
        </div>
    );
}