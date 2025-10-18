export function mapSlackData(raw: any) {
  const payload = raw.data || {};
  return {
    platform: "Slack",
    user: payload.user || "Unknown User",
    action: payload.type || "Unknown Event",
    timestamp: payload.event_ts ? new Date(+payload.event_ts * 1000) : new Date(),
     metadata: raw.data || {}, // 👈 sin JSON.stringify
  };
}