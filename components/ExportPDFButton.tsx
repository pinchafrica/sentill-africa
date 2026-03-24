"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportPDFButton({ targetId, filename }: { targetId: string, filename: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    
    setIsExporting(true);
    try {
      // 1. Snapshot the DOM
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#f8fafc",
        windowWidth: 1200,
        ignoreElements: (el) => el.tagName === "BUTTON" && ((el as HTMLElement).innerText.includes("Export") || (el as HTMLElement).innerText.includes("Upgrade"))
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all ${isExporting ? "opacity-75 cursor-not-allowed" : ""}`}
    >
      {isExporting ? (
        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {isExporting ? "Compiling Report..." : "Export PDF Report"}
    </button>
  );
}
