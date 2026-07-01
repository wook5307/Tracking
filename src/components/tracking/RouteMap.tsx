"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";  // ✅ import 추가
import { MapPoint } from "@/types/trackingMapper";
import { ClipLoader } from "react-spinners";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Cluster from "ol/source/Cluster";
import Overlay from "ol/Overlay";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import { fromLonLat } from "ol/proj";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Icon from "ol/style/Icon";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Text from "ol/style/Text";
import { FeatureLike } from "ol/Feature";

import { defaults as defaultControls, Zoom } from "ol/control";

/* ============================
   유틸: Great Circle (항공)
============================ */
function generateCurvedLine(a: MapPoint, b: MapPoint, steps = 100, curveFactor = 0.15) {
    const startLng = a.lng;
    let endLng = b.lng;

    // 날짜변경선 처리
    const lngDiff = endLng - startLng;
    if (lngDiff > 180) {
        endLng -= 360;
    } else if (lngDiff < -180) {
        endLng += 360;
    }

    const start = fromLonLat([startLng, a.lat]);
    const end = fromLonLat([endLng, b.lat]);

    const coords: number[][] = [];

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = start[0] * (1 - t) + end[0] * t;
        const y = start[1] * (1 - t) + end[1] * t;

        // 포물선 곡선 추가
        const curve = Math.sin(t * Math.PI) *
            Math.abs(end[0] - start[0]) * curveFactor;

        coords.push([x, y + curve]);
    }

    return coords;
}

/* ============================
   유틸: 직선 (해상 fallback)
============================ */
function generateStraight(a: MapPoint, b: MapPoint, steps = 100) {
    const startLng = a.lng;
    let endLng = b.lng;

    // 날짜변경선 처리
    const lngDiff = endLng - startLng;
    if (lngDiff > 180) {
        endLng -= 360;
    } else if (lngDiff < -180) {
        endLng += 360;
    }

    const A = fromLonLat([startLng, a.lat]);
    const B = fromLonLat([endLng, b.lat]);

    const arr: number[][] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        arr.push([A[0] * (1 - t) + B[0] * t, A[1] * (1 - t) + B[1] * t]);
    }
    return arr;
}

// 역할별 매핑
function getRoleIcon(role: "START" | "WAYPOINT" | "END",
                     index?:number) {
    switch (role) {
        case "START":
            return { src: "/markerD.png", scale: 0.5 };
        case "END":
            return { src: "/markerA.png", scale: 0.5 };
        case "WAYPOINT":
            return { src: `/waypoint-${index}.png`, scale: 0.04 };
        default:
            return { src: "/markerW2.png", scale: 1.0 };
    }
}

/* ============================
   유틸: OSRM (내륙 도로)
============================ */
async function fetchRoad(a: MapPoint, b: MapPoint) {
    const label = `${a.label} → ${b.label}`;

    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;

        console.group(`🚗 OSRM: ${label}`);
        console.log('URL:', url);
        console.log('좌표:', `[${a.lng}, ${a.lat}] → [${b.lng}, ${b.lat}]`);

        const res = await fetch(url);
        const json = await res.json();

        console.log('응답 코드:', json.code);

        if (json.code !== 'Ok') {
            console.warn('⚠️ OSRM 경고:', json.message || json.code);
        }

        if (!json.routes?.[0]) {
            throw new Error('No route found');
        }

        const coords = json.routes[0].geometry.coordinates;
        console.log(`✅ 좌표 개수: ${coords.length}`);

        if (coords.length <= 2) {
            console.warn('⚠️ 경로가 너무 짧음!');
            console.log('좌표:', coords);
        } else {
            console.log('첫 3개:', coords.slice(0, 3));
            console.log('마지막 3개:', coords.slice(-3));
        }

        console.groupEnd();

        return coords.map((c: number[]) => fromLonLat(c));
    } catch (error) {
        console.error(`❌ OSRM 실패: ${label}`, error);
        console.groupEnd();
        return generateStraight(a, b);
    }
}

/* ============================
   클러스터 스타일 함수 (타입 수정)
============================ */
// function createClusterStyle(feature: FeatureLike): Style {
//     const features = feature.get('features');
//     const size = features ? features.length : 0;
//
//     if (size === 1) {
//         // 단일 office: 기존 warehouse 아이콘 사용
//         return new Style({
//             image: new Circle({
//                 radius: 5, // 경유지 마커 크기
//                 fill: new Fill({
//                     color: '#9ca3af', // 파란색
//                 }),
//                 stroke: new Stroke({
//                     color: '#6b7280',
//                     width: 1.5,
//                 }),
//             }),
//         });
//     } else {
//         // 클러스터: 파란 원 + 숫자
//         return new Style({
//             image: new Circle({
//                 radius: Math.min(8 + size * 1, 18), // 최소 20px, 최대 40px
//                 fill: new Fill({
//                     color: '#9ca3af', // 파란색
//                 }),
//                 stroke: new Stroke({
//                     color: '#6b7280',
//                     width: 2,
//                 }),
//             }),
//             text: new Text({
//                 text: size.toString(),
//                 fill: new Fill({
//                     color: '#ffffff',
//                 }),
//                 font: 'bold 11px sans-serif',
//             }),
//         });
//     }
// }
function createClusterStyle(feature: FeatureLike): Style {
    // 단일이든 클러스터든 동일한 작은 원, 글씨 없음
    return new Style({
        image: new Circle({
            radius: 5,
            fill: new Fill({ color: '#9ca3af' }),
            stroke: new Stroke({ color: '#6b7280', width: 1.5 }),
        }),
    });
}
/* ============================
   RouteMap
============================ */
interface RouteMapProps {
    routePoint: MapPoint[];
    progressPercent: number;
    globalPoints?: {
        lat: number;
        lng: number;
        label: string;
        iconType: string;
    }[];
}

// ✅ 외부에서 사용할 메서드 타입
export interface RouteMapHandle {
    focusOnPoint: (lat: number, lng: number) => void;
}
const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(
    ({ routePoint, globalPoints, progressPercent }, ref) => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapObj = useRef<Map | null>(null);
    const routeSourceRef = useRef<VectorSource>(new VectorSource());
    const pointSourceRef = useRef<VectorSource>(new VectorSource());
    const currentSourceRef = useRef<VectorSource>(new VectorSource());
    const globalSourceRef = useRef<VectorSource>(new VectorSource()); // office용 원본 소스
    const airportPortSourceRef = useRef<VectorSource>(new VectorSource()); // airport/port용
    const [mapLoading, setMapLoading] = useState(true);
    const animationRef = useRef<number | null>(null);

        // ✅ 여기만 추가!
        useImperativeHandle(ref, () => ({
            focusOnPoint: (lat: number, lng: number) => {
                if (mapObj.current) {
                    const view = mapObj.current.getView();
                    view.animate({
                        center: fromLonLat([lng, lat]),
                        // zoom: 3,
                        duration: 1000,
                    });
                }
            },
        }));

    /* ============================
       1) Map 생성 (1회)
    ============================ */
    useEffect(() => {
        if (!mapRef.current || mapObj.current) return;

        // ✅ office 클러스터 소스 생성 (거리: 40px)
        const clusterSource = new Cluster({
            distance: 40,
            source: globalSourceRef.current,
        });

        const map = new Map({
            target: mapRef.current,
            controls: defaultControls({ zoom: false }).extend([
                new Zoom({ zoomInLabel: "+", zoomOutLabel: "−" }),
            ]),
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                    }),
                }),

                // ✅ office 클러스터 레이어 (zIndex: 90)
                new VectorLayer({
                    source: clusterSource,
                    style: createClusterStyle,
                    zIndex: 90,
                }),

                // airport/port 레이어 (zIndex: 100)
                new VectorLayer({ source: airportPortSourceRef.current, zIndex: 100 }),

                // 경로
                new VectorLayer({ source: routeSourceRef.current, zIndex: 50 }),

                // 출발/경유/도착 마커
                new VectorLayer({ source: pointSourceRef.current, zIndex: 200 }),

                // 현재 위치
                new VectorLayer({ source: currentSourceRef.current, zIndex: 300 }),
            ],
            view: new View({ center: [0, 0], zoom: 2 }),
        });

        // popup (1회)
        const popupEl = document.createElement("div");
        popupEl.style.cssText = `
      position: absolute;
      background: #1f2937;
      padding: 6px 12px;
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      pointer-events: none;
      white-space: nowrap;
      display: none;
      z-index: 20;
    `;
        map.getOverlayContainer().appendChild(popupEl);

        const popupOverlay = new Overlay({
            element: popupEl,
            positioning: "bottom-center",
            offset: [0, -10],
        });
        map.addOverlay(popupOverlay);

        // 데스크톱용 호버
        map.on("pointermove", (evt) => {
            const feature = map.forEachFeatureAtPixel(
                evt.pixel,
                (f) => {
                    // ✅ 클러스터 처리
                    const features = f.get('features');
                    if (features && features.length > 0) {
                        return f;
                    }
                    return f.get("selectable") === true ? f : null;
                },
                { hitTolerance: 20 }
            );

            popupEl.style.display = "none";
            if (!feature) return;

            // ✅ 클러스터면 "N개 office" 표시
            const features = feature.get('features');
            if (features && features.length > 1) {
                popupEl.innerText = `${features.length} office`;
                popupEl.style.display = "block";
                const coord = (feature.getGeometry() as Point).getCoordinates();
                popupOverlay.setPosition(coord);
                return;
            }

            // 단일 마커
            const name = features?.[0]?.get("name") || feature.get("name");
            if (name) {
                popupEl.innerText = name;
                popupEl.style.display = "block";
                const coord = (feature.getGeometry() as Point).getCoordinates();
                popupOverlay.setPosition(coord);
            }
        });

        // ✅ 모바일용 클릭 이벤트 추가
        map.on("click", (evt) => {
            const feature = map.forEachFeatureAtPixel(
                evt.pixel,
                (f) => {
                    const features = f.get('features');
                    if (features && features.length > 0) {
                        return f;
                    }
                    return f.get("selectable") === true ? f : null;
                },
                { hitTolerance: 20 }
            );

            if (!feature) {
                popupEl.style.display = "none";
                return;
            }

            const features = feature.get('features');
            if (features && features.length > 1) {
                popupEl.innerText = `${features.length} office`;
                popupEl.style.display = "block";
                const coord = (feature.getGeometry() as Point).getCoordinates();
                popupOverlay.setPosition(coord);

                setTimeout(() => {
                    popupEl.style.display = "none";
                }, 3000);
                return;
            }

            const name = features?.[0]?.get("name") || feature.get("name");
            if (name) {
                popupEl.innerText = name;
                popupEl.style.display = "block";
                const coord = (feature.getGeometry() as Point).getCoordinates();
                popupOverlay.setPosition(coord);

                setTimeout(() => {
                    popupEl.style.display = "none";
                }, 3000);
            }
        });

        mapObj.current = map;
    }, []);

    /* ============================
       2) globalPoints 갱신
    ============================ */
    useEffect(() => {
        const officeSource = globalSourceRef.current;
        const airportPortSource = airportPortSourceRef.current;

        officeSource.clear();
        airportPortSource.clear();

        if (!globalPoints || globalPoints.length === 0) return;

        // ✅ office vs airport/port 분리
        const officeFeatures: Feature[] = [];
        const airportPortFeatures: Feature[] = [];

        globalPoints.forEach((p) => {
            if (!["AIRPORT", "PORT", "OFFICE"].includes(p.iconType)) return;

            const f = new Feature({
                geometry: new Point(fromLonLat([p.lng, p.lat])),
            });

            f.set("name", p.label);
            f.set("iconType", p.iconType);
            f.set("selectable", true);

            if (p.iconType === "OFFICE") {
                // office는 클러스터링 소스에 추가
                officeFeatures.push(f);
            } else {
                // airport/port는 별도 레이어
                const src =
                    p.iconType === "AIRPORT" ? "/airport3.png" : "/port3.png";
                const scale = p.iconType === "AIRPORT" ? 0.12 : 0.1;

                f.setStyle(
                    new Style({
                        image: new Icon({
                            src,
                            scale,
                            opacity: 0.75,
                        }),
                    })
                );
                airportPortFeatures.push(f);
            }
        });

        officeSource.addFeatures(officeFeatures);
        airportPortSource.addFeatures(airportPortFeatures);
    }, [globalPoints]);

    /* ============================
       3) 경로/마커/현재위치 갱신 (loading 상태 관리 개선)
    ============================ */
    useEffect(() => {
        // ✅ 좌표 없는 체크포인트(API에서 lat/lng 미제공 → 0,0 "Null Island")는 지도에서 제외
        const validPoints = routePoint.filter((p) => !(p.lat === 0 && p.lng === 0));

        if (!mapObj.current || validPoints.length < 2) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMapLoading(true);

        const map = mapObj.current;
        const view = map.getView();

        const routeSource = routeSourceRef.current;
        const pointSource = pointSourceRef.current;
        const currentSource = currentSourceRef.current;

        routeSource.clear();
        pointSource.clear();
        currentSource.clear();

        // 이전 애니메이션 정리
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        const routePoints = [...validPoints];

        // 출발/경유/도착 마커
        const pointFeatures = routePoints.map((p) => {
            const { src, scale } = getRoleIcon(p.role, p.index);
            const f = new Feature({
                geometry: new Point(fromLonLat([p.lng, p.lat])),
            });
            f.set("selectable", true);
            f.set("name", p.label);
            f.setStyle(
                new Style({
                    image: new Icon({
                        src,
                        scale,
                        anchor: [0.5, 1],
                    }),
                })
            );
            return f;
        });
        pointSource.addFeatures(pointFeatures);

        // ✅ loading 상태를 effect 바깥에서 관리
        let isComponentMounted = true;

        (async () => {
            const segments: [MapPoint, MapPoint][] = [];
            for (let i = 0; i < routePoints.length - 1; i++) {
                segments.push([routePoints[i], routePoints[i + 1]]);
            }

            const results = await Promise.all(
                segments.map(([A, B]) => {
                    switch (A.mode) {
                        case "AIR":
                        case "AE":      // ✅ 추가
                        case "AI":      // ✅ 추가
                            return Promise.resolve(generateCurvedLine(A, B));

                        case "SEA":
                        case "OE":      // ✅ 추가
                        case "OI":      // ✅ 추가
                            return Promise.resolve(generateCurvedLine(A, B));

                        case "TRUCK":
                        case "LE":      // ✅ 추가
                        case "LI":      // ✅ 추가
                        case "RAIL":    // ✅ 추가
                        default:
                            return fetchRoad(A, B);
                    }
                })
            );

            if (!isComponentMounted) return;

            results.forEach((coords, idx) => {
                const destStatus = segments[idx][1].status;
                const isPending = destStatus === null;

                const baseLine = new Feature({ geometry: new LineString(coords) });
                baseLine.setStyle(
                    new Style({
                        stroke: new Stroke({
                            color: isPending ? "#cbd5e1" : "#111827",
                            width: 3,
                        }),
                    })
                );
                routeSource.addFeature(baseLine);

                const dashLine = new Feature({ geometry: new LineString(coords) });
                dashLine.setStyle(
                    new Style({
                        stroke: new Stroke({
                            color: isPending ? "#94a3b8" : "#2563eb",
                            width: 2,
                            lineDash: isPending ? [8, 8] : [6, 6],
                        }),
                    })
                );
                routeSource.addFeature(dashLine);
            });

            // 전체 경로가 화면에 보이도록 fit
            const extent = routeSource.getExtent();
            view.fit(extent, {
                padding: [80, 80, 80, 80],
                maxZoom: 8,
                duration: 700,
                callback: () => {
                    if (isComponentMounted) {
                        setMapLoading(false);
                    }
                },
            });

            const currentPoint = routePoints.find(p => p.status === "CURRENT");
            if (currentPoint && isComponentMounted) {
                const coord = fromLonLat([currentPoint.lng, currentPoint.lat]);

                const currentFeature = new Feature({
                    geometry: new Point(coord),
                });
                currentSource.addFeature(currentFeature);

                let startTime: number | null = null;
                const duration = 1500;
                const baseScale = 0.07;
                const maxScale = 0.09;

                const animate = (timestamp: number) => {
                    if (!isComponentMounted) return;

                    if (!startTime) startTime = timestamp;
                    const elapsed = (timestamp - startTime) % duration;
                    const progress = elapsed / duration;

                    const scale = baseScale + (maxScale - baseScale) * Math.sin(progress * Math.PI);

                    currentFeature.setStyle(
                        new Style({
                            image: new Icon({
                                src: "/box777.png",
                                scale: scale,
                                anchor: [0.5, 1],
                            }),
                            zIndex: 300,
                        })
                    );

                    animationRef.current = requestAnimationFrame(animate);
                };

                animationRef.current = requestAnimationFrame(animate);
            }
        })();

        // 클린업: 애니메이션 중지 및 마운트 상태 업데이트
        return () => {
            isComponentMounted = false;
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [routePoint]);

        return (
            <div
                style={{
                    background: "#fff",
                    borderRadius: 0,
                    padding: 0,
                    boxShadow: "none",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        borderRadius: "12px",
                        overflow: "hidden",
                        background: "#e5e7eb",
                        position: "relative",
                    }}
                >
                    {mapLoading && (
                        <div style={{ /* ... */ }}>
                            <ClipLoader size={42} color="#2563eb" speedMultiplier={1.1} />
                        </div>
                    )}

                    {/* ✅ HOME과 완전히 동일한 스타일 */}
                    <div style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "#000",         // ✅ 순수 검정
                        color: "#fff",              // ✅ 하얀 글씨
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: 13,
                        fontWeight: 600,
                        zIndex: 10,
                        cursor: "default",
                    }}>
                        Progress {progressPercent}%
                    </div>

                    <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
                </div>
            </div>
        );  // ✅ return 닫기
    }     // ✅ forwardRef의 화살표 함수 닫기
);      // ✅ forwardRef 호출 닫기

RouteMap.displayName = "RouteMap";
export default RouteMap;
