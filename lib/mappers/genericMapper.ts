export function mapGenericData(raw: any) {
  return {
    platform: raw.platform || "Unknown",
    user: raw.user || "System",
    action: raw.event || "Unclassified",
    timestamp: new Date(raw.timestamp || Date.now()),
     metadata: raw.data || {}, // 👈 sin JSON.stringify
  };
}