# Notion Slide Gallery Widget

Статичний адаптивний віджет галереї слайдів для вставки в Notion через `/embed`. Проєкт зроблено на Vite без бекенду та без важких UI-бібліотек.

## Локальний запуск

```bash
npm install
npm run dev
```

Після запуску відкрий локальний URL, який покаже Vite, зазвичай:

```text
http://localhost:5173/
```

## Перевірка і збірка

```bash
npm test
npm run build
```

Зібрані файли зʼявляться в папці `dist/`.

## Як змінити слайди

Усі дані слайдів редагуються в одному файлі:

```text
src/slides.js
```

Формат одного слайда:

```js
{
  title: 'Slide title',
  description: 'Short slide description.',
  image: 'https://example.com/image.jpg',
  tag: 'Optional tag',
  link: 'https://example.com'
}
```

Обовʼязкові поля: `title`, `description`, `image`.
Опційні поля: `tag`, `link`.

## GitHub Pages deployment

У проєкті вже є workflow:

```text
.github/workflows/deploy.yml
```

Щоб задеплоїти:

1. Створи GitHub repository та запуш цей проєкт у гілку `main`.
2. У GitHub відкрий `Settings` -> `Pages`.
3. У `Build and deployment` вибери `GitHub Actions`.
4. Запусти workflow вручну або зроби push у `main`.

Після успішного деплою URL буде у форматі:

```text
https://<github-username>.github.io/<repository-name>/
```

Якщо репозиторій називатиметься `Nadi`, URL буде:

```text
https://<github-username>.github.io/Nadi/
```

## Вставка в Notion

1. Скопіюй GitHub Pages URL.
2. У Notion введи `/embed`.
3. Встав URL.
4. За потреби зміни висоту embed-блоку, щоб галерея мала достатньо простору.

Overlay відкривається через `position: fixed` всередині iframe, тому він займає весь доступний viewport embed-блоку Notion без залежності від Fullscreen API.
