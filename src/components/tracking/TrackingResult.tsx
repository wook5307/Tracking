"use client";

import { ShipMent, mapTrackingData, TrackingStep } from "@/types/trackingMapper";
import { useEffect, useRef, useState } from "react";
import TrackingSummary from "./TrackingSummary";
import RouteMap, { RouteMapHandle } from "./RouteMap";  // ✅ RouteMapHandle 추가

interface TrackingResultProps {
    shipment: ShipMent;
    onBack: () => void;
    onSearch: (trackingNo: string) => void;
}

export default function TrackingResult({ shipment, onBack, onSearch }: TrackingResultProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { header, steps, mapPoints, progressPercent } = mapTrackingData(shipment);
    const mapRef = useRef<RouteMapHandle>(null);  // ✅ ref 생성
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // ✅ 클릭 핸들러 (좌표 없는 체크포인트는 포커스 이동 안 함)
    const handleStepClick = (step: TrackingStep, index: number) => {
        const point = mapPoints[index];
        if (point && !(point.lat === 0 && point.lng === 0) && mapRef.current) {
            mapRef.current.focusOnPoint(point.lat, point.lng);
        }
    };

    // 마지막으로 좌표가 있는 단계 기준 초기 포커스
    useEffect(() => {
        const lastValidPoint = [...mapPoints].reverse().find(
            (p) => !(p.lat === 0 && p.lng === 0)
        );
        if (lastValidPoint && mapRef.current) {
            mapRef.current.focusOnPoint(lastValidPoint.lat, lastValidPoint.lng);
        }
    }, [shipment]);

    // ✅ 터치 드래그 관련 상태
    const [touchStart, setTouchStart] = useState(0);
    const [touchCurrent, setTouchCurrent] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    type GlobalPoint = {
        lat: number;
        lng: number;
        label: string;
        iconType: string;
    };

    type LocationRow = {
        id: number;
        name: string;
        lat: number;
        lng: number;
        type: "AIRPORT" | "PORT" | "OFFICE";
    };

    const [globalPoints, setGlobalPoints] = useState<GlobalPoint[]>([]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 420);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        fetch("/api/locations")
            .then(res => res.json())
            .then((rows: LocationRow[]) => {
                setGlobalPoints(
                    rows.map(l => ({
                        lat: l.lat,
                        lng: l.lng,
                        label: l.name,
                        iconType: l.type,
                    }))
                );
            })
            .catch(err => console.error("locations load error", err));
    }, []);

    // ✅ 터치 이벤트 핸들러
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

        // 50px 이상 드래그 시 상태 변경
        if (diff > 50) {
            // 아래로 드래그 → 접기
            setIsCollapsed(true);
        } else if (diff < -50) {
            // 위로 드래그 → 펼치기
            setIsCollapsed(false);
        }

        setIsDragging(false);
        setTouchStart(0);
        setTouchCurrent(0);
    };

    // ✅ 드래그 중 실시간 위치 계산
    const getDragOffset = () => {
        if (!isDragging || !isMobile) return 0;
        const diff = touchCurrent - touchStart;

        if (isCollapsed) {
            // 접힌 상태에서는 위로만 드래그 가능
            return Math.min(0, diff);
        } else {
            // 펼쳐진 상태에서는 아래로만 드래그 가능
            return Math.max(0, diff);
        }
    };

    const dragOffset = getDragOffset();

    return (
        <div
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                background: "#f4f6fb",
            }}
        >
            {/* 1) 지도: 전체 화면 배경 */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                <RouteMap
                    ref={mapRef}  // ✅ ref 연결
                    routePoint={mapPoints}
                    globalPoints={globalPoints}
                    progressPercent={progressPercent}
                />
            </div>

            {/* 2) TrackingSummary: 지도 위 팝업 패널 */}
            <div
                onTouchStart={isMobile ? handleTouchStart : undefined}
                onTouchMove={isMobile ? handleTouchMove : undefined}
                onTouchEnd={isMobile ? handleTouchEnd : undefined}
                style={{
                    position: "absolute",
                    top: isMobile ? "auto" : 80,
                    bottom: isMobile ? 0 : 16,
                    left: isMobile ? 0 : 0,
                    transform: isMobile
                        ? `translateY(${isCollapsed ? "calc(100% - 120px)" : "0px"})`
                        : `translateX(${isCollapsed ? "-100%" : "0px"})`,
                    width: isMobile ? "100%" : 350,
                    height: isMobile ? "80vh" : "auto",
                    zIndex: 10,
                    background: "rgba(255,255,255,0.96)",
                    borderRadius: isMobile ? "16px 16px 0 0" : "12px 12px 12px 0",
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    // ✅ 드래그 중 추가 offset 적용
                    ...(isDragging && isMobile && {
                        transform: `translateY(${isCollapsed ? `calc(100% - 120px + ${dragOffset}px)` : `${dragOffset}px`})`,
                    }),
                }}
            >
                {/* ✅ 드래그 핸들 (상단 바) */}
                {isMobile && (
                    <div
                        style={{
                            width: "100%",
                            padding: "12px 0",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderBottom: "1px solid #e5e7eb",
                            cursor: "grab",
                            touchAction: "none",
                        }}
                    >
                        <div
                            style={{
                                width: "40px",
                                height: "4px",
                                borderRadius: "2px",
                                background: "#d1d5db",
                            }}
                        />
                    </div>
                )}

                <div style={{ flex: 1, overflow: "auto" }}>
                    <TrackingSummary header={header} steps={steps} flntNo={shipment.flntNo} onStepClick={handleStepClick}  // ✅ 전달
                    />
                </div>
            </div>

            {/* ✅ 데스크톱: 사이드 버튼 */}
            {!isMobile && (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: isCollapsed ? 0 : 350,
                        transform: "translateY(-50%)",
                        zIndex: 20,
                        width: 20,
                        height: 80,
                        borderRadius: "0 8px 8px 0",
                        border: "none",
                        background: "rgba(255,255,255,0.96)",
                        boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        color: "#333",
                        transition: "left 0.3s ease-in-out",
                    }}
                >
                    {isCollapsed ? "›" : "‹"}
                </button>
            )}

            {/* 4) HOME 버튼 */}
            <button
                onClick={onBack}
                style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 60,
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                }}
            >
                HOME
            </button>

            {/* ✅ 지도 줌 버튼 위치 조정 CSS */}
            <style jsx global>{`
                @media (max-width: 420px) {
                    .ol-zoom {
                        bottom: 140px !important;
                        right: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}