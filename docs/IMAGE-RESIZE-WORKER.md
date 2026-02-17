# Image resize worker (background processing)

Background worker that resizes product images to small (300px), medium (600px), and large (1200px) width using BullMQ and Redis.

---

## Запуск проекту однією командою (Docker)

Проект має стартувати з файлу `docker-compose.yml` однією командою. У корені проекту:

```bash
docker-compose up -d
```

Піднімуться три сервіси: **redis**, **web** (додаток на порту 3000), **worker** (ресайз зображень). Сайт: http://localhost:3000

Переглянути логи: `docker-compose logs -f`  
Зупинити: `docker-compose down`

### Помилка "authentication required - email must be verified"

Якщо при `docker-compose up -d` з’являється:

```
Error response from daemon: authentication required - email must be verified before using account
```

**Причина:** ви залогінені в Docker Hub з акаунтом, у якого не підтверджена пошта — Docker тоді вимагає верифікацію при pull образів.

**Що зробити (один із варіантів):**

1. **Вийти з Docker Hub** (після цього образи тягнуться без логіну):

   ```bash
   docker logout
   ```

   Потім знову: `docker-compose up -d`

2. **Або** підтвердити email у профілі на https://hub.docker.com (Sign in → Account Settings → Email).

Після `docker logout` образ `redis:7-alpine` завантажується як публічний без авторизації.

---

## Как запускать приложение (локально, без Docker)

### Вариант 1: Без Redis (только сайт)

Приложение **работает и без Redis**: создание/редактирование товаров сохраняется, но ресайз картинок в фоне не выполняется (в логе будет сообщение, что очередь недоступна).

```bash
npm run dev
```

### Вариант 2: С Redis (сайт + фоновый ресайз картинок)

1. **Запустить Redis** (см. ниже).
2. **Терминал 1 — Next.js:**
   ```bash
   npm run dev
   ```
3. **Терминал 2 — воркер ресайза:**
   ```bash
   npm run worker:resize
   ```

---

## Redis: установка и запуск

### Проверить, установлен ли Redis

В терминале:

```bash
redis-cli ping
```

Если ответ `PONG` — Redis уже запущен. Если команда не найдена или ошибка подключения — Redis нужно запустить (или установить).

### Запуск Redis через Docker (рекомендуется на Windows)

В папке проекта:

```bash
docker-compose up redis -d
```

Так поднимается только контейнер Redis на порту `6379`. По умолчанию приложение подключается к `localhost:6379`.

Остановить: `docker-compose stop redis`

### Установка Redis на Windows без Docker

1. Скачать: https://github.com/microsoftarchive/redis/releases (или через Chocolatey: `choco install redis-64`).
2. Запустить сервер: `redis-server` (или как службу Windows).

Переменные окружения (по желанию): `REDIS_HOST`, `REDIS_PORT` (по умолчанию `localhost:6379`).

---

## Prerequisites (for worker)

- **Redis** must be running (queue backend) if you want background resize.
- Optional: `REDIS_HOST` and `REDIS_PORT` env vars (default: `localhost:6379`).

## Start the worker

From the project root:

```bash
npm run worker:resize
```

Or directly:

```bash
npx tsx lib/image-worker.ts
```

Keep this process running (e.g. in a separate terminal or process manager). The API works without Redis; if Redis is not available, product creation/update still succeeds and resize jobs are skipped (logged).

## Required packages

Already in `package.json`:

- `bullmq` – queue
- `ioredis` – Redis client (used by BullMQ)
- `sharp` – image resizing

No extra install needed.
