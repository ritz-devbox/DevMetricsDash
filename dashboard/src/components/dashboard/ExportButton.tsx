import { useState } from 'react';

export default function ExportButton() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const root = document.getElementById('root');
      if (!root) return;

      const canvas = await html2canvas(root, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#0d1117',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `devmetrics-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(document.documentElement.outerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-700/30 border border-dark-600/30 text-dark-300 hover:text-dark-100 hover:border-accent-purple/30 transition-all disabled:opacity-50"
    >
      {exporting ? (
        <span className="h-3 w-3 border-2 border-dark-400 border-t-accent-purple rounded-full animate-spin" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      <span>{exporting ? 'Exporting...' : 'Export PNG'}</span>
    </button>
  );
}
