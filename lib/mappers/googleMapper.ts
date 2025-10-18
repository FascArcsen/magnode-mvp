export function mapGoogleData(raw: any) {
  const payload = raw.data || {};
  return {
    platform: "Google",
    user: payload.user_email || "Unknown User",
    action: payload.eventName || "Unknown Action",
    timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
     metadata: raw.data || {}, // 👈 sin JSON.stringify
  };
}