# Where this project stands

Written to be read first — by a person picking the work back up on another
machine, or by an assistant starting a session with no history. The README
explains how the product works; this says what state it is in right now and
what is waiting.

**Last updated:** 27 August 2026 — the dark edition moves like the sample, and
the admin now says out loud what it used to do silently: an uploaded card
overrides the composition, and a code does not resolve before publishing.
Template choice is optional in the flow. **One thing is still half-done: the
`/shops` button leads to `@birdunyobot`, and nobody reads what is written
there.**

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
| **Тёмная редакция лендинга** — самое свежее | `/design/landing` |
| **Букет, собирающийся по прокрутке** | `/design/bouquet` |
| Наши работы: семь открыток, каждая крутится живьём | `/works` |
| Шаблоны: шесть, каждый играет сам себя | `/templates` |
| Предложение цветочным магазинам | `/shops` |
| Панель оператора | `/admin` |

Букет смотреть **с ноутбука**, прокручивая медленно: сборка размазана на
четыре экрана. С телефона он тоже нарисуется, но выглядит плохо — см. ниже,
это известная нерешённая вещь, а не поломка.

### Шаг 1. Четыре вещи, которые могу сделать только вы (~20 минут)

Это не код, это доступы и живая база. Ни одну из них я сделать не могу.

1. **Отозвать токен бота.** `/revoke` у @BotFather → новый токен в переменную
   `TELEGRAM_BOT_TOKEN` в Vercel → **Redeploy**, иначе переменная не подхватится.
   Старый токен лежал в чате, и это единственный настоящий риск в проекте.
2. **Проверить, что уведомления живы.** `/admin` → панель уведомлений →
   «отправить тестовое». Она показывает отказ Telegram дословно: *chat not
   found* — неверный chat id или бот не в группе; *Unauthorized* — токен мёртв.
   Заказ при этом не создаётся, в отличие от старого способа проверки.
3. **Удалить тестовый заказ `RWNPJV`** в панели. Он неопубликован, кнопка
   удаления есть.
4. **Проверить VPS снаружи:** `nc -vz <ip> 5432`. Если отвечает — там открытый
   PostgreSQL с паролем из публичного репозитория; привязать к `127.0.0.1`.
   Бот на том VPS всё равно мёртв, от него здесь ничего не зависит.

### Шаг 2. Два ответа, которые разблокируют меня (2 минуты)

Напишите ответ в чат — дальше я сделаю сам.

1. **Алина в «С днём рождения, Алина» — настоящий человек?**
   Это единственный вопрос с последствиями. Обезличивая `hbday`, я подставил
   туда «Алина» — потому что это демо-имя всего сайта. Но в `svechi` Алина уже
   была своя, нетронутая. Если она реальна, я не убрал имя, а **размножил** его
   с 2 вхождений до 12 и вынес в заголовок карточки в публичной галерее.
   *Да* → меняю в обоих местах: `<title>`, `script.js` и название в
   `lib/works/index.ts` у `svechi`, и явно выдуманное имя у `hbday`.
   *Нет* → ничего не делаю, и пункт закрывается записью, что совпадение
   намеренное, чтобы его перестали переоткрывать.
2. **Годы у `svechi`, `loveis`, `ilove`.** Сейчас у всех трёх стоит `2025` — это
   моя оценка, а не факт: ни у одной папки не было истории, mtime у всех
   сегодняшний из-за OneDrive. Скажите настоящие — по одной строке в
   `lib/works/index.ts`.

### Шаг 3. Поставить настоящий телеграм перед показом магазинам

`lib/shops/offer.ts`, поле `telegram`. Там `@birdunyo` — заглушка, которая
просто выглядит настоящей: никто не проверял, существует ли этот аккаунт и ваш
ли он. Пока это не исправлено, `/shops` показывать нельзя — кнопка «написать»
уведёт в никуда. Там же лежат все цифры предложения, помеченные как
предварительные; меняете файл — страница следует за ним.

### Шаг 4. Тёмная редакция лендинга — начата 26 августа

Образец лежит целиком — `design/preview/bir-dunyo-v10.html`, открывается
двойным щелчком. **Подробный порядок работ — в `design/dark-landing-plan.md`:**
13 шагов с настоящими путями и номерами строк, плюс двенадцать решений,
которые принимаются глазами. Сырьё разбора — рядом, в `design/analysis.json`.

**Сделано (шаги 1–5 плана).** Цвет получил имена ролей — `surface`,
`on-surface`, `edge`, `brand`, `cta`, — и только такие имена может подменять
тема. Литеральная палитра осталась на месте: `bg-ink` у `PhoneFrame` — это
чёрный пластик корпуса, а не цвет текста, и тема, перевернувшая его,
сделала бы корпус кремовым. Стенд `/design/landing` — вся главная в тёмной
области; `app/page.tsx` не тронут.

**Сделано 27 августа — шаги 7–12 в первом приближении.** Стенд собран по
образцу, а не по нынешней главной: герой, сцена «Выберите чувство» с
букетом позади, лента работ на прокрутке, воспоминания, мост с фразой
про дверь, шаги, финал. Тёмным секциям — роль `--color-stage` глубже
фона, границы вернулись; на светлой странице роль равна прежнему noir.
Камера держит кадр по ширине формулой образца, на узких сцена
вполголоса, а где канвас не поднялся — SVG-букет одной линией вместо
пустоты. Проверено снимками на 1280 и 390; светлая главная не сдвинулась.

Осталось: зерно и тонкая типографика, второй акт сцены на мосту (сейчас
букет собирается целиком в первом), шнурок бирки, и две почти
одинаковые фразы про дверь рядом — `doorLine` моста и `note` шагов,
какая остаётся — решение глазами. Шаг 13 сделан 27 августа
после просмотра стенда на проде: тёмная редакция стоит на `/`, бирка
на шнурке, сцена в два акта. Прежняя светлая композиция — в
`FeelingSection`/`StorySection` и в истории git; остальные страницы сайта
по-прежнему светлые — их очередь следующая, если решим вести тёмное
дальше главной.

**Почему букет последним.** Его уже выкатывали на светлый лендинг и сняли в тот
же день: канвас рисуется на `-z-10`, а секции лендинга непрозрачные и просто
закрывают его собой. Правило, которое надо унести с собой, не «страница должна
быть тёмной», а **«между зрителем и `-z-10` не должно быть ничего
непрозрачного»**. Стенд `/design/bouquet` построен по этому правилу — и на нём
видно, что сцена целая: лепестки → цветы → обёртка → лента → бирка.

Два мелких вопроса из образца, которые решаются на глаз до вёрстки: нумерация
секций мешает разные подписи (`01 Шаг первый`, `02 Сделано`, `03 Шаг третий`,
`04 Мост`), и карточки `works` там называют «С днём рождения, Алина» — то есть
шаг 2 надо закрыть раньше, чем верстать.

**И одна вещь покрупнее: на телефоне сцену никто не ограничивал.** В записке
автора сказано «3D включается от 680 px» — **этого гейта не существует**. Ни
`BouquetStage`, ни `BouquetAssemblyCanvas`, ни `useMotionPrefs` шириной экрана
не интересуются вообще: `useMotionPrefs` смотрит только на
`prefers-reduced-motion`, число ядер (>3), `deviceMemory` (>3), режим экономии
трафика и 2g. Любой современный телефон это проходит.

Проверено на 390 px: канвас монтируется, сцена рисуется — и **композиция
разваливается**. Камера не подстраивается под узкий экран, букет занимает его
целиком, а текст ложится прямо на цветы: «Цветы приезжают так же, как всегда»
читается поверх обёртки. Это не поломка и не ошибка в консоли, поэтому само
оно не всплывёт — всплывёт у первого посетителя с телефона.

**Переснято 26 августа, и бед там две, а не одна.** С 0.3 до 0.8 букет
вырастает во весь экран, и текст ложится поверх крафта — это то, что было
записано. А после 0.9 сцена **исчезает совсем**: остаётся заголовок на
пустом чёрном. Второе выглядит хуже первого: не «некрасиво», а
«сломалось».

Решать это придётся при вёрстке тёмной редакции, и **гейт из трёх
вариантов вычёркнут**. Разбор 26 августа показал, что записка автора
прочитана неверно всеми: `NARROW` в образце управляет прозрачностью
SVG-заглушки, а не сценой — автор никогда не выключал 3D по ширине. И
гейт делать нельзя: `rich` из `useMotionPrefs` читают трое, и `Atmosphere` — это
гейт WebGL **опубликованных открыток**, которые открывают как раз с телефона
по QR с бирки. Плюс у `BouquetStage` нет запаски, в отличие от `Atmosphere`, так
что гейт дал бы пустой чёрный экран. Остаются два: кадр по ширине
(`Math.max(1, 1.5/aspect)` из самого образца — на десктопе равен единице и
ничего не трогает) и SVG-заглушка, которая закроет и слабые устройства, и
запрещённый WebGL, и reduced-motion сразу.

**И бирка висит в воздухе.** На высоте бирки (`y = -0.34`) поверхность
обёртки лежит на радиусе 0.81, а сама бирка — на 1.71 от оси
(`tagTo` в `BouquetAssembly.tsx:210`). Зазор 0.9 — почти во всю ширину обёртки,
и шнурка между ними нет. Та же болезнь, что чинили на `/shops`, где место
крепления пришлось измерить, а не угадать.

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
| `TELEGRAM_BOT_TOKEN` | set — but the token still wants revoking, see item 1 |
| `TELEGRAM_CHAT_ID` | set. A new order writes to the group |

Both migrations in `lib/db/migrations/` are applied to the live database.
Verified by placing a real order against production: it was accepted, arrived
as `NEW`, and stored its brief.

---

## Open items

1. ~~**Старый бот и его токен.**~~ **Закрыто 27 августа.** Старый токен
   отозван руками владельца; новый бот `@birdunyobot` создан, его токен в
   Vercel, бот в той же группе. Код не менялся и не должен был:
   `notifyNewOrder` читает обе переменные при каждом вызове.
   Сквозная проверка того же дня: тестовый заказ `S75QJH` создан через
   боевой API и сразу удалён из базы — если сообщение о нём пришло в
   группу, цепочка работает целиком.
   **Сообщение НЕ пришло, и скриншот группы почти назвал причину.** Два
   подозреваемых, оба видны на скрине от 27 августа:
   — У группы включены топики, значит она супергруппа. При превращении
   обычной группы в супергруппу chat id МЕНЯЕТСЯ на вид `-100…`; старый
   `TELEGRAM_CHAT_ID` со времён «Lume» тогда мёртв, и Telegram отвечает
   «group chat was upgraded to a supergroup chat».
   — Старый и новый боты оба называются «delovoybot», различаются только
   username. В участниках числится какой-то «delovoybot» — если это старый,
   то нового `@birdunyobot` в группе нет, а бот не может писать в группу,
   где не состоит.
   **Порядок починки:** (1) ткнуть в участника «delovoybot» и сверить
   username — должен быть `@birdunyobot`, чужого убрать, нужного добавить;
   (2) открыть группу в web.telegram.org — в адресной строке будет
   `#-100…` — это и есть правильный `TELEGRAM_CHAT_ID`, целиком с `-100`;
   (3) обновить переменную в Vercel для Production → Redeploy → кнопка
   проверки в `/admin`, она покажет отказ Telegram словами, если что-то
   ещё не так.
2. ~~**`TELEGRAM_CHAT_ID` is missing.**~~ **Done** — reported working on
   13 August: the bot is connected and a new order writes to the group. This
   entry stayed marked open long after it was fixed and sent a whole session
   after the wrong priority, which is the argument for closing items here as
   they land rather than in a batch afterwards.
   `/admin` now carries a notifications panel that reads the configuration
   server-side and sends a test message on demand, reporting Telegram's own
   refusal. It was built for this item and outlived it, because the useful half
   is the part that survives a working setup: both variables can look set while
   the token is revoked or the chat id is wrong, and `notifyNewOrder` must
   swallow that failure so an outage cannot break a customer's order. *chat not
   found* means the id is wrong or the bot was never added to the group;
   *Unauthorized* means the token is dead. Nothing about it creates an order,
   which is the point — see item 3.
3. **Флорист пишет в пустоту.** Кнопка на `/shops` теперь ведёт на
   `@birdunyobot` — адрес существует, в отличие от прежнего `@birdunyo`,
   который открывался ошибкой Telegram. Но бот только отправляет:
   `lib/notify/telegram.ts` ничего не опрашивает и не имеет вебхука, поэтому
   написанное боту не увидит никто. Два выхода, оба честные:
   поставить в `lib/shops/offer.ts` личный username человека — одна строка,
   работает сегодня; или сделать вебхук, который пересылает любое
   сообщение боту в ту же группу — маршрут, регистрация адреса у Telegram
   и проверка секретного токена в заголовке. До этого страницу лучше не
   раздавать магазинам.
4. **One test order is on production** and should be deleted from the
   dashboard: `RWNPJV`. It is unpublished, so the delete button is offered.
   The pair of junk orders that prompted the panel in item 2 came from the only
   way to test a deployment that used to exist: placing a real order against it.
4. **The VPS bot is dead** — it polls with the revoked token. Give it the new
   one or leave it down; nothing here depends on it.
5. **That VPS publishes PostgreSQL on `5432`** with credentials that are in its
   public repository. Worth checking from outside (`nc -vz <ip> 5432`) and
   binding to `127.0.0.1` if it answers.
6. ~~**The card published as `5HZKCH` still shows English wishes.**~~ **Gone,
   verified 22 August.** A card *is* an order — `toPublishedCard(order)`, and
   there is no separate cards table — so deleting the order deleted the card.
   Only `SGNZ99` remains in the database. The lesson survives the item: cards
   are composed once and stored, so fixing the code never rewrites an existing
   one, and "Собрать открытку" on the order is what regenerates it.
7. **The demo name and a real one may be the same person.** `svechi` — «С днём
   рождения, Алина» — carries `Алина` in its `<title>` and in `script.js:4`,
   untouched, because that work needed no changes at all. Anonymising `hbday`
   then replaced *its* recipient's name with `Алина` as well, that being the
   demo recipient the rest of the site already uses. So if the Алина in
   `svechi` is a real person, the substitution did not remove her name — it
   spread it from 2 occurrences to 12, and it now sits in a public gallery as a
   card's title.
   **One answer decides it.** Real → change both: `<title>`, `script.js` and
   the title in `lib/works/index.ts` for `svechi`, and a plainly invented name
   for `hbday`. Not real → nothing to do, and this entry closes saying the
   collision is deliberate, so it stops being rediscovered.
8. **The years on `svechi`, `loveis` and `ilove` are still guesses.** `2025` is
   a middle estimate placed between the 2024 works and the 2026 one. One line
   each in `lib/works/index.ts` corrects them.

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
### Next, in this order

**Superseded — the current, actionable list is «Что делать дальше — по шагам»
at the top of this file.** Kept below because the reasoning still holds and the
struck-through entries record what was decided and why.

1. **Close the STATUS items above.** A shop page in front of a product whose
   notifications do not work is worthless — the brief never reaches anyone.
2. ~~**Build `/shops`.**~~ Done. Six blocks: the offer, an earnings calculator
   driven by the florist's own bouquet price and volume, the product playing
   itself in a phone, the three-step workflow with real timings, the five
   questions shops actually ask, and a Telegram conversation instead of a
   signup form. Linked from the footer. A price *table* turned into a
   *calculator* deliberately — a florist wants to know what it adds to their
   counter, not what a card costs in the abstract.
   **Before showing it to anyone:** set `telegram` in `lib/shops/offer.ts`. It
   reads `@birdunyo`, which is a placeholder that merely looks real — nobody
   has checked whether the handle exists or registered it.
3. **Templates.** The plan is its own section further down — a video beat, then
   one hand port, then a builder, then an importer. That is the next real work.
4. **Do not rebuild the homepage yet.** The current landing is what a shop
   sends its customer; it is written for exactly that. Rewriting it for an
   audience nobody has spoken to yet is optimising blind. Talk to five
   florists first.

Bear in mind the website is not the main tool while there are zero shops. The
first ten close by walking in with a phone, showing a real card, and leaving a
printed tag. The page is what they open after you leave, to check you are not
a student project.

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

## What an operator actually does with an order

Asked on 20 August, in the form "how am I supposed to build the card, and how
do I upload it so the customer gets a QR?" — which is the right question, and
the answer had never been written down anywhere the operator could see it.

**Nothing is ever uploaded, and the card is not a file.** It is rows in a
database rendered by this site at `/c/<code>`. That is the whole reason the
QR can be printed before the card is finished: the code is decided when the
order is created, and only what it resolves to changes.

The order of operations, now printed on the order page itself in all three
languages:

1. Read the brief and the customer's own words. That is the only writing a
   person does — the engine invents nothing.
2. Pick a template, press **Собрать открытку**. The card is composed from the
   answers; recomposing with a different template is free and repeatable.
3. Press **Посмотреть черновик**. Same card the recipient will see, with a
   banner saying it is a draft.
4. Set the status to **Опубликован**. Only now does `/c/<code>` resolve.
5. Press **Бирка на печать**, print, tie to the bouquet.

**Step 3 did not exist.** `/c/[code]/preview` was built for exactly this and
composes on the fly, but the admin button pointed at the public URL and was
disabled until `PUBLISHED` — so the only way to see a card was to publish it,
which is the wrong order for a check. The button now points at the preview
before publishing and at the real card after.

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

## The headings were never in the right typeface

Fixed 22 August, and it had been wrong on the live site the whole time.
`Instrument Serif` has **no Cyrillic at all** — its subsets are `latin` and
`latin-ext` — and `layout.tsx` asked for `subsets: ['latin']` on both families
anyway. Every Russian and Uzbek-Cyrillic heading was being drawn by the
fallback, Georgia: wrong face, wrong weight, wrong rhythm, on two of the three
languages this product ships in.

`Cormorant Garamond` replaces it, for two reasons at once: Cyrillic, and a
**real italic**. The italic is not decoration here — whole landing lines lean
on it («в сообщение.», «чувство.») and a face without one gets slanted
algorithmically by the browser, which on Cyrillic looks bad. That is also why
`Prata`, closest in character, was rejected: no italic.

The CSS variable is still `--font-instrument-serif`. `globals.css` is wired to
that name and renaming it would have inflated the diff for nothing.

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

### The plan, in order

1. ~~**A video beat.**~~ **Done, 14 August.** `video` is the twelfth section
   kind, declared by all six templates, and it composes straight after the
   letter — a recording is the closest thing to the sender being in the room,
   and it lands hardest once the words have set it up. Verified through the real
   path: with a clip the arc runs cover → envelope → intro → letter → **video**
   → gallery → quote → final → closing, and the beat's title arrives in the
   *card's* locale rather than the reader's.

   It is the one beat that can cost megabytes, so it spends nothing until it is
   asked to: the `<video>` is not mounted until the beat is near the viewport,
   `preload` is `none`, and a poster stands in until then. Autoplay is muted,
   in-view only, and off entirely under reduced motion.

   **It takes a URL, not a data URL**, and that is the important consequence.
   Photographs are inlined into the order record today; a nine-megabyte clip
   would be a twelve-megabyte database row. This field is where object storage
   stops being optional — the README already lists inlined photos as a known
   gap, and this makes it due.
2. ~~**Port `iLove` by hand.**~~ **Done, 14 August.** It is `templates/aloud/`,
   called *Вслух / Aloud / Ovoz bilan* — the one where the sender speaks. Live
   at `/templates/aloud`.

   **The port needed no markup, and cost one palette and one reordering.** The
   original was a single 40 KB HTML file with its styles and script inline; its
   four screens mapped onto `cover → envelope → video → letter` exactly, its
   letter was already blank-line separated paragraphs, and its flying hearts
   became the `petals` scene over a new `blush` palette taken from its own hex
   values. The only custom code is a `compose` that moves the video ahead of
   the letter, the same technique `anniversary` uses for its timeline: you
   watch someone say it, and the words that follow read as what would not fit
   in the camera.

   **The choreography was then ported too**, after the first pass turned out to
   be the right skeleton in the engine's default clothes. Four variants carry
   it, added the way `templates/README.md` prescribes so the next template gets
   them free:

   - `cover: gradient` — colour travelling along the name, three stops and back
     over seven seconds.
   - `envelope: heart` — not an envelope. The gate is a heart built from one
     rotated square and two circles, and tapping it sends the note up out of it
     rather than lifting a flap. The original's units are kept (a 125px square
     at −45°, circles offset by half its width) because those numbers are what
     make the lobes meet the point.
   - `video: screen` — the clip in a near-black box even in a light palette. A
     video is a window and a window is darker than its wall; without that it
     reads as an illustration pasted onto paper.
   - `letter: lines` — one line at a time, each resolving out of blur. The
     original does this with thirty-six hand-written `nth-child` rules, which
     works once, for a letter of exactly that length; here the stagger is an
     index. The blur went to `lib/design/motion.ts` as a `focus` preset.

   Hearts are thrown on the tap — fourteen, outward but never straight down,
   because hearts that sink read as falling rather than escaping.

   **What still does not survive a port is timing that was tuned by hand**, and
   that is worth expecting rather than treating as a fault when the importer
   makes the same trade automatically.

   Verified through the real path: given a clip, `aloud` composes
   cover → envelope → intro → **video → letter** → gallery → quote → final →
   closing, while `romantic` on the same input keeps letter → video.
3. ~~**A builder in `/admin/templates`.**~~ **Done, 14 August.** Pick a palette,
   a scene, the beats and a look for each, plus one optional reordering, and
   save. It appears in the gallery, at `/templates/<id>` and in the creation
   flow with no deploy.

   **A template is a row now, not a file.** `lib/card/recipe.ts` is the shape
   and `recipeToDefinition` rebuilds a working `TemplateDefinition` from it,
   `compose` included, so nothing downstream can tell a stored template from a
   compiled one. Stored in `card_templates` as JSONB — migration
   `003-templates.sql`, and **`npm run db:migrate` has to run against
   production before the next deploy.**

   Every control is an enum drawn from the vocabulary the renderer implements,
   so a form post cannot ask for a look nobody built — the same guarantee the
   AI layer has, for the same reason. An id belonging to a compiled template is
   refused outright rather than shadowing it.

   Two things it deliberately does not do. **The AI planner will not see a new
   template until the next restart**, because `lib/ai/schema.ts` builds its
   enum at module load; the cost is a slightly worse suggestion, never a broken
   card. And **there is no live preview in the form** — save it and open
   `/templates/<id>`, which plays the real thing rather than an approximation
   of it.

   Verified end to end against a production build: a recipe written straight
   into the store appears in the gallery beside the seven compiled ones and its
   page renders.

   Still to come: "save this order as a template", which is now cheap because a
   finished order already carries most of these fields.
4. ~~**An importer.**~~ **Done, 14 August.** A field at the top of the builder:
   paste a public GitHub URL, and it reads the repository's HTML, CSS and JS
   and fills the form below.

   It is the card planner with a different input. `lib/ai/import-schema.ts`
   holds the contract, and every field in it is an enum built from what the
   renderer implements — so the model cannot emit markup any more than the
   planner can, because there is no field for markup. **That is also what
   removes the security problem the other three routes had:** serving a
   stranger's HTML puts their script in the same cookie jar as the admin, and
   reading it produces data, which does not run.

   **It never saves.** The mapping is a judgement and some of those judgements
   will be wrong, so the result lands in the form for an operator to correct.

   `unmapped` is the field worth watching. The model is told to list screens no
   beat covers rather than stretch a beat to fit — that list is the engine's
   missing vocabulary, named by the thing that needed it. The video beat exists
   because a hand port turned one up the same way.

   Private repositories are refused rather than asked for a token. A feature
   that reads source should not start collecting credentials that can read
   source.

   **It is not switched on, deliberately.** `ANTHROPIC_API_KEY` is unset and
   buying one was weighed and declined on 17 August: the importer saves work on
   templates that are now all ported, and the four that existed were done by
   hand for nothing. Turn it on when somebody other than the two of us needs to
   add a template, or when there are thirty rather than ten.

   Setting the key no longer switches the card planner — that needs
   `AI_PLANNER=on` as well. They were one switch, which quietly coupled an
   operator tool run a handful of times to every customer's letter being
   rewritten by a model. At this volume a person writes better, which is why the
   product is concierge; the planner stays off until writing by hand gets
   expensive.

   The importer also takes a **folder**, not only a URL. Most hand-written cards
   are a folder on a desktop, and the browser posts only the text — images,
   audio and video are filtered out, because they belong to a card rather than a
   template.

5. ~~**`invite` and `1` through the builder.**~~ **Ported by hand instead, 17
   August, along with `BirthdayParty`.** The importer needs a paid key that is
   not worth buying yet — see the note below — and four templates by hand is an
   afternoon, so they were done properly rather than approximately.

   | Original | Template | What the engine was missing |
   |---|---|---|
   | `iLove` | **Вслух / Aloud** | the `video` beat |
   | `1` | **За окном / The Window** | `cover: film` — video *behind* the type |
   | `invite` | **Пойдём? / Shall We** | the `question` beat |
   | `BirthdayParty` | **При свечах / Candlelight** | the `cake` beat, card-level music |

   **All four originals are now also in «Наши работы»**, so the section shows
   both the card that was made for a person and the template it became. The
   table above doubles as the mapping `Work.portedTo` renders.

   Ten templates now, four of them ported. **Every port turned up vocabulary
   the engine did not have**, which is the same thing the importer's
   `unmapped` field is for — doing them by hand simply found it sooner.

Order mattered, and it paid: building the builder first would have meant
guessing its fields, and the `reorder` field — the one that separates *Aloud*
from *Nocturne* — only became obvious after porting a template by hand.

---

## Ideas discussed, not built

- Notifying the **customer** when their card is ready — the VPS bot's
  subscriber table is the obvious groundwork.
- More templates. The variant vocabulary in `lib/card/variants.ts` is the real
  lever, not the number of template files; see `templates/README.md`.
- Real accounts. There is one shared password today, so the app knows a caller
  is an operator but not which one, and any operator can act on any shop's
  order.
