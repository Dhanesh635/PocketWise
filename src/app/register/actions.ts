"use server";

import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

import { signIn } from "@/src/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export type RegisterActionState = Readonly<{
  status: "idle" | "success" | "error";
  message: string;
}>;

export async function registerWithCredentials(
  _previousState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsedForm = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedForm.success) {
    return {
      status: "error",
      message: parsedForm.error.issues[0]?.message ?? "Check your details.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsedForm.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      status: "error",
      message: "An account already exists for this email.",
    };
  }

  const passwordHash = await hash(parsedForm.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: parsedForm.data.name,
        email: parsedForm.data.email,
        passwordHash,
      },
    });

    await signIn("credentials", {
      email: parsedForm.data.email,
      password: parsedForm.data.password,
      redirect: false,
    });

    return {
      status: "success",
      message: "Your account is ready. Opening your dashboard.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        status: "error",
        message: "An account already exists for this email.",
      };
    }

    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Account created. Please sign in with your new password.",
      };
    }

    throw error;
  }
}
