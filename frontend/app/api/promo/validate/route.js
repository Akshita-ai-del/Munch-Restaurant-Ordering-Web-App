import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code, orderTotal } = await request.json();
    if (!code) return Response.json({ error: 'Promo code required' }, { status: 400 });

    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!promo || !promo.isActive) return Response.json({ error: 'Invalid promo code' }, { status: 404 });
    if (promo.expiresAt && new Date() > new Date(promo.expiresAt))
      return Response.json({ error: 'Promo code has expired' }, { status: 400 });
    if (promo.maxUses && promo.usedCount >= promo.maxUses)
      return Response.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    if (orderTotal < promo.minOrderAmount)
      return Response.json({ error: `Minimum order $${promo.minOrderAmount} required` }, { status: 400 });

    let discountAmount = 0;
    if (promo.discountType === 'percent') discountAmount = (orderTotal * promo.discountValue) / 100;
    else discountAmount = promo.discountValue;
    discountAmount = Math.min(discountAmount, orderTotal);

    return Response.json({ promo, discountAmount: Number(discountAmount.toFixed(2)) });
  } catch (err) {
    return Response.json({ error: 'Failed to validate promo code' }, { status: 500 });
  }
}
