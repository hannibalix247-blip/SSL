import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, X, MessageSquare } from 'lucide-react';
import { getSportConfig } from '../constants/sports';

export function ResultModal({ isOpen, onClose, onSave, schedule }) {
  const [resultText, setResultText] = useState('');
  const [memoText, setMemoText] = useState('');

  useEffect(() => {
    if (schedule) {
      setResultText(schedule.result || '');
      setMemoText(schedule.memo || '');
    }
  }, [schedule, isOpen]);

  if (!isOpen || !schedule) return null;

  const sportConfig = getSportConfig(schedule.sport);

  const quickBadges = ['우승 🏆🥇', '준우승 🥈', '3위 입상 🥉', '페어플레이상 ✨', '예선 2승 1패', '8강 진출 🏃‍♂️'];

  const handleSubmit = (e) => {
    e.preventDefault();
    // 폭죽 축하 효과
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onSave({
      ...schedule,
      result: resultText,
      memo: memoText,
      status: resultText ? 'completed' : schedule.status
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-100 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="text-lg font-bold font-jua">대회 결과 & 기록 남기기</h3>
              <p className="text-xs text-amber-100">{schedule.sport} - {schedule.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          
          {/* Quick Result Badges */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              🎖️ 빠른 결과 선택
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickBadges.map((badge, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setResultText(badge)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 transition-colors cursor-pointer"
                >
                  {badge}
                </button>
              ))}
            </div>
          </div>

          {/* Result Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              경기 결과 및 스코어
            </label>
            <input
              type="text"
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              placeholder="예: 결승전 2:1 승리로 우승 달성!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none font-bold text-slate-800"
            />
          </div>

          {/* Memo & Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>현장 메모 및 학생 칭찬 피드백</span>
            </label>
            <textarea
              rows={3}
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="학생들이 끝까지 포기하지 않고 페어플레이 정신을 발휘함. 부상자 없이 안전하게 귀교."
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold shadow-md hover:from-amber-600 hover:to-orange-600 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>기록 저장하기</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
