# Webstick Testwork — E-commerce Admin

Адмін-панель для керування каталогом товарів: продукти, зображення, категорії, бренди, колекції, інвентар, замовлення та мітки. Збірка на **Next.js 14**, **Prisma**, **SQLite**, **Redis** та чергах **BullMQ** для фонової обробки зображень.

## Зміст

- [Технології](#технології)
- [Вимоги](#вимоги)
- [Встановлення та запуск](#встановлення-та-запуск)
- [Змінні середовища](#змінні-середовища)
- [Запуск у Docker](#запуск-у-docker)
- [Скрипти](#скрипти)
- [Структура проєкту](#структура-проєкту)

## Технології

| Категорія             | Стек                                      |
| --------------------- | ----------------------------------------- |
| Фреймворк             | Next.js 14 (App Router)                   |
| База даних            | SQLite + Prisma ORM                       |
| Черги                 | Redis + BullMQ                            |
| Обробка зображень     | Sharp, фоновий воркер (tsx)               |
| Форми та валідація    | React Hook Form, Zod, @hookform/resolvers |
| Редактор тексту       | TipTap (опис товару)                      |
| UI                    | Tailwind CSS, Radix UI, Lucide React      |
| Збірка для продакшену | standalone output, Docker                 |

## Вимоги

- **Node.js** 20+
- **npm** (або yarn/pnpm)
- **Redis** — для черг ресайзу зображень (при локальному запуску з воркером)

## Встановлення та запуск

### 1. Клонування та залежності

```bash
git clone <url-репозиторія>
cd Webstick-testwork
npm install
```

### 2. Змінні середовища

Скопіюйте приклад і за потреби відредагуйте:

```bash
cp .env.example .env
```

### 3. База даних

```bash
npx prisma generate
npx prisma db push
```

### 4. Запуск застосунку

**Лише веб-застосунок:**

```bash
npm run dev
```

Застосунок буде доступний за адресою: **http://localhost:3000**

**З фоновою обробкою зображень (ресайз):**

В одному терміналі запустіть Redis (якщо не в Docker):

```bash
# Windows (наприклад, через WSL або встановлений Redis)
redis-server
```

В іншому — воркер черги:

```bash
npm run worker:resize
```

В третьому — застосунок:

```bash
npm run dev
```

## Змінні середовища

| Змінна         | Опис                           | Приклад                        |
| -------------- | ------------------------------ | ------------------------------ |
| `DATABASE_URL` | URL підключення до БД (Prisma) | `file:../prisma/prisma/dev.db` |
| `REDIS_URL`    | URL Redis для BullMQ           | `redis://localhost:6379`       |

Див. `.env.example` в корені проєкту.

## Запуск у Docker

Проєкт збирається в **standalone** і запускається через **docker-compose** разом з Redis. Воркер ресайзу зображень стартує всередині контейнера `web`.

### Запуск

```bash
docker-compose up --build
```

- Веб: **http://localhost:3000**
- Redis: порт **6379**

### Важливо для Docker

- База SQLite монтується з хоста: `./prisma` → `/app/prisma`. Щоб використовувати власну БД з хоста, задайте `PROJECT_DIR` в `.env` (шлях до кореня проєкту).
- Завантажені файли зберігаються в `./public/uploads` і монтуються в контейнер.

## Скрипти

| Команда                 | Опис                                       |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Режим розробки (Next.js)                   |
| `npm run build`         | Генерація Prisma-клієнта та збірка Next.js |
| `npm run start`         | Запуск production-сервера                  |
| `npm run lint`          | Перевірка лінтером                         |
| `npm run format`        | Форматування коду (Prettier)               |
| `npm run db:generate`   | Генерація Prisma Client                    |
| `npm run db:push`       | Синхронізація схеми з БД (без міграцій)    |
| `npm run worker:resize` | Запуск воркера черги ресайзу зображень     |

## Структура проєкту

```
├── app/
│   ├── api/products/     # API товарів (CRUD, завантаження зображень)
│   ├── products/         # Сторінки списку, створення, редагування товарів
│   ├── categories/       # Категорії
│   ├── brands/           # Бренди
│   ├── collections/      # Колекції
│   ├── inventory/        # Інвентар
│   ├── orders/           # Замовлення
│   ├── labels/           # Мітки
│   ├── layout.tsx
│   └── page.tsx
├── components/           # UI-компоненти (Sidebar, ProductRow, пагінація тощо)
├── lib/
│   ├── prisma.ts         # Клієнт Prisma
│   ├── queue.ts          # Черга BullMQ
│   ├── image-worker.ts   # Логіка ресайзу (Sharp)
│   └── constants.ts      # Ліміти та константи
├── prisma/
│   ├── schema.prisma     # Моделі Product, ProductImage
│   └── prisma/dev.db     # SQLite (або шлях з DATABASE_URL)
├── public/uploads/       # Завантажені зображення (original, small, medium, large)
├── docker-compose.yml
├── Dockerfile
└── next.config.js        # standalone, custom image loader
```

## Моделі даних (Prisma)

- **Product** — товар: назва, короткий/повний опис, ціна, ціна зі знижкою, собівартість, зв’язок із зображеннями.
- **ProductImage** — зображення товару: шляхи до оригіналу та варіантів (small, medium, large), зв’язок із продуктом (Cascade delete).

Завантаження зображень йде через API; ресайз виконується асинхронно воркером через BullMQ та Sharp.

---

За проблем перевірте: наявність `.env`, виконання `prisma generate` та `prisma db push`, доступність Redis при використанні воркера ресайзу та коректність шляхів при запуску в Docker.
