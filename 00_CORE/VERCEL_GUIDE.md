# VERCEL_GUIDE.md — Работа с Vercel

Полный гайд по деплою клиентских проектов на Vercel. Для маркетолога без опыта в DevOps.

---

## Концепция: как Vercel работает

В Vercel **нет** «загрузить файлы» как в Tilda. Работает иначе:

```
Локально → GitHub репо → Vercel автоматически деплоит
```

1. Ты пишешь код локально (с помощью AI)
2. Делаешь `git commit` + `git push` в GitHub
3. Vercel слушает GitHub, замечает push
4. Запускает build → деплоит новую версию
5. Через 30-90 секунд новая версия на проде

**Ты ничего не загружаешь руками на Vercel.** Никогда.

---

## Первичная настройка (один раз перед первым проектом)

### Шаг 1. Регистрация Vercel Pro

1. Регистрируйся на vercel.com через GitHub-аккаунт
2. Сразу подключи **Pro план** (~$20/месяц). Hobby план запрещает коммерческое использование.
3. На Pro плане можешь хостить много клиентских проектов на одном аккаунте.

### Шаг 2. Установка Vercel CLI (опционально, рекомендую)

```bash
npm install -g vercel
vercel login
# Выбираешь Continue with GitHub
```

CLI пригодится для быстрого деплоя из терминала и просмотра логов.

---

## Деплой первого клиентского проекта

### Шаг 1. Подготовка локального проекта

После сборки сайта локально (через AI):

```bash
cd client-name

# Проверь что всё работает
npm install
npm run build
npm run preview
# открой http://localhost:4321 — проверь что собирается
```

### Шаг 2. Создание GitHub-репозитория

На github.com:
1. New repository
2. Имя по конвенции: `client-[client-slug]-2026`
3. Private
4. **НЕ** добавляй README, .gitignore (они уже в проекте)
5. Create repository

GitHub покажет инструкцию подключения. Локально:

```bash
git init
git add .
git commit -m "init: site v1.0"
git remote add origin git@github.com:YOUR_USERNAME/client-name-2026.git
git branch -M main
git push -u origin main
```

### Шаг 3. Подключение в Vercel

1. На vercel.com → **Add New** → **Project**
2. Выбираешь **Import Git Repository** → находишь `client-name-2026`
3. Vercel автоматически детектит Astro:
   - Framework Preset: **Astro**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. **Environment Variables** оставь пустыми пока (добавишь позже если нужно)
5. Жмёшь **Deploy**

Через 1-2 минуты сайт живёт на `client-name-2026.vercel.app` (preview-URL).

### Шаг 4. Подключение домена клиента

После того как клиент купил домен у регистратора (REG.RU, RU-CENTER, и т.д.):

1. В Vercel → твой проект → **Settings** → **Domains**
2. **Add Domain** → вводишь `client-domain.ru`
3. Vercel показывает DNS-записи, которые нужно добавить:
   - Тип `A`, имя `@`, значение `76.76.21.21`
   - Тип `CNAME`, имя `www`, значение `cname.vercel-dns.com`
4. Идёшь к регистратору, в управление DNS, добавляешь эти записи
5. Через 5-30 минут (иногда до часа) Vercel автоматически активирует домен и SSL

**SSL-сертификат** автоматически выпускается Let's Encrypt — без настроек, бесплатно, обновляется сам.

### Шаг 5. Проверка

После активации домена:
- Открой `https://client-domain.ru` — должен открыться твой сайт
- Открой `https://www.client-domain.ru` — должно автоматически редиректить на без www (или наоборот, зависит от настроек в `vercel.json`)
- Проверь SSL — должен быть зелёный замок в браузере

---

## Workflow последующих правок

После первичной настройки правки идут так:

### Локально

```bash
cd client-name

# Открываешь в Claude Code или другом AI
# Просишь правку: "Поправь блок 03 на главной"
# AI правит файл src/pages/_home/03-Method.astro

# Проверяешь локально
npm run dev
# смотришь на http://localhost:4321

# Если ОК — коммит и пуш
git add .
git commit -m "fix: home method block headline"
git push
```

### На Vercel автоматически

1. Vercel замечает push в `main`
2. Запускает build
3. Через 30-90 секунд новая версия на проде
4. Получаешь email-уведомление о завершённом деплое (можно отключить)

**Никаких ручных действий с твоей стороны.**

---

## Превью-деплои для согласования с клиентом

Если хочешь показать клиенту правки **до** того как они уйдут в прод:

```bash
# Создаёшь ветку
git checkout -b feature/new-hero

# Делаешь правки, коммитишь
git add .
git commit -m "feat: new hero design"
git push -u origin feature/new-hero
```

Vercel автоматически создаст preview-URL для этой ветки:
```
client-name-2026-git-feature-new-hero-yourusername.vercel.app
```

Отправляешь клиенту → клиент смотрит → одобряет → ты мерджишь в main:

```bash
git checkout main
git merge feature/new-hero
git push
```

После мерджа в main — автоматический деплой на прод.

---

## Откат к старой версии

Если новый деплой что-то сломал:

1. На vercel.com → Project → **Deployments**
2. Находишь предыдущий рабочий деплой (помечен зелёным)
3. Клик `...` → **Promote to Production**
4. Через 5 секунд старая версия снова на проде

Не теряешь время на переписывание кода. Можно спокойно разобраться с проблемой и пушить новый фикс.

---

## Полезные настройки в Vercel UI

### Settings → General

- **Project Name** — имя проекта в Vercel (можно менять)
- **Framework Preset** — должен быть Astro (детектится автоматически)
- **Root Directory** — оставляй `./` (если проект в корне репо)

### Settings → Environment Variables

Сюда кладёшь секреты, которые **не** должны попадать в код:
- API ключи (например, для форм через Formspree)
- Sitepins API tokens
- Любые секреты

В коде используешь через `import.meta.env.VARIABLE_NAME`.

### Settings → Analytics

Включи **Vercel Web Analytics** (бесплатно):
- Pageviews, top pages, referrers
- Real user metrics
- Не заменяет Метрику, но хорошее дополнение

### Settings → Speed Insights

Включи **Speed Insights** (входит в Pro):
- Реальные Core Web Vitals от живых посетителей
- Видно, где тормозит у настоящих пользователей
- Помогает целиться в Lighthouse 90+

### Settings → Domains

Управление доменами проекта.

### Settings → Git

- **Production Branch** — обычно `main`
- **Ignored Build Step** — для оптимизации (можно настроить, чтобы не деплоить если изменился только README)

---

## vercel.json — что внутри

В проекте есть `vercel.json` со security headers. Базовая конфигурация:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
      ]
    }
  ]
}
```

Это настраивает базовую защиту. **CSP (Content-Security-Policy) можно добавить позже**, после того как всё работает — он требует ручной настройки под конкретные внешние домены (Метрика, формы).

Редиректы тоже настраиваются здесь:
```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

---

## Цена и лимиты Pro плана

**~$20/месяц** включает:
- Неограниченные деплои
- 1TB bandwidth/месяц (на одного юзера, для статичных сайтов хватает с большим запасом)
- Custom domains безлимитно
- SSL автоматически
- Команда (можешь добавить подрядчиков)
- Web Analytics базовая
- Speed Insights базовый
- Email support

Что не входит и платится сверху (если понадобится):
- Дополнительный bandwidth (если перешагнул 1TB)
- Edge functions (для серверной логики)
- Image Optimization (но Astro делает свою через `<Image />`)

**Для твоей модели (статичные B2B-сайты)** $20/месяц покроют всё. Если за месяц приходит 100 клиентских проектов — все хостятся на одном Pro аккаунте.

---

## Troubleshooting

### Build падает с ошибкой

1. Открой Vercel → Project → Deployments → клик на failed build
2. Открой **Build Logs**
3. Найди строку с ошибкой
4. Скопируй ошибку, отправь AI: «Build падает с этой ошибкой [error]. Поправь.»
5. AI правит → push → новый build

### Домен не подключается

1. Проверь DNS-записи у регистратора через `dig client-domain.ru` (или nslookup-инструменты онлайн)
2. Должны быть прописаны записи, которые показал Vercel
3. DNS-обновления могут идти до 48 часов (но обычно 5-30 минут)

### SSL не активируется

1. Проверь, что DNS уже работает (предыдущий пункт)
2. В Vercel → Domains → клик `Refresh` напротив домена
3. Если через час не работает — пишешь в Vercel support

### Деплой не запускается после push

1. Проверь, что push прошёл: `git log origin/main` должен показывать твой коммит
2. На Vercel → Project → Deployments — должен быть новый Building/Ready
3. Если нет — Project → Settings → Git → проверь, что подключён правильный репо

### Сайт показывает старую версию

1. Очисти кэш браузера (Ctrl+Shift+R / Cmd+Shift+R)
2. Если не помогает — Vercel может показывать кэшированную версию edge-кэша (5-15 минут самообновление)
3. Можно форсировать: на Vercel → Project → клик `...` → **Redeploy** → **Use existing Build Cache: OFF**

---

## Безопасность

1. **Не публикуй секреты в git.** API-ключи только в `.env.local` (в gitignore) или в Vercel Environment Variables.
2. **Регулярно ротируй access tokens** GitHub и Vercel (раз в год).
3. **Включи 2FA** на GitHub и Vercel (обязательно для коммерческих аккаунтов).
4. **Приватные репозитории** клиентов — не делай public, даже если код «не секретный».

---

## Передача проекта клиенту

Когда сдаёшь сайт, передаёшь клиенту:

| Что | Как передаёшь |
|---|---|
| Домен | Если на твоём аккаунте регистратора — передай через смену контактных данных. Если на клиенте — у него уже всё |
| Vercel доступ | Опционально: добавляешь клиента в Project → Settings → Members. Или оставляешь у себя как managed |
| GitHub доступ | Добавляешь клиента в Settings → Manage access (read-only) |
| Sitepins | Передаёшь логин/пароль admin доступа |
| Метрика | Делаешь клиента совладельцем счётчика |

**Рекомендую модель «managed».** Сайт остаётся под твоим управлением, клиент платит подписку на сопровождение или платит разово за каждое изменение. Это снимает с клиента сложность владения и даёт тебе предсказуемый доход.

---

*АМС | Vercel Guide | v1.0 | Май 2026*
