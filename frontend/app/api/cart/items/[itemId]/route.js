import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { quantity } = await request.json();
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: params.itemId } });
      return Response.json({ message: 'Item removed' });
    }
    const cartItem = await prisma.cartItem.update({
      where: { id: params.itemId },
      data: { quantity: Number(quantity) },
      include: { menuItem: true },
    });
    return Response.json({ cartItem });
  } catch (err) {
    return Response.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.cartItem.delete({ where: { id: params.itemId } });
    return Response.json({ message: 'Item removed' });
  } catch (err) {
    return Response.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
