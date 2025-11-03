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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  EmailGen
                </h1>
                <p className="text-xs text-gray-500">AI Email Platform</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
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
