import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    await prisma.address.deleteMany({ where: { id: params.id, userId: user.id } });
    return Response.json({ message: 'Address deleted' });
  } catch (err) {
    return Response.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
