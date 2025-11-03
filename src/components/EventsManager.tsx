import { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, Sparkles } from 'lucide-react';

interface Event {
  id: number;
  name: string;
  description: string;
  event_date: string | null;
  status: string;
  created_at: string;
}

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    status: 'draft'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForm(false);
    setFormData({ name: '', description: '', event_date: '', status: 'draft' });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            События
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            Управление мероприятиями и вебинарами
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.75rem',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(139, 92, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(139, 92, 246, 0.4)';
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Создать событие
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Загрузка событий...
        </div>
      ) : events.length === 0 ? (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
          borderRadius: '20px',
          padding: '4rem',
          textAlign: 'center',
          border: '2px dashed rgba(139, 92, 246, 0.2)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)'
          }}>
            <Calendar style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>
            Нет событий
          </h3>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            Создайте первое событие для начала работы
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
                    {event.name}
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '1rem' }}>{event.description}</p>
                  {event.event_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <Calendar style={{ width: '16px', height: '16px' }} />
                      {new Date(event.event_date).toLocaleString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
