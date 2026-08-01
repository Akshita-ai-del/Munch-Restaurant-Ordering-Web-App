import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: { include: { menuItem: true } },
        address: true,
        review: true,
        chat: { include: { messages: { orderBy: { createdAt: 'asc' }, take: 50 } } },
        customer: { select: { name: true, email: true, phone: true } },
        rider: { select: { name: true, phone: true } },
      },
    });
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });
    return Response.json({ order });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
