import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const popular = searchParams.get('popular');

    const where = { isAvailable: true };

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (featured === 'true') where.isFeatured = true;
    if (popular === 'true') where.isPopular = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: true, addons: true },
      orderBy: [{ isFeatured: 'desc' }, { isPopular: 'desc' }, { name: 'asc' }],
    });

    return Response.json({ items });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}
