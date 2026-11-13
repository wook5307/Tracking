"use client";
import { useEffect, useRef } from "react";
import type {TrackingStep} from "@/types/trackingMapper";
import TrackingStepItem,{ StatusDot } from "./TrackingStepItem";

interface TrackingTimelineProps {
    steps: TrackingStep[];
    onStepClick?: (step: TrackingStep, index: number) => void;
    isLight?: boolean;
}

export default function TrackingTimeline({ steps, onStepClick, isLight }: TrackingTimelineProps) {
    /* =========================
       🔥 CURRENT 판단 추상화
       (나중에 ETA / 시간 계산 로직으로 교체)
    ========================= */
    const isCurrentStep = (step: TrackingStep) => step.status === "CURRENT";
    const isActiveStep = (step: TrackingStep) => step.status !== null;

    const currentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (currentRef.current) {
            currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [steps]);


    return (
        <div style={{ marginTop: 4, height: "100%" }}>
            {steps.map((step, idx) => {
                const active = isActiveStep(step);
                const current = isCurrentStep(step);
                const next = steps[idx + 1];
                // const drawLine = active && next && isActiveStep(next);

                // 도트 중심까지의 거리: paddingTop(12) + dot반지름(10) = 22px
                const DOT_CENTER = 22;
                const isFirst = idx === 0;
                const isLast = idx === steps.length - 1;
                const lineTop = isFirst ? `${DOT_CENTER}px` : "0";
                const lineBottom = isLast ? `calc(100% - ${DOT_CENTER}px)` : "0";

                return (
                    <div
                        key={idx}
                        ref={current ? currentRef : null}
                        style={{ display: "flex", alignItems: "stretch", padding: "0 16px" }}
                    >
                        {/* 도트 + 연결선 (선 위에 도트 올리기) */}
                        <div style={{
                            position: "relative",
                            width: 40,
                            flexShrink: 0,
                            display: "flex",
                            justifyContent: "center",
                        }}>
                            {/* 연결선: 첫 번째는 도트부터, 마지막은 도트까지 */}
                            <div style={{
                                position: "absolute",
                                top: lineTop,
                                bottom: lineBottom,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 2,
                                background: isLight ? "#cbd5e1" : "#334155",
                            }} />
                            {/* 도트: 선 위에 겹쳐서 배치 (펄스 링은 StatusDot 내부에서 도트 중심에 고정) */}
                            <div style={{ position: "relative", paddingTop: 12 }}>
                                <StatusDot status={step.status} role={step.role} />
                            </div>
                        </div>

                        {/* 내용 */}
                        <div style={{
                            flex: 1,
                            minWidth: 0,
                            borderRadius: 12,
                            padding: "12px 16px 14px 12px",
                            minHeight: 64,
                            background: isCurrentStep(step) ? "rgba(59,130,246,0.08)" : "transparent",
                            border: isCurrentStep(step) ? "1px solid rgba(59,130,246,0.25)" : "1px solid transparent",
                            transition: "background 0.2s ease",
                        }}>
                            <TrackingStepItem {...step}
                                onClick={() => onStepClick?.(step, idx)}
                                isLight={isLight}
                            />
                        </div>
                    </div>

                );
            })}
        </div>
    );
}
