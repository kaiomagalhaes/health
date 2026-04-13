"use server";

import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { signIn } from "@/auth";

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await dbConnect();

  const existingUserCount = await User.countDocuments();
  if (existingUserCount > 0) {
    return { error: "Registration is disabled. A user already exists." };
  }

  const existingEmail = await User.findOne({ email: parsed.data.email });
  if (existingEmail) {
    return { error: "This email is already registered." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
  });

  return { success: true };
}

export async function loginUser(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return { error: "Invalid email or password" };
  }
}

export async function canRegister() {
  await dbConnect();
  const count = await User.countDocuments();
  return count === 0;
}
