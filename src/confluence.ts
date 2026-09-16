import { authHeader, type ConfluenceConfig } from "./config.js";

export const CHARACTER_LIMIT = 25000;

export interface ConfluencePage {
  [key: string]: unknown;
  id: string;
  title: string;
  type: string;
  status: string;
  spaceKey?: string;
  spaceName?: string;
  version?: number;
  url?: string;
  content: string;
  truncated: boolean;
}

interface ConfluenceContentResponse {
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  space?: { key?: string; name?: string };
  version?: { number?: number };
  body?: {
    view?: { value?: string };
    storage?: { value?: string };
  };
  _links?: { webui?: string; base?: string };
  message?: string;
}

export class ConfluenceApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "ConfluenceApiError";
  }
}

export function htmlToText(html: string): string {
  const withBreaks = html
    .replace(/<\/(p|div|h[1-6]|li|tr|table|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?ac:[^>]*>/gi, "")
    .replace(/<\/?ri:[^>]*>/gi, "");

  const withoutTags = withBreaks.replace(/<[^>]+>/g, "");

  return withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function applyLimit(text: string): { content: string; truncated: boolean } {
  if (text.length <= CHARACTER_LIMIT) {
    return { content: text, truncated: false };
  }
  return {
    content: `${text.slice(0, CHARACTER_LIMIT)}\n\n[truncated] Ответ обрезан. Запросите страницу повторно или сузьте задачу.`,
    truncated: true
  };
}

export async function getPageById(
  config: ConfluenceConfig,
  pageId: string
): Promise<ConfluencePage> {
  const url = new URL(`${config.baseUrl}/rest/api/content/${encodeURIComponent(pageId)}`);
  url.searchParams.set("expand", "body.view,body.storage,space,version");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader(config)
      },
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ConfluenceApiError("Таймаут запроса к Confluence. Повторите попытку.");
    }
    throw new ConfluenceApiError(
      `Не удалось подключиться к Confluence: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let details = "";
    try {
      const payload = (await response.json()) as ConfluenceContentResponse;
      details = payload.message ? ` ${payload.message}` : "";
    } catch {
      details = "";
    }

    switch (response.status) {
      case 401:
        throw new ConfluenceApiError(
          "Ошибка авторизации. Проверьте CONFLUENCE_ACCESS_TOKEN и CONFLUENCE_EMAIL (для Cloud).",
          401
        );
      case 403:
        throw new ConfluenceApiError(
          "Нет доступа к странице. Проверьте права пользователя токена.",
          403
        );
      case 404:
        throw new ConfluenceApiError(
          `Страница ${pageId} не найдена. Проверьте id и CONFLUENCE_BASE_URL.`,
          404
        );
      case 429:
        throw new ConfluenceApiError("Превышен лимит запросов Confluence. Подождите и повторите.", 429);
      default:
        throw new ConfluenceApiError(
          `Confluence API вернул ${response.status}.${details}`,
          response.status
        );
    }
  }

  const data = (await response.json()) as ConfluenceContentResponse;
  const html = data.body?.view?.value || data.body?.storage?.value || "";
  const limited = applyLimit(htmlToText(html));
  const webui = data._links?.webui;
  const base = data._links?.base || config.baseUrl;

  return {
    id: data.id ?? pageId,
    title: data.title ?? "",
    type: data.type ?? "page",
    status: data.status ?? "unknown",
    spaceKey: data.space?.key,
    spaceName: data.space?.name,
    version: data.version?.number,
    url: webui ? `${base}${webui}` : undefined,
    content: limited.content,
    truncated: limited.truncated
  };
}
