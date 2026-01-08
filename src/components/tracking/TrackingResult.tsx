
"use client";

import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { fromLonLat } from "ol/proj";
import Point from "ol/geom/Point";
import Icon from "ol/style/Icon";
import Overlay from "ol/Overlay";
import { defaults as defaultControls, Zoom } from "ol/control";
import TrackingSummary from "@/components/tracking/TrackingSummary";
import TrackingNotice from "@/components/tracking/TrackingNotice";



/* ————————————————————
    타입 / 좌표정의 (iconType 기준으로 통합)
———————————————————— */
interface Coord {
    lat: number;
    lon: number;
    iconType: "airplane" | "port" | "office" | "factory" | "inland" | "ship" | "airport";
    label: string;
}

const LOC: Record<string, Coord> = {
    PUS: { lat: 35.1333, lon: 129.05, iconType: "port", label: "부산항" },
    ICN: { lat: 37.4602, lon: 126.4407, iconType: "airport", label: "인천공항" },
    CNPDG: { lat: 31.2333, lon: 121.5, iconType: "port", label: "칭다오 항구" },
    HKG: { lat: 22.308901, lon: 113.915001, iconType: "airport", label: "홍콩 공항" },
    WAW: { lat: 52.165699, lon: 20.9671, iconType: "airport", label: "폴란드 공항" },

    HKG_TINS: { lat: 22.3338522, lon: 114.1531783, iconType: "office", label: "HTNS 홍콩 지점" },
    GUANGZHOU: { lat: 23.137466, lon: 113.328876, iconType: "office", label: "HTNS 광저우 지점" },
    SHENZHEN: { lat: 22.543396, lon: 114.057865, iconType: "office", label: "HTNS 심천 지점" },
    CHONGQING: { lat: 29.589262, lon: 106.532844, iconType: "office", label: "HTNS 중경 지점" },
    XIAN: { lat: 34.203399, lon: 108.882057, iconType: "office", label: "HTNS 서안 지점" },
    SUZHOU: { lat: 31.317431, lon: 120.716301, iconType: "office", label: "HTNS 소주 지점" },
    SHANGHAI: { lat: 31.150961, lon: 121.403845, iconType: "office", label: "HTNS 상해 지점" },
    WEIHAI: { lat: 37.513068, lon: 122.127041, iconType: "office", label: "HTNS 위해 지점" },
    TIANJIN: { lat: 39.061809, lon: 117.147957, iconType: "office", label: "HTNS 천진 지점" },
    HOCHIMINH: { lat: 10.77556, lon: 106.70194, iconType: "office", label: "HTNS 호치민 지점" },
    BACNINH_YENPHONG: { lat: 21.195, lon: 106.03, iconType: "office", label: "HTNS 박닌 (옌퐁)" },
    HANOI: { lat: 21.028511, lon: 105.804817, iconType: "office", label: "HTNS 하노이 지점" },
    CHENNAI: { lat: 13.01012, lon: 80.22097, iconType: "office", label: "HTNS 첸나이 지점" },
    DELHI: { lat: 28.613939, lon: 77.209023, iconType: "office", label: "HTNS 델리 지점" },
    JAKARTA: { lat: -6.22453, lon: 106.82287, iconType: "office", label: "HTNS 인도네시아 지점" },
    DUBAI: { lat: 25.18516, lon: 55.272887, iconType: "office", label: "HTNS 두바이 지점" },
    THAILAND: { lat: 13.681099, lon: 100.747283, iconType: "office", label: "HTNS 태국 지점" },
    SINGAPORE_AIRFREIGHT: { lat: 1.35019, lon: 103.994003, iconType: "office", label: "HTNS 싱가포르 지점" },
    TAIPEI: { lat: 25.08306, lon: 121.56384, iconType: "office", label: "HTNS 타이완 지점" },
    TOKYO: { lat: 35.689487, lon: 139.691711, iconType: "office", label: "HTNS 일본 지점" },
    CZECH: { lat: 49.820923, lon: 18.262524, iconType: "office", label: "HTNS 체코 지점" },
    POLAND: { lat: 52.406376, lon: 16.925167, iconType: "office", label: "HTNS 폴란드 지점" },
    HUNGARY: { lat: 47.52, lon: 19.08, iconType: "office", label: "HTNS 헝가리 지점" },
    SLOVENIA: { lat: 45.548058, lon: 13.730187, iconType: "office", label: "HTNS 슬로베니아 지점" },
    SLOVAKIA: { lat: 48.19, lon: 17.73, iconType: "office", label: "HTNS 슬로바키아" },
    NETHERLANDS: { lat: 52.308613, lon: 4.763889, iconType: "office", label: "HTNS 네덜란드 지점" },
    GERMANY: { lat: 50.0174, lon: 8.784, iconType: "office", label: "HTNS 독일 지점" },
    AUSTRIA: { lat: 48.110278, lon: 16.569444, iconType: "office", label: "HTNS 오스트리아 지점" },
    AUSTIN: { lat: 30.427759, lon: -97.792137, iconType: "office", label: "HTNS 오스틴 지점" },
    DALLAS: { lat: 32.923984, lon: -96.905914, iconType: "office", label: "HTNS 달라스 지점" },
    ATLANTA: { lat: 33.963001, lon: -84.14962, iconType: "office", label: "HTNS 아틀란타 지점" },
    CHICAGO: { lat: 41.9786, lon: -87.9979, iconType: "office", label: "HTNS 시카고 지점" },
    SANDIEGO: { lat: 32.575447, lon: -117.086861, iconType: "office", label: "HTNS 샌디에이고 지점" },
    NEWYORK: { lat: 40.661205, lon: -73.791595, iconType: "office", label: "HTNS 뉴욕 지점" },
    LOSANGELES: { lat: 33.88155, lon: -118.28202, iconType: "office", label: "HTNS LA 지점" },
    HaiPhong:{lat: 20.841667, lon: 106.770278, iconType:"factory",label:"하이퐁 창고"},
    Hocimin:{lat: 10.800, lon: 106.600, iconType:"factory",label:"호치민 창고"},
    JWD:{lat: 13.690, lon: 100.750, iconType:"factory",label:"태국(JWD) 창고"},
    Chennai:{lat: 13.100, lon: 80.200, iconType:"factory",label:"첸나이 창고"},
};

/* -----------------------------------------
    임시 직선
----------------------------------------- */
function generateStraight(a: Coord, b: Coord, steps = 200) {
    const A = fromLonLat([a.lon, a.lat]);
    const B = fromLonLat([b.lon, b.lat]);

    const arr = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        arr.push([A[0] * (1 - t) + B[0] * t, A[1] * (1 - t) + B[1] * t]);
    }
    return arr;
}

/* -----------------------------------------
    GreatCircle 항공 경로
----------------------------------------- */
function generateGreatCircle(start: [number, number], end: [number, number], steps = 200) {
    const toRad = (d: number) => d * Math.PI / 180;

    const [lon1, lat1] = [toRad(start[0]), toRad(start[1])];
    const [lon2, lat2] = [toRad(end[0]), toRad(end[1])];

    const d = 2 * Math.asin(
        Math.sqrt(
            Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin((lon2 - lon1) / 2) ** 2
        )
    );

    const pts = [];
    for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);

        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);

        const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
        const lon = Math.atan2(y, x) * 180 / Math.PI;

        pts.push(fromLonLat([lon, lat]));
    }

    return pts;
}

/* -----------------------------------------
    아이콘 Hover Style
----------------------------------------- */
function getHoverStyle(src: string) {
    return new Style({
        image: new Icon({
            src,
            scale: 0.18,
            opacity: 1,
        }),
    });
}

/* -----------------------------------------
    육로 경로(OSRM)
----------------------------------------- */
async function safeFetchRoadOrFlight(start: Coord, end: Coord) {
    try {
        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${start.lon},${start.lat};${end.lon},${end.lat}` +
            `?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const json = await res.json();

        if (!json.routes || !json.routes[0]) return generateStraight(start, end);

        return json.routes[0].geometry.coordinates.map((c: number[]) => fromLonLat(c));
    } catch {
        return generateStraight(start, end);
    }
}

/* -----------------------------------------
    아이콘 매핑
----------------------------------------- */
function getIcon(iconType: Coord["iconType"]) {
    switch (iconType) {
        case "airport": return "/airport4.png";
        case "airplane": return "/airplane.png";
        case "port": return "/port5.png";
        case "office": return "/office5.png";
        case "factory": return "/house2.png";
        case "ship": return "/ship.png";
        default: return "/truck.png";
    }
}

/* -----------------------------------------
    선 색상 매핑
----------------------------------------- */
function getLineColor(a: Coord, b: Coord) {
    if (a.iconType === "airport" && b.iconType === "airport")
        return "#0C4D8F";
    if (a.iconType === "port" && b.iconType === "port")
        return "#1565C0";
    return "#2E7D32";
}

/* -----------------------------------------
    애니메이션
----------------------------------------- */
let currentAnim = { cancel: false };

function dynamicSpeed(coords: number[][]) {
    const n = coords.length;
    const speed = 0.00015 + n / 20000;
    return Math.min(0.004, Math.max(0.0001, speed));
}

function animateIcon(
    map: Map,
    coords: number[][],
    icon: string,
    speed: number,
    cancelObj: { cancel: boolean }
) {
    return new Promise<void>((resolve) => {
        const olds = map.getLayers().getArray().filter((l: any) => l.get("anim"));
        olds.forEach((l: any) => map.removeLayer(l));

        const f = new Feature({ geometry: new Point(coords[0]) });

        f.setStyle(
            new Style({
                image: new Icon({ src: icon, scale: 0.18, rotateWithView: true }),
            })
        );

        const layer = new VectorLayer({
            source: new VectorSource({ features: [f] }),
        });
        layer.set("anim", true);
        map.addLayer(layer);

        let progress = 0;

        function step() {
            if (cancelObj.cancel) return resolve();

            progress += speed;
            if (progress >= 1) progress = 1;

            const idx = Math.floor(progress * (coords.length - 1));
            f.getGeometry()?.setCoordinates(coords[idx]);
            map.render();

            if (progress < 1) requestAnimationFrame(step);
            else resolve();
        }

        step();
    });
}

/* -----------------------------------------
    메인 맵
----------------------------------------- */
export default function MapPage() {
    const mapRef = useRef(null);


    useEffect(() => {
        if (!mapRef.current) return;

        async function init() {
            /* ---------------------------
                지도 생성
            --------------------------- */
            const map = new Map({
                target: mapRef.current!,
                controls: defaultControls({ zoom: false }).extend([
                    new Zoom({
                        zoomInLabel: "+",
                        zoomOutLabel: "−",
                    }),
                ]),
                layers: [
                    new TileLayer({
                        source: new XYZ({
                            url: "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                        }),
                    }),
                ],
                view: new View({
                    center: fromLonLat([110, 30]),
                    zoom: 4,
                }),
            });


            /* ---------------------------
                팝업 Overlay 추가
            --------------------------- */
            const popup = document.getElementById("popup")!;
            const popupOverlay = new Overlay({
                element: popup,
                positioning: "bottom-center",
                offset: [0, -10],
            });
            map.addOverlay(popupOverlay);

            /* ---------------------------
                ROUTE 데이터
            --------------------------- */
            const ROUTE = ["WAW", "HKG", "CNPDG", "PUS"];

            const routeData: {
                feature: Feature;
                coords: number[][];
                icon: string;
                baseStyle: Style;
            }[] = [];

            /* ---------------------------
    ROUTE 지점 마커 추가
--------------------------- */
            const routeMarkers = ROUTE.map((code) => {
                const c = LOC[code];

                const f = new Feature({
                    geometry: new Point(fromLonLat([c.lon, c.lat])),
                    name: c.label,
                    iconType: c.iconType,
                });

                // ROUTE 마커는 조금 크게 표시하기
                f.setStyle(
                    new Style({
                        image: new Icon({
                            src: "/dot.png",
                            scale: 0.05,
                        }),
                    })
                );

                return f;
            });

            map.addLayer(
                new VectorLayer({
                    source: new VectorSource({ features: routeMarkers }),
                })
            );


            /* ---------------------------
                전체 LOC 마커
            --------------------------- */
            const allLocMarkers = Object.keys(LOC).map((code) => {
                const c = LOC[code];

                const baseStyle = new Style({
                    image: new Icon({
                        src: getIcon(c.iconType),
                        scale: 0.13,
                    }),
                });

                const f = new Feature({
                    geometry: new Point(fromLonLat([c.lon, c.lat])),
                    name: c.label,
                    iconType: c.iconType,
                });

                f.set("baseStyle", baseStyle);
                f.setStyle(baseStyle);

                return f;
            });

            const locLayer = new VectorLayer({
                source: new VectorSource({ features: allLocMarkers }),
            });
            map.addLayer(locLayer);

            /* ---------------------------
                경로선 생성
            --------------------------- */
            for (let i = 0; i < ROUTE.length - 1; i++) {
                const A = LOC[ROUTE[i]];
                const B = LOC[ROUTE[i + 1]];

                let initialCoords: number[][] = [];
                let icon = getIcon(A.iconType);

                if (A.iconType === "airport" && B.iconType === "airport") {
                    initialCoords = generateGreatCircle([A.lon, A.lat], [B.lon, B.lat]);
                    icon = "/airplane.png";
                } else if (A.iconType === "port" && B.iconType === "port") {
                    initialCoords = generateStraight(A, B);
                    icon = "/ship.png";
                } else {
                    initialCoords = generateStraight(A, B);
                    icon = "/truck.png";
                }

                const baseStyle = new Style({
                    stroke: new Stroke({
                        color: getLineColor(A, B),
                        width: 3,
                    }),
                });

                const line = new Feature({
                    geometry: new LineString(initialCoords),
                });

                line.setStyle(baseStyle);

                map.addLayer(
                    new VectorLayer({
                        source: new VectorSource({ features: [line] }),
                    })
                );

                routeData.push({
                    feature: line,
                    coords: initialCoords,
                    icon,
                    baseStyle,
                });

                if (
                    !(
                        A.iconType === "airport" &&
                        B.iconType === "airport"
                    ) &&
                    !(
                        A.iconType === "port" &&
                        B.iconType === "port"
                    )
                ) {
                    safeFetchRoadOrFlight(A, B).then((trueCoords) => {
                        line.setGeometry(new LineString(trueCoords));
                        routeData[i].coords = trueCoords;
                    });
                }
            }

            /* ---------------------------
                최초 애니메이션
            --------------------------- */
            currentAnim.cancel = false;

            for (const r of routeData) {
                const speed = dynamicSpeed(r.coords);
                await animateIcon(
                    map,
                    r.coords,
                    r.icon,
                    speed,
                    currentAnim
                );
                if (currentAnim.cancel) break;
            }

            /* ---------------------------
                Hover 기능
            --------------------------- */
            map.on("pointermove", (evt) => {
                const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f) as Feature | null;

                // 모든 스타일 원복
                routeData.forEach((r) => r.feature.setStyle(r.baseStyle));
                allLocMarkers.forEach((m) => {
                    const s = m.get("baseStyle");
                    if (s) m.setStyle(s);
                });

                // 팝업 숨김
                popup.style.display = "none";

                if (!feature) return;

                /* ---------------------------
                    경로 Hover
                --------------------------- */
                const found = routeData.find((r) => r.feature === feature);
                if (found) {
                    const oldStroke = found.baseStyle.getStroke();
                    found.feature.setStyle(
                        new Style({
                            stroke: new Stroke({
                                color: oldStroke?.getColor(),
                                width: 6,
                            }),
                        })
                    );
                    currentAnim.cancel = true;
                    currentAnim = { cancel: false };
                    animateIcon(
                        map,
                        found.coords,
                        found.icon,
                        dynamicSpeed(found.coords),
                        currentAnim
                    );
                    return;
                }

                /* ---------------------------
                    마커 Hover + 팝업 표시
                --------------------------- */
                if (feature.getGeometry() instanceof Point) {
                    const iconType = feature.get("iconType");
                    const hoverStyle = getHoverStyle(getIcon(iconType));
                    feature.setStyle(hoverStyle);

                    const label = feature.get("name") || "";
                    popup.innerText = label;
                    popup.style.display = "block";

                    const coord = (feature.getGeometry() as Point).getCoordinates();
                    popupOverlay.setPosition(coord);
                }
            });
        }

        init();
    }, []);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f4f6fb",
                boxSizing: "border-box",
            }}
        >
            {/* 영상 + 검색바 */}
            {/* ================= HERO VIDEO ================= */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "250px",
                    overflow: "hidden",
                    marginBottom: "32px",

                }}
            >
                {/* 배경 영상 */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "brightness(0.65)",
                    }}
                >
                    <source src="/tracking-hero.mp4" type="video/mp4" />
                </video>

                {/* 어두운 오버레이 (가독성) */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))",
                    }}
                />

                {/* 검색 영역 */}
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
                    }}
                >
                    <img
                        src="/htns.png"
                        alt="Tracking"
                        style={{
                            width: "56px",
                            marginBottom: "12px",
                            opacity: 0.9,
                        }}
                    />

                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                        {/* 메인 타이틀 */}
                        <div
                            style={{
                                color: "#fff",
                                fontSize: "28px",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                marginBottom: "6px",
                            }}
                        >
                            HANARO TNS
                        </div>

                        {/* 서브 타이틀 */}
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
                        }}
                    >
                        <input
                            placeholder="컨테이너 / MBL / HBL 입력"
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                fontSize: "16px",
                                padding: "12px 16px",
                                background: "transparent",
                            }}
                        />
                        <button
                            style={{
                                padding: "12px 28px",
                                borderRadius: "999px",
                                border: "none",
                                background: "#1976d2",
                                color: "#fff",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            검색
                        </button>
                    </div>
                </div>
            </div>


            {/* 메인 레이아웃 */}
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    display: "flex",
                    gap: "24px",
                }}
            >
                {/* ================= LEFT ================= */}
                <div style={{ flex: 4 }}>

                    <TrackingSummary />
                </div>

                {/* ================= RIGHT ================= */}
                <div style={{ flex: 6 }}>
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: "16px",
                            padding: "16px",
                            height: "600px", // 지도 비율
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: "12px", color:"#111" }}>
                            운송 경로 & ETA
                        </div>

                        {/* 지도 영역 */}
                        <div
                            style={{
                                flex: 1,
                                borderRadius: "12px",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            {/* 팝업 */}
                            <div
                                id="popup"
                                style={{
                                    position: "absolute",
                                    background: "#1f2937",        // 다크 배경
                                    backdropFilter: "blur(8px)",
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    color: "#fff",                // 흰 글씨
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    pointerEvents: "none",
                                    transform: "translate(-50%, -120%)",
                                    display: "none",
                                    whiteSpace: "nowrap",
                                    zIndex: 10,
                                }}
                            />

                            {/* map mount 위치 */}
                            <div
                                ref={mapRef}
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>

                        {/* 하단 통계 */}
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                marginTop: "12px",
                                color: "#111",
                            }}
                        >
                            {[
                                ["Planned Transit", "23 days"],
                                ["Forecast Transit", "23.8 days"],
                                ["Reliability", "87 / 100"],
                            ].map(([t, v]) => (
                                <div
                                    key={t}
                                    style={{
                                        flex: 1,
                                        background: "#f8fafc",
                                        borderRadius: "12px",
                                        padding: "10px",
                                        textAlign: "center",
                                    }}
                                >
                                    <div style={{ fontSize: "12px", color: "#666" }}>{t}</div>
                                    <div style={{ fontSize: "16px", fontWeight: 600 }}>{v}</div>
                                </div>
                            ))}
                        </div>
                        <TrackingNotice
                            items={[
                                {
                                    type: "WARN",
                                    message: "Hamburg T/S Port 혼잡으로 약 0.5일 지연 가능성",
                                },
                                {
                                    type: "RISK",
                                    message: "겨울철 북해 기상 영향으로 스케줄 변동 가능성",
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

}

