import { auth } from "@/src/auth";

export type CurrentUser = Readonly<{
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}>;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
}
