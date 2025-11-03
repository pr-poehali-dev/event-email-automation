import { useState } from 'react';
import { Calendar, BookOpen, FileText, Send, BarChart3, Database } from 'lucide-react';
import EventsManager from '../components/EventsManager';
import KnowledgeManager from '../components/KnowledgeManager';
import TemplatesManager from '../components/TemplatesManager';
import CampaignsManager from '../components/CampaignsManager';
import EventManager from '../components/EventManager';
import RAGManager from '../components/RAGManager';

type View = 'events' | 'knowledge' | 'templates' | 'campaigns' | 'analytics' | 'kb-events' | 'rag';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('events');

  const menuItems = [
    { id: 'events' as View, label: 'События', icon: Calendar, color: '#8B5CF6' },
    { id: 'kb-events' as View, label: 'Мероприятия KB', icon: Calendar, color: '#10B981' },
    { id: 'knowledge' as View, label: 'База знаний', icon: BookOpen, color: '#06B6D4' },
    { id: 'rag' as View, label: 'RAG Поиск', icon: Database, color: '#8B5CF6' },
    { id: 'templates' as View, label: 'Шаблоны', icon: FileText, color: '#F59E0B' },
    { id: 'campaigns' as View, label: 'Кампании', icon: Send, color: '#10B981' },
    { id: 'analytics' as View, label: 'Аналитика', icon: BarChart3, color: '#EF4444' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ display: 'flex' }}>
        <aside style={{ 
          width: '280px', 
          minHeight: '100vh', 
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(139, 92, 246, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ 
            padding: '2rem', 
            borderBottom: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                position: 'relative',
                width: '56px',
                height: '56px'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  filter: 'blur(8px)',
                  opacity: 0.6
                }}></div>
                <div style={{
                  position: 'relative',
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.4)'
                }}>
                  <Send style={{ width: '28px', height: '28px', color: 'white' }} />
                </div>
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  EmailGen AI
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                  Платформа для email-рассылок
                </p>
              </div>
            </div>
          </div>

          <nav style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive 
                      ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
                      : 'transparent',
                    color: isActive ? 'white' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    boxShadow: isActive ? `0 10px 25px -5px ${item.color}40` : 'none',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon style={{ width: '20px', height: '20px' }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '3rem', maxWidth: '1400px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            minHeight: '85vh'
          }}>
            {currentView === 'events' && <EventsManager />}
            {currentView === 'kb-events' && <EventManager />}
            {currentView === 'knowledge' && <KnowledgeManager />}
            {currentView === 'rag' && <RAGManager />}
            {currentView === 'templates' && <TemplatesManager />}
            {currentView === 'campaigns' && <CampaignsManager />}
            {currentView === 'analytics' && (
              <div style={{ textAlign: 'center', paddingTop: '5rem', color: '#64748b' }}>
                <BarChart3 style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.125rem' }}>Аналитика появится после запуска первых кампаний</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}