"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn } from "@/src/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});

export type LoginActionState = Readonly<{
  status: "idle" | "success" | "error";
  message: string;
}>;

export async function authenticateWithCredentials(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsedForm = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedForm.success) {
    return {
      status: "error",
      message: parsedForm.error.issues[0]?.message ?? "Check your login details.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsedForm.data.email,
      password: parsedForm.data.password,
      redirect: false,
    });

    return {
      status: "success",
      message: "Welcome back. Taking you to your dashboard.",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: "Invalid email or password." };
    }

    throw error;
  }
}
