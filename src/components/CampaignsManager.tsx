import { useState } from 'react';
import { Plus, Send, Zap, Mail, DollarSign, Clock, X } from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'announcement',
    description: ''
  });
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
          onClick={() => setShowForm(true)}
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

      {campaigns.length > 0 && (
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2.5rem' }}>
          {campaigns.map((campaign) => {
            const typeConfig = campaign.type === 'announcement' 
              ? { icon: Mail, color: '#8B5CF6', label: 'Анонс' }
              : campaign.type === 'sale'
              ? { icon: DollarSign, color: '#10B981', label: 'Продажа' }
              : { icon: Clock, color: '#EF4444', label: 'Дедлайн' };
            const Icon = typeConfig.icon;
            
            return (
              <div
                key={campaign.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                  border: `2px solid ${typeConfig.color}20`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: `linear-gradient(135deg, ${typeConfig.color} 0%, ${typeConfig.color}dd 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
                        {campaign.name}
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: `${typeConfig.color}20`,
                        color: typeConfig.color,
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {typeConfig.label}
                      </span>
                    </div>
                    <p style={{ color: '#64748b' }}>{campaign.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Создать кампанию
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const newCampaign: Campaign = {
                id: Date.now(),
                name: formData.name,
                type: formData.type,
                description: formData.description,
                createdAt: new Date().toISOString()
              };
              setCampaigns([...campaigns, newCampaign]);
              setShowForm(false);
              setFormData({ name: '', type: 'announcement', description: '' });
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
                  Название кампании
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  Тип письма
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="announcement">Анонс</option>
                  <option value="sale">Продажа</option>
                  <option value="deadline">Дедлайн</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1e293b' }}>
                  Запрос для RAG поиска
                </label>
                <input
                  type="text"
                  placeholder="Например: онбординг новичков, программа конференции..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  RAG найдёт релевантный контент из базы знаний и подставит в письмо
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Создать
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