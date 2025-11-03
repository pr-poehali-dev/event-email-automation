import { Plus, Send, Zap, Mail, DollarSign, Clock } from 'lucide-react';

export default function CampaignsManager() {
  const types = [
    { emoji: Mail, title: 'Анонс', desc: 'Информирование о событии', color: '#8B5CF6' },
    { emoji: DollarSign, title: 'Продажа', desc: 'Прямая продажа билетов', color: '#10B981' },
    { emoji: Clock, title: 'Дедлайн', desc: 'Срочность предложения', color: '#EF4444' },
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
            Кампании
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            Контент-планы и генерация писем
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.75rem',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Новая кампания
        </button>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
        borderRadius: '20px',
        padding: '4rem',
        textAlign: 'center',
        border: '2px dashed rgba(16, 185, 129, 0.2)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
        }}>
          <Send style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>
          Нет кампаний
        </h3>
        <p style={{ color: '#64748b', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
          Создайте кампанию для автоматической генерации писем
        </p>
        
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto 3rem' }}>
          {types.map((type, idx) => {
            const Icon = type.emoji;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2.5rem',
                  border: `2px solid ${type.color}20`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 20px 40px ${type.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: `linear-gradient(135deg, ${type.color} 0%, ${type.color}dd 100%)`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  boxShadow: `0 10px 25px ${type.color}40`
                }}>
                  <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <p style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                  {type.title}
                </p>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>
                  {type.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(245, 158, 11, 0.2)',
          border: '2px solid rgba(245, 158, 11, 0.2)'
        }}>
          <Zap style={{ width: '28px', height: '28px', color: '#D97706' }} />
          <p style={{ color: '#92400E', fontSize: '1rem' }}>
            <strong style={{ fontWeight: 'bold' }}>ИИ генерирует контент</strong> по рецептам каждого типа письма
          </p>
        </div>
      </div>
    </div>
  );
}
