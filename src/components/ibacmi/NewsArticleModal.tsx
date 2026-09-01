import React from 'react';
import { NewsArticle } from '../../data/ibacmiData';
import { X, Calendar, User, Clock, Share2, ArrowLeft } from 'lucide-react';

interface NewsArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({
  article,
  onClose,
}) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-6">
        {/* Article Image Banner */}
        <div className="relative h-64 sm:h-72 bg-slate-950 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            aria-label="Close article"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 inline-block mb-2">
              {article.category}
            </span>
            <h2 className="text-lg sm:text-2xl font-black font-serif tracking-tight leading-snug">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              {article.author}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {article.readTime}
          </span>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[55vh] overflow-y-auto">
          <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed border-l-4 border-amber-500 pl-4 py-1 bg-amber-50/50 rounded-r-lg">
            {article.summary}
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {article.content}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Announcements</span>
          </button>
        </div>
      </div>
    </div>
  );
};
