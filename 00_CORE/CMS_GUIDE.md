# CMS_GUIDE.md — Настройка Sitepins

Полный гайд по подключению Sitepins CMS к проектам по методике. Sitepins — это Git-based headless CMS, который идеально стыкуется с Astro + Vercel workflow.

---

## Концепция: как Sitepins работает

```
Клиент в Sitepins UI → правит контент → Sitepins коммитит в GitHub → Vercel деплоит → новая версия
```

1. Клиент логинится в админку Sitepins (`admin.client-domain.ru` или `client-name.sitepins.app`)
2. Видит структурированный список контента: услуги, кейсы, статьи блога, контакты
3. Меняет, например, описание услуги
4. Жмёт **Save**
5. Sitepins делает commit в GitHub-репозиторий проекта
6. Vercel замечает commit → автодеплой
7. Через 60 секунд изменения на проде

**Ты не участвуешь в этом процессе.** Клиент управляет контентом сам.

---

## Что Sitepins может и не может

### Может (и должен)
- Редактировать тексты внутри блоков (заголовки, описания, цены)
- Загружать изображения
- Добавлять новые статьи блога
- Менять контактную информацию (телефон, email, адрес)
- Редактировать список услуг, кейсов, отзывов
- Менять SEO мета-теги (title, description) на каждой странице
- Включать/выключать featured статьи

### НЕ может (и не должен)
- Менять структуру блоков на странице (это структурная правка, через тебя/AI)
- Менять стили и цвета (это дизайн-система, через тебя)
- Добавлять новые страницы
- Менять навигацию сайта
- Редактировать код

Это правильное разделение: **клиент управляет контентом, ты управляешь архитектурой.**

---

## Как Sitepins связан с Astro Content Collections

Astro имеет встроенную систему **Content Collections** — типизированные коллекции `.md`/`.mdx` файлов в `src/content/`. Sitepins работает поверх этих коллекций:

```
src/content/
├── config.ts                    схемы коллекций (определяешь ты)
├── services/
│   ├── service-1.md             ← редактируется через Sitepins
│   ├── service-2.md
│   └── ...
├── cases/
│   ├── case-1.md
│   └── ...
├── blog/
│   ├── article-1.md             ← если блог-модуль активен
│   └── ...
└── settings/
    ├── contact.md               глобальные настройки (телефон, email)
    └── nav.md                   навигация
```

В коде Astro ты делаешь `getCollection('services')` и получаешь типизированный список. Sitepins даёт клиенту визуальный UI для редактирования этих файлов.

---

## Первичная настройка Sitepins (один раз перед первым проектом)

### Шаг 1. Регистрация

1. Открой [sitepins.com](https://sitepins.com)
2. Sign up через GitHub
3. Дай Sitepins разрешение на доступ к твоим приватным репозиториям
4. Тарифный план: проверь актуальные условия (на момент мая 2026 — открытое для open-source шаблонов, для коммерческих проектов уточни лимиты)

### Шаг 2. Установка CLI (опционально)

```bash
npm install -g @sitepins/cli
sitepins login
```

CLI даёт быстрый доступ к настройкам из терминала. Не обязательно, но удобно.

---

## Подключение Sitepins к новому проекту

### Шаг 1. Установка зависимостей в Astro-проекте

```bash
cd client-name
npm install @sitepins/sitepins
```

### Шаг 2. Создание конфига Sitepins

Создай файл `.sitepins/config.ts` в корне проекта (или используй шаблон из `02_OPTIONAL_MODULES/cms-sitepins/` библиотеки методики):

```typescript
import { defineConfig } from '@sitepins/cli';

export default defineConfig({
  branch: 'main',
  
  // Где Sitepins ищет контент
  contentApiUrlOverride: '/api/sitepins/gql',

  // Описание схем контента, которые редактируется через CMS
  schema: {
    collections: [
      {
        name: 'services',
        label: 'Услуги',
        path: 'src/content/services',
        format: 'md',
        fields: [
          { name: 'title', label: 'Название', type: 'string', required: true },
          { name: 'description', label: 'Краткое описание', type: 'string' },
          { name: 'icon', label: 'Иконка', type: 'string' },
          { name: 'price', label: 'Цена от', type: 'number' },
          { name: 'order', label: 'Порядок', type: 'number' },
          { name: 'body', label: 'Полное описание', type: 'rich-text', isBody: true },
        ],
      },
      {
        name: 'cases',
        label: 'Кейсы',
        path: 'src/content/cases',
        format: 'md',
        fields: [
          { name: 'title', label: 'Название кейса', type: 'string', required: true },
          { name: 'client', label: 'Клиент', type: 'string' },
          { name: 'image', label: 'Главное изображение', type: 'image' },
          { name: 'result', label: 'Главный результат', type: 'string' },
          { name: 'body', label: 'Полное описание', type: 'rich-text', isBody: true },
        ],
      },
      // Добавь блог если активен blog-модуль
      // Добавь authors если активен authors-модуль
    ],
    // Глобальные настройки (одиночные документы)
    documents: [
      {
        name: 'contact',
        label: 'Контактная информация',
        path: 'src/content/settings/contact.md',
        fields: [
          { name: 'phone', label: 'Телефон', type: 'string' },
          { name: 'email', label: 'Email', type: 'string' },
          { name: 'address', label: 'Адрес', type: 'string' },
          { name: 'workingHours', label: 'Часы работы', type: 'string' },
        ],
      },
    ],
  },
});
```

**Важно:** `label` пишешь по-русски — это то, что видит клиент в админке.

### Шаг 3. Подключение Sitepins к репозиторию

На sitepins.com:
1. **New Project** → выбираешь GitHub-репо клиента
2. Sitepins находит `.sitepins/config.ts` и парсит схему
3. Создаётся admin URL: `client-name.sitepins.app`
4. Протестируй: создай тестовую услугу через UI → проверь, что коммит появился в GitHub → Vercel задеплоил

### Шаг 4. Кастомный домен админки (опционально)

Если хочешь, чтобы клиент заходил на `admin.client-domain.ru`:
1. На sitepins.com → Project Settings → Custom Domain
2. Вводишь `admin.client-domain.ru`
3. У регистратора домена добавляешь CNAME:
   - Имя: `admin`
   - Значение: показывает Sitepins
4. Через 5-30 минут работает

---

## Структура контента в проекте

После настройки `src/content/` выглядит примерно так:

```
src/content/
├── config.ts                    схемы коллекций
│
├── services/
│   ├── ремонт-кровли.md
│   ├── обустройство-фундамента.md
│   └── ...
│
├── cases/
│   ├── дом-в-подмосковье.md
│   └── ...
│
├── blog/                        если blog-модуль
│   ├── как-выбрать-фундамент.md
│   └── ...
│
├── authors/                     если authors-модуль
│   ├── ivan-petrov.md
│   └── ...
│
└── settings/
    ├── contact.md
    └── footer.md
```

В `src/content/services/ремонт-кровли.md`:

```markdown
---
title: Ремонт кровли
description: Полный комплекс работ по ремонту кровли любой сложности
icon: roof
price: 1500
order: 1
---

Подробное описание услуги, которое редактируется клиентом через Sitepins.
Может содержать **markdown форматирование**, [ссылки](/contact) и списки.
```

В коде Astro подтягиваешь:

```astro
---
import { getCollection } from 'astro:content';

const services = await getCollection('services');
const sortedServices = services.sort((a, b) => a.data.order - b.data.order);
---

{sortedServices.map(service => (
  <article>
    <h3>{service.data.title}</h3>
    <p>{service.data.description}</p>
  </article>
))}
```

При следующем редакте через Sitepins → автодеплой → клиент видит изменения.

---

## Передача доступа клиенту

### После настройки Sitepins:

1. Создаёшь учётную запись клиента в Sitepins
   - На sitepins.com → Project → Members → Invite
   - Email клиента
   - Роль: **Editor** (может редактировать, не может удалять структуру)
2. Клиент получает email-приглашение, регистрируется
3. Заходит на `admin.client-domain.ru` (или `client-name.sitepins.app`)
4. Видит свою рабочую панель

### Обучение клиента (15-30 минут)

Я рекомендую **записать Loom-видео** один раз и переиспользовать для всех клиентов:

```
1. Введение: что такое Sitepins, как работает
2. Логин в админку
3. Как редактировать услуги (пошагово, на примере)
4. Как редактировать контактную информацию
5. Как добавить новую статью в блог (если активен)
6. Что НЕ редактируется через Sitepins (структура страниц, дизайн)
7. Что делать если что-то пошло не так (написать тебе)
```

После этого присылаешь клиенту:
- Ссылку на админку
- Логин/пароль
- Ссылку на Loom-видео
- Свой контакт для проблем

---

## Workflow: ты vs клиент

После сдачи проекта:

| Действие | Кто делает |
|---|---|
| Поменять текст услуги | Клиент через Sitepins |
| Добавить новый кейс | Клиент через Sitepins |
| Добавить новую статью в блог | Клиент через Sitepins |
| Поменять цены | Клиент через Sitepins |
| Поменять контактный телефон | Клиент через Sitepins |
| **Добавить новый блок на страницу** | Ты через AI |
| **Изменить структуру страницы** | Ты через AI |
| **Поменять цвета и шрифты** | Ты через AI |
| **Добавить новую страницу** | Ты через AI |
| **Поменять навигацию** | Ты через AI |
| **Подключить новый функционал** | Ты через AI |

Это разделение даёт клиенту автономию по контенту и тебе контроль над структурой.

---

## Опциональные настройки

### Black-list полей (что не должен видеть клиент)

В `config.ts` можно скрыть некоторые поля, которые техничны:

```typescript
{
  name: 'order',
  label: 'Порядок',
  type: 'number',
  ui: { hidden: true },  // не показывается клиенту
}
```

### Превью изменений до публикации

Sitepins может работать в режиме **draft → review → publish** (через пул-реквесты):

```typescript
export default defineConfig({
  branch: 'main',
  workflow: {
    drafts: true,           // клиент сохраняет драфт
    requireReview: true,    // ты ревьюишь перед публикацией
  },
});
```

Это полезно для крупных клиентов, которые хотят согласовывать изменения перед уходом в прод.

### Локализация

Если нужно мультиязычность контента — Sitepins поддерживает через `i18n` в схеме. Для русскоязычных проектов в начале не нужно, можно добавить позже.

---

## Стоимость Sitepins

**Гипотеза, требует проверки на момент твоей работы.** Базовое использование на open-source шаблонах (типа Astroplate) бесплатное. Для коммерческих проектов узнай актуальные тарифы на sitepins.com — они могут варьироваться.

Альтернативы, если Sitepins не подойдёт:
- **Decap CMS** (бесплатный, open source) — настраивается дольше, UI проще
- **TinaCMS** ($29+/месяц) — visual editing с превью прямо в браузере
- **Keystatic** (бесплатный, open source) — современная альтернатива

В библиотеке методики `02_OPTIONAL_MODULES/cms-sitepins/MODULE.md` лежит подробная инструкция. Если в будущем понадобится Decap или Tina — добавляются как новые модули.

---

## Troubleshooting

### Sitepins не видит репозиторий

1. Проверь, что в Sitepins даны разрешения на твой GitHub
2. На GitHub → Settings → Applications → Sitepins → Repository access
3. Добавь нужный репо в список

### Контент не сохраняется

1. Проверь, что в Sitepins настроен правильный branch (обычно `main`)
2. Проверь права записи Sitepins в репозиторий
3. Открой commit history GitHub → должны появляться коммиты от Sitepins после Save

### Клиент не видит свежие изменения

1. Проверь Vercel deployments — должен быть свежий после Save в Sitepins
2. Если деплой прошёл, очисти кэш браузера
3. Подожди 5-10 минут — edge кэш Vercel может задержаться

### Клиент случайно удалил контент

Sitepins хранит всё в Git → восстановление через `git revert`:

```bash
git log src/content/services/  # найди нужный коммит
git revert <commit-hash>
git push
```

---

## Чек-лист перед сдачей с CMS

- [ ] Sitepins подключён к репозиторию
- [ ] Все нужные коллекции описаны в `.sitepins/config.ts` с русскими labels
- [ ] Тестовое редактирование прошло (Save → commit → Vercel deploy → видно на сайте)
- [ ] Кастомный домен админки настроен (если используется)
- [ ] Клиент создан как Editor
- [ ] Loom-видео обучения записано или ссылка готова
- [ ] Передан логин/пароль клиенту
- [ ] Клиент протестировал, может зайти и сделать тестовую правку

---

*АМС | CMS Guide | v1.0 | Май 2026*
