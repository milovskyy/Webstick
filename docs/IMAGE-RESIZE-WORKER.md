# Image resize worker (background processing)

Background worker that resizes product images to small (300px), medium (600px), and large (1200px) width using BullMQ and Redis.

---

## Запуск проекту однією командою (Docker)

Проект має стартувати з файлу `docker-compose.yml` однією командою. У корені проекту:

```bash
docker-compose up -d
```

Піднімуться сервіси: **redis**, **web** (додаток на порту 3000; воркер ресайзу працює всередині web). Сайт: http://localhost:3000

Переглянути логи: `docker-compose logs -f`  
Зупинити: `docker-compose down`

### Windows: у браузері 0 товарів або не видно фото

Якщо через Docker показує 0 товарів (а через `npm run dev` — нормально) або не відображаються фото — контейнер не бачить ту саму папку проекту (база й `public/uploads`).

**Що зробити:**

1. У корені проекту створи файл `.env` (можна скопіювати з `.env.example`).
2. Додай або переконайся, що є рядки:
   ```
   COMPOSE_CONVERT_WINDOWS_PATHS=1
   PROJECT_DIR=D:/1_IT/Pratice/Next.js/Webstick-testwork
   ```
   Замість шляху вище вкажи **свій** повний шлях до папки проекту (можно з `/` або `\`).
3. Запускай **завжди з кореня проекту**: `docker-compose up --build`.
4. У логах при старті web має з’явитися `OK: prisma/prisma/dev.db found`. Якщо бачиш `WARN: prisma/prisma/dev.db missing` — перевір `PROJECT_DIR` у `.env`.

### Шлях до БД у Docker

База лежить у проєкті в `prisma/prisma/dev.db`. У Docker у `docker-compose.yml` вказано **абсолютний** шлях `file:/app/prisma/prisma/dev.db`, щоб Prisma CLI і runtime використовували один і той самий файл (відносні шляхи Prisma резолвить від каталогу з `schema.prisma`, тому раніше створювався зайвий файл `prisma/prisma/prisma/dev.db`). Якщо такий файл з'явився — його можна видалити.

### Потік фото: форма → БД → воркер → відображення

- **Створення/редагування товару (форма):** файли зберігаються на диск у `public/uploads/products/{productId}/original/{uuid}.jpg` (або інше розширення). У БД (ProductImage) зберігається лише веб-шлях: `original: "/uploads/products/{productId}/original/{fileName}"`. Для зображень одразу додається завдання в чергу BullMQ (Redis).
- **Воркер (lib/image-worker.ts):** отримує `originalImagePath` (той самий веб-шлях), конвертує через `lib/image-resize.ts`: читає з `public/` + шлях, зберігає ресайзи в `public/uploads/products/{productId}/small|medium|large/{baseName}.jpg` і оновлює в БД поля `small`, `medium`, `large` (веб-шляхи).
- **Читання в додатку:** у БД зберігаються веб-шляхи (`/uploads/...`). Next.js віддає статику з `public/`, тому URL `/uploads/products/.../small/xxx.jpg` відповідає файлу `public/uploads/products/.../small/xxx.jpg`. У UI використовується пріоритет: `img.large ?? img.medium ?? img.small ?? img.original`.

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
