# Websick Testwork — E-commerce Admin

Админ-панель для управления каталогом товаров: продукты, изображения, категории, бренды, коллекции, инвентарь, заказы и метки. Сборка на **Next.js 14**, **Prisma**, **SQLite**, **Redis** и очередях **BullMQ** для фоновой обработки изображений.

## Содержание

- [Технологии](#технологии)
- [Требования](#требования)
- [Установка и запуск](#установка-и-запуск)
- [Переменные окружения](#переменные-окружения)
- [Запуск в Docker](#запуск-в-docker)
- [Скрипты](#скрипты)
- [Структура проекта](#структура-проекта)

## Технологии

| Категория        | Стек |
|------------------|------|
| Фреймворк        | Next.js 14 (App Router) |
| База данных      | SQLite + Prisma ORM |
| Очереди          | Redis + BullMQ |
| Обработка изображений | Sharp, фоновый воркер (tsx) |
| Формы и валидация | React Hook Form, Zod, @hookform/resolvers |
| Редактор текста  | TipTap (описание товара) |
| UI               | Tailwind CSS, Radix UI, Lucide React |
| Сборка для продакшена | standalone output, Docker |

## Требования

- **Node.js** 20+
- **npm** (или yarn/pnpm)
- **Redis** — для очередей ресайза изображений (при локальном запуске с воркером)

## Установка и запуск

### 1. Клонирование и зависимости

```bash
git clone <url-репозитория>
cd Webstick-testwork
npm install
```

### 2. Переменные окружения

Скопируйте пример и при необходимости отредактируйте:

```bash
cp .env.example .env
```

### 3. База данных

```bash
npx prisma generate
npx prisma db push
```

### 4. Запуск приложения

**Только веб-приложение:**

```bash
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:3000**

**С фоновой обработкой изображений (ресайз):**

В одном терминале запустите Redis (если не в Docker):

```bash
# Windows (например, через WSL или установленный Redis)
redis-server
```

В другом — воркер очереди:

```bash
npm run worker:resize
```

В третьем — приложение:

```bash
npm run dev
```

## Переменные окружения

| Переменная    | Описание                          | Пример |
|---------------|-----------------------------------|--------|
| `DATABASE_URL`| URL подключения к БД (Prisma)     | `file:./prisma/prisma/dev.db` |
| `REDIS_URL`   | URL Redis для BullMQ              | `redis://localhost:6379` |

См. `.env.example` в корне проекта.

## Запуск в Docker

Проект собирается в **standalone** и запускается через **docker-compose** вместе с Redis. Воркер ресайза изображений стартует внутри контейнера `web`.

### Запуск

```bash
docker-compose up --build
```

- Веб: **http://localhost:3000**
- Redis: порт **6379**

### Важно для Docker

- База SQLite монтируется из хоста: `./prisma` → `/app/prisma`. Для использования своей БД с хоста задайте `PROJECT_DIR` в `.env` (путь к корню проекта).
- Загруженные файлы сохраняются в `./public/uploads` и монтируются в контейнер.

## Скрипты

| Команда            | Описание |
|--------------------|----------|
| `npm run dev`      | Режим разработки (Next.js) |
| `npm run build`    | Генерация Prisma-клиента и сборка Next.js |
| `npm run start`    | Запуск production-сервера |
| `npm run lint`     | Проверка линтером |
| `npm run format`   | Форматирование кода (Prettier) |
| `npm run db:generate` | Генерация Prisma Client |
| `npm run db:push`  | Синхронизация схемы с БД (без миграций) |
| `npm run worker:resize` | Запуск воркера очереди ресайза изображений |

## Структура проекта

```
├── app/
│   ├── api/products/     # API товаров (CRUD, загрузка изображений)
│   ├── products/         # Страницы списка, создания, редактирования товаров
│   ├── categories/       # Категории
│   ├── brands/           # Бренды
│   ├── collections/      # Коллекции
│   ├── inventory/        # Инвентарь
│   ├── orders/           # Заказы
│   ├── labels/           # Метки
│   ├── layout.tsx
│   └── page.tsx
├── components/           # UI-компоненты (Sidebar, ProductRow, пагинация и др.)
├── lib/
│   ├── prisma.ts         # Клиент Prisma
│   ├── queue.ts          # Очередь BullMQ
│   ├── image-worker.ts   # Логика ресайза (Sharp)
│   └── constants.ts      # Лимиты и константы
├── prisma/
│   ├── schema.prisma     # Модели Product, ProductImage
│   └── prisma/dev.db     # SQLite (или путь из DATABASE_URL)
├── public/uploads/       # Загруженные изображения (original, small, medium, large)
├── docker-compose.yml
├── Dockerfile
└── next.config.js        # standalone, custom image loader
```

## Модели данных (Prisma)

- **Product** — товар: название, краткое/полное описание, цена, цена со скидкой, себестоимость, связь с изображениями.
- **ProductImage** — изображение товара: пути к оригиналу и вариантам (small, medium, large), связь с продуктом (Cascade delete).

Загрузка изображений идёт через API; ресайз выполняется асинхронно воркером через BullMQ и Sharp.

---

При возникновении проблем проверьте: наличие `.env`, выполнение `prisma generate` и `prisma db push`, доступность Redis при использовании воркера ресайза и корректность путей при запуске в Docker.
