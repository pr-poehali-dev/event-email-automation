import { useState } from 'react';
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

type Event = {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'scheduled';
  description: string;
  nextSend: string;
  openRate: number;
  clickRate: number;
  subscribers: number;
};

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Вебинар по AI в маркетинге',
    status: 'active',
    description: 'Серия писем для привлечения участников на вебинар',
    nextSend: '2025-11-05',
    openRate: 42.5,
    clickRate: 18.3,
    subscribers: 1250,
  },
  {
    id: '2',
    name: 'Конференция SaaS Summit',
    status: 'scheduled',
    description: 'Анонс ежегодной конференции для SaaS-компаний',
    nextSend: '2025-11-10',
    openRate: 38.2,
    clickRate: 15.7,
    subscribers: 850,
  },
  {
    id: '3',
    name: 'Мастер-класс по продажам',
    status: 'draft',
    description: 'Приглашение на практический мастер-класс',
    nextSend: '2025-11-15',
    openRate: 0,
    clickRate: 0,
    subscribers: 0,
  },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('events');
  const [events] = useState<Event[]>(mockEvents);

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
    switch (status) {
      case 'active':
        return 'Активен';
      case 'scheduled':
        return 'Запланирован';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
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
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold text-gray-900">События</h2>
                <Dialog>
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
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Название события</Label>
                        <Input id="name" placeholder="Например: Вебинар по продажам" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                          id="description"
                          placeholder="Краткое описание цели рассылки"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Статус</Label>
                        <Select defaultValue="draft">
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
                      <Button className="w-full bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90">
                        Создать событие
                      </Button>
                    </div>
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
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Icon name="Calendar" size={16} className="text-purple-500" />
                          Следующая отправка
                        </span>
                        <span className="font-medium text-gray-900">
                          {new Date(event.nextSend).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Icon name="Users" size={16} className="text-purple-500" />
                          Подписчиков
                        </span>
                        <span className="font-medium text-gray-900">{event.subscribers.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Открытия</div>
                        <div className="text-xl font-bold text-[#BB35E0]">{event.openRate}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Клики</div>
                        <div className="text-xl font-bold text-[#8B5CF6]">{event.clickRate}%</div>
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
                <Button className="bg-gradient-to-r from-[#BB35E0] to-[#8B5CF6] hover:opacity-90">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать событие
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
