import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const { status } = await request.json();
    const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return Response.json({ error: 'Invalid status' }, { status: 400 });

    const updateData = { status };
    if (status === 'confirmed') updateData.confirmedAt = new Date();
    if (status === 'preparing') updateData.preparedAt = new Date();
    if (status === 'out_for_delivery') updateData.pickedUpAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });

    return Response.json({ order });
  } catch (err) {
    return Response.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
