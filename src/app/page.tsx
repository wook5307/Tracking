"use client";

import { useRef, useState, useEffect } from "react";
import { ShipMent } from "@/types/trackingMapper";
import TrackingResult from "@/components/tracking/TrackingResult";

const FEATURE_SECTIONS = [
    {
        label: "FEATURE | 01",
        title: "Container Tracking",
        desc: "컨테이너 번호만으로 즉시 추적하세요.<br> 실시간 이벤트 모니터링으로 디머리지·디텐션 등 불필요한 비용을 예방할 수 있습니다.",
        image: "/start2_20260303.png",  // ← 이미지 경로
        imageLeft: false,  // 이미지가 오른쪽
        imgScale:"100%",
    },
    {
        label: "FEATURE | 02",
        title: "B/L Tracking",
        desc: "Master B/L 하나로 전체 운송 현황을 통합 관리하세요.\n" +
            "현재 위치, 전체 동선, 지연 여부를 실시간으로 확인하고\n" +
            "운송 리스크에 선제적으로 대응할 수 있습니다.",
        image: "/information2_20260303.png",  // ← 이미지 경로
        imageLeft: true,  // 이미지가 왼쪽
        imgScale:"50%",
    },
];
// ─── Sample data ────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: "🌐",
        title: "Global Coverage",
        desc: "Track shipments across 180+ countries with real-time updates from major carriers worldwide.",
    },
    {
        icon: "📦",
        title: "Multi-Mode Tracking",
        desc: "Sea freight, air cargo, and rail — one platform to track every mode of transport seamlessly.",
    },
    {
        icon: "🔔",
        title: "Instant Alerts",
        desc: "Get notified the moment your cargo clears customs, arrives at port, or faces any delay.",
    },
    {
        icon: "📊",
        title: "Analytics Dashboard",
        desc: "Visualize transit times, delay patterns, and carrier performance across your entire supply chain.",
    },
];

// const STATS = [
//     { value: "2.4M+", label: "Shipments Tracked" },
//     { value: "180+", label: "Countries Covered" },
//     { value: "99.8%", label: "Data Accuracy" },
//     { value: "< 30s", label: "Update Interval" },
// ];

// const HOW_IT_WORKS = [
//     {
//         step: "01",
//         title: "Enter Your Number",
//         desc: "Input your Container number, Master B/L, or House B/L into the search box.",
//     },
//     {
//         step: "02",
//         title: "We Query Carriers",
//         desc: "Our system instantly queries multiple shipping lines and freight databases simultaneously.",
//     },
//     {
//         step: "03",
//         title: "Get Live Status",
//         desc: "View complete voyage history, current position, ETA, and customs status in one place.",
//     },
// ];

// const CARRIERS = [
//     "MAERSK", "MSC", "CMA CGM", "COSCO", "EVERGREEN",
//     "HAPAG-LLOYD", "ONE", "YANG MING", "HMM", "PIL",
// ];

const SAMPLE_EVENTS = [
    { date: "2025-05-10 14:32", location: "Busan, KR", event: "Vessel Departed", status: "done" },
    { date: "2025-05-14 08:15", location: "Singapore, SG", event: "Transshipment – Arrived", status: "done" },
    { date: "2025-05-15 22:40", location: "Singapore, SG", event: "Transshipment – Departed", status: "done" },
    { date: "2025-05-22 11:00", location: "Rotterdam, NL", event: "ETA – Arrival at POD", status: "upcoming" },
    { date: "2025-05-23 09:00", location: "Rotterdam, NL", event: "Customs Clearance", status: "upcoming" },
];

// ─── Component ─────────────────────────────────────────────────────────
export default function LandingPage() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [shipment, setShipment] = useState<ShipMent | null>(null);

    // useScrollReveal(!shipment);

    // URL 파라미터 ?bl= 로 BL NO 전달 시 자동 검색
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const bl = params.get('bl');
        if (bl) handleSearch(bl);
    }, []);

    async function handleSearch(trackingNo?: string) {
        const value = trackingNo ?? inputRef.current?.value.trim();
        if (!value) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/tracking/${encodeURIComponent(value)}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Tracking number not found.");
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
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                body { font-family: 'Segoe UI', system-ui, sans-serif; background: #ffffff; color: #1a1a1a; }

                // /* ── Scroll reveal ── */
                // .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.65s ease, transform 0.65s ease; }
                // .reveal.revealed { opacity: 1; transform: translateY(0); }
                // .reveal-delay-1 { transition-delay: 0.1s; }
                // .reveal-delay-2 { transition-delay: 0.2s; }
                // .reveal-delay-3 { transition-delay: 0.3s; }
                // .reveal-delay-4 { transition-delay: 0.4s; }

                /* ── Hero ── */
                .hero {
                    min-height: 100vh;
                    background: #ffffff;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 80px 16px 60px;
                    position: relative;
                    overflow: hidden;
                }
                .hero::before {
                        display: none;
                }
                /* animated grid */
                .hero-grid {
                        display: none;
                }
                @keyframes gridShift { from { background-position: 0 0; } to { background-position: 60px 60px; } }

                .hero-logo { width: 100px; margin-bottom: 28px; filter: none; }

                .hero-subtitle {
                    font-size: 16px; color: #546e7a; text-align: center;
                    line-height: 1.7; margin-bottom: 16px;
                }
                .hero-title {
                    font-size: clamp(2rem, 5vw, 3.2rem);
                    font-weight: 800; text-align: center; line-height: 1.15;
                    color: #1a1a1a; margin-bottom: 20px;
                    text-shadow: none;
                }
                .hero-title span { color: #42a5f5; }
                .hero-desc {
                    font-size: 16px; color: #546e7a; text-align: center;
                    max-width: 560px; line-height: 1.7; margin-bottom: 44px;
                }

                /* ── Search box ── */
                .search-wrap {
                    width: 100%; max-width: 680px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(66,165,245,0.3);
                    border-radius: 16px; padding: 10px;
                    display: flex; gap: 8px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(66,165,245,0.1);
                }
                .search-input {
                    flex: 1; border: none; outline: none;
                    background: transparent; color: #1a1a1a;
                    font-size: 15px; padding: 14px 20px;
                    border-radius: 10px;
                }
                .search-input::placeholder { color: #546e7a; }
                .search-btn {
                    padding: 14px 32px; border-radius: 10px; border: none;
                    background: linear-gradient(135deg, #1976d2, #1565c0);
                    color: #fff; font-weight: 700; font-size: 15px;
                    cursor: pointer; white-space: nowrap;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 16px rgba(25,118,210,0.4);
                }
                .search-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #1e88e5, #1976d2);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(25,118,210,0.5);
                }
                .search-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .error-box {
                    margin-top: 20px; background: rgba(211,47,47,0.85);
                    color: #fff; padding: 12px 20px; border-radius: 10px;
                    font-size: 14px; max-width: 680px; text-align: center;
                }

                .hero-hint {
                    margin-top: 20px; font-size: 12px; color: #90a4ae;
                    letter-spacing: 0.05em;
                }
                .hero-hint span { color: #42a5f5; }

                /* ── Section base ── */
                section { padding: 96px 16px; }
                .section-inner { max-width: 1100px; margin: 0 auto; }
                .section-label {
                    font-size: 12px; letter-spacing: 0.3em; color: #42a5f5;
                    text-transform: uppercase; font-weight: 700; margin-bottom: 12px;
                }
                .section-title {
                    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
                    font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 16px;
                }
                .section-desc { font-size: 16px; color: #78909c; line-height: 1.7; max-width: 560px; }

                // /* ── Stats ── */
                // .stats-section { background: linear-gradient(180deg, #0a0f1e 0%, #0d1630 100%); }
                // .stats-grid {
                //     display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                //     gap: 2px; background: rgba(25,118,210,0.15);
                //     border: 1px solid rgba(25,118,210,0.2);
                //     border-radius: 20px; overflow: hidden;
                // }
                // .stat-item {
                //     background: rgba(10,15,30,0.9); padding: 48px 24px; text-align: center;
                //     transition: background 0.3s;
                // }
                // .stat-item:hover { background: rgba(25,118,210,0.08); }
                // .stat-value {
                //     font-size: clamp(2rem, 4vw, 2.8rem);
                //     font-weight: 900; color: #42a5f5;
                //     letter-spacing: -0.02em; margin-bottom: 8px;
                // }
                // .stat-label { font-size: 13px; color: #78909c; letter-spacing: 0.1em; text-transform: uppercase; }

                /* ── Features ── */
                .features-section { background: #0a0f1e; }
                .features-grid {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px; margin-top: 60px;
                }
                .feature-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px; padding: 36px 28px;
                    transition: all 0.3s ease;
                    position: relative; overflow: hidden;
                }
                .feature-card::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, #1976d2, #00bcd4);
                    transform: scaleX(0); transform-origin: left;
                    transition: transform 0.4s ease;
                }
                .feature-card:hover { border-color: rgba(66,165,245,0.3); transform: translateY(-4px); }
                .feature-card:hover::before { transform: scaleX(1); }
                .feature-icon { font-size: 36px; margin-bottom: 20px; }
                .feature-title { font-size: 17px; font-weight: 700; color: #e8eaf6; margin-bottom: 10px; }
                .feature-desc { font-size: 14px; color: #78909c; line-height: 1.7; }

                // /* ── How it works ── */
                // .how-section {
                //     background: linear-gradient(180deg, #0a0f1e 0%, #050810 100%);
                // }
                // .steps-grid {
                //     display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                //     gap: 0; margin-top: 60px; position: relative;
                // }
                // .steps-grid::before {
                //     content: ''; position: absolute; top: 40px; left: 0; right: 0; height: 1px;
                //     background: linear-gradient(90deg, transparent, rgba(25,118,210,0.4), transparent);
                // }
                // .step-item { padding: 0 32px; text-align: center; }
                // .step-number {
                //     font-size: 56px; font-weight: 900;
                //     color: transparent;
                //     -webkit-text-stroke: 1px rgba(66,165,245,0.3);
                //     margin-bottom: 24px; display: block;
                // }
                // .step-title { font-size: 18px; font-weight: 700; color: #e8eaf6; margin-bottom: 12px; }
                // .step-desc { font-size: 14px; color: #78909c; line-height: 1.7; }

                /* ── Sample tracking timeline ── */
                .timeline-section { background: #0a0f1e; }
                .timeline-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(66,165,245,0.15);
                    border-radius: 20px; padding: 40px;
                    max-width: 780px; margin: 60px auto 0;
                }
                .timeline-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 32px; flex-wrap: wrap; gap: 12px;
                }
                .timeline-no {
                    font-size: 12px; letter-spacing: 0.15em; color: #42a5f5;
                    font-weight: 700; text-transform: uppercase;
                }
                .timeline-vessel { font-size: 15px; color: #b0bec5; }
                .timeline-badge {
                    padding: 6px 14px; border-radius: 20px;
                    background: rgba(25,118,210,0.2); border: 1px solid rgba(25,118,210,0.4);
                    color: #42a5f5; font-size: 12px; font-weight: 600; letter-spacing: 0.05em;
                }
                .timeline-item { display: flex; gap: 20px; padding: 16px 0; position: relative; }
                .timeline-item:not(:last-child)::after {
                    content: ''; position: absolute; left: 6px; top: 32px;
                    width: 1px; height: calc(100% - 16px);
                    background: rgba(255,255,255,0.07);
                }
                .timeline-dot {
                    width: 13px; height: 13px; border-radius: 50%; flex-shrink: 0;
                    margin-top: 4px;
                }
                .timeline-dot.done { background: #42a5f5; box-shadow: 0 0 8px rgba(66,165,245,0.5); }
                .timeline-dot.upcoming { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); }
                .timeline-content { flex: 1; }
                .timeline-event { font-size: 15px; font-weight: 600; color: #e8eaf6; margin-bottom: 4px; }
                .timeline-meta { font-size: 12px; color: #546e7a; display: flex; gap: 16px; flex-wrap: wrap; }

                /* ── Carriers ── */
                .carriers-section { background: linear-gradient(180deg, #050810 0%, #0a0f1e 100%); }
                .carriers-scroll {
                    overflow: hidden; margin-top: 56px;
                    mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
                }
                .carriers-track {
                    display: flex; gap: 32px;
                    animation: marquee 20s linear infinite;
                    width: max-content;
                }
                @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                .carrier-chip {
                    padding: 16px 28px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px; white-space: nowrap;
                    font-size: 13px; font-weight: 700; color: #546e7a;
                    letter-spacing: 0.15em; transition: all 0.3s;
                }
                .carrier-chip:hover { color: #42a5f5; border-color: rgba(66,165,245,0.3); }

                /* ── Footer ── */
                .footer {
                    border-top: 1px solid rgba(255,255,255,0.06);
                    padding: 40px 16px; text-align: center;
                    font-size: 13px; color: #37474f;
                }

                /* ── Responsive ── */
                @media (max-width: 767px) {
                    .search-wrap { flex-direction: column; }
                    .search-btn { width: 100%; }
                    .steps-grid::before { display: none; }
                    .timeline-card { padding: 24px; }
                }
            `}</style>

            {/* ═══════════════ HERO ═══════════════ */}
            <section className="hero">
                <div className="hero-grid" />

                <img src="/htns.png" alt="HTNS Logo" className="hero-logo reveal" />

                <p className="hero-subtitle reveal reveal-delay-1">Global Logistics Tracking</p>
                <h1 className="hero-title reveal reveal-delay-2">
                    Track Every Shipment,<br /><span>Anywhere in the World</span>
                </h1>
                <p className="hero-desc reveal reveal-delay-3">
                    One search. All transport modes. Full visibility.
                </p>

                <div className="search-wrap reveal reveal-delay-4">
                    <input
                        ref={inputRef}
                        className="search-input"
                        placeholder="Enter Container / MBL / HBL Number"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <button
                        className="search-btn"
                        onClick={() => handleSearch()}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Search"}
                    </button>
                </div>

                {error && <div className="error-box">{error}</div>}

                {/*<p className="hero-hint reveal">*/}
                {/*    Try: <span>BKC2602020309</span>*/}
                {/*</p>*/}
            </section>

            {/*/!* ═══════════════ STATS ═══════════════ *!/*/}
            {/*<section className="stats-section">*/}
            {/*    <div className="section-inner">*/}
            {/*        <div className="stats-grid">*/}
            {/*            {STATS.map((s, i) => (*/}
            {/*                <div key={i} className={`stat-item reveal reveal-delay-${i + 1}`}>*/}
            {/*                    <div className="stat-value">{s.value}</div>*/}
            {/*                    <div className="stat-label">{s.label}</div>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}

            {/* ═══════════════ FEATURES ═══════════════ */}
            <section className="features-section">
                <div className="section-inner">
                    <div className="reveal">
                        <p className="section-label">Why HTNS Tracking</p>
                        <h2 className="section-title">Everything you need to<br />manage your cargo visibility</h2>
                        <p className="section-desc">
                            From port to door — get actionable insights at every step of the journey.
                        </p>
                    </div>
                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <div key={i} className={`feature-card reveal reveal-delay-${i + 1}`}>
                                <div className="feature-icon">{f.icon}</div>
                                <div className="feature-title">{f.title}</div>
                                <p className="feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════ FEATURE SECTIONS ═══════════════ */}
            <section style={{ background: "#fff", padding: "80px 16px" }}>
                <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "120px" }}>
                    {FEATURE_SECTIONS.map((f, i) => (
                        <div key={i} className="reveal" style={{
                            display: "flex",
                            flexDirection: f.imageLeft ? "row" : "row-reverse",
                            alignItems: "center",
                            gap: "60px",
                            flexWrap: "wrap",
                        }}>
                            {/* 이미지 */}
                            <div style={{ flex: "1 1 460px" }}>
                                <img
                                    src={f.image}
                                    alt={f.title}
                                    style={{
                                        width: f.imgScale,   // ← 여기
                                        display: "block",
                                        margin: "0 auto",    // ← 가운데 정렬
                                        borderRadius: "16px",
                                        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
                                        border: "1px solid #e8eaf6",
                                    }}
                                />
                            </div>
                            {/* 텍스트 */}
                            <div style={{ flex: "1 1 320px" }}>
                                <p style={{ fontSize: "12px", letterSpacing: "0.2em", color: "#1976d2", fontWeight: 700, marginBottom: "16px" }}>{f.label}</p>
                                <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, color: "#111", marginBottom: "20px" }}>{f.title}</h2>
                                <p style={{ fontSize: "16px", color: "#546e7a", lineHeight: 1.8, marginBottom: "32px" }}>{f.desc}</p>
                                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    <button style={{ padding: "12px 24px", borderRadius: "8px", border: "2px solid #1976d2", background: "transparent", color: "#1976d2", fontWeight: 700, cursor: "pointer" }}>Read more →</button>
                                    <button style={{ padding: "12px 24px", borderRadius: "8px", border: "2px solid #e0e0e0", background: "transparent", color: "#333", fontWeight: 700, cursor: "pointer" }}>Request a Demo</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/*/!* ═══════════════ HOW IT WORKS ═══════════════ *!/*/}
            {/*<section className="how-section">*/}
            {/*    <div className="section-inner">*/}
            {/*        <div className="reveal" style={{ textAlign: "center" }}>*/}
            {/*            <p className="section-label">How It Works</p>*/}
            {/*            <h2 className="section-title">Results in under 30 seconds</h2>*/}
            {/*        </div>*/}
            {/*        <div className="steps-grid">*/}
            {/*            {HOW_IT_WORKS.map((s, i) => (*/}
            {/*                <div key={i} className={`step-item reveal reveal-delay-${i + 1}`}>*/}
            {/*                    <span className="step-number">{s.step}</span>*/}
            {/*                    <div className="step-title">{s.title}</div>*/}
            {/*                    <p className="step-desc">{s.desc}</p>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}

            {/* ═══════════════ SAMPLE TIMELINE ═══════════════ */}
            <section className="timeline-section">
                <div className="section-inner">
                    <div className="reveal" style={{ textAlign: "center" }}>
                        <p className="section-label">Sample Result</p>
                        <h2 className="section-title">Complete voyage timeline</h2>
                        <p className="section-desc" style={{ margin: "0 auto" }}>
                            See exactly what you get — every port call, transshipment, and ETA update.
                        </p>
                    </div>
                    <div className="timeline-card reveal">
                        <div className="timeline-header">
                            <div>
                                <div className="timeline-no">CONTAINER · MSCU1234567</div>
                                <div className="timeline-vessel">MV EVER GIFTED · Voyage 025E</div>
                            </div>
                            <div className="timeline-badge">IN TRANSIT</div>
                        </div>
                        {SAMPLE_EVENTS.map((ev, i) => (
                            <div key={i} className="timeline-item">
                                <div className={`timeline-dot ${ev.status}`} />
                                <div className="timeline-content">
                                    <div className="timeline-event">{ev.event}</div>
                                    <div className="timeline-meta">
                                        <span>📍 {ev.location}</span>
                                        <span>🕐 {ev.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/*/!* ═══════════════ CARRIERS ═══════════════ *!/*/}
            {/*<section className="carriers-section">*/}
            {/*    <div className="section-inner">*/}
            {/*        <div className="reveal" style={{ textAlign: "center" }}>*/}
            {/*            <p className="section-label">Supported Carriers</p>*/}
            {/*            <h2 className="section-title">All major shipping lines, covered</h2>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*    <div className="carriers-scroll reveal">*/}
            {/*        <div className="carriers-track">*/}
            {/*            {[...CARRIERS, ...CARRIERS].map((c, i) => (*/}
            {/*                <div key={i} className="carrier-chip">{c}</div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</section>*/}

            {/* ═══════════════ FOOTER ═══════════════ */}
            <footer className="footer">
                © {new Date().getFullYear()} HTNS — Global Logistics Tracking Platform
            </footer>
        </>
    );
}