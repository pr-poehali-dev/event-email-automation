import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Event {
  id?: number;
  event_id: string;
  name: string;
  [key: string]: any;
}

interface KnowledgeBaseManagerProps {
  event: Event;
  onClose: () => void;
}

export default function KnowledgeBaseManager({ event, onClose }: KnowledgeBaseManagerProps) {
  const [knowledgeData, setKnowledgeData] = useState({
    programSheetsUrl: '',
    painDocsUrl: '',
    painPoints: '',
    benefits: '',
    targetAudience: '',
    linkedTemplates: [] as number[],
    ctas: { top: '', bottom: '' }
  });
  const [indexing, setIndexing] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/68c6506f-0606-43d5-8c75-f4b1fd9e1c12');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleIndexKnowledge = async () => {
    if (!knowledgeData.programSheetsUrl) {
      alert('⚠️ Необходимо указать ссылку на Google Sheets с программой');
      return;
    }

    setIndexing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/f96b53c0-3cc5-422e-83b1-bfd535562125', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.event_id,
          sheets_url: knowledgeData.programSheetsUrl
        })
      });

      const importResult = await response.json();
      
      if (response.ok) {
        const vectorizeResponse = await fetch('https://functions.poehali.dev/9f4f68ea-4d9d-4c55-bd58-9baded263228', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            event_id: event.event_id, 
            force_refresh: true 
          })
        });

        const vectorizeResult = await vectorizeResponse.json();
        
        if (vectorizeResult.status === 'success') {
          alert(`✅ База знаний проиндексирована!\n\n📊 Импортировано:\n- Секций: ${importResult.sections_count || 0}\n- Докладов: ${importResult.talks_count || 0}\n- Спикеров: ${importResult.speakers_count || 0}\n\n🔍 Создано эмбеддингов: ${vectorizeResult.chunks_created}`);
        } else {
          alert('⚠️ Импорт выполнен, но векторизация не удалась');
        }
      } else {
        alert('❌ Ошибка импорта: ' + importResult.error);
      }
    } catch (error) {
      alert('❌ Ошибка: ' + error);
    } finally {
      setIndexing(false);
    }
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
        maxWidth: '1000px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
              База знаний
            </h3>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>{event.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <Icon name="X" size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          <section style={{ 
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '2px solid #3B82F6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Icon name="FileSpreadsheet" size={24} style={{ color: '#3B82F6' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                1. Программа мероприятия
              </h4>
            </div>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Google Sheets с вкладками "Секции", "Доклады", "Спикеры"
            </p>
            <input
              type="url"
              value={knowledgeData.programSheetsUrl}
              onChange={(e) => setKnowledgeData({ ...knowledgeData, programSheetsUrl: e.target.value })}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #3B82F6',
                fontSize: '0.9375rem',
                background: 'white'
              }}
            />
          </section>

          <section style={{ 
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '2px solid #F59E0B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Icon name="AlertCircle" size={24} style={{ color: '#F59E0B' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                2. Боли аудитории (опционально)
              </h4>
            </div>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Google Docs с описанием проблем целевой аудитории
            </p>
            <input
              type="url"
              value={knowledgeData.painDocsUrl}
              onChange={(e) => setKnowledgeData({ ...knowledgeData, painDocsUrl: e.target.value })}
              placeholder="https://docs.google.com/document/d/..."
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #F59E0B',
                fontSize: '0.9375rem',
                background: 'white',
                marginBottom: '1rem'
              }}
            />
            <textarea
              value={knowledgeData.painPoints}
              onChange={(e) => setKnowledgeData({ ...knowledgeData, painPoints: e.target.value })}
              placeholder="Или введите боли вручную: например, 'Команды не могут масштабироваться из-за legacy кода'"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #F59E0B',
                fontSize: '0.9375rem',
                minHeight: '80px',
                resize: 'vertical',
                background: 'white'
              }}
            />
          </section>

          <section style={{ 
            background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '2px solid #10B981'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Icon name="Sparkles" size={24} style={{ color: '#10B981' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                3. Выгоды и ценность (опционально)
              </h4>
            </div>
            <textarea
              value={knowledgeData.benefits}
              onChange={(e) => setKnowledgeData({ ...knowledgeData, benefits: e.target.value })}
              placeholder="Например: 'Узнаете как ускорить разработку в 2 раза через automation'"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #10B981',
                fontSize: '0.9375rem',
                minHeight: '80px',
                resize: 'vertical',
                background: 'white'
              }}
            />
          </section>

          <section style={{ 
            background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '2px solid #8B5CF6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Icon name="FileText" size={24} style={{ color: '#8B5CF6' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                4. Шаблоны для валидации (опционально)
              </h4>
            </div>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Выберите шаблоны писем для проверки стиля и примеров
            </p>
            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
              {templates.map((template) => (
                <label
                  key={template.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '8px',
                    border: knowledgeData.linkedTemplates.includes(template.id) 
                      ? '2px solid #8B5CF6' 
                      : '2px solid #E5E7EB',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={knowledgeData.linkedTemplates.includes(template.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setKnowledgeData({
                          ...knowledgeData,
                          linkedTemplates: [...knowledgeData.linkedTemplates, template.id]
                        });
                      } else {
                        setKnowledgeData({
                          ...knowledgeData,
                          linkedTemplates: knowledgeData.linkedTemplates.filter(id => id !== template.id)
                        });
                      }
                    }}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ flex: 1, fontWeight: 500 }}>{template.name}</span>
                </label>
              ))}
              {templates.length === 0 && (
                <p style={{ color: '#94A3B8', textAlign: 'center', padding: '1rem' }}>
                  Шаблоны не найдены
                </p>
              )}
            </div>
          </section>

          <section style={{ 
            background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '2px solid #EC4899'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Icon name="Target" size={24} style={{ color: '#EC4899' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                5. Целевая аудитория (опционально)
              </h4>
            </div>
            <input
              type="text"
              value={knowledgeData.targetAudience}
              onChange={(e) => setKnowledgeData({ ...knowledgeData, targetAudience: e.target.value })}
              placeholder="Например: CTO и тимлиды из компаний 50-200 человек"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #EC4899',
                fontSize: '0.9375rem',
                background: 'white'
              }}
            />
          </section>

          <section style={{ 
            background: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '2px solid #EF4444'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Icon name="MousePointer" size={24} style={{ color: '#EF4444' }} />
              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                6. CTA по умолчанию (опционально)
              </h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                value={knowledgeData.ctas.top}
                onChange={(e) => setKnowledgeData({ ...knowledgeData, ctas: { ...knowledgeData.ctas, top: e.target.value } })}
                placeholder="CTA вверху (напр: Зарегистрироваться)"
                style={{
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '2px solid #EF4444',
                  fontSize: '0.9375rem',
                  background: 'white'
                }}
              />
              <input
                type="text"
                value={knowledgeData.ctas.bottom}
                onChange={(e) => setKnowledgeData({ ...knowledgeData, ctas: { ...knowledgeData.ctas, bottom: e.target.value } })}
                placeholder="CTA внизу (напр: Смотреть программу)"
                style={{
                  padding: '0.875rem',
                  borderRadius: '8px',
                  border: '2px solid #EF4444',
                  fontSize: '0.9375rem',
                  background: 'white'
                }}
              />
            </div>
          </section>
        </div>

        <div style={{ 
          marginTop: '2.5rem', 
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
          borderRadius: '12px',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
              Готово к индексации?
            </p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Импорт данных + векторизация для RAG-поиска
            </p>
          </div>
          <button
            onClick={handleIndexKnowledge}
            disabled={indexing || !knowledgeData.programSheetsUrl}
            style={{
              padding: '1rem 2rem',
              background: indexing || !knowledgeData.programSheetsUrl
                ? '#94A3B8'
                : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: indexing || !knowledgeData.programSheetsUrl ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
              minWidth: '220px',
              justifyContent: 'center'
            }}
          >
            {indexing ? (
              <>
                <Icon name="Loader" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Индексация...
              </>
            ) : (
              <>
                <Icon name="Zap" size={20} />
                Проиндексировать знания
              </>
            )}
          </button>
        </div>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
