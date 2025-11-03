import { useState } from 'react';
import { Search, Upload, RefreshCw, Database, Sparkles } from 'lucide-react';

interface SearchResult {
  id: number;
  content_type: string;
  content_id: string;
  text: string;
  similarity: number;
  metadata: any;
}

export default function RAGManager() {
  const [eventId, setEventId] = useState('human24');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [vectorizing, setVectorizing] = useState(false);
  const [textToUpload, setTextToUpload] = useState('');
  const [contentType, setContentType] = useState('text');

  const handleSearch = async () => {
    if (!query || !eventId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/96b37c31-f435-4039-991a-1241225f381e?event_id=${eventId}&query=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      alert('Ошибка поиска: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleVectorize = async () => {
    if (!eventId) return;
    
    setVectorizing(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9f4f68ea-4d9d-4c55-bd58-9baded263228', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, force_refresh: false })
      });
      const data = await response.json();
      alert(`Векторизация завершена! Создано чанков: ${data.chunks_created}`);
    } catch (err) {
      alert('Ошибка векторизации: ' + err);
    } finally {
      setVectorizing(false);
    }
  };

  const handleUpload = async () => {
    if (!textToUpload || !eventId) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/27fc4146-2d98-4448-bca8-1859ec91ce97', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          chunks: [{
            text: textToUpload,
            content_type: contentType,
            content_id: `manual_${Date.now()}`,
            metadata: { source: 'manual_upload' }
          }]
        })
      });
      const data = await response.json();
      alert(`Загружено! IDs: ${data.ids.join(', ')}`);
      setTextToUpload('');
    } catch (err) {
      alert('Ошибка загрузки: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Database style={{ width: '32px', height: '32px', color: '#8B5CF6' }} />
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' }}>
            RAG — Векторная база знаний
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              <Sparkles style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem' }} />
              Поиск по смыслу
            </h3>
            
            <input
              type="text"
              placeholder="Event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '0.75rem'
              }}
            />
            
            <textarea
              placeholder="Введите запрос для поиска..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                minHeight: '100px',
                marginBottom: '1rem'
              }}
            />
            
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Search style={{ width: '20px', height: '20px' }} />
              {loading ? 'Ищу...' : 'Искать'}
            </button>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleVectorize}
                disabled={vectorizing}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: vectorizing ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <RefreshCw style={{ width: '16px', height: '16px' }} />
                {vectorizing ? 'Векторизую...' : 'Векторизовать KB'}
              </button>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
              <Upload style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem' }} />
              Загрузить текст
            </h3>
            
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '0.75rem'
              }}
            >
              <option value="text">Текст</option>
              <option value="speaker">Спикер</option>
              <option value="talk">Доклад</option>
              <option value="faq">FAQ</option>
              <option value="past_email">Прошлое письмо</option>
            </select>
            
            <textarea
              placeholder="Вставьте текст для загрузки..."
              value={textToUpload}
              onChange={(e) => setTextToUpload(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                minHeight: '100px',
                marginBottom: '1rem'
              }}
            />
            
            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Upload style={{ width: '20px', height: '20px' }} />
              {loading ? 'Загружаю...' : 'Загрузить'}
            </button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ 
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Найдено результатов: {results.length}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((result) => (
              <div
                key={result.id}
                style={{
                  padding: '1.5rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  background: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#8B5CF6',
                    textTransform: 'uppercase'
                  }}>
                    {result.content_type}
                  </span>
                  <span style={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#10B981'
                  }}>
                    {(result.similarity * 100).toFixed(1)}% похожесть
                  </span>
                </div>
                
                <p style={{ 
                  fontSize: '1rem',
                  color: '#334155',
                  lineHeight: '1.6',
                  marginBottom: '0.5rem'
                }}>
                  {result.text}
                </p>
                
                {result.metadata && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    ID: {result.content_id}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
