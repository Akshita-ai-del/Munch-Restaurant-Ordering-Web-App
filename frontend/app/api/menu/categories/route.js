import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return Response.json({ categories });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
