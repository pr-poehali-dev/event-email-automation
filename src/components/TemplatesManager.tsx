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
  html_content: string;
  content_validation: any;
  html_validation: any;
  recipe_used: string;
}

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
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
                          html_content: htmlContent
                        })
                      });
                      
                      if (uploadResponse.ok) {
                        const newTemplate = await uploadResponse.json();
                        await loadTemplates();
                        setTimeout(() => {
                          setShowUpload(false);
                          setAnalysisResult(null);
                          setAnalyzing(false);
                          setSelectedTemplate(newTemplate);
                          setShowGenerator(true);
                        }, 2000);
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {analysisResult.variables?.slice(0, 6).map((v: any, i: number) => (
                          <span key={i} style={{
                            padding: '0.25rem 0.75rem',
                            background: 'white',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: '#F59E0B',
                            fontWeight: 600
                          }}>
                            {v.type}
                          </span>
                        ))}
                      </div>
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
                      mappings: [
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
                    {generatedEmail.recipe_used}
                  </span>
                </div>

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
    </div>
  );
}