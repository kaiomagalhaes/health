import { Navbar } from "@/components/layout/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl flex-1 flex flex-col">
        {children}
      </div>
    </>
  );
}
