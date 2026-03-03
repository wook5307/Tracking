"use client";
import type {TrackingStep} from "@/types/trackingMapper";
import TrackingStepItem,{ StatusDot } from "./TrackingStepItem";

interface TrackingTimelineProps {
    steps: TrackingStep[];
    onStepClick?: (step: TrackingStep, index: number) => void;
}

export default function TrackingTimeline({ steps,onStepClick }: TrackingTimelineProps) {
    /* =========================
       🔥 CURRENT 판단 추상화
       (나중에 ETA / 시간 계산 로직으로 교체)
    ========================= */
    const isStartStep = (step: TrackingStep) => step.role === "START";
    const isCurrentStep = (step: TrackingStep) => step.status === "CURRENT";
    const isActiveStep = (step: TrackingStep) => step.status !== null;


    return (
        <div style={{ marginTop: 16 }}>
            {steps.map((step, idx) => {
                const active = isActiveStep(step);
                const current = isCurrentStep(step);
                const start = isStartStep(step);
                const next = steps[idx + 1];
                // const drawLine = active && next && isActiveStep(next);

                const drawLine = !!next;
                return (
                    <div
                        key={idx}
                        style={{
                            display: "flex",
                            gap: 16,
                            paddingBottom: 24, // 👉 step 간 간격
                        }}
                    >
                        {/* 왼쪽: 타임라인 축 */}
                        <div
                            style={{
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: 24,
                                paddingTop: 40,  // ✅ 20 → 40으로 늘림 (점을 더 아래로)

                            }}
                        >

                            {/* CURRENT 펄스 */}
                            {current && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: 34,  // ✅ paddingTop 고려해서 조정
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background: start
                                            ? "rgba(34, 197, 94, 0.35)"     // ✅ 초록
                                            : "rgba(59, 130, 246, 0.35)",   // 파란
                                        animation: start
                                            ? "pulse-ring-green 1.6s ease-out infinite"  // ✅ 초록 애니메이션
                                            : "pulse-ring 1.6s ease-out infinite",       // 파란 애니메이션
                                    }}
                                />
                            )}
                            <StatusDot status={step.status} role={step.role} />

                            {/* 연결선 */}
                            {drawLine && (
                                <div
                                    style={{
                                        width: 2,
                                        height: 30,  // ✅ flex: 1 삭제하고 이거 추가
                                        background: "#cbd5e1",
                                        marginTop: 6,
                                    }}
                                />
                            )}
                        </div>

                        {/* 오른쪽: 내용 박스 */}
                        <div
                            style={{
                                background: isCurrentStep(step)
                                    ? "rgba(59,130,246,0.08)"   // 흐린 파란색 강조
                                    : "transparent",
                                borderRadius: 12,
                                padding: 12,
                                transition: "background 0.2s ease",
                                border: isCurrentStep(step)
                                    ? "1px solid rgba(59,130,246,0.25)" // 얇은 파란 테두리
                                    : "1px solid transparent",
                            }}
                        >
                            <TrackingStepItem {...step}
                                              onClick={() => onStepClick?.(step, idx)}  // ✅ 클릭 전달
                            />
                        </div>

                    </div>

                );
            })}
        </div>
    );
}
