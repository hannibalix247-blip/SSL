import React from 'react';
import { getSportConfig } from '../constants/sports';
import { calculateDDay, formatKoreanDate } from '../utils/dateUtils';
import { Calendar, Clock, MapPin, Users, UserCheck, Trophy, Edit3 } from 'lucide-react';

export function ScheduleTimeline({ schedules, onEdit, onRecordResult }) {
  const sorted = [...schedules].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-amber-100 shadow-2xs">
        <span className="text-4xl block mb-2">🗓️</span>
        <h3 className="text-lg font-bold font-jua text-slate-700">해당 조건에 맞는 대회가 없습니다.</h3>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-orange-300 before:to-slate-300">
      {sorted.map((item) => {
        const sportConfig = getSportConfig(item.sport);
        const dday = calculateDDay(item.date);
        const playerCount = item.playersCount || (item.players ? item.players.length : 0);
        const teachers = item.teachers && item.teachers.length > 0 
          ? item.teachers 
          : [item.leaderTeacher, item.assistantTeacher].filter(Boolean);

        return (
          <div key={item.id} className="relative group">
            
            {/* Timeline Node Dot */}
            <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-md ring-4 ring-white ${
              dday.isToday 
                ? 'bg-rose-500 text-white animate-pulse' 
                : dday.isPast 
                  ? 'bg-slate-300 text-slate-600' 
                  : 'bg-amber-500 text-white'
            }`}>
              {sportConfig.emoji}
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-2xs hover:shadow-md transition-all">
              
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sportConfig.badgeBg}`}>
                    {item.sport}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${dday.badgeClass}`}>
                    {dday.text}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRecordResult(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    title="결과/메모"
                  >
                    <Trophy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="수정"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-base sm:text-lg font-bold font-jua text-slate-800 mb-2">
                {item.title}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-800">{formatKoreanDate(item.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.time || '시간 미정'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="font-bold text-sky-800">{playerCount}명 출전</span>
                </div>
              </div>

              {/* Teachers Tags */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">인솔교사:</span>
                {teachers.map((t, idx) => (
                  <span key={idx} className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
                    {t} 선생님
                  </span>
                ))}
                {item.memo && (
                  <span className="text-xs text-slate-500 ml-2 italic">
                    ({item.memo})
                  </span>
                )}
              </div>

              {item.result && (
                <div className="mt-2 text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  🏆 결과: {item.result}
                </div>
              )}

            </div>

          </div>
        );
      })}
    </div>
  );
}
