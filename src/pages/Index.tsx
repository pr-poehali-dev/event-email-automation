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
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URLS = {
  events: 'https://functions.poehali.dev/4a92f7e3-3ff9-4318-8cc4-42c5c3c013a7',
  templates: 'https://functions.poehali.dev/a9e49384-2582-40e1-878d-078fcb5d5f70',
  knowledge: 'https://functions.poehali.dev/8575e4c9-695e-4d25-bca9-656ef206c58e',
  contentTypes: 'https://functions.poehali.dev/0061ea7c-e756-4d4f-8741-3978293a72b9',
  generateEmail: 'https://functions.poehali.dev/58ca3cf9-ad8b-4d93-bac8-e5b596860864',
  analyzeTemplate: 'https://functions.poehali.dev/45e6f3f6-377e-4e0d-9350-09aa87d3e584',
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
  event_name: string;
  name: string;
  type: string;
  subject_template: string;
  cta_text: string;
  cta_color: string;
  content_type_id: number;
  content_type_name: string;
  html_content: string;
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

type ContentType = {
  id: number;
  name: string;
  description: string;
  icon: string;
  templates_count: number;
};

const Index = () => {
  const [activeSection, setActiveSection] = useState('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<{html: string; subject: string; variables: any} | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editableVariables, setEditableVariables] = useState<Record<string, string>>({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [templateHtml, setTemplateHtml] = useState('');
  const [analyzedVariables, setAnalyzedVariables] = useState<any[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
    loadTemplates();
    loadKnowledge();
    loadContentTypes();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(API_URLS.events);
      const data = await response.json();
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0].id);
      }
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

  const loadContentTypes = async () => {
    try {
      const response = await fetch(API_URLS.contentTypes);
      const data = await response.json();
      setContentTypes(data);
    } catch (error) {
      console.error('Failed to load content types:', error);
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
      setTemplateHtml('');
      setAnalyzedVariables([]);
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

  const createContentType = async (formData: any) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.contentTypes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setContentTypes([...contentTypes, data]);
      setDialogOpen(false);
      toast({
        title: 'Тип контента создан',
        description: 'Новый тип контента успешно добавлен',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать тип контента',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async (templateId: number) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.generateEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка генерации');
      }
      
      const data = await response.json();
      setGeneratedEmail({
        html: data.html_content,
        subject: data.subject,
        variables: data.variables_used,
      });
      setEditableVariables(data.variables_used);
      setPreviewDialogOpen(true);
      
      toast({
        title: 'Письмо сгенерировано! ✨',
        description: 'AI заполнил все переменные контентом из базы знаний',
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка генерации',
        description: error.message || 'Проверьте наличие контента в базе знаний',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVariableValue = (key: string, value: string) => {
    setEditableVariables(prev => ({ ...prev, [key]: value }));
  };

  const applyVariableChanges = () => {
    if (!generatedEmail) return;
    
    let updatedHtml = generatedEmail.html;
    Object.entries(editableVariables).forEach(([key, value]) => {
      const regex = new RegExp(generatedEmail.variables[key], 'g');
      updatedHtml = updatedHtml.replace(regex, value);
    });
    
    setGeneratedEmail({
      ...generatedEmail,
      html: updatedHtml,
      variables: editableVariables,
    });
    
    toast({
      title: 'Изменения применены',
      description: 'Письмо обновлено с новыми значениями',
    });
  };

  const analyzeHtmlTemplate = async (html: string) => {
    if (!html || html.length < 10) {
      toast({
        title: 'Ошибка',
        description: 'Введите HTML код шаблона',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URLS.analyzeTemplate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html_content: html }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка анализа');
      }
      
      const data = await response.json();
      setTemplateHtml(data.template_html);
      setAnalyzedVariables(data.variables);
      
      toast({
        title: 'Анализ завершён! ✨',
        description: `Найдено ${data.variables_count} переменных`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка анализа',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'events', label: 'События', icon: 'Calendar' },
    { id: 'content-types', label: 'Типы контента', icon: 'Layers' },
    { id: 'templates', label: 'Шаблоны', icon: 'FileText' },
    { id: 'content', label: 'База знаний', icon: 'BookOpen' },
    { id: 'campaigns', label: 'Рассылки', icon: 'Send' },
    { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
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
                  onClick={() => setSelectedEvent(event.id)}
                >
                  <Icon name="Eye" size={16} className="mr-2" />
                  Выбрать
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

  const renderContentTypes = () => (
    <div>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">Типы контента</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90 shadow-lg shadow-purple-500/25">
                <Icon name="Plus" size={18} className="mr-2" />
                Создать тип
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Новый тип контента</DialogTitle>
                <DialogDescription>
                  Создайте новый тип контента для классификации писем
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createContentType({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    icon: formData.get('icon'),
                  });
                }}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="ct-name">Название типа</Label>
                  <Input id="ct-name" name="name" placeholder="Например: promo_offer" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-description">Описание</Label>
                  <Textarea
                    id="ct-description"
                    name="description"
                    placeholder="Для чего используется этот тип"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-icon">Иконка</Label>
                  <Select name="icon" defaultValue="Mail">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mail">Mail</SelectItem>
                      <SelectItem value="Bell">Bell</SelectItem>
                      <SelectItem value="Megaphone">Megaphone</SelectItem>
                      <SelectItem value="MessageSquare">MessageSquare</SelectItem>
                      <SelectItem value="CheckCircle">CheckCircle</SelectItem>
                      <SelectItem value="Heart">Heart</SelectItem>
                      <SelectItem value="Gift">Gift</SelectItem>
                      <SelectItem value="Star">Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
                >
                  {loading ? 'Создание...' : 'Создать тип'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600">Типы контента определяют назначение и структуру писем</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentTypes.map((type, index) => (
          <Card
            key={type.id}
            className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-purple-300 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Icon name={type.icon} size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                <span className="text-gray-600">Шаблонов</span>
                <Badge className="bg-purple-500/10 text-purple-600">{type.templates_count}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {contentTypes.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Icon name="Layers" size={32} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет типов контента</h3>
          <p className="text-gray-600 mb-6">Создайте первый тип для классификации писем</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Создать тип
          </Button>
        </Card>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div>
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Шаблоны писем</h2>
            <p className="text-gray-600 mt-1">HTML-шаблоны с переменными для AI-генерации</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90 shadow-lg shadow-purple-500/25">
                <Icon name="Plus" size={18} className="mr-2" />
                Создать шаблон
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новый шаблон</DialogTitle>
                <DialogDescription>
                  Создайте HTML-шаблон с переменными вида {'{'}{'{'} variable {'}'}{'}'}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="manual" className="my-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Вручную</TabsTrigger>
                  <TabsTrigger value="auto">Автоматически</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual" className="space-y-3 pt-2">
                  <Alert className="border-blue-200 bg-blue-50">
                    <Icon name="Info" size={16} className="text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900 ml-2">
                      <strong>Вручную:</strong> Добавьте переменные в формате {'{'}{'{'} название {'}'}{'}'}. AI заполнит их из базы знаний.
                    </AlertDescription>
                  </Alert>
                  
                  <details className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-purple-600">
                      📋 Популярные переменные (нажмите чтобы раскрыть)
                    </summary>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} event_name {'}'}{'}'}</code>
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} event_date {'}'}{'}'}</code>
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} event_time {'}'}{'}'}</code>
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} location {'}'}{'}'}</code>
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} speaker_name {'}'}{'}'}</code>
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} topic {'}'}{'}'}</code>
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} description {'}'}{'}'}</code>
                        <code className="bg-white px-2 py-1 rounded border">{'{'}{'{'} benefits {'}'}{'}'}</code>
                      </div>
                    </div>
                  </details>
                </TabsContent>
                
                <TabsContent value="auto" className="space-y-2 pt-2">
                  <Alert className="border-purple-200 bg-purple-50">
                    <Icon name="Sparkles" size={16} className="text-purple-600" />
                    <AlertDescription className="text-sm text-purple-900 ml-2">
                      <strong>Автоматически:</strong> Вставьте готовый HTML — AI найдёт весь текст и заменит на переменные
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createTemplate({
                    event_id: selectedEvent,
                    content_type_id: formData.get('content_type_id'),
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
                  <Label>Событие</Label>
                  <Select
                    value={selectedEvent?.toString()}
                    onValueChange={(v) => setSelectedEvent(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите событие" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_type_id">Тип контента</Label>
                  <Select name="content_type_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Icon name={type.icon} size={16} />
                            {type.description}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-name">Название шаблона</Label>
                  <Input id="template-name" name="name" placeholder="Например: Приглашение v1" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-type">Ключ типа (slug)</Label>
                  <Input id="template-type" name="type" placeholder="Например: invitation_v1" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Тема письма</Label>
                  <Input
                    id="subject"
                    name="subject_template"
                    placeholder="Приглашение на {{'{'}{'{'}event_name{'}'}{'}'}"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta">Текст CTA кнопки</Label>
                  <Input id="cta" name="cta_text" placeholder="Зарегистрироваться" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="html">HTML контент</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const textarea = document.getElementById('html') as HTMLTextAreaElement;
                        if (textarea?.value) {
                          analyzeHtmlTemplate(textarea.value);
                        }
                      }}
                      disabled={loading}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Icon name="Sparkles" size={14} className="mr-2" />
                      {loading ? 'Анализ...' : 'Автоматически создать переменные'}
                    </Button>
                  </div>
                  <Textarea
                    id="html"
                    name="html_content"
                    value={templateHtml || undefined}
                    onChange={(e) => setTemplateHtml(e.target.value)}
                    placeholder="<h1>{{'{'}{'{'}event_name{'}'}{'}'}&#10;&#10;<p>{{'{'}{'{'}event_description{'}'}{'}'}</p>&#10;&#10;<a href='#' style='background:#BB35E0'>{{'{'}{'{'}cta_text{'}'}{'}'}</a>"
                    rows={10}
                    required
                    className="font-mono text-sm"
                  />
                  {analyzedVariables.length > 0 && (
                    <Alert className="border-green-200 bg-green-50">
                      <Icon name="CheckCircle" size={16} className="text-green-600" />
                      <AlertDescription className="text-sm text-green-900 ml-2">
                        Найдено переменных: {analyzedVariables.map(v => `{{${v.name}}}`).join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
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
      </div>

      <div className="grid grid-cols-1 gap-6">
        {templates.map((template, index) => (
          <Card
            key={template.id}
            className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-purple-300 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <Badge className="bg-purple-500/10 text-purple-600" variant="secondary">
                      {template.content_type_name || template.type}
                    </Badge>
                    <Badge className="bg-blue-500/10 text-blue-600" variant="secondary">
                      {template.event_name}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600 font-medium">Тема:</span>
                    <p className="text-gray-900 mt-1">{template.subject_template}</p>
                  </div>
                  {template.cta_text && (
                    <div className="text-sm">
                      <span className="text-gray-600 font-medium">CTA кнопка:</span>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          style={{ backgroundColor: template.cta_color }}
                          className="pointer-events-none text-white"
                        >
                          {template.cta_text}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-gray-600 font-medium">HTML превью:</span>
                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 max-h-32 overflow-y-auto">
                      <code className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                        {template.html_content?.substring(0, 200)}...
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-purple-200 bg-purple-50">
                <Icon name="Sparkles" size={16} className="text-purple-600" />
                <AlertDescription className="text-sm text-purple-900 ml-2">
                  AI заполнит все переменные из базы знаний события "{template.event_name}"
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Icon name="Edit" size={16} className="mr-2" />
                  Редактировать
                </Button>
                <Button 
                  onClick={() => generateEmail(template.id)}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90 text-white"
                >
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  {loading ? 'Генерация...' : 'Генерировать письмо'}
                </Button>
              </div>
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
          <p className="text-gray-600 mb-6">Создайте первый HTML-шаблон с переменными для AI</p>
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

  const renderContent = () => {
    const currentEvent = events.find((e) => e.id === selectedEvent);
    const eventKnowledge = knowledge.filter((k) => k.event_id === selectedEvent);

    return (
      <div>
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">База знаний</h2>
              <p className="text-gray-600 mt-1">
                {currentEvent ? `Контент для события: ${currentEvent.name}` : 'Выберите событие'}
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={!selectedEvent}
                  className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90 shadow-lg shadow-purple-500/25"
                >
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить контент
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Новая запись</DialogTitle>
                  <DialogDescription>
                    Добавьте контент для события: {currentEvent?.name}
                  </DialogDescription>
                </DialogHeader>
                <Alert className="border-purple-200 bg-purple-50 mb-4">
                  <Icon name="Lightbulb" size={16} className="text-purple-600" />
                  <AlertDescription className="text-sm text-purple-900 ml-2">
                    <strong>Совет:</strong> AI использует эти данные для заполнения переменных в шаблонах. 
                    Чем подробнее информация, тем качественнее письма!
                  </AlertDescription>
                </Alert>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    createKnowledge({
                      event_id: selectedEvent,
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
                        <SelectItem value="speakers">Спикеры</SelectItem>
                        <SelectItem value="benefits">Преимущества</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kb-title">Заголовок</Label>
                    <Input id="kb-title" name="title" placeholder="Например: Основные боли аудитории" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kb-content">Контент</Label>
                    <Textarea
                      id="kb-content"
                      name="content"
                      placeholder="Подробное описание..."
                      rows={6}
                      required
                    />
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

          {!selectedEvent && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Icon name="AlertCircle" size={16} className="text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-900 ml-2">
                Выберите событие в разделе "События", чтобы добавлять контент
              </AlertDescription>
            </Alert>
          )}
        </div>

        {selectedEvent && (
          <div className="space-y-4">
            {eventKnowledge.map((entry, index) => (
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
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>
              </Card>
            ))}

            {eventKnowledge.length === 0 && (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Icon name="BookOpen" size={32} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет контента для этого события</h3>
                <p className="text-gray-600 mb-6">Добавьте информацию для AI-генерации</p>
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
        )}
      </div>
    );
  };

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
            {activeSection === 'content-types' && renderContentTypes()}
            {activeSection === 'templates' && renderTemplates()}
            {activeSection === 'content' && renderContent()}
            {!['events', 'content-types', 'templates', 'content'].includes(activeSection) && (
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

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={24} className="text-purple-600" />
              Сгенерированное письмо
            </DialogTitle>
            <DialogDescription>
              AI заполнил переменные контентом из базы знаний
            </DialogDescription>
          </DialogHeader>

          {generatedEmail && (
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Тема письма:</Label>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-gray-900 font-medium">{generatedEmail.subject}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Заполненные переменные:</Label>
                  <Button
                    size="sm"
                    onClick={applyVariableChanges}
                    className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90"
                  >
                    <Icon name="Check" size={14} className="mr-2" />
                    Применить изменения
                  </Button>
                </div>
                <Alert className="border-blue-200 bg-blue-50">
                  <Icon name="Info" size={16} className="text-blue-600" />
                  <AlertDescription className="text-sm text-blue-900 ml-2">
                    Отредактируйте значения переменных и нажмите "Применить изменения" для обновления письма
                  </AlertDescription>
                </Alert>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  {Object.entries(editableVariables).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs font-mono text-purple-600">{'{{'}{key}{'}}'}</Label>
                      <Textarea
                        value={String(value)}
                        onChange={(e) => updateVariableValue(key, e.target.value)}
                        className="text-sm min-h-[60px]"
                        placeholder="Введите значение..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Превью письма:</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([generatedEmail.html], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'email.html';
                      a.click();
                    }}
                  >
                    <Icon name="Download" size={14} className="mr-2" />
                    Скачать HTML
                  </Button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={generatedEmail.html}
                    className="w-full h-96 bg-white"
                    sandbox="allow-same-origin"
                    title="Email Preview"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">HTML код:</Label>
                <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">{generatedEmail.html}</pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;