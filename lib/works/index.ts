import 'server-only';

/**
 * НАШИ РАБОТЫ — открытки, сделанные руками, до появления движка.
 *
 * Это не шаблоны и специально не проходят через компоновщик. Шаблон —
 * производственная система: данные, из которых собирается новая открытка.
 * Работа — то, что уже отдали живому человеку, и её задача одна: показать
 * будущему клиенту, что бывает. Порт для этого — ухудшение, потому что
 * ручные тайминги порт не переживают (см. STATUS.md про Aloud).
 *
 * Поэтому файлы лежат в `public/w/<id>/` **байт в байт** такими, какими были
 * отданы, и отдаются статикой. Единственное исключение задокументировано в
 * поле `note` — его видно и в админке, и здесь.
 *
 * **Как они изолированы.** Страница `/works/<id>` показывает работу во
 * фрейме с `sandbox="allow-scripts"` и **без** `allow-same-origin`. Пара этих
 * флагов вместе отменяет песочницу, поэтому второго здесь нет и быть не
 * должно: чужой скрипт получает opaque origin, не видит куки этого домена и
 * не достаёт DOM родителя. Именно это снимает возражение, из-за которого в
 * STATUS.md отказались отдавать сторонний HTML со своего домена — там речь
 * шла про `/c/[code]`, который делит origin с админкой.
 */

export type Work = {
  id: string;
  /** Файл, с которого открывается работа, внутри `public/w/<id>/`. */
  entry: string;
  /** Собственное имя работы, на её языке. Не переводится — это её название. */
  title: string;
  /** Год. Строкой: часть из них датируется приблизительно. */
  year: string;
  /** Повод из общей таксономии — чтобы фильтры совпадали с шаблонами. */
  occasion: string;
  /** Обложка в галерее: настоящий кадр из самой работы. */
  cover: string;
  /** Соотношение сторон обложки — чтобы не было скачка вёрстки. */
  coverRatio: string;
  /** Шаблон, в который её уже портировали, если это делали. */
  portedTo?: string;
  /** Честная пометка о любом отличии от оригинала. */
  note?: 'compressedVideo';
};

const WORKS: Work[] = [
  {
    id: 'tebe',
    entry: 'index.html',
    title: 'Тебе.',
    year: '2025',
    occasion: 'love',
    cover: '/w/_covers/tebe.jpg',
    coverRatio: '16 / 9',
    note: 'compressedVideo',
  },
  {
    id: 'poydem',
    entry: 'main.html',
    title: 'Пойдём?',
    year: '2024',
    occasion: 'love',
    cover: '/w/_covers/poydem.jpg',
    coverRatio: '16 / 9',
    portedTo: 'ask',
  },
  {
    id: 'genki',
    entry: 'index.html',
    title: '元気になってね',
    year: '2024',
    occasion: 'just-because',
    cover: '/w/_covers/genki.jpg',
    coverRatio: '16 / 9',
    portedTo: 'window',
  },
];

export function listWorks(): Work[] {
  return WORKS;
}

export function getWork(id: string): Work | undefined {
  return WORKS.find((work) => work.id === id);
}

/** Адрес самого файла работы. Не маршрут Next — статика из `public/`. */
export function workEntryUrl(work: Work): string {
  return `/w/${work.id}/${work.entry}`;
}
