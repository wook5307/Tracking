/* ============================
   API / DB 모델
============================ */
export interface ShipMent {
    trackingNo: string;
    companyName: string;
    consigneeName: string;
    shipperName: string;
    notifyName: string;
    carrier: string;
    transType: string;
    transStatus: string;
    departPortCode: string;
    arrivalPortCode: string;
    etdDate: string;
    etaDate: string;
    atd: string;
    ata: string;
    lastEventTime: string;
    eventStatus: string;
    progressPct: string;
    remarks: string;
    status: string;
    checkpoints: Checkpoint[];
}

export interface Checkpoint {
    seq: number;
    type: "DEPART" | "TRANSIT" | "ARRIVAL";
    eventTime: string | null;        // ✅ null 허용
    eventCode: string | null;        // ✅ null 허용
    eventText: string | null;        // ✅ null 허용
    locationName: string | null;     // ✅ null 허용
    lat: number | null;
    lng: number | null;
    transportMode: string | null;    // ✅ null 허용
    carrierName?: string;
    flightNo?: string;
    voyageNo?: string;
}

/* ============================
   UI 모델
============================ */
export interface TrackingHeader {
    trackingNo: string;
    departPortCode: string;
    arrivalPortCode: string;
    carrier: string;
    lastEventTime: string;
    status: "IN_TRANSIT" | "ARRIVED";
    etaDate: string;
    etdDate: string;
}

export interface TrackingStep {
    title: string;
    location: string;
    datetime: string;
    mode: string;
    status: "COMPLETED" | "CURRENT" | null;
    role: "START" | "WAYPOINT" | "END";
}

export interface MapPoint {
    lat: number;
    lng: number;
    label: string;
    eventCode: string;
    mode: string;
    role: "START" | "WAYPOINT" | "END";
    status: "COMPLETED" | "CURRENT" | null;
    index: number;
}

function mapEventCodeToRole(eventCode: string): "START" | "WAYPOINT" | "END" {
    if (eventCode === "DEP" || eventCode === "DEPARTURE") return "START";
    if (eventCode === "ARR" || eventCode === "ARRIVAL") return "END";
    return "WAYPOINT";
}

//현재 위치 계산 로직
function calcCurrentIndexByCheckpoints(
    checkpoints: Checkpoint[],
    now = Date.now()
): number {
    for (let i = 0; i < checkpoints.length; i++) {
        // ✅ null 체크 추가
        if (!checkpoints[i].eventTime) continue;

        const cpTime = new Date(checkpoints[i].eventTime!).getTime();

        if (now < cpTime) {
            return i;
        }
    }

    return checkpoints.length - 1;
}

/* ============================
   변환 함수
============================ */
export function mapTrackingData(data: ShipMent) {
    /* Header */
    const header: TrackingHeader = {
        trackingNo: data.trackingNo,
        departPortCode: data.departPortCode,
        arrivalPortCode: data.arrivalPortCode,
        carrier: data.carrier,
        lastEventTime: data.lastEventTime,
        etaDate: data.etaDate,
        etdDate: data.etdDate,
        status: data.checkpoints.some(c => c.type === "ARRIVAL")
            ? "ARRIVED"
            : "IN_TRANSIT",
    };

    /* ✅ 정렬 - 출발지 + 경유지 + 도착지 모두 */
    const sorted = [...data.checkpoints].sort((a, b) => {
        // seq로 정렬 (0: 출발, 1~N: 경유지, 999: 도착)
        return a.seq - b.seq;
    });

    const currentIndex = calcCurrentIndexByCheckpoints(sorted);

    const progressPercent =
        Date.now() <= new Date(data.etdDate).getTime()
            ? 0
            : Date.now() >= new Date(data.etaDate).getTime()
                ? 100
                : Math.floor(
                    ((Date.now() - new Date(data.etdDate).getTime()) /
                        (new Date(data.etaDate).getTime() -
                            new Date(data.etdDate).getTime())) *
                    100
                );

    /* ✅ Timeline - 출발지 + 경유지 + 도착지 모두 */
    const steps: TrackingStep[] = sorted.map((cp, idx) => ({
        title: cp.eventText || "이벤트 정보 없음",
        location: cp.locationName || "위치 미정",
        datetime: cp.eventTime
            ? cp.eventTime.replace("T", " ").slice(0, 16)
            : "날짜 미정",
        mode: cp.transportMode || "운송수단 미정",
        role: cp.type === "DEPART"
            ? "START"
            : cp.type === "ARRIVAL"
                ? "END"
                : "WAYPOINT",  // ✅ type 기반 role 설정
        status:
            idx < currentIndex
                ? "COMPLETED"
                : idx === currentIndex
                    ? "CURRENT"
                    : null
    }));

    /* ✅ Map - 출발지 + 경유지 + 도착지 모두 */
    const mapPoints: MapPoint[] = sorted.map((cp, idx) => ({
        lat: Number(cp.lat) || 0,
        lng: Number(cp.lng) || 0,
        label: cp.locationName || "위치 미정",
        eventCode: cp.eventCode || "N/A",
        mode: cp.transportMode || "UNKNOWN",
        role: cp.type === "DEPART"
            ? "START"
            : cp.type === "ARRIVAL"
                ? "END"
                : "WAYPOINT",  // ✅ type 기반 role 설정
        index: idx,
        status:
            idx < currentIndex
                ? "COMPLETED"
                : idx === currentIndex
                    ? "CURRENT"
                    : null,
    }));

    return {
        header,
        steps,
        mapPoints,
        currentIndex,
        progressPercent,
    };
}