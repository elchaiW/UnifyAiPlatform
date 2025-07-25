// Vercel API Route for Next.js
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Forward to Express server
  const url = new URL(request.url);
  const serverUrl = `http://localhost:5000${url.pathname}${url.search}`;
  
  try {
    const response = await fetch(serverUrl, {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const serverUrl = `http://localhost:5000${url.pathname}${url.search}`;
  
  try {
    const body = await request.text();
    const response = await fetch(serverUrl, {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
  }
}