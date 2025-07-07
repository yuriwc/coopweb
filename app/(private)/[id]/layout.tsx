import Navbar from "@/src/components/navbar";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto pt-16">{children}</main>
    </div>
  );
}
