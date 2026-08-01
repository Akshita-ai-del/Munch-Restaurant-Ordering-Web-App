import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    await prisma.favourite.deleteMany({ where: { userId: user.id, menuItemId: params.menuItemId } });
    return Response.json({ message: 'Removed from favourites' });
  } catch (err) {
    return Response.json({ error: 'Failed to remove favourite' }, { status: 500 });
  }
}
