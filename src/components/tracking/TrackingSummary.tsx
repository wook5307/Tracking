"use client";

import { TrackingHeader, TrackingStep } from "@/types/trackingMapper";
import TrackingTimeline from "./TrackingTimeLine";

interface TrackingSummaryProps {
    header: TrackingHeader;
    steps: TrackingStep[];
    onStepClick?: (step: TrackingStep, index: number) => void;  // ✅ 추가

}

export default function TrackingSummary({
                                            header,
                                            steps,
                                            onStepClick,  // ✅ 추가

                                        }: TrackingSummaryProps) {
    // ✅ 현재 시간과 Master 테이블의 ETA 비교로 도착 여부 판단
    const isArrivedBySteps = header.etaDate
        ? new Date() >= new Date(header.etaDate)
        : false;

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                padding: 0,
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                height: "85vh",
                overflow: "hidden",
            }}
        >
            {/* 고정 영역 - Master 테이블 정보 */}
            <div style={{ padding: 20, flexShrink: 0 }}>
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
                    {header.trackingNo}
                </h3>

                {/* Master 테이블: 출발지 → 도착지 */}
                <div style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>
                    {header.departPortCode} → {header.arrivalPortCode}
                </div>

                <div style={{ fontSize: 13, marginBottom: 16, color: "#111" }}>
                    <div><strong>Carrier</strong> : {header.carrier}</div>
                    <div><strong>ETD</strong> : {header.etdDate?.replace('T', ' ').substring(0, 19) ?? "-"}</div>
                    <div><strong>ETA</strong> : {header.etaDate?.replace('T', ' ').substring(0, 19) ?? "-"}</div>
                    <div><strong>Last Event</strong> : {header.lastEventTime?.replace('T', ' ').substring(0, 19) ?? "-"}</div>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #eee", margin: 0 }} />
            </div>

            {/* 스크롤 영역 - Detail 테이블의 경유지 정보 (TrackingTimeline이 처리) */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 20px 20px 20px",
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