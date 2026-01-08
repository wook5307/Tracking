export interface ShipMent {
    tracking_no: string;
    mbl: string;
    hbl: string;
    pol_pod: string;
    container: string;
    carrier_code: string;
    last_event_time: string;
    checkpoints: Checkpoint[];
}

export interface Checkpoint {
    event_time: string;
    event_code: "DEPARTURE" | "TRANSIT" | "ARRIVAL";
    event_text: string;
    location_name: string;
    lat: string;
    lng: string;
}
