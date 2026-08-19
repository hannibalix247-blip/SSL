import React from 'react';
import { Plus, Printer, Download, Cloud, Share2, Sparkles, RefreshCw } from 'lucide-react';

export function Navbar({
  isCloudSync,
  onOpenNewModal,
  onOpenPrintModal,
  onExportCsv,
  onOpenFirebaseModal,
  onResetData,
  schedulesCount
}) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '소담초 학생스포츠클럽 인솔 관리',
        text: '소담초등학교 학생스포츠클럽 대회 선수 인솔 현황 웹페이지입니다.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('접속 링크가 복사되었습니다! 선생님들께 메신저나 문자로 전달하세요.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & School Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center shadow-md shadow-amber-200 text-xl sm:text-2xl transform active:scale-95 transition-transform shrink-0">
              🏃‍♂️
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="bg-amber-100 text-amber-900 text-[10px] sm:text-xs font-bold px-2 py-0.2 rounded-full border border-amber-200">
                  소담초
                </span>
                <span className="inline-flex items-center text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  {isCloudSync ? '실시간 동기화' : '실시간 연결중'}
                </span>
              </div>
              <h1 className="text-base sm:text-2xl font-bold font-jua text-slate-800 tracking-wide mt-0.5 flex items-center gap-1">
                <span>학생스포츠클럽 인솔</span>
                <span className="text-amber-500 text-sm sm:text-lg">✨</span>
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Share Link Button */}
            <button
              onClick={handleShare}
              title="링크 공유하기"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline">링크 공유</span>
            </button>

            {/* Print Modal */}
            <button
              onClick={onOpenPrintModal}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title="인솔 계획서 인쇄 및 PDF 저장"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">인쇄</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={onExportCsv}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title="엑셀(CSV) 다운로드"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">엑셀</span>
            </button>

            {/* Add Schedule Button */}
            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-200 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">일정 등록</span>
              <span className="xs:hidden">등록</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
