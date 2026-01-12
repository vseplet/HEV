# HEV - План разработки

## Текущий статус: Фаза 1 (в процессе)

CLI + daemon с управлением процессами.

## Архитектура

```
┌─────────────┐         HTTP          ┌─────────────┐
│   CLI       │ ◄──────────────────►  │   Daemon    │
│  (cliffy)   │      localhost:9876   │   (hono)    │
└─────────────┘                       └─────────────┘
```

## Реализовано

- [x] CLI с командами `up` / `down`
- [x] Daemon с HTTP API (hono)
- [x] Автозапуск демона из CLI
- [x] GitHub Actions CI (fmt, lint, check, test)
- [x] Import maps в deno.json
- [x] Команда `hev start <script>` — запуск процесса
- [x] Команда `hev stop <id>` — остановка процесса
- [x] Команда `hev restart <id>` — перезапуск процесса
- [x] Команда `hev list` — список процессов
- [x] Авторестарт упавших процессов (мониторинг через ps)
- [x] Unit тесты для процессов
- [x] Команда `hev dash` — веб-интерфейс (morph)

## В планах

### Фаза 1: Управление процессами (осталось)
- [ ] Команда `hev logs <id>` — просмотр логов
- [ ] Хранение состояния процессов в Deno KV

### Фаза 2: Системные службы
- [ ] Интеграция с launchd (macOS)
- [ ] Интеграция с systemd (Linux)
- [ ] Команда `hev install` — установка демона как системной службы
- [ ] Команда `hev uninstall` — удаление системной службы

### Фаза 3: Web Dashboard (dash)
- [x] Команда `hev dash` — запуск веб-интерфейса
- [x] Использовать [@vseplet/morph](https://github.com/vseplet/morph) для UI
- [x] Страница со списком процессов
- [x] Запуск/остановка/перезапуск процессов через UI
- [ ] Просмотр логов в реальном времени
- [x] Статус демона и системная информация

### Фаза 4: Дополнительные функции
- [ ] Мониторинг ресурсов (CPU, RAM)
- [ ] Кластерный режим

## Структура проекта

```
src/
├── cli.ts                 # Точка входа CLI
├── daemon.ts              # Точка входа демона
├── cli/
│   ├── mod.ts             # Главный CLI модуль
│   └── commands/
│       ├── up.ts          # hev up
│       ├── down.ts        # hev down
│       ├── start.ts       # hev start
│       ├── stop.ts        # hev stop
│       ├── restart.ts     # hev restart
│       ├── list.ts        # hev list
│       └── dash.ts        # hev dash
├── daemon/
│   ├── mod.ts             # HTTP сервер
│   ├── api.ts             # API endpoints
│   └── processes.ts       # Управление процессами
└── shared/
    ├── config.ts          # Конфигурация
    └── client.ts          # HTTP клиент
tests/
└── processes_test.ts      # Тесты процессов
```

## CLI команды

| Команда | Описание |
|---------|----------|
| `hev up` | Запустить демон |
| `hev down` | Остановить демон |
| `hev start <script>` | Запустить процесс |
| `hev stop <id>` | Остановить процесс |
| `hev restart <id>` | Перезапустить процесс |
| `hev list` | Список процессов |
| `hev dash` | Запустить веб-интерфейс |

## API демона

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/health` | GET | Статус демона |
| `/shutdown` | POST | Остановка демона |
| `/processes` | GET | Список процессов |
| `/processes` | POST | Запуск процесса |
| `/processes/:id` | GET | Информация о процессе |
| `/processes/:id/stop` | POST | Остановка процесса |
| `/processes/:id/restart` | POST | Перезапуск процесса |
| `/processes/:id` | DELETE | Удаление процесса |
