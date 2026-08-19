import React from 'react';
import { getSportConfig } from '../constants/sports';
import { calculateDDay, formatKoreanDate } from '../utils/dateUtils';

export function StatsBanner({ schedules, onSelectSport }) {
  const totalCompetitions = schedules.length;
  
  const totalPlayers = schedules.reduce((sum, item) => {
    return sum + (item.playersCount || (item.players ? item.players.length : 0));
  }, 0);

  const uniqueTeachers = new Set();
  schedules.forEach(item => {
    if (item.teachers && Array.isArray(item.teachers)) {
      item.teachers.forEach(t => t && uniqueTeachers.add(t.trim()));
    } else {
      if (item.leaderTeacher) uniqueTeachers.add(item.leaderTeacher.trim());
      if (item.assistantTeacher) uniqueTeachers.add(item.assistantTeacher.trim());
    }
  });
  const totalTeachers = uniqueTeachers.size;

  const upcomingSchedules = schedules
    .filter(s => {
      const dday = calculateDDay(s.date);
      return !dday.isPast;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextSchedule = upcomingSchedules[0];
  const nextDDay = nextSchedule ? calculateDDay(nextSchedule.date) : null;
  const nextSport = nextSchedule ? getSportConfig(nextSchedule.sport) : null;
  const nextTeachers = nextSchedule ? (nextSchedule.teachers || [nextSchedule.leaderTeacher, nextSchedule.assistantTeacher].filter(Boolean)) : [];

  return (
    <div className="mb-6 space-y-4">
      {/* Top Banner: Upcoming Alert */}
      {nextSchedule && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-5 text-white shadow-lg shadow-orange-100">
          <div className="absolute -right-8 -top-8 text-8xl opacity-20 pointer-events-none select-none">
            {nextSport?.emoji || '🏆'}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 border border-white/30 shadow-inner">
                {nextSport?.emoji}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="bg-white/25 backdrop-blur-md text-white text-xs font-black px-2.5 py-0.5 rounded-full border border-white/40">
                    🔥 다음 출전 경기
                  </span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs ${
                    nextDDay.isToday ? 'bg-yellow-300 text-amber-900 animate-bounce' : 'bg-white text-orange-600 font-extrabold'
                  }`}>
                    {nextDDay.text}
                  </span>
                  <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded-md">
                    {nextSchedule.sport}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-jua tracking-wide leading-snug">
                  {nextSchedule.title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-100 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>📅 {formatKoreanDate(nextSchedule.date)} {nextSchedule.time}</span>
                  <span>📍 {nextSchedule.location}</span>
                  <span>🧑‍🏫 인솔: {nextTeachers.join(', ')} 선생님</span>
                  <span>👥 출전: {nextSchedule.playersCount || 0}명</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onSelectSport(nextSchedule.sport)}
              className="self-end md:self-center shrink-0 px-4 py-2 bg-white text-orange-600 hover:bg-amber-50 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>자세히 보기</span>
              <span>👉</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-2xs hover:shadow-md transition-all flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shrink-0">
            🏆
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">총 출전 경기</div>
            <div className="text-xl sm:text-2xl font-black font-jua text-slate-800">
              {totalCompetitions}<span className="text-sm font-normal text-slate-500 ml-1">회</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-2xs hover:shadow-md transition-all flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl shrink-0">
            🏃‍♀️
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">총 출전 연인원</div>
            <div className="text-xl sm:text-2xl font-black font-jua text-sky-900">
              {totalPlayers}<span className="text-sm font-normal text-slate-500 ml-1">명</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs hover:shadow-md transition-all flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shrink-0">
            🧑‍🏫
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">인솔 참여 교사</div>
            <div className="text-xl sm:text-2xl font-black font-jua text-emerald-900">
              {totalTeachers}<span className="text-sm font-normal text-slate-500 ml-1">명</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs hover:shadow-md transition-all flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl shrink-0">
            🎯
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">예정된 경기</div>
            <div className="text-xl sm:text-2xl font-black font-jua text-purple-900">
              {upcomingSchedules.length}<span className="text-sm font-normal text-slate-500 ml-1">경기</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
