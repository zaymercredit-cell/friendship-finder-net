import { useMemo } from "react";

interface Dimension {
  label: string;
  value: number; // 0-100
  color: string;
}

interface Props {
  dimensions?: Dimension[];
  size?: number;
}

const defaultDimensions: Dimension[] = [
  { label: "Интересы", value: 75, color: "hsl(217 91% 53%)" },
  { label: "Характер", value: 68, color: "hsl(224 76% 40%)" },
  { label: "Общение", value: 82, color: "hsl(160 84% 39%)" },
  { label: "Энергия", value: 60, color: "hsl(38 92% 50%)" },
  { label: "Романтика", value: 71, color: "hsl(0 72% 51%)" },
];

export default function ChemistryRadar({ dimensions = defaultDimensions, size = 180 }: Props) {
  const center = size / 2;
  const radius = (size / 2) - 28;
  const n = dimensions.length;

  const points = useMemo(() => {
    return dimensions.map((d, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (d.value / 100) * radius;
      return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    });
  }, [dimensions, n, radius, center]);

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const polygon = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="drop-shadow-sm">
        {/* Grid */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={Array.from({ length: n }, (_, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              const r = level * radius;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(" ")}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={level === 1 ? 1.5 : 0.5}
            opacity={0.5}
          />
        ))}

        {/* Axes */}
        {dimensions.map((_, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center} y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              opacity={0.4}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygon}
          fill="hsl(217 91% 53% / 0.12)"
          stroke="hsl(217 91% 53%)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={dimensions[i].color} stroke="hsl(var(--card))" strokeWidth={2} />
        ))}
      </svg>

      {/* Labels */}
      {dimensions.map((d, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const labelR = radius + 18;
        const x = center + labelR * Math.cos(angle);
        const y = center + labelR * Math.sin(angle);
        return (
          <div
            key={i}
            className="absolute text-[10px] font-medium text-muted-foreground whitespace-nowrap"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span>{d.label}</span>
            <span className="ml-1 text-foreground font-semibold">{d.value}</span>
          </div>
        );
      })}
    </div>
  );
}
