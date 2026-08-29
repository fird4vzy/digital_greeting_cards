import 'server-only';

/**
 * ОТКРЫТКИ, НАПИСАННЫЕ РУКАМИ
 * ===========================
 * Папка файлов, привязанная к заказу: `index.html`, стили, скрипт, картинки.
 * Пока у заказа есть `customEntry`, `/c/<код>` показывает её, а не сборку
 * движка. Всё остальное — бирка, QR, статусы, публикация — работает ровно как
 * раньше, потому что меняется только то, во что ведёт код, а сам код заказа
 * решается при его создании и напечатан на бумаге.
 *
 * **Почему в базе, а не на диске.** У serverless-хостинга нет записываемой
 * файловой системы. Прецедент уже есть: фотографии заказов лежат тут же,
 * внутри JSON, как data-URL.
 *
 * **Тяжёлые файлы лежат не здесь.** У Vercel тело запроса ограничено 4,5 МБ,
 * и файл тяжелее лимита не прошёл бы ни этой формой, ни любой другой — из семи
 * работ у трёх не проходили видео и звук, то есть открытку, вся суть которой в
 * записи, нельзя было привязать к заказу. Такие файлы браузер грузит прямо в
 * объектное хранилище, минуя функцию, а сюда приезжает только адрес.
 *
 * Отсюда два источника у строки, и ровно один из них заполнен:
 *
 *   * `bytes` — маленькие файлы: вёрстка, стили, скрипт, картинки. Ходят одним
 *     запросом и лежат в базе. Работают без единой внешней зависимости,
 *     поэтому открытка собирается и там, где хранилища нет вовсе.
 *   * `url` — тяжёлые. Требуют настроенного хранилища.
 *
 * Разделение по размеру, а не «всё в хранилище», выбрано осознанно: перевод
 * всех файлов сделал бы хранилище обязательным, и продукт перестал бы работать
 * там, где его не включили, — ради выигрыша, которого у мелких файлов нет.
 */

/** Верхняя граница на файл. Ниже лимита Vercel, чтобы отказ был свой и внятный. */
export const MAX_FILE_BYTES = 4 * 1024 * 1024;

/** Верхняя граница на всю открытку — защита базы, а не запроса. */
export const MAX_CARD_BYTES = 24 * 1024 * 1024;

export type CardFile = {
  path: string;
  mediaType: string;
  size: number;
  updatedAt: string;
};

/**
 * Содержимое файла: либо байты из базы, либо адрес в хранилище.
 *
 * Размеченное объединение, а не два необязательных поля: «ни одного» и «оба
 * сразу» — состояния, которых не бывает, и тип не должен их допускать. То же
 * правило записано ограничением в самой таблице (миграция 009).
 */
export type CardFileContent =
  | { kind: 'bytes'; bytes: Buffer; mediaType: string }
  | { kind: 'url'; url: string; mediaType: string };

export interface CardFileStore {
  list(orderId: string): Promise<CardFile[]>;
  read(orderId: string, path: string): Promise<CardFileContent | null>;
  put(orderId: string, path: string, mediaType: string, bytes: Buffer): Promise<CardFile>;
  /** Тяжёлый файл: он уже в хранилище, сюда кладётся только адрес. */
  putRemote(
    orderId: string,
    path: string,
    mediaType: string,
    url: string,
    size: number,
  ): Promise<CardFile>;
  remove(orderId: string, path: string): Promise<boolean>;
  clear(orderId: string): Promise<number>;
  /**
   * Адреса файлов этого заказа в объектном хранилище.
   *
   * Нужны при удалении: строки в базе уносит `ON DELETE CASCADE`, а файлы по
   * публичным адресам он не трогает. Без этого списка «удалить заказ»
   * означало бы «убрать из панели», а видео продолжало бы открываться.
   */
  remoteUrls(orderId: string): Promise<string[]>;
}

/**
 * Тип содержимого по расширению.
 *
 * Список, а не угадывание: чужая вёрстка ломается тихо, если стиль приехал как
 * `text/plain`, и разбираться в этом по белой странице невозможно.
 */
const MEDIA_TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  txt: 'text/plain; charset=utf-8',
};

export function mediaTypeFor(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() ?? '';
  return MEDIA_TYPES[extension] ?? 'application/octet-stream';
}

/**
 * Приводит путь из браузера к тому, что можно хранить и отдавать.
 *
 * Возвращает `null`, а не исправленную строку, если путь пытается выйти за
 * пределы папки. Молча вычищенный `../` — это тихо не тот файл, а отказ
 * заметен сразу.
 */
export function normalisePath(raw: string): string | null {
  const path = raw.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').trim();

  if (path === '') return null;
  if (path.length > 300) return null;
  if (path.split('/').some((part) => part === '' || part === '.' || part === '..')) return null;
  // Управляющие символы и обратный слэш в имени — почти наверняка не то, что
  // оператор видел у себя в папке.
  if (/[\u0000-\u001f\u007f]/.test(path)) return null;

  return path;
}

/* -------------------------------------------------------------------------
 * Память: только для разработки без базы.
 *
 * Ровно та же оговорка, что у хранилища шаблонов, и по той же причине: на
 * serverless-хостинге файловая система только для чтения, поэтому «файловое»
 * хранилище на деле живёт в памяти и теряется вместе с процессом.
 * ---------------------------------------------------------------------- */

/** Запись в памяти. `url` и `size` есть только у тяжёлых файлов. */
type Entry = {
  bytes: Buffer;
  mediaType: string;
  updatedAt: string;
  url?: string;
  size?: number;
};

const globalState = globalThis as typeof globalThis & {
  __cardFiles?: Map<string, Map<string, Entry>>;
};
const memory = (globalState.__cardFiles ??= new Map());

export const memoryCardFileStore: CardFileStore = {
  async list(orderId) {
    const files = memory.get(orderId);
    if (!files) return [];
    return [...files.entries()]
      .map(([path, entry]) => ({
        path,
        mediaType: entry.mediaType,
        size: entry.size ?? entry.bytes.length,
        updatedAt: entry.updatedAt,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  },

  async read(orderId, path) {
    const entry = memory.get(orderId)?.get(path);
    if (!entry) return null;
    return entry.url
      ? { kind: 'url', url: entry.url, mediaType: entry.mediaType }
      : { kind: 'bytes', bytes: entry.bytes, mediaType: entry.mediaType };
  },

  async put(orderId, path, mediaType, bytes) {
    const files = memory.get(orderId) ?? new Map<string, Entry>();
    const updatedAt = new Date().toISOString();
    files.set(path, { bytes, mediaType, updatedAt });
    memory.set(orderId, files);
    return { path, mediaType, size: bytes.length, updatedAt };
  },

  async putRemote(orderId, path, mediaType, url, size) {
    const files = memory.get(orderId) ?? new Map<string, Entry>();
    const updatedAt = new Date().toISOString();
    files.set(path, { bytes: Buffer.alloc(0), url, size, mediaType, updatedAt });
    memory.set(orderId, files);
    return { path, mediaType, size, updatedAt };
  },

  async remove(orderId, path) {
    return memory.get(orderId)?.delete(path) ?? false;
  },

  async remoteUrls(orderId) {
    const files = memory.get(orderId);
    if (!files) return [];
    return [...files.values()].map((entry) => entry.url).filter((url): url is string => !!url);
  },

  async clear(orderId) {
    const count = memory.get(orderId)?.size ?? 0;
    memory.delete(orderId);
    return count;
  },
};

/* ------------------------------------------------------------------------- */

type PgClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

/**
 * Создана ли таблица, то есть применена ли миграция 005.
 *
 * Спрашивается раз за процесс и по той же причине, что и колонки заказа: код
 * уезжает на Vercel пушем, а миграция запускается руками, и между этими двумя
 * событиями всегда есть окно. Без этой проверки в окне падала бы не только
 * новая возможность, а вся страница заказа в админке, которая читает список файлов
 * при каждом открытии. До миграции всё ведёт себя так, будто файлов нет.
 */
let tableProbe: Promise<boolean> | null = null;

/** Кешируется только «таблица есть» — см. `hasColumn` в postgres.ts. */
function hasTable(pool: PgClient): Promise<boolean> {
  tableProbe ??= pool
    .query("SELECT to_regclass('public.card_files') IS NOT NULL AS present")
    .then(({ rows }) => {
      const present = Boolean((rows[0] as { present?: boolean } | undefined)?.present);
      if (!present) tableProbe = null;
      return present;
    })
    .catch(() => {
      tableProbe = null;
      return false;
    });

  return tableProbe;
}

/**
 * Есть ли колонка `url`. Спрашивается у базы один раз за процесс, как и
 * остальные необязательные колонки в этом проекте.
 */
let urlColumnProbe: Promise<boolean> | null = null;

function hasUrlColumn(pool: PgClient): Promise<boolean> {
  urlColumnProbe ??= pool
    .query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
          WHERE table_name = 'card_files' AND column_name = 'url'
       ) AS present`,
    )
    .then(({ rows }) => Boolean((rows[0] as { present?: boolean } | undefined)?.present))
    .catch(() => false);

  return urlColumnProbe;
}

export function createPostgresCardFileStore(pool: PgClient): CardFileStore {
  const iso = (value: unknown) =>
    value instanceof Date ? value.toISOString() : String(value ?? new Date().toISOString());

  return {
    async list(orderId) {
      if (!(await hasTable(pool))) return [];
      const { rows } = await pool.query(
        `SELECT path, media_type, size, updated_at
           FROM card_files WHERE order_id = $1 ORDER BY path`,
        [orderId],
      );
      return rows.map((row) => ({
        path: String(row.path),
        mediaType: String(row.media_type),
        size: Number(row.size),
        updatedAt: iso(row.updated_at),
      }));
    },

    async read(orderId, path) {
      if (!(await hasTable(pool))) return null;
      // `url` читается через запрос к схеме, а не предполагается: код уезжает
      // на Vercel пушем, миграция запускается руками, и между этими событиями
      // есть окно. Без проверки в этом окне ломалось бы чтение вообще всех
      // файлов, а не только тяжёлых.
      const columns = (await hasUrlColumn(pool)) ? 'bytes, url, media_type' : 'bytes, media_type';
      const { rows } = await pool.query(
        `SELECT ${columns} FROM card_files WHERE order_id = $1 AND path = $2`,
        [orderId, path],
      );
      const row = rows[0];
      if (!row) return null;

      const mediaType = String(row.media_type);
      const url = row.url ? String(row.url) : null;
      return url
        ? { kind: 'url', url, mediaType }
        : { kind: 'bytes', bytes: Buffer.from(row.bytes as Buffer), mediaType };
    },

    async put(orderId, path, mediaType, bytes) {
      if (!(await hasTable(pool))) {
        throw new Error('card_files нет — запустите npm run db:migrate');
      }
      const { rows } = await pool.query(
        `INSERT INTO card_files (order_id, path, media_type, bytes, size)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (order_id, path)
         DO UPDATE SET bytes = EXCLUDED.bytes,
                       media_type = EXCLUDED.media_type,
                       size = EXCLUDED.size,
                       updated_at = now()
         RETURNING updated_at`,
        [orderId, path, mediaType, bytes, bytes.length],
      );
      return { path, mediaType, size: bytes.length, updatedAt: iso(rows[0]?.updated_at) };
    },

    async putRemote(orderId, path, mediaType, url, size) {
      if (!(await hasTable(pool))) {
        throw new Error('card_files нет — запустите npm run db:migrate');
      }
      if (!(await hasUrlColumn(pool))) {
        // Внятный отказ вместо ошибки Postgres про несуществующую колонку:
        // оператор увидит, что делать, а не текст драйвера.
        throw new Error('Колонки card_files.url нет — запустите npm run db:migrate');
      }
      const { rows } = await pool.query(
        `INSERT INTO card_files (order_id, path, media_type, bytes, url, size)
         VALUES ($1, $2, $3, NULL, $4, $5)
         ON CONFLICT (order_id, path)
         DO UPDATE SET bytes = NULL,
                       url = EXCLUDED.url,
                       media_type = EXCLUDED.media_type,
                       size = EXCLUDED.size,
                       updated_at = now()
         RETURNING updated_at`,
        [orderId, path, mediaType, url, size],
      );
      return { path, mediaType, size, updatedAt: iso(rows[0]?.updated_at) };
    },

    async remove(orderId, path) {
      if (!(await hasTable(pool))) return false;
      const { rows } = await pool.query(
        'DELETE FROM card_files WHERE order_id = $1 AND path = $2 RETURNING path',
        [orderId, path],
      );
      return rows.length > 0;
    },

    async clear(orderId) {
      if (!(await hasTable(pool))) return 0;
      const { rows } = await pool.query(
        'DELETE FROM card_files WHERE order_id = $1 RETURNING path',
        [orderId],
      );
      return rows.length;
    },

    async remoteUrls(orderId) {
      if (!(await hasTable(pool)) || !(await hasUrlColumn(pool))) return [];
      const { rows } = await pool.query(
        'SELECT url FROM card_files WHERE order_id = $1 AND url IS NOT NULL',
        [orderId],
      );
      return rows.map((row) => String(row.url));
    },
  };
}
