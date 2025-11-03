import { useState } from 'react';
import { Plus, BookOpen, FileText } from 'lucide-react';

export default function KnowledgeManager() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">База знаний</h2>
          <p className="text-gray-600 mt-1">Информация для генерации контента писем</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Добавить знание
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">База знаний пуста</h3>
        <p className="text-gray-600 mb-6">
          Добавьте информацию о спикерах, программе, преимуществах<br />
          для автоматической генерации контента
        </p>
        <div className="flex gap-4 justify-center">
          <div className="bg-purple-50 rounded-lg p-4 text-left">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium">О спикерах</p>
            <p className="text-xs text-gray-600">Биография, экспертиза</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium">Программа</p>
            <p className="text-xs text-gray-600">Темы, расписание</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-left">
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-sm font-medium">Преимущества</p>
            <p className="text-xs text-gray-600">Выгоды участия</p>
          </div>
        </div>
      </div>
    </div>
  );
}
