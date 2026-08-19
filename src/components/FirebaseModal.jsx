import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Share2, 
  Check, 
  Copy, 
  HelpCircle, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  ShieldCheck,
  ExternalLink 
} from 'lucide-react';
import { 
  getStoredFirebaseConfig, 
  saveFirebaseConfig, 
  initFirebase 
} from '../services/firebase';

export function FirebaseModal({ 
  isOpen, 
  onClose, 
  isCloudSync, 
  onResetData, 
  schedules, 
  onImportData 
}) {
  const [configText, setConfigText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = getStoredFirebaseConfig();
    if (saved) {
      setConfigText(JSON.stringify(saved, null, 2));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    try {
      if (!configText.trim()) {
        saveFirebaseConfig(null);
        window.location.reload();
        return;
      }
      const parsed = JSON.parse(configText);
      saveFirebaseConfig(parsed);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (e) {
      alert('올바른 JSON 형식의 Firebase 설정 객체를 입력해주세요.');
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // JSON 파일로 전체 백업 다운로드
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schedules, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `소담초_스포츠클럽_인솔데이터_백업_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSON 파일 불러오기
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportData(parsed);
          alert('데이터를 성공적으로 복원했습니다!');
          onClose();
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Cloud className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="text-lg font-bold font-jua">교사 간 실시간 공유 & 데이터 보존 설정</h3>
              <p className="text-xs text-emerald-100">여러 교사가 동시에 접속하여 수정하고 영구 보존할 수 있습니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Status Alert */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isCloudSync 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {isCloudSync ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">실시간 클라우드 동기화가 활성화되어 있습니다.</div>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    선생님들이 이 웹페이지 링크로 접속하면 다른 교사가 입력하거나 수정한 내용이 <strong>화면에 실시간으로 즉시 반영</strong>됩니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CloudOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">현재 로컬 브라우저 저장 모드로 동작 중입니다.</div>
                  <p className="text-xs text-amber-700 mt-0.5">
                    현재 기기에서는 웹페이지를 닫거나 컴퓨터를 껐다 켜도 데이터가 영구 보존됩니다. 여러 교사가 <strong>실시간으로 동시 동기화</strong>하려면 아래의 무료 Firebase 키를 입력하세요.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Web Share Link */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              🔗 소담초 교사용 웹페이지 접속 링크
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono text-slate-600 select-all"
              />
              <button
                onClick={handleCopyShareLink}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? '복사됨!' : '링크 복사'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              이 주소를 다른 선생님들께 메신저나 문자로 공유하시면 됩니다.
            </p>
          </div>

          {/* Backup & Restore */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Download className="w-4 h-4 text-slate-600" />
                <span>데이터 백업 (JSON 파일 다운로드)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                현재 등록된 모든 대회 및 선수 데이터를 파일로 보관합니다.
              </p>
              <button
                onClick={handleExportJson}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                📥 백업 파일 저장하기
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>백업 파일 복원</span>
              </div>
              <p className="text-[11px] text-slate-500">
                이전에 저장한 JSON 백업 파일을 불러옵니다.
              </p>
              <label className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer text-center block">
                📤 백업 파일 업로드
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Firebase Configuration Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Firebase Cloud Firestore 설정 (무료 실시간 클라우드 DB)</span>
              </label>
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                <span>Firebase 콘솔</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <textarea
              rows={4}
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "sodam-sports.firebaseapp.com",
  "projectId": "sodam-sports",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}`}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                입력 후 저장하면 페이지가 새로고침되며 실시간 동기화가 시작됩니다.
              </span>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                {savedSuccess ? '저장 완료!' : 'Firebase 설정 적용'}
              </button>
            </div>
          </div>

          {/* Reset to Sample Data */}
          <div className="pt-2 border-t flex items-center justify-between text-xs">
            <span className="text-slate-400">초기 소담초 샘플 데이터로 되돌리시겠습니까?</span>
            <button
              onClick={() => {
                if (confirm('모든 데이터가 소담초등학교 기본 샘플 데이터로 초기화됩니다. 계속하시겠습니까?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer"
            >
              샘플 데이터로 초기화
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
