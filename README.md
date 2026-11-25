# Drafting Studio

Drafting Studio is an interactive application for creating and visualizing geometry problems.

The main idea is to provide a simple set of drawing tools that allows users to build geometric diagrams from basic elements such as triangles, lines, circles, points, and other shapes.

## Features

* Create geometric figures using basic drawing elements
* Combine multiple elements to build geometry diagrams
* Add constructions such as medians, heights, and other lines
* Edit and move objects on the canvas
* Build diagrams for geometry problems in an intuitive way

### Example

A user can start with a triangle and add a median to one of its vertices. The result can then be used as a diagram for a geometry problem.

## Project Structure

The project is currently under development. More information about the architecture and available tools will be added as the project grows.

## Development

Clone the repository:

```bash
git clone <repository-url>
cd drafting-studio
```

Create a separate branch for your changes:

```bash
git checkout -b feature/your-feature
```

After making changes:

```bash
git add .
git commit -m "Describe your changes"
git push -u origin feature/your-feature
```

Then create a Pull Request to merge your changes into `main`.



## Каркас CHM

Запуск из корня проекта с Node.js 22.12+ (ветка 22.x) или 24.x:

```bash
npm ci
npm run dev
```

Сборка и проверки:

```bash
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Сквозные тесты запускают предварительный просмотр уже собранного `dist/`.

В M01 создаются React-каркас, пустой проект и общие контракты для следующих модулей.
