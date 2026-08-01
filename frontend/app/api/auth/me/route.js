import { getAuthUser, unauthorized } from '@/lib/auth';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();
  const { passwordHash, ...safeUser } = user;
  return Response.json({ user: safeUser });
}
