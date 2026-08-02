import { prisma } from '@/lib/prisma';

const INCLUDE_FULL = {
  category: true,
  addons: true,
  reviews: {
    include: { user: { select: { name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  },
};

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Try by primary key (CUID) first
    let item = await prisma.menuItem.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    });

    // Fallback: try looking up by slug field if your schema has one,
    // otherwise try a case-insensitive name match so hero-banner slugs resolve too
    if (!item) {
      // Try slug field if it exists in schema
      try {
        item = await prisma.menuItem.findUnique({
          where: { slug: id },
          include: INCLUDE_FULL,
        });
      } catch {
        // slug field may not exist – ignore
      }
    }

    // Last resort: convert slug back to a name and do a case-insensitive search
    if (!item) {
      const nameGuess = id.replace(/-/g, ' ');
      const results = await prisma.menuItem.findMany({
        where: { name: { contains: nameGuess, mode: 'insensitive' } },
        include: INCLUDE_FULL,
        take: 1,
      });
      item = results[0] || null;
    }

    if (!item) return Response.json({ error: 'Item not found' }, { status: 404 });
    return Response.json({ item });
  } catch (err) {
    console.error('[menu/[id]]', err);
    return Response.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}
