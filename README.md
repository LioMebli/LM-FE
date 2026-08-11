# LM-FE

Фронтенд **LioMebli** — Angular, статична збірка без серверного рантайму.

Частина робочої області [`LM-WORKSPACE`](https://github.com/LioMebli/LM-WORKSPACE).
Цей репозиторій має лежати всередині її теки — від цього залежить посилання
`@../GLOBAL_DESCRIPTION_LM_PROJECT.md` в `AGENTS.md`.

---

## Передумови

| Що | Версія | Навіщо |
|---|---|---|
| **Node.js** | **24** (Active LTS) | та сама версія, що в `Dockerfile`; на нижчій Angular 22 не збереться |
| **npm** | той, що приходить із Node 24 | `packageManager` у `package.json` фіксує `npm@12.0.1` |
| **Docker Desktop** | лише для режиму паритету | у щоденній роботі не потрібен |
| Angular CLI глобально | **не потрібен** | викликається через `npx` і скрипти `npm` |

Перевірити:

```powershell
node -v      # має бути 24.x
npm -v
```

---

## Запуск — щоденний режим

```powershell
cd LM-FE
npm ci
npm start
```

Відкрити `http://localhost:4200`. Сторінка перезбирається сама при зміні
вихідних файлів.

`npm ci`, а не `npm install`: він ставить рівно те, що записано в
`package-lock.json`, і падає, якщо lock розійшовся з `package.json`. Саме та
поведінка, яка потрібна на чистій машині.

**Бекенд має бути запущений окремо** — див. [`LM-BE/README.md`](../LM-BE/README.md).
Без нього сторінки відкриються, а запити до каталогу впадуть із мережевою
помилкою.

---

## Адреса API і чому немає проксі

Адреса бекенду не зашита в код — вона береться з `src/environments/`:

| Конфігурація | Файл | `apiBaseUrl` |
|---|---|---|
| `development` (те, що дає `npm start`) | `environment.development.ts` | `http://localhost:8080` |
| `production` (те, що дає `npm run build`) | `environment.ts` | `https://api.liomebli.com.ua` |
| `container` (режим паритету) | підставляє `environment.development.ts` | `http://localhost:8080` |

Проксі dev-сервера до API **свідомо не налаштований**. У проді фронтенд і API
живуть на різних доменах, тож запити крос-доменні завжди — і краще, щоб CORS
ламався локально, де його видно, ніж уперше на продакшені. Наслідок: політику
CORS тримає бекенд, а не збірка фронтенду.

> ⚠️ **`src/environments/` — публічна тека.** Усе, що там лежить, компілюється у
> файли, які може завантажити будь-який відвідувач. Жодних ключів, токенів чи
> паролів — навіть тимчасових, навіть «на час розробки».

---

## Куди дивитися

| Адреса | Що |
|---|---|
| `http://localhost:4200` | фронтенд |
| `http://localhost:8080` | API, який він викликає |

---

## Інші команди

```powershell
npm test              # модульні тести, Vitest
npm run build:site    # повний випуск: чотири етапи нижче, по черзі
npm run watch         # збірка в режимі development з перезбіркою
npx ng generate component <назва>
```

### Випуск — це чотири етапи, і порядок обовʼязковий

```powershell
npm run build:manifest    # 1. читає каталог з API один раз → .catalog-manifest.json
npm run build             # 2. збирає сайт, сторінки бере з переліку
npm run build:artifacts   # 3. sitemap.xml, robots.txt, 404.html
npm run build:checks      # 4. перевіряє випуск і зупиняє його, якщо щось не так
```

`npm run build:site` виконує їх через `&&`, тому перша ж помилка зупиняє ланцюг.

> **`npm run build` сам по собі — не «продова збірка», і без етапу 1 він падає:**
> `Prerender failed: .catalog-manifest.json could not be read`. Сторінки товарів і
> розділів беруться з переліку, прочитаного на етапі 1, тож без нього збирати нічого.

**Проти локального бекенда** етап 2 запускається окремо, з іншою конфігурацією —
адреса API вшивається у збірку, а не читається зі змінної:

```powershell
$env:LM_API_BASE_URL = 'http://localhost:8080'
npm run build:manifest
npx ng build --configuration container
npm run build:artifacts
npm run build:checks
```

Тести — **Vitest** через білдер `@angular/build:unit-test`, рідний для
поточного тулчейну Angular. Jest і Karma не використовуються.

E2E — Playwright, зʼявиться разом із першими наскрізними сценаріями.

---

## Коли не працює

**Порт 4200 зайнятий.** Зазвичай через паралельно піднятий режим паритету —
там фронтенд віддає nginx на тому ж порту:

```powershell
netstat -ano | Select-String ":4200"
docker compose -f ..\compose.full.yaml down
```

**Не та версія Node.** Симптоми бувають дуже неочевидні — від помилок збірки до
падінь усередині залежностей. `node -v` перед тим, як читати стек.

**`npm ci` падає.** Означає, що `package-lock.json` не відповідає
`package.json`. Це не привід ставити `npm install` — це привід зʼясувати, хто
змінив залежності без оновлення lock-файлу.

**Запити до каталогу падають, сторінка порожня.** Перевірити по черзі:
чи піднятий бекенд (`http://localhost:8080/actuator/health` має віддати `UP`),
і чи він на тому ж порту, що в `environment.development.ts`.

**У консолі помилка CORS.** Фронтенд тут ні до чого — правиться на бекенді.
Публічні читання під `/api/v1/**` відкриті для всіх джерел; якщо ви запустили
фронтенд не на `4200`, додайте новий origin у `lm.cors.admin-origins` в
`LM-BE/src/main/resources/application-local.yaml`.

**Стара збірка в `dist/`.** Вона нікуди не дівається сама. Видаліть теку, якщо
є підозра, що дивитеся на вчорашній результат.

---

## Далі

| Що | Де |
|---|---|
| Розкладка репозиторіїв, режим паритету | [`LM-WORKSPACE/README.md`](../README.md) |
| Конвенції для асистентів у цьому репозиторії | [`AGENTS.md`](AGENTS.md) |
| Візуальний напрямок | `../docs/VISUAL_STYLE_REFERENCE.md` |
| Конвенції коду | [Confluence](https://liomebli.atlassian.net/wiki/spaces/LioMebli/pages/458846) |
| Середовища | [Confluence](https://liomebli.atlassian.net/wiki/spaces/LioMebli/pages/589885) |
| Задачі | [Jira, проєкт LM](https://liomebli.atlassian.net/jira/software/projects/LM/boards/1) |
