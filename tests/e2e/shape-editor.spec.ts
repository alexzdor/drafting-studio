import { expect, test } from '@playwright/test'

test('builds an editable segment and preserves its geometry when zooming and panning', async ({ page }) => {
  await page.goto('/')
  const canvas = page.getByLabel('Рабочая область', { exact: true })
  const shapes = canvas.locator('[data-element-id]')
  const properties = page.getByRole('complementary').filter({ has: page.getByRole('heading', { name: 'Свойства' }) })

  await page.getByRole('button', { name: 'Отрезок', exact: true }).click()
  await canvas.click({ position: { x: 100, y: 120 } })
  await canvas.click({ position: { x: 200, y: 120 } })
  await expect(shapes).toHaveCount(1)
  await expect(properties.getByText('Длина: 40.00')).toBeVisible()

  const end = properties.getByRole('group', { name: 'Вершина 2' }).getByLabel('X', { exact: true })
  await end.fill('100')
  await expect(properties.getByText('Длина: 40.00')).toBeVisible()
  await properties.getByRole('button', { name: 'Применить' }).click()
  await expect(properties.getByText('Длина: 60.00')).toBeVisible()

  const handle = canvas.locator('[data-vertex-index="1"]')
  const position = await handle.boundingBox()
  if (!position) throw new Error('Expected a visible vertex handle')
  await page.mouse.move(position.x + position.width / 2, position.y + position.height / 2)
  await page.mouse.down()
  await page.mouse.move(position.x + position.width / 2 + 25, position.y + position.height / 2)
  await expect(properties.getByText('Длина: 70.00')).toBeVisible()
  await page.mouse.up()
  await expect(end).toHaveValue('110')

  const geometry = await shapes.locator('line').getAttribute('x2')
  await page.getByRole('button', { name: 'Увеличить масштаб' }).click()
  await expect(shapes.locator('line')).toHaveAttribute('x2', geometry!)
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Expected a visible working area')
  await page.mouse.move(box.x + 30, box.y + 30)
  await page.mouse.down()
  await page.mouse.move(box.x + 60, box.y + 50)
  await page.mouse.up()
  await expect(shapes.locator('line')).toHaveAttribute('x2', '110')
})

test('cancels draft geometry and rejects an invalid radius without modifying the circle', async ({ page }) => {
  await page.goto('/')
  const canvas = page.getByLabel('Рабочая область', { exact: true })
  const shapes = canvas.locator('[data-element-id]')

  await page.getByRole('button', { name: 'Треугольник', exact: true }).click()
  await canvas.click({ position: { x: 80, y: 100 } })
  await canvas.click({ position: { x: 130, y: 100 } })
  await canvas.click({ position: { x: 180, y: 100 } })
  await expect(page.getByRole('alert')).toContainText('вырождена')
  await expect(shapes).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(canvas.locator('.build-preview')).toHaveCount(0)

  await page.getByRole('button', { name: 'Окружность', exact: true }).click()
  await canvas.click({ position: { x: 150, y: 150 } })
  await canvas.click({ position: { x: 200, y: 150 } })
  const radius = page.getByLabel('Радиус', { exact: true })
  await expect(radius).toHaveValue('20')
  await radius.fill('-5')
  await page.getByRole('button', { name: 'Применить' }).click()
  await expect(page.getByRole('alert')).toContainText('допустимые числовые')
  await expect(shapes.locator('circle')).toHaveAttribute('r', '20')
  await page.getByRole('button', { name: 'Сбросить' }).click()
  await expect(radius).toHaveValue('20')
})

test('builds all seven templates and applies a length and an angle through properties', async ({ page }) => {
  await page.goto('/')
  const canvas = page.getByLabel('Рабочая область', { exact: true })
  const shapes = canvas.locator('[data-element-id]')
  const templates: Array<[string, Array<[number, number]>]> = [
    ['Точка', [[90, 90]]],
    ['Отрезок', [[90, 140], [165, 140]]],
    ['Треугольник', [[210, 90], [260, 90], [235, 125]]],
    ['Четырёхугольник', [[310, 90], [360, 90], [360, 130], [310, 130]]],
    ['Окружность', [[110, 230], [145, 230]]],
    ['Многоугольник', [[210, 190], [260, 190], [275, 220], [235, 250], [205, 230]]],
    ['Угол', [[310, 250], [360, 250], [360, 200]]],
  ]
  for (const [index, [name, vertices]] of templates.entries()) {
    await page.getByRole('button', { name, exact: true }).click()
    for (const [x, y] of vertices) await canvas.click({ position: { x, y } })
    if (name === 'Многоугольник') await page.getByRole('button', { name: 'Завершить' }).click()
    await expect(shapes).toHaveCount(index + 1)
    const apply = page.getByRole('button', { name: 'Применить' })
    if (name === 'Отрезок') {
      await page.getByLabel('Длина отрезка').fill('40')
      await apply.click()
      await expect(page.getByText('Длина: 40.00')).toBeVisible()
    }
    if (name === 'Угол') {
      await page.getByLabel('Величина угла').fill('80')
      await apply.click()
      await expect(page.getByText('Угол: 80.00°')).toBeVisible()
    }
  }
})
