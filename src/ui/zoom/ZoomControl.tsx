import { useState } from 'react'
import { DEFAULT_SCALE, MAX_SCALE, MIN_SCALE } from '../../config/constants'
import { stepScale } from './zoomMath'

export function ZoomControl({
  scale,
  onZoom,
  onFit,
}: {
  scale: number
  onZoom: (scale: number) => void
  onFit?: () => void
}) {
  const [draft, setDraft] = useState<string | null>(null)

  function applyScale() {
    if (draft?.trim()) {
      const value = Number(draft)
      if (Number.isFinite(value)) onZoom(value)
    }
    setDraft(null)
  }

  return (
    <div className="zoom-control" role="group" aria-label="Масштаб рабочей области">
      <button type="button" aria-label="Уменьшить масштаб" disabled={scale <= MIN_SCALE}
        onClick={() => onZoom(stepScale(scale, -1))}>−</button>
      <label className="zoom-value">
        <input aria-label="Текущий масштаб" type="number" step="any"
          value={draft ?? scale} onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={applyScale} onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
            if (event.key === 'Escape') setDraft(null)
          }} />
        <span aria-hidden="true">%</span>
      </label>
      <button type="button" aria-label="Увеличить масштаб" disabled={scale >= MAX_SCALE}
        onClick={() => onZoom(stepScale(scale, 1))}>+</button>
      <button type="button" aria-label="Масштаб 100 процентов"
        onClick={() => onZoom(DEFAULT_SCALE)}>100%</button>
      <button type="button" disabled={!onFit} onClick={onFit}>По размеру окна</button>
    </div>
  )
}
