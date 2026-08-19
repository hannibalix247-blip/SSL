import { INITIAL_SCHEDULES } from './sampleData';

const LOCAL_STORAGE_KEY = 'sodam_sports_schedules_v2';

// 백엔드 API URL 및 WebSocket URL 동적 계산
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:4000';
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  // 개발 모드(포트 5173)일 때는 4000 포트의 백엔드로 연결, 프로덕션에서는 현재 포트 사용
  const port = window.location.port === '5173' ? '4000' : window.location.port;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

const getWsUrl = () => {
  if (typeof window === 'undefined') return 'ws://localhost:4000';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  const port = window.location.port === '5173' ? '4000' : window.location.port;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

export const getLocalSchedules = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read from localStorage', e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SCHEDULES));
  return INITIAL_SCHEDULES;
};

export const setLocalSchedules = (schedules) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedules));
    window.dispatchEvent(new CustomEvent('local-schedules-updated', { detail: schedules }));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

/**
 * 실시간 일정 구독 (내장 실시간 WebSocket 서버 + LocalStorage Fallback)
 */
export const subscribeToSchedules = (onDataCallback) => {
  let ws = null;
  let isConnected = false;

  // 1. 초기 로컬 캐시 즉시 전달 (빠른 첫 화면 렌더링)
  onDataCallback(getLocalSchedules(), false);

  // 2. 백엔드 REST API 초기 데이터 가져오기 시도
  const apiBase = getApiBaseUrl();
  fetch(`${apiBase}/api/schedules`)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setLocalSchedules(data);
        onDataCallback(data, true);
      }
    })
    .catch((err) => {
      console.warn('Backend API not responding, running in local storage mode:', err);
    });

  // 3. WebSocket 실시간 연결 수립
  const connectWs = () => {
    try {
      const wsUrl = getWsUrl();
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnected = true;
        console.log('⚡ 실시간 동기화 서버 연결 성공!');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'SCHEDULES_UPDATE' && Array.isArray(msg.data)) {
            setLocalSchedules(msg.data);
            onDataCallback(msg.data, true);
          }
        } catch (e) {
          console.error('WS message error:', e);
        }
      };

      ws.onclose = () => {
        isConnected = false;
        // 3초 후 재연결 시도
        setTimeout(connectWs, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WS error, fallback to local storage:', err);
        ws.close();
      };
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
    }
  };

  connectWs();

  // Local storage change listener
  const handleLocalUpdate = (e) => {
    onDataCallback(e.detail || getLocalSchedules(), isConnected);
  };
  window.addEventListener('local-schedules-updated', handleLocalUpdate);

  return () => {
    if (ws) {
      ws.close();
    }
    window.removeEventListener('local-schedules-updated', handleLocalUpdate);
  };
};

/**
 * 일정 추가 또는 수정
 */
export const saveScheduleItem = async (schedule) => {
  const now = new Date().toISOString();
  const itemToSave = {
    ...schedule,
    id: schedule.id || `sodam-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    teachers: schedule.teachers || (schedule.leaderTeacher ? [schedule.leaderTeacher, schedule.assistantTeacher].filter(Boolean) : []),
    playersCount: Number(schedule.playersCount) || 6,
    updatedAt: now,
    createdAt: schedule.createdAt || now,
  };

  // 1. 로컬 저장소 즉시 업데이트
  const currentList = getLocalSchedules();
  const existingIndex = currentList.findIndex((item) => item.id === itemToSave.id);
  let updatedList;
  if (existingIndex >= 0) {
    updatedList = [...currentList];
    updatedList[existingIndex] = itemToSave;
  } else {
    updatedList = [itemToSave, ...currentList];
  }
  setLocalSchedules(updatedList);

  // 2. 백엔드 서버에 전송 (모든 기기에 실시간 브로드캐스트)
  try {
    const apiBase = getApiBaseUrl();
    await fetch(`${apiBase}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemToSave),
    });
  } catch (err) {
    console.warn('Failed to sync with backend server, saved locally:', err);
  }

  return itemToSave;
};

/**
 * 일정 삭제
 */
export const deleteScheduleItem = async (id) => {
  const currentList = getLocalSchedules();
  const updatedList = currentList.filter((item) => item.id !== id);
  setLocalSchedules(updatedList);

  try {
    const apiBase = getApiBaseUrl();
    await fetch(`${apiBase}/api/schedules/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to sync delete with backend server:', err);
  }
};

/**
 * 샘플 데이터로 초기화
 */
export const resetToDefaultData = async () => {
  setLocalSchedules(INITIAL_SCHEDULES);
  try {
    const apiBase = getApiBaseUrl();
    await fetch(`${apiBase}/api/schedules/reset`, { method: 'POST' });
  } catch (err) {
    console.warn('Reset backend failed:', err);
  }
  return INITIAL_SCHEDULES;
};

/**
 * CSV 파일 내보내기
 */
export const exportToCsvFile = (schedules) => {
  const headers = ['대회종목', '대회명', '날짜', '시간', '목적지(장소)', '집결정보', '인솔교사', '출전인원', '이동수단', '비고/결과'];
  
  const rows = schedules.map(s => {
    const teachersList = (s.teachers && s.teachers.length > 0) ? s.teachers.join(', ') : (s.leaderTeacher || '');
    return [
      `"${s.sport || ''}"`,
      `"${(s.title || '').replace(/"/g, '""')}"`,
      `"${s.date || ''}"`,
      `"${s.time || ''}"`,
      `"${(s.location || '').replace(/"/g, '""')}"`,
      `"${(s.gatheringPlace || '').replace(/"/g, '""')}"`,
      `"${teachersList}"`,
      `"${s.playersCount || 0}명"`,
      `"${(s.transportation || '').replace(/"/g, '""')}"`,
      `"${(s.memo || s.result || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `소담초_학생스포츠클럽_인솔현황_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
