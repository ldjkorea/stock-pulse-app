import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { SourceDocument } from '../../core/types/models';
import { MOCK_SOURCE_DOCS } from '../../mock/mockScenarios';

interface SourcesBoxProps {
  sourceDocIds: string[];
}

export const SourcesBox: React.FC<SourcesBoxProps> = ({ sourceDocIds }) => {
  const documents: SourceDocument[] = sourceDocIds
    .map((id) => MOCK_SOURCE_DOCS[id])
    .filter(Boolean);

  if (documents.length === 0) return null;

  return (
    <section className="mb-6 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            검증된 출처 문서
          </h2>
        </div>
        <span className="text-[10px] text-slate-400">공시 및 공식 발표 기준</span>
      </div>

      <div className="space-y-2.5">
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-100 dark:border-slate-800 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  {doc.publisher} • {doc.published_at}
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </h3>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-normal bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl">
              "{doc.snippet_ko}"
            </p>
          </a>
        ))}
      </div>
    </section>
  );
};
