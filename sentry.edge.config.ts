import * as Sentry from '@sentry/nextjs';

/**
 * Sentry на сервере.
 *
 * `userInfo` и `httpBodies` выключены: тело запроса к `/api/orders` — это имя,
 * телефон, телеграм, текст письма получателю и фотографии в base64. Отчёт об
 * ошибке не должен уносить их в трекер. Подробнее — в instrumentation-client.ts.
 */


Sentry.init({
  dsn: "https://4635933e0deddf749475ea1d50877331@o4511988297826304.ingest.de.sentry.io/4511988301758544",

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
});
