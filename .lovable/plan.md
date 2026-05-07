## Цель

Привести «ВДрузьях» к уровню стабильной премиальной соц-платформы по строгому порядку: стабильность → скорость → UX → новое. Ничего не ломать.

Запрос огромный (11 блоков, ~12 страниц, мессенджер, админка, perf, AI, smoke-tests). Это многодневная работа на десятки итераций. Чтобы не превратить это в один гигантский «слепой» патч, который сломает уже работающие модули (а это явно противоречит вашему «главному правилу»), предлагаю разбить на чёткие фазы и идти по одной за раз с проверкой после каждой.

## Фазы

### Фаза 1 — Critical Stability Pass (1 итерация)
Прохожу руками все ключевые роуты в превью, ловлю белые экраны / ошибки в консоли, чиню только то, что реально падает. Никаких новых фич, никакого редизайна.
- /auth/login, /feed, /discover, /profile/:username, /messages, /messages/:id, /communities, /communities/:id, /events, /settings, /admin
- Для каждой проблемной страницы: error boundary + fallback + skeleton.
- Ремонт `ProtectedRoute` (убрать full-screen spinner → skeleton).
- Фикс известного варнинга `fetchPriority` в SmartImage.

### Фаза 2 — Messenger Hardening (1 итерация)
- Проверить открытие /messages и /messages/:id, отправку, persist после reload.
- Если что-то из premium-слоя (typing/virtuoso/read receipts) ломает базу — временно отключить этот слой за фича-флагом, оставить рабочий минимум.
- Добавить error boundary вокруг ChatWindow.

### Фаза 3 — Shell & Routing UX (1 итерация)
- Убедиться что AppLayout не пересоздаётся (уже layout route — проверить).
- Раскатать локальные skeleton'ы там, где остались full-screen loaders.
- Сохранение scroll/filters: добавить session-state там, где нужно (Feed, Communities, Events).
- Hover-prefetch на ссылки сообществ/событий (по аналогии с уже существующими prefetchProfile/prefetchConversation).

### Фаза 4 — Performance Core (1 итерация)
- Профилирование через browser--performance_profile.
- React.memo для тяжёлых карточек (UserCard, PostCard, CommunityCard, EventCard, ConversationItem).
- Дедуп запросов через react-query staleTime/gcTime, проверить дубли подписок realtime.
- SmartImage везде, где ещё <img>.
- Виртуализация длинных списков (Communities, Events, Feed) — через ту же библиотеку, что уже используется в мессенджере.

### Фаза 5 — UI Polish Pass (1 итерация)
- Аватары, бейджи, dropdown, modal, mobile-элементы.
- Только косметика, без логики.

### Фаза 6 — Internal Pages Upgrade (1 итерация на страницу)
Discover, Profile, Communities, Events, Feed, Messages, Settings, Admin — поштучно: empty/loading/error states, карточки, CTA.

### Фаза 7 — Communities Evolution (1 итерация)
Страница сообщества: участники, посты, события, рекомендации.

### Фаза 8 — Admin Upgrade (1 итерация)
Проверить root admin доступ, действия (бан, открыть профиль, модерация). Только если что-то реально не работает.

### Фаза 9 — AI Only Where Useful (точечно)
Включить AI-блоки там, где они дают ценность, без шума.

### Фаза 10 — Smoke Test + отчёт
Прохожу сценарии и пишу финальный отчёт: что было сломано, что починено, что осталось.

## Что я предлагаю сделать прямо сейчас

Стартую с **Фазы 1 — Critical Stability Pass**. Это самый критичный пункт вашего ТЗ («сначала стабильность»), и без него любой premium/AI-апгрейд бессмыслен. После Фазы 1 даю короткий отчёт и продолжаем по фазам.

Если согласны — подтвердите, и я начну. Если хотите начать с другой фазы (например, сразу Messenger или Performance) — скажите.
