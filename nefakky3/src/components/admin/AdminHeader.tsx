'use client';

import React from 'react';
import { Printer, FileSpreadsheet, Menu } from 'lucide-react';

interface AdminHeaderProps {
  onPrintPDF: () => void;
  onExportCSV: () => void;
  managerName?: string;
  managerRole?: string;
  onToggleMobileSidebar?: () => void;
}

export default function AdminHeader({
  onPrintPDF,
  onExportCSV,
  managerName = 'Fatih Ahmad Zakky',
  managerRole = 'Store Manager',
  onToggleMobileSidebar
}: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#fbf9f5]/85 backdrop-blur-xl border-b border-amber-900/10 z-40 flex items-center justify-between px-4 sm:px-8 print:hidden">
      {/* Mobile Toggle Button & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-[#25160e] hover:bg-stone-200/60 lg:hidden transition-colors"
          aria-label="Toggle Mobile Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-serif font-bold text-lg text-[#25160e] lg:hidden">
          Nefakky Admin
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={onPrintPDF}
          className="p-2 text-[#4f4540] hover:text-[#25160e] hover:bg-stone-100 rounded-full transition-colors relative"
          title="Cetak Laporan PDF"
        >
          <Printer className="w-5 h-5" />
        </button>
        <button 
          onClick={onExportCSV}
          className="p-2 text-[#4f4540] hover:text-[#25160e] hover:bg-stone-100 rounded-full transition-colors relative"
          title="Unduh Laporan Excel / CSV"
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-amber-900/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#1b1c1a] leading-none">{managerName}</p>
            <p className="text-[10px] text-[#4f4540] font-medium mt-0.5">{managerRole}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#25160e] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {managerName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}

