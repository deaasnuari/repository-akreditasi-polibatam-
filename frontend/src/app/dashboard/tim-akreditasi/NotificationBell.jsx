"use client";

import React, { useState } from "react";
import { Bell, AlertCircle, CheckCircle } from "lucide-react";

export default function NotificationBell({ variant = "header" }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: 'error',
      title: 'Revisi Dokumen',
      message: 'Dokumen LKPS Bagian 1 harus direvisi',
      time: '5 menit lalu',
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Upload Berhasil',
      message: 'Dokumen bukti pendukung berhasil diupload',
      time: '2 jam lalu',
      read: false
    }
  ]);

  const isHeader = variant === "header";
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* BUTTON ICON */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`
          relative rounded-lg p-3 transition-colors
          ${isHeader 
            ? "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            : "bg-gray-100 hover:bg-gray-200"
          }
        `}
      >
        <Bell className={isHeader ? "text-white" : "text-gray-700"} size={20} />
      </button>

      {/* DROPDOWN */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Notifikasi</h3>
            <button
              onClick={() => alert("Tandai semua sudah dibaca")}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Tandai dibaca
            </button>
          </div>

          {/* LIST NOTIF */}
          <div className="max-h-96 overflow-y-auto">
            
            {/* 1 */}
            <div
              onClick={() =>
                alert("Detail: Dokumen LKPS Bagian 1 perlu revisi.")
              }
              className="p-4 hover:bg-red-50 cursor-pointer border-b border-slate-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-500" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Revisi Dokumen
                  </h4>
                  <p className="text-xs text-slate-600">
                    Dokumen LKPS Bagian 1 harus direvisi
                  </p>
                  <p className="text-xs text-slate-400 mt-1">5 menit lalu</p>
                </div>
              </div>
            </div>

            {/* 2 */}
            <div
              onClick={() =>
                alert('Detail: Dokumen "Sertifikat Dosen.pdf" berhasil diupload')
              }
              className="p-4 hover:bg-green-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 text-sm">
                    Upload Berhasil
                  </h4>
                  <p className="text-xs text-slate-600">
                    Dokumen bukti pendukung berhasil diupload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">2 jam lalu</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-center">
            <button
              onClick={() => alert("Navigasi ke semua notifikasi")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Lihat Semua Notifikasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
