import { useState } from 'react';
import { Plus, FileText, Upload, Sparkles } from 'lucide-react';

export default function TemplatesManager() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Библиотека шаблонов</h2>
          <p className="text-slate-600 mt-2 text-lg">HTML-шаблоны писем с автодетекцией блоков</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-semibold shadow-lg hover:scale-105"
        >
          <Upload className="w-5 h-5" />
          Загрузить шаблон
        </button>
      </div>

      {showUpload && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 mb-8 animate-fade-in">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-900">
            <Sparkles className="w-6 h-6 text-violet-600" />
            Умная загрузка HTML
          </h3>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center hover:border-violet-500 hover:bg-violet-50/30 transition-all cursor-pointer group">
            <Upload className="w-16 h-16 mx-auto mb-6 text-slate-400 group-hover:text-violet-500 transition-colors" />
            <p className="text-gray-700 font-medium mb-2">
              Перетащите HTML файл или нажмите для выбора
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ИИ автоматически определит блоки: заголовки, CTA, спикеров, программу
            </p>
            <input
              type="file"
              accept=".html,.htm"
              className="hidden"
              id="html-upload"
            />
            <label
              htmlFor="html-upload"
              className="inline-block px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl cursor-pointer hover:shadow-lg hover:shadow-violet-500/30 transition-all font-semibold hover:scale-105"
            >
              Выбрать файл
            </label>
          </div>
        </div>
      )}

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-16 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет шаблонов</h3>
        <p className="text-gray-600 mb-6">
          Загрузите HTML-шаблон письма.<br />
          ИИ автоматически найдёт все блоки и создаст переменные.
        </p>
        <div className="inline-block bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 text-left max-w-md border border-violet-100 shadow-lg">
          <p className="text-sm font-medium text-purple-900 mb-2">🎯 Что ИИ находит автоматически:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Preheader и заголовки</li>
            <li>✓ CTA кнопки и ссылки</li>
            <li>✓ Блоки спикеров и программы</li>
            <li>✓ Списки преимуществ</li>
            <li>✓ Дедлайны и сроки</li>
          </ul>
        </div>
      </div>
    </div>
  );
}