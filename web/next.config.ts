import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV !== "production";

type EmbedMode = "deny" | "allowlist";

function getEmbedMode(): EmbedMode {
  const raw = process.env.SECURITY_EMBED_MODE?.toLowerCase();
  return raw === "allowlist" ? "allowlist" : "deny";
}

function parseAllowlistedOrigins(): string[] {
  const raw = process.env.SECURITY_EMBED_ORIGINS ?? "";
  if (!raw) {
    return [];
  }

  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const value = part.trim();
    if (!value) {
      continue;
    }

    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") {
        continue;
      }
      seen.add(parsed.origin);
    } catch {
      // Ignore invalid origin entries to keep config resilient.
    }
  }

  return [...seen];
}

function getSupabaseConnectSources(): string[] {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    return [];
  }

  try {
    const parsed = new URL(value);
    const httpsOrigin = parsed.origin;
    const wssOrigin = `wss://${parsed.host}`;
    return [httpsOrigin, wssOrigin];
  } catch {
    return [];
  }
}

function buildContentSecurityPolicy() {
  const embedMode = getEmbedMode();
  const allowlistedOrigins = parseAllowlistedOrigins();
  const supabaseSources = getSupabaseConnectSources();

  const connectSrc = ["'self'", ...supabaseSources];
  if (isDevelopment) {
    connectSrc.push("http://localhost:*", "ws://localhost:*");
  }

  const frameAncestors =
    embedMode === "allowlist" ? ["'self'", ...allowlistedOrigins] : ["'none'"];

  const scriptSrc = ["'self'", "'unsafe-inline'"];
  if (isDevelopment) {
    scriptSrc.push("'unsafe-eval'");
  }

  const directives = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `form-action 'self'`,
    `frame-ancestors ${frameAncestors.join(" ")}`,
    `script-src ${scriptSrc.join(" ")}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' blob: data: https:`,
    `connect-src ${connectSrc.join(" ")}`,
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return {
    value: directives.join("; "),
    embedMode,
  };
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow up to 3 image files (max 5MB each) plus multipart overhead.
      bodySizeLimit: "20mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/newsletter",
        destination: "/resources",
        permanent: true,
      },
    ];
  },
  async headers() {
    const csp = buildContentSecurityPolicy();
    const baseHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Content-Security-Policy", value: csp.value },
    ];

    if (isProduction) {
      baseHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" });
    }
    if (csp.embedMode === "deny") {
      baseHeaders.push({ key: "X-Frame-Options", value: "DENY" });
    }

    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
    ];
  },
};

export default nextConfig;
