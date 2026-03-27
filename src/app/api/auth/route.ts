import { NextRequest, NextResponse } from 'next/server';
import { tursoExecute } from '@/lib/turso';

interface AuthRequest {
  id: string; // Solana address
  solanaAddress: string;
  email?: string;
  twitterHandle?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AuthRequest;
    const { id, solanaAddress, email, twitterHandle } = body;

    if (!id || !solanaAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: id, solanaAddress' },
        { status: 400 }
      );
    }

    // Upsert user into database
    const result = await tursoExecute(
      `INSERT INTO users (id, solana_address, email, twitter_handle, last_login)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET 
         last_login = CURRENT_TIMESTAMP,
         email = COALESCE(excluded.email, email),
         twitter_handle = COALESCE(excluded.twitter_handle, twitter_handle)`,
      [id, solanaAddress, email || null, twitterHandle || null]
    );

    return NextResponse.json({
      success: true,
      userId: id,
      message: 'User authenticated and synced',
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: `Authentication failed: ${String(error)}` },
      { status: 500 }
    );
  }
}

// GET to check current auth status
export async function GET(request: NextRequest) {
  try {
    // This would normally check a session cookie or JWT
    // For now, just return 401 (client handles actual auth)
    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
