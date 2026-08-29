# Where this project stands

Written to be read first — by a person picking the work back up on another
machine, or by an assistant starting a session with no history. The README
explains how the product works; this says what state it is in right now and
what is waiting.

**Last updated:** 28 августа 2026 — день целиком ушёл на сторонний аудит и
его последствия. Найдено было серьёзное: `GET /api/orders` не проверял ничего
и отдавал всю книгу заказов — имена, телефоны, письма получателям, фотографии —
любому по ссылке. Закрыто, проверено на бою, вместе с ещё двумя десятками
находок; подробности в разделе «Аудит». Тогда же появились первые тесты,
`/api/health`, ограничение частоты и Sentry.

До этого в тот же день: связь с ботом стала двусторонней, телеграм заменил
почту в форме, уведомление о заказе стало писать словами, а не
идентификаторами, и собран растровый комплект логотипа.

**Файл чищен 28 августа**, второй раз за день: убрано 217 строк выполненного —
зачёркнутые шаги, закрытые вопросы, план тёмной редакции, который выполнен, и
список `Open items`, где восемь пунктов из девяти были сделаны. Осталось то,
чем пользуются, и то, что ещё не сделано.

**Если вы открыли этот файл, чтобы понять, что делать** — следующий раздел, он
первый и по-русски. Всё остальное ниже объясняет «почему».

---

## Что делать дальше — по шагам

Единственный раздел, из которого *действуют*. По-русски и первым, потому что
остальной файл — это «почему так вышло», и туда стоит лезть, когда шаг
непонятен. Порядок здесь не по важности, а по тому, что чем разблокируется.

**Где всё смотреть.** Ветка `claude/premium-greeting-cards-yhj5rz` —
основная, каждый push деплоится сам. Живой адрес:
`digital-greeting-cards-ochre.vercel.app`.

| Что посмотреть | Адрес |
|---|---|
| **Тёмная редакция — уже на главной**, не на стенде | `/` |
| Выбор вместо шаблона: своя идея и «как ваша работа» | `/create`, шаг 6 из 9 |
| **Жив ли путь до базы** — для мониторинга, отвечает 503, если нет | `/api/health` |
| Стенд тёмной редакции, где её собирали | `/design/landing` |
| Букет, собирающийся по прокрутке | `/design/bouquet` |
| Наши работы: семь открыток, каждая крутится живьём | `/works` |
| Шаблоны: шесть, каждый играет сам себя | `/templates` |
| Предложение цветочным магазинам | `/shops` |
| Панель оператора | `/admin` |

Букет смотреть **с ноутбука**, прокручивая медленно: сборка размазана на
четыре экрана. С телефона он тоже нарисуется, но выглядит плохо — см. ниже,
это известная нерешённая вещь, а не поломка.

### Шаг 1. ~~Ротация доступов~~ — сделано 29 августа

Пароль админки сменён 28 августа, токен бота перевыпущен и
`ADMIN_SESSION_SECRET` задан 29-го. Ротация после открытого `GET /api/orders`
закрыта целиком.

### Шаг 1. Включить хранилище для фотографий — одна кнопка

Код готов и выложен, но до этого действия работает по-старому: снимки едут
внутри заказа. Включение — в панели Vercel, минута:

1. Проект → **Storage** → **Create Database** → **Blob** → создать.
2. Vercel сам добавит `BLOB_READ_WRITE_TOKEN` в переменные проекта.
3. **Redeploy** — без него переменная не подхватится.

Проверить: оформить заказ с фотографией и посмотреть её адрес в карточке
заказа. `https://…public.blob.vercel-storage.com/…` — работает; `data:image/…`
— значит переменной ещё нет, и в консоли браузера лежит объяснение, почему.

Подробности и что это чинит — в разделе «Фотографии переехали из заказа в
хранилище».

### Шаг 2. Разложить телеграм по темам — две переменные

Заказы и обращения в поддержку это разные разговоры: в общем потоке заказ
тонет в переписке, а вопрос теряется среди заказов. Код уже умеет адресовать
темы, нужны только их номера:

1. Правый щелчок по теме в Telegram → «Копировать ссылку» → получится
   `https://t.me/c/<чат>/<номер>`.
2. Вставить **ссылку целиком** (номер выковыривается сам) в Vercel Production
   и в `.env.local`: `TELEGRAM_TOPIC_ORDERS` для «Заказы»,
   `TELEGRAM_TOPIC_SUPPORT` для «Поддержка». **Redeploy.**
3. `npm run tg:webhook topics` — отправит по проверочному сообщению в каждую
   и скажет, что ответил Telegram.

Не заданы — всё идёт в общий поток, как сейчас. Это осознанный запасной путь:
группа может и не быть форумом, и тогда `message_thread_id` вызвал бы отказ на
каждом заказе.

### Шаг 3. Купить домен

Код уже рассчитан на `birdunyo.uz` — он в списке своих хостов
(`lib/site-origin.ts`) и в `.env.example`.

`.uz` регистрируется только через аккредитованного регистратора (реестр —
CCTLD.UZ): `ahost.uz`, `ps.uz`, `billur.uz`, Uztelecom. Порядок цены —
150–250 тысяч сум в год, уточнять у регистратора вместе с требованиями к
документам. `.com` под редирект, если нужен, — Cloudflare Registrar продаёт по
себестоимости, около $11 в год.

Подключение к Vercel бесплатное. После этого `NEXT_PUBLIC_SITE_URL` на новый
адрес и Redeploy — но **`digital-greeting-cards-ochre.vercel.app` не
отключать**: на нём уже висят напечатанные QR-коды, и они должны продолжать
открываться. Новые коды пойдут на новый домен, старые на старый.

Тогда же закрывается остаток из аудита: поддомен `cards.birdunyo.uz` для
`/u/` — вторая половина защиты от чужого HTML.

### Шаг 4. Решить цену для магазинов

В `lib/shops/offer.ts` всё ещё 25% и 15 бесплатных открыток, помеченные как
предварительные. Это решение, а не задача, но принять его надо до того, как
показывать `/shops` живому флористу.

### Шаг 5. Проверить VPS снаружи

`nc -vz <ip> 5432`. Если отвечает — там открытый PostgreSQL с паролем из
публичного репозитория; привязать к `127.0.0.1`. Бот на том VPS всё равно
мёртв, от него здесь ничего не зависит.

### Что осталось от тёмной редакции лендинга

План выполнен: тёмная редакция стоит на `/`, механика движения из образца
перенесена (инерция прогресса, пять ключей камеры, параллакс, заставка,
раскрытие письма). Стенды остались на месте — `/design/landing` и
`/design/bouquet`. Остальные страницы сайта по-прежнему светлые: их очередь
следующая, если решим вести тёмное дальше главной.

Не закрыты две вещи, обе про букет и обе видны только на телефоне:

**Композиция разваливается на узком экране.** Проверено на 390 px: канвас
монтируется, сцена рисуется, но камера не подстраивается под ширину. С 0.3 до
0.8 прокрутки букет вырастает во весь экран и текст ложится поверх крафта; а
после 0.9 сцена **исчезает совсем** — остаётся заголовок на пустом чёрном.
Второе выглядит не «некрасиво», а «сломалось».

Гейт по ширине экрана делать **нельзя** — это разбиралось 26 августа и было
прочитано неверно всеми. `NARROW` в образце управляет прозрачностью
SVG-заглушки, а не сценой; автор никогда не выключал 3D по ширине. А `rich` из
`useMotionPrefs` читают трое, и `Atmosphere` — это гейт WebGL **опубликованных
открыток**, которые открывают как раз с телефона по QR с бирки. Плюс у
`BouquetStage` нет запаски, в отличие от `Atmosphere`, так что гейт дал бы
пустой чёрный экран. Остаются два хода: кадр по ширине
(`Math.max(1, 1.5/aspect)` из самого образца — на десктопе равен единице и
ничего не трогает) и SVG-заглушка, которая закроет и слабые устройства, и
запрещённый WebGL, и reduced-motion сразу.

**Бирка висит в воздухе.** На её высоте (`y = -0.34`) поверхность обёртки
лежит на радиусе 0.81, а сама бирка — на 1.71 от оси (`tagTo` в
`BouquetAssembly.tsx:210`). Зазор 0.9 — почти во всю ширину обёртки, и шнурка
между ними нет. Та же болезнь, что чинили на `/shops`, где место крепления
пришлось измерить, а не угадать.

### Аудит 28 августа: что закрыто, что осталось

Полный текст — `audits/bir-dunyo-audit.md`, **намеренно не в git**: репозиторий
публичный, а документ подробно описывает, где были дыры. Оценка была 42/100 и
вердикт «не готово», и основания были.

**Закрыто и проверено на бою** — двадцать находок в двух заходах. Коротко:
авторизация на всех маршрутах и одна общая проверка вместо трёх разных
(`lib/auth/guard.ts`); сессия админки перестала подписываться ключом-заглушкой
из этого же репозитория; `publish` убран из контракта, публикует только
магазин; коды выдаёт `randomInt`, новые восьмизначные; ограничение частоты на
входе, заказах и планировщике; в проде нет базы — нет обслуживания, вместо
тихой потери заказов в память; песочница CSP на `/u/`; `/api/health`;
37 тестов без единой новой зависимости; идемпотентность создания заказа
(миграция 008 применена); счётчик сканирований; постраничная выдача в
очереди. Подробности — в `git log` за 28 августа, каждый коммит объясняет свою
находку.

**Проверено и не подтвердилось:** H9 — отменённая открытка якобы остаётся в
кеше маршрута. В `prerender-manifest.json` `/c/[code]` нет ни в статике, ни в
ISR; все маршруты в сборке помечены `ƒ`. `force-dynamic` всё равно проставлен,
но как запись решения, а не как исправление.

**Не согласился:** аудит предлагает закрыть `/c/[code]/qr` за сессией
оператора. Нельзя — туда приходит и заказчик сразу после сборки открытки,
ссылку даёт `PublishedCard`. Поставлена та же граница, что у `/preview`:
отменённый заказ отдаёт 404.

**Осталось:**

1. **`/u/` до конца закрывается только отдельным хостом.** Песочница снимает
   главное — скрипт теряет права своего происхождения, — но полное решение это
   поддомен вроде `cards.birdunyo.uz` и запись в DNS. Ваша часть.
2. **Фотографии лежат base64 в JSONB.** Страница очереди читает 25 заказов со
   всеми снимками разом — раньше читала все. Размер страницы здесь измеряется
   в мегабайтах ответа, а не в строках. Нужен объектный сторадж: это дни
   работы, а не часы.
3. **Приватность.** Нет политики хранения, нет удаления по запросу, нет
   согласия получателя — а его имя и фотографии обрабатываются, и он о нас не
   просил. Работа не по коду, но она нужна.
4. **Один пароль на все магазины.** Пока магазин один — это честное
   ограничение, оно записано в README. Со вторым магазином всё меняется: каждый
   сможет читать и править заказы каждого.

**Чего делать не стал, намеренно.** Аудит предлагает отправлять в телеграм
только код и ссылку, без имён и контактов. Это сняло бы вопрос приватности
целиком, но сегодня же было отдельно решено обратное: оператор должен видеть
просьбу заказчика прямо в сообщении. Менять это молча нельзя — если решите
поменять, скажите, это одна строка.

### Чего делать не надо

- **Не подключать букет к текущему светлому лендингу.** Это уже проверено и
  снято; повторится один в один.
- **Не мержить тёмную редакцию одним заходом.** Автор сцены просил об этом
  прямо: тёмная тема, лента работ и новый футер — три разных дифа.
- **Не переписывать лендинг под магазины,** пока не поговорили ни с одним
  флористом. Пока магазинов ноль, сайт вообще не главный инструмент: первые
  десять закрываются приходом с телефоном и печатной биркой.

### На этой машине (дома), к репозиторию не относится

Папка `update UIUX/` в корне ломает `next build` — `tsc` компилирует её там,
где она лежит, а относительные импорты внутри оттуда никуда не ведут: четыре
ошибки TS2307 и сборка не доходит до `BUILD_ID`. Её содержимое уже в дереве
байт в байт, так что удалить безопасно. Она **не** в git, поэтому на рабочей
машине её нет и там всё собирается.

---

## Deployed

Live at `digital-greeting-cards-ochre.vercel.app`, on Vercel, from the branch
`claude/premium-greeting-cards-yhj5rz` — which is this repository's default
branch, so every push to it deploys. Database is Neon PostgreSQL, connected
through the Vercel integration.

Environment variables in Vercel:

| Variable | State |
|---|---|
| `DATABASE_URL` | set by the Neon integration |
| `ADMIN_PASSWORD` | set |
| `NEXT_PUBLIC_SITE_URL` | set |
| `TELEGRAM_BOT_TOKEN` | set — токен ещё предстоит перевыпустить, см. шаг 1 |
| `TELEGRAM_CHAT_ID` | set. A new order writes to the group |
| `TELEGRAM_WEBHOOK_SECRET` | set. Без неё маршрут вебхука отвечает 404 |
| `SENTRY_AUTH_TOKEN` | set — исходные карты загружаются при сборке, проверено |
| `ADMIN_SESSION_SECRET` | **не задан.** Необязателен; пока его нет, ключом подписи служит пароль |
| `TELEGRAM_TOPIC_ORDERS` / `_SUPPORT` | **не заданы.** Всё идёт в общий поток |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | **не заданы.** Счёт частоты идёт в памяти инстанса |

Последняя применённая миграция — `008-order-idempotency.sql`, 28 августа.
Считается не число, а имя последней: строка «Both migrations» стояла здесь до
шестой и успела устареть дважды.

---

## Open items

Всё, что было в этом списке про телеграм, тестовые заказы, Алину и годы работ,
закрыто 27–28 августа. Осталось два, и оба — решения, а не задачи.

1. **Флорист пишет в пустоту — наполовину.** Кнопка на `/shops` ведёт на
   `@birdunyobot`, и написанное туда теперь **доезжает**: вебхук пересылает
   любое сообщение боту в рабочую группу. Осталось решить, кто отвечает и как
   быстро, — иначе страницу можно раздавать магазинам, а отвечать будет некому.
2. **Цена в `lib/shops/offer.ts`** — 25% и 15 бесплатных открыток помечены как
   предварительные. См. шаг 4.

---

## What was built, in order

Each of these has a commit message explaining the reasoning; `git log` is the
long version.

- Admin was open to anyone. Now a login page at `/admin/login` exchanges
  `ADMIN_PASSWORD` for a signed session cookie.
- The PostgreSQL path did not work at all: `pg` was not a dependency, its
  import was hidden from bundler tracing so it would not have shipped, and the
  INSERT failed on a type conflict. TLS is now decided by host rather than by a
  substring in the connection string.
- The whole dashboard was English; it and the card flow are now Russian, Uzbek
  and English throughout, with real plural rules.
- Orders can be cancelled, unpublished ones deleted, and everything exported.
- The creation flow no longer publishes. It collects a brief and a contact,
  composes a draft, and leaves publishing to the shop.

---

## Things that will bite

- **Супергруппа молча меняет `chat_id`.** Включение топиков превращает обычную
  группу в супергруппу, и её id становится видом `-100…`; старый замолкает
  навсегда. Снаружи это выглядит как «бот сломался», а Telegram отвечает
  `chat not found`, что читается как «бота нет в группе». В `/admin` есть
  кнопка **«Найти chat id»** — она покажет чаты, которые бот видел.
- **Пока вебхук зарегистрирован, эта кнопка отвечает 409.** Не поломка:
  сообщения забирает вебхук, и опросить их вторым способом Telegram не даёт.
  Нужен chat id — `npm run tg:webhook delete`, найти, `set` обратно.
- **`headers()` нельзя звать внутри `after()`.** Next роняет весь отложенный
  вызов целиком, молча для посетителя и без следа, кроме строки в логах
  Vercel. Счётчик сканирований так не записал ни одного открытия, хотя код
  выглядел рабочим и сборка проходила. Читать заголовки надо снаружи и
  передавать готовое значение.
- **`Instrument Serif` не содержит кириллицы вообще.** Её подмножества —
  `latin` и `latin-ext`. Пока она стояла заголовочной, каждый русский и
  узбекский заголовок рисовался запасной Georgia: чужое начертание, чужой вес,
  чужой ритм — на двух языках из трёх, и на боевом сайте всё это время.
  Сейчас стоит `Cormorant Garamond`. Проверять кириллицу у любого нового
  шрифта до того, как он попадёт в макет.
- **Мастер Sentry включает запись сессий по умолчанию.** `replayIntegration`
  с выборкой 10% — это видеозапись DOM и ввода. Единственный экран, где здесь
  печатают, — `/create`, а там пишут письмо любимому человеку и грузят семейные
  фотографии. Выключено вместе с `userInfo` и `httpBodies`; если кто-то
  переустановит Sentry мастером, всё это включится обратно.
- **Cards are stored composed.** Changing template code or copy does not change
  cards already published. Regenerate them from the order page.
- **`/c/[code]` serves only `PUBLISHED`** and must stay that way: a code can be
  printed onto a tag. Drafts live at `/c/[code]/preview`.
- **`NEXT_PUBLIC_SITE_URL` is baked into printed QR codes.** Changing the
  domain after tags are printed strands them.
- **Never print an identifier at a person either.** The dashboard spent weeks
  showing `СЦЕНА petals`, `НАСТРОЕНИЯ romantic, warm, dreamy` and every look in
  the builder as a raw id, which is the same bug as the one below wearing a
  different hat: correct-looking in English, wrong in both other languages, and
  invisible to anyone testing in English. Scenes, motifs, beats and all 37 looks
  are named in ru/en/uz now — `sceneLabel`, `motifLabel`, `beatLabel`,
  `lookLabel` in `lib/i18n/localise.ts`. A *template id* stays Latin, in a
  `<code>` under a label that says ID: an id is not a word.
- **Never put a user-visible string in a template file or a component.** Three
  separate bugs came from exactly that, each one a word-for-word copy of an
  English dictionary entry, so each looked correct in English and broke both
  other languages. See `templates/README.md`.
- **Adding a column or an order status needs a migration**, not a re-run of
  `schema.sql` — the live database already has the schema.
- **`npm install` after every pull, not just on a fresh clone.** `pg` was added
  as a dependency partway through; pulling onto a machine with older
  `node_modules` fails the build with a module-not-found pointing at
  `lib/db/postgres.ts`, which looks like a code fault and is not one.
- **Kill stale `next start` processes before believing a local test.** Ten of
  them were found listening at once on this machine. A new server on a taken
  port fails with `EADDRINUSE` *in its log* and exits, so requests go to
  whatever old build already owned the port and everything looks inexplicably
  out of date — a newly registered template missing from `/templates`, a 404 on
  a page that exists. `netstat -ano | grep LISTENING` and check the port is
  actually yours.
  This was first written up as "clear `.next`", because clearing it appeared to
  fix exactly that symptom. It probably did not: the working run also used a
  free port. The `.next` claim is withdrawn rather than left in as folklore.
- **Do not put `scroll-behavior: smooth` on `html`.** It was there and it was
  landing readers at the *bottom* of every page, two different ways. On a fresh
  load the browser restores the previous scroll offset while the document is
  still short — fonts, images and lazy sections have not arrived — so a restore
  of 3000px into a document currently 1200px tall clamps to the end, and the
  page then grows underneath somebody already at the bottom. On navigation the
  App Router's own scroll-to-top becomes an animation racing a document whose
  height is still changing. Anchor links jump now, which is what links do.
  Anything that wants smooth asks at the call site, the way `EnvelopeSection`
  does.
- **`AnimatePresence mode="wait"` leaves the box empty.** The template
  previews spent up to half of every 3.4s beat showing a blank phone: `wait`
  holds the outgoing beat's exit and the incoming beat's entrance apart, and
  each was 0.85s. Because a row of previews hydrates together they all blanked
  in unison, which reads as broken rather than as animating — it was reported
  as "the new templates don't render", and the templates were fine. The beats
  are `absolute inset-0`, so they can simply crossfade.
- **`.env.local` не приезжает с `git pull` и не приедет.** Он в `.gitignore`
  (`.env*.local`), потому что в нём пароль от базы — там ему и место. Отсюда
  `DATABASE_URL is not set` на каждой новой машине, и это **не поломка**: 22
  августа чинили то, что скрипт вообще не читал файл, — теперь читает, о чём
  сама ошибка и сообщает («no .env.local or .env supplied it» значит «искал и
  не нашёл»). Файла на домашней машине не было никогда.
  Лечится раз на машину, и копировать строку руками не нужно:

  ```
  npx vercel link                 # выбрать этот проект
  npx vercel env pull .env.local
  ```

  После этого `DATABASE_URL`, `ADMIN_PASSWORD` и телеграм-переменные читают все
  команды проекта, а не только `next dev`. Подсказка про это теперь стоит и в
  самом сообщении об ошибке `db:migrate` — чтобы ответ был там же, где вопрос.
- **A plain `git fetch` fails on this repository.** It hangs, or dies with
  `fatal: fetch-pack: invalid index-pack output`, because `public/` is 87 MB —
  `tebe` alone is 50 MB, 43 of that two mp4 files. What gets through:

  ```
  git -c core.compression=0 -c http.postBuffer=524288000 fetch origin <branch>
  ```

  This bit on 19 August, and the failure mode is the dangerous part: work
  pushed from the other machine looked pulled but had never arrived, so the
  session started three commits behind while appearing current, and read stale
  files as though they were the latest. **Before trusting a machine, compare
  `git rev-parse HEAD` with `git ls-remote --heads origin <branch>`** — they
  either match or they do not, which is a fact, unlike the absence of an error
  message from a fetch that quietly did nothing.
- **The three dictionaries diff as whole files, every time.** Editing 20 lines
  of `lib/i18n/dictionaries/*.ts` produces a ~1,900-line diff per file. It
  happened on 19 and again on 20 August. **`git diff --cached --ignore-cr-at-eol`
  shows the real change** — use it before believing a stat line, and say what it
  reports rather than what `--stat` does.

  What is verified: the stored blobs are CRLF both before and after
  (`git cat-file blob $(git rev-parse <rev>:<path>) | grep -c $'
'`), the
  working copies are entirely CRLF, and `--ignore-cr-at-eol` collapses the diff
  to the real edit. **The cause is not established.** A first guess — that
  `core.autocrlf=true` was normalising these files to LF on staging — was
  written here on 19 August and is **wrong**: the blobs never became LF. Setting
  `core.autocrlf false` locally makes it worse, diffing every *other* file
  whole; that was tried and reverted, and the git configuration is unchanged.
  Nothing is broken by this — the committed content is correct — so it is
  recorded as noise to see through, not as a fix to apply.
- **`.env.local` on this machine points at production.** Once it exists,
  `npm run dev`, `next start` and every script that loads env files talk to the
  live Neon database — there is no separate local one. On 21 August two test
  orders were created against production by an assistant probing the order API
  locally; both were deleted the same session, leaving only the real order. If
  you need to poke at order creation, either point `DATABASE_URL` at a scratch
  database for that run or delete what you make, and check
  `SELECT code, customer_name FROM orders` before assuming nothing was left
  behind.
- **A page can be photographed at any scroll position — use it.**
  `scripts/shoot.mjs` drives headless Chrome over the DevTools protocol:
  navigate, scroll to a fraction of the height, capture, repeat. It exists
  because `chrome --screenshot` only ever sees the first screen, and everything
  interesting here is spread over several — which is how a 3D scene reached
  production unseen and came off the same day.

  ```
  node scripts/shoot.mjs http://localhost:4011/design/landing out 0,.35,.7,1 1280 900
  node scripts/shoot.mjs http://localhost:4011/ out 0,.5 390 844
  ```

  The flags that matter are inside it: `--use-angle=swiftshader
  --enable-unsafe-swiftshader`. Without them WebGL never initialises and the
  scene is simply absent from the frame — which is exactly what "the pixels
  cannot be checked" turned out to mean. It also takes production URLs.
- **`&&` не работает в PowerShell 5.1.** Оболочка владельца — именно она, и
  `npx vercel link && npx vercel env pull` падает с `The token '&&' is not a
  valid statement separator in this version`. Это не ошибка Vercel и не
  сломанный npx. Команды даём по одной строке; если нужна связка — `;` или
  `if ($?) { … }`. Ловушка попала прямо в текст ошибки одного из скриптов и
  оттуда — в инструкцию, то есть размножилась.
- **`[SENSITIVE]` ломает сборку молча и печатается на бирках.** Продолжение
  предыдущей ловушки, и оно дороже её самой. `NEXT_PUBLIC_SITE_URL=[SENSITIVE]`
  роняет `next build` сообщением `Failed to collect configuration for
  /_not-found`, где о причине нет ни слова. А `siteOrigin()` вернул бы эту
  строку как адрес — и она ушла бы в QR-код, который печатают на бирке и
  привязывают к букету: ошибка всплыла бы у человека с бумажкой в руках.
  Оба места теперь проверяют значение через `new URL()` и откатываются к
  разумному, а не падают и не отдают мусор. Если `vercel env pull` уже
  прошёл — вычистите строки со значением `[SENSITIVE]`: пустая переменная
  честнее заглушки, потому что включает запасной путь.
- **`vercel env pull` не отдаёт секреты и перезаписывает файл.** Vercel
  отказывается выдавать значения, помеченные как секретные, и пишет вместо них
  строку `[SENSITIVE]`; в один заход так пришли двадцать заглушек, включая
  `ADMIN_PASSWORD`, `TELEGRAM_CHAT_ID` и `NEXT_PUBLIC_SITE_URL`. Уцелели только
  те три значения, что уже лежали в файле локально. Вывод: `.env.local`
  наполняется руками, а `pull` годится лишь для несекретного — и всегда
  затирает файл целиком.
- **`fileURLToPath`, а не `new URL(...).pathname`.** Путь проекта содержит
  кириллицу, и в file-URL она процентно-закодирована. `pathname.slice(1)` даёт
  каталог `.../%D0%BF%D1%80.../`, которого не существует, — скрипт молча не
  читает `.env.local` и уверенно сообщает «TELEGRAM_BOT_TOKEN не задан» при
  живом токене в файле. Ошибка стоила отдельного круга переписки. Пустой
  `catch` вокруг чтения файла сделал её невидимой: `migrate.mjs` делал
  правильно с самого начала, `telegram-webhook.mjs` — нет.
- **Stop the dev server before pulling.** The admin pages moved into the route
  group `app/admin/(dashboard)/`, and on Windows git could not remove the old
  directories while a watcher held them open. It asks
  `Deletion of directory ... failed. Should I try again? (y/n)` — answering `n`
  leaves them behind silently. They were empty that time, so nothing broke, but
  a leftover `page.tsx` under both the old and the new path gives two sources
  for one route with no warning. Verified clean on 13 August; the empty
  directories were removed.

---

## Product direction

This is the part that is not visible in the code, and it is currently the
thing blocking work. Discussed 13 August; decisions marked as such.

### The mismatch that was causing the confusion

The code has already chosen a business model. The landing page has not.

The creation flow no longer publishes — it takes a brief and a contact,
composes a draft, and leaves publishing to the shop. That is a **concierge**
model: the customer describes, a person finishes. The landing page still reads
as **self-serve**: "Create something beautiful", nine steps, do it yourself.

Nothing is broken. The shop window is one turn behind the machinery.

### Decided

- **The shop is the customer, not the buyer.** The shop already has a person
  holding money in the right mood. A counter upsell converts incomparably
  better than trying to bring that same person to a website cold.
- **Per published card, never a subscription.** Small shops here will not buy
  software on a recurring basis.
- **Billing event is the publish action, which already exists.** The shop
  publishes only after it has taken the customer's money, so the platform never
  asks for money the shop does not yet have. This removes the only real
  objection (paying up front for something that might not sell) and needs no
  new code.
- **First 10–20 cards free**, because their feedback is worth more than their
  money at this stage.
- **Stay concierge for now.** At zero volume the only moat is the quality of
  the writing. The AI layer is the path to lowering that cost later, and it is
  already constrained so a model cannot damage layout.

### The name: Bir dunyo

Chosen 13 August, from the candidates below. Uzbek for "a whole world" —
literally the promise the product makes, readable in all three languages, and
short enough for a domain and an Instagram handle. "More than a bouquet"
stays as the tagline ("Больше, чем букет").

**The rename is done.** The wordmark, every `<title>`, the colophon inside a
card, the printed tag, `package.json`, the schema header and the favicon all
say Bir dunyo. The name now lives in `lib/site.ts` and everything reads it from
there, so the next rename is one line. Two occurrences of the old name survive
on purpose: `WordmarkBlossom` is the retired mark and its own label is
historically correct, and `ui.closing.title` is the *tagline*, which the
decision keeps.

The mark is a wordmark — the bowl of the *d* in *dunyo* is a card with its
corner turned, and it peels further open on hover. The tab carries that same
card with a blossom on its face; the name alone is a smear at sixteen pixels,
and the card without the flower reads as a file icon.

Still not done: domain and handle availability unchecked, and
`OFFER.telegram` is `@birdunyo` as a placeholder rather than a real handle, so
the "write to us on Telegram" button on `/shops` currently leads nowhere.

**One bot cannot both notify and receive, asked and answered 17 August.** A
Telegram bot's username has to end in `bot`, so `@birdunyo` can never be the
notification bot — it would be `@birdunyo_bot`, and `t.me/birdunyo` is a person
or a channel. Separately, the bot here only *sends*: `lib/notify/telegram.ts`
deliberately has nothing to poll and no webhook, because notifications only go
outward. Making it receive means a webhook, a route and forwarding.

Three ways out, cheapest first: put a **real personal username** in
`lib/shops/offer.ts` — one line, works today, and a florist reaching a human
beats reaching a bot at zero volume; or `@birdunyo_bot` **with a webhook**,
which is real work and adds the inbound path the architecture avoided; or a
**channel**, which looks right and is the wrong shape, because nobody writes
into a channel. The first is the recommendation.

Candidates it beat: **Lola** (tulip, national flower — very local, very
common), **Konvert** (envelope — understood but generic), **Anor**
(pomegranate — warm and regional).

### Not decided

- **Price.** `/shops` is live and every number on it comes from
  `lib/shops/offer.ts`, marked provisional. Change that file and the page
  follows. The *shape* held up under its own calculator and one correction came
  out of building it: a flat fee per card collapses at the bottom of the range
  — beside a 100 000 bouquet the suggested card is 15 000, so a 15 000 fee left
  the shop earning nothing. It is a share of the card price now (25%), so the
  shop always keeps the majority at any bouquet size. Needs one conversation with one florist, not a guess. Only the
  shape is known: the add-on should be roughly 10–20% of the bouquet price to
  stay an impulse yes, and the majority should stay with the shop — the pitch
  is earnings, not commission. The fastest way to the number is asking a
  florist what *they* would charge.
### Что из этого осталось верным

Список задач, стоявший здесь, замещён разделом «Что делать дальше — по шагам» в
начале файла: он весь выполнен или отменён, и два списка задач в одном
документе — это ровно тот способ запутаться, ради борьбы с которым файл и
пишется.

Три вывода из него не устарели и переезжают сюда целиком:

- **`/shops` собран как калькулятор, а не как прайс.** Флористу важно, сколько
  это добавит к его счёту, а не сколько стоит открытка сама по себе. Все цифры
  в `lib/shops/offer.ts`, помечены предварительными; меняете файл — страница
  следует за ним.
- **Лендинг под магазины не переписывать,** пока не поговорили ни с одним
  флористом. Пока их ноль, это оптимизация вслепую.
- **Сайт — не главный инструмент, пока магазинов ноль.** Первые десять
  закрываются приходом с телефоном, показом настоящей открытки и оставленной
  печатной биркой. Страница — то, что откроют после ухода, чтобы убедиться,
  что это не студенческий проект.

---

## Templates and Our work are two different things

Added 18 August, and the distinction is the point.

A **template** is a production system: data a new card gets composed from. A
**work** is a card that already reached a person, and its job is to make the
next customer say "make me one of those". Porting is right for the first and
wrong for the second — it is a retelling, and the hand-tuned timing does not
survive it, which STATUS.md already predicted about Aloud.

That conflation is why the gallery felt weak: `aloud` took three commits (the
port, then its look, then its choreography) while `window`, `ask` and
`candlelight` took one each and wore the engine's default clothes.

So both now exist, on two tabs:

- `/templates` — the engine, unchanged.
- `/works` — the originals, served **byte for byte** out of `public/w/<id>/`.

### How a stranger's HTML is served without opening the hole

STATUS.md rejected serving hand-made HTML because a script at `/c/[code]`
shares an origin with the admin and could read an operator's session cookie.
That objection stands for *cards*. Works are different, and the isolation is
explicit: `sandbox="allow-scripts"` with **no** `allow-same-origin`. The two
flags together cancel the sandbox; apart, `allow-scripts` gives the content an
opaque origin — scripts run, cookies and the parent DOM are unreachable.
`allow-same-origin` is the one flag that must never be added there.

Raw files live under `/w/…`, not `/works/…`, so a static file can never shadow
the Next route.

### What is in the section

Seven works, newest first: `svechi`, `loveis`, `ilove`, `hbday`, `tebe`,
`poydem`, `genki`.

Four of them — `ilove`, `svechi`, `poydem`, `genki` — are the originals the
engine's four ported templates were made from. **Those templates were deleted
on 19 August**, so nothing links to them any more and every `portedTo` field is
empty; the mapping survives only as history, in *Reversed 19 August* further
down. This paragraph claimed the links were live for three days after they were
removed, which is the argument for correcting this file in the same commit that
changes the code.

**The years on `svechi`, `loveis` and `ilove` are a guess.** None of the three
folders had a `.git`, every file carried today's mtime from OneDrive sync, and
nothing inside them is dated. `2025` is a middle estimate placed between the
2024 works and the 2026 one — one line each in `lib/works/index.ts` to correct.

### The gallery plays the works, it does not photograph them

Added 19 August. The cards on `/works` used to be static covers, and a cover
cannot show the one thing that separates these from a picture: they move. Each
card now runs the real work in an iframe. Three things keep that from being a
bad idea, all in `components/works/WorkPreview.tsx`:

- **Width.** The works read their own media queries. An iframe 240px wide would
  hand them a desktop layout squeezed into a card — a lie. The frame is always
  390px internally and is scaled down by transform, so inside it stays a phone.
  The factor is measured with a `ResizeObserver`, because CSS cannot divide one
  length by another.
- **Weight.** No iframe exists until its card comes near the viewport; the cover
  lies underneath until then. `allow` is deliberately unset, so the permissions
  policy blocks autoplay and the gallery never starts seven videos at once.
  Measured in a real browser with all seven cards in view: **4.4 MB**, of which
  2.1 MB is media — the video elements answer with ranges, not whole files.
- **Isolation.** `sandbox="allow-scripts"` — shorter than the viewer's list,
  because a preview is not for clicking. Pointer events are off so the click
  reaches the card's own link. Verified on the rendered page:
  `allow-same-origin` appears zero times.

`livePreview: false` opts a work out, and `tebe` uses it. It opens on
full-screen video, so with autoplay blocked its card was simply black — which
reads as broken rather than as quiet. Its cover is a real frame too, just taken
in advance.

One consequence worth knowing: `genki` pulls a webfont from
`fonts.googleapis.com`, so the gallery now makes that third-party request for
every visitor rather than only for people who open that one work. It is the
original's own behaviour, preserved along with everything else.

### The three things that are not byte-identical

All three are recorded in `Work.note`, a union rather than a `modified` flag,
because the reader needs to know *what* differs: a re-encoded video, a
substituted name and a repaired file are not the same kind of change, and the
second one concerns a real person. All three are stated in the UI, in the
panel behind the QR button — not hidden in a commit message.

**`С днём рождения!` shows a different name.** The card was made for one
person and is now shown to everyone, so every occurrence of the original name
was replaced with `Алина` — the demo recipient the rest of the site already
uses. It appears in `assets/js/shared.js`, `index.html`, `card.html`,
`create.html`, `dist/` and `tools/build-single.py`; the card builds its own
`<title>` from it, so the tab title follows. The sender's name is the author's
own and was left alone.

Two files from that repository are **not** in `public/w/hbday/`: the 53 MB
`Meshy_AI_…texture.glb`, which nothing references — no HTML, JS or CSS in the
project mentions it — and `.git`. The working tree without them is 2.6 MB.
Same principle as the video: the byte-for-byte rule bends only for a hard size
problem, and this one was 53 MB of nothing.

**`Для тебя` had a broken first line.** Its `index.html` opened with a markdown
fence — ```` ```html ```` — and closed with ```` ``` ````, saved into the file
when it was pasted out of a chat. This was recorded here in August as "two
lines to delete" and had not been done. It was not cosmetic: the opening fence
sits *before* the doctype, so the browser dropped into **quirks mode**
(`document.compatMode === 'BackCompat'`), and the text `​```html` rendered in the
top-left corner of the card. Both lines removed; the page is now `CSS1Compat`
and the corner is clean. Not a word of the card itself was touched.

The same work referenced `video.mp4` while the file on disk was `video.MP4`.
Windows does not care and Linux does, so on Vercel the video would have 404'd
and the card's whole point — a recording — would have been a dead box. The
**file** was renamed rather than the reference, so the change is to a name and
not to content.

**`Тебе.` had a 123 MB hero video.** **GitHub refuses anything over 100 MB**, so it
is re-encoded to 34 MB — h264 CRF 28, audio dropped since the element is
`muted` and the sound is a separate `song.mp3`. Everything else in every
work, including an 8.3 MB GIF and a 2560×1440 clip that are both larger than
they need to be, is untouched: the rule was byte-for-byte, and only a hard
platform limit overrides it. The substitution is stated in the UI, from
`Work.note`, not hidden in a commit message.

Two changes deliberately carry **no** note in the UI, because they alter
nothing a visitor can see, and the panel should not fill with trivia: `Love
is…` arrived as `index (1).html`, a browser download artifact, renamed to
`index.html`; and its `assets/song.mp3` was a byte-identical duplicate of
`song.mp3` (same md5) that nothing referenced — the page loads `./song.mp3` —
so 3.2 MB of it was dropped. `С днём рождения, Алина` needed nothing at all
and is exactly as it was.

`ffmpeg` is not a dependency. It was installed with `--no-save` for that one
job; `package.json` is unchanged, and a fresh clone neither needs nor gets it.

### The header without which the works render in the wrong fonts

`next.config.ts` sends `Access-Control-Allow-Origin: *` for `/w/:path*`. This
is not decoration and it is easy to delete by accident.

The works are framed with `sandbox` and deliberately **without**
`allow-same-origin`, which gives the frame an **opaque origin** — the browser
reports it as `null`. A webfont is subject to CORS, so a `@font-face` request
from a `null` origin is a cross-origin request, and without that header the
browser refuses it. Nothing breaks loudly: the work simply renders in the
browser's fallback fonts, which for `С днём рождения!` meant a generic script
face instead of its own rounded one. That is precisely the promise the section
makes, quietly broken.

The header opens nothing. These are static files already readable by anyone
with the URL, and no cookies travel with them. The fix that must **never** be
used instead is adding `allow-same-origin` to the sandbox — see WorkViewer.

### Known, and left alone

`Пойдём?` throws `Cannot read properties of null` on load: its `script.js`
looks up `btn-yes` by id while the markup gives it as a class. The card works
anyway — the button carries an inline `onclick` — and it is the original's own
bug. Fixing it would break the promise the page makes about being untouched.

### Adding the next one

`lib/works/index.ts` is a list. Drop the files in `public/w/<id>/`, add a row,
generate a cover from the work itself (a real frame beats a mock-up), and it
appears in the gallery, at `/works/<id>` and with a QR at
`/api/works/<id>/qr`. No deploy step, no database.

---

## The template previews were entirely in English

Reported as «убери английский на шаблонах!!!». It was not a missing
translation — it was one omitted argument.

`demoConfig(templateId, locale = 'en')` had a default, and
`app/templates/[slug]/page.tsx` called it as `demoConfig(template.id)`. So
every visitor, in every language, opened a template preview and read an
English card: the letter, the dates, the captions, the sign-off, and the card
chrome around them, on a page whose header and buttons were correctly
Russian. The gallery underneath had the same problem in a smaller form —
`supportedSections` was printed through a `capitalise()` helper, so the
specification row read `Cover · Envelope · Intro` at a Russian reader.

**What changed**

* `locale` is now **required** on `demoStory`, `demoConfig` and the
  `TemplateStage` prop. A default is the wrong shape for a value nobody should
  be allowed to leave unspecified: it turns a forgotten argument into a
  plausible-looking wrong answer for two of the three languages. TypeScript
  now refuses the call that caused this.
* The demo stories moved into `content.demo` in each dictionary, keyed by
  template id. `lib/card/demo.ts` keeps only what is structural — relationship,
  occasion, mood, photo count — the same split the taxonomy and the template
  registry already use. Russian and Uzbek versions are written, not
  translated; a locale missing a story falls back to English rather than to a
  blank card.
* `capitalise()` is gone; the row uses `beatLabel()`, which already had all
  fourteen section kinds in all three languages.
* `Preview of {name}` and `Together` / `No photographs yet` came out of the
  components and into the dictionaries.
* `/works` printed `portedTo` raw — «На её основе есть шаблон: ask». It now
  resolves through the registry, so it reads «Пойдём?».
* `EnvelopeSection` had `aria-label={open ? 'Envelope opened' : …}`. That one
  was English *always*, not as a fallback; it is now `aria-expanded`, which
  screen readers announce in their own language.

The remaining `?? 'Open it'` fallbacks are intentional and stay: they only
fire for a config that bypassed the composer, and the documented rule is to
degrade to English rather than to a blank card.

**Pre-existing, not fixed:** the Uzbek dictionary mixes typographic `‘` with
straight `'` — `sig'maydigan`, `Ba'zi`, `bo'lmadi` sit next to `o‘n`, `qat’iy`.
Cosmetic, visible, and a separate sweep.

---

## Что оператор делает с заказом: два пути

Спрошено 20 августа — «как мне собрать открытку и как её загрузить, чтобы у
заказчика заработал QR» — и с тех пор переписывалось трижды, потому что ответ
менялся. Ниже он целиком и в одном месте.

**Открытка — не файл.** Это строки в базе, которые сайт рисует по адресу
`/c/<код>`. Поэтому QR печатают заранее: код закрепляется за заказом в момент
его создания, а меняется только то, во что он разворачивается.

Путей два, и они не смешиваются.

### Путь A. Открытку собирает движок

1. Прочитать пожелания и слова заказчика. Это единственное, что пишет человек;
   движок ничего не выдумывает.
2. Выбрать шаблон, нажать **«Собрать открытку»**. Пересобрать другим шаблоном
   можно сколько угодно раз.
3. Нажать **«Посмотреть черновик»** — та же открытка, что увидит адресат, с
   плашкой «черновик».
4. Поставить статус **«Опубликован»**. Только теперь `/c/<код>` отвечает.
5. **«Бирка на печать»**, напечатать, привязать к букету.

### Путь B. Открытку пишут руками

Так сделаны все семь работ в разделе «Наши работы», и до 21 августа этот путь
не поддерживался вообще.

1. Прочитать заказ. Если заказчик описал свою идею или показал на нашу работу —
   это написано в карточке **выше** пожеланий: он шаблона не хотел.
2. Сделать папку руками.
3. **Загрузить папку** в блоке «Своя открытка». С этой минуты по коду идёт она.
   Содержимое готово.
4. Поставить статус **«Опубликован»**. Вот это включает адрес.
5. **«Бирка на печать»**.

**«Собрать открытку» на этом пути не нажимают.** Кнопка принадлежит пути A, и
это была главная путаница: она стояла в панели первой и читалась как следующий
шаг. Загруженная папка и есть готовая открытка — собирать после неё нечего.
Деплоить тоже нечего: файлы лежат в базе и отдаются с `/u/<код>/…`.

С 27 августа панель говорит это первой строкой: «Ваша открытка загружена — по
коду открывается она. Собирать больше нечего. Остался один шаг: статус
"Опубликован"». Когда статус уже стоит — подтверждает.

### Два экрана, которые выглядят поломкой и ею не являются

- **«Собрать открытку» будто ничего не делает.** Она пересобирает и пишет в
  базу — но если загружена своя открытка, результат негде увидеть, по коду
  идёт папка. Чтобы увидеть сборку, папку надо убрать кнопкой в том же блоке.
  Открывает при этом не она, а соседняя — «Посмотреть черновик».
- **«Этой карточки здесь нет» по коду.** Значит, заказ не опубликован.
  `/c/<код>` строго для опубликованных, потому что код печатают на бирке. До
  публикации смотреть надо «Посмотреть черновик» — `/c/<код>/preview`,
  который собирает на лету.

**Шага 3 в пути A когда-то не было.** `/c/[code]/preview` существовал, но
кнопка в админке вела на публичный адрес и была заблокирована до `PUBLISHED` —
то есть единственным способом посмотреть открытку было её опубликовать, что
для проверки ровно наоборот. Теперь до публикации кнопка ведёт на черновик,
после — на настоящую открытку.

### The customer chooses a template blind no longer

The live miniature was already being built two steps earlier than it was
shown: the customer picked from a name, a line and four colour dots, then saw
the consequence on the preview step. The same stage now sits beside the
template list, playing their own words in whichever template they are pointing
at, and changes as they point elsewhere.

### Moods are a list

Choosing a second mood used to silently cancel the first. "Смешно и тепло" is
an ordinary order, so the step is multi-select, every match counts in the
template ranking, and the operator sees all of them rather than one.

**Migration 004 adds `orders.moods`.** Applied 22 August — `orders.moods`
verified present.

The script reads `.env.local` now. It is a plain node script, so it never
inherited Next’s env loading and used to demand the connection string be
pasted into the shell — which lasts exactly as long as that terminal, and is
why the same migration looked un-runnable the second time. One line in
`.env.local` (gitignored) and every command in the project reads the same
string; a real environment variable still overrides it for a one-off run.

It can be run whenever — before the deploy, after it, or next week — because
`lib/db/postgres.ts` asks the database once per process whether the column
exists and shapes its statements accordingly. Without that check the gap
between a push to Vercel and a migration run by hand would have broken not
only new orders but *reading every existing one*, since `moods` would have
been in every `SELECT`. Until the migration runs, orders keep working with a
single mood. The first element of `moods` is always what `mood` holds, and
`mood` stays required: the engine wants one value, the human writing the card
wants all of them.

---

## A card written by hand, attached to an order

Until 21 August the product could do exactly one thing: compose a card from a
template. The way these cards are actually made — sitting down and writing one
in HTML, CSS and JavaScript, which is how all seven works in Our work were made
— **was not supported at all**. There was no field, no upload, no route: an
operator holding a finished folder had no way to make `/c/<code>` show it, and
therefore no way to make the printed QR lead to it. That was a hole in the
design, not a missing nicety.

**How it works now.** The order page has a *Своя открытка* panel. Pick the
folder, choose which file it opens with, done — `/c/<code>` shows that instead
of the composition, and everything else (tag, QR, statuses, publishing) is
untouched, because only *what the code resolves to* changed.

- Folder, not archive. `webkitdirectory` hands over the whole folder with
  relative paths intact, so `./assets/song.mp3` keeps working without editing
  anyone’s markup, and no unzip dependency is needed.
- Files live in Postgres (`card_files`), because serverless has no writable
  disk. The precedent already existed: order photographs are stored right
  there as data URLs.
- Served from `/u/<code>/…`, deliberately a different path from the card page,
  so the frame gets a genuinely foreign origin.

**The limit, and it is the platform’s.** Vercel caps a request body at 4.5 MB,
so one file bigger than that cannot be uploaded — not by this form, not by any
form. Measured against the existing works: four of seven upload whole; `ilove`,
`poydem` and `tebe` each have video or audio that will not pass. When that
starts to hurt, the fix is not here — it is uploading straight to object
storage, bypassing the function.

**Isolation, which is the whole reason this was refused before.** `/c/<code>`
shares an origin with the admin, so serving somebody’s script there would let
it read an operator’s session cookie — the exact objection recorded earlier in
this file. The card renders in an iframe with `sandbox="allow-scripts"` and
**never** `allow-same-origin`; those two together cancel the sandbox. Same pair
as the works viewer, same reason.

**Migration 005 adds `card_files` and `orders.custom_entry`.** Applied
22 August — both verified present. Like 004, it could be run whenever: the store probes once per process for the table, the order
columns are probed the same way, and until both run everything behaves as if no
uploaded card exists. Without that probe the gap between a push and a migration
would have taken down the whole admin order page, which reads the file list on
every open — not just the new feature.

---

## A bouquet that assembles as you scroll

Three files arrived from outside as a design update and were taken in as they
came: `components/three/scenes/BouquetAssembly.tsx`,
`components/three/BouquetAssemblyCanvas.tsx`,
`components/marketing/BouquetStage.tsx`. Seven flower heads, the same five-ring
table and the same `curvedPetalGeometry()` as `BloomFlower`, the existing
`BrandTag`, 266 petals in three instanced meshes, and scroll read into a ref
inside a rAF loop so the canvas never re-renders React.

`BouquetScrollStage` is the only thing added around them: the sections are
server components and a ref needs a client one, and this way the whole scene
comes out of `app/page.tsx` in one line.

**It hangs on one section, not two, and that is a compromise.** The intent was
two acts — petals on «Выберите чувство», wrapping and tag on «Прикрепите к
букету». The second is impossible today: `BouquetStage` paints at `-z-10` and
that section is filled with opaque `bg-noir`, which simply covers it. The
canvas was also lit for a dark stage — exposure 0.82, tinted sheen — so it
really belongs to the dark landing edit its author explicitly deferred. When
that arrives, `range` splits the timeline back into two.

**Taken off the page the same day.** It was wired to «Выберите чувство»,
deployed, and looked wrong: stems standing between the occasion cards, a
wrapped bouquet lying across «Добавьте воспоминания». Nothing malfunctioned —
that is what a full-screen `-z-10` layer does behind a page whose sections and
cards are opaque. It reads as one design collaged onto another because it is.

The lesson is the one this file keeps relearning: the risk was named in
advance — opaque sections, a canvas lit for a dark stage — and it was shipped
anyway because the pixels could not be checked. Software rasterisation could
not finish a frame of 266 instanced petals inside any workable timeout, the
same wall the author hit. **A 3D scene that cannot be seen before deploying
must not be deployed onto the landing page.** Put it behind a preview URL, or
wait for eyes.

The four files stay in the tree, unused and building. What is missing is not
code but a place to put it: a section built as a stage — tall, sticky, nothing
opaque in front — or the dark landing edit this was designed against. Wiring
it back is one line in `app/page.tsx`.

### Seen at last: `/design/bouquet`

Added 22 August, after "I still don't see the update" — which was exactly
right. The three files were in the tree and building, and on no page at all.

The stand is what the scene had been missing: **a section taller than the
viewport, a sticky block inside it, and nothing opaque in front.** Copy comes
from the real landing dictionary — «Выберите чувство» and «Прикрепите к
букету» — so it is judged against text of the length it will actually meet,
and no new user-visible string was invented. `robots: noindex`; it is not part
of the product and it does not touch `app/page.tsx`.

**It renders, and the whole arc is intact:** petals in flight → seven heads on
stems → the wrap closing around them → the gold ribbon → the tag. Verified in
a real browser at seven scroll positions, zero console errors.

Two things this proved that had been guesses:

- **Software rasterisation is fine.** The earlier note said a frame of 266
  instanced petals could not be finished inside any workable timeout, and that
  is what stopped anyone looking before the deploy. It is not true with the
  right flags: headless Chromium with `--use-angle=swiftshader
  --enable-unsafe-swiftshader` reports WebGL 2.0 through SwiftShader/Vulkan
  and draws the full scene in a few seconds per frame. **A 3D scene on this
  project can be checked before it ships.** That removes the excuse behind the
  failed landing deploy, so the rule stands with its reason strengthened, not
  weakened.
- **The dark ground was the whole problem.** On `#17130F` the scene reads as
  intended. It was never lit for the light landing.

**And the stand reproduced the original bug once, on the way.** The first
version put `background: #17130F` on `<main>`. The canvas is `fixed inset-0
-z-10`, so an opaque background on any element above it in the stack simply
covers it — the canvas mounted, drew, and showed nothing. That is precisely
what the opaque landing sections did. The ground now lives on its own
`fixed inset-0 -z-20` layer *behind* the canvas. **The rule is not "the page
must be dark", it is "nothing opaque may sit between the viewer and `-z-10`."**
Anyone wiring this into the landing needs that sentence more than the colour.

### The delivery folder breaks `next build`

`update UIUX/` at the repository root is the drop the three bouquet files
arrived in. Its contents are already in the tree, byte for byte — only the line
endings differ — so it carries nothing that is not committed.

It is not harmless. `tsc` compiles it where it sits, the relative imports
inside it (`../geometry`, `./BrandTag`) resolve to nothing there, and
**`next build` fails on four TS2307 errors** before producing a `BUILD_ID`.
It is untracked, so Vercel never sees it and deploys are unaffected; the
breakage is local, and it looks like a fault in the project rather than in a
folder somebody forgot to delete. Deleting it is safe.

---

## The landing redesign this was all for

`design/preview/bir-dunyo-v10.html` — a complete, self-contained preview of
where the landing page is going. Committed to the repository on 22 August so it
survives the machine it was made on; it lives outside `public/`, so it is never
served. `design/preview/DEPLOY-bouquet.md` is the note that came with the
bouquet files.

**It is dark.** `--bg #17130F`, `--fg #F0E7DA`, with `--paper #EDE3D3`,
`--bloom #C2404E`, `--gold #AC8B57`, `--dusk #3A2A28`. That single fact
explains the whole failed deploy earlier the same day: the bouquet canvas is
lit for this page — exposure 0.82, tinted sheen, colours that need a dark
ground — and it was put behind the light one, where it could only show through
the gaps between opaque cards.

**Seven sections, and three of them are stages.** `hero` · `step1` · `works` ·
`memories` · `bridge` · `steps` · `closing`. Three carry `class="tall"` with a
`sticky` block inside — `step1`, `works`, `bridge` — and those are exactly the
scroll stages the current page does not have. This is the *place* that was
missing, not more code: `BouquetStage` needs a section taller than the viewport
with nothing opaque in front of it, and here there are three.

What is genuinely new against the site as it stands:

- **`works` is on the homepage** — «02 — Сделано. Наши работы.», the seven
  cards with year · occasion, as a sticky stage rather than a separate page.
- **`bridge`** — «04 — Мост. Прикрепите к букету.», carrying the line the
  product has needed since the beginning: *«QR — это всего лишь дверь. Дверь
  никто не запоминает.»*
- **A preloader** — «СОБИРАЕМ» with a counter, gated on the scene being ready
  rather than on a timer.
- **Four families** in the preview — Prata, Cormorant Garamond, Playfair
  Display, Inter. Production now ships Cormorant Garamond; the other two are
  the preview still deciding.

Two details to settle before building it, both visible in the copy: the section
numbering mixes labels (`01 Шаг первый`, `02 Сделано`, `03 Шаг третий`,
`04 Мост`), and the `works` cards name «С днём рождения, Алина» — the same
real-name question that is open under Open items.

**Not verified: how it looks.** Its preloader waits for the scene, and software
rasterisation never got past 22 of 100 in any workable timeout. Open the file
in a browser — it is one self-contained page, three.js inlined, no server
needed.

### What building it actually means

Not a port of that HTML. The site is a Next app with typed trilingual
dictionaries and a rule that no user-visible string lives in a component, so
the work is: a dark theme in `globals.css` tokens, three new stage sections,
every string into `ru`/`en`/`uz`, and only then `BouquetStage` wired to the
stages it was written for. The four bouquet files are already in the tree,
building, unused — wiring them back is one line in `app/page.tsx`, and it
should be the *last* step, not the first.

---

## Как переносилась механика образца

Сначала была перенесена вёрстка и сцена, а не движение, и владелец сказал
главное: «отличается». Сравнение нашего кода со скриптом внутри образца
дало пять механик, и ни одна из них не была про цвет:

- **Инерция.** `p += (target - p) * 0.1` каждый кадр. Без неё сборка идёт
  один в один за колесом и встаёт мгновенно. Это и есть «собирается красивее».
- **Камера по ключам**, пять точек. Статичная камера показывает, как объект
  меняется; движущаяся — как за ним идут.
- **Сдвиг вправо** на широких окнах: текст слева, букет не по центру. Это
  была не вёрстка, а недостающий сдвиг камеры.
- **Параллакс от мыши** — мелочь, которая делает сцену живой.
- **Тема по прокрутке** — её перенесли заходом раньше.

**Гейт сцены всё ещё нельзя делать по ширине** — причина выше, в шаге 4.

Из образца не переносились и не будут: панель переключения шрифтов и
отладочная панель 3D — это инструменты автора образца, не часть продукта.
GSAP тоже не переносился: 120 КБ ради интерполяций, которые делает rAF-цикл,
уже есть в проекте.

---

---

## Шаблон перестал быть обязательным

Сделано 27 августа, по прямой формулировке владельца: «когда клиент заполняет,
ему обязательно что-то по шаблону показывается — надо сделать это
опционально». Формально пропустить шаг было можно и раньше, но пропуск лишь
подставлял подобранный шаблон, а в магазин заказ приезжал **без единого следа
того, что заказчик шаблон не хотел вовсе**. Два настоящих случая не имели куда
записаться.

Шаг 6 из 9 теперь предлагает три пути:

| Путь | Что происходит |
|---|---|
| **Готовый шаблон** | как раньше: сетка, живая миниатюра, «пусть подберут за меня» |
| **Своя идея** | текстовое поле: заказчик описывает открытку словами |
| **Как ваша работа** | семь работ обложками; заказчик показывает на ту, что понравилась |

Шаг превью (8 из 9) при этом перестал показывать миниатюру шаблона: она
показывала бы тот самый шаблон, который заказчик только что отклонил, под
заголовком «Вот она». Вместо неё пересказывается его собственная просьба, а
строка «Шаблон» из сводки убирается.

**Финальный экран — то же самое, и найдено позже.** Он предлагал «Посмотреть
черновик» и обещал в тексте, что черновик уже готов, — тому, кто шаблон не
выбирал. Кнопка вела к сборке из отклонённого шаблона. Теперь при своей идее
или выбранной работе кнопки нет, а текст говорит другое: салон прочитает
просьбу, сделает открытку и свяжется; код уже закреплён.

Один и тот же промах в трёх местах подряд — шаг выбора, шаг превью, финальный
экран — потому что все три написаны в предположении, что шаблон есть всегда.
Если появится четвёртое место, где показывается открытка до того, как её
сделали, проверить надо там же.

Второй путь родился из наблюдения владельца, и он же самый ценный: человек
посмотрел «Наши работы» и захотел такое же. До сих пор сказать об этом было
негде.

**Черновик всё равно собирается шаблоном, и это не противоречие.** Без сборки
по коду не было бы ничего, а бирку печатают заранее. Желание едет рядом как
инструкция магазину, а не как отмена сборки: `/c/<код>` работает с первой
минуты, а оператор видит, что собирать надо иначе.

### Где это лежит

`orders.wish`, JSONB, **миграция 006**. Размеченное объединение —
`{"kind":"own","text":"…"}` либо `{"kind":"work","workId":"loveis"}`. Две
текстовые колонки допускали бы состояние, где заполнены обе, а такого желания
не бывает.

**Не в `brief`,** хотя соблазн был: там указания магазину — сроки, упаковка,
самовывоз. Здесь — чем должна быть сама открытка. Оператор читает это как
разные вещи, и слияние потеряло бы различие ровно там, где оно нужно. В
карточке заказа блок стоит **выше** пожеланий и выше текста открытки, потому
что меняет саму задачу.

`workId` сверяется с реестром работ в API, а не принимается на слово:
незнакомый id — отказ 400, а не тихо сохранённый мусор, из-за которого оператор
увидел бы ссылку в никуда.

### Одна ошибка, найденная проверкой, а не рассуждением

Сначала путь и ответ хранились одним полем — `CardWish` прямо в черновике.
Прогон в браузере показал, чего не видно в коде: заказчик пишет свою идею,
из любопытства открывает вкладку с работами, возвращается — **текста нет**,
переключение вкладки его перезаписало. Свои слова терять нельзя ровно так же,
как текст открытки, ради которого черновик и пишется в localStorage.

Теперь путь и оба ответа живут порознь (`wishRoute`, `wishText`, `wishWorkId`)
и переживают любое переключение, а `CardWish` собирается один раз, при
отправке. Пустая своя идея и невыбранная работа дают `null`: заказ, где
написано «шаблон не выбирал», но не сказано чего он хотел, читается как
загадка.

---

## Приглушённый текст не проходил контраст нигде

Пожаловались словами «шрифт, от которого болят глаза, когда читаешь текст
внутри белых боксов». Жалоба оказалась измеримой, а не вкусовой.

`--color-ink-muted` был `#8b7d70`. Замер на живой странице: **3.99** на белой
карточке, 3.58 на `paper`, 3.25 на `paper-warm`, 2.94 на `paper-deep` — при
норме 4.5 для обычного текста. Этим цветом набраны описания в карточках
настроений, поводов и шаблонов, 13 пикселями. То есть неудобно было не
где-то, а **везде, где есть второстепенный текст**.

Стало `#6b6056` — самый светлый тон на той же оси к `--color-ink`, который
проходит 4.5 на всех четырёх поверхностях: 6.12 / 5.49 / 4.99 / 4.51.
Приглушённым он быть не перестал, до `--color-ink-soft` отсюда далеко, иерархия
цела. Тёмной темы правка не касается — там muted выводится из `--noir-fg`.

**И этого оказалось мало, потому что жалоба была про шрифт, а не про цвет.**
Подписи в карточках формы — «Девушке», «Романтично», «Ноктюрн» — были набраны
`font-display`, то есть Cormorant Garamond. Это дисплейный шрифт: его штрихи
тонкие по замыслу, он сделан для заголовка в сорок восемь пунктов, а не для
подписи кнопки в двадцать. Читать им интерфейс действительно утомительно, и
никакой контраст этого не лечит.

Подписи переехали на основной шрифт, 17 пикселей, начертание 500; описания под
ними — с 13 пикселей на 14. Заголовок шага серифом и остался: разница между
«названием экрана» и «подписью элемента» как раз и нужна, а до сих пор её не
было. Правка тронула `Choice` в `StepShell` (получатель, повод, настроение) и
карточки шаблонов и работ в `CreateFlow`.

Способ, которым это нашлось, стоит повторять: не «кажется бледным», а
`getComputedStyle` на проде, перевод цвета через canvas (он один умеет
`oklch`) и формула WCAG. Ответ получается числом, и спорить с ним не о чем.

---

---

## Как искали, и почему это стоит повторять

Две находки 27 августа получены измерением, а не рассуждением, и обе оказались
не тем, чем выглядели.

- **Контраст.** «Кажется бледным» превратилось в число: `getComputedStyle` на
  проде, перевод цвета через canvas (он один разбирает `oklch`), формула WCAG.
  Вышло 3.99 при норме 4.5 — и не в одном месте, а на всех четырёх светлых
  поверхностях сразу.
- **Пропажа текста.** Прогон формы в браузере показал то, чего не видно в
  коде: заказчик пишет свою идею, заглядывает на вкладку с работами,
  возвращается — текста нет. Хранение пути и ответа одним полем перезаписывало
  написанное. Ни один тип и ни одна сборка этого не поймали бы.

---

## Фотографии переехали из заказа в хранилище

Сделано 29 августа, первым из трёх пунктов, которые аудит оставил «требуют
работы». Первым — потому что это единственный из них, который **дорожает со
временем**: пока заказов десяток, переносить нечего, а на тысяче пришлось бы
перекладывать живые данные.

**Что было.** Браузер ужимал снимок до 1600 px и отдавал его data-URL'ом
внутри тела запроса на создание заказа. Там он и оставался — base64 прямо в
строке `orders`. Две беды сразу: тело запроса у Vercel ограничено 4,5 МБ, то
есть шесть снимков с телефона в него просто не помещались; и страница очереди
читала эти строки со всеми снимками разом, отчего её вес мерился мегабайтами
ответа, а не строками.

**Что стало.** Браузер по-прежнему ужимает снимок у себя — это осталось и это
правильно, — но дальше грузит его **напрямую в хранилище**, минуя функцию. В
заказ уезжает адрес.

`app/api/photos/upload/route.ts` выдаёт короткий подписанный токен и больше
ничего; байты снимка через него не проходят.

### Три вещи, которые стоит знать про этот маршрут

**Он открытый, и это не недосмотр.** Форму заказа заполняет человек с улицы,
входа у него нет и быть не должно. Значит, между формой и бесплатным
файлохранилищем для посторонних стоит не сессия, а три рамки: только
изображения трёх форматов, потолок 5 МБ (ужатый снимок — 200–400 КБ, так что
это запас), и ограничение частоты — 40 токенов в час на адрес, то есть три
полных заказа подряд. Снять любую из трёх — открыть чужим людям хостинг за
свой счёт. Причина вписана в `tests/api-guards.test.ts`, и тест из аудита
поймал маршрут сразу, как он появился: каждый API обязан быть либо закрыт,
либо объявлен публичным **с обоснованием**.

**Без `BLOB_READ_WRITE_TOKEN` всё работает по-старому.** Маршрут отвечает 501,
браузер это понимает и возвращается к data-URL внутри заказа, один раз написав
в консоль, почему. Это не украшение: хранилище включается отдельным действием
в чужой панели, и между выкладкой кода и нажатием кнопки всегда есть окно, а
на локальной машине его нет вовсе. Без отката выкладка ломала бы работающую
форму до тех пор, пока человек не нажмёт кнопку.

**Старые заказы переносить не нужно.** `photoSchema` принимает и адрес, и
data-URL — так было с самого начала, и запись в `lib/utils/image.ts` прямо
предсказывала эту правку: «когда загрузки переедут в объектное хранилище,
меняется ровно эта функция». Так и вышло: изменились она и одна кнопка.

### Своя открытка — туда же, и предел снят

Сделано следом, отдельным заходом, потому что трогает безопасность.

Тяжёлые файлы (видео, звук) браузер теперь грузит прямо в хранилище, а в базу
кладётся только адрес — **миграция 009**, колонка `card_files.url`. Предел
4,5 МБ, из-за которого видео и звук трёх работ из семи привязать к заказу было
нельзя вообще ничем, снят.

**Разделение по размеру, а не «всё в хранилище».** Маленькие файлы — вёрстка,
стили, скрипт, картинки — ходят как ходили, байтами в базу. Иначе хранилище
стало бы обязательным, и продукт перестал бы работать там, где его не
включали, ради выигрыша, которого у мелких файлов нет. Ограничение
`CHECK ((bytes IS NULL) <> (url IS NULL))` в самой таблице: у строки заполнен
ровно один источник, и «ни одного» или «оба» база не примет.

**`/u/<код>` по-прежнему отдаёт файл сам, а не редиректом.** Редирект был бы
дешевле и снял бы разом обе гарантии маршрута: заголовок с песочницей ставим
мы, а не хранилище, и проверку «заказ существует и не отменён» делать было бы
негде — адрес в хранилище вечен и никого не спрашивает. Лишний переход байтов
через функцию — цена этих двух гарантий.

**Адрес проверяется, а не принимается на слово.** Хост обязан оканчиваться на
`.blob.vercel-storage.com`, схема — только https. Без этой проверки маршрут
стал бы открытым прокси: чужая страница поехала бы с нашего домена, а трафик к
ней считался бы нам. Проверено, в том числе на `…vercel-storage.com.evil.com`
— отвергается.

Маршрут выдачи токена закрыт `adminOnly`, в отличие от фотографий заказчика:
там форму заполняет человек с улицы и входа быть не может, здесь загружает
оператор. Открытый маршрут, принимающий произвольные типы файлов — а они тут
нужны, от woff2 до mp4, — был бы бесплатным файлохранилищем для интернета.

---

## Приватность: опись и стирание

Начато 29 августа. Полный список — **`PRIVACY.md`**, там же открытые вопросы.

**Почему опись раньше политики.** Пока не составлен список того, что и о ком
мы храним, писать о сроках и правах нечего: политика обещала бы то, чего никто
не проверял.

**Главное, что она проявила.** Людей в продукте трое, и у них разное
положение: заказчик пришёл сам, оператор — сотрудник, а **получатель нас ни о
чём не просил**. Его имя, его фотографии и обращённое к нему письмо
обрабатываются потому, что так решил другой человек. Он не соглашался и часто
узнаёт о сервисе в момент, когда сканирует бирку. Это не юридическая тонкость,
а то, из чего должны следовать остальные решения.

### Стирание достаёт до хранилища

Переезд файлов в объектное хранилище, сделанный в тот же день, создал
обязанность, которой раньше не было. Пока фотографии лежали data-URL'ом в
строке заказа, а файлы открытки — байтами в `card_files`, удаление уносило всё:
строка исчезала, каскад убирал файлы. Теперь и то и другое живёт по постоянным
публичным адресам, и удаление строки на них не действует — «удалить заказ»
означало бы «убрать из панели», а снимки продолжали бы открываться по ссылке.

`lib/storage/erase.ts` собирает адреса из самого заказа и его файлов и стирает
их **до** удаления строки: обратный порядок потерял бы единственный источник
этих адресов. Отказ хранилища не отменяет удаления — ошибки считаются и
пишутся в лог, но не бросаются: файл без заказа хотя бы не связан ни с чьим
именем, а строка с личными данными — связана.

Что считается своим файлом — в `blob-urls.ts`, отдельным модулем без
`server-only` и с тестами. Разделение не косметическое: ошибка тут стоит дорого
в обе стороны — признать чужой адрес своим значит пойти удалять на постороннем
хосте, не признать свой значит оставить чужие фотографии в открытом доступе
после просьбы их убрать. Тот же вопрос задаётся при приёме адреса загруженного
файла, где он мешает `/u/<код>` стать открытым прокси.

### Что нужно решить, прежде чем продолжать

Два вопроса, оба продуктовые, и оба держат остальное:

1. **Срок хранения.** Заказ лежит вечно. Год? Три? Бессрочно, пока не попросят?
   От ответа зависит, писать ли уборщик.
2. **Запрос на удаление опубликованной открытки.** Сейчас удалить можно только
   никогда не публиковавшийся заказ — правило разумное (код напечатан на бирке,
   удаление превращает бумажку в тупик), но на просьбу «удалите мои данные» оно
   отвечает «не можем». Два пути несовместимы: стереть вместе с открыткой —
   бирка ведёт в никуда; стереть только личное, оставив открытку, — она
   переживёт человека, который просил её убрать.

Пока эти два открыты, публичную политику писать рано: она обещала бы сроки,
которых нет, и права, которыми нельзя воспользоваться.

---

## Аудит 29 августа: что нашёл и что починено

Прогон формы и панели на 390 и 1440, восемь заходов, замерами — не на глаз.
Оценка была **15/20**; после правок контраст и цели нажатия закрыты целиком.

### Читаемого четвёртого яруса не существует

`--color-ink-faint` `#b6a99a` не проходил контраст **нигде**: 2.30 на белой
карточке, 2.06 на paper, 1.88 на paper-warm, 1.70 на paper-deep при норме 4.5.
И это не лечится подбором: `--color-ink-muted` `#6b6056` — уже самый светлый
тон на этой оси, проходящий везде, значит всё, что светлее, читаемым быть не
может по построению.

Им было набрано **49 мест живого текста**: счётчик «Шаг 1 из 9», код открытки
в панели — самая важная строка продукта, — «Напрямую», «Только что пришёл из
салона» и инструкция про способ связи, без которой заказчик не поймёт, почему
кнопка не нажимается. Все переведены на `ink-muted`. Осталось одно применение:
значок в PhotoStep, то есть контур, а не текст.

**Урок для следующего раза.** 27 августа я затемнил `ink-muted` по жалобе на
шрифт и не проверил соседний ярус — а он был вдвое хуже. Ярусы цвета надо
мерить семьёй, а не по одному.

### Цели нажатия росли, а вид остался

Ссылки в шапке (21 px), в подвале (16 px) и «На сайт»/«Выйти» в панели не
проходили минимум WCAG 2.5.8 — 24×24. Поднимать сам текст до 44 значило бы
перекраивать вёрстку ради того, чего не видно, поэтому заведена утилита
`tap-44`: невидимый псевдоэлемент растит область попадания до 44 px, не трогая
поток. Проверено нажатием на 12 px выше текста — попадает.

**Строка заказа в очереди была целью 73×16** — главное действие оператора.
Приём «растянутая ссылка» там был начат и не дописан: `after:absolute` стоял, а
`inset-0` и `relative` у строки — нет, поэтому псевдоэлемент схлопывался в
ничто. Дописано; строка стала целью **1232×85**, проверено нажатием в пустую
ячейку.

### Брендовый красный на тёмном не годится для мелкого текста

`--color-brand` `#c2404e` на `#17130f` даёт 3.64, а с `opacity-75` у ссылки
«Открыть →» — **2.55**. Цвет взят из образца и менять его я не стал: вместо
этого мелкие подписи на тёмном переведены на `--color-brand-soft` — та же
розовая семья, 9.83. Затронуты «Открыть →» в ленте работ и две надписи в
«Добавьте воспоминания»; обе секции существуют только внутри тёмного лендинга,
так что светлых страниц правка не касается.

Заодно: мой собственный замер показывал 3.64 вместо 2.55, потому что читал
цвет до применения прозрачности. Прозрачность на тёмном фоне тянет контраст
вниз, и её надо подмешивать вручную.

### Осталось не почином, а решением

Кнопки 33–36 px в шапке и панели проходят минимум AA (24×24) и не дотягивают
до AAA (44×44). Поднимать их значит менять пропорции шапки — это решение о
виде, а не дефект.

---

## Экран после заказа: заказчику там нечего делать

Переписан 29 августа. Раньше он отдавал код крупными буквами, ссылку на
`/c/<код>`, кнопку «скопировать» и «распечатать QR-карточку для букета». Всё
это — инструменты того, кто открытку делает, а не того, кто её заказал:

- ссылка вела на открытку, которой ещё не существует;
- QR печатать нечего и не на что вешать — букета у заказчика нет;
- вернуться по ссылке он всё равно не смог бы, личного кабинета нет.

Это следствие того, что зафиксировано в PRODUCT.md: **Bir dunyo — студия**.
Открытку делают руками, готовую ссылку и бирку отправляют заказчику в
телеграм. Его работа заканчивается на кнопке «Опубликовать», и экран должен
говорить ровно это.

Стало: «Приняли» → что дальше → куда придёт ответ → номер заказа.

**Код остался, но как номер заказа, а не как ссылка.** Он нужен ровно в одном
случае: человек пишет боту, и по коду его заказ находят быстрее — ровно это
бот и просит в своём автоответе. Убрать его совсем значило бы сделать эту
просьбу невыполнимой.

### Почему здесь нет крутящегося прогресса

Владелец показал приём из `cybernet-script-builder`: картинка и строка,
перебирающая «Собираю структуру… Пишу реплики… Почти готово». Там он честен —
в этот момент действительно работает модель.

Здесь не работает ничего: заказ прочитает человек, возможно завтра. Полоска
прогресса обещала бы срок, которого никто не давал, а «Собираем открытку…» в
настоящем времени было бы прямым враньём — в продукте, где честность записана
принципом.

Поэтому перебираются не стадии машины, а **что с заказом произойдёт**:
«Прочитаем всё, что вы написали» → «Подберём форму под ваш повод» → «Соберём
открытку руками» → «Пришлём ссылку и бирку с кодом». Это правда, это не
скучно, и заодно говорит, за что человек платит.

При `prefers-reduced-motion` четыре строки показываются списком, а не
перебираются: смена состояния сохраняется, но не отнимает внимание. Цветок при
этом продолжает тихо дышать — единственное движение на экране, и оно ничего не
обещает.

### Имя получателя оттуда убрано

Первая версия писала «Открытку для {name}» и на живом прогоне дала «Открытку
для **Алина**»: по-русски «для» требует родительного падежа, а склонять
произвольное имя надёжно нельзя — ни своё, ни узбекское, ни японское.
Получателя подтверждают шагом раньше, на превью; здесь он не нужен.

## Tools wired up

**Meshy MCP** is configured globally in `~/.claude.json` as `meshy-mcp-server`
(`npx -y @meshy-ai/meshy-mcp-server`, key in `MESHY_API_KEY`). Verified on
13 August: the server starts, the key validates against Meshy's API, and it
exposes 24 tools. It is a local stdio server, so it only works in Claude Code
on a machine — not in the browser, and not as a claude.ai "custom connector",
which wants a hosted https URL that Meshy does not publish.

`meshy_text_to_3d` is the interesting one: a mesh from a description rather
than a reconstruction from a photograph, which is a different and much better
proposition for anything this product would want.

**Higgsfield MCP** is connected too, with about 5.5 credits left — enough for
two images, not for 3D (20) or video (60+). Meshy had 560 and has **406**; what
they bought is in the 3D section below.

---

## The 3D layer, and what not to do to it

The hero bloom was rebuilt in code on 13 August rather than replaced with a
generated model, and the reasoning is worth keeping: it renders in WebGL
already; what was wrong was flat petals, `meshLambertMaterial` (no specular
term at all), rings nearly coplanar, and a single sphere for a centre. Curved
geometry, sheen, the existing in-memory studio map, five staggered rings and a
crowd of stamens fixed it for zero bytes.

An imported GLB in the *card runtime* remains the thing not to do — the whole
3D layer's claim is that it downloads nothing and degrades to CSS on a weak
phone. Marketing pages are a different matter.

**There is now a generated tag model**, in `assets/3d/tag/` — deliberately not
in `public/`, so Next never serves it and it never joins a deployment. Its
README carries the prompts, the task ids and the honest limits. Read that before
regenerating anything.

Two findings from making it, both worth keeping:

- **Meshy is better than expected on hard-surface objects, and the route
  matters.** A mesh built from a purpose-made design render — flat ground, even
  light, blank face — has none of the baked lighting and lumpiness that a mesh
  built from a *photograph* inherits. The card came out perfectly flat and the
  twisted jute cord survived as real geometry, which is the part that normally
  collapses. The blanket objection to image-to-3D was about photographs, and
  saying so imprecisely nearly cost the attempt.
- **The numbers still argue for shipping renders, not meshes.** 104 514
  triangles and 6.9 MB for an object a person would model with two hundred, all
  fused into one mesh with one material, so the brass eyelet cannot be given
  metal and the cord cannot be given fibre. Remeshing halved the geometry and
  *doubled* the file, because it re-encoded the textures from JPEG to PNG.

### Where it landed: generate the organic, author the designed

The bouquet **was** tested, and the prediction that thin organic geometry comes
out as a blob was wrong — that belief talked the attempt out of happening twice.
The kraft cone has real creases, the jute bow has loops and tails, the stems
below the tie are separate, and the roses keep the spiral of their petals.

The tag went the other way. Two attempts at generating it failed differently:
the first flattened the folded corner and invented lettering, the second turned
the whole card scarlet. `image_to_3d` re-interprets a colour scheme every run,
and that design *is* a colour scheme — cream face, rose reverse, a corner turned
back to show it. So `components/three/scenes/BrandTag.tsx` builds it in code, a
few kilobytes against 2 MB, in the brand's own hexes.

**That is the rule now.** A rose is easier grown than drawn; a rounded rectangle
with a chamfer, a hole and a torus is the opposite. The seam also happens to be
the right one for the product: the flowers will not change and the tag will.

### What is live on `/shops`

The hero is that scene — bouquet mesh plus tag component, joined in the scene
graph, transparent canvas on the page's own paper. It replaced a photograph
that could not be re-shot and so went on showing a plain white rectangle long
after the tag was designed. Below it the tag section is a **still** of the
chosen design: two interactive objects on one page compete rather than add.

`public/3d/bouquet.glb` is 3.98 MB and the only downloaded 3D asset in the
product. It goes through the same gate as everything else, and three.js appears
nowhere in the initial HTML — verified against a production build. Draco would
take roughly half the geometry again if that ever matters.

### Two tools, and why they exist

- `scripts/glb-shrink.mjs` — re-encodes the textures inside a GLB. **Remesh
  always re-exports them as PNG**, twice out of twice: it cuts geometry honestly
  and then trebles the file. The bouquet went 44.29 → 17.32 → **3.80 MB** across
  generate, remesh, shrink while its triangles fell 1 413 730 → 60 682 and
  stayed there. Judge a GLB by its textures first.
- `scripts/glb-render.mjs` — rasterises a GLB to PNG in pure node, no browser,
  no GPU. It exists because a texture bug shipped twice and the *model* got the
  blame both times. **glTF puts UV (0,0) at the image's top-left**, which already
  matches a decoded bitmap's row order, so `imageOrientation: 'flipY'` samples
  every atlas upside down. Pass `flip` to reproduce the failure. Check a model
  here before anyone sees it.

### Credits

560 to start, **406 left** after the tag, the bouquet, four hero photographs and
four tag designs. The two failed tag generations cost 69 of that, and buying the
lesson was worth it.

### The tag design

Concept 1 — the folded corner — from four generated in
`assets/3d/tag/concepts/`. The logo made physical: the bowl of the *d* is a card
with its corner turned, so the tag is the mark rather than a label bearing it.

One finding there is functional, not aesthetic: **a QR must be dark on light.**
Concept 4 reverses it out of a rose band, and part of the scanner population
will not take an inverted code. The tag is read in someone else's shop, in bad
light, on the first try.

---

## Hand-made templates, and how they get in

There are one-off cards written by hand as plain static pages, outside this
repository:

| Where | What | Weight |
|---|---|---|
| `github.com/fird4vzy/invite` | `main.html` + `yes.html`, css, js, five GIFs | **19 MB** |
| `github.com/fird4vzy/1` | `index.html` + mp4 | 2 MB |
| `~/Desktop/проджэктыы/iLove` | one `index.html`, inline style and script, video | 9 MB |

**`iLove/index.html` has a bug to fix at source:** its first line is a markdown
fence — ```` ```html ```` — and its last is ```` ``` ````. A browser renders
both as visible text. Two lines to delete.

### Decided: port them into the engine

Four routes were weighed — link out to them as separate sites, upload and serve
them sandboxed, the same with token substitution, or port them into the template
engine. **Ported.** The others all end with third-party HTML and JS being served
from this origin, which is fine while one person writes them and is a hole the
day somebody else sends one: a script at `/c/[code]` shares an origin with the
admin and can read an operator's session cookie.

Porting removes that entirely. Nothing of theirs is ever served — it is read,
and what comes out is data.

### Reversed 19 August: the ports are gone

The four templates ported from these cards — Aloud, The Window, Ask,
Candlelight — were deleted. They were data pretending to be one specific card,
and they could never be it: a template is beats and variants run through the
engine, while the originals are hand-written HTML with hand-tuned timings. The
gallery promises that *every template below is playing itself*; four of them
were playing something else under the original's name.

Nothing that mattered was lost. The vocabulary the port taught — the `video`,
`question` and `cake` beats, the four look-carrying variants, and `reorder` in
`lib/card/recipe.ts` — lives in the schema and the variant table, not in those
four files, and all of it stayed. What went was 222 lines of template, four
`portedTo` links, twelve dictionary blocks across three languages, and a
builder hint that used Aloud as its example.

The originals are still on the site, byte for byte, under Our work. That is
where they belonged; porting them was the long way round to finding it out.

Two things deliberately left standing:

- `portedTo` stays in the `Work` type with no users. Three lines, and it
  records a real possibility — what was wrong was these four ports, not the
  idea of recording one. The works page now only reaches for the template
  registry when some work actually has the field, so it no longer queries the
  database for nothing.
- The `blush`, `daylight`, `confetti` and `candlelight` palettes now have no
  template, but they are not dead: the admin builder offers every palette to an
  operator building a stored one.

### Why this is cheaper than it looks

**A template is already data, not code.** All six read the same way:

```ts
const sections = standardArc(input, { envelopeVariant: 'wax' });
return applyVariants(sections, this.sectionVariants);
```

Not one writes its own composition. The difference between any two is a palette
(6), a scene (6), which beats play (11), and one word per beat (30 variants).
That fits in a database row and a form — no file, no deploy.

### Как это делалось, и что от этого осталось

Весь план 13–17 августа выполнен, а на четверть — откачен, поэтому здесь он
пересказан коротко: подробный список из пяти вычеркнутых пунктов занимал
полторы сотни строк и описывал в том числе четыре шаблона, которых больше нет.
Кому нужны детали — они в `git log` за те дни.

| Что сделали | Что от этого осталось |
|---|---|
| Такт `video` (14 авг.) | остался: он в схеме и им пользуются |
| Порт `iLove` руками → шаблон «Вслух» (14 авг.) | шаблон удалён 19 авг., такт `video` и вариант вида остались |
| Конструктор шаблонов в `/admin/templates` (14 авг.) | остался и работает: шаблон — строка в базе, не файл |
| Импортёр: ссылка на репозиторий → черновик рецепта (14 авг.) | остался, но выключен — нужен платный ключ, покупать рано |
| Порты `invite`, `1`, `BirthdayParty` руками (17 авг.) | шаблоны удалены 19 авг.; такты `question` и `cake`, музыка и `reorder` остались |

Оригиналы всех четырёх портов живы и лежат в «Наших работах» — байт в байт,
и это их настоящее место.

**Вывод, ради которого стоит это помнить:** каждый порт вскрывал слово,
которого в движке не было, — `video`, `question`, `cake`, `reorder`. Ровно для
этого у импортёра есть поле `unmapped`. Ручные порты просто нашли их раньше.
И порядок оказался важен: строй мы конструктор первым, поля пришлось бы
угадывать, а `reorder` — то, чем «Вслух» отличался от «Ноктюрна», — стал
очевиден только после того, как один шаблон собрали руками.

## Ideas discussed, not built

- Notifying the **customer** when their card is ready — the VPS bot's
  subscriber table is the obvious groundwork.
- More templates. The variant vocabulary in `lib/card/variants.ts` is the real
  lever, not the number of template files; see `templates/README.md`.
- Real accounts. There is one shared password today, so the app knows a caller
  is an operator but not which one, and any operator can act on any shop's
  order.
