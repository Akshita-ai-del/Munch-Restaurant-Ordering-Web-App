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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = request.headers.get('x-session-id') || searchParams.get('sessionId');
    if (!sessionId) return Response.json({ error: 'Session ID required' }, { status: 400 });

    const user = await getAuthUser(request);
    const cart = await getOrCreateCart(sessionId, user?.id);
    return Response.json({ cart });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = request.headers.get('x-session-id') || searchParams.get('sessionId');
    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return Response.json({ message: 'Cart cleared' });
  } catch (err) {
    return Response.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
