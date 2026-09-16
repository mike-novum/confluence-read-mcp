import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnv({ path: path.join(projectRoot, ".env") });
loadEnv();

export interface ConfluenceConfig {
  baseUrl: string;
  token: string;
  email: string | undefined;
}

function normalizeBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  if (url.includes("atlassian.net") && !url.endsWith("/wiki") && !url.includes("/wiki/")) {
    url = `${url}/wiki`;
  }
  return url;
}

export function loadConfig(): ConfluenceConfig {
  const baseUrlRaw = process.env.CONFLUENCE_BASE_URL?.trim();
  const token = (
    process.env.CONFLUENCE_ACCESS_TOKEN ??
    process.env.CONFLUENCE_API_TOKEN ??
    process.env.TOKEN ??
    ""
  ).trim();
  const email = process.env.CONFLUENCE_EMAIL?.trim() || undefined;

  if (!baseUrlRaw) {
    throw new Error(
      "Не задан CONFLUENCE_BASE_URL. Укажите его в .env или в env MCP-конфига Cursor."
    );
  }

  if (!token) {
    throw new Error(
      "Не задан токен. Используйте CONFLUENCE_ACCESS_TOKEN, CONFLUENCE_API_TOKEN или TOKEN."
    );
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrlRaw),
    token,
    email
  };
}

export function authHeader(config: ConfluenceConfig): string {
  if (config.email) {
    const encoded = Buffer.from(`${config.email}:${config.token}`).toString("base64");
    return `Basic ${encoded}`;
  }
  return `Bearer ${config.token}`;
}
