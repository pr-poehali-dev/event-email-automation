import { useState } from 'react';
import { Plus, BookOpen, FileText } from 'lucide-react';

export default function KnowledgeManager() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">База знаний</h2>
          <p className="text-slate-600 mt-2 text-lg">Информация для генерации контента писем</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-semibold shadow-lg hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Добавить знание
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-16 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">База знаний пуста</h3>
        <p className="text-gray-600 mb-6">
          Добавьте информацию о спикерах, программе, преимуществах<br />
          для автоматической генерации контента
        </p>
        <div className="flex gap-6 justify-center">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 text-left border border-violet-100 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
            <FileText className="w-10 h-10 text-violet-600 mb-3" />
            <p className="text-sm font-semibold text-slate-900">О спикерах</p>
            <p className="text-xs text-slate-600 mt-1">Биография, экспертиза</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-left border border-blue-100 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
            <FileText className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-900">Программа</p>
            <p className="text-xs text-slate-600 mt-1">Темы, расписание</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 text-left border border-emerald-100 hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
            <FileText className="w-10 h-10 text-emerald-600 mb-3" />
            <p className="text-sm font-semibold text-slate-900">Преимущества</p>
            <p className="text-xs text-slate-600 mt-1">Выгоды участия</p>
          </div>
        </div>
      </div>
    </div>
  );
}