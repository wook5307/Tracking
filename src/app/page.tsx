"use client";

import { useRef, useState } from "react";
import { ShipMent } from "@/types/trackingMapper";
import TrackingResult from "@/components/tracking/TrackingResult";
import ol from "ol/dist/ol";

export default function LandingPage() {
    const inputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [shipment, setShipment] = useState<ShipMent | null>(null);
    const [videoEnded, setVideoEnded] = useState(false);

    async function handleSearch(trackingNo?: string) {
        const value = trackingNo ?? inputRef.current?.value.trim();
        if (!value) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/tracking/${encodeURIComponent(value)}`);

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("Tracking number not found.");
                }
                throw new Error("An error occurred while fetching the tracking information.");
            }

            const json: ShipMent = await res.json();
            setShipment(json);

        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown Error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    if (shipment) {
        return (
            <TrackingResult
                shipment={shipment}
                onBack={() => setShipment(null)}
                onSearch={handleSearch}
            />
        );
    }

    return (
        <div style={{ height: "100vh", position: "relative", overflow: "hidden" }}>

            {/* ================= 배경 비디오 (전체 화면) ================= */}
            <video
                autoPlay
                muted
                playsInline
                onEnded={() => setVideoEnded(true)}  // loop 제거 - 한 번만 재생
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 1,
                }}
            >
                <source src="/tracking_video_no_mobile.mp4" type="video/mp4" />
            </video>

            {/* ================= 비디오 종료 시 회색 오버레이 + 메시지 ================= */}
            {videoEnded && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(128, 128, 128, 0.5)",  // 회색 반투명
                        zIndex: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingTop: "20%",
                        animation: "fadeIn 0.5s ease-in",
                    }}
                >
                    {/* 위쪽 화살표 */}
                    <div
                        style={{
                            fontSize: "60px",
                            color: "#1976d2",
                            animation: "bounce 1s infinite, blink 1.5s infinite",
                            marginBottom: "20px",
                        }}
                    >
                        ↑
                    </div>

                    {/* 텍스트 */}
                    <div
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#fff",
                            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                            animation: "blink 1.5s infinite",
                        }}
                    >
                        ENTER CONTAINER / MBL / HBL NO
                    </div>
                </div>
            )}

            {/* ================= 어두운 오버레이 (가독성 향상) - 비디오 재생 중에만 ================= */}
            {!videoEnded && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.4)",
                        zIndex: 2,
                    }}
                />
            )}

            {/* ================= 콘텐츠 영역 (로고 + 검색창) ================= */}
            <div
                style={{
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",  // 상단 정렬
                    alignItems: "center",
                    zIndex: 3,
                    padding: "40px 16px",  // 상단 패딩
                }}
            >
                {/* 로고 */}
                <img
                    src="/htns.png"
                    alt="HTNS Logo"
                    style={{
                        width: "120px",
                        marginBottom: "24px",
                        opacity: 0.95,
                        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
                    }}
                />

                {/* 타이틀 */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div
                        style={{
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: 600,
                            letterSpacing: "0.15em",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        }}
                    >
                        GLOBAL LOGISTICS TRACKING
                    </div>
                </div>

                {/* 검색 영역 */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "720px",
                        display: "flex",
                        gap: "8px",
                        background: "rgba(255,255,255,0.95)",
                        padding: "8px",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                        backdropFilter: "blur(10px)",
                    }}
                    className="search-container"
                >
                    <input
                        ref={inputRef}
                        placeholder="Enter Container / MBL / HBL Number"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            fontSize: "16px",
                            padding: "14px 20px",
                            background: "transparent",
                            color: "#111",
                            borderRadius: "8px",
                        }}
                    />
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        style={{
                            padding: "14px 32px",
                            borderRadius: "8px",
                            border: "none",
                            background: loading ? "#90caf9" : "#1976d2",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                            transition: "background 0.3s ease",
                        }}
                    >
                        {loading ? "Loading..." : "Search"}
                    </button>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div
                        style={{
                            marginTop: "24px",
                            color: "#fff",
                            background: "rgba(244,67,54,0.9)",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            maxWidth: "720px",
                            textAlign: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                    >
                        {error}
                    </div>
                )}
            </div>

            {/* ================= 애니메이션 CSS ================= */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes blink {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.3;
                    }
                }

                /* 모바일 반응형 */
                @media (max-width: 767px) {
                    .search-container {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .search-container button {
                        width: 100%;
                    }
                }

                /* 버튼 호버 효과 */
                .search-container button:hover:not(:disabled) {
                    background: #1565c0;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(25,118,210,0.4);
                }

                .search-container button:active:not(:disabled) {
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
}