"use client";

import { ShipMent, mapTrackingData, TrackingStep } from "@/types/trackingMapper";
import { useEffect, useRef, useState } from "react";
import TrackingSummary from "./TrackingSummary";
import RouteMap, { RouteMapHandle } from "./RouteMap";

interface TrackingResultProps {
    shipment: ShipMent;
    onBack: () => void;
    onSearch: (trackingNo: string) => void;
}

export default function TrackingResult({ shipment, onBack, onSearch }: TrackingResultProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { header, steps, mapPoints, progressPercent } = mapTrackingData(shipment);
    const mapRef = useRef<RouteMapHandle>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const handleStepClick = (step: TrackingStep, index: number) => {
        const point = mapPoints[index];
        if (point && !(point.lat === 0 && point.lng === 0) && mapRef.current) {
            mapRef.current.focusOnPoint(point.lat, point.lng);
        }
    };


    const [touchStart, setTouchStart] = useState(0);
    const [touchCurrent, setTouchCurrent] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    type GlobalPoint = { lat: number; lng: number; label: string; iconType: string };
    type LocationRow = { id: number; name: string; lat: number; lng: number; type: "AIRPORT" | "PORT" | "OFFICE" };
    const [globalPoints, setGlobalPoints] = useState<GlobalPoint[]>([]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        fetch("/api/locations")
            .then(res => res.json())
            .then((rows: LocationRow[]) =>
                setGlobalPoints(rows.map(l => ({ lat: l.lat, lng: l.lng, label: l.name, iconType: l.type })))
            )
            .catch(err => console.error("locations load error", err));
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientY);
        setTouchCurrent(e.touches[0].clientY);
        setIsDragging(true);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        setTouchCurrent(e.touches[0].clientY);
    };
    const handleTouchEnd = () => {
        if (!isDragging) return;
        const diff = touchCurrent - touchStart;
        if (diff > 50) setIsCollapsed(true);
        else if (diff < -50) setIsCollapsed(false);
        setIsDragging(false);
        setTouchStart(0);
        setTouchCurrent(0);
    };
    const getDragOffset = () => {
        if (!isDragging || !isMobile) return 0;
        const diff = touchCurrent - touchStart;
        return isCollapsed ? Math.min(0, diff) : Math.max(0, diff);
    };
    const dragOffset = getDragOffset();

    const [isLight, setIsLight] = useState(true);
    const isArrived = header.status === "ARRIVED";
    // "YYYY-MM-DD HH:MM" → "MM-DD HH:MM" (시간이 있을 때만 시:분 표시)
    const fmtMD = (d: string | null) => {
        if (!d) return "-";
        const s = d.replace("T", " ");
        return s.substring(0, 16);  // YYYY-MM-DD HH:MM
    };
    // TOTAL TRANSIT: 하단바는 전부 본선(항구) 기준 — Origin/Destination의 E/A(etd/eta/atd/ata)와
    // 같은 스코프로 통일 (왼쪽 타임라인의 Total은 별개로 문전-to-문전 유지)
    const transitDays = header.etdDate && header.etaDate
        ? Math.round((new Date(header.etaDate).getTime() - new Date(header.etdDate).getTime()) / (1000 * 60 * 60 * 24))
        : null;

    // 출발 구간(origin) / 도착 구간(destination) 분리
    // 앞에서부터 첫 번째 OE/AE(수출 출발, Port of Loading)를 찾아 그 인덱스까지 = origin
    const lastOriginIdx = (() => {
        for (let i = 0; i < steps.length; i++) {
            const m = (steps[i].mode || "").toUpperCase();
            if (m === "OE" || m === "AE") return i;
        }
        return Math.floor(steps.length / 2) - 1;
    })();
    const originSteps = steps.slice(0, lastOriginIdx + 1);
    const destSteps   = steps.slice(lastOriginIdx + 1);

    // tpTimeEst도 없는 단계(플레이스홀더)는 분모에서 제외
    const originValid = originSteps.filter(s => s.tpTimeAct || s.tpTimeEst);
    const destValid   = destSteps.filter(s => s.tpTimeAct || s.tpTimeEst);
    const originDone  = originValid.filter(s => s.tpTimeAct).length;
    const destDone    = destValid.filter(s => s.tpTimeAct).length;
    const originPct   = originValid.length ? Math.round(originDone / originValid.length * 100) : 0;
    const destPct     = destValid.length   ? Math.round(destDone   / destValid.length   * 100) : 0;

    const now = Date.now();
    const etdMs = header.etdDate ? new Date(header.etdDate).getTime() : null;
    const etaMs = header.etaDate ? new Date(header.etaDate).getTime() : null;
    const intlPct = (etdMs && etaMs && etaMs > etdMs)
        ? Math.min(100, Math.max(0, Math.round((now - etdMs) / (etaMs - etdMs) * 100)))
        : 0;

    const intlDaysPassed = etdMs ? Math.max(0, Math.round((now - etdMs) / 86400000)) : null;

    // 바는 소요시간과 무관하게 origin / international / destination 을 균등 3등분
    const originFlex = 1;
    const intlFlex   = 1;
    const destFlex   = 1;

    // 현재 구간 판단
    const currentPhase = originPct < 100 ? "origin" : destPct > 0 ? "destination" : "international";


    const T = {
        panelBg:    isLight ? "rgba(255,255,255,0.95)" : "rgba(10,15,30,0.90)",
        border:     isLight ? "rgba(0,0,0,0.08)"       : "rgba(255,255,255,0.07)",
        textPrimary:isLight ? "#0f172a"                : "#fff",
        textMuted:  isLight ? "#64748b"                : "#94a3b8",
        textSub:    isLight ? "#475569"                : "#475569",
        divider:    isLight ? "rgba(0,0,0,0.1)"        : "rgba(255,255,255,0.12)",
    };
    const HEADER_H = 84;
    const BOTTOM_H = 72;

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>

            {/* 지도: 전체 화면 */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                <RouteMap
                    ref={mapRef}
                    routePoint={mapPoints}
                    globalPoints={globalPoints}
                    progressPercent={progressPercent}
                    theme={isLight ? "light" : "dark"}

                />
            </div>

            {/* ── 상단 헤더 ── */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
                height: HEADER_H,
                background: T.panelBg,
                backdropFilter: "blur(10px)",
                borderBottom: `1px solid ${T.border}`,
                display: "flex", alignItems: "center",
                padding: "0 20px",
                gap: 14,
                transition: "background 0.3s, border-color 0.3s",
            }}>
                {/* 뒤로가기 */}
                <button onClick={onBack} style={{
                    background: "none", border: "none", color: T.textMuted,
                    cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1, flexShrink: 0,
                }}>←</button>

                <span style={{ fontWeight: 800, fontSize: 17, color: T.textPrimary, letterSpacing: 1, flexShrink: 0 }}>HTNS</span>

                <div style={{ width: 1, height: 28, background: T.divider, flexShrink: 0 }} />

                {/* 레퍼런스 번호 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    {/* REF: 첫 줄 단독 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, whiteSpace: "nowrap" }}>
                        <span style={{ color: T.textSub, fontWeight: 600, width: 34, flexShrink: 0 }}>REF</span>
                        <span style={{ color: T.textPrimary, fontWeight: 700 }}>{header.trackingNo}</span>
                    </div>
                    {/* MBL / HBL: 두 번째 줄 나란히 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, whiteSpace: "nowrap" }}>
                        {shipment.mblNo && (
                            <div style={{ display: "flex", gap: 8 }}>
                                <span style={{ color: T.textSub, fontWeight: 600, width: 28, flexShrink: 0 }}>MBL</span>
                                <span style={{ color: T.textMuted }}>{shipment.mblNo}</span>
                            </div>
                        )}
                        {shipment.hblNo && (
                            <div style={{ display: "flex", gap: 8 }}>
                                <span style={{ color: T.textSub, fontWeight: 600, width: 28, flexShrink: 0 }}>HBL</span>
                                <span style={{ color: T.textMuted }}>{shipment.hblNo}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽 정보 */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 32, flexShrink: 0 }}>
                    {!isMobile && (
                        <>
                            <div>
                                <div style={{ fontSize: 11, color: T.textSub, marginBottom: 3 }}>Carrier</div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>
                                    {shipment.carrier || "-"}
                                </div>
                            </div>
                            {shipment.voyageNo && (
                                <div>
                                    <div style={{ fontSize: 11, color: T.textSub, marginBottom: 3 }}>Voyage</div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>
                                        {shipment.voyageNo}
                                    </div>
                                </div>
                            )}
                            {shipment.flntNo && (
                                <div>
                                    <div style={{ fontSize: 11, color: T.textSub, marginBottom: 3 }}>Flight</div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: T.textPrimary }}>
                                        {shipment.flntNo}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: 11, color: T.textSub, marginBottom: 3 }}>Origin</div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: T.textPrimary }}>
                                    <span style={{ color: T.textMuted, fontWeight: 500 }}>[{header.departPortCode}]</span>
                                    {header.departPortName ? ` ${header.departPortName}` : ""}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: T.textSub, marginBottom: 3 }}>Destination</div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: T.textPrimary }}>
                                    <span style={{ color: T.textMuted, fontWeight: 500 }}>[{header.arrivalPortCode}]</span>
                                    {header.arrivalPortName ? ` ${header.arrivalPortName}` : ""}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── 좌측 타임라인 패널 (데스크톱) ── */}
            {!isMobile && (
                <>
                    <div style={{
                        position: "absolute",
                        top: HEADER_H,
                        bottom: 0,
                        left: isCollapsed ? -360 : 0,
                        width: 360,
                        zIndex: 20,
                        background: T.panelBg,
                        backdropFilter: "blur(10px)",
                        borderRight: `1px solid ${T.border}`,
                        overflowY: "auto",
                        transition: "left 0.3s ease, background 0.3s",
                    }}>
                        <TrackingSummary header={header} steps={steps} flntNo={shipment.flntNo} onStepClick={handleStepClick} isLight={isLight} />
                    </div>

                    {/* 접기/펼치기 버튼 */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: isCollapsed ? 0 : 360,
                            transform: "translateY(-50%)",
                            zIndex: 25,
                            width: 20, height: 60,
                            borderRadius: "0 6px 6px 0",
                            border: `1px solid ${T.border}`,
                            borderLeft: "none",
                            background: T.panelBg,
                            color: T.textMuted,
                            cursor: "pointer",
                            fontSize: 16,
                            transition: "left 0.3s ease, background 0.3s",
                        }}
                    >
                        {isCollapsed ? "›" : "‹"}
                    </button>
                </>
            )}

            {/* ── 모바일: 하단 슬라이드 패널 ── */}
            {isMobile && (
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        zIndex: 20,
                        background: "rgba(10,15,30,0.95)",
                        borderRadius: "16px 16px 0 0",
                        transform: isCollapsed
                            ? `translateY(calc(100% - 56px))`
                            : isDragging ? `translateY(${dragOffset}px)` : "translateY(0)",
                        transition: isDragging ? "none" : "transform 0.3s ease",
                        maxHeight: "70vh",
                        display: "flex", flexDirection: "column",
                    }}
                >
                    <div style={{ padding: "12px 0 8px", display: "flex", justifyContent: "center" }}>
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#334155" }} />
                    </div>
                    <div style={{ overflowY: "auto", flex: 1, padding: "0 0 24px" }}>
                        <TrackingSummary header={header} steps={steps} flntNo={shipment.flntNo} onStepClick={handleStepClick} />
                    </div>
                </div>
            )}

            {/* ── 라이트/다크 토글 버튼 ── */}
            {!isMobile && (
                <button
                    onClick={() => setIsLight(!isLight)}
                    title={isLight ? "다크 모드" : "라이트 모드"}
                    style={{
                        position: "absolute",
                        // 확대/축소(bottom 56, 높이 65) 위로 8px 간격 → globals.css 의 컨트롤 스택과 맞춤
                        bottom: 129,
                        right: 16,
                        zIndex: 30,
                        width: 32, height: 32,
                        borderRadius: 4,
                        border: `1px solid ${T.border}`,
                        background: T.panelBg,
                        color: T.textPrimary,
                        cursor: "pointer",
                        fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(10px)",
                        transition: "background 0.3s",
                    }}
                >
                    {isLight ? "🌙" : "☀️"}
                </button>
            )}

            {/* ── 하단 플로팅 카드: 프로그레스 바 ── */}
            {!isMobile && (
                <div style={{
                    position: "absolute", bottom: 24,
                    left: "50%", transform: "translateX(-50%)",
                    zIndex: 30,
                    background: T.panelBg,
                    backdropFilter: "blur(16px)",
                    borderRadius: 20,
                    border: `1px solid ${T.border}`,
                    padding: "14px 32px 12px",
                    boxShadow: isLight ? "0 8px 32px rgba(0,0,0,0.12)" : "0 8px 32px rgba(0,0,0,0.4)",
                    width: 760,
                    transition: "background 0.3s",
                }}>
                    {/* 상단: 출발지 / transit days / 도착지 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 2 }}>Origin</div>
                            <div style={{ fontWeight: 700, color: T.textPrimary, fontSize: 14 }}>
                                <span style={{ color: T.textMuted, fontWeight: 500 }}>[{header.departPortCode}]</span>
                                {header.departPortName ? ` ${header.departPortName}` : ""}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                                {header.etdDate && <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:isLight?"#dbeafe":"#bfdbfe", color:"#1d4ed8", fontSize:8, fontWeight:700 }}>E</span>
                                    <span style={{ fontSize:11, color:T.textMuted }}>{fmtMD(header.etdDate)}</span>
                                </div>}
                                {shipment.atd && <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:"#1d4ed8", color:"#bfdbfe", fontSize:8, fontWeight:700 }}>A</span>
                                    <span style={{ fontSize:11, color:T.textMuted, fontWeight:600 }}>{fmtMD(shipment.atd)}</span>
                                </div>}
                            </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: 20, color: T.textPrimary, lineHeight: 1 }}>{transitDays ?? "-"} DAYS</div>
                            <div style={{ fontSize: 11, color: T.textSub, marginTop: 2 }}>TOTAL TRANSIT</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, marginBottom: 2 }}>Destination</div>
                            <div style={{ fontWeight: 700, color: T.textPrimary, fontSize: 14 }}>
                                <span style={{ color: T.textMuted, fontWeight: 500 }}>[{header.arrivalPortCode}]</span>
                                {header.arrivalPortName ? ` ${header.arrivalPortName}` : ""}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 3, justifyContent: "flex-end" }}>
                                {header.etaDate && <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:isLight?"#dbeafe":"#bfdbfe", color:"#1d4ed8", fontSize:8, fontWeight:700 }}>E</span>
                                    <span style={{ fontSize:11, color:T.textMuted }}>{fmtMD(header.etaDate)}</span>
                                </div>}
                                {shipment.ata && <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:14, height:14, borderRadius:"50%", background:"#1d4ed8", color:"#bfdbfe", fontSize:8, fontWeight:700 }}>A</span>
                                    <span style={{ fontSize:11, color:T.textMuted, fontWeight:600 }}>{fmtMD(shipment.ata)}</span>
                                </div>}
                            </div>
                        </div>
                    </div>

                    {/* 프로그레스 바 - 시간 범위 비례 */}
                    <div style={{ display: "flex", gap: 3, height: 8, borderRadius: 6, overflow: "hidden" }}>
                        {/* Origin */}
                        <div style={{ flex: originFlex, minWidth: 24, background: isLight ? "#e2e8f0" : "#1e293b", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${originPct}%`, background: "#22c55e", borderRadius: 6, transition: "width 0.8s ease" }} />
                        </div>
                        {/* International */}
                        <div style={{ flex: intlFlex, minWidth: 24, background: isLight ? "#e2e8f0" : "#1e293b", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: originPct >= 100 ? `${intlPct}%` : "0%", background: "#3b82f6", borderRadius: 6, transition: "width 0.8s ease" }} />
                        </div>
                        {/* Destination */}
                        <div style={{ flex: destFlex, minWidth: 24, background: isLight ? "#e2e8f0" : "#1e293b", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${destPct}%`, background: "#22c55e", borderRadius: 6, transition: "width 0.8s ease" }} />
                        </div>
                    </div>

                    {/* 라벨 행 */}
                    <div style={{ display: "flex", marginTop: 6 }}>
                        <div style={{ flex: originFlex, minWidth: 24, fontSize: 11 }}>
                            <span style={{ color: T.textMuted }}>{originPct >= 100 ? "COMPLETED" : `${originDone}/${originValid.length}`}</span>
                        </div>
                        <div style={{ flex: intlFlex, minWidth: 24, textAlign: "center", fontSize: 11 }}>
                            <span style={{ fontWeight: 700, color: currentPhase === "international" ? "#3b82f6" : T.textMuted }}>INTERNATIONAL</span>
                            {currentPhase === "international" && intlDaysPassed !== null && (
                                <span style={{ color: T.textMuted, marginLeft: 4 }}>DAY {intlDaysPassed} OF {transitDays ?? "-"}</span>
                            )}
                        </div>
                        <div style={{ flex: destFlex, minWidth: 24, textAlign: "right", fontSize: 11 }}>
                            <span style={{ color: T.textMuted }}>{destPct >= 100 ? "COMPLETED" : destDone > 0 ? `${destDone}/${destValid.length}` : "PENDING"}</span>
                        </div>
                    </div>

                </div>
            )}

            <style jsx global>{`
                @media (max-width: 768px) {
                    .ol-zoom {
                        bottom: 80px !important;
                        right: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
