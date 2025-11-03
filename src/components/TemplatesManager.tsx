import { Plus, FileText, Upload, Sparkles, CheckCircle } from 'lucide-react';

export default function TemplatesManager() {
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
    </div>
  );
}
