# ASTRO_BUILD.md

**Версия:** 2.1
**Дата:** 2026-05-15
**Автор:** Андрей Чирков
**Стек:** Astro (latest) + Tailwind CSS v4 + TypeScript strict + React 18 islands + pnpm
**Назначение:** инструкция ИИ-агента по технической сборке B2B-сайтов на Astro.

---

## 0. Что это и как читать

Этот документ читается ИИ **в каждом новом чате при сборке блоков и страниц**. Покрывает композицию, типографику, архитектуру блоков, интерактив, mobile, SEO базовое, A11y, грабли.

**Не покрывает** (есть отдельные документы):

| Тема | Документ |
|---|---|
| Скаффолд, .env, GitHub, Vercel adapter, базовые компоненты | `ASTRO_SETUP.md` |
| Build, deploy, GSC, Я.Вебмастер, аналитика, performance | `ASTRO_DEPLOY.md` |
| Формы (Telegram, email, валидация, iOS-modal) | `ASTRO_FORMS.md` |
| Политика, cookies, согласие на ПД, 152-ФЗ | `ASTRO_LEGAL_RU.md` |

**Что подгружается в чат всегда вместе с этим файлом:**

1. `SITE_ARCHITECTURE.md` проекта (обязательно)
2. `DESIGN_SYSTEM.md` проекта (обязательно)
3. `PAGE_*.md` бриф конкретной страницы (рекомендуется, если есть)

Без `SITE_ARCHITECTURE.md` и `DESIGN_SYSTEM.md` сборка не начинается. Жёсткое правило.

---

## 1. Pre-flight check (обязательный отчёт ИИ)

Выводится в самом начале каждой новой сессии **до любых других действий**.

```
ASTRO_BUILD Pre-flight check

✓ Документ прочитан полностью
✓ Стек подтверждён: Astro + Tailwind v4 + TS strict + React islands + pnpm
✓ Подгружены документы проекта:
  - SITE_ARCHITECTURE.md: [найден / не найден]
  - DESIGN_SYSTEM.md:     [найден / не найден]
  - PAGE_*.md:            [N брифов найдено / отсутствуют]
✓ Стартовый шаблон: [клонирован / собран по SETUP / не клонирован]

→ Что делаем сейчас:
  - Какая страница: [/, /about и т.д.]
  - Какой блок: [01-Hero, 03-Method ИЛИ "вся страница"]
  - Источник правды: [PAGE_*.md / устное ТЗ / SITE_ARCHITECTURE]

→ Жду подтверждения от пользователя перед написанием кода.
```

Без Pre-flight check код не пишется.

---

## 2. ТОП-7 граблей из практики (читать первыми)

Эти грабли реально случались в первых проектах. Они здесь, чтобы ИИ увидел их даже если не дочитает файл.

### Грабля 1. Никаких shared-style файлов на уровне страницы

**Запрещено:**

- `_pageName/00-*SharedStyles.astro`
- `_pageName/styles.astro`, `_pageName/shared.css`
- Любые общие style-файлы для блоков одной страницы

**Почему запрещено:** ломает изоляцию блоков. Правка в одном начинает трогать 9. ИИ хочет это делать как DRY-оптимизацию — рефлекс, который нужно подавить.

**Что вместо:** повторяющиеся CSS-строки между блоками одной страницы — норма, не оптимизировать. Если паттерн повторяется на **всех** страницах — выносить в `src/styles/global.css` как универсальный класс с префиксом проекта (`.vn-section-h2`, `.vn-textlink`, `.vn-accent-line`).

### Грабля 2. Все цвета через CSS-переменные, никакого hex локально

**Запрещено:**

- `style="color: #22C55E;"` в шаблоне
- `color: #fff;` в `<style>` блока
- `/* #0F2547 deep navy */` в комментариях
- Любой hex вне `DESIGN_SYSTEM.md` и `@theme` в `global.css`

**Что вместо:** все цвета через `var(--color-*)`. Нужен новый акцент (success / danger / warning) — добавлять токеном в `DESIGN_SYSTEM.md`, не вписывать локально. RGBA с прозрачностью — через `color-mix(in srgb, var(--color-accent) 50%, transparent)` или отдельный токен `--color-accent-soft`.

### Грабля 3. Никаких плейсхолдеров в production-файлах

**Запрещено в `src/**` и `public/**`:**

- `[DOMAIN]`, `[CLIENT]`, `[TODO]`, `[SLUG]`
- `<!-- TODO: ... -->` без явной задачи и срока
- `https://example.com` в `astro.config.mjs` или `constants.ts`
- Битые ссылки на несуществующие файлы

**Что вместо:** все плейсхолдеры заменены реальными значениями или вынесены в `.env`. Pre-deploy scan обязателен (раздел 15).

### Грабля 4. `.env.example` всегда пустой шаблон

**Запрещено:**
```env
TELEGRAM_BOT_TOKEN=1234567890:AAxxxxxxxxxx
```

**Правильно:**
```env
TELEGRAM_BOT_TOKEN=
```

`.env.example` **никогда не копируется из `.env`**. Каждая переменная в формате `KEY=` со знаком равно и пустотой после.

### Грабля 5. Ссылки только на существующие файлы

Перед закрытием блока проверять: `<link rel="icon" href="/favicon.svg">` — файл есть в `public/`? `<meta property="og:image" content="...">` — изображение есть? `<link rel="preload" href="/fonts/...">` — шрифт есть?

**OG-image паттерн:** не задавать дефолт на несуществующий файл, делать опциональным:

```astro
{ogImage && <meta property="og:image" content={ogImage} />}
```

### Грабля 6. iOS Safari ломает modal с формой

Симптомы: скачет скролл при открытии, input при фокусе зумит, body остался залочен после закрытия.

Обязательно (детально в разделе 9.1):

- Кастомный body-lock через `position: fixed` + сохранение `scrollY`
- `font-size: 16px` на все input (предотвращает zoom)
- `-webkit-overflow-scrolling: touch` на скроллируемых контейнерах

### Грабля 7. Width 100% + padding ломает WebKit

Симптом: на iPhone горизонтальный overflow. В Chrome DevTools всё ок.

Причина: CTA-кнопки `width: 100%` без `box-sizing: border-box` вместе с padding становятся шире viewport.

Фикс глобально в `global.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
```

В Tailwind v4 включено через preflight по умолчанию, но **проверять руками**.

---

## 3. Режим работы

### 3.1. Поблочная сборка

Один блок = один файл = один коммит. Не предложение, правило.

**Naming:** `NN-PascalCaseName.astro`. Порядок соответствует `PAGE_*.md` или `SITE_ARCHITECTURE.md`.

**Изоляция:** блок `02-Problem.astro` не импортирует `03-Method.astro`. Общая UI выносится в `src/components/shared/`.

**Self-contained:** свой `<section>` wrapper, свои классы, своя копия. Не требует внешнего state для рендера.

### 3.2. Шапка блока (обязательная)

Перед написанием кода каждого блока ИИ выводит шапку **в чат, не в код**:

```
Блок к сборке

Страница:                  /voennaya-ipoteka-krasnodar
Блок:                      04-Method
Цель блока:                показать 4-шаговый метод, отстройка от конкурентов
Композиционная структура:  4 / 8 на 12-col grid (метка слева, шаги справа)
                           ИЛИ Flexbox / auto-fit / узкая колонка — см. § 5.2
Выравнивание контента:     по левому краю (editorial default)
                           центрирование — только если попадает в исключения § 5.3
Trust-сигналы:             нумерация шагов, конкретные сроки на каждом
Источник копии:            PAGE_KRASNODAR.md раздел 4 / устное ТЗ от пользователя
Связь с позиционированием: пункт 3 из POSITIONING_FINAL
```

Пользователь подтверждает или правит до того, как ИИ начнёт писать `.astro`. Без подтверждения код не пишется.

### 3.3. Два прогона сборки

**Прогон 1 (assembly):** ИИ собирает все блоки страницы подряд по списку. Минимально жизнеспособная версия. В начале — шапка по странице целиком, не по каждому блоку.

**Прогон 2 (refinement):** пользователь идёт по блокам по одному. На каждом — шапка обязательна. Композиция меняется, усиливается, переписываются формулировки.

### 3.4. Протокол правок

Когда пользователь говорит «исправь блок 3 на главной»:

1. Открыть **ровно один файл** (`src/pages/_home/03-*.astro`)
2. Не трогать соседние блоки
3. Не рефакторить, не переименовывать без явной просьбы
4. После правки явно сказать: «изменён файл `pages/_home/03-Method.astro`. Остальные не тронуты.»

---

## 4. Типографика

### 4.1. Шкала (Editorial B2B Premium)

| Уровень | Desktop | Mobile | Weight | Применение |
|---|---|---|---|---|
| H1 | 52 | 36 | 800 Extra Bold | Hero, главный заголовок. Один на страницу |
| H2 | 40 | 28 | 700 Bold | Заголовок каждой секции |
| H3 | 28 | 22 | 600 Semibold | Подзаголовки в секциях, заголовки карточек |
| H4 | 20 | 18 | 600 Semibold | Мелкие заголовки, лейблы блоков |
| Subtitle / Lead | 17 | 16 | 400 Regular | Текст под H1 / H2 |
| Body | 16 | 16 | 400 Regular | Основной текст |
| Small | 14 | 14 | 400 Regular | Подписи, второстепенный текст |
| Caption / Eyebrow | 13 | 13 | 500 Medium | Метки над заголовками, юр. текст |

**Потолок H1 = 52px.** Не превышать.

### 4.2. Line-height

H1, H2 → 1.1-1.15. H3, H4 → 1.2. Subtitle, Body → 1.5-1.6. Caption → 1.4.

### 4.3. Адаптация под шрифт

Размеры выше — для нейтрального гротеска (Inter, Manrope, Geist).

- Serif (Playfair, EB Garamond) → уменьшать H1 на 4-6px, увеличивать line-height на 10%
- Экспрессивный sans (Space Grotesk, IBM Plex Sans) → размеры те же, tracking H1/H2 на -0.02em
- Финальные значения подтверждать в `DESIGN_SYSTEM.md` проекта

### 4.4. Text-wrap (защита от висячих строк)

В `global.css` обязательно:

```css
h1, h2, h3, h4 { text-wrap: balance; }
p, li, blockquote { text-wrap: pretty; }
```

Если в стартовом шаблоне этого нет — добавить руками в первую очередь.

---

## 5. Композиция

Композиция в проекте строится на **двух уровнях**, которые играют разные роли.

| Уровень | Что это | Жёсткость |
|---|---|---|
| **Container Discipline** (§ 5.1) | Единый `.site-container` с фиксированным `max-width` и `padding-inline` | **Жёсткий контракт.** Применяется ВСЕГДА на всех блоках |
| **Composition Flexibility** (§ 5.2) | Выбор инструмента внутри контейнера: 12-col grid, flexbox, auto-fit, узкая колонка | **Гибко.** Выбирается под задачу блока |

Этот подход решает разные задачи раздельно: контейнер обеспечивает «фрейм» и защиту от расползания контента на больших мониторах, композиция отвечает за внутреннюю структуру блока. Их **нельзя путать**.

### 5.1. Container Discipline (жёсткий контракт)

Каждая контентная секция использует **единый `.site-container`**. Это обеспечивает фрейм страницы, согласованную ширину контента, левую и правую линию, защиту от расползания на больших мониторах (4K, 27"+).

```css
.site-container {
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding-inline: 48px;
}

@media (max-width: 1023px) { .site-container { padding-inline: 32px; } }
@media (max-width: 767px)  { .site-container { padding-inline: 20px; } }
```

**Правила применения (жёсткие):**

- ВСЕ контентные блоки оборачиваются в `.site-container`
- `max-width: 1360px` не превышать — это потолок «фрейма»
- Полноширинные элементы (фон секции, изображение во всю ширину viewport) реализуются на уровне `<section style="background...">` или wrap-элемента, но **сам контент** внутри ВСЕГДА в `.site-container`
- Никаких импровизаций с разными контейнерами на одной странице

**Пример типового блока:**

```astro
<section class="vn-bg-secondary">
  <div class="site-container vn-section-padding">
    <!-- Контент блока (текст, карточки, изображение и т.д.) -->
  </div>
</section>
```

Без `.site-container` блок не пишется — это базовая обёртка, такая же обязательная как `<section>`.

### 5.2. Composition (гибкий выбор инструмента)

Внутри `.site-container` структура выбирается **под смысл блока**. Это про композиционный язык — здесь нет жёсткого правила «всё в 12-col grid». 12-col это один из инструментов, не обязательный.

**Доступные инструменты:**

| Инструмент | Когда применять | CSS |
|---|---|---|
| **12-col grid** (`.grid-12`) | Editorial layouts с асимметрией: заголовок-метка + контент (4+8), две равные карточки (6+6), сложные пропорции из 12. Детали в § 5.4 | `grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: 32px` |
| **CSS Grid auto-fit** | Адаптивные сетки карточек, где число колонок зависит от ширины: услуги, кейсы, преимущества | `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px` |
| **Flexbox горизонтальный** | Линейные раскладки: trust-row, CTA-row, навигация, breadcrumbs, теги | `display: flex; align-items: center; gap: 24px` |
| **Flexbox вертикальный** | Hero с центрированным или прижатым текстом, простые секции с текстом + CTA, формы | `display: flex; flex-direction: column; gap: 24px` |
| **Узкая колонка** | Лонг-риды, статьи блога, текстовые блоки с большим количеством абзацев | `max-width: 65ch` (с обоснованием выравнивания, см. § 5.3) |
| **CSS Subgrid** | Карточки с согласованной типографикой по строкам (заголовок выровнен с заголовком, описание с описанием) | `grid-template-rows: subgrid` |

ИИ выбирает один инструмент под задачу блока и фиксирует выбор в «Шапке блока» (§ 3.2). Не натягивать 12-col на простой Hero. Не делать узкую колонку для блока с карточками. Не использовать flexbox горизонтальный для editorial-секций с асимметрией.

**Что запрещено:**

- `max-width: 720px` или `max-w-prose` как корень секции на desktop (вместо `.site-container`)
- `container-narrow` или подобные узкие обёртки на уровне `<section>`
- Импровизация через центрированный `flex-column` без `.site-container`
- Игнорирование `.site-container` при использовании 12-col grid — `.grid-12` всегда живёт ВНУТРИ `.site-container`

### 5.3. Editorial Alignment Rules (правила выравнивания)

По умолчанию контент выравнивается **по левому краю контейнера**. Это создаёт editorial-ощущение и работает на узнаваемость B2B Premium.

**Структура заголовка секции (по левому краю):**

- `eyebrow` (uppercase 13px) — метка категории секции
- `H2` (40px Desktop / 28px Mobile) — заголовок секции
- `subtitle` (17px Desktop / 16px Mobile) — подзаголовок

Все три элемента выравниваются по левому краю первой grid-колонки или просто по `.site-container`.

**Центрирование контента допустимо только в случаях:**

| Кейс | Почему оправдано |
|---|---|
| Финальный CTA на тёмной секции | Фокус на призыв, симметрия усиливает закрытие |
| Stats / Trust секция с 3-4 цифрами | Симметрия 3-4 равных элементов читается естественно |
| Страницы `/404`, `/thanks/` | Специальные случаи: одно сообщение + CTA |
| Hero одностраничного лендинга | Когда нужна максимальная драма и фокус на единственное предложение |

**Запрещено центрировать:**

- H2 рядовых секций (Проблема, Метод, Услуги, Кейсы, Отзывы, FAQ)
- Body-абзацы (всегда левое выравнивание для читаемости)
- Карточки-листинги (сетка карточек идёт от левого края)
- Длинные тексты на странице услуги или статьи блога

Центрирование без обоснования — самая частая ошибка, превращающая B2B-сайт в «как все». Каждое центрирование требует объяснения, попадает ли оно в один из 4 разрешённых кейсов выше.

### 5.4. 12-col Composition Gate (когда выбран `.grid-12`)

Когда из инструментов § 5.2 выбран **12-col grid** — фиксируется один из 8 паттернов. Это **не обязательная схема для всех блоков**, а словарь для тех блоков, где 12-col уместна.

| Паттерн | Колонки | Когда |
|---|---|---|
| Full 12 | `1 / 13` | Hero-заголовок, широкий визуал, финальный CTA |
| 6 / 6 | `1 / 7` + `7 / 13` | Hero split, текст + изображение |
| 4 / 8 | `1 / 5` + `5 / 13` | Заголовок секции слева + контент справа (editorial-метод) |
| 3 / 9 | `1 / 4` + `4 / 13` | Метка + широкий список |
| 5 / 7 | `1 / 6` + `6 / 13` | Усиленная левая колонка + контент справа |
| 7 / 5 | `1 / 8` + `8 / 13` | Широкий контент + факты / aside |
| 3 / 7 / 2 | `1 / 4` + `4 / 11` + `11 / 13` | Метка + контент + метаданные |
| 2 × 6 | `1 / 7` + `7 / 13` | Две равные карточки в строке |

**Базовый CSS для 12-col grid:**

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 32px;
}

@media (max-width: 1023px) { .grid-12 > * { grid-column: 1 / -1; } }
```

`.grid-12` всегда живёт **внутри** `.site-container`. Не использовать `.grid-12` как замену контейнеру.

Если ни один из 8 паттернов не подходит — это сигнал, что 12-col тут не нужна. Возвращайся к § 5.2 и выбирай другой инструмент (auto-fit, flexbox, узкая колонка).

### 5.5. B2B Premium composition defaults

Анти-AI-slop чек-лист. Без него ИИ скатывается в generic SaaS-эстетику.

**Иерархия через размер и воздух, не через декор.**

- H1 значимо доминирует над H2 на странице
- Между секциями 80-120px вертикали на desktop, 56-72px на mobile
- Внутри секции — gap по grid / flex и осмысленные `margin-block`, не случайные

**Один акцентный цвет.** На странице 3-5 точек применения максимум. Не два разных акцента, не градиенты по тексту. Tertiary / soft варианты допустимы (`--color-accent-soft`) — это та же гамма.

**Trust-сигналы вместо обещаний.**

- Цифры > прилагательных. «3 месяца» > «быстро»
- Логотипы клиентов > «топовая команда»
- Имена и должности > безличные отзывы
- Конкретные годы и сроки > «многолетний опыт»

**Иконки.** Lucide stroke-only, weight 1.5. Без filled, без эмодзи, без цветных иллюстраций как иконок. Размеры 16 / 20 / 24 / 32 / 40 / 56. Цвет stroke = `var(--color-text-primary)` или `var(--color-accent)`.

**Карточки.** По умолчанию: тонкий `border: 1px solid var(--color-border-light)` + subtle hover-lift. Теней по умолчанию нет. Появляются в `:hover` или на тёмном фоне. Мягкая тень допустима по ситуации (floating элемент): `0 8px 28px rgba(0,0,0,0.08)`. Тяжёлые цветные тени, многослойные drop-shadow, неоновое свечение — запрещены.

**Чередование фонов функциональное, не декоративное.** Hero (тёмный или светлый по бренду) → секция (белый) → секция (светло-серый) → проблема (тёмный, опционально) → метод (белый) → кейсы (светло-серый) → финальный CTA (тёмный) → footer (самый тёмный).

**Заголовки секций по левому краю** (editorial-стиль, см. § 5.3). Структура: `eyebrow` (uppercase, 13px) + H2 (40px) + subtitle (17px). Центрировать H2 рядовых секций запрещено.

**Анимации.** Один точечный motion-акцент на блок (плавное появление цифр, scroll-reveal в Method, лёгкий parallax в Hero). Не везде. См. раздел 11.

**Запрещено по умолчанию:**

- Gradient text, glassmorphism, neon-эффекты
- Эмодзи как декоративные иконки в B2B
- Многоцветные палитры (рейнбоу, более одного акцента)
- Карточки с цветной тенью под низом (Stripe-эффект — не B2B Premium)
- Заглавные буквы в декоративных целях (uppercase только в eyebrow и tag)
- Lottie без явного запроса пользователя
- Параллакс на всю секцию

---

## 6. Архитектура блоков

### 6.1. Колокация по страницам

Каждая страница — отдельная папка с подчёркиванием в начале имени. Подчёркивание исключает папку из роутинга Astro (нативная фича).

```
src/pages/
├── index.astro              маршрут /
├── _home/
│   ├── PAGE_HOME.md         бриф (если есть)
│   ├── 01-Hero.astro
│   ├── 02-Problem.astro
│   ├── 03-Method.astro
│   ├── 04-Cases.astro
│   └── 05-FAQ.astro
│
├── about.astro              маршрут /about
└── _about/
    ├── PAGE_ABOUT.md
    └── 01-Hero.astro ...
```

**Запрещено:** класть блоки страниц в `src/components/sections/`, использовать Content Collections для one-off секций, объединять блоки одной страницы в один файл.

### 6.2. Тонкий route-файл

`src/pages/index.astro` — только импорты и сборка. Никакой копии, логики, стилей.

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from './_home/01-Hero.astro';
import Problem from './_home/02-Problem.astro';
import Method from './_home/03-Method.astro';
import Cases from './_home/04-Cases.astro';
import FAQ from './_home/05-FAQ.astro';
---

<BaseLayout title="..." description="...">
  <Hero />
  <Problem />
  <Method />
  <Cases />
  <FAQ />
</BaseLayout>
```

### 6.3. Дефолтный порядок секций B2B-страницы

Если в `PAGE_*.md` или `SITE_ARCHITECTURE.md` не указано иначе:

| # | Секция | Обязательно в блоке |
|---|---|---|
| 1 | Hero | H1, подзаголовок, Primary CTA, 1-2 trust-элемента |
| 2 | Stats / Trust | 3-4 числа с подписями, единая визуальная подача |
| 3 | Problem | резонанс с болью ЦА, 3-4 пункта боли |
| 4 | Services / Method | 3-5 услуг или 3-5 шагов с описанием |
| 5 | Features / Why us | 3-6 преимуществ, конкретика не штампы |
| 6 | Cases | 3-6 кейсов: клиент / индустрия / результат с цифрой |
| 7 | Testimonials | 3+ реальных отзыва: имя, должность, компания, текст |
| 8 | FAQ | 5-10 вопросов + JSON-LD FAQPage |
| 9 | CTA final | заголовок-призыв + кнопка / форма + альт. канал |
| 10 | Contact (на /contact) | форма, контакты, карта, часы работы |

Не пропускать CTA и FAQ. Не менять порядок без явного указания.

### 6.4. Спецификация Hero (особый случай)

Hero — самый ответственный блок. Минимум:

- `<h1>` 4-7 слов с УТП
- Подзаголовок 1-2 строки расшифровки
- Primary CTA (кнопка или форма)
- Trust-элементы: логотипы клиентов, цифры, награды, опыт
- Опционально: secondary CTA, breadcrumbs, hero-изображение

**Запрещено в Hero:** больше одного H1, больше одной Primary CTA, декоративные элементы, которые перевешивают H1 по визуальному весу, видео-фон с автозвуком.

---

## 7. Правила кода

### 7.1. TypeScript

- `strict: true` в `tsconfig.json` всегда
- Без `any`. Если совсем нужно — комментарий с обоснованием
- `interface Props {}` для каждого компонента
- `const` / `let`, без `var`

```astro
---
interface Props {
  title: string;
  description?: string;
  ctaLabel?: string;
}

const { title, description, ctaLabel = 'Узнать больше' } = Astro.props;
---
```

### 7.2. CSS

- Только токены `var(--color-*)`, `var(--space-*)`, `var(--radius-*)` из дизайн-системы
- Нет hardcoded hex (см. грабля 2)
- Нет `!important`
- Нет inline `style=` со статическими значениями. Динамические через `style={{...}}` ок

### 7.3. Семантика

- Один `<h1>` на страницу (в Hero)
- Иерархия `h1 → h2 → h3`, не пропускать уровни
- `<button>` для действий, `<a>` для навигации
- Все form input — `<label for=...>` или wrapping

### 7.4. astro check перед коммитом

```bash
pnpm astro check
```

Если ошибки — чинить до коммита.

### 7.5. Path aliases

В `tsconfig.json`:

```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

В импортах использовать `@/`, не `../../layouts/...`.

```astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import { SITE } from '@/lib/constants';
```

---

## 8. Интерактив (React islands и shadcn/ui)

### 8.1. Когда React, когда нативный HTML

React island — только для интерактива. Не для статической вёрстки.

| Случай | React |
|---|---|
| Mobile menu toggle | Да |
| FAQ accordion | Опционально (или нативный `<details>`) |
| Contact form с валидацией | Да |
| Калькулятор / фильтр / табы со state | Да |
| Modal / dialog | Да |
| Scroll-зависимые компоненты | Да |
| Статические карточки, Hero, Stats, секции | Нет |
| Иконки, тексты, кнопки без state | Нет |

### 8.2. Директивы client:*

| Директива | Когда |
|---|---|
| `client:load` | Критический интерактив над сгибом (mobile menu) |
| `client:visible` | Ниже сгиба (формы, accordion в FAQ) |
| `client:idle` | Низкоприоритетный (scroll-to-top) |
| `client:only="react"` | Если компонент ломается при SSR (редко) |

```astro
<MobileMenu client:load navLinks={navLinks} />
<ContactForm client:visible />
<FAQAccordion client:idle items={faqItems} />
```

### 8.3. shadcn/ui — когда применять

**Использовать shadcn для:** Dialog / Modal, Sheet (mobile menu), Accordion, Form + Input + Label, Select / Combobox, Tooltip, Tabs. Везде где нужна A11y-фокус-ловушка и клавиатурная навигация.

**НЕ использовать shadcn для:** Hero, Stats, Services, Process, Cases, Testimonials, CTA, Button, Card. Эти статические секции писать руками под дизайн-систему.

**Стилизация shadcn:** через CSS-переменные `--primary`, `--background`, `--border`, `--ring` в `global.css` `@theme`. Не переопределять каждый компонент руками.

---

## 9. iOS Safari и mobile

### 9.1. Modal с формой (критический паттерн)

Стандартное `<dialog>` на iOS Safari ненадёжно. Использовать кастомный modal shell.

Body-lock через position: fixed:

```js
// При открытии
const scrollY = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.top = `-${scrollY}px`;
document.body.style.width = '100%';

// При закрытии
const savedY = document.body.style.top;
document.body.style.position = '';
document.body.style.top = '';
document.body.style.width = '';
window.scrollTo(0, parseInt(savedY || '0') * -1);
```

Дополнительно: `role="dialog"`, `aria-modal="true"` на shell. `-webkit-overflow-scrolling: touch` на скроллируемых контейнерах. Trap focus внутри (через shadcn Dialog или `focus-trap-react`).

### 9.2. font-size: 16px на input

Без этого iOS Safari зумит при фокусе. Глобально:

```css
input, textarea, select { font-size: 16px; }
```

### 9.3. Брейкпоинты

```
xs: 480px    sm: 768px    md: 1024px    lg: 1280px    xl: 1536px
```

Mobile-first: базовые стили под мобильный (375px), расширения через `sm:`, `md:`, `lg:` Tailwind.

### 9.4. Touch targets

Минимум 48×48px для всех интерактивных элементов. Проверять отдельно: кнопки в footer, мобильное меню, иконки-кнопки.

### 9.5. Mobile pass (обязательный)

Перед закрытием страницы — пройти в обоих браузерах:

1. **Chromium** mobile viewport 375px (DevTools)
2. **WebKit / Safari** на iPhone или Playwright WebKit

WebKit ловит то, что Chromium прощает: `box-sizing` ошибки, `-webkit-` префиксы, overflow на 100%-padding.

---

## 10. Медиа

### 10.1. Изображения через astro:assets

```astro
---
import { Image } from 'astro:assets';
import heroImage from '@/assets/hero.jpg';
---

<Image src={heroImage} alt="Конкретное описание" width={1200} height={800}
       format="webp" loading="eager" fetchpriority="high" />
```

Правила: `width` и `height` всегда (предотвращает CLS). `alt` всегда, осмысленный. `loading="lazy"` для всего ниже сгиба. Hero: `loading="eager"` + `fetchpriority="high"`. Формат `webp` или `avif`. Хранить в `src/assets/`, не в `public/`.

**Важно:** `astro:assets` **не работает** для изображений из `public/`. Только для `src/assets/`.

### 10.2. Иконки

```astro
---
import { Phone, Mail, MessageCircle } from 'lucide-react';
---

<Phone size={24} strokeWidth={1.5} />
```

Tree-shaking работает: в бандл попадают только использованные иконки.

Кастомные SVG: 1-3 штуки — inline в `.astro`. 5+ — компоненты в `src/components/icons/`.

### 10.3. Видео

Короткие фоны (до 10 секунд, без звука):

```astro
<video autoplay muted loop playsinline preload="metadata" poster="/poster.jpg">
  <source src="/demo.webm" type="video/webm">
  <source src="/demo.mp4" type="video/mp4">
</video>
```

Длинные ролики, отзывы — YouTube через `lite-youtube` (грузит placeholder, плеер только при клике, экономит ~500 КБ):

```bash
pnpm add @justinribeiro/lite-youtube
```

```astro
<lite-youtube videoid="abc123" playlabel="Название"></lite-youtube>
```

---

## 11. Анимации

### 11.1. Что разрешено

- Tailwind `transition-*` для hover-стейтов (0.2s ease)
- Fade-in + translateY 20px на scroll через `IntersectionObserver`
- Smooth-открытие accordion и menu (0.3s ease)
- Hover на карточках: subtle lift (`translateY(-2px)`) + появление тени

### 11.2. Точечный motion-акцент на блок

В каждом крупном блоке разрешён **один интересный motion-элемент**:

- Stats: плавное появление цифр через `IntersectionObserver` + count-up
- Method: появление шагов по очереди со stagger
- Hero: лёгкий parallax на декоративных элементах (не на основном контенте)
- Cases: hover на карточке открывает превью

Один блок — одна интересная деталь. Не везде, не одновременно.

### 11.3. Scroll reveal pattern

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
```

```css
[data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
[data-reveal].is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1; transform: none; transition: none; }
}
```

**`prefers-reduced-motion` обязателен.** Все анимации уважают его.

### 11.4. Запрещено

- Heavy parallax на всю секцию
- `@keyframes` loops для декора (бьют Lighthouse и батарею)
- GSAP, Framer Motion, Lottie без явного запроса пользователя
- Анимации длиннее 600ms
- Анимации на каждом элементе блока (визуальный шум)

---

## 12. SEO базовое

### 12.1. Meta-теги в BaseLayout.astro

```astro
<html lang="ru">
<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />
  <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  {ogImage && <meta property="og:image" content={ogImage} />}
  <meta property="og:locale" content="ru_RU" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  {ogImage && <meta name="twitter:image" content={ogImage} />}
</head>
```

Лимиты: Title до 60 символов, Description до 160. На каждой странице уникальные.

### 12.2. JSON-LD схемы (минимум)

Генераторы в `src/lib/seo.ts`. Вставляются в `BaseLayout` или странице. Базовые: **Organization** на главной, **BreadcrumbList** на внутренних, **FAQPage** на страницах с FAQ, **Service** на страницах услуг.

**Review / AggregateRating** — только при верифицированных отзывах. Google наказывает за фейк.

### 12.3. Sitemap и robots.txt

В `astro.config.mjs`:

```js
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://example.com',  // обязательно для sitemap
  integrations: [sitemap()]
});
```

В `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /thanks
Disallow: /404

Sitemap: https://example.com/sitemap-index.xml
```

Перед коммитом — реальный домен, не `[DOMAIN]` и не `example.com`.

---

## 13. A11y минимум

- `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>` — использовать. Не оборачивать всё в `<div>`
- Списки `<ul>` / `<ol>`, не `<div>` с буллетами
- Все интерактивные элементы — видимый focus state: `focus-visible:outline-2 focus-visible:outline-offset-2`
- Не убирать `outline` без замены
- WCAG AA минимум для основного текста (контраст 4.5:1)
- `aria-label` для кнопок без текста (только иконка)
- `aria-current="page"` для активной ссылки навигации
- `aria-expanded` для accordion и меню

Сначала пробовать нативные элементы (`<details>`, `<dialog>`), потом ARIA.

---

## 14. Известные грабли Astro

| # | Проблема | Решение |
|---|---|---|
| 1 | Hydration mismatch при `client:load` | Не использовать `Date.now()`, `Math.random()` в render. Условный рендер на `window` — в `useEffect`. Совсем не получается — `client:only="react"` |
| 2 | View Transitions ломают Я.Метрику | Вручную вызывать `ym(id, 'hit', URL)` на событии `astro:page-load` |
| 3 | `astro:assets` не работает для `public/` | Хранить в `src/assets/`, импортировать как модуль |
| 4 | Tailwind v4 не видит `bg-${color}` | Использовать полные имена или условный рендер |
| 5 | Static output не поддерживает API routes | В API route указывать `export const prerender = false;` |
| 6 | iPhone Safari ломает `<dialog>` и body scroll | Кастомный modal shell + `position: fixed` body lock + `font-size: 16px` |
| 7 | WebKit показывает overflow, Chromium прощает | `box-sizing: border-box` глобально. Особенно CTA `width: 100%` + padding |
| 8 | Prerendered API при output static | `prerender = false` или переход на `output: 'server'` |
| 9 | Tailwind v4 preflight отключён случайно | В `global.css` должен быть `@import "tailwindcss"` без отключения preflight |
| 10 | Image без width/height вызывает CLS | Всегда указывать `width` и `height`, даже адаптивные |
| 11 | PowerShell `&&` не работает | Использовать `;` или отдельные команды |
| 12 | `astro check` медленный на больших проектах | Норма (30+ секунд при 50+ страницах). Запускать перед коммитом, не на сейв |

---

## 15. Pre-deploy scan (обязательный перед коммитом)

Перед каждым коммитом блока ИИ выполняет и предъявляет отчёт.

### 15.1. Поиск плейсхолдеров

```bash
grep -rn "\[DOMAIN\]\|\[TODO\]\|\[CLIENT\]\|\[SLUG\]" src/ public/
grep -rn "example.com\|localhost:" src/ public/
grep -rn "<!-- TODO" src/ public/
```

### 15.2. Поиск hex и inline-стилей

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" src/pages src/components src/layouts
grep -rn 'style=".*#[0-9a-fA-F]' src/
```

Если найдено — заменить на `var(--color-*)`.

### 15.3. Проверка ссылок на файлы

В `BaseLayout.astro` и страницах: `/favicon.svg`, `/og/*.jpg`, `/fonts/*.woff2` — файлы существуют? Если нет — сделать опциональным или создать заглушку.

### 15.4. Проверка `.env.example`

```bash
grep -v "^#\|^$" .env.example | grep -v "=$"
```

Если что-то выведет — есть строки `KEY=value`. Обнулить.

### 15.5. astro check + build

```bash
pnpm astro check
pnpm build
```

Оба без ошибок и warnings.

### 15.6. Mobile pass

Открыть в Chromium 375px и WebKit. Проверить: горизонтальный overflow, modal без скачков скролла, touch targets, обрезание текста.

---

## 16. Связанные документы

| Документ | Когда читать |
|---|---|
| **ASTRO_BUILD.md** | **в каждом чате при сборке** |
| `SITE_ARCHITECTURE.md` | в каждом чате при сборке |
| `DESIGN_SYSTEM.md` | в каждом чате при сборке |
| `PAGE_*.md` | по запросу при сборке страницы (опционально) |
| `ASTRO_SETUP.md` | один раз при старте нового проекта |
| `ASTRO_DEPLOY.md` | один раз в конце проекта при деплое |
| `ASTRO_FORMS.md` | когда настраиваем формы вне стартового шаблона |
| `ASTRO_LEGAL_RU.md` | когда пишем `/privacy-policy` и `/cookies` |

---

## 17. Changelog

**v2.1** (2026-05-15)

- Раздел 5 «Композиция» переработан: разделены два контракта, которые раньше были слиты в один
  - § 5.1 Container Discipline (жёсткий контракт) — единый `.site-container` на всех блоках. Обеспечивает фрейм, защищает от расползания на больших мониторах
  - § 5.2 Composition (гибкий выбор инструмента внутри контейнера) — 12-col grid это **один из инструментов**, не обязательный. Доступны также: CSS Grid auto-fit, flexbox горизонтальный и вертикальный, узкая колонка `max-width: 65ch`, CSS subgrid
  - § 5.3 Editorial Alignment Rules — явные правила выравнивания. По умолчанию контент по левому краю. Центрирование допустимо только в 4 случаях (финальный CTA на тёмной секции, stats-секция, страницы 404/thanks, Hero одностраничного лендинга). Запрет центрирования H2 рядовых секций
  - § 5.4 12-col Composition Gate — 8 паттернов сохранены, применяются когда выбран `.grid-12`
  - § 5.5 B2B Premium defaults — без изменений
- Шапка блока (§ 3.2) обновлена: добавлено поле «Выравнивание контента», поле «Композиционный паттерн» переименовано в «Композиционная структура» и расширено (не только 12-col)

**v2.0** (2026-05-15)

- Полная переработка из v1.3 (3657 → ~900 строк)
- Setup вынесен в `ASTRO_SETUP.md`. Deploy в `ASTRO_DEPLOY.md`. Формы в `ASTRO_FORMS.md`. Правовые тексты в `ASTRO_LEGAL_RU.md`
- Брифы `PAGE_*.md` сделаны опциональными (минимум: `SITE_ARCHITECTURE.md` + `DESIGN_SYSTEM.md`)
- Добавлен раздел «B2B Premium composition defaults» (антитеза AI-slop)
- Добавлена шкала типографики Editorial: H1 52 / H2 40 / H3 28 / Body 16
- ТОП-7 граблей в шапке (раздел 2) на основе пост-аудита первой итерации
- Добавлена обязательная «Шапка блока» перед написанием кода
- Composition Gate с паттернами Full 12, 6+6, 4+8, 3+9, 5+7, 7+5, 3+7+2, 2×6
- Pre-deploy scan (раздел 15)
- Зафиксирован запрет на `00-*SharedStyles.astro` и любые shared-style файлы на уровне страницы

---

**Конец документа.**

**Версия 2.1. Документ живой — обновляется через перенос из `BUILD_RETROSPECTIVE.md` каждых 2-3 проектов.**
