-- Вставляем тестовое событие human24
INSERT INTO kb_events (event_id, name, site, landing, dates, location, venue, streams, contacts) 
VALUES (
  'human24', 
  'Human. Подбор Персонала', 
  'https://humanconf.ru',
  'https://humanconf.ru/education',
  '{"start": "2025-12-10", "end": "2025-12-11"}',
  'Москва',
  'Технопарк',
  '["HR Tech", "Onboarding", "Learning & Dev"]',
  '{"manager": "Ирина", "email": "tickets@potokconf.ru"}'
);

-- Вставляем контент для события
INSERT INTO kb_content (event_id, claims, subjects, preheaders, faq, cta_texts)
VALUES (
  'human24',
  '{"problem": "Каждый третий новичок уходит в первые 90 дней", "benefit": "Онбординг, который удерживает 8 из 10", "socialProof": "Кейсы ВкусВилл, Кворум, Атлас"}',
  '{"A": "Как адаптировать сотрудников за 30 дней", "B": "Новичок уходит через месяц? Как это исправить"}',
  '["Кейсы, как снизить отток новичков на 40%", "AI-траектории адаптации и симуляции для наставников"]',
  '[{"q": "Где проходит событие?", "a": "Москва, Технопарк"}, {"q": "Будет ли запись?", "a": "Да, доступ 12 месяцев"}]',
  '{"sales_via_pain": {"top": "Смотреть программу по онбордингу", "bottom": "Посмотреть программу"}, "reminder_d3": {"top": "Подробности и билеты", "bottom": "Успеть до роста цены"}}'
);

-- Вставляем спикеров
INSERT INTO kb_speakers (event_id, speaker_id, name, title, company, topic, bio, photo, links)
VALUES 
('human24', 'svetlana-boyko', 'Светлана Бойко', 'HRD IT', 'Кворум', 'Онбординг и эмоциональный интеллект', 'Эксперт по HR', 'https://potokconf.ru/speakers/svetlana.png', '{"linkedin": "https://linkedin.com/in/sboyko"}'),
('human24', 'anna-maslennikova', 'Анна Масленникова', 'L&D Director', 'Атлас', 'ИИ в обучении', 'Специалист по обучению', 'https://potokconf.ru/speakers/anna.png', '{"tg": "@amaslennikova"}');

-- Вставляем программу
INSERT INTO kb_program (event_id, days, sections, talks)
VALUES (
  'human24',
  '[{"id": "day1", "date": "2025-12-10", "label": "День 1"}, {"id": "day2", "date": "2025-12-11", "label": "День 2"}]',
  '[{"id": "onboarding", "title": "Онбординг", "dayId": "day1"}, {"id": "hr-tech", "title": "HR Tech", "dayId": "day2"}]',
  '[{"id": "t1", "title": "ИИ в обучении", "speakerId": "anna-maslennikova", "start": "11:00", "end": "11:30", "sectionId": "onboarding"}]'
);

-- Вставляем секции
INSERT INTO kb_sections (event_id, section_id, title, description, tags, day_id)
VALUES 
('human24', 'onboarding', 'Онбординг', 'Практики и кейсы адаптации новых сотрудников', '["адаптация", "вовлеченность"]', 'day1'),
('human24', 'hr-tech', 'HR Tech', 'Автоматизация и технологии в HR', '["AI", "автоматизация"]', 'day2');

-- Вставляем доклады
INSERT INTO kb_talks (event_id, talk_id, title, speaker_id, start_time, end_time, abstract, keywords, section_id)
VALUES 
('human24', 't1', 'ИИ в обучении', 'anna-maslennikova', '11:00', '11:30', 'Как построить индивидуальные траектории обучения с помощью ИИ', '["AI", "L&D"]', 'onboarding'),
('human24', 't2', 'Эмоциональный интеллект в онбординге', 'svetlana-boyko', '14:00', '14:45', 'Практики развития EQ у новых сотрудников', '["EQ", "адаптация"]', 'onboarding');

-- Вставляем билеты
INSERT INTO kb_tickets (event_id, plans, deadlines, promo)
VALUES (
  'human24',
  '[{"id": "standard", "name": "Стандарт", "price": 14900, "benefits": ["2 дня", "Видео"]}, {"id": "pro", "name": "PRO", "price": 24900, "benefits": ["2 дня", "Видео", "Workshop"]}]',
  '[{"label": "Ранняя цена", "until": "2025-10-01"}, {"label": "Основная цена", "until": "2025-12-01"}]',
  '{"code": "HUMAN10", "discountPercent": 10}'
);

-- Вставляем ассеты
INSERT INTO kb_assets (event_id, images, attachments)
VALUES (
  'human24',
  '{"hero": "https://potokconf.ru/assets/human_hero.png", "badge": "https://potokconf.ru/assets/human_badge.png"}',
  '[]'
);

-- Вставляем кампании
INSERT INTO kb_campaigns (event_id, campaign_type, subject_a, subject_b, preheader)
VALUES 
('human24', 'sales_via_pain', 'Как адаптировать сотрудников за 30 дней', 'Новичок уходит через месяц? Как это исправить', 'Кейсы, как снизить отток новичков на 40%'),
('human24', 'reminder_d3', 'До старта 3 дня', 'Осталось 3 дня до Human.Подбор', 'Что вы успеете посмотреть');