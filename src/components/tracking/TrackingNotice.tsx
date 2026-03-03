"use client";

interface TrackingNoticeItem {
    type?: "INFO" | "WARN" | "RISK";
    message: string;
}

interface TrackingNoticeProps {
    title?: string;
    items: TrackingNoticeItem[];
}

const TYPE_STYLE = {
    INFO: {
        bg: "#f8fafc",
        color: "#334155",
        dot: "#64748b",
    },
    WARN: {
        bg: "#fff7ed",
        color: "#9a3412",
        dot: "#f97316",
    },
    RISK: {
        bg: "#fef2f2",
        color: "#991b1b",
        dot: "#ef4444",
    },
};

export default function TrackingNotice({
                                           title = "특이사항",
                                           items,
                                       }: TrackingNoticeProps) {
    if (!items || items.length === 0) return null;

    return (
        <div
            style={{
                marginTop: "6px",
                background: "#fffbea",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                padding: "12px 16px",
            }}
        >
            <div
                style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#92400e",
                    marginBottom: "8px",
                }}
            >
                {title}
            </div>

            <ul style={{ paddingLeft: "0", margin: 0, listStyle: "none" }}>
                {items.map((item, idx) => {
                    const type = item.type ?? "INFO";
                    const style = TYPE_STYLE[type];

                    return (
                        <li
                            key={idx}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "8px",
                                fontSize: "13px",
                                color: style.color,
                                lineHeight: 1.5,
                                marginBottom: "6px",
                            }}
                        >
              <span
                  style={{
                      width: "6px",
                      height: "6px",
                      marginTop: "7px",
                      borderRadius: "50%",
                      background: style.dot,
                      flexShrink: 0,
                  }}
              />
                            <span>{item.message}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
