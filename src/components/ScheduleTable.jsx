import React from 'react';
import { getSportConfig } from '../constants/sports';
import { calculateDDay, formatShortDate } from '../utils/dateUtils';
import { Edit3, Trash2, Trophy, Eye } from 'lucide-react';

export function ScheduleTable({ schedules, onEdit, onDelete, onRecordResult, onPrintSingle }) {
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-amber-100 shadow-2xs">
        <span className="text-4xl block mb-2">📊</span>
        <h3 className="text-lg font-bold font-jua text-slate-700">해당 조건에 맞는 대회가 없습니다.</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-amber-500/10 text-slate-700 border-b border-amber-200/70 font-bold">
              <th className="py-3 px-3.5 whitespace-nowrap">종목</th>
              <th className="py-3 px-3.5 whitespace-nowrap">D-Day</th>
              <th className="py-3 px-3.5 whitespace-nowrap">대회명 (세부일정)</th>
              <th className="py-3 px-3.5 whitespace-nowrap">날짜 (시간)</th>
              <th className="py-3 px-3.5 whitespace-nowrap">목적지 (장소)</th>
              <th className="py-3 px-3.5 whitespace-nowrap">인솔교사</th>
              <th className="py-3 px-3.5 whitespace-nowrap">인원</th>
              <th className="py-3 px-3.5 whitespace-nowrap">비고 (섭외/결과)</th>
              <th className="py-3 px-3.5 text-center whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedules.map((item) => {
              const sportConfig = getSportConfig(item.sport);
              const dday = calculateDDay(item.date);
              const playerCount = item.playersCount || (item.players ? item.players.length : 0);
              const teachers = item.teachers && item.teachers.length > 0 
                ? item.teachers 
                : [item.leaderTeacher, item.assistantTeacher].filter(Boolean);

              return (
                <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                  {/* Sport */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${sportConfig.badgeBg}`}>
                      <span>{sportConfig.emoji}</span>
                      <span>{item.sport}</span>
                    </span>
                  </td>

                  {/* D-Day */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${dday.badgeClass}`}>
                      {dday.text}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-3 px-3.5 font-bold text-slate-800 max-w-[220px]">
                    <div className="line-clamp-2">{item.title}</div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                    <div className="font-semibold text-slate-800">{formatShortDate(item.date)}</div>
                    <div className="text-[11px] text-slate-500">{item.time}</div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-3.5 text-slate-700 max-w-[160px]">
                    <div className="font-medium">{item.location}</div>
                    {item.gatheringPlace && <div className="text-[10px] text-slate-400 truncate">{item.gatheringPlace}</div>}
                  </td>

                  {/* Teachers */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {teachers.map((t, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Players Count */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 text-xs">
                      {playerCount}명
                    </span>
                  </td>

                  {/* Memo / Result */}
                  <td className="py-3 px-3.5 max-w-[180px] text-slate-600">
                    {item.result ? (
                      <span className="font-bold text-amber-700">🏆 {item.result}</span>
                    ) : item.memo ? (
                      <span className="text-[11px] text-slate-600 truncate block">{item.memo}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        onClick={() => onPrintSingle(item)}
                        title="서식 출력"
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRecordResult(item)}
                        title="결과/메모"
                        className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        title="수정"
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="삭제"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
