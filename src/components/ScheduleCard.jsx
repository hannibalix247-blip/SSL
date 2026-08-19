import React, { useState } from 'react';
import { getSportConfig } from '../constants/sports';
import { calculateDDay, formatKoreanDate } from '../utils/dateUtils';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserCheck, 
  Bus, 
  Edit3, 
  Trash2, 
  Trophy, 
  Share2, 
  CheckCircle2, 
  MessageSquare,
  Package
} from 'lucide-react';

export function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onRecordResult,
  onPrintSingle
}) {
  const [copied, setCopied] = useState(false);

  const sportConfig = getSportConfig(schedule.sport);
  const dday = calculateDDay(schedule.date);
  const playerCount = schedule.playersCount || (schedule.players ? schedule.players.length : 0);
  const teachers = schedule.teachers && schedule.teachers.length > 0 
    ? schedule.teachers 
    : [schedule.leaderTeacher, schedule.assistantTeacher].filter(Boolean);

  const handleCopySummary = () => {
    const text = `[소담초 학생스포츠클럽 대회 인솔 안내]
🏆 종목: ${schedule.sport} (${schedule.title})
📅 일시: ${schedule.date} ${schedule.time}
📍 목적지: ${schedule.location}
🚩 집결: ${schedule.gatheringPlace || '소담초'}
🧑‍🏫 인솔교사: ${teachers.join(', ')} 선생님
👥 출전인원: ${playerCount}명
📝 비고: ${schedule.memo || schedule.result || '-'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-3xl bg-white border border-amber-100/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
      dday.isToday ? 'ring-2 ring-rose-400' : ''
    }`}>
      
      {/* Top Banner */}
      <div className={`p-4 sm:p-5 pb-3.5 ${sportConfig.cardBg} border-b border-inherit`}>
        
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold border shadow-2xs ${sportConfig.badgeBg}`}>
              <span className="text-base">{sportConfig.emoji}</span>
              <span>{schedule.sport}</span>
            </span>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-2xs ${dday.badgeClass}`}>
              {dday.text}
            </span>
          </div>

          <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopySummary}
              title="안내문 클립보드 복사"
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white/80 transition-all cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onRecordResult(schedule)}
              title="경기 결과 및 메모 기록"
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-white/80 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(schedule)}
              title="일정 수정"
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white/80 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(schedule.id)}
              title="일정 삭제"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white/80 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold font-jua text-slate-800 leading-snug tracking-wide line-clamp-2">
          {schedule.title}
        </h3>

        {/* Date & Time */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-700 bg-white/75 backdrop-blur-xs p-2 rounded-xl border border-white/60">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>{formatKoreanDate(schedule.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{schedule.time || '시간 미정'}</span>
          </div>
        </div>

      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm flex-1">
        
        {/* Destination Location */}
        <div className="flex items-start gap-2 text-slate-700">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800">목적지: </span>
            <span className="font-medium text-slate-900">{schedule.location}</span>
          </div>
        </div>

        {/* Gathering / Transport */}
        {schedule.gatheringPlace && (
          <div className="flex items-start gap-2 text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/50">
            <Bus className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">집결: </span>
              <span>{schedule.gatheringPlace}</span>
              {schedule.transportation && (
                <span className="text-[11px] text-amber-700 block mt-0.5">
                  이동: {schedule.transportation}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Teachers Multi-badges */}
        <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-100/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>인솔 교사</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
              {teachers.length}명 인솔
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {teachers.length > 0 ? (
              teachers.map((teacher, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-900 font-bold rounded-xl border border-emerald-200 shadow-2xs text-xs"
                >
                  <span>🧑‍🏫</span>
                  <span>{teacher} 선생님</span>
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">인솔교사 미정</span>
            )}
          </div>
        </div>

        {/* Players Count Box */}
        <div className="bg-sky-50/70 rounded-2xl p-3 border border-sky-100/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-sky-900 text-xs">
            <Users className="w-4 h-4 text-sky-600" />
            <span>출전 선수 총원</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-black font-jua text-sky-600">{playerCount}</span>
            <span className="text-xs font-bold text-sky-800">명 출전</span>
          </div>
        </div>

        {/* Memo & Notes */}
        {(schedule.memo || schedule.result) && (
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-xs space-y-1">
            {schedule.result && (
              <div className="font-bold text-amber-700 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>결과: {schedule.result}</span>
              </div>
            )}
            {schedule.memo && (
              <div className="text-slate-600 flex items-start gap-1">
                <MessageSquare className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                <span>{schedule.memo}</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Controls */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onPrintSingle(schedule)}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-200/70 transition-colors cursor-pointer"
        >
          <span>📄 서식 출력</span>
        </button>
        <button
          onClick={() => onEdit(schedule)}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>✏️ 내용 수정</span>
        </button>
      </div>

    </div>
  );
}
