import { useState, useRef, useEffect } from 'react';
import { Plus, FileText, Upload, Sparkles, CheckCircle, X } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  html: string;
  uploadedAt: string;
}

interface GeneratedEmail {
  subject: string;
  preheader: string;
  fields: any;
  html_content: string;
  content_validation: any;
  html_validation: any;
  mapping_log: Array<{
    variable: string;
    source: string;
    transform: string;
    result_preview: string;
  }>;
  recipe_used: string;
  recipe_version: string;
  transform_version: string;
  inputs_hash: string;
}

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showMappingEditor, setShowMappingEditor] = useState(false);
  const [mappings, setMappings] = useState<Array<{variable: string; source: string; transform?: string; value?: string}>>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/68c6506f-0606-43d5-8c75-f4b1fd9e1c12');
      const data = await response.json();
      const mappedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        html: item.html_content,
        uploadedAt: item.created_at
      }));
      setTemplates(mappedData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };
  const features = [
    'Preheader и заголовки',
    'CTA кнопки и ссылки',
    'Блоки спикеров и программы',
    'Списки преимуществ',
    'Дедлайны и сроки'
  ];

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
            Библиотека шаблонов
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            HTML-шаблоны писем с автодетекцией блоков
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.75rem',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          <Upload style={{ width: '20px', height: '20px' }} />
          Загрузить шаблон
        </button>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
        borderRadius: '20px',
        padding: '4rem',
        textAlign: 'center',
        border: '2px dashed rgba(245, 158, 11, 0.2)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
        }}>
          <FileText style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>
          Нет шаблонов
        </h3>
        <p style={{ color: '#64748b', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
          Загрузите HTML-шаблон письма.<br />
          ИИ автоматически найдёт все блоки и создаст переменные.
        </p>
        
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          margin: '0 auto',
          textAlign: 'left',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e293b' }}>
              Что ИИ находит автоматически:
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {features.map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle style={{ width: '20px', height: '20px', color: '#10B981' }} />
                <span style={{ color: '#475569', fontSize: '1rem' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {templates.length > 0 && (
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2.5rem' }}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                border: '2px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                    {template.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Загружен: {new Date(template.uploadedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={async () => {
                      setSelectedTemplate(template);
                      
                      try {
                        const response = await fetch(`https://functions.poehali.dev/68c6506f-0606-43d5-8c75-f4b1fd9e1c12?id=${template.id}`);
                        if (response.ok) {
                          const data = await response.json();
                          if (data.mappings && data.mappings.length > 0) {
                            setMappings(data.mappings);
                          }
                        }
                      } catch (err) {
                        console.error('Error loading mappings:', err);
                      }
                      
                      setShowGenerator(true);
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
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Sparkles style={{ width: '18px', height: '18px' }} />
                    Сгенерировать письмо
                  </button>
                  
                  <button
                    onClick={async () => {
                      setSelectedTemplate(template);
                      
                      try {
                        const contextResponse = await fetch('https://functions.poehali.dev/e5a899bf-994d-47d8-ad4e-99a64306a4f9', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            event_id: 'human24',
                            template_type: 'sales_via_pain'
                          })
                        });
                        
                        if (!contextResponse.ok) {
                          throw new Error('Failed to build context');
                        }
                        
                        const ctx = await contextResponse.json();
                        
                        const demoContent = {
                          brand: ctx.brand,
                          event: ctx.event,
                          meta: ctx.meta,
                          speakers: ctx.speakers || [],
                          talks: ctx.talks || [],
                          hero: {
                            title: ctx.event.name,
                            subtitle: 'Практики и кейсы адаптации сотрудников',
                            preheader: ctx.meta.preheader
                          },
                          has_speakers: (ctx.speakers || []).length > 0,
                          has_agenda: (ctx.talks || []).length > 0,
                          cta: {
                            text: ctx.meta.cta_top_text,
                            url: ctx.meta.cta_top_url,
                            style: 'primary'
                          }
                        };
                      
                        const demoTemplate = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>{{event.name}}</title></head>
<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
    <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">{{meta.preheader}}</p>
    <h1 style="margin: 0 0 10px 0; font-size: 32px;">{{event.name}}</h1>
    <p style="margin: 0; font-size: 18px;">{{hero.subtitle}}</p>
  </div>
  
  {% if has_speakers %}
  <div style="margin: 30px 0; background: white; padding: 20px; border-radius: 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">Спикеры</h2>
    <div>
      {% for speaker in speakers %}
      <div style="padding: 15px; background: #f8fafc; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
        <strong style="font-size: 18px;">{{speaker.name}}</strong>
        <br><span style="color: #64748b;">{{speaker.title}}, {{speaker.company}}</span>
        <br><small style="color: #0ea5e9;">Тема: {{speaker.topic}}</small>
      </div>
      {% endfor %}
    </div>
  </div>
  {% endif %}
  
  {% if has_agenda %}
  <div style="margin: 30px 0; background: white; padding: 20px; border-radius: 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">Программа</h2>
    <ul style="list-style: none; padding: 0;">
      {% for talk in talks %}
      <li style="padding: 15px; background: #f8fafc; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
        <strong>{{talk.start_time}} - {{talk.end_time}}</strong>: {{talk.title}}
        <br><small style="color: #64748b;">{{talk.abstract}}</small>
      </li>
      {% endfor %}
    </ul>
  </div>
  {% endif %}
  
  <div style="text-align: center; margin: 40px 0;">
    <a href="{{cta.url}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
      {{cta.text}}
    </a>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
    <p>{{brand.legal.senderName}} | {{brand.support_email}}</p>
    <p>{{brand.legal.unsubscribeText}}</p>
  </div>
</body>
</html>`;
                        
                        const renderResponse = await fetch('https://functions.poehali.dev/fbb95390-30eb-4b92-befe-6577bc87098b', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            template_html: demoTemplate,
                            content: demoContent
                          })
                        });
                        
                        if (!renderResponse.ok) {
                          const errorText = await renderResponse.text();
                          throw new Error(`Render failed: ${errorText}`);
                        }
                        
                        const data = await renderResponse.json();
                        console.log('v2 render success:', data);
                        
                        setGeneratedEmail({
                          ...data,
                          subject: ctx.meta.subjectA,
                          preheader: ctx.meta.preheader,
                          content_validation: { status: 'OK', errors: [] },
                          html_validation: { valid: true, errors: [] },
                          mapping_log: [
                            { variable: 'event.name', source: 'Knowledge Base', transform: 'direct', result_preview: ctx.event.name },
                            { variable: 'speakers', source: 'Knowledge Base', transform: 'array', result_preview: `${ctx.speakers.length} спикеров` },
                            { variable: 'talks', source: 'Knowledge Base', transform: 'array', result_preview: `${ctx.talks.length} докладов` },
                            { variable: 'CTA URL', source: 'Auto UTM', transform: 'utm_append', result_preview: ctx.meta.cta_top_url }
                          ],
                          recipe_used: 'knowledge_base_v2',
                          recipe_version: '2.0',
                          transform_version: '1.0',
                          inputs_hash: 'kb_demo'
                        });
                        setShowGenerator(true);
                      } catch (err) {
                        console.error('v2 render error:', err);
                        alert('Ошибка рендера v2: ' + err);
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      transition: 'all 0.2s'
                    }}
                  >
                    v2
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
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
            maxWidth: '600px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowUpload(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>

            <h3 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Загрузить HTML-шаблон
            </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fileInput = fileInputRef.current;
              if (fileInput?.files?.[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = async (event) => {
                  try {
                    setAnalyzing(true);
                    const htmlContent = event.target?.result as string;
                    
                    const analyzeResponse = await fetch('https://functions.poehali.dev/45e6f3f6-377e-4e0d-9350-09aa87d3e584', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        html_content: htmlContent
                      })
                    });
                    
                    if (analyzeResponse.ok) {
                      const analysis = await analyzeResponse.json();
                      setAnalysisResult(analysis);
                      
                      const uploadResponse = await fetch('https://functions.poehali.dev/68c6506f-0606-43d5-8c75-f4b1fd9e1c12', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          name: file.name,
                          html_content: htmlContent,
                          analyzed_blocks: analysis.variables,
                          required_variables: analysis.required_variables,
                          template_with_variables: analysis.template_html,
                          conditions: analysis.conditions
                        })
                      });
                      
                      if (uploadResponse.ok) {
                        const newTemplate = await uploadResponse.json();
                        await loadTemplates();
                        
                        const defaultMappings = analysis.variables.map((v: any) => ({
                          variable: v.name,
                          source: v.type === 'cta' ? 'static' : 'Event.name',
                          transform: v.type === 'speaker' ? 'render_speakers_cards' : undefined,
                          value: v.type === 'cta' ? 'Зарегистрироваться' : undefined
                        }));
                        
                        setMappings(defaultMappings);
                        setSelectedTemplate({...newTemplate, analyzed_blocks: analysis.variables, required_variables: analysis.required_variables});
                        setAnalyzing(false);
                      }
                    }
                  } catch (error) {
                    console.error('Failed to upload template:', error);
                    setAnalyzing(false);
                  }
                };
                reader.readAsText(file);
              }
            }}>
              <div style={{
                border: '2px dashed #e2e8f0',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)',
                marginBottom: '2rem'
              }}>
                <Upload style={{ width: '48px', height: '48px', color: '#F59E0B', margin: '0 auto 1rem' }} />
                <p style={{ color: '#1e293b', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Нажмите или перетащите HTML-файл
                </p>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Поддерживается: .html, .htm
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  required
                  style={{
                    marginTop: '1rem',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    width: '100%'
                  }}
                />
              </div>

              {analyzing && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  border: '2px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Sparkles style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
                    <p style={{ fontWeight: 600, color: '#1e293b' }}>ИИ анализирует шаблон...</p>
                  </div>
                  {analysisResult && (
                    <div>
                      <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>
                        Найдено блоков: <strong style={{ color: '#F59E0B' }}>{analysisResult.blocks_count}</strong>
                      </p>
                      <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>
                        Обязательные переменные: <strong style={{ color: '#EF4444' }}>{analysisResult.required_variables?.length || 0}</strong>
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {analysisResult.variables?.map((v: any, i: number) => (
                          <span key={i} style={{
                            padding: '0.25rem 0.75rem',
                            background: v.is_required ? '#FEE2E2' : 'white',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: v.is_required ? '#EF4444' : '#F59E0B',
                            fontWeight: 600,
                            border: v.is_required ? '1px solid #FCA5A5' : 'none'
                          }}>
                            {v.is_required && '❗'} {v.name}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUpload(false);
                          setShowMappingEditor(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Настроить маппинг переменных
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={analyzing}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: analyzing ? '#9CA3AF' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: analyzing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {analyzing ? 'Анализ...' : 'Загрузить'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: '#f1f5f9',
                    color: '#64748b',
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
            </form>
          </div>
        </div>
      )}

      {showGenerator && selectedTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2.5rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowGenerator(false);
                setGeneratedEmail(null);
                setSelectedTemplate(null);
              }}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>

            <h3 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Генератор письма
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Шаблон: {selectedTemplate.name}</p>

            {!generatedEmail ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                setGenerating(true);
                try {
                  const response = await fetch('https://functions.poehali.dev/58ca3cf9-ad8b-4d93-bac8-e5b596860864', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      template_id: selectedTemplate.id,
                      event_id: 1,
                      content_type_code: formData.get('content_type'),
                      content_plan: {
                        topic: formData.get('topic')
                      },
                      mappings: mappings.length > 0 ? mappings : [
                        { variable: 'cta_text', source: 'static', value: 'Зарегистрироваться' },
                        { variable: 'cta_text_2', source: 'static', value: 'Зарегистрироваться' }
                      ]
                    })
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    setGeneratedEmail(result);
                  }
                } catch (error) {
                  console.error('Generation failed:', error);
                } finally {
                  setGenerating(false);
                }
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                    Тип письма
                  </label>
                  <select
                    name="content_type"
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="announce">Анонс (информативный)</option>
                    <option value="sale">Продажа (с оффером)</option>
                    <option value="pain_sale">Боль → Продажа</option>
                  </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b' }}>
                    Тема письма
                  </label>
                  <input
                    type="text"
                    name="topic"
                    required
                    placeholder="Как удержать персонал без высоких зарплат"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {mappings.length > 0 && (
                  <div style={{ 
                    marginBottom: '1.5rem', 
                    background: '#F0F9FF', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    border: '1px solid #BAE6FD'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0C4A6E', margin: 0 }}>
                        📌 Маппинг переменных: {mappings.length}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGenerator(false);
                          setShowMappingEditor(true);
                        }}
                        style={{
                          padding: '0.25rem 0.75rem',
                          background: '#0EA5E9',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Изменить
                      </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#0369A1', margin: 0 }}>
                      {mappings.filter(m => m.source === 'static').length} статических, {' '}
                      {mappings.filter(m => m.source.startsWith('Event.')).length} из события
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={generating}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: generating ? '#9CA3AF' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {generating ? (
                    <>
                      <Sparkles style={{ width: '20px', height: '20px' }} />
                      Генерация...
                    </>
                  ) : (
                    'Сгенерировать письмо'
                  )}
                </button>
              </form>
            ) : (
              <div>
                {generatedEmail.content_validation && (
                  <div style={{
                    padding: '1.5rem',
                    background: generatedEmail.content_validation.status === 'OK' ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: `2px solid ${generatedEmail.content_validation.status === 'OK' ? '#86efac' : '#fca5a5'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <CheckCircle style={{ width: '20px', height: '20px', color: generatedEmail.content_validation.status === 'OK' ? '#22c55e' : '#ef4444' }} />
                      <strong style={{ color: '#1e293b' }}>Валидация: {generatedEmail.content_validation.status}</strong>
                    </div>
                    {generatedEmail.content_validation.errors?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#64748b' }}>
                        {generatedEmail.content_validation.errors.map((err: any, i: number) => (
                          <li key={i}>{err.field}: {err.issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#1e293b' }}>Тема:</strong>
                  <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{generatedEmail.subject}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#1e293b' }}>Прехедер:</strong>
                  <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{generatedEmail.preheader}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ color: '#1e293b' }}>Рецепт:</strong>
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#667eea',
                    fontWeight: 600
                  }}>
                    {generatedEmail.recipe_used} v{generatedEmail.recipe_version}
                  </span>
                </div>

                {generatedEmail.mapping_log && generatedEmail.mapping_log.length > 0 && (
                  <div style={{
                    background: '#fef3c7',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '2px solid #fbbf24'
                  }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '1rem' }}>
                      📊 Mapping Log ({generatedEmail.mapping_log.length} переменных)
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {generatedEmail.mapping_log.map((log: any, i: number) => (
                        <div key={i} style={{
                          background: 'white',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          fontSize: '0.875rem'
                        }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <strong style={{ color: '#F59E0B' }}>{log.variable}</strong>
                            <span style={{ color: '#64748b' }}>←</span>
                            <span style={{ color: '#10b981' }}>{log.source}</span>
                            {log.transform && (
                              <>
                                <span style={{ color: '#64748b' }}>→</span>
                                <span style={{ color: '#8b5cf6' }}>{log.transform}()</span>
                              </>
                            )}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            {log.result_preview}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedEmail.html_validation && generatedEmail.html_validation.warnings?.length > 0 && (
                  <div style={{
                    background: '#fef3c7',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    border: '2px solid #fbbf24'
                  }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.75rem' }}>
                      ⚠️ HTML Warnings:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400e' }}>
                      {generatedEmail.html_validation.warnings.map((warning: string, i: number) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '1rem',
                  maxHeight: '300px',
                  overflow: 'auto',
                  marginBottom: '1rem'
                }}>
                  <strong style={{ color: '#1e293b', marginBottom: '0.5rem', display: 'block' }}>HTML Preview:</strong>
                  <iframe
                    srcDoc={generatedEmail.html_content}
                    style={{
                      width: '100%',
                      height: '400px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedEmail.html_content);
                  }}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Скопировать HTML
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMappingEditor && selectedTemplate && analysisResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
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
            <button
              onClick={() => setShowMappingEditor(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>

            <h3 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Настройка маппинга переменных
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Шаблон: {selectedTemplate.name} | Переменных: {analysisResult.variables.length} | Обязательных: {analysisResult.required_variables?.length || 0}
            </p>

            <div style={{ marginBottom: '1.5rem', background: '#FEF3C7', padding: '1rem', borderRadius: '8px', border: '2px solid #FCD34D' }}>
              <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                💡 Обязательные переменные помечены красным. Убедитесь, что все источники данных настроены правильно.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Переменная</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Тип</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Источник</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Трансформ</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Значение</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, idx) => {
                    const varInfo = analysisResult.variables.find((v: any) => v.name === mapping.variable);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: varInfo?.is_required ? '#FEF2F2' : 'white' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: varInfo?.is_required ? '#EF4444' : '#1E293B' }}>
                          {varInfo?.is_required && '⚠️ '}{mapping.variable}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                          <span style={{ padding: '0.25rem 0.5rem', background: '#F1F5F9', borderRadius: '4px' }}>
                            {varInfo?.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <select
                            value={mapping.source}
                            onChange={(e) => {
                              const newMappings = [...mappings];
                              newMappings[idx].source = e.target.value;
                              setMappings(newMappings);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              fontSize: '0.875rem'
                            }}
                          >
                            <option value="static">Статическое значение</option>
                            <option value="Event.name">Event.name</option>
                            <option value="Event.date">Event.date</option>
                            <option value="Event.speakers">Event.speakers</option>
                            <option value="Event.agenda">Event.agenda</option>
                            <option value="ContentPlan.topic">ContentPlan.topic</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <select
                            value={mapping.transform || ''}
                            onChange={(e) => {
                              const newMappings = [...mappings];
                              newMappings[idx].transform = e.target.value || undefined;
                              setMappings(newMappings);
                            }}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              fontSize: '0.875rem'
                            }}
                          >
                            <option value="">Без трансформа</option>
                            <option value="render_speakers_cards">render_speakers_cards</option>
                            <option value="render_agenda_ul">render_agenda_ul</option>
                            <option value="short_intro">short_intro</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          {mapping.source === 'static' && (
                            <input
                              type="text"
                              value={mapping.value || ''}
                              onChange={(e) => {
                                const newMappings = [...mappings];
                                newMappings[idx].value = e.target.value;
                                setMappings(newMappings);
                              }}
                              placeholder="Введите значение"
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                fontSize: '0.875rem'
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={async () => {
                  if (selectedTemplate?.id) {
                    try {
                      await fetch('https://functions.poehali.dev/68c6506f-0606-43d5-8c75-f4b1fd9e1c12', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          name: selectedTemplate.name,
                          html_content: selectedTemplate.html_content || '',
                          analyzed_blocks: selectedTemplate.analyzed_blocks,
                          required_variables: selectedTemplate.required_variables,
                          template_with_variables: selectedTemplate.template_with_variables,
                          conditions: selectedTemplate.conditions,
                          mappings: mappings
                        })
                      });
                    } catch (err) {
                      console.error('Error saving mappings:', err);
                    }
                  }
                  setShowMappingEditor(false);
                  setShowGenerator(true);
                }}
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
                Сохранить и перейти к генерации
              </button>
              <button
                onClick={() => setShowMappingEditor(false)}
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
      )}
    </div>
  );
}