'use client';

import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SubCriteria {
  id: string;
  title: string;
  description: string;
  content: string;
  wordLimit: number;
  status: 'completed' | 'in-progress' | 'not-started';
  hasResearchData?: boolean;
}

export default function ReviewLEDPage() {
  const [allSections, setAllSections] = useState<SubCriteria[]>([
    {
      id: 'pendahuluan',
      title: 'Pendahuluan',
      description: 'Dasar penyusunan, tim penyusun, dan mekanisme kerja evaluasi diri',
      content: '',
      wordLimit: 500,
      status: 'in-progress'
    },
    {
      id: 'kondisi-eksternal',
      title: 'Kondisi Eksternal',
      description: 'Analisis lingkungan makro dan mikro yang mempengaruhi program studi',
      content: '',
      wordLimit: 500,
      status: 'in-progress'
    },
    {
      id: 'profil-upps',
      title: 'Profil UPPS',
      description: 'Profil mahasiswa, dosen, keuangan, sarana prasarana, mutu, dan kinerja tridharma',
      content: '',
      wordLimit: 600,
      status: 'in-progress'
    },
    {
      id: 'c1',
      title: 'C.1 Budaya Mutu',
      description: 'Analisis PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) sistem penjaminan mutu',
      content: '',
      wordLimit: 500,
      status: 'not-started'
    },
    {
      id: 'c2',
      title: 'C.2 Relevansi Pendidikan',
      description: 'Kesesuaian pembelajaran dengan kebutuhan pasar kerja dan perkembangan ilmu',
      content: '',
      wordLimit: 500,
      status: 'not-started'
    },
    {
      id: 'c3',
      title: 'C.3 Relevansi Penelitian',
      description: 'Kegiatan penelitian yang mendukung pengembangan ilmu dan teknologi',
      content: '',
      wordLimit: 500,
      status: 'not-started',
      hasResearchData: true
    },
    {
      id: 'c4',
      title: 'C.4 Relevansi PKM',
      description: 'Kegiatan pengabdian kepada masyarakat yang relevan dengan bidang keilmuan',
      content: '',
      wordLimit: 500,
      status: 'not-started',
      hasResearchData: true
    },
    {
      id: 'c5',
      title: 'C.5 Akuntabilitas',
      description: 'Transparansi dan akuntabilitas pengelolaan program studi',
      content: '',
      wordLimit: 500,
      status: 'not-started'
    },
    {
      id: 'c6',
      title: 'C.6 Diferensiasi Misi',
      description: 'Keunikan dan kekhasan program studi dalam mencapai visi dan misi',
      content: '',
      wordLimit: 500,
      status: 'not-started'
    },
    {
      id: 'suplemen',
      title: 'Suplemen Program Studi',
      description: 'Informasi tambahan yang relevan dengan capaian dan keunggulan program studi',
      content: '',
      wordLimit: 400,
      status: 'not-started'
    },
    {
      id: 'penutup',
      title: 'Penutup',
      description: 'Kesimpulan umum dan rencana tindak lanjut hasil evaluasi diri',
      content: '',
      wordLimit: 300,
      status: 'not-started'
    }
  ]);

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [uploadedFiles] = useState<{ [key: string]: string[] }>({
    pendahuluan: ['Struktur_Organisasi.pdf', 'SK_Tim_Penyusun.pdf']
  });

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getStatusBadge = (wordCount: number, limit: number) => {
    if (wordCount === 0) return { text: 'Belum Dimulai', variant: 'secondary' as const };
    if (wordCount < limit * 0.5) return { text: 'Perlu Perhatian', variant: 'destructive' as const };
    if (wordCount < limit) return { text: 'Dalam Progress', variant: 'default' as const };
    return { text: 'Selesai', variant: 'default' as const };
  };

  const getStats = () => {
    const total = allSections.length;
    const completed = allSections.filter(s => getWordCount(s.content) >= s.wordLimit).length;
    const inProgress = allSections.filter(s => {
      const wc = getWordCount(s.content);
      return wc > 0 && wc < s.wordLimit;
    }).length;
    const notStarted = allSections.filter(s => getWordCount(s.content) === 0).length;
    
    return { total, completed, inProgress, notStarted };
  };

  const calculateOverallProgress = () => {
    const totalSections = allSections.length;
    const completedSections = allSections.filter(
      section => getWordCount(section.content) >= section.wordLimit
    ).length;
    return Math.round((completedSections / totalSections) * 100);
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateContent = (index: number, content: string) => {
    const updated = [...allSections];
    updated[index].content = content;
    setAllSections(updated);
  };

  const stats = getStats();
  const overallProgress = calculateOverallProgress();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">LED (Laporan Evaluasi Diri)</h1>
          <p className="text-gray-600">Tulis konten naratif evaluasi diri program studi</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Progress LED</h2>
            <span className="text-lg font-semibold text-gray-900">{overallProgress}% Completed</span>
          </div>
          
          <Progress value={overallProgress} className="h-2" />
          
          <div className="grid grid-cols-4 gap-4 pt-2">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Kriteria</div>
              <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
            </div>
            <div>
              <div className="text-sm text-green-600 mb-1">Selesai</div>
              <div className="text-2xl font-semibold text-green-600">{stats.completed}</div>
            </div>
            <div>
              <div className="text-sm text-orange-600 mb-1">Dalam Progress</div>
              <div className="text-2xl font-semibold text-orange-600">{stats.inProgress}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Belum Dimulai</div>
              <div className="text-2xl font-semibold text-gray-900">{stats.notStarted}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Review Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-700">
          <span className="font-semibold">Mode Review:</span> Anda dapat melihat semua konten LED dalam mode read-only. Gunakan sistem notifikasi untuk memberikan feedback kepada Tim Akreditasi.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Konten LED</h2>

        {/* All Sections */}
        <div className="space-y-3">
          {allSections.map((section, index) => {
            const wordCount = getWordCount(section.content);
            const statusBadge = getStatusBadge(wordCount, section.wordLimit);
            const progress = Math.min((wordCount / section.wordLimit) * 100, 100);
            const sectionKey = `section-${index}`;
            const isExpanded = expandedSections[sectionKey];

            return (
              <Collapsible
                key={section.id}
                open={isExpanded}
                onOpenChange={() => toggleSection(sectionKey)}
                className="border rounded-lg"
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50">
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 mb-1">{section.title}</div>
                      <div className="text-sm text-gray-600">{section.description}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
                      <span className="text-sm text-gray-600">{wordCount}/{section.wordLimit} kata</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t p-4 space-y-4">
                    {/* Research Data Tabs */}
                    {section.hasResearchData && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="font-medium text-blue-900 mb-2">
                          {section.id === 'c3' ? 'Data Penelitian dari LKPS' : 'Data PKM dari LKPS'}
                        </div>
                        <div className="text-sm text-blue-700 mb-3">
                          Analisis naratif dapat merujuk pada data kuantitatif yang telah diinput di bagian LKPS:
                        </div>
                        <Tabs defaultValue="table1" className="w-full">
                          <TabsList className="bg-white">
                            {section.id === 'c3' ? (
                              <>
                                <TabsTrigger value="table1">Tabel Penelitian DTPR</TabsTrigger>
                                <TabsTrigger value="table2">Sarana Prasarana Penelitian</TabsTrigger>
                                <TabsTrigger value="table3">Publikasi Penelitian</TabsTrigger>
                              </>
                            ) : (
                              <>
                                <TabsTrigger value="table1">Tabel PKM DTPR</TabsTrigger>
                                <TabsTrigger value="table2">Kerjasama PKM</TabsTrigger>
                                <TabsTrigger value="table3">Luaran PKM</TabsTrigger>
                              </>
                            )}
                          </TabsList>
                          <TabsContent value="table1" className="mt-4 p-4 bg-white rounded border">
                            <div className="text-sm text-gray-600">
                              {section.id === 'c3' ? 'Data tabel penelitian DTPR akan ditampilkan di sini' : 'Data tabel PKM DTPR akan ditampilkan di sini'}
                            </div>
                          </TabsContent>
                          <TabsContent value="table2" className="mt-4 p-4 bg-white rounded border">
                            <div className="text-sm text-gray-600">
                              {section.id === 'c3' ? 'Data sarana prasarana penelitian akan ditampilkan di sini' : 'Data kerjasama PKM akan ditampilkan di sini'}
                            </div>
                          </TabsContent>
                          <TabsContent value="table3" className="mt-4 p-4 bg-white rounded border">
                            <div className="text-sm text-gray-600">
                              {section.id === 'c3' ? 'Data publikasi penelitian akan ditampilkan di sini' : 'Data luaran PKM akan ditampilkan di sini'}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}

                    {/* Narrative Content */}
                    <div>
                      <div className="font-medium text-gray-900 mb-2">
                        Konten Naratif ({wordCount}/{section.wordLimit} kata)
                      </div>
                      <Textarea
                        placeholder={`Tuliskan analisis mendalam untuk ${section.title}. Jelaskan penetapan, pelaksanaan, evaluasi, pengendalian, dan peningkatan (PPEPP)...`}
                        value={section.content}
                        onChange={(e) => updateContent(index, e.target.value)}
                        className="min-h-32 resize-y"
                      />
                    </div>
                    
                    {/* Progress Bar */}
                    <div>
                      <Progress value={progress} className="h-1.5" />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          Minimum {section.wordLimit} kata untuk analisis yang komprehensif
                        </span>
                        <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    {section.id === 'pendahuluan' && uploadedFiles.pendahuluan && (
                      <div>
                        <div className="font-medium text-gray-900 mb-2">Dokumen Pendukung</div>
                        <div className="space-y-2">
                          {uploadedFiles.pendahuluan.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-blue-600">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}