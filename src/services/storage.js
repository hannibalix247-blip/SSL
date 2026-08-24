import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'sodam_sports_schedules_v2';
const FIREBASE_CONFIG_KEY = 'sodam_sports_firebase_config';

// 소담초등학교 기본 인솔 일정 데이터 (20건)
export const INITIAL_SCHEDULES = [
  { id: "sodam-sheet-01", sport: "족구", title: "족구 여초부 C조 예선", date: "2026-08-21", time: "17:00", location: "나성중학교 체육관", gatheringTime: "16:20", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭", "박이슬"], playersCount: 6, transportation: "학교 차량 / 인솔 이동", supplies: "족구공, 유니폼, 음료수", memo: "6명 예정 (정광섭, 박이슬 섭외 완료)", status: "scheduled" },
  { id: "sodam-sheet-02", sport: "배드민턴", title: "배드민턴 여초부 예선", date: "2026-08-22", time: "11:30 출발 (경기 오후)", location: "세종시민체육관", gatheringTime: "11:30", gatheringPlace: "소담초 정문 집결", teachers: ["임현지", "정광섭"], playersCount: 7, transportation: "학교 버스/인솔", supplies: "라켓, 셔틀콕, 식수", memo: "7~8명 예정 (임현지, 정광섭 섭외 완료)", status: "scheduled" },
  { id: "sodam-sheet-03", sport: "배드민턴", title: "배드민턴 여초부 결선", date: "2026-08-23", time: "07:30 출발", location: "세종시민체육관", gatheringTime: "07:30", gatheringPlace: "소담초 정문 집결", teachers: ["임현지", "정광섭"], playersCount: 7, transportation: "학교 버스/인솔", supplies: "라켓, 셔틀콕, 식수", memo: "7~8명 예정 (임현지, 정광섭 섭외 완료)", status: "scheduled" },
  { id: "sodam-sheet-04", sport: "족구", title: "족구 여초부 본선", date: "2026-08-27", time: "15:30", location: "나성중학교 체육관", gatheringTime: "15:00", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭", "박이슬"], playersCount: 6, transportation: "학교 차량/인솔", supplies: "족구공, 유니폼, 음료수", memo: "6명 예정 (정광섭, 박이슬 섭외 완료)", status: "scheduled" },
  { id: "sodam-sheet-05", sport: "족구", title: "족구 남초 예선", date: "2026-08-28", time: "18:00", location: "나성중학교 체육관", gatheringTime: "17:20", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭", "박이슬"], playersCount: 8, transportation: "학교 차량/인솔", supplies: "족구공, 유니폼, 음료수", memo: "6~8명 예정 (정광섭, 박이슬 섭외 완료)", status: "scheduled" },
  { id: "sodam-sheet-06", sport: "족구", title: "족구 남초 본선", date: "2026-08-30", time: "09:00 - 13:50", location: "나성중학교 체육관", gatheringTime: "08:30", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭", "박이슬"], playersCount: 8, transportation: "학교 차량/인솔", supplies: "족구공, 유니폼, 음료수, 간식", memo: "6~8명 예정 (정광섭, 박이슬 섭외 완료)", status: "scheduled" },
  { id: "sodam-sheet-07", sport: "농구", title: "농구 친선/예선 경기", date: "2026-09-01", time: "18:00", location: "도담중학교 체육관", gatheringTime: "17:15", gatheringPlace: "소담초 1층 로비", teachers: ["한동훈", "정광섭", "박이슬"], playersCount: 11, transportation: "차량 인솔", supplies: "농구공, 유니폼, 음료수", memo: "10~12명 (한동훈, 정광섭, 박이슬 섭외 완료)", status: "scheduled" },
  { id: "sodam-sheet-08", sport: "배구", title: "배구 남초 2조 예선", date: "2026-09-02", time: "16:00~", location: "한솔중학교 체육관", gatheringTime: "15:20", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭", "임현지"], playersCount: 12, transportation: "인솔 이동", supplies: "배구공, 무릎보호대, 음료수", memo: "12명 예정", status: "scheduled" },
  { id: "sodam-sheet-09", sport: "배구", title: "배구 여초 2조 예선", date: "2026-09-03", time: "16:30~", location: "한솔중학교 체육관", gatheringTime: "15:50", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭"], playersCount: 12, transportation: "인솔 이동", supplies: "배구공, 무릎보호대, 음료수", memo: "12명 예정 (전교직원다모임 날)", status: "scheduled" },
  { id: "sodam-sheet-10", sport: "배구", title: "배구 남초 2조 예선 (2차)", date: "2026-09-05", time: "09:00~", location: "한솔중학교 체육관", gatheringTime: "08:20", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭", "김민지"], playersCount: 12, transportation: "인솔 이동", supplies: "배구공, 무릎보호대, 음료수", memo: "12명 예정", status: "scheduled" },
  { id: "sodam-sheet-11", sport: "배구", title: "배구 남초 결선", date: "2026-09-10", time: "16:30~", location: "한솔중학교 체육관", gatheringTime: "15:50", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭", "김민지"], playersCount: 12, transportation: "인솔 이동", supplies: "배구공, 무릎보호대, 음료수", memo: "12명 예정 (어쩌면 결선 진출 가능)", status: "scheduled" },
  { id: "sodam-sheet-12", sport: "배구", title: "배구 여초 2조 예선 (2차)", date: "2026-09-12", time: "09:00~", location: "한솔중학교 체육관", gatheringTime: "08:20", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭"], playersCount: 12, transportation: "인솔 이동", supplies: "배구공, 무릎보호대, 음료수", memo: "12명 예정", status: "scheduled" },
  { id: "sodam-sheet-13", sport: "플라잉디스크", title: "플라잉디스크 남초 토너먼트", date: "2026-09-12", time: "10:00", location: "부강체육공원", gatheringTime: "09:15", gatheringPlace: "소담초 정문 버스 탑승", teachers: ["정광섭"], playersCount: 12, transportation: "버스 이동", supplies: "원반 디스크, 모자, 선크림, 식수", memo: "12명 예정", status: "scheduled" },
  { id: "sodam-sheet-14", sport: "플라잉디스크", title: "플라잉디스크 여초 토너먼트", date: "2026-09-12", time: "13:30", location: "부강체육공원", gatheringTime: "12:45", gatheringPlace: "소담초 정문 버스 탑승", teachers: ["정광섭"], playersCount: 12, transportation: "버스 이동", supplies: "원반 디스크, 모자, 선크림, 식수", memo: "12명 예정", status: "scheduled" },
  { id: "sodam-sheet-15", sport: "배구", title: "배구 여초 결선", date: "2026-09-14", time: "16:30~", location: "한솔중학교 체육관", gatheringTime: "15:50", gatheringPlace: "소담초 체육관 앞", teachers: ["정광섭"], playersCount: 12, transportation: "인솔 이동", supplies: "배구공, 무릎보호대, 음료수", memo: "12명 예정 (확률 제로 수준 낮음)", status: "scheduled" },
  { id: "sodam-sheet-16", sport: "티볼", title: "티볼 예선 경기", date: "2026-09-16", time: "15:30 출발", location: "해밀 한빛체육공원 축구장", gatheringTime: "15:30", gatheringPlace: "소담초 정문 버스 탑승", teachers: ["이재환", "김민지"], playersCount: 14, transportation: "버스 이동", supplies: "배트, 티볼 글러브, 헬멧, 음료수", memo: "13명~15명 예상", status: "scheduled" },
  { id: "sodam-sheet-17", sport: "농구", title: "농구 본선 경기", date: "2026-09-19", time: "10:00", location: "도담중학교 체육관", gatheringTime: "09:15", gatheringPlace: "소담초 1층 로비", teachers: ["한동훈", "임현지", "이재환"], playersCount: 11, transportation: "차량 인솔", supplies: "농구공, 유니폼, 스포츠음료", memo: "10~12명", status: "scheduled" },
  { id: "sodam-sheet-18", sport: "플라잉디스크", title: "플라잉디스크 남초 결승", date: "2026-09-19", time: "11:00", location: "부강체육공원", gatheringTime: "10:15", gatheringPlace: "소담초 정문 집결", teachers: ["정광섭"], playersCount: 12, transportation: "버스 이동", supplies: "원반 디스크, 모자, 식수", memo: "12명 예정", status: "scheduled" },
  { id: "sodam-sheet-19", sport: "플라잉디스크", title: "플라잉디스크 여초 결승", date: "2026-09-19", time: "11:40", location: "부강체육공원", gatheringTime: "10:50", gatheringPlace: "소담초 정문 집결", teachers: ["정광섭"], playersCount: 12, transportation: "버스 이동", supplies: "원반 디스크, 모자, 식수", memo: "12명 예정 (확률 낮음)", status: "scheduled" },
  { id: "sodam-sheet-20", sport: "티볼", title: "티볼 본선 경기", date: "2026-09-30", time: "15:30 출발", location: "해밀 한빛체육공원 축구장", gatheringTime: "15:30", gatheringPlace: "소담초 정문 버스 탑승", teachers: ["이재환"], playersCount: 14, transportation: "버스 이동", supplies: "배트, 티볼 글러브, 헬멧, 음료수", memo: "13명~15명 예상", status: "scheduled" }
];

export const getFirebaseConfig = () => {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setFirebaseConfig = (config) => {
  if (config) {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  }
};

let firestoreDb = null;

export const initFirestore = () => {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    firestoreDb = null;
    return null;
  }
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    firestoreDb = getFirestore(app);
    return firestoreDb;
  } catch (e) {
    firestoreDb = null;
    return null;
  }
};

export const getLocalSchedules = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  saveLocalSchedules(INITIAL_SCHEDULES);
  return INITIAL_SCHEDULES;
};

export const saveLocalSchedules = (schedules) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedules));
    window.dispatchEvent(new CustomEvent('local-schedules-updated', { detail: schedules }));
  } catch (e) {}
};

export const subscribeToSchedules = (callback) => {
  const db = initFirestore();
  const localData = getLocalSchedules();
  callback(localData, Boolean(db));

  if (db) {
    const schedulesRef = collection(db, 'schedules');
    const unsubscribeFirebase = onSnapshot(
      schedulesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudData = [];
          snapshot.forEach((docSnap) => {
            cloudData.push({ id: docSnap.id, ...docSnap.data() });
          });
          cloudData.sort((a, b) => new Date(a.date) - new Date(b.date));
          saveLocalSchedules(cloudData);
          callback(cloudData, true);
        } else {
          seedInitialFirestore(db).then((data) => callback(data, true));
        }
      },
      (error) => {
        callback(getLocalSchedules(), false);
      }
    );
    return () => unsubscribeFirebase();
  }

  const handleLocalUpdate = (e) => callback(e.detail || getLocalSchedules(), false);
  window.addEventListener('local-schedules-updated', handleLocalUpdate);
  return () => window.removeEventListener('local-schedules-updated', handleLocalUpdate);
};

const seedInitialFirestore = async (db) => {
  try {
    const batch = writeBatch(db);
    INITIAL_SCHEDULES.forEach((item) => {
      const docRef = doc(db, 'schedules', item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
    saveLocalSchedules(INITIAL_SCHEDULES);
    return INITIAL_SCHEDULES;
  } catch (e) {
    return INITIAL_SCHEDULES;
  }
};

export const saveSchedule = async (schedule) => {
  const now = new Date().toISOString();
  const scheduleData = {
    ...schedule,
    id: schedule.id || `sodam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    teachers: schedule.teachers || (schedule.leaderTeacher ? [schedule.leaderTeacher, schedule.assistantTeacher].filter(Boolean) : []),
    playersCount: Number(schedule.playersCount) || 6,
    updatedAt: now,
    createdAt: schedule.createdAt || now
  };

  const current = getLocalSchedules();
  const index = current.findIndex((item) => item.id === scheduleData.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = scheduleData;
  } else {
    updated = [scheduleData, ...current];
  }
  saveLocalSchedules(updated);

  const db = initFirestore();
  if (db) {
    try {
      const docRef = doc(db, 'schedules', scheduleData.id);
      await setDoc(docRef, scheduleData, { merge: true });
    } catch (e) {}
  }
  return scheduleData;
};

export const deleteSchedule = async (id) => {
  const current = getLocalSchedules();
  const updated = current.filter((item) => item.id !== id);
  saveLocalSchedules(updated);

  const db = initFirestore();
  if (db) {
    try {
      const docRef = doc(db, 'schedules', id);
      await deleteDoc(docRef);
    } catch (e) {}
  }
};

export const resetToDefaultData = async () => {
  saveLocalSchedules(INITIAL_SCHEDULES);
  const db = initFirestore();
  if (db) {
    try { await seedInitialFirestore(db); } catch (e) {}
  }
  return INITIAL_SCHEDULES;
};
