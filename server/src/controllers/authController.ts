// server/src/controllers/authController.ts
import { Request, Response } from 'express';

interface LoginRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as LoginRequest;

    console.log('🔐 Login attempt:', { name, email, role });

    // Validasi input
    if (!name || !email || !password || !role) {
      console.log('❌ Validation failed: missing fields');
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi (Nama, Email, Password, Role)'
      });
    }

    // Dummy users
    const validUsers = [
      {
        name: 'Admin Putra',
        email: 'putrapetugaspantau@relawand.com',
        password: 'admin123',
        role: 'Petugas Pantau'
      },
      {
        name: 'Admin',
        email: 'admin@relawand.com',
        password: 'admin123',
        role: 'Administrator'
      }
    ];

    // Cek kredensial
    const user = validUsers.find(
      u => u.name.toLowerCase() === name.toLowerCase() &&
           u.email.toLowerCase() === email.toLowerCase() &&
           u.password === password &&
           u.role.toLowerCase() === role.toLowerCase()
    );

    if (!user) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Data login tidak sesuai'
      });
    }

    console.log('✅ User authenticated:', user.name);

    // Generate token
    const token = Buffer.from(`${user.email}-${Date.now()}`).toString('base64');

    const userData = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role
    };

    // Set cookies
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    res.cookie('user-data', JSON.stringify(userData), {
      httpOnly: false, // Accessible from frontend
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    console.log('✅ Login successful - Cookies set');
    console.log('🍪 auth-token:', token.substring(0, 20) + '...');

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      user: userData
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    console.log('🚪 Logout request');

    // Clear cookies
    res.clearCookie('auth-token', { path: '/' });
    res.clearCookie('user-data', { path: '/' });

    console.log('✅ Logout successful - Cookies cleared');

    return res.status(200).json({
      success: true,
      message: 'Logout berhasil'
    });

  } catch (error) {
    console.error('💥 Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Auth check request');
    console.log('🍪 Cookies received:', req.cookies);
    
    const token = req.cookies['auth-token'];
    const userDataStr = req.cookies['user-data'];

    if (!token) {
      console.log('❌ No auth token found');
      return res.status(200).json({
        authenticated: false
      });
    }

    console.log('✅ Auth token found:', token.substring(0, 20) + '...');

    let userData = null;
    if (userDataStr) {
      try {
        userData = JSON.parse(userDataStr);
        console.log('✅ User data parsed:', userData.email);
      } catch (e) {
        console.error('❌ Failed to parse user-data cookie');
      }
    }

    return res.status(200).json({
      authenticated: true,
      user: userData
    });

  } catch (error) {
    console.error('💥 Check auth error:', error);
    return res.status(500).json({
      authenticated: false
    });
  }
};