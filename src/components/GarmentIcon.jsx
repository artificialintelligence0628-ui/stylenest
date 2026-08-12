const SHAPES = {
  tshirt: c => `<path d="M60 40 L85 25 L100 38 L115 25 L140 40 L150 65 L130 75 L128 160 L72 160 L70 75 L50 65 Z" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`,
  dress: c => `<path d="M75 30 L90 22 L110 22 L125 30 L120 55 L145 155 L55 155 L80 55 Z" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M90 22 L88 45 M110 22 L112 45" stroke="${c}" stroke-width="2"/>`,
  jacket: c => `<path d="M55 45 L82 24 L100 34 L118 24 L145 45 L152 78 L132 86 L130 165 L70 165 L68 86 L48 78 Z" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M100 34 L96 165 M100 34 L104 165" stroke="${c}" stroke-width="2"/>`,
  trousers: c => `<path d="M68 25 L132 25 L138 90 L120 165 L104 165 L100 95 L96 165 L80 165 L62 90 Z" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`,
  skirt: c => `<path d="M72 30 L128 30 L152 150 L48 150 Z" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M72 30 L128 30" stroke="${c}" stroke-width="2"/>`,
  shoe: c => `<path d="M35 130 Q35 110 60 105 L95 95 Q110 90 122 100 L155 118 Q168 125 165 140 L165 150 L35 150 Z" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M60 105 L70 130 M95 95 L100 130" stroke="${c}" stroke-width="2"/>`,
  bag: c => `<path d="M55 70 L145 70 L152 165 L48 165 Z" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M72 70 Q72 35 100 35 Q128 35 128 70" fill="none" stroke="${c}" stroke-width="3"/>`,
  hat: c => `<ellipse cx="100" cy="120" rx="65" ry="14" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3"/><path d="M72 118 Q75 60 100 60 Q125 60 128 118" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3"/>`,
}

export default function GarmentIcon({ type = 'tshirt', color = '#c9a86a', className, style }) {
  const markup = (SHAPES[type] || SHAPES.tshirt)(color)
  return (
    <svg
      viewBox="0 0 200 190"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
