import { Heart } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-4">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <Heart className="h-8 w-8 fill-primary/20" />
        <span className="text-2xl font-bold tracking-tight">
          Family Health
        </span>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
