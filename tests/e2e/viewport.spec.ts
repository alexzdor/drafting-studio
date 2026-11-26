import { expect, test } from '@playwright/test'

test('opens the working area and zooms using the buttons', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Чертёжная Мастерская' })).toBeVisible()
  const scale = page.getByLabel('Текущий масштаб')
  await expect(scale).toHaveValue('100')
  await page.getByRole('button', { name: 'Увеличить масштаб' }).click()
  await expect(scale).toHaveValue('110')
  await scale.fill('800')
  await scale.press('Enter')
  await expect(scale).toHaveValue('500')
  await expect(page.getByRole('button', { name: 'Увеличить масштаб' })).toBeDisabled()
  await scale.fill('1')
  await scale.press('Enter')
  await expect(scale).toHaveValue('10')
  await expect(page.getByRole('button', { name: 'Уменьшить масштаб' })).toBeDisabled()
  await page.getByRole('button', { name: 'Масштаб 100 процентов' }).click()
  await expect(scale).toHaveValue('100')
})

test('pans the grid with the pointer and zooms with the wheel', async ({ page }) => {
  await page.goto('/')
  const canvas = page.getByLabel('Рабочая область', { exact: true })
  const drawing = canvas.locator(':scope > g[transform]')
  const origin = () => drawing.evaluate((group: SVGGElement) => {
    const { e, f } = group.transform.baseVal.getItem(0).matrix
    return { x: e, y: f }
  })
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Expected the drawing area to have a bounding box')
  const initial = await origin()
  await page.mouse.move(box.x + 120, box.y + 120)
  await page.mouse.down()
  await page.mouse.move(box.x + 170, box.y + 150)
  await page.mouse.up()
  await expect.poll(origin).toEqual({ x: initial.x + 50, y: initial.y + 30 })
  await page.mouse.wheel(0, -100)
  await expect(page.getByLabel('Текущий масштаб')).toHaveValue('110')
})

test('keeps both directions of the grid visible across the zoom range', async ({ page }) => {
  await page.goto('/')
  const canvas = page.getByLabel('Рабочая область', { exact: true })
  const scale = page.getByLabel('Текущий масштаб')
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Expected the drawing area to have a bounding box')

  await page.mouse.move(box.x + 120, box.y + 120)
  await page.mouse.down()
  await page.mouse.move(box.x + 163, box.y + 149)
  await page.mouse.up()

  const sampleSize = 260
  for (const [zoom, spacing] of [[100, 25], [67.5, 16.875], [137.5, 34.375], [10, 10], [500, 125]]) {
    await scale.fill(String(zoom))
    await scale.press('Enter')
    await expect(scale).toHaveValue(String(zoom))
    const screenshot = await canvas.screenshot({ scale: 'css' })
    const counts = await page.evaluate(async ({ png, size }) => {
      const image = new Image()
      image.src = 'data:image/png;base64,' + png
      await image.decode()
      const sample = document.createElement('canvas')
      sample.width = sample.height = size
      const context = sample.getContext('2d')!
      context.drawImage(image, -8, -8)
      const { data } = context.getImageData(0, 0, size, size)
      const horizontal = new Array<number>(size).fill(0)
      const vertical = new Array<number>(size).fill(0)
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (data[(y * size + x) * 4] < 215) {
            horizontal[y]++
            vertical[x]++
          }
        }
      }
      const countLines = (pixels: number[]) =>
        pixels.filter((count, i) => count > size * 0.85 && (i === 0 || pixels[i - 1] <= size * 0.85)).length
      return [countLines(horizontal), countLines(vertical)]
    }, { png: screenshot.toString('base64'), size: sampleSize })

    for (const [index, direction] of ['horizontal', 'vertical'].entries()) {
      expect(counts[index], `${direction} grid at ${zoom}%`).toBeGreaterThanOrEqual(Math.floor(sampleSize / spacing))
      expect(counts[index], `${direction} grid at ${zoom}%`).toBeLessThanOrEqual(Math.ceil(sampleSize / spacing))
    }
  }
})
