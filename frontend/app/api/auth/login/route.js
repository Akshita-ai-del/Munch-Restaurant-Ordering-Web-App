
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password)
      return Response.json({ error: 'Email and password required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken(user.id);
    const { passwordHash, ...safeUser } = user;
    return Response.json({ token, user: safeUser });
  } catch (err) {
    console.error('[login]', err);
    return Response.json(
      { error: err?.message || 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
