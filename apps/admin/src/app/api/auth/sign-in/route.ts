import { NextResponse } from 'next/server';
import { setToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Appel direct au backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { error: data.error?.message || 'Login failed' },
        { status: response.status }
      );
    }

    // Le backend renvoie { success: true, data: { token, user } }
    const token = data.data.token;
    await setToken(token); // set httponly cookie

    return NextResponse.json({ success: true, token });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
