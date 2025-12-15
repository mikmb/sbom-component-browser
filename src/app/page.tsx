import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function HomePage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold pt-5 pb-5">SBOM Dashboard</h1>
      <DashboardClient />
    </main>
  );
}
