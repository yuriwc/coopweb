import Navbar from "@/src/components/navbar";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <section className="h-[92vh] overflow-hidden">{children}</section>
    </>
  );
}
