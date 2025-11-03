import { useState } from 'react';
import { Plus, FileText, Upload, Sparkles } from 'lucide-react';

export default function TemplatesManager() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Библиотека шаблонов</h2>
          <p className="text-gray-600 mt-1">HTML-шаблоны писем с автодетекцией блоков</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          <Upload className="w-5 h-5" />
          Загрузить шаблон
        </button>
      </div>

      {showUpload && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Умная загрузка HTML
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-500 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
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
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors"
            >
              Выбрать файл
            </label>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет шаблонов</h3>
        <p className="text-gray-600 mb-6">
          Загрузите HTML-шаблон письма.<br />
          ИИ автоматически найдёт все блоки и создаст переменные.
        </p>
        <div className="inline-block bg-purple-50 rounded-lg p-4 text-left max-w-md">
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
