import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "KTP Indiana",
  description: "Kentucky Teachers Pension - Indiana",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen">
      <Navbar />
      {children}
    </div>
  );
}
