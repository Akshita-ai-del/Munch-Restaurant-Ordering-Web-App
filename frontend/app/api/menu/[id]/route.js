import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        addons: true,
        reviews: {
          include: { user: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!item) return Response.json({ error: 'Item not found' }, { status: 404 });
    return Response.json({ item });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}
