import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    if (!['staff', 'admin', 'rider'].includes(user.role))
      return Response.json({ error: 'Forbidden' }, { status: 403 });

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        customer: { select: { name: true, email: true, phone: true } },
        address: true,
      },
      orderBy: { placedAt: 'desc' },
      take: 100,
    });
    return Response.json({ orders });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
