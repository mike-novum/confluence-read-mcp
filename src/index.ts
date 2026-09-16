#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { ConfluenceApiError, getPageById, type ConfluencePage } from "./confluence.js";

enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

const GetPageInputSchema = z
  .object({
    page_id: z
      .string()
      .min(1, "page_id обязателен")
      .describe("ID страницы Confluence. Число из URL: /pages/123456789/..."),
    response_format: z
      .nativeEnum(ResponseFormat)
      .default(ResponseFormat.MARKDOWN)
      .describe("Формат ответа: markdown или json")
  })
  .strict();

type GetPageInput = z.infer<typeof GetPageInputSchema>;

function formatPage(page: ConfluencePage, format: ResponseFormat): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(page, null, 2);
  }

  const lines = [
    `# ${page.title}`,
    "",
    `- **ID**: ${page.id}`,
    `- **Status**: ${page.status}`,
    `- **Type**: ${page.type}`
  ];

  if (page.spaceKey || page.spaceName) {
    lines.push(`- **Space**: ${page.spaceName ?? ""} (${page.spaceKey ?? ""})`.trim());
  }
  if (page.version !== undefined) {
    lines.push(`- **Version**: ${page.version}`);
  }
  if (page.url) {
    lines.push(`- **URL**: ${page.url}`);
  }
  if (page.truncated) {
    lines.push("- **Truncated**: true");
  }

  lines.push("", "## Content", "", page.content || "_Пустая страница_");
  return lines.join("\n");
}

const server = new McpServer({
  name: "confluence-mcp-server",
  version: "1.0.0"
});

server.registerTool(
  "confluence_get_page",
  {
    title: "Get Confluence Page",
    description: `Читает содержимое страницы Confluence по id.

Используйте, когда известен ID страницы (из URL /pages/{id}/...).
Не создаёт и не изменяет страницы.

Args:
  - page_id (string): ID страницы
  - response_format ('markdown' | 'json'): формат ответа, по умолчанию markdown

Returns:
  title, id, space, version, url и текстовое содержимое страницы.

Error Handling:
  - 401: проверьте токен и CONFLUENCE_EMAIL для Cloud
  - 403: нет прав на страницу
  - 404: неверный id или CONFLUENCE_BASE_URL`,
    inputSchema: GetPageInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetPageInput) => {
    try {
      const config = loadConfig();
      const page = await getPageById(config, params.page_id);
      const text = formatPage(page, params.response_format);
      return {
        content: [{ type: "text" as const, text }],
        structuredContent: page
      };
    } catch (error) {
      const message =
        error instanceof ConfluenceApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error);

      return {
        isError: true,
        content: [{ type: "text" as const, text: `Error: ${message}` }]
      };
    }
  }
);

async function main(): Promise<void> {
  try {
    loadConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("confluence-mcp-server: stdio");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
