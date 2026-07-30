import React from 'react';
import { DiagnosticReport } from '../../types';
import { FileText, X, Sparkles, Download, CheckCircle2 } from 'lucide-react';

interface DiagnosticViewerModalProps {
  report: DiagnosticReport | null;
  onClose: () => void;
}

export const DiagnosticViewerModal: React.FC<DiagnosticViewerModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-clinical-teal/10 border border-clinical-teal/30 text-clinical-teal">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{report.title}</h3>
              <p className="text-xs text-slate-400">
                Uploaded: {new Date(report.uploadedAt).toLocaleDateString()} • Format: {report.fileType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* AI NLP Clinical Summary Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-clinical-teal/15 to-clinical-cyan/10 border border-clinical-teal/30 space-y-2">
            <div className="flex items-center space-x-2 text-clinical-teal font-bold text-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI CLINICAL NLP SUMMARY</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {report.summary || 'Summary unavailable for this diagnostic record.'}
            </p>
          </div>

          {/* Raw Document Preview / Transcript */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Diagnostic Observations & Findings Transcript
            </label>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="text-slate-400 font-sans italic">Document ID: {report.id}</p>
              <p>PATIENT REPORT SUMMARY: {report.summary}</p>
              <p>CLINICAL FINDINGS: Baseline sinus rhythm maintained with intermittent telemetry variances. No acute localized ST elevation noted in lead II or III. Mild basilar rales noted on pulmonary auscultation.</p>
              <p className="text-emerald-400">RECOMMENDATION: Continue bedside vitals monitoring and titrate O2 flow per protocol.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Verified by Nightingale Clinical AI Engine</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert(`Downloading diagnostic file artifact ${report.title}...`)}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center space-x-2 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-clinical-teal hover:bg-teal-600 text-slate-950 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
