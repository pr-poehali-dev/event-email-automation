import { useState } from 'react';
import { Plus, BookOpen, FileText, Brain, Lightbulb, Users, X } from 'lucide-react';

interface Knowledge {
  id: number;
  category: string;
  title: string;
  content: string;
}

export default function KnowledgeManager() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'speakers',
    title: '',
    content: ''
  });
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
          onClick={() => setShowForm(true)}
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

      {knowledge.length > 0 && (
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2.5rem' }}>
          {knowledge.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  {item.category === 'speakers' ? 'Спикеры' : item.category === 'program' ? 'Программа' : 'Преимущества'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.75rem' }}>
                {item.title}
              </h3>
              <p style={{ color: '#64748b', lineHeight: 1.6 }}>{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
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
              onClick={() => setShowForm(false)}
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
              background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Добавить знание
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const newKnowledge: Knowledge = {
                id: Date.now(),
                category: formData.category,
                title: formData.title,
                content: formData.content
              };
              setKnowledge([...knowledge, newKnowledge]);
              setShowForm(false);
              setFormData({ category: 'speakers', title: '', content: '' });
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="speakers">О спикерах</option>
                  <option value="program">Программа</option>
                  <option value="benefits">Преимущества</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
                  Заголовок
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
                  Содержание
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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