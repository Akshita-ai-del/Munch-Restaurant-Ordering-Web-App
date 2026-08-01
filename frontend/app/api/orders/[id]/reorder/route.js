import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const oldOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!oldOrder) return Response.json({ error: 'Order not found' }, { status: 404 });
    return Response.json({ items: oldOrder.items });
  } catch (err) {
    return Response.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
