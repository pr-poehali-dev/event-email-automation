import { Plus, BookOpen, FileText, Brain, Lightbulb, Users } from 'lucide-react';

export default function KnowledgeManager() {
  const categories = [
    { icon: Users, title: 'О спикерах', desc: 'Биография, экспертиза', color: '#8B5CF6' },
    { icon: Lightbulb, title: 'Программа', desc: 'Темы, расписание', color: '#06B6D4' },
    { icon: Brain, title: 'Преимущества', desc: 'Выгоды участия', color: '#10B981' },
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
            База знаний
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            Информация для генерации контента писем
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.75rem',
            background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          Добавить знание
        </button>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(8, 145, 178, 0.05) 100%)',
        borderRadius: '20px',
        padding: '4rem',
        textAlign: 'center',
        border: '2px dashed rgba(6, 182, 212, 0.2)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4)'
        }}>
          <BookOpen style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>
          База знаний пуста
        </h3>
        <p style={{ color: '#64748b', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
          Добавьте информацию о спикерах, программе, преимуществах<br />
          для автоматической генерации контента
        </p>
        
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'left',
                  border: `2px solid ${cat.color}20`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 15px 30px ${cat.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                }}
              >
                <Icon style={{ width: '40px', height: '40px', color: cat.color, marginBottom: '1rem' }} />
                <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                  {cat.title}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
