import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, name, phone, password } = await request.json();
    if (!email || !name || !password)
      return Response.json({ error: 'Email, name and password are required' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return Response.json({ error: 'Email already registered' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, phone, passwordHash, wallet: { create: { balance: 0 } } },
      select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true },
    });

    const token = signToken(user.id);
    return Response.json({ token, user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
