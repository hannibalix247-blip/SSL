import React, { useState } from 'react';
import { formatKoreanDate } from '../utils/dateUtils';
import { Printer, X } from 'lucide-react';

export function PrintModal({ isOpen, onClose, schedules, singleSchedule }) {
  const [selectedMode, setSelectedMode] = useState(singleSchedule ? 'single' : 'all');
  const [selectedId, setSelectedId] = useState(singleSchedule?.id || schedules[0]?.id || '');

  if (!isOpen) return null;

  const currentSchedule = singleSchedule || schedules.find(s => s.id === selectedId) || schedules[0];
  const currentTeachers = currentSchedule ? (currentSchedule.teachers || [currentSchedule.leaderTeacher, currentSchedule.assistantTeacher].filter(Boolean)) : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header (No Print) */}
        <div className="p-4 sm:p-5 bg-slate-800 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center space-x-2.5">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold font-jua">인솔 계획서 인쇄 및 PDF 저장</h3>
              <p className="text-xs text-slate-300">학교 결재 및 현장 지참용 인솔 계획서 서식입니다.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>지금 인쇄하기</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Toolbar (No Print) */}
        {!singleSchedule && (
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">인쇄 대상:</span>
              <button
                onClick={() => setSelectedMode('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedMode === 'all' ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border'
                }`}
              >
                전체 대회 종합 일정표
              </button>
              <button
                onClick={() => setSelectedMode('single')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  selectedMode === 'single' ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 border'
                }`}
              >
                개별 대회 상세 인솔 계획서
              </button>
            </div>

            {selectedMode === 'single' && (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800"
              >
                {schedules.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.sport}] {s.title} ({s.date})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Printable Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-slate-200/50 print:bg-white print:p-0">
          
          {selectedMode === 'single' && currentSchedule ? (
            <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-md print:shadow-none print:p-0 mx-auto max-w-2xl border border-slate-200 print:border-none text-slate-900">
              
              <div className="text-center pb-6 border-b-2 border-slate-800 mb-6">
                <div className="text-xs font-bold text-slate-500 tracking-widest mb-1">2026학년도 소담초등학교 교육활동</div>
                <h1 className="text-2xl sm:text-3xl font-black font-jua tracking-wide text-slate-900">
                  학생스포츠클럽 ({currentSchedule.sport}) 대회 인솔 계획서
                </h1>
                <p className="text-xs text-slate-500 mt-2">소담초등학교 체육부</p>
              </div>

              {/* 1. Overview */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
                  1. 대회 및 인솔 개요
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <tbody>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 text-left w-24 font-bold">대 회 명</th>
                      <td colSpan={3} className="border border-slate-300 p-2 font-semibold">{currentSchedule.title}</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 text-left font-bold">대회 종목</th>
                      <td className="border border-slate-300 p-2">{currentSchedule.sport}</td>
                      <th className="border border-slate-300 bg-slate-100 p-2 text-left w-24 font-bold">출전 인원</th>
                      <td className="border border-slate-300 p-2 font-bold">{currentSchedule.playersCount}명</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 text-left font-bold">대회 일시</th>
                      <td colSpan={3} className="border border-slate-300 p-2 font-semibold">
                        {formatKoreanDate(currentSchedule.date)} {currentSchedule.time}
                      </td>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 text-left font-bold">경기 장소</th>
                      <td colSpan={3} className="border border-slate-300 p-2">{currentSchedule.location}</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 text-left font-bold">집결 및 이동</th>
                      <td colSpan={3} className="border border-slate-300 p-2">
                        {currentSchedule.gatheringPlace || '소담초'} / {currentSchedule.transportation || '인솔 이동'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. Teachers */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
                  2. 인솔 교사 (총 {currentTeachers.length}명)
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded text-xs">
                  <strong>인솔 교사: </strong>
                  {currentTeachers.map(t => `${t} 선생님`).join(', ')}
                </div>
              </div>

              {/* 3. Supplies & Safety */}
              <div className="space-y-3 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
                    3. 비고 및 준비사항
                  </h3>
                  <p className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                    {currentSchedule.memo || currentSchedule.supplies || '유니폼, 식수 및 간식 지참. 사전 준비운동 철저 및 안전 수칙 준수.'}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-300 text-center space-y-4">
                <p className="text-sm font-bold">소 담 초 등 학 교 장</p>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl shadow-md print:shadow-none print:p-0 mx-auto max-w-4xl border border-slate-200 print:border-none text-slate-900">
              <div className="text-center pb-4 border-b-2 border-slate-800 mb-4">
                <h1 className="text-2xl font-black font-jua tracking-wide">
                  2026학년도 소담초등학교 학생스포츠클럽 대회 출전 및 인솔 현황표
                </h1>
                <p className="text-xs text-slate-500 mt-1">출력일자: {new Date().toLocaleDateString('ko-KR')}</p>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800">
                    <th className="border border-slate-300 p-2 text-center">연번</th>
                    <th className="border border-slate-300 p-2">종목</th>
                    <th className="border border-slate-300 p-2">대회명</th>
                    <th className="border border-slate-300 p-2">날짜 (시간)</th>
                    <th className="border border-slate-300 p-2">목적지 (장소)</th>
                    <th className="border border-slate-300 p-2">인솔교사</th>
                    <th className="border border-slate-300 p-2 text-center">인원</th>
                    <th className="border border-slate-300 p-2">비고 (섭외현황)</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s, idx) => {
                    const teachersList = s.teachers ? s.teachers.join(', ') : (s.leaderTeacher || '');
                    return (
                      <tr key={idx}>
                        <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-bold text-center">{s.sport}</td>
                        <td className="border border-slate-300 p-2 font-semibold">{s.title}</td>
                        <td className="border border-slate-300 p-2 text-center">{s.date} ({s.time})</td>
                        <td className="border border-slate-300 p-2">{s.location}</td>
                        <td className="border border-slate-300 p-2 font-medium">{teachersList}</td>
                        <td className="border border-slate-300 p-2 text-center font-bold">{s.playersCount}명</td>
                        <td className="border border-slate-300 p-2 text-slate-600">{s.memo || s.result || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
