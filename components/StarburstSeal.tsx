import React from 'react';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

function starburstPath(cx: number, cy: number, ro: number, ri: number, points: number): string {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? ri : ro;
    const a = i * step - Math.PI / 2;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1) + ' ';
  }
  return d + 'Z';
}

const BURST = starburstPath(58, 58, 57, 47, 18);

export default function StarburstSeal({ eta }: { eta: number }) {
  const arrived = eta <= 0;
  return (
    <Svg viewBox="0 0 116 116" width={104} height={104}>
      <Path d={BURST} fill="#115803" />
      <Circle cx={58} cy={58} r={42} fill="#F4EBD9" stroke="#115803" strokeWidth={2} />
      <Circle cx={58} cy={58} r={38} fill="none" stroke="#115803" strokeWidth={1}
        strokeDasharray="1.5 3" opacity={0.5} />
      <SvgText x={58} y={44} fontSize={8.5} letterSpacing={2.5} fontWeight="600"
        fill="#B5482E" textAnchor="middle" fontFamily="Oswald, sans-serif">
        {arrived ? '' : 'ETA'}
      </SvgText>
      <SvgText x={58} y={73} fontSize={arrived ? 22 : 30} fontWeight="600"
        fill="#115803" textAnchor="middle" fontFamily="Oswald, sans-serif">
        {arrived ? 'HERE' : String(eta)}
      </SvgText>
      <SvgText x={58} y={87} fontSize={9.5} letterSpacing={3} fontWeight="500"
        fill="#115803" textAnchor="middle" fontFamily="Oswald, sans-serif">
        {arrived ? '' : 'MIN'}
      </SvgText>
    </Svg>
  );
}
