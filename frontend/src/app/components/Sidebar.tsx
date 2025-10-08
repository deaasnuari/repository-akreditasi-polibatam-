"use client";

interface SidebarProps {
  role: string;
}

export default function Sidebar({ role }: SidebarProps) {
  let menuItems: string[] = [];

  if (role === "tata_usaha") menuItems = ["Dashboard", "Data Mahasiswa", "Laporan", "Settings"];
  else if (role === "tim_akreditasi") menuItems = ["Dashboard", "Dokumen Akreditasi", "Rekap Nilai"];
  else if (role === "p4m") menuItems = ["Dashboard", "Monitoring", "Laporan"];

  return (
    <aside className="fixed left-0 top-0 w-64 bg-white shadow-md h-screen p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-6">Menu {role.replace("_", " ")}</h2>
      <ul className="space-y-3 flex-1 overflow-auto">
        {menuItems.map((item) => (
          <li 
  key={item} 
  className="hover:bg-[#ADE7F7] p-2 rounded cursor-pointer transition-colors duration-200"
>
  {item}
</li>
        ))}
      </ul>
      <div className="mt-auto">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/";
          }}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}