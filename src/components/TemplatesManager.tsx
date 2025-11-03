import { useState, useRef } from 'react';
import { Plus, FileText, Upload, Sparkles, CheckCircle, X } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  html: string;
  uploadedAt: string;
}

export default function TemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

            <form onSubmit={(e) => {
              e.preventDefault();
              const fileInput = fileInputRef.current;
              if (fileInput?.files?.[0]) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  const newTemplate: Template = {
                    id: Date.now(),
                    name: file.name,
                    html: event.target?.result as string,
                    uploadedAt: new Date().toISOString()
                  };
                  setTemplates([...templates, newTemplate]);
                  setShowUpload(false);
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

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Загрузить
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
    </div>
  );
}