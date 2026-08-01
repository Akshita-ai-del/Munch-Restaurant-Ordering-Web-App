import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    return Response.json({ wallet });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
