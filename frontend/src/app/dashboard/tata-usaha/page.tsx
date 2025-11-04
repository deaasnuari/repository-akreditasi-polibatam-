'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth';
import { Database, CheckCircle, Clock, AlertTriangle, RefreshCw, FileText, Upload, BookOpen, Download, UserPlus, ExternalLink } from 'lucide-react';

export default function TataUsahaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await getCurrentUser();
      if (!mounted) return;
      if (!user) {
        router.push('/auth');
        return;
      }
      if (user.role !== 'tu') {
        router.push('/auth');
        return;
      }
      setUser(user);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [router]);

  // Data sources
  const dataSources = [
    {
      id: '1',
      name: 'SIAKAD - Data Mahasiswa',
      description: 'Sistem informasi akademik untuk data mahasiswa, nilai, dan kelulusan',
      status: 'connected',
      lastSync: '2024-12-19 08:30',
      recordCount: 2847,
      systemSource: 'SIAKAD v2.1'
    },
    {
      id: '2',
      name: 'SIMPEG - Data Dosen & Tendik',
      description: 'Sistem kepegawaian untuk data dosen dan tenaga kependidikan',
      status: 'connected',
      lastSync: '2024-12-19 07:15',
      recordCount: 156,
      systemSource: 'SIMPEG v1.8'
    },
    {
      id: '3',
      name: 'SIM Keuangan',
      description: 'Sistem keuangan untuk data anggaran dan realisasi',
      status: 'syncing',
      lastSync: '2024-12-19 09:00',
      recordCount: 1242,
      systemSource: 'SIMKeu v3.0'
    },
    {
      id: '4',
      name: 'Arsip Institusi',
      description: 'Dokumen resmi institusi (SK, MoU, Sertifikat)',
      status: 'connected',
      lastSync: '2024-12-18 16:30',
      recordCount: 589,
      systemSource: 'Manual/Digital Archive'
    },
    {
      id: '5',
      name: 'Data LPPM',
      description: 'Data penelitian dan pengabdian masyarakat',
      status: 'pending',
      lastSync: '2024-12-17 14:20',
      recordCount: 234,
      systemSource: 'SIM Penelitian'
    },
    {
      id: '6',
      name: 'Data PDDikti',
      description: 'Data eksternal dari Pangkalan Data Dikti',
      status: 'error',
      lastSync: '2024-12-16 10:00',
      recordCount: 0,
      systemSource: 'PDDikti API'
    }
  ];

  const documentRequests = [
    {
      id: '1',
      requestedBy: 'Tim Akreditasi',
      documentType: 'Data Lulusan 5 Tahun Terakhir',
      description: 'Data lengkap lulusan dengan waktu studi dan IPK',
      priority: 'high',
      deadline: '2024-12-22',
      status: 'in-progress',
      estimatedHours: 8
    },
    {
      id: '2',
      requestedBy: 'P4M',
      documentType: 'SK Penugasan Dosen',
      description: 'SK penugasan dosen pengampu mata kuliah inti',
      priority: 'medium',
      deadline: '2024-12-25',
      status: 'pending',
      estimatedHours: 4
    },
    {
      id: '3',
      requestedBy: 'Tim Akreditasi',
      documentType: 'Data Kerjasama Institusi',
      description: 'MoU dan dokumen kerjasama dengan industri/institusi lain',
      priority: 'medium',
      deadline: '2024-12-27',
      status: 'completed',
      estimatedHours: 6
    }
  ];

  const collectionTasks = [
    {
      id: '1',
      title: 'Kompilasi Data Sarana Prasarana',
      description: 'Mengumpulkan data laboratorium, perpustakaan, dan fasilitas pembelajaran',
      sourceUnit: 'Bagian Umum & Bagian Akademik',
      category: 'LKPS',
      status: 'collecting',
      progress: 65,
      assignedTo: 'TU Admin'
    },
    {
      id: '2',
      title: 'Dokumen Kurikulum & Silabus',
      description: 'Pengumpulan dokumen kurikulum terbaru dan silabus semua mata kuliah',
      sourceUnit: 'Bagian Akademik',
      category: 'LED',
      status: 'review',
      progress: 90,
      assignedTo: 'TU Admin'
    },
    {
      id: '3',
      title: 'Sertifikat Akreditasi Institusi',
      description: 'Dokumen akreditasi institusi dan program studi lain',
      sourceUnit: 'Rektorat',
      category: 'Umum',
      status: 'completed',
      progress: 100,
      assignedTo: 'TU Admin'
    },
    {
      id: '4',
      title: 'Data Tracer Study',
      description: 'Hasil survei tracer study dan feedback alumni',
      sourceUnit: 'CDC & Alumni',
      category: 'LKPS',
      status: 'not-started',
      progress: 0,
      assignedTo: 'TU Admin'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'syncing':
      case 'in-progress':
      case 'collecting':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
      case 'not-started':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'review':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      connected: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terhubung' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      syncing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sinkronisasi' },
      'in-progress': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Proses' },
      collecting: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Proses' },
      error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' },
      'not-started': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Belum Mulai' },
      review: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Review' }
    };
    const badge = badges[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
    return <span className={`px-2 py-1 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Tinggi' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sedang' },
      low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Rendah' }
    };
    const badge = badges[priority] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
    return <span className={`px-2 py-1 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const dataStats = {
    connected: dataSources.filter(ds => ds.status === 'connected').length,
    total: dataSources.length,
    totalRecords: dataSources.reduce((sum, ds) => sum + ds.recordCount, 0)
  };

  const taskStats = {
    completed: collectionTasks.filter(t => t.status === 'completed').length,
    total: collectionTasks.length,
    avgProgress: Math.round(collectionTasks.reduce((sum, t) => sum + t.progress, 0) / collectionTasks.length)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#183A64] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard TU - Sumber Data Akreditasi</h1>
        <p className="text-gray-600 mt-2">Kelola sumber data, koordinasi pengumpulan dokumen akreditasi, dan manajemen akun pengguna</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="w-12 h-12 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Sumber Data</p>
              <p className="text-2xl font-bold text-gray-900">{dataStats.connected}/{dataStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{dataStats.totalRecords.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-12 h-12 text-purple-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600">Tugas Selesai</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.completed}/{taskStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex-shrink-0"></div>
            <div>
              <p className="text-sm text-gray-600">Progress Rata-rata</p>
              <p className="text-2xl font-bold text-blue-600">{taskStats.avgProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Data Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5" />
            <h3 className="font-bold text-gray-900">Sumber Data Sistem</h3>
          </div>
          <div className="space-y-4">
            {dataSources.map((source) => (
              <div key={source.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900">{source.name}</h4>
                      {getStatusBadge(source.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{source.description}</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500">
                      <span>Source: {source.systemSource}</span>
                      <span>Records: {source.recordCount.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Last sync: {source.lastSync}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusIcon(source.status)}
                    {source.status === 'connected' && (
                      <button className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5" />
            <h3 className="font-bold text-gray-900">Permintaan Dokumen</h3>
          </div>
          <div className="space-y-4">
            {documentRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900">{request.documentType}</h4>
                      {getPriorityBadge(request.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-500">
                      <span>Dari: {request.requestedBy}</span>
                      <span>Deadline: {request.deadline}</span>
                      <span>Est: {request.estimatedHours}h</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collection Tasks */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold text-gray-900">Tugas Pengumpulan Data</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {collectionTasks.map((task) => (
            <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{task.title}</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700">
                      {task.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>Unit: {task.sourceUnit}</span>
                    <span>PIC: {task.assignedTo}</span>
                  </div>
                </div>
                <div className="ml-2">
                  {getStatusBadge(task.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span className="font-semibold">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Database className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Sync Data</span>
          </button>
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Download className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Export Data</span>
          </button>
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Upload Dokumen</span>
          </button>
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <UserPlus className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Kelola Akun</span>
          </button>
          <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Laporan Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}