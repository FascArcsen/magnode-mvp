import { mapGoogleData } from "./googleMapper";
import { mapSlackData } from "./slackMapper";
import { mapGenericData } from "./genericMapper";

export function mapRawToAudit(raw: any) {
  switch (raw.platform?.toLowerCase()) {
    case "google":
      return mapGoogleData(raw);
    case "slack":
      return mapSlackData(raw);
    default:
      return mapGenericData(raw);
  }
}