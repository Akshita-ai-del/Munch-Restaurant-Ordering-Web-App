import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

async function getOrCreateCart(sessionId, userId) {
  let cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: { include: { menuItem: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId, userId },
      include: { items: { include: { menuItem: true } } },
    });
  }
  return cart;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const sessionId = request.headers.get('x-session-id') || body.sessionId;
    if (!sessionId) return Response.json({ error: 'Session ID required' }, { status: 400 });

    const { menuItemId, quantity = 1, addons, specialNote } = body;
    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) return Response.json({ error: 'Item not found' }, { status: 404 });

    const user = await getAuthUser(request);
    const cart = await getOrCreateCart(sessionId, user?.id);

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        menuItemId,
        quantity: Number(quantity),
        addons: addons ? JSON.stringify(addons) : null,
        specialNote,
        unitPrice: menuItem.price,
      },
      include: { menuItem: true },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { menuItem: true } } },
    });

    return Response.json({ cartItem, cart: updatedCart }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
