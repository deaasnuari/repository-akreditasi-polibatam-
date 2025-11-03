"use client";
import { useEffect, useState } from "react";
import { FileText, CheckCircle, AlertCircle, Activity, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardP4MPage() {
  const [progressLKPS] = useState(75);
  const [progressLED] = useState(60);

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* === Header === */}
      <div>
        <h1 className="text-2xl font-semibold text-[#183A64]">Dashboard P4M</h1>
        <p className="text-gray-600">
          Review dan validasi dokumen yang diunggah, setujui pengajuan
        </p>
      </div>

      {/* === Statistik Box === */}
      <div className="grid grid-cols-4 gap-4">
        <CardStat
          title="Progress LKPS"
          value={`${progressLKPS}%`}
          color="bg-[#6C63FF]"
          icon={<FileText size={20} />}
          href="/dashboard/p4m/reviewLKPS"
        />
        <CardStat
          title="Progress LED"
          value={`${progressLED}%`}
          color="bg-green-500"
          icon={<FileText size={20} />}
          href="/dashboard/p4m/reviewLED"
        />
        <CardStat
          title="Pending Reviews"
          value="8"
          subtitle="Dokumen menunggu review"
          color="bg-orange-500"
          icon={<AlertCircle size={20} />}
          href="/dashboard/p4m/reviewLKPS"
        />
        <CardStat
          title="Status Akreditasi"
          value="B"
          subtitle="Simulasi terakhir"
          color="bg-green-600"
          icon={<CheckCircle size={20} />}
          href="/dashboard/p4m/matriks-penilaian"
        />
      </div>

      {/* === Aktivitas & Notifikasi === */}
      <div className="grid grid-cols-2 gap-4">
        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3 text-[#183A64]">
            Aktivitas Terbaru
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <ActivityItem
              title="LKPS logbook mahasiswa diperbaharui"
              author="Tim Akreditasi"
              time="3 jam lalu"
              color="text-blue-600"
            />
            <ActivityItem
              title="Dokumen hasil pengukuran diunggah"
              author="Tim Akreditasi"
              time="6 jam lalu"
              color="text-orange-600"
            />
            <ActivityItem
              title="LED versi revisi diselesaikan"
              author="Tim Akreditasi"
              time="1 hari lalu"
              color="text-green-600"
            />
            <ActivityItem
              title="Review dokumen diselesaikan"
              author="Reviewer"
              time="2 hari lalu"
              color="text-purple-600"
            />
          </ul>
        </div>

        {/* Notifikasi */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3 text-[#183A64]">Notifikasi</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <NotifItem
              title="Revisi Dokumen"
              detail="Dokumen tentang kebijakan tata kelola memerlukan revisi"
              date="2024-12-10"
            />
            <NotifItem
              title="Revisi Dokumen"
              detail="Dokumen pendukung berhasil diunggah"
              date="2024-12-10"
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

/* === Komponen === */
function CardStat({ title, value, subtitle, color, icon, href }: any) {
  const CardContent = () => (
    <>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2 rounded-full text-white ${color}`}>{icon}</div>
      </div>
      <h3 className="text-2xl font-bold text-[#183A64]">{value}</h3>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}

      {/* progress bar */}
      {title.includes("Progress") && (
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full`}
            style={{ width: value }}
          ></div>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <div className="bg-white rounded-xl shadow p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardContent />
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <CardContent />
    </div>
  );
}

function ActivityItem({ title, author, time, color }: any) {
  return (
    <li className="flex items-start gap-3">
      <Activity className={`${color} mt-1`} size={18} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500">
          {author} • {time}
        </p>
      </div>
    </li>
  );
}

function NotifItem({ title, detail, date }: any) {
  return (
    <li className="flex items-start gap-3">
      <Bell className="text-blue-600 mt-1" size={18} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500">{detail}</p>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </div>
    </li>
  );
}
