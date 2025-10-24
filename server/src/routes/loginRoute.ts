// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface LoginRequest {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as LoginRequest;
    const { email, password, name, role } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }
    
    // Dummy user data untuk demo
    const validUsers = [
      {
        email: 'putrapetugaspantau@relawand.com',
        password: 'admin123',
        name: 'Admin Putra',
        role: 'Petugas Pantau'
      },
      {
        email: 'admin@relawand.com',
        password: 'admin123',
        name: 'Admin',
        role: 'Administrator'
      }
    ];

    // Cek kredensial
    const user = validUsers.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.email}-${Date.now()}`).toString('base64');

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // Set HTTP-only cookie for security
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    response.cookies.set('user-data', JSON.stringify({
      name: user.name,
      email: user.email,
      role: user.role
    }), {
      httpOnly: false, // Allow client-side access for display
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}