"use client";

import { useRef, useState } from "react";
import { ShipMent } from "@/types/trackingMapper";
import TrackingResult from "@/components/tracking/TrackingResult";

export default function LandingPage() {
    const inputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [shipment, setShipment] = useState<ShipMent | null>(null);

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
        <div style={{ height: "100vh", position: "relative" }}>
            {/* ================= HERO VIDEO ================= */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                {/* 배경 영상 */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.65)",
                    }}
                >
                    <source src="/tracking-hero.mp4" type="video/mp4" />
                </video>

                {/* 어두운 오버레이 */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.65))",
                    }}
                />

                {/* ================= 중앙 콘텐츠 ================= */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 2,
                        padding: "0 16px",
                        transform: "translateY(-80px)", // ✅ 더 위로
                    }}
                >
                    {/* 로고 */}
                    <img
                        src="/htns.png"
                        style={{
                            width: "96px",
                            marginBottom: "12px",
                            opacity: 0.95,
                        }}
                    />

                    {/* 타이틀 */}
                    <div style={{ textAlign: "center", marginBottom: "18px" }}>
                        <div
                            style={{
                                color: "#fff",
                                fontSize: "13px",
                                fontWeight: 500,
                                letterSpacing: "0.1em",
                                opacity: 0.9,
                            }}
                        >
                            GLOBAL LOGISTICS
                        </div>
                    </div>

                    {/* 검색 영역 */}
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "720px",
                            display: "flex",
                            gap: "12px",
                            background: "rgba(255,255,255,0.95)",
                            padding: "10px",
                            borderRadius: "999px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                            marginBottom: "48px", // ✅ 카드와의 간격
                        }}
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
                                padding: "12px 16px",
                                background: "transparent",
                                color: "#111",
                            }}
                        />
                        <button
                            onClick={() => handleSearch()}
                            style={{
                                padding: "12px 28px",
                                borderRadius: "999px",
                                border: "none",
                                background: "#1976d2",
                                color: "#fff",
                                fontWeight: 600,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {loading ? "Loading" : "Search"}
                        </button>
                    </div>

                    {/* ================= 카드 섹션 ================= */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "24px",
                            width: "100%",
                            maxWidth: "900px",
                        }}
                    >
                        {/* Card 1 */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.95)",
                                borderRadius: "16px",
                                padding: "32px 24px",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                animation: "fadeInUp 0.6s ease 0.1s backwards",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                            }}
                        >
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
                            <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", color: "#111" }}>
                                Real-Time Tracking
                            </h3>
                            <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.6 }}>
                                Track your shipment anywhere, anytime
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.95)",
                                borderRadius: "16px",
                                padding: "32px 24px",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                animation: "fadeInUp 0.6s ease 0.3s backwards",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                            }}
                        >
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌍</div>
                            <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", color: "#111" }}>
                                Global Network
                            </h3>
                            <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.6 }}>
                                150+ countries worldwide
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div
                            style={{
                                background: "rgba(255,255,255,0.95)",
                                borderRadius: "16px",
                                padding: "32px 24px",
                                textAlign: "center",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                animation: "fadeInUp 0.6s ease 0.5s backwards",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                            }}
                        >
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                            <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", color: "#111" }}>
                                24/7 Support
                            </h3>
                            <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.6 }}>
                                Customer service always available
                            </p>
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div
                            style={{
                                marginTop: "24px",
                                color: "#ffdddd",
                                background: "rgba(0,0,0,0.55)",
                                padding: "8px 14px",
                                borderRadius: "8px",
                                fontSize: "12px",
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= CSS 애니메이션 ================= */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}