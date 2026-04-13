import { redirect } from "next/navigation";
import { canRegister } from "@/actions/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const allowed = await canRegister();
  if (!allowed) {
    redirect("/login");
  }

  return <RegisterForm />;
}
