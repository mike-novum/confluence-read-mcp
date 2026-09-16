# confluence-mcp-server

MCP-сервер с одним tool: `confluence_get_page`. Читает страницу Confluence по id.

## Настройка

1. Скопируйте `.env.example` в `.env` (файл уже может быть в проекте).
2. Заполните переменные:

```env
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_ACCESS_TOKEN=your-token
```

Алиасы токена: `CONFLUENCE_ACCESS_TOKEN`, `CONFLUENCE_API_TOKEN`, `TOKEN`.

Для **Confluence Cloud** с API token дополнительно:

```env
CONFLUENCE_EMAIL=you@company.com
```

Тогда используется Basic auth (`email:token`). Без email — Bearer (PAT Data Center / Server).

`CONFLUENCE_BASE_URL`:

- Cloud: `https://your-domain.atlassian.net` или `https://your-domain.atlassian.net/wiki`
- Server/DC: `https://confluence.company.com` (включая context path, если есть, например `/confluence`)

## Установка

```bash
npm install
npm run build
```

Нужен Node.js 18+.

## Подключение в Cursor

Проект уже содержит `.cursor/mcp.json`. После `npm run build` перезапустите Cursor или включите сервер в **Settings → MCP**.

Ручная конфигурация:

**Проект:** `.cursor/mcp.json`  
**Глобально:** `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "confluence": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

Для глобального конфига укажите абсолютный путь:

```json
{
  "mcpServers": {
    "confluence": {
      "command": "node",
      "args": ["/Users/YOU/git/personal/confluence-read-mcp/dist/index.js"],
      "envFile": "/Users/YOU/git/personal/confluence-read-mcp/.env"
    }
  }
}
```

Токен можно передать и через `env`, без `envFile`:

```json
{
  "mcpServers": {
    "confluence": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js"],
      "env": {
        "CONFLUENCE_BASE_URL": "https://your-domain.atlassian.net/wiki",
        "CONFLUENCE_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

После сохранения конфига сервер должен появиться в MCP с tool `confluence_get_page`.

## Tool

`confluence_get_page`

| Параметр | Тип | Описание |
| --- | --- | --- |
| `page_id` | string | ID страницы из URL `/pages/{id}/...` |
| `response_format` | `markdown` \| `json` | По умолчанию `markdown` |

Пример: «прочитай страницу Confluence 123456789».
