import { colors } from "../const"

export default function ColorSelect({
  x, y, onSelect
}: {
  x: number, y: number, onSelect: (color: string) => void
}) {
  return (
    <div className="color-select" style={{ left: x, top: y }}>
      {
        colors.map(color => (
          <div
            key={color}
            className="color-select__item"
            style={{ color }}
            onClick={() => onSelect(color)}
          >{color}</div>
        ))
      }
    </div>
  )
}