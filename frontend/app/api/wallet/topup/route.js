import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();
    const { amount } = await request.json();
    if (!amount || amount <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });

    const wallet = await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        balance: { increment: Number(amount) },
        transactions: { create: { type: 'topup', amount: Number(amount), description: `Top-up $${amount}` } },
      },
    });
    return Response.json({ wallet });
  } catch (err) {
    return Response.json({ error: 'Failed to top up wallet' }, { status: 500 });
  }
}
