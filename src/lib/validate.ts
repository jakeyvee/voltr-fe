export async function validateAuthHeader(
  authHeader: string | null
): Promise<void> {
  if (authHeader !== process.env.HELIUS_WEBHOOK_AUTH_HEADER) {
    throw new Error("Invalid authentication header");
  }
}
