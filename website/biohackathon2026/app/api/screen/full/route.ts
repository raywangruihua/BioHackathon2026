import { NextRequest, NextResponse } from 'next/server';

const PLUMBER_URL = process.env.PLUMBER_URL ?? 'http://localhost:8000/stage1';
const STAGE2_URL  = PLUMBER_URL.replace(/\/stage1$/, '/stage2');

export async function POST(req: NextRequest) {
  const body = await req.json();

  let data: unknown;
  try {
    const res = await fetch(STAGE2_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Plumber returned ${res.status}`);
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: 'Full screening service unavailable.' },
      { status: 502 },
    );
  }

  return NextResponse.json(data);
}
