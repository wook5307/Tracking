// src/constants/loc.ts
export interface Coord {
    lat: number;
    lon: number;
    iconType: "airplane" | "port" | "office" | "factory" | "inland" | "ship" | "airport";
    label: string;
}

export const LOC: Record<string, Coord> = {
    PUS: { lat: 35.1333, lon: 129.05, iconType: "port", label: "부산항" },
    ICN: { lat: 37.4602, lon: 126.4407, iconType: "airport", label: "인천공항" },
    CNPDG: { lat: 31.2333, lon: 121.5, iconType: "port", label: "칭다오 항구" },
    HKG: { lat: 22.308901, lon: 113.915001, iconType: "airport", label: "홍콩 공항" },
    WAW: { lat: 52.165699, lon: 20.9671, iconType: "airport", label: "폴란드 공항" },


    // 서부
    LAX: { lat: 33.9416, lon: -118.4085, iconType: "airport", label: "로스앤젤레스 공항" },
    SFO: { lat: 37.6213, lon: -122.3790, iconType: "airport", label: "샌프란시스코 공항" },
    SEA: { lat: 47.4502, lon: -122.3088, iconType: "airport", label: "시애틀 공항" },

    // 중부
    ORD: { lat: 41.9742, lon: -87.9073, iconType: "airport", label: "시카고 오헤어 공항" },
    DFW: { lat: 32.8998, lon: -97.0403, iconType: "airport", label: "댈러스 공항" },

    // 동부
    JFK: { lat: 40.6413, lon: -73.7781, iconType: "airport", label: "뉴욕 JFK 공항" },
    ATL: { lat: 33.6407, lon: -84.4277, iconType: "airport", label: "애틀랜타 공항" },

    // 화물 허브
    ANC: { lat: 61.1743, lon: -149.9963, iconType: "airport", label: "앵커리지 공항 (알래스카)" },
    MEM: { lat: 35.0420, lon: -89.9767, iconType: "airport", label: "멤피스 공항 (FedEx)" },
    SDF: { lat: 38.1764, lon: -85.7360, iconType: "airport", label: "루이빌 공항 (UPS)" },
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
    USJFK:{lat: 40.6413, lon: -73.7781, iconType:"airport",label:"뉴욕 공항"},
};
