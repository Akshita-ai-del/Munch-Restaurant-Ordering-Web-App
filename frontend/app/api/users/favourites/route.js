import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const favourites = await prisma.favourite.findMany({
      where: { userId: user.id },
      include: { menuItem: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json({ favourites });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch favourites' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const { menuItemId } = await request.json();
    const fav = await prisma.favourite.upsert({
      where: { userId_menuItemId: { userId: user.id, menuItemId } },
      update: {},
      create: { userId: user.id, menuItemId },
    });
    return Response.json({ favourite: fav }, { status: 201 });
  } catch (err) {
    return Response.json({ error: 'Failed to add favourite' }, { status: 500 });
  }
}
