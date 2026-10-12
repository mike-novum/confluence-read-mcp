# confluence-mcp-server

MCP-сервер для чтения страниц из Confluence.

Содержит один tool:
`confluence_get_page` - читает страницу Confluence по id.

Описание параметров:

| Параметр | Тип | Описание |
| --- | --- | --- |
| `page_id` | string | ID страницы из URL `/pages/{id}/...` |
| `response_format` | `markdown` \| `json` | По умолчанию `markdown` |

Пример промта при использовании: 
«прочитай страницу Confluence 123456789».


## Как подключить и использовать

### 1. Установка зависимостей, сборка

Скачать, установить зависимости и выполнить сборку:

```bash
npm install
npm run build
```

> Требуется Node.js 18+.

После сборки нужно в вашей IDE/TUI прописать путь до собранного сервера (путь до index.js). И заполнить env-переменные, чтобы авторизовываться в Confluence.

### 2. Авторизация в Confluence

Для авторизации надо настроить env-переменные внутри вашего проекта:

1. Добавьте файл `.env` в корне проекта (если его нет).
2. Добавьте переменные с токеном и URL до вашей системы:

```env
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_ACCESS_TOKEN=your-token
```

> Токен можно задать через разные переменные -  `CONFLUENCE_ACCESS_TOKEN`, `CONFLUENCE_API_TOKEN`, `TOKEN`.

Если вы используете **Confluence Cloud**, то дополнительно потребуется указать почту:

```env
CONFLUENCE_EMAIL=you@company.com
```

`CONFLUENCE_BASE_URL` может принимать следующие значения:

- Cloud: `https://your-domain.atlassian.net` или `https://your-domain.atlassian.net/wiki`
- Server/DC: `https://confluence.company.com` (включая context path, если есть, например `/confluence`)


### 3. Подключение MCP-сервера в IDE/TUI

MCP-сервер нужно указать в списке серверов из mcp.json, добавив путь до index.js (файл который запускает сервер) и до `.env-файла`. Ниже представлен один из вариантов конфигурации для Cursor.


#### 3.1 Cursor

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
      "args": ["/Users/{path-to-mcp}/confluence-read-mcp/dist/index.js"],
      "envFile": "/Users/{path-to-mcp}/confluence-read-mcp/.env"
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

В случае успешной настройки конфига сервер должен появиться в списке MCP-серверов с tool `confluence_get_page`.