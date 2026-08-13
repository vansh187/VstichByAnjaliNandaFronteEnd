export function parseVerificationParams(location) {
  if (!location) {
    return { userId: null, token: null };
  }

  const searchParams = new URLSearchParams(location.search ?? '');
  const userIdFromQuery = searchParams.get('user_id');
  const tokenFromQuery = searchParams.get('token');

  if (userIdFromQuery || tokenFromQuery) {
    return {
      userId: userIdFromQuery ?? null,
      token: tokenFromQuery ?? null,
    };
  }

  const match = (location.pathname ?? '').match(/^\/verify-email\/(\d+)\/(.+)$/);
  if (match) {
    return {
      userId: match[1] ?? null,
      token: match[2] ?? null,
    };
  }

  return { userId: null, token: null };
}
