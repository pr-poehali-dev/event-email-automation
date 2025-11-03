import { useState } from 'react';
import { Calendar, BookOpen, FileText, Send, BarChart3, Layers } from 'lucide-react';
import EventsManager from '../components/EventsManager';
import KnowledgeManager from '../components/KnowledgeManager';
import TemplatesManager from '../components/TemplatesManager';
import CampaignsManager from '../components/CampaignsManager';

type View = 'events' | 'knowledge' | 'templates' | 'campaigns' | 'analytics';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('events');

  const menuItems = [
    { id: 'events' as View, label: 'События', icon: Calendar },
    { id: 'knowledge' as View, label: 'База знаний', icon: BookOpen },
    { id: 'templates' as View, label: 'Шаблоны', icon: FileText },
    { id: 'campaigns' as View, label: 'Кампании', icon: Send },
    { id: 'analytics' as View, label: 'Аналитика', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="flex">
        <aside className="w-72 min-h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-xl">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  EmailGen AI
                </h1>
                <p className="text-xs text-slate-500 font-medium">Платформа для email-рассылок</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 scale-[1.02]'
                      : 'text-slate-700 hover:bg-slate-100/70 hover:scale-[1.01]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-sm' : ''}`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-10 max-w-7xl">
          {currentView === 'events' && <EventsManager />}
          {currentView === 'knowledge' && <KnowledgeManager />}
          {currentView === 'templates' && <TemplatesManager />}
          {currentView === 'campaigns' && <CampaignsManager />}
          {currentView === 'analytics' && (
            <div className="text-center py-20 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Аналитика появится после запуска первых кампаний</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}