import { prisma } from '@/lib/prisma';
import { getAuthUser, unauthorized } from '@/lib/auth';

function generateOrderNumber() {
  return 'MN-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const {
      items, addressId, orderType = 'delivery', tableNumber,
      paymentMethod = 'cash', promoCode, specialNote,
      subtotal, deliveryFee = 0, tax, tip = 0, discount = 0, total,
    } = await request.json();

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: user.id,
        addressId: addressId || null,
        orderType,
        tableNumber: tableNumber || null,
        paymentMethod,
        promoCode: promoCode || null,
        specialNote: specialNote || null,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        tax: Number(tax),
        tip: Number(tip),
        discount: Number(discount),
        total: Number(total),
        estimatedTime: orderType === 'delivery' ? 35 : 15,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            addons: item.addons ? JSON.stringify(item.addons) : null,
            specialNote: item.specialNote || null,
          })),
        },
        chat: { create: {} },
      },
      include: { items: true, address: true, chat: true },
    });

    return Response.json({ order }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return unauthorized();

    const orders = await prisma.order.findMany({
      where: { customerId: user.id },
      include: { items: true, address: true, review: true },
      orderBy: { placedAt: 'desc' },
    });
    return Response.json({ orders });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
