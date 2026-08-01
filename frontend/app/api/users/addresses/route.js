import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return Response.json({ addresses });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const { label, line1, line2, city, state, zip, country, lat, lng, isDefault } = await request.json();
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({
      data: { userId: user.id, label, line1, line2, city, state, zip, country, lat, lng, isDefault: isDefault || false },
    });
    return Response.json({ address }, { status: 201 });
  } catch (err) {
    return Response.json({ error: 'Failed to add address' }, { status: 500 });
  }
}
