import React from 'react';
import { SPORTS_LIST } from '../constants/sports';
import { Search, LayoutGrid, Calendar, Table, Filter, X } from 'lucide-react';

export function FilterBar({
  selectedSport,
  onSelectSport,
  statusFilter,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  schedules
}) {
  // 각 종목별 개수 계산
  const getSportCount = (sportName) => {
    return schedules.filter(s => s.sport === sportName).length;
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-2xs mb-6 space-y-3.5 no-print">
      
      {/* Top row: Sport chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => onSelectSport('all')}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedSport === 'all'
              ? 'bg-slate-800 text-white shadow-sm ring-2 ring-slate-800/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🏆 전체 종목</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full ${
            selectedSport === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {schedules.length}
          </span>
        </button>

        {SPORTS_LIST.map((sport) => {
          const count = getSportCount(sport.name);
          const isSelected = selectedSport === sport.name;
          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.name)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200 ring-2 ring-amber-400/40'
                  : 'bg-amber-50/60 text-slate-700 hover:bg-amber-100/70 border border-amber-200/50'
              }`}
            >
              <span>{sport.emoji}</span>
              <span>{sport.name}</span>
              <span className={`text-xs px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/25 text-white' : 'bg-amber-200/60 text-amber-900 font-semibold'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom row: Search + Status filter + View modes */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
        
        {/* Search bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="대회명, 인솔교사, 학생이름, 장소 검색..."
            className="w-full pl-9.5 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right tools: Status Filter & View Modes */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">전체 일정</option>
            <option value="upcoming">다가오는 대회</option>
            <option value="past">종료된 대회</option>
          </select>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('cards')}
              title="카드 뷰"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-amber-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">카드</span>
            </button>
            <button
              onClick={() => onViewModeChange('timeline')}
              title="타임라인 뷰"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-amber-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">타임라인</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="테이블 엑셀 뷰"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-amber-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
              <span className="hidden md:inline">테이블</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
