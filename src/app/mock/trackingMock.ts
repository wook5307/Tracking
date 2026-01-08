// app/mock/trackingMock.ts
export const trackingMock = {
    tracking_no: "TGHU1234567",
    mbl: "MAMU123456789",
    hbl: "HTNSPL2401001",
    pol_pod: "PLGDG (Gdańsk, Poland) → KRPUS (Busan, Korea)",
    container: "TGHU1234567 · 40HC",
    carrier_code: "AE12",
    vessel_name: "MAERSK SOFIA",
    eta: "2025-01-18 06:00 (KST)",

    checkpoints: [
        {
            event_time: "2025-01-11 22:40",
            event_code: "SEA_SAILING",
            event_text: "본선 항해 중",
            location_name: "North Sea",
            lat: 56.0,
            lng: 5.0
        },
        {
            event_time: "2025-01-06 03:40",
            event_code: "SEA_DEPARTURE",
            event_text: "POL 출항",
            location_name: "Gdańsk Port",
            lat: 54.352,
            lng: 18.646
        }
    ]
};
