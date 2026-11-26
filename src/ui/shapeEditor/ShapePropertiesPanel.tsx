import { useState, type FormEvent } from 'react'
import { PARAMETER_DECIMALS } from '../../config/constants'
import { rebuildShape, shapeTemplates } from '../../geometry/shapeGeometry'
import type { Shape } from '../../types/geometry'

const format = (value: number) => value.toFixed(PARAMETER_DECIMALS)

export function ShapePropertiesPanel({
  shape,
  preview,
  onApply,
}: {
  shape: Shape
  preview?: Shape
  onApply: (shape: Shape) => void
}) {
  const [error, setError] = useState('')
  const shown = preview ?? shape
  const lengths = 'length' in shape.properties ? [shape.properties.length]
    : 'sideLengths' in shape.properties ? shape.properties.sideLengths : []

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const number = (key: string) => {
      const value = String(data.get(key) ?? '').trim().replace(',', '.')
      return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value) ? Number(value) : NaN
    }
    const vertices = shape.vertices.map((_, index) => ({ x: number(`x-${index}`), y: number(`y-${index}`) }))
    const sizeEdits = lengths.flatMap((length, index) => {
      const value = number(`length-${index}`)
      return value === length ? [] : [{ index, value }]
    })
    const angle = shape.type === 'angle' ? number('angle') : undefined
    const angleEdited = shape.type === 'angle' && angle !== shape.properties.angleValue
    const coordinatesEdited = vertices.some((point, index) => (
      point.x !== shape.vertices[index].x || point.y !== shape.vertices[index].y
    ))
    const dimensionEdits = sizeEdits.length + Number(angleEdited)
    if (dimensionEdits > 1 || (dimensionEdits === 1 && coordinatesEdited)) {
      setError('Примените одну длину или величину угла отдельно от других изменений.')
      return
    }
    if (sizeEdits.length === 1) {
      const { index, value } = sizeEdits[0]
      const next = (index + 1) % vertices.length
      const start = vertices[index]
      const end = vertices[next]
      if (!(value > 0)) {
        setError('Длина стороны должна быть больше нуля.')
        return
      }
      const ratio = value / lengths[index]
      vertices[next] = { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio }
    }
    if (angleEdited && angle !== undefined) {
      if (!(angle > 0 && angle <= 180)) {
        setError('Введите величину угла больше 0° и не больше 180°.')
        return
      }
      const [a, center, b] = vertices
      const cross = (a.x - center.x) * (b.y - center.y) - (a.y - center.y) * (b.x - center.x)
      const direction = Math.atan2(a.y - center.y, a.x - center.x) + (cross < 0 ? -1 : 1) * angle * Math.PI / 180
      const length = Math.hypot(b.x - center.x, b.y - center.y)
      vertices[2] = { x: center.x + length * Math.cos(direction), y: center.y + length * Math.sin(direction) }
    }
    const updated = rebuildShape(shape, vertices, shape.type === 'circle' ? number('radius') : undefined)
    if (!updated) {
      setError('Введите допустимые числовые параметры. Фигура не должна быть вырожденной.')
      return
    }
    setError('')
    if (JSON.stringify(updated) !== JSON.stringify(shape)) onApply(updated)
  }

  return (
    <form onSubmit={submit} onReset={() => setError('')}>
      <h3>{shapeTemplates[shape.type].label}</h3>
      {shown.vertices.map(({ x, y }, index) => {
        const title = shape.type === 'circle' ? 'Центр'
          : shape.type === 'point' ? 'Координаты' : `Вершина ${index + 1}`
        return (
          <fieldset key={index}>
            <legend>{title}</legend>
            <label>X <input name={`x-${index}`} inputMode="decimal" defaultValue={x} readOnly={Boolean(preview)} key={preview ? x : 'x'} /></label>
            <label>Y <input name={`y-${index}`} inputMode="decimal" defaultValue={y} readOnly={Boolean(preview)} key={preview ? y : 'y'} /></label>
          </fieldset>
        )
      })}
      {shape.type === 'circle' && <label>Радиус <input name="radius" inputMode="decimal"
        defaultValue={shape.properties.radius} /></label>}
      {'length' in shown.properties && <p>Длина: {format(shown.properties.length)}</p>}
      {'sideLengths' in shown.properties && <p>Стороны: {shown.properties.sideLengths.map(format).join(', ')}</p>}
      {!preview && lengths.map((length, index) => (
        <label key={index}>{shape.type === 'segment' ? 'Длина отрезка' : `Длина стороны ${index + 1}`}
          <input name={`length-${index}`} inputMode="decimal" defaultValue={length} />
        </label>
      ))}
      {'angles' in shown.properties && <p>Углы: {shown.properties.angles.map(value => `${format(value)}°`).join(', ')}</p>}
      {'angleValue' in shown.properties && <p>Угол: {format(shown.properties.angleValue)}°</p>}
      {shape.type === 'angle' && !preview && <label>Величина угла
        <input name="angle" inputMode="decimal" defaultValue={shape.properties.angleValue} />
      </label>}
      {'area' in shown.properties && <p>Площадь: {format(shown.properties.area)}</p>}
      {'perimeter' in shown.properties && <p>Периметр: {format(shown.properties.perimeter)}</p>}
      {error && <p role="alert">{error}</p>}
      <div className="property-actions">
        <button type="submit" disabled={Boolean(preview)}>Применить</button>
        <button type="reset" disabled={Boolean(preview)}>Сбросить</button>
      </div>
    </form>
  )
}
