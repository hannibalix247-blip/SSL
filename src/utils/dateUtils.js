export const calculateDDay = (dateString, timeString = '00:00') => {
  if (!dateString) return { text: '-', isPast: false, isToday: false, diffDays: 0 };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return { text: 'D-DAY 오늘!', isPast: false, isToday: true, diffDays: 0, badgeClass: 'bg-rose-500 text-white animate-pulse' };
  } else if (diffDays > 0) {
    let badgeClass = 'bg-emerald-500 text-white';
    if (diffDays <= 3) {
      badgeClass = 'bg-amber-500 text-white font-bold animate-bounce';
    } else if (diffDays <= 7) {
      badgeClass = 'bg-indigo-500 text-white';
    }
    return { text: `D-${diffDays}`, isPast: false, isToday: false, diffDays, badgeClass };
  } else {
    return { text: `대회 종료 (D+${Math.abs(diffDays)})`, isPast: true, isToday: false, diffDays, badgeClass: 'bg-slate-300 text-slate-700' };
  }
};

export const formatKoreanDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = days[date.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
};
