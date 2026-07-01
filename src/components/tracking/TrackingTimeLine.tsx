"use client";
import { useEffect, useRef } from "react";
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

    const currentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (currentRef.current) {
            currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [steps]);

    const totalDaysBadge = (() => {
        if (steps.length < 2) return null;
        const first = steps[0]?.tpTimeEst;
        const secondLast = steps[steps.length - 2]?.tpTimeEst;
        if (!first || !secondLast) return null;
        const diff = new Date(secondLast).getTime() - new Date(first).getTime();
        if (diff <= 0) return null;
        const days = Math.round(diff / (1000 * 60 * 60 * 24));
        return `${days} days`;
    })();


    return (
        <div style={{ marginTop: 4, height: "100%" }}>
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
                        ref={current ? currentRef : null}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            paddingBottom: 4,
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
                                paddingTop: 4,

                            }}
                        >

                            {/* CURRENT 펄스 */}
                            {current && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: -2,
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
                                        height: 8,
                                        marginTop: 4,
                                        ...(active
                                            ? { background: "#64748b" }
                                            : {
                                                borderLeft: "2px dashed #cbd5e1",
                                                background: "transparent",
                                            }
                                        ),
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
                                flex: 1,
                                minWidth: 0,
                                borderRadius: 12,
                                marginTop: 0,
                                padding: "0 12px 6px 12px",
                                transition: "background 0.2s ease",
                                border: isCurrentStep(step)
                                    ? "1px solid rgba(59,130,246,0.25)" // 얇은 파란 테두리
                                    : "1px solid transparent",
                            }}
                        >
                            <TrackingStepItem {...step}
                                              onClick={() => onStepClick?.(step, idx)}
                                              customBadge={idx === steps.length - 1 ? totalDaysBadge ?? undefined : undefined}
                            />
                        </div>

                    </div>

                );
            })}
        </div>
    );
}
