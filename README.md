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

### 1. Скачать сервер

Скачайте архив релиза и распакуйте его в любую директорию.

> Требуется Node.js 18+.

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

В `mcp.json` укажите путь до `index.js` из распакованного архива и до `.env`.


```json
{
  "mcpServers": {
    "confluence": {
      "command": "node",
      "args": ["/ABS/PATH/confluence-read-mcp/index.js"],
      "envFile": "/ABS/PATH/.env"
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
      "args": ["/ABS/PATH/confluence-read-mcp/index.js"],
      "env": {
        "CONFLUENCE_BASE_URL": "https://your-domain.atlassian.net/wiki",
        "CONFLUENCE_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```

В случае успешной настройки конфига сервер должен появиться в списке MCP-серверов с tool `confluence_get_page`.