import { useState } from 'react';
import { Plus, Send, Zap } from 'lucide-react';

export default function CampaignsManager() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Кампании</h2>
          <p className="text-gray-600 mt-1">Контент-планы и генерация писем</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Новая кампания
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Send className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет кампаний</h3>
        <p className="text-gray-600 mb-6">
          Создайте кампанию для автоматической генерации писем
        </p>
        
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl">📧</span>
            </div>
            <p className="font-medium text-purple-900">Анонс</p>
            <p className="text-sm text-purple-700 mt-1">Информирование о событии</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl">💰</span>
            </div>
            <p className="font-medium text-green-900">Продажа</p>
            <p className="text-sm text-green-700 mt-1">Прямая продажа билетов</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl">⏰</span>
            </div>
            <p className="font-medium text-red-900">Дедлайн</p>
            <p className="text-sm text-red-700 mt-1">Срочность предложения</p>
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-3">
          <Zap className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>ИИ генерирует контент</strong> по рецептам каждого типа письма
          </p>
        </div>
      </div>
    </div>
  );
}
