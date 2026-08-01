import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const { passwordHash, ...safeUser } = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    });
    return Response.json({ user: safeUser });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const { name, phone, avatarUrl } = await request.json();
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, phone, avatarUrl },
      select: { id: true, email: true, name: true, phone: true, role: true, avatarUrl: true },
    });
    return Response.json({ user: updated });
  } catch (err) {
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
