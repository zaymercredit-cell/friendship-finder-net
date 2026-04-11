// Mock data for the ВДрузьях social network

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  city: string;
  age?: number;
  gender?: "male" | "female";
  interests: string[];
  about: string;
  lookingFor?: string[];
  communicationGoals?: string[];
  lookingForGender?: string;
  friendsCount: number;
  followersCount: number;
  postsCount: number;
  communitiesCount: number;
  isOnline: boolean;
  lastSeen?: string;
  lookingForCompany?: boolean;
  mutualFriends?: number;
  mutualInterests?: string[];
  readyForMeetings?: boolean;
  readyForChat?: boolean;
  showInDiscover?: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  images?: string[];
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  visibility: "all" | "friends" | "private";
}

export interface Message {
  id: string;
  from: User;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  cover: string;
  membersCount: number;
  postsCount: number;
  tags: string[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  city: string;
  tags: string[];
  attendees: number;
  isGoing: boolean;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "friend_request" | "friend_accept" | "message_request" | "event" | "match" | "sympathy";
  user: User;
  text: string;
  time: string;
  read: boolean;
}

export interface DiscoverMatch {
  id: string;
  user: User;
  matchScore: number;
  matchedAt: string;
  hasNewMessage: boolean;
}

// Professional realistic avatar photos
const maleAvatars = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1480429370612-2cd363cd8e55?w=200&h=200&fit=crop&crop=face",
];

const femaleAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&h=200&fit=crop&crop=face",
];

export const currentUser: User = {
  id: "me",
  name: "Алексей Иванов",
  username: "alexivanov",
  avatar: maleAvatars[0],
  city: "Москва",
  age: 32,
  gender: "male",
  interests: ["Путешествия", "Фотография", "Спорт", "Кино", "Музыка"],
  about: "Люблю путешествовать, фотографировать и открывать новое. Всегда рад новым знакомствам!",
  lookingFor: ["общение", "дружба", "компания для активности"],
  communicationGoals: ["общение", "дружба", "компания для активности"],
  lookingForGender: "female",
  friendsCount: 234,
  followersCount: 567,
  postsCount: 89,
  communitiesCount: 12,
  isOnline: true,
  readyForMeetings: true,
  readyForChat: true,
  showInDiscover: true,
};

const maleNames = [
  "Дмитрий Козлов", "Сергей Волков", "Андрей Морозов", "Максим Лебедев",
  "Иван Соколов", "Артём Попов", "Николай Новиков", "Павел Фёдоров",
  "Михаил Орлов", "Кирилл Зайцев", "Роман Белов", "Егор Комаров",
  "Владислав Павлов", "Даниил Семёнов", "Глеб Голубев", "Тимур Виноградов",
  "Алексей Богданов", "Матвей Воронов", "Илья Михайлов", "Денис Жуков",
  "Степан Баранов", "Олег Крылов", "Виктор Макаров", "Константин Степанов",
  "Александр Кириллов", "Юрий Васильев", "Антон Петров", "Марк Савельев",
];

const femaleNames = [
  "Мария Петрова", "Анна Смирнова", "Елена Новикова", "Ольга Кузнецова",
  "Екатерина Соколова", "Наталья Лебедева", "Ирина Козлова", "Татьяна Морозова",
  "Светлана Попова", "Юлия Волкова", "Алина Фёдорова", "Дарья Орлова",
  "Виктория Зайцева", "Полина Белова", "Кристина Комарова", "Александра Павлова",
  "Анастасия Семёнова", "Валерия Голубева", "Марина Виноградова", "София Богданова",
  "Вероника Воронова", "Диана Михайлова", "Ксения Жукова", "Арина Баранова",
  "Алиса Крылова", "Маргарита Макарова", "Евгения Соловьёва", "Карина Романова",
];

const russianCities = [
  "Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург",
  "Нижний Новгород", "Сочи", "Краснодар", "Самара", "Ростов-на-Дону",
  "Воронеж", "Красноярск", "Пермь", "Волгоград", "Тюмень",
];

const allAbouts = [
  "Люблю активный отдых и новые знакомства. Открыт к общению и совместным приключениям.",
  "Ценю хорошую компанию и интересные разговоры. Ищу единомышленников для прогулок и путешествий.",
  "Открыта к новым впечатлениям и знакомствам. Люблю кофе, книги и вечерние прогулки по городу.",
  "Занимаюсь спортом, путешествую, читаю. Ищу людей с похожими интересами для общения.",
  "Ищу интересных людей для общения и дружбы. Увлекаюсь фотографией и дизайном.",
  "Творческая личность, люблю искусство и музыку. Играю на гитаре, рисую акварелью.",
  "Живу ярко, люблю путешествия и приключения. Мечтаю объехать всю Россию.",
  "Оптимист, люблю спорт и здоровый образ жизни. По утрам бегаю, вечерами готовлю.",
  "Работаю в IT, увлекаюсь фотографией и горным туризмом. Ищу компанию для походов.",
  "Люблю природу, горы и активный отдых. Каждые выходные стараюсь выбираться за город.",
  "Увлекаюсь кулинарией и виноделием. С удовольствием поделюсь рецептами и попробую ваши.",
  "Танцую сальсу и бачату. Ищу партнёра для танцев или просто хорошую компанию.",
  "Фрилансер, дизайнер. Работаю из кофеен, путешествую и коллекционирую впечатления.",
  "Люблю кино и театр. Всегда рада обсудить новый фильм за чашкой кофе.",
  "Серьёзно отношусь к жизни, но не забываю улыбаться. Ищу взаимное уважение и интерес.",
];

const _allInterests = [
  "Путешествия", "Фотография", "Спорт", "Кино", "Музыка", "Кулинария",
  "Йога", "IT", "Искусство", "Книги", "Горы", "Велоспорт", "Игры",
  "Танцы", "Наука", "Дизайн", "Языки", "Волонтёрство", "Театр",
  "Кофе", "Вино", "Бег", "Плавание", "Медитация",
];

const _communicationGoalOptions = ["общение", "дружба", "отношения", "совместные прогулки", "компания для мероприятий"];

function generateMockUsers(count: number): User[] {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const isFemale = i % 2 === 0;
    const names = isFemale ? femaleNames : maleNames;
    const avs = isFemale ? femaleAvatars : maleAvatars;
    const nameIdx = Math.floor(i / 2) % names.length;
    const name = names[nameIdx];
    const username = name.toLowerCase().replace(/[^a-zа-яё]/gi, '').slice(0, 8) + (i + 1);
    const age = 20 + (i % 30);
    const city = russianCities[i % russianCities.length];
    const numInterests = 3 + (i % 5);
    const startIdx = i % _allInterests.length;
    const interests = Array.from({ length: numInterests }, (_, j) => _allInterests[(startIdx + j) % _allInterests.length]);
    const goals = _communicationGoalOptions.slice(i % _communicationGoalOptions.length, (i % _communicationGoalOptions.length) + 2);

    users.push({
      id: String(i + 1),
      name,
      username,
      avatar: avs[i % avs.length],
      city,
      age,
      gender: isFemale ? "female" : "male",
      interests,
      about: allAbouts[i % allAbouts.length],
      lookingFor: goals,
      communicationGoals: goals,
      lookingForGender: isFemale ? "male" : "female",
      friendsCount: 50 + (i * 17) % 400,
      followersCount: 100 + (i * 23) % 1000,
      postsCount: 10 + (i * 7) % 200,
      communitiesCount: 2 + (i % 15),
      isOnline: i % 3 === 0,
      lastSeen: i % 3 === 1 ? "был(а) недавно" : i % 3 === 2 ? "был(а) вчера" : undefined,
      lookingForCompany: i % 4 === 0,
      mutualFriends: i % 15,
      mutualInterests: interests.slice(0, 2),
      readyForMeetings: i % 3 === 0,
      readyForChat: true,
      showInDiscover: i % 10 !== 0,
    });
  }
  return users;
}

export const mockUsers: User[] = generateMockUsers(120);

// Posts with realistic content
const postImages = [
  "https://images.unsplash.com/photo-1555862124-94036092ab14?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1578926288207-a90a0f9a3cbd?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop",
];

export const mockPosts: Post[] = [
  {
    id: "p1", author: mockUsers[0],
    content: "Сегодня прекрасный день для прогулки по набережной! 🌅 Питер удивительно красив осенью. Кто хочет присоединиться в следующий раз?",
    images: [postImages[0]],
    createdAt: "2 часа назад", likes: 42, comments: 8, shares: 3, isLiked: false, visibility: "all",
  },
  {
    id: "p2", author: mockUsers[1],
    content: "Закончил марафон! 42 км позади. Чувствую себя непобедимым 💪 Полгода подготовки того стоили.",
    images: [postImages[7]],
    createdAt: "5 часов назад", likes: 128, comments: 24, shares: 12, isLiked: true, visibility: "all",
  },
  {
    id: "p3", author: mockUsers[2],
    content: "Новая серия акварельных работ. Что думаете? Вдохновляюсь природой 🎨",
    images: [postImages[3], postImages[4]],
    createdAt: "Вчера", likes: 89, comments: 15, shares: 7, isLiked: false, visibility: "friends",
  },
  {
    id: "p4", author: mockUsers[4],
    content: "Рецепт дня: грузинский хачапури по-аджарски! Пошаговый процесс в фото 👨‍🍳",
    images: [postImages[5]],
    createdAt: "Вчера", likes: 215, comments: 43, shares: 28, isLiked: true, visibility: "all",
  },
  {
    id: "p5", author: mockUsers[6],
    content: "Только вернулся из Сочи. Горы, море, свежий воздух — лучший отдых! Кто ещё любит активные путешествия?",
    images: [postImages[1]],
    createdAt: "2 дня назад", likes: 76, comments: 12, shares: 5, isLiked: false, visibility: "all",
  },
  {
    id: "p6", author: mockUsers[8],
    content: "Сегодня впервые попробовал сёрфинг. Это невероятные ощущения! Всем рекомендую хотя бы раз попробовать 🏄‍♂️",
    images: [postImages[2]],
    createdAt: "3 дня назад", likes: 54, comments: 9, shares: 2, isLiked: false, visibility: "all",
  },
  {
    id: "p7", author: mockUsers[10],
    content: "Прочитала за выходные «Сто лет одиночества». Книга, которая меняет восприятие мира. Кто уже читал — делитесь впечатлениями!",
    createdAt: "3 дня назад", likes: 38, comments: 22, shares: 4, isLiked: false, visibility: "all",
  },
  {
    id: "p8", author: mockUsers[12],
    content: "Готовим ужин на компанию из 8 человек. Итальянская кухня — паста, брускетты и тирамису 🇮🇹",
    images: [postImages[6]],
    createdAt: "4 дня назад", likes: 92, comments: 18, shares: 6, isLiked: true, visibility: "all",
  },
];

export const mockMessages: Message[] = [
  { id: "m1", from: mockUsers[0], lastMessage: "Привет! Как дела? Давно не виделись", time: "14:32", unread: 2, isOnline: true },
  { id: "m2", from: mockUsers[1], lastMessage: "Спасибо за поздравления!", time: "12:15", unread: 0, isOnline: false },
  { id: "m3", from: mockUsers[2], lastMessage: "Посмотри мою новую выставку", time: "Вчера", unread: 1, isOnline: true },
  { id: "m4", from: mockUsers[4], lastMessage: "Рецепт отправила в файле", time: "Вчера", unread: 0, isOnline: true },
  { id: "m5", from: mockUsers[3], lastMessage: "Давай в поход в следующие выходные?", time: "2 дня", unread: 0, isOnline: false },
  { id: "m6", from: mockUsers[6], lastMessage: "Отличные фото из поездки!", time: "3 дня", unread: 0, isOnline: true },
  { id: "m7", from: mockUsers[8], lastMessage: "Когда следующая встреча?", time: "4 дня", unread: 0, isOnline: false },
  { id: "m8", from: mockUsers[10], lastMessage: "Рекомендую этот ресторан 👌", time: "5 дней", unread: 0, isOnline: false },
];

export const mockCommunities: Community[] = [
  { id: "c1", name: "Путешественники России", description: "Делимся впечатлениями о путешествиях по России и миру. Маршруты, советы, попутчики.", cover: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=300&fit=crop", membersCount: 12450, postsCount: 3456, tags: ["Путешествия", "Природа", "Фото"] },
  { id: "c2", name: "Спорт и фитнес", description: "Мотивация, тренировки и здоровый образ жизни для всех уровней подготовки", cover: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=300&fit=crop", membersCount: 8900, postsCount: 2100, tags: ["Спорт", "Фитнес", "Здоровье"] },
  { id: "c3", name: "Фотографы", description: "Сообщество фотографов: обсуждения, конкурсы, обмен опытом и вдохновение", cover: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=300&fit=crop", membersCount: 5600, postsCount: 8900, tags: ["Фотография", "Искусство"] },
  { id: "c4", name: "IT и технологии", description: "Обсуждаем технологии, делимся новостями и проектами. Нетворкинг для айтишников.", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop", membersCount: 15200, postsCount: 4500, tags: ["IT", "Технологии", "Разработка"] },
  { id: "c5", name: "Книжный клуб", description: "Обсуждаем книги, делимся рекомендациями, проводим онлайн-встречи", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=300&fit=crop", membersCount: 3200, postsCount: 1800, tags: ["Книги", "Литература"] },
  { id: "c6", name: "Кулинарная мастерская", description: "Рецепты, мастер-классы, совместные ужины. Для тех, кто любит готовить.", cover: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=300&fit=crop", membersCount: 7800, postsCount: 5200, tags: ["Кулинария", "Рецепты"] },
  { id: "c7", name: "Активный отдых", description: "Походы, сплавы, скалолазание. Находим компанию для приключений.", cover: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=300&fit=crop", membersCount: 4100, postsCount: 2300, tags: ["Горы", "Походы", "Природа"] },
  { id: "c8", name: "Музыканты", description: "Сообщество музыкантов: джемы, обмен опытом, поиск музыкантов в группу", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=300&fit=crop", membersCount: 2900, postsCount: 1200, tags: ["Музыка", "Творчество"] },
];

export const mockEvents: EventItem[] = [
  { id: "e1", title: "Утренняя пробежка в парке Горького", description: "Совместная пробежка 5 км. Все уровни подготовки приветствуются!", date: "10 марта 2026", time: "08:00", city: "Москва", tags: ["Спорт", "Бег"], attendees: 23, isGoing: false },
  { id: "e2", title: "Фотопрогулка по Невскому", description: "Гуляем по историческому центру, фотографируем архитектуру и друг друга", date: "12 марта 2026", time: "12:00", city: "Санкт-Петербург", tags: ["Фотография", "Прогулка"], attendees: 15, isGoing: true },
  { id: "e3", title: "Кулинарный мастер-класс: итальянская кухня", description: "Готовим пасту карбонара с нуля. Все ингредиенты включены в стоимость.", date: "14 марта 2026", time: "18:00", city: "Москва", tags: ["Кулинария", "Мастер-класс"], attendees: 12, isGoing: false },
  { id: "e4", title: "Настольные игры в антикафе", description: "Играем в настолки, знакомимся, общаемся. Отличный способ провести вечер!", date: "15 марта 2026", time: "16:00", city: "Казань", tags: ["Игры", "Общение"], attendees: 18, isGoing: false },
  { id: "e5", title: "Поход выходного дня", description: "Однодневный поход по ближайшему национальному парку. Маршрут 15 км.", date: "16 марта 2026", time: "09:00", city: "Екатеринбург", tags: ["Горы", "Походы"], attendees: 10, isGoing: false },
  { id: "e6", title: "Открытый микрофон: стендап-вечер", description: "Пробуем себя в стендапе или просто приходим послушать и посмеяться", date: "18 марта 2026", time: "19:00", city: "Москва", tags: ["Общение", "Юмор"], attendees: 35, isGoing: false },
  { id: "e7", title: "Yoga на крыше", description: "Утренняя йога-сессия с видом на город. Коврики предоставляются.", date: "20 марта 2026", time: "07:30", city: "Сочи", tags: ["Йога", "Здоровье"], attendees: 20, isGoing: false },
  { id: "e8", title: "Киновечер: обсуждение фильма", description: "Смотрим и обсуждаем новинки кино. Кофе и снеки включены.", date: "22 марта 2026", time: "19:00", city: "Новосибирск", tags: ["Кино", "Общение"], attendees: 14, isGoing: false },
];

export const mockNotifications: Notification[] = [
  { id: "n1", type: "sympathy", user: mockUsers[0], text: "поставила вам симпатию ❤️", time: "5 мин назад", read: false },
  { id: "n2", type: "match", user: mockUsers[5], text: "у вас взаимная симпатия! Начните общение", time: "15 мин назад", read: false },
  { id: "n3", type: "like", user: mockUsers[2], text: "оценила ваш пост", time: "30 мин назад", read: false },
  { id: "n4", type: "friend_request", user: mockUsers[3], text: "хочет добавить вас в друзья", time: "1 час назад", read: false },
  { id: "n5", type: "comment", user: mockUsers[4], text: "прокомментировала ваше фото", time: "3 часа назад", read: false },
  { id: "n6", type: "sympathy", user: mockUsers[8], text: "поставила вам симпатию ❤️", time: "4 часа назад", read: true },
  { id: "n7", type: "friend_accept", user: mockUsers[1], text: "принял вашу заявку в друзья", time: "Вчера", read: true },
  { id: "n8", type: "event", user: mockUsers[6], text: "приглашает вас на «Фотопрогулка по Невскому»", time: "Вчера", read: true },
  { id: "n9", type: "match", user: mockUsers[10], text: "у вас взаимная симпатия!", time: "2 дня назад", read: true },
  { id: "n10", type: "like", user: mockUsers[12], text: "оценил ваш пост", time: "3 дня назад", read: true },
];

// Generate mock matches
export const mockMatches: DiscoverMatch[] = mockUsers.slice(0, 40).filter((_, i) => i % 2 === 0).map((user, i) => ({
  id: `match-${i}`,
  user,
  matchScore: 60 + (i * 3) % 40,
  matchedAt: i < 3 ? "Сегодня" : i < 8 ? "Вчера" : i < 15 ? "На этой неделе" : "Ранее",
  hasNewMessage: i < 3,
}));

// Generate mock likes (200+)
export const mockLikes = Array.from({ length: 250 }, (_, i) => ({
  id: `like-${i}`,
  fromUserId: mockUsers[i % 120].id,
  toUserId: mockUsers[(i * 7 + 3) % 120].id,
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

export const allInterests = _allInterests;
export const communicationGoalOptions = _communicationGoalOptions;
export const lookingForOptions = ["общение", "дружба", "отношения", "компания для активности"];
export const genderOptions = [
  { value: "male", label: "Мужчина" },
  { value: "female", label: "Женщина" },
];
export const lookingForGenderOptions = [
  { value: "male", label: "Мужчин" },
  { value: "female", label: "Женщин" },
  { value: "any", label: "Неважно" },
];
export const cityModeOptions = [
  { value: "my_city", label: "Только мой город" },
  { value: "nearby", label: "Мой город и рядом" },
  { value: "all", label: "Вся Россия" },
];

export const cities = russianCities;

// Match scoring function
export function calculateMatchScore(currentUser: User, candidate: User): number {
  let score = 0;
  if (currentUser.city === candidate.city) score += 25;
  const commonInterests = currentUser.interests.filter(i => candidate.interests.includes(i));
  score += Math.min(20, commonInterests.length * 5);
  const commonGoals = (currentUser.communicationGoals || []).filter(g => (candidate.communicationGoals || []).includes(g));
  score += Math.min(20, commonGoals.length * 7);
  if (candidate.age) {
    const ageDiff = Math.abs((currentUser.age || 30) - candidate.age);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    else if (ageDiff <= 15) score += 5;
  }
  if (candidate.isOnline) score += 10;
  let completeness = 0;
  if (candidate.about) completeness += 2;
  if (candidate.avatar) completeness += 2;
  if (candidate.interests.length >= 3) completeness += 2;
  if (candidate.communicationGoals && candidate.communicationGoals.length > 0) completeness += 2;
  if (candidate.age) completeness += 2;
  score += Math.min(10, completeness);
  return Math.min(100, score);
}
