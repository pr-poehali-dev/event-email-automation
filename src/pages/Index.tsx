import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const API_URLS = {
  events: 'https://functions.poehali.dev/4a92f7e3-3ff9-4318-8cc4-42c5c3c013a7',
  templates: 'https://functions.poehali.dev/a9e49384-2582-40e1-878d-078fcb5d5f70',
  knowledge: 'https://functions.poehali.dev/8575e4c9-695e-4d25-bca9-656ef206c58e',
};

type Event = {
  id: number;
  name: string;
  status: string;
  description: string;
  next_send_date: string;
  open_rate: number;
  click_rate: number;
  subscribers_count: number;
};

type Template = {
  id: number;
  event_id: number;
  name: string;
  type: string;
  subject_template: string;
  cta_text: string;
  cta_color: string;
  slots: any[];
};

type KnowledgeEntry = {
  id: number;
  event_id: number;
  content_type: string;
  title: string;
  content: string;
  source: string;
};

const Index = () => {
  const [activeSection, setActiveSection] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
    loadTemplates();
    loadKnowledge();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(API_URLS.events);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(API_URLS.templates);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadKnowledge = async () => {
    try {
      const response = await fetch(API_URLS.knowledge);
      const data = await response.json();
      setKnowledge(data);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    }
  };

  const createEvent = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.events, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setEvents([data, ...events]);
      setDialogOpen(false);
      toast({
        title: 'Событие создано',
        description: 'Новое событие успешно добавлено в систему',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать событие',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.templates, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setTemplates([data, ...templates]);
      setDialogOpen(false);
      toast({
        title: 'Шаблон создан',
        description: 'Новый шаблон успешно добавлен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать шаблон',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createKnowledge = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.knowledge, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setKnowledge([data, ...knowledge]);
      setDialogOpen(false);
      toast({
        title: 'Контент добавлен',
        description: 'Запись добавлена в базу знаний',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить контент',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'events', label: 'События', icon: 'Calendar' },
    { id: 'templates', label: 'Шаблоны', icon: 'FileText' },
    { id: 'content', label: 'Контент', icon: 'BookOpen' },
    { id: 'campaigns', label: 'Рассылки', icon: 'Send' },
    { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
    { id: 'integrations', label: 'Интеграции', icon: 'Puzzle' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      case 'draft':
        return 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Активен',
      scheduled: 'Запланирован',
      draft: 'Черновик',
    };
    return labels[status] || status;
  };

  const renderEvents = () => (
    <div>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">События</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90 shadow-lg shadow-purple-500/25">
                <Icon name="Plus" size={18} className="mr-2" />
                Создать событие
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Новое событие</DialogTitle>
                <DialogDescription>
                  Создайте новое событие для автоматической генерации email-рассылок
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createEvent({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    status: formData.get('status'),
                  });
                }}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Название события</Label>
                  <Input id="name" name="name" placeholder="Например: Вебинар по продажам" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Краткое описание цели рассылки"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select name="status" defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="scheduled">Запланирован</SelectItem>
                      <SelectItem value="active">Активен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
                >
                  {loading ? 'Создание...' : 'Создать событие'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600">Управляйте вашими ивентами и настройками рассылок</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <Card
            key={event.id}
            className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-purple-300 overflow-hidden animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#BB35E0] transition-colors">
                    {event.name}
                  </h3>
                  <Badge className={getStatusColor(event.status)} variant="secondary">
                    {getStatusLabel(event.status)}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{event.description}</p>

              <div className="space-y-3 mb-4">
                {event.next_send_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Icon name="Calendar" size={16} className="text-purple-500" />
                      Следующая отправка
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(event.next_send_date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Icon name="Users" size={16} className="text-purple-500" />
                    Подписчиков
                  </span>
                  <span className="font-medium text-gray-900">{event.subscribers_count.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Открытия</div>
                  <div className="text-xl font-bold text-[#BB35E0]">{event.open_rate}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Клики</div>
                  <div className="text-xl font-bold text-[#8B5CF6]">{event.click_rate}%</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Редактировать
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить
                </Button>
              </div>
            </div>

            <div className="h-1 bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Icon name="Inbox" size={32} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет событий</h3>
          <p className="text-gray-600 mb-6">Создайте первое событие для начала работы</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Создать событие
          </Button>
        </Card>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">Шаблоны</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90 shadow-lg shadow-purple-500/25">
                <Icon name="Plus" size={18} className="mr-2" />
                Создать шаблон
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Новый шаблон</DialogTitle>
                <DialogDescription>
                  Настройте HTML-шаблон для автоматической генерации писем
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createTemplate({
                    event_id: events[0]?.id || null,
                    name: formData.get('name'),
                    type: formData.get('type'),
                    subject_template: formData.get('subject_template'),
                    html_content: formData.get('html_content'),
                    cta_text: formData.get('cta_text'),
                    cta_color: '#BB35E0',
                  });
                }}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="template-name">Название шаблона</Label>
                  <Input id="template-name" name="name" placeholder="Например: Приглашение" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-type">Тип контента</Label>
                  <Select name="type" defaultValue="invitation">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invitation">Приглашение</SelectItem>
                      <SelectItem value="reminder">Напоминание</SelectItem>
                      <SelectItem value="announcement">Анонс</SelectItem>
                      <SelectItem value="followup">Дополнение</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Тема письма (шаблон)</Label>
                  <Input
                    id="subject"
                    name="subject_template"
                    placeholder="Например: Приглашение на {{event_name}}"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta">Текст кнопки CTA</Label>
                  <Input id="cta" name="cta_text" placeholder="Например: Зарегистрироваться" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="html">HTML контент</Label>
                  <Textarea
                    id="html"
                    name="html_content"
                    placeholder="<html><body>{{content}}</body></html>"
                    rows={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
                >
                  {loading ? 'Создание...' : 'Создать шаблон'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600">Управляйте HTML-шаблонами для разных типов писем</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template, index) => (
          <Card
            key={template.id}
            className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-purple-300 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <Badge className="bg-purple-500/10 text-purple-600" variant="secondary">
                    {template.type}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <span className="text-gray-600">Тема:</span>
                  <p className="font-medium text-gray-900 mt-1">{template.subject_template}</p>
                </div>
                {template.cta_text && (
                  <div className="text-sm">
                    <span className="text-gray-600">CTA кнопка:</span>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        style={{ backgroundColor: template.cta_color }}
                        className="pointer-events-none"
                      >
                        {template.cta_text}
                      </Button>
                    </div>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-gray-600">Слотов контента:</span>
                  <span className="font-medium text-gray-900 ml-2">{template.slots?.length || 0}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                <Icon name="Edit" size={16} className="mr-2" />
                Редактировать шаблон
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Icon name="FileText" size={32} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет шаблонов</h3>
          <p className="text-gray-600 mb-6">Создайте первый шаблон для генерации писем</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Создать шаблон
          </Button>
        </Card>
      )}
    </div>
  );

  const renderContent = () => (
    <div>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">База знаний</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90 shadow-lg shadow-purple-500/25">
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить контент
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Новая запись</DialogTitle>
                <DialogDescription>
                  Добавьте контент в базу знаний для использования AI при генерации писем
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createKnowledge({
                    event_id: events[0]?.id || null,
                    content_type: formData.get('content_type'),
                    title: formData.get('title'),
                    content: formData.get('content'),
                    source: formData.get('source'),
                  });
                }}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="content-type">Тип контента</Label>
                  <Select name="content_type" defaultValue="pain_points">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pain_points">Боли аудитории</SelectItem>
                      <SelectItem value="program">Программа события</SelectItem>
                      <SelectItem value="content_plan">Контент-план</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="benefits">Преимущества</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kb-title">Заголовок</Label>
                  <Input id="kb-title" name="title" placeholder="Например: Основные боли аудитории" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kb-content">Контент</Label>
                  <Textarea id="kb-content" name="content" placeholder="Подробное описание..." rows={6} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Источник</Label>
                  <Input id="source" name="source" placeholder="Google Docs, Sheets, интервью..." />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
                >
                  {loading ? 'Добавление...' : 'Добавить в базу'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600">Контент-планы, боли аудитории и программы для AI</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="pain_points">Боли</TabsTrigger>
          <TabsTrigger value="program">Программа</TabsTrigger>
          <TabsTrigger value="content_plan">Контент-план</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {knowledge.map((entry, index) => (
            <Card
              key={entry.id}
              className="group hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                      <Badge className="bg-blue-500/10 text-blue-600" variant="secondary">
                        {entry.content_type}
                      </Badge>
                    </div>
                    {entry.source && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Icon name="Link" size={12} />
                        {entry.source}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Icon name="MoreVertical" size={18} />
                  </Button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{entry.content}</p>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {knowledge.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Icon name="BookOpen" size={32} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">База знаний пуста</h3>
          <p className="text-gray-600 mb-6">Добавьте контент для обучения AI</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить контент
          </Button>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="flex h-screen">
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BB35E0] to-[#8B5CF6] flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EmailFlow AI</h1>
                <p className="text-xs text-gray-500">Автоматизация рассылок</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#BB35E0] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <Icon name="Zap" size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Upgrade to Pro</h3>
                  <p className="text-xs text-gray-600 mb-3">Безлимит рассылок и AI-генерация</p>
                  <Button size="sm" className="w-full bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90">
                    Обновить
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {activeSection === 'events' && renderEvents()}
            {activeSection === 'templates' && renderTemplates()}
            {activeSection === 'content' && renderContent()}
            {!['events', 'templates', 'content'].includes(activeSection) && (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Icon name="Construction" size={32} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">В разработке</h3>
                <p className="text-gray-600">Этот раздел скоро будет доступен</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
