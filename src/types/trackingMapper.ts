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
    flntNo: string;
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
    timeAct: string | null;
    timeEst: string | null;
    eventCode: string | null;        // ✅ null 허용
    eventText: string | null;        // ✅ null 허용
    locationName: string | null;     // ✅ null 허용
    lat: number | null;
    lng: number | null;
    transportMode: string | null;    // ✅ null 허용
    status?: "COMPLETED" | "CURRENT" | null;
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
    tpTimeAct: string | null;
    tpTimeEst: string | null;
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

// //현재 위치 계산 로직 (시간 비교 방식 - 추후 사용 가능)
// function calcCurrentIndexByCheckpoints(
//     checkpoints: Checkpoint[],
//     now = Date.now()
// ): number {
//     for (let i = 0; i < checkpoints.length; i++) {
//         // ✅ null 체크 추가
//         if (!checkpoints[i].eventTime) continue;
//
//         const cpTime = new Date(checkpoints[i].eventTime!).getTime();
//
//         if (now < cpTime) {
//             return i;
//         }
//     }
//
//     return checkpoints.length - 1;
// }

/* ============================
   변환 함수
============================ */
export function mapTrackingData(data: ShipMent) {
    /* ✅ 정렬 - 출발지 + 경유지 + 도착지 모두 */
    const sorted = [...data.checkpoints].sort((a, b) => {
        // seq로 정렬 (0: 출발, 1~N: 경유지, 999: 도착)
        return a.seq - b.seq;
    });

    // const currentIndex = calcCurrentIndexByCheckpoints(sorted); // 시간 비교 방식 (주석 처리)

    // 마지막 COMPLETED index → CURRENT로 사용
    let lastCompletedIndex = -1;
    sorted.forEach((cp, idx) => {
        if (cp.status === "COMPLETED") lastCompletedIndex = idx;
    });

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
    // 1차: 실제 도착시간(timeAct) 기준으로 완료 여부 판단
    const isCompletedByOwnTime = sorted.map(
        (cp) => !!cp.timeAct && new Date(cp.timeAct).getTime() <= Date.now()
    );

    // 2차: 실제 시간(timeAct)이 있는 마지막 단계(예: STS Arrival)를 기준으로,
    // 그 시간이 현재 시점을 이미 지났으면 그 단계까지는 전부 완료로 간주 (중간 데이터 누락 보정)
    // ✅ timeEst(예상 시간)는 도착 확정 판단에 쓰지 않음 — 실제 도착 전 ARRIVED로 오판되는 것을 방지
    let lastTimeIdx = -1;
    for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].timeAct) {
            lastTimeIdx = i;
            break;
        }
    }
    const lastTimeValue = lastTimeIdx >= 0 ? sorted[lastTimeIdx].timeAct : null;
    const allDoneByLastStep =
        !!lastTimeValue && new Date(lastTimeValue).getTime() <= Date.now();

    /* Header - 마지막 단계(예: STS Arrival)가 실제로 끝났는지 기준으로 ARRIVED 판단 */
    const header: TrackingHeader = {
        trackingNo: data.trackingNo,
        departPortCode: data.departPortCode,
        arrivalPortCode: data.arrivalPortCode,
        carrier: data.carrier,
        lastEventTime: data.lastEventTime,
        etaDate: data.etaDate,
        etdDate: data.etdDate,
        status: allDoneByLastStep ? "ARRIVED" : "IN_TRANSIT",
    };

    const isCompleted = sorted.map((cp, idx) => {
        if (allDoneByLastStep && idx <= lastTimeIdx) return true;
        return isCompletedByOwnTime[idx];
    });

    let currentSet = false;
    const steps: TrackingStep[] = sorted.map((cp, idx) => {
        let status: "COMPLETED" | "CURRENT" | null;
        if (isCompleted[idx]) {
            status = "COMPLETED";
        } else if (!currentSet) {
            status = "CURRENT";
            currentSet = true;
        } else {
            status = null;
        }

        return {
            title: cp.eventText || "이벤트 정보 없음",
            location: cp.locationName || "위치 미정",
            tpTimeAct: cp.timeAct ?? null,
            tpTimeEst: cp.timeEst ?? null,
            mode: cp.transportMode || "운송수단 미정",
            role: cp.type === "DEPART"
                ? "START"
                : cp.type === "ARRIVAL"
                    ? "END"
                    : "WAYPOINT",  // ✅ type 기반 role 설정
            status,
        };
    });

    // ✅ API가 "Due Total Days" 체크포인트를 안 주는 화물도 항상 마지막에 표시
    if (steps.length >= 2 && steps[steps.length - 1].title !== "Due Total Days") {
        // 바로 앞 단계(예: STS Arrival)가 완료됐으면 Due Total Days도 같이 완료 처리
        const prevStep = steps[steps.length - 1];
        steps.push({
            title: "Due Total Days",
            location: "",
            tpTimeAct: null,
            tpTimeEst: null,
            mode: "",
            status: prevStep.status === "COMPLETED" ? "COMPLETED" : null,
            role: "WAYPOINT",
        });
    }

    /* ✅ Map - 출발지 + 경유지 + 도착지 모두 */
    let waypointCount = 0;
    const mapPoints: MapPoint[] = sorted.map((cp, idx) => {
        const role = cp.type === "DEPART"
            ? "START"
            : cp.type === "ARRIVAL"
                ? "END"
                : "WAYPOINT";
        const waypointIndex = role === "WAYPOINT" ? ++waypointCount : idx;
        return ({
        lat: Number(cp.lat) || 0,
        lng: Number(cp.lng) || 0,
        label: cp.locationName || "위치 미정",
        eventCode: cp.eventCode || "N/A",
        mode: cp.transportMode || "UNKNOWN",
        role,
        index: waypointIndex,
        status: idx === lastCompletedIndex ? "CURRENT" : (cp.status as "COMPLETED" | "CURRENT" | null) ?? null,
    })});

    return {
        header,
        steps,
        mapPoints,
        // currentIndex,
        progressPercent,
    };
}