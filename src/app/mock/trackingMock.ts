// app/mock/trackingMock.ts

export type Mode = "AIR" | "SEA" | "TRUCK" | "RAIL" | "SYSTEM";
export type StepStatus = "COMPLETED" | "CURRENT" | null;
export type NoticeType = "WARN" | "RISK" | "INFO";

export interface TrackingHeader {
    statusText: string;          // IN TRANSIT (본선 항해중)
    containerNo: string;         // TGHU1234567
    isoType?: string;            // 40HC
    mbl?: string;                // (원하면 추가)
    polLabel: string;            // PLGDG (Gdańsk, Poland)
    podLabel: string;            // KRPUS (Busan, Korea)
    vesselName: string;          // MAERSK SOFIA
    serviceLaneCode: string;     // AE12 (항로/서비스 코드)
    etaKst: string;              // 2025-01-18 06:00 (KST)
}

export interface TrackingStep {
    title: string;
    location?: string;           // WAW → HKG
    datetime?: string;           // 2025-01-02 10:15
    mode: Mode;
    status: StepStatus;
}

export interface TrackingNoticeItem {
    type: NoticeType;
    message: string;
}

export interface RouteStop {
    code: string;                // WAW/HKG/CNPDG/PUS
    label: string;               // 폴란드 공항 등
    lat: number;
    lon: number;
    iconType: "airport" | "port" | "office" | "factory" | "inland" | "ship" | "airplane";
}

export interface TrackingKpi {
    plannedTransit: string;      // "23 days"
    forecastTransit: string;     // "23.8 days"
    reliability: string;         // "87 / 100"
}

export interface TrackingMockResponse {
    header: TrackingHeader;
    steps: TrackingStep[];
    route: {
        routeCodes: string[];      // ["WAW","HKG","CNPDG","PUS"]
        stops: RouteStop[];        // 지도 마커/팝업에 활용
    };
    kpi: TrackingKpi;
    notices: TrackingNoticeItem[];
}

/** 지금 화면(샘플) 기준 목업 */
export const trackingMock: TrackingMockResponse = {
    header: {
        statusText: "IN TRANSIT (본선 항해중)",
        containerNo: "TGHU1234567",
        isoType: "40HC",
        polLabel: "PLGDG (Gdańsk, Poland)",
        podLabel: "KRPUS (Busan, Korea)",
        vesselName: "MAERSK SOFIA",
        serviceLaneCode: "AE12",
        etaKst: "2025-01-18 06:00 (KST)",
    },

    steps: [
        {
            title: "폴란드 공항 → 홍콩 공항",
            location: "WAW → HKG",
            datetime: "2025-01-02 10:15",
            mode: "AIR",
            status: "COMPLETED",
        },
        {
            title: "홍콩 공항 → 칭다오 항구",
            location: "HKG → CNPDG",
            datetime: "2025-01-02 12:30",
            mode: "TRUCK",
            status: "COMPLETED",
        },
        {
            title: "칭다오 항구 → 부산항",
            location: "CNPDG → PUS",
            datetime: "2025-01-03 07:50",
            mode: "SEA",
            status: "CURRENT",
        },
    ],

    route: {
        routeCodes: ["WAW", "HKG", "CNPDG", "PUS"],
        stops: [
            { code: "WAW", label: "폴란드 공항", lat: 52.165699, lon: 20.9671, iconType: "airport" },
            { code: "HKG", label: "홍콩 공항", lat: 22.308901, lon: 113.915001, iconType: "airport" },
            { code: "CNPDG", label: "칭다오 항구", lat: 31.2333, lon: 121.5, iconType: "port" },
            { code: "PUS", label: "부산항", lat: 35.1333, lon: 129.05, iconType: "port" },
        ],
    },

    kpi: {
        plannedTransit: "23 days",
        forecastTransit: "23.8 days",
        reliability: "87 / 100",
    },

    notices: [
        { type: "WARN", message: "Hamburg T/S Port 혼잡으로 약 0.5일 지연 가능성" },
        { type: "RISK", message: "겨울철 북해 기상 영향으로 스케줄 변동 가능성" },
    ],
};
