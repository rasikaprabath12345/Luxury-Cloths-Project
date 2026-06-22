export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* මෙතනට පසුව Admin Navbar හෝ Sidebar එකතු කළ හැක */}
      <nav className="bg-white shadow-sm p-4 mb-6">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </nav>
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  );
}