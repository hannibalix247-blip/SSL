import React, { useState, useEffect } from 'react';
import { SPORTS_LIST, getSportConfig } from '../constants/sports';
import { DEFAULT_TEACHERS } from '../constants/teachers';
import { X, UserCheck, Users, Calendar, MapPin, Clock, Bus, Package, ShieldAlert, Sparkles, Plus, Minus, Check } from 'lucide-react';

export function ScheduleModal({ isOpen, onClose, onSave, editingSchedule }) {
  const [formData, setFormData] = useState({
    sport: '족구',
    title: '',
    date: '',
    time: '17:00',
    location: '나성중학교 체육관',
    gatheringTime: '16:20',
    gatheringPlace: '소담초 체육관 앞',
    teachers: ['정광섭', '박이슬'],
    customTeacher: '',
    playersCount: 6,
    transportation: '학교 차량 / 인솔 이동',
    supplies: '유니폼, 족구공, 식수 및 간식',
    memo: '',
    status: 'scheduled',
  });

  const [hasCustomTeacher, setHasCustomTeacher] = useState(false);

  useEffect(() => {
    if (editingSchedule) {
      const teachers = editingSchedule.teachers || (editingSchedule.leaderTeacher ? [editingSchedule.leaderTeacher, editingSchedule.assistantTeacher].filter(Boolean) : ['정광섭']);
      const isCustomIncluded = teachers.some(t => !DEFAULT_TEACHERS.slice(0, -1).includes(t));
      const customName = teachers.find(t => !DEFAULT_TEACHERS.slice(0, -1).includes(t)) || '';

      setFormData({
        ...editingSchedule,
        teachers: teachers.filter(t => DEFAULT_TEACHERS.slice(0, -1).includes(t)),
        customTeacher: customName,
        playersCount: editingSchedule.playersCount || (editingSchedule.players ? editingSchedule.players.length : 6),
      });
      setHasCustomTeacher(isCustomIncluded);
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setFormData({
        sport: '족구',
        title: '족구 대회',
        date: todayStr,
        time: '17:00',
        location: '나성중학교 체육관',
        gatheringTime: '16:20',
        gatheringPlace: '소담초 체육관 앞',
        teachers: ['정광섭', '박이슬'],
        customTeacher: '',
        playersCount: 6,
        transportation: '인솔 이동',
        supplies: '유니폼, 공, 식수',
        memo: '',
        status: 'scheduled',
      });
      setHasCustomTeacher(false);
    }
  }, [editingSchedule, isOpen]);

  if (!isOpen) return null;

  const currentSport = getSportConfig(formData.sport);

  // 종목 변경
  const handleSportSelect = (sportName) => {
    const cfg = getSportConfig(sportName);
    setFormData(prev => ({
      ...prev,
      sport: sportName,
      title: prev.title.includes('대회') ? `${sportName} 대회` : prev.title,
      playersCount: cfg.defaultPlayersCount || 6
    }));
  };

  // 인솔교사 토글 (2~4명 선택 가능)
  const handleTeacherToggle = (teacherName) => {
    if (teacherName === '기타') {
      setHasCustomTeacher(!hasCustomTeacher);
      return;
    }

    setFormData(prev => {
      const exists = prev.teachers.includes(teacherName);
      let updated;
      if (exists) {
        updated = prev.teachers.filter(t => t !== teacherName);
      } else {
        if (prev.teachers.length >= 4) {
          alert('인솔교사는 최대 4명까지 선택할 수 있습니다.');
          return prev;
        }
        updated = [...prev.teachers, teacherName];
      }
      return { ...prev, teachers: updated };
    });
  };

  // 선수 인원 수 변경
  const handleCountChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      playersCount: Math.max(1, Math.min(50, prev.playersCount + delta))
    }));
  };

  const handleQuickCount = (count) => {
    setFormData(prev => ({
      ...prev,
      playersCount: count
    }));
  };

  // 저장 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('대회명을 입력해주세요!');
      return;
    }
    if (!formData.date) {
      alert('대회 날짜를 선택해주세요!');
      return;
    }

    // 최종 인솔교사 목록 구성
    let finalTeachers = [...formData.teachers];
    if (hasCustomTeacher && formData.customTeacher.trim()) {
      finalTeachers.push(formData.customTeacher.trim());
    }

    if (finalTeachers.length === 0) {
      alert('인솔교사를 1명 이상 선택해주세요!');
      return;
    }

    onSave({
      ...formData,
      teachers: finalTeachers,
      leaderTeacher: finalTeachers[0] || '',
      assistantTeacher: finalTeachers.slice(1).join(', '),
      playersCount: Number(formData.playersCount) || 6,
    });
    onClose();
  };

  const quickCounts = [4, 6, 7, 8, 10, 11, 12, 14, 15];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className={`p-4 sm:p-5 ${currentSport.bannerGradient ? `bg-gradient-to-r ${currentSport.bannerGradient}` : 'bg-amber-500'} text-white flex items-center justify-between shadow-xs shrink-0`}>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{currentSport.emoji}</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-jua text-white">
                {editingSchedule ? '학생스포츠클럽 대회 인솔 정보 수정' : '새 대회 인솔 일정 등록'}
              </h2>
              <p className="text-xs text-white/80">
                선생님들과 실시간으로 공유되는 인솔 일정입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* 1. Sport Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              🏆 대회 종목 선택 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SPORTS_LIST.map((sport) => {
                const isSelected = formData.sport === sport.name;
                return (
                  <button
                    type="button"
                    key={sport.id}
                    onClick={() => handleSportSelect(sport.name)}
                    className={`py-2 px-1.5 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300 font-black scale-102'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-200'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{sport.emoji}</span>
                    <span className="text-xs font-bold">{sport.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Teachers Multi-select Buttons */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>🧑‍🏫 인솔교사 선택 (2~4명 다중 선택 가능) <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                선택됨: {formData.teachers.length + (hasCustomTeacher && formData.customTeacher ? 1 : 0)}명
              </span>
            </div>

            {/* Teacher Chips */}
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TEACHERS.map((teacher) => {
                const isCustom = teacher === '기타';
                const isSelected = isCustom ? hasCustomTeacher : formData.teachers.includes(teacher);

                return (
                  <button
                    type="button"
                    key={teacher}
                    onClick={() => handleTeacherToggle(teacher)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 text-emerald-200 stroke-[3]" /> : <span className="text-slate-400">+</span>}
                    <span>{teacher} {isCustom ? '' : '선생님'}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Teacher Input (if '기타' is checked) */}
            {hasCustomTeacher && (
              <div className="pt-2 flex items-center gap-2 animate-fadeIn">
                <input
                  type="text"
                  value={formData.customTeacher}
                  onChange={(e) => setFormData({ ...formData, customTeacher: e.target.value })}
                  placeholder="기타 인솔교사 성함 입력 (예: 홍길동)"
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-400 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 flex-1"
                />
              </div>
            )}
          </div>

          {/* 3. Players Count Simple Selector */}
          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                <span>👥 출전 선수 인원 수 (간단 입력) <span className="text-rose-500">*</span></span>
              </label>
              <span className="text-xs font-bold text-sky-800">
                총 <strong className="text-base text-sky-600">{formData.playersCount}</strong>명
              </span>
            </div>

            {/* Stepper + Number Input */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-xl border border-sky-300 p-1">
                <button
                  type="button"
                  onClick={() => handleCountChange(-1)}
                  className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.playersCount}
                  onChange={(e) => setFormData({ ...formData, playersCount: Number(e.target.value) || 1 })}
                  className="w-16 text-center font-black text-base text-sky-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCountChange(1)}
                  className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Count Chips */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">빠른 선택:</span>
                {quickCounts.map(count => (
                  <button
                    type="button"
                    key={count}
                    onClick={() => handleQuickCount(count)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      formData.playersCount === count
                        ? 'bg-sky-600 text-white border-sky-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    {count}명
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Basic Info (Title, Date, Time, Location) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>대회 일정 및 장소 정보</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                대회명 (세부 경기 내용) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="예: 족구 여초부 C조 예선"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  대회 날짜 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  경기/출발 시간
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="예: 17:00 또는 11:30 출발"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  경기 장소 (목적지) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="예: 나성중학교 체육관"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                />
              </div>
            </div>

            {/* Gathering Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  집결 시간 및 장소
                </label>
                <input
                  type="text"
                  value={formData.gatheringPlace}
                  onChange={(e) => setFormData({ ...formData, gatheringPlace: e.target.value })}
                  placeholder="예: 16:20 소담초 체육관 앞"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  이동 수단
                </label>
                <input
                  type="text"
                  value={formData.transportation}
                  onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                  placeholder="예: 학교 차량 / 버스 / 도보"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 5. Memo / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              비고 및 특이사항 (섭외 현황, 메모)
            </label>
            <input
              type="text"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="예: 6명 예정 (정광섭, 박이슬 섭외 완료)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-200 transition-all cursor-pointer"
            >
              {editingSchedule ? '수정 완료' : '대회 일정 등록'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
