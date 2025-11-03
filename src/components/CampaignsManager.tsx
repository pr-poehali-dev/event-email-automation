import { useState } from 'react';
import { Plus, Send, Zap } from 'lucide-react';

export default function CampaignsManager() {
  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Кампании</h2>
          <p className="text-slate-600 mt-2 text-lg">Контент-планы и генерация писем</p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-200 font-semibold shadow-lg hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Новая кампания
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-16 text-center">
        <Send className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет кампаний</h3>
        <p className="text-gray-600 mb-6">
          Создайте кампанию для автоматической генерации писем
        </p>
        
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-10">
          <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl p-8 border border-violet-200 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-3xl">📧</span>
            </div>
            <p className="font-bold text-violet-900 text-lg">Анонс</p>
            <p className="text-sm text-violet-700 mt-2">Информирование о событии</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-8 border border-emerald-200 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-3xl">💰</span>
            </div>
            <p className="font-bold text-emerald-900 text-lg">Продажа</p>
            <p className="text-sm text-emerald-700 mt-2">Прямая продажа билетов</p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-red-100 rounded-2xl p-8 border border-rose-200 hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <span className="text-3xl">⏰</span>
            </div>
            <p className="font-bold text-rose-900 text-lg">Дедлайн</p>
            <p className="text-sm text-rose-700 mt-2">Срочность предложения</p>
          </div>
        </div>

        <div className="mt-10 inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-8 py-4 shadow-lg">
          <Zap className="w-6 h-6 text-amber-600" />
          <p className="text-sm text-amber-900">
            <strong className="font-bold">ИИ генерирует контент</strong> по рецептам каждого типа письма
          </p>
        </div>
      </div>
    </div>
  );
}