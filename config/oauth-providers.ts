/**
 * CONFIG: OAuth Providers for MagNode / MagTech
 * ----------------------------------------------
 * Cada proveedor debe definir:
 * - auth_url: URL de autorización OAuth
 * - token_url: URL para obtener access_token
 * - client_id / client_secret (desde .env)
 * - scopes: permisos solicitados
 * - redirect_uri: hacia /api/platforms/oauth/[provider]/callback
 */

export const OAUTH_PROVIDERS = {
  // 🧩 Slack
  slack: {
    auth_url: "https://slack.com/oauth/v2/authorize",
    token_url: "https://slack.com/api/oauth.v2.access",
    client_id: process.env.SLACK_CLIENT_ID!,
    client_secret: process.env.SLACK_CLIENT_SECRET!,
    scopes: [
      "channels:read",
      "users:read",
      "chat:write",
      "users.profile:read",
      "team:read",
    ],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/slack/callback`,
  },

  // 🧠 HubSpot
  hubspot: {
    auth_url: "https://app.hubspot.com/oauth/authorize",
    token_url: "https://api.hubapi.com/oauth/v1/token",
    client_id: process.env.HUBSPOT_CLIENT_ID!,
    client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
    scopes: [
      "crm.objects.contacts.read",
      "crm.objects.deals.read",
      "crm.objects.owners.read",
    ],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/hubspot/callback`,
  },

  // 💬 Kommo (antes amoCRM)
  kommo: {
    auth_url: "https://www.kommo.com/oauth/",
    token_url: "https://www.kommo.com/oauth2/access_token",
    client_id: process.env.KOMMO_CLIENT_ID!,
    client_secret: process.env.KOMMO_CLIENT_SECRET!,
    scopes: ["users.read", "leads.read", "contacts.read", "pipelines.read"],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/kommo/callback`,
  },

  // ☁️ Google Workspace (Sheets / Drive)
  google: {
    auth_url: "https://accounts.google.com/o/oauth2/v2/auth",
    token_url: "https://oauth2.googleapis.com/token",
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/google/callback`,
  },

  // 📓 Notion
  notion: {
    auth_url: "https://api.notion.com/v1/oauth/authorize",
    token_url: "https://api.notion.com/v1/oauth/token",
    client_id: process.env.NOTION_CLIENT_ID!,
    client_secret: process.env.NOTION_CLIENT_SECRET!,
    scopes: ["read", "write", "databases", "users"],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/notion/callback`,
  },

  // 🧾 Zendesk
  zendesk: {
    auth_url: "https://YOUR_SUBDOMAIN.zendesk.com/oauth/authorizations/new",
    token_url: "https://YOUR_SUBDOMAIN.zendesk.com/oauth/tokens",
    client_id: process.env.ZENDESK_CLIENT_ID!,
    client_secret: process.env.ZENDESK_CLIENT_SECRET!,
    scopes: ["read", "write", "users"],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/zendesk/callback`,
  },

  // 📦 Dropbox
  dropbox: {
    auth_url: "https://www.dropbox.com/oauth2/authorize",
    token_url: "https://api.dropboxapi.com/oauth2/token",
    client_id: process.env.DROPBOX_CLIENT_ID!,
    client_secret: process.env.DROPBOX_CLIENT_SECRET!,
    scopes: ["files.metadata.read", "files.content.read"],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/dropbox/callback`,
  },

  // 🗃️ Box
  box: {
    auth_url: "https://account.box.com/api/oauth2/authorize",
    token_url: "https://api.box.com/oauth2/token",
    client_id: process.env.BOX_CLIENT_ID!,
    client_secret: process.env.BOX_CLIENT_SECRET!,
    scopes: ["root_readonly"],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/box/callback`,
  },

  // 📈 Linear
  linear: {
    auth_url: "https://linear.app/oauth/authorize",
    token_url: "https://api.linear.app/oauth/token",
    client_id: process.env.LINEAR_CLIENT_ID!,
    client_secret: process.env.LINEAR_CLIENT_SECRET!,
    scopes: ["read", "write", "comments"],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/linear/callback`,
  },

  // 💬 Intercom
  intercom: {
    auth_url: "https://app.intercom.com/oauth",
    token_url: "https://api.intercom.io/auth/eagle/token",
    client_id: process.env.INTERCOM_CLIENT_ID!,
    client_secret: process.env.INTERCOM_CLIENT_SECRET!,
    scopes: ["read_conversations", "write_conversations"],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/intercom/callback`,
  },

  // 💼 Microsoft Teams / Outlook / SharePoint
  microsoft: {
    auth_url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token_url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    scopes: [
      "User.Read",
      "Calendars.Read",
      "Mail.Read",
      "Files.Read",
      "offline_access",
    ],
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/platforms/oauth/microsoft/callback`,
  },
} as const;

// Tipo inferido para validación estricta
export type OAuthProviderKey = keyof typeof OAUTH_PROVIDERS;

