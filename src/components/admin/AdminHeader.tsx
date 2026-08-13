'use client';

import React from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';

interface AdminHeaderProps {
  onPrintPDF: () => void;
  onExportCSV: () => void;
  managerName?: string;
  managerRole?: string;
}

export default function AdminHeader({
  onPrintPDF,
  onExportCSV,
  managerName = 'Fatih Ahmad Zakky',
  managerRole = 'Store Manager'
}: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[#fbf9f5]/85 backdrop-blur-xl border-b border-amber-900/10 z-40 flex items-center justify-end px-8 print:hidden">
      <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-3 pl-4 border-l border-amber-900/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#1b1c1a] leading-none">{managerName}</p>
            <p className="text-[10px] text-[#4f4540] font-medium mt-0.5">{managerRole}</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-[#25160e] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {managerName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
