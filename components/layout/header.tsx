"use client";

export function Header({ title }: { title?: string }) {
  if (!title) return null;

  return (
    <div className="border-b px-4 py-3 sm:px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
    </div>
  );
}
