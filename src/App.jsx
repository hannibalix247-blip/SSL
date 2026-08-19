import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { ScheduleCard } from './components/ScheduleCard';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { ScheduleTable } from './components/ScheduleTable';
import { ScheduleModal } from './components/ScheduleModal';
import { PrintModal } from './components/PrintModal';
import { ResultModal } from './components/ResultModal';
import { FirebaseModal } from './components/FirebaseModal';
import { 
  subscribeToSchedules, 
  saveScheduleItem, 
  deleteScheduleItem, 
  resetToDefaultData, 
  exportToCsvFile,
  setLocalSchedules 
} from './services/storage';
import { calculateDDay } from './utils/dateUtils';
import { Sparkles, Plus, Award, Info, Heart } from 'lucide-react';

export default function App() {
  const [schedules, setSchedules] = useState([]);
  const [isCloudSync, setIsCloudSync] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedSport, setSelectedSport] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, upcoming, past
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // cards, timeline, table

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [singlePrintSchedule, setSinglePrintSchedule] = useState(null);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultSchedule, setResultSchedule] = useState(null);

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // 1. Subscribe to Realtime Data
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToSchedules((data, isCloud) => {
      setSchedules(data || []);
      setIsCloudSync(isCloud);
      setIsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // 2. Filter & Search Logic
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      // 1) Sport Filter
      if (selectedSport !== 'all' && item.sport !== selectedSport) {
        return false;
      }

      // 2) Status Filter
      const dday = calculateDDay(item.date);
      if (statusFilter === 'upcoming' && dday.isPast) {
        return false;
      }
      if (statusFilter === 'past' && !dday.isPast) {
        return false;
      }

      // 3) Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const sportMatch = item.sport?.toLowerCase().includes(query);
        const locMatch = item.location?.toLowerCase().includes(query);
        const teachersMatch = item.teachers?.some((t) => t.toLowerCase().includes(query)) ||
                              item.leaderTeacher?.toLowerCase().includes(query) ||
                              item.assistantTeacher?.toLowerCase().includes(query);
        const memoMatch = item.memo?.toLowerCase().includes(query);
        const suppliesMatch = item.supplies?.toLowerCase().includes(query);

        if (!titleMatch && !sportMatch && !locMatch && !teachersMatch && !memoMatch && !suppliesMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [schedules, selectedSport, statusFilter, searchQuery]);

  // CRUD Handlers
  const handleSaveSchedule = async (scheduleData) => {
    await saveScheduleItem(scheduleData);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = async (id) => {
    if (confirm('정말로 이 대회 일정을 삭제하시겠습니까?')) {
      await deleteScheduleItem(id);
    }
  };

  const handleOpenEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenPrintSingle = (schedule) => {
    setSinglePrintSchedule(schedule);
    setIsPrintModalOpen(true);
  };

  const handleOpenPrintAll = () => {
    setSinglePrintSchedule(null);
    setIsPrintModalOpen(true);
  };

  const handleOpenResult = (schedule) => {
    setResultSchedule(schedule);
    setIsResultModalOpen(true);
  };

  const handleResetData = async () => {
    await resetToDefaultData();
  };

  const handleImportData = (importedList) => {
    setLocalSchedules(importedList);
    setSchedules(importedList);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/20 to-slate-100 flex flex-col font-sans pb-20 sm:pb-6">
      
      {/* 1. Header Navbar */}
      <Navbar
        isCloudSync={isCloudSync}
        onOpenNewModal={handleOpenNew}
        onOpenPrintModal={handleOpenPrintAll}
        onExportCsv={() => exportToCsvFile(filteredSchedules)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        onResetData={handleResetData}
        schedulesCount={schedules.length}
      />

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Stats & Countdown Banner */}
        <StatsBanner
          schedules={schedules}
          onSelectSport={(sport) => setSelectedSport(sport)}
        />

        {/* Filter & View Controller Bar */}
        <FilterBar
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
          statusFilter={statusFilter}
          onSelectStatus={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          schedules={schedules}
        />

        {/* 3. Schedules Display Section */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500 mt-3">인솔 일정을 불러오는 중입니다...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-amber-100 shadow-2xs space-y-3">
            <span className="text-5xl block">🏃‍♂️💨</span>
            <h3 className="text-lg sm:text-xl font-bold font-jua text-slate-800">
              선택한 조건에 맞는 대회 일정이 없습니다.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              필터 조건을 변경하거나 <strong>[대회 일정 등록]</strong> 버튼으로 새 대회를 추가해보세요!
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenNew}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-amber-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>새 대회 일정 추가하기</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* View Mode 1: Cards */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredSchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteSchedule}
                    onRecordResult={handleOpenResult}
                    onPrintSingle={handleOpenPrintSingle}
                  />
                ))}
              </div>
            )}

            {/* View Mode 2: Timeline */}
            {viewMode === 'timeline' && (
              <ScheduleTimeline
                schedules={filteredSchedules}
                onEdit={handleOpenEdit}
                onRecordResult={handleOpenResult}
              />
            )}

            {/* View Mode 3: Table */}
            {viewMode === 'table' && (
              <ScheduleTable
                schedules={filteredSchedules}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteSchedule}
                onRecordResult={handleOpenResult}
                onPrintSingle={handleOpenPrintSingle}
              />
            )}
          </div>
        )}

      </main>

      {/* Mobile Floating Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-amber-200 shadow-xl flex items-center justify-between no-print">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          ⬆️ 맨위로
        </button>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>새 일정 등록</span>
        </button>
      </div>

      {/* 4. Footer */}
      <footer className="mt-8 sm:mt-12 bg-white border-t border-amber-100 py-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-600 flex items-center justify-center gap-1 text-xs">
            <span>🏫 세종 소담초등학교 학생스포츠클럽</span>
            <span className="text-amber-500">★</span>
            <span>체육부</span>
          </p>
          <p className="text-[11px] text-slate-400">
            어떤 기기(스마트폰·PC·크롬북)에서도 실시간으로 동기화됩니다.
          </p>
        </div>
      </footer>

      {/* 5. Modals */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        onSave={handleSaveSchedule}
        editingSchedule={editingSchedule}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSinglePrintSchedule(null);
        }}
        schedules={filteredSchedules}
        singleSchedule={singlePrintSchedule}
      />

      <ResultModal
        isOpen={isResultModalOpen}
        onClose={() => {
          setIsResultModalOpen(false);
          setResultSchedule(null);
        }}
        onSave={handleSaveSchedule}
        schedule={resultSchedule}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        isCloudSync={isCloudSync}
        onResetData={handleResetData}
        schedules={schedules}
        onImportData={handleImportData}
      />

    </div>
  );
}
