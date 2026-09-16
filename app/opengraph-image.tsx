// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Line Detector';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>AI Line Detector</div>
        <div style={{ fontSize: 28, color: '#999', marginTop: 20 }}>
          Spot AI-written text, line by line
        </div>
      </div>
    ),
    { ...size }
  );
}