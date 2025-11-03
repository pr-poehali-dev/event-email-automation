import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Event {
  id?: number;
  event_id: string;
  name: string;
  site: string;
  landing: string;
  dates: any;
  location: string;
  venue: string;
  streams: any;
  contacts: any;
}

export default function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5d528b9a-f814-4e0a-9250-d3a7bc40acb6');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
          Управление мероприятиями
        </h1>
        <button
          onClick={() => {
            setSelectedEvent({
              event_id: '',
              name: '',
              site: '',
              landing: '',
              dates: { start: '', end: '' },
              location: '',
              venue: '',
              streams: [],
              contacts: {}
            });
            setShowEditor(true);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Icon name="Plus" size={18} />
          Создать мероприятие
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                  {event.name}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>ID: {event.event_id}</p>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                background: '#dcfce7',
                color: '#166534',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                Активно
              </span>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Icon name="MapPin" size={16} />
                {event.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Icon name="Calendar" size={16} />
                {typeof event.dates === 'string' ? JSON.parse(event.dates).start : event.dates.start}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="Link" size={16} />
                <a href={event.landing} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
                  {event.landing}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setSelectedEvent(event);
                  setShowEditor(true);
                }}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon name="Settings" size={16} />
                Настройки
              </button>
              <button
                onClick={() => {
                  setSelectedEvent(event);
                  setShowKnowledgeBase(true);
                }}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon name="Database" size={16} />
                База знаний
              </button>
            </div>
          </div>
        ))}
      </div>

      {showEditor && selectedEvent && (
        <EventEditorModal 
          event={selectedEvent}
          onClose={() => {
            setShowEditor(false);
            setSelectedEvent(null);
            loadEvents();
          }}
        />
      )}

      {showKnowledgeBase && selectedEvent && (
        <KnowledgeBaseModal 
          event={selectedEvent}
          onClose={() => {
            setShowKnowledgeBase(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

function EventEditorModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const [formData, setFormData] = useState<Event>(event);

  const handleSave = async () => {
    console.log('Saving event:', formData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>
            {event.id ? 'Редактировать' : 'Создать'} мероприятие
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <Icon name="X" size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
              ID мероприятия (slug)
            </label>
            <input
              type="text"
              value={formData.event_id}
              onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
              placeholder="human24"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
              Название
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Human. Подбор Персонала"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                Сайт
              </label>
              <input
                type="url"
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                placeholder="https://humanconf.ru"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                Landing / Регистрация
              </label>
              <input
                type="url"
                value={formData.landing}
                onChange={(e) => setFormData({ ...formData, landing: e.target.value })}
                placeholder="https://humanconf.ru/education"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                Локация
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Москва"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                Площадка
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Технопарк"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Сохранить
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '1rem 2rem',
                background: '#F1F5F9',
                color: '#64748B',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeBaseModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'import' | 'speakers' | 'content'>('import');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>
            База знаний: {event.name}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <Icon name="X" size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9' }}>
          {[
            { key: 'import', label: 'Импорт программы', icon: 'FileUp' },
            { key: 'speakers', label: 'Спикеры', icon: 'Users' },
            { key: 'content', label: 'Контент', icon: 'FileText' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.key ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#64748b',
                border: 'none',
                borderBottom: activeTab === tab.key ? '3px solid #10B981' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '8px 8px 0 0'
              }}
            >
              <Icon name={tab.icon as any} size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'import' && (
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Импорт программы из Google Sheets
            </h4>
            <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
              <p style={{ color: '#166534', fontSize: '0.875rem', margin: 0 }}>
                <Icon name="Info" size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Загрузите Google Sheets с вкладками "Секции", "Доклады", "Спикеры"
              </p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                URL Google Sheets
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Icon name="Download" size={20} />
              Импортировать программу
            </button>
          </div>
        )}

        {activeTab === 'speakers' && (
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Управление спикерами
            </h4>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Спикеры будут автоматически добавлены при импорте программы
            </p>
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
              Маркетинговый контент
            </h4>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                  Ссылка на боли аудитории
                </label>
                <input
                  type="url"
                  placeholder="https://docs.google.com/document/..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                  Проблема (Pain Point)
                </label>
                <textarea
                  placeholder="Каждый третий новичок уходит в первые 90 дней..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                  Выгода (Benefit)
                </label>
                <textarea
                  placeholder="Онбординг, который удерживает 8 из 10..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}