import { NextRequest, NextResponse } from 'next/server';

const PLUMBER_URL = process.env.PLUMBER_URL ?? 'http://localhost:8000/stage1';

export async function POST(req: NextRequest) {
  const body = await req.json();

  let data: unknown;
  try {
    const res = await fetch(PLUMBER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Plumber returned ${res.status}`);
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: 'Screening service unavailable. Make sure the R Plumber API is running on port 8000.' },
      { status: 502 },
    );
  }

  return NextResponse.json(data);
}
