import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Event {
  event_id: string;
  name: string;
}

interface Template {
  id: number;
  name: string;
  description?: string;
  template_html: string;
}

export default function EmailGenerator() {
  const [events, setEvents] = useState<Event[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [contentType, setContentType] = useState('announcement');
  const [subject, setSubject] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadEvents();
    loadTemplates();
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

  const generateEmail = async () => {
    if (!selectedEvent || !selectedTemplate || !subject) {
      alert('Заполните все обязательные поля');
      return;
    }

    setGenerating(true);
    try {
      // Step 1: Get context from knowledge base
      const contextResponse = await fetch('https://functions.poehali.dev/e5a899bf-994d-47d8-ad4e-99a64306a4f9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEvent })
      });

      if (!contextResponse.ok) {
        throw new Error('Failed to build context');
      }

      const context = await contextResponse.json();

      // Step 2: Get template HTML
      const template = templates.find(t => t.id === parseInt(selectedTemplate));
      if (!template) {
        throw new Error('Template not found');
      }

      // Step 3: Generate text blocks using RAG
      const ragPromises = [];
      
      // Generate hero subtitle
      if (template.template_html.includes('{{hero.subtitle}}')) {
        ragPromises.push(
          fetch('https://functions.poehali.dev/6add6809-383f-4d90-902c-0014d9993a49', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: selectedEvent,
              prompt: `Напиши короткий подзаголовок для email-письма типа "${contentType}" про мероприятие. Максимум 100 символов.`,
              content_types: ['speaker', 'talk', 'benefit'],
              max_length: 100,
              top_k: 3
            })
          }).then(r => r.json()).then(d => ({ key: 'hero.subtitle', value: d.generated_text }))
        );
      }

      // Generate preheader
      if (template.template_html.includes('{{meta.preheader}}')) {
        ragPromises.push(
          fetch('https://functions.poehali.dev/6add6809-383f-4d90-902c-0014d9993a49', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_id: selectedEvent,
              prompt: `Напиши короткий prheader (первая строка письма) для email типа "${contentType}". Максимум 80 символов. Мотивируй открыть письмо.`,
              content_types: ['benefit', 'pain_point'],
              max_length: 80,
              top_k: 2
            })
          }).then(r => r.json()).then(d => ({ key: 'meta.preheader', value: d.generated_text }))
        );
      }

      const ragResults = await Promise.all(ragPromises);

      // Merge RAG results into context
      const enrichedContext = { ...context };
      ragResults.forEach(result => {
        const keys = result.key.split('.');
        if (keys.length === 2) {
          if (!enrichedContext[keys[0]]) enrichedContext[keys[0]] = {};
          enrichedContext[keys[0]][keys[1]] = result.value;
        }
      });

      // Add subject
      enrichedContext.meta = enrichedContext.meta || {};
      enrichedContext.meta.subjectA = subject;

      // Step 4: Render template with Nunjucks
      const renderResponse = await fetch('https://functions.poehali.dev/fbb95390-30eb-4b92-befe-6577bc87098b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_html: template.template_html,
          content: enrichedContext
        })
      });

      if (!renderResponse.ok) {
        throw new Error('Failed to render template');
      }

      const rendered = await renderResponse.json();
      setGeneratedHtml(rendered.html);
      setShowPreview(true);

    } catch (error) {
      alert('Ошибка генерации: ' + error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Icon name="Mail" size={32} style={{ color: '#8B5CF6' }} />
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>
            Генерация email-письма
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
              Мероприятие *
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem'
              }}
            >
              <option value="">Выберите мероприятие</option>
              {events.map((event) => (
                <option key={event.event_id} value={event.event_id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
              Шаблон письма *
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem'
              }}
            >
              <option value="">Выберите шаблон</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
              Тип письма
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem'
              }}
            >
              <option value="announcement">Анонс</option>
              <option value="sales">Продажа</option>
              <option value="news">Новости</option>
              <option value="reminder">Напоминание</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
              Тема письма *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Введите тему письма"
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        <button
          onClick={generateEmail}
          disabled={generating}
          style={{
            width: '100%',
            padding: '1.25rem',
            background: generating ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.125rem',
            fontWeight: 600,
            cursor: generating ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: generating ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)'
          }}
        >
          <Icon name={generating ? 'Loader' : 'Sparkles'} size={24} />
          {generating ? 'Генерирую письмо...' : 'Сгенерировать письмо'}
        </button>
      </div>

      {showPreview && generatedHtml && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                Предпросмотр письма
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '0.5rem'
                }}
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div style={{
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              background: '#f8fafc',
              marginBottom: '1.5rem'
            }}>
              <div dangerouslySetInnerHTML={{ __html: generatedHtml }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedHtml);
                  alert('HTML скопирован в буфер обмена!');
                }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon name="Copy" size={20} />
                Скопировать HTML
              </button>

              <button
                onClick={async () => {
                  const campaignName = `${subject} - ${new Date().toLocaleDateString()}`;
                  const confirmed = confirm(`Создать сообщение в UniSender?\n\nНазвание: ${campaignName}\n\nПосле создания вы сможете создать кампанию в UniSender dashboard.`);
                  
                  if (!confirmed) return;
                  
                  try {
                    const response = await fetch('https://functions.poehali.dev/45b8b241-46bb-4d73-8b50-f3624cadbe4b', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        campaign_name: campaignName,
                        subject: subject,
                        html: generatedHtml,
                        sender_name: 'EmailGen AI',
                        sender_email: 'noreply@example.com'
                      })
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      alert(`✅ Сообщение создано в UniSender!\n\nMessage ID: ${data.message_id}\n\nТеперь войдите в UniSender и создайте кампанию на основе этого сообщения.`);
                    } else {
                      const error = await response.json();
                      alert(`❌ Ошибка экспорта:\n\n${error.error}\n\nДетали: ${error.details}\n\n💡 Совет: Убедитесь, что email отправителя верифицирован в UniSender.`);
                    }
                  } catch (err) {
                    alert('Ошибка подключения: ' + err);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon name="Send" size={20} />
                Экспорт в UniSender
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}