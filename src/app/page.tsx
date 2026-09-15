import { redirect } from "next/navigation";

import { auth } from "@/src/auth";

export default async function HomePage() {
  const session = await auth();

  redirect(session?.user?.id ? "/dashboard" : "/login");
}
