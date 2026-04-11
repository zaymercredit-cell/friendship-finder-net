import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Photo pools ──
const malePhotos = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face",
];
const femalePhotos = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face",
];

const cities = ["Москва","Санкт-Петербург","Казань","Новосибирск","Екатеринбург","Сочи","Краснодар","Самара","Ростов-на-Дону","Воронеж","Нижний Новгород","Уфа","Красноярск","Пермь","Челябинск","Калининград","Тюмень","Иркутск","Владивосток","Томск"];

const maleNames = ["Дмитрий","Сергей","Андрей","Максим","Иван","Артём","Николай","Павел","Михаил","Кирилл","Александр","Роман","Владимир","Алексей","Егор","Даниил","Илья","Тимур","Олег","Денис"];
const femaleNames = ["Мария","Анна","Елена","Ольга","Екатерина","Наталья","Ирина","Татьяна","Светлана","Юлия","Дарья","Алина","Валерия","Виктория","Полина","Ксения","Анастасия","Диана","Кристина","Марина"];
const lastM = ["Иванов","Петров","Сидоров","Козлов","Волков","Морозов","Лебедев","Соколов","Попов","Фёдоров","Новиков","Орлов","Андреев","Макаров","Николаев","Захаров","Борисов","Кузнецов","Смирнов","Васильев"];
const lastF = ["Иванова","Петрова","Сидорова","Козлова","Волкова","Морозова","Лебедева","Соколова","Попова","Фёдорова","Новикова","Орлова","Андреева","Макарова","Николаева","Захарова","Борисова","Кузнецова","Смирнова","Васильева"];

const interests = ["Путешествия","Фотография","Спорт","Кино","Музыка","Кулинария","Йога","IT","Искусство","Книги","Горы","Танцы","Наука","Дизайн","Бизнес","Автомобили","Мода","Природа","Волонтёрство","Игры"];
const goals = ["общение","дружба","отношения","совместные прогулки","компания для мероприятий"];

const abouts = [
  "Люблю активный отдых и новые знакомства. Каждые выходные стараюсь выбираться на природу 🏕",
  "Ценю хорошую компанию и интересные разговоры. Кофе — моя религия ☕",
  "Открыта к новым впечатлениям и знакомствам! Обожаю пробовать новые кухни мира 🍜",
  "Занимаюсь спортом, путешествую, читаю. Ищу единомышленников 💪",
  "Ищу интересных людей для общения и дружбы. Давайте знакомиться! 👋",
  "Работаю в IT, в свободное время — фотографирую. Покажу лучшие места города 📸",
  "Музыкант-любитель, играю на гитаре. Люблю живые концерты 🎸",
  "Обожаю кино и сериалы. Всегда готов обсудить последние новинки 🎬",
  "Фитнес-тренер. Помогу составить программу тренировок бесплатно 🏋️",
  "Начинающий предприниматель. Ищу людей с интересными идеями 💡",
  "Веган, йог, путешественник. Объехал 30 стран 🌍",
  "Художница. Рисую портреты и пейзажи. Могу нарисовать ваш портрет 🎨",
  "Программист по профессии, повар по призванию. Готовлю лучшую пасту в городе 🍝",
  "Танцую сальсу и бачату. Приходите на занятия — первое бесплатно 💃",
  "Люблю настольные игры и квесты. Собираю компании на выходные 🎲",
];

const postTexts = [
  "Потрясающий закат сегодня! 🌅 Кто ещё любит гулять вечером?",
  "Только что вернулась из путешествия по Грузии. Это было невероятно! 🇬🇪",
  "Кто хочет сходить на выставку современного искусства в эти выходные?",
  "Новый рецепт тирамису получился идеально! Делюсь секретом в комментариях 🍰",
  "Пробежал первый марафон! 42 км — это непередаваемые ощущения 🏃‍♂️",
  "Ищу компанию для похода в горы на следующей неделе. Кто со мной? ⛰️",
  "Посмотрел новый фильм Нолана. Это шедевр! Кто уже видел?",
  "Сегодня начал учить испанский. ¡Hola! Кто-нибудь говорит? 🇪🇸",
  "Открыл для себя новое кафе в центре. Лучший кофе в городе! ☕",
  "Закончил читать '1984' Оруэлла. Актуально как никогда. Что посоветуете почитать?",
  "Фотографировал ночной город. Делюсь лучшими кадрами 📸",
  "Кто играет в настольные игры? Организую вечер игр в субботу 🎲",
  "Сегодня был на потрясающем концерте! Живая музыка — это магия 🎵",
  "Готовлю домашнюю пиццу. Кто хочет рецепт теста? 🍕",
  "Нашёл идеальное место для пикника. Кто хочет присоединиться? 🧺",
  "Начал заниматься йогой. Чувствую себя совершенно другим человеком 🧘",
  "Кто ходил на новую выставку в Третьяковке? Стоит?",
  "Сделал первый прыжок с парашютом! Адреналин зашкаливает! 🪂",
  "Ищу партнёра для тенниса. Играю на среднем уровне 🎾",
  "Организую киновечер у себя дома. Будем смотреть классику. Кто придёт? 🎬",
  "Вернулся из Стамбула. Город-сказка! Готов делиться маршрутами ✈️",
  "Попробовал себя в керамике. Оказывается, это очень медитативно 🏺",
  "Ищу компанию для велопрогулки в воскресенье 🚴",
  "Сегодня приготовил рамен по японскому рецепту. Получилось как в ресторане! 🍜",
  "Кто знает хорошие курсы фотографии? Хочу научиться снимать профессионально",
  "Субботнее утро, кофе, книга и дождь за окном. Идеальный день ☔",
  "Записался на курсы скалолазания. Кто со мной? 🧗",
  "Нашёл потрясающий трек для бега. 10 км вдоль набережной — кайф! 🏃‍♀️",
  "Кто хочет попробовать новый ресторан грузинской кухни? 🍷",
  "Сегодня волонтёрил в приюте для животных. Столько счастья! 🐾",
];

const messageTexts = [
  "Привет! Как проходит день? 😊",
  "Привет! Увидел тебя в рекомендациях, решил написать",
  "Ты тоже любишь путешествия? Где была последний раз?",
  "Был в этом месте недавно, очень понравилось!",
  "Какие у тебя планы на выходные?",
  "Я тоже увлекаюсь фотографией! Какой камерой снимаешь?",
  "Спасибо за лайк! Расскажи о себе 😊",
  "Привет! Мы, кажется, из одного города. Давно здесь живёшь?",
  "Классные фотографии! Это ты снимал?",
  "Привет! Видел, что ты тоже любишь кино. Какой последний фильм понравился?",
  "Спасибо! Очень приятно 😊",
  "Да, давно хотел туда сходить. Может вместе?",
  "Хороший вкус в музыке! Была на каких-нибудь концертах в последнее время?",
  "Рада знакомству! Чем занимаешься?",
  "Кстати, там открылось новое место, слышал? Говорят, очень круто",
  "Отличная идея! Давай в субботу?",
  "Мне тоже нравится готовить. Какая кухня любимая?",
  "Ого, интересная работа! Расскажи подробнее",
  "Я тоже люблю настольные игры. В какие играешь?",
  "Здорово! Я тоже занимаюсь спортом по утрам 💪",
];

const meetupTitles = [
  "Утренняя пробежка в парке","Вечер настольных игр","Фото-прогулка по центру",
  "Кофе и знакомства","Киновечер: классика","Йога на свежем воздухе",
  "Велопрогулка вдоль набережной","Кулинарный мастер-класс","Книжный клуб",
  "Танцевальный вечер: сальса","Поход в горы","Пикник в парке",
  "Вечер поэзии","Спортивный турнир","Волонтёрская акция",
  "Арт-вечер: рисуем портреты","Дегустация кофе","Прогулка с собаками",
  "Квиз-вечер","Фестиваль уличной еды","Экскурсия по городу",
  "Вечеринка знакомств","Караоке-вечер","Мастер-класс по фотографии",
];

const communityNames = [
  {name:"Путешественники",cat:"travel",desc:"Делимся маршрутами, советами и впечатлениями из путешествий"},
  {name:"Киноманы",cat:"entertainment",desc:"Обсуждаем фильмы, сериалы и всё что связано с кино"},
  {name:"Спортивные",cat:"sport",desc:"Для тех кто ведёт активный образ жизни"},
  {name:"IT & Технологии",cat:"tech",desc:"Обсуждаем новости технологий и делимся опытом"},
  {name:"Фотографы",cat:"art",desc:"Учимся фотографировать и делимся работами"},
  {name:"Кулинары",cat:"food",desc:"Рецепты, секреты и кулинарные эксперименты"},
  {name:"Книжный клуб",cat:"education",desc:"Обсуждаем прочитанное и рекомендуем друг другу книги"},
  {name:"Музыканты",cat:"entertainment",desc:"Играем, слушаем и обсуждаем музыку"},
  {name:"Йога и медитация",cat:"health",desc:"Практики осознанности и здорового образа жизни"},
  {name:"Бизнес-нетворкинг",cat:"business",desc:"Полезные контакты и бизнес-идеи"},
  {name:"Танцевальный мир",cat:"art",desc:"Сальса, бачата, хип-хоп и другие направления"},
  {name:"Природа и походы",cat:"travel",desc:"Маршруты, снаряжение и компания для походов"},
  {name:"Дизайнеры",cat:"art",desc:"UI/UX, графический дизайн, иллюстрация"},
  {name:"Мода и стиль",cat:"lifestyle",desc:"Тренды, аутфиты и шоппинг"},
  {name:"Волонтёры",cat:"social",desc:"Помогаем тем, кто нуждается в помощи"},
  {name:"Автолюбители",cat:"auto",desc:"Машины, тюнинг, автопутешествия"},
  {name:"Геймеры",cat:"gaming",desc:"Игры, турниры, обсуждения"},
  {name:"Здоровое питание",cat:"health",desc:"Рецепты и советы по правильному питанию"},
  {name:"Предприниматели",cat:"business",desc:"Стартапы, идеи, инвестиции"},
  {name:"Родители",cat:"family",desc:"Воспитание, развитие, семейный досуг"},
];

const postImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop",
];

function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDate(daysBack: number) {
  return new Date(Date.now() - rand(0, daysBack * 24 * 60 * 60 * 1000)).toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { batch = 0, totalBatches = 10 } = await req.json().catch(() => ({}));
    const usersPerBatch = 50;
    const startIdx = batch * usersPerBatch;
    const endIdx = startIdx + usersPerBatch;
    const createdUserIds: string[] = [];

    // ── Create users ──
    for (let i = startIdx; i < endIdx; i++) {
      const isFemale = i % 2 === 0;
      const firstName = isFemale ? femaleNames[i % femaleNames.length] : maleNames[i % maleNames.length];
      const lastName = isFemale ? lastF[i % lastF.length] : lastM[i % lastM.length];
      const email = `demo${i + 1}@vdruzyah.local`;
      const username = `${firstName.toLowerCase().replace(/[ёа-я]/g, c => {
        const map: Record<string, string> = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
        return map[c] || c;
      })}_${i + 1}`;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email, password: "demo123456", email_confirm: true,
        user_metadata: { first_name: firstName, last_name: lastName, username },
      });

      if (authError) {
        const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1, page: 1 });
        // try to find by email in a targeted way
        const { data: profiles } = await supabase.from("profiles").select("user_id").eq("username", username).limit(1);
        if (profiles && profiles.length > 0) createdUserIds.push(profiles[0].user_id);
        continue;
      }

      const userId = authData.user!.id;
      createdUserIds.push(userId);

      const age = 20 + (i % 28);
      const city = cities[i % cities.length];
      const userInterests = pick(interests, rand(3, 7));
      const userGoals = pick(goals, rand(1, 3));
      const avatar = isFemale ? femalePhotos[i % femalePhotos.length] : malePhotos[i % malePhotos.length];

      const isVerified = i % 5 !== 4; // ~80% verified (200 out of 250 per 5 batches)
      await supabase.from("profiles").update({
        age, city,
        gender: isFemale ? "female" : "male",
        interests: userInterests,
        communication_goals: userGoals,
        looking_for_gender: isFemale ? "male" : "female",
        avatar_url: avatar,
        about: abouts[i % abouts.length],
        is_online: i % 4 === 0,
        ready_for_chat: true,
        ready_for_meetings: i % 3 === 0,
        show_in_discover: true,
        trust_score: isVerified ? rand(70, 98) : rand(30, 65),
        is_verified: isVerified,
      }).eq("user_id", userId);
    }

    // ── Bulk operations only on first batch with enough users ──
    if (createdUserIds.length < 2) {
      return new Response(JSON.stringify({ success: true, batch, users: createdUserIds.length, message: "Users created, run more batches for bulk data" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Posts (100 per batch) ──
    const postRows = [];
    for (let i = 0; i < 100; i++) {
      const authorId = createdUserIds[i % createdUserIds.length];
      const hasImage = Math.random() > 0.4;
      postRows.push({
        author_id: authorId,
        content: postTexts[i % postTexts.length],
        images: hasImage ? [postImages[i % postImages.length]] : [],
        likes_count: rand(0, 45),
        comments_count: rand(0, 15),
        shares_count: rand(0, 5),
        created_at: randomDate(14),
      });
    }
    // Insert in chunks of 50
    for (let c = 0; c < postRows.length; c += 50) {
      await supabase.from("posts").insert(postRows.slice(c, c + 50));
    }

    // ── Likes (200 per batch) ──
    const likeRows = [];
    const likeSet = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const from = createdUserIds[rand(0, createdUserIds.length - 1)];
      const to = createdUserIds[rand(0, createdUserIds.length - 1)];
      if (from === to) continue;
      const key = `${from}-${to}`;
      if (likeSet.has(key)) continue;
      likeSet.add(key);
      likeRows.push({ from_user_id: from, to_user_id: to, created_at: randomDate(7) });
    }
    for (let c = 0; c < likeRows.length; c += 50) {
      await supabase.from("likes").insert(likeRows.slice(c, c + 50));
    }

    // ── Profile views (300 per batch) ──
    const viewRows = [];
    for (let i = 0; i < 300; i++) {
      const viewer = createdUserIds[rand(0, createdUserIds.length - 1)];
      const profile = createdUserIds[rand(0, createdUserIds.length - 1)];
      if (viewer === profile) continue;
      viewRows.push({ viewer_id: viewer, profile_id: profile, created_at: randomDate(7) });
    }
    for (let c = 0; c < viewRows.length; c += 50) {
      await supabase.from("profile_views").insert(viewRows.slice(c, c + 50));
    }

    // ── Conversations & messages (20 per batch) ──
    let msgsCreated = 0;
    for (let i = 0; i < 20 && i * 2 + 1 < createdUserIds.length; i++) {
      const u1 = createdUserIds[i * 2];
      const u2 = createdUserIds[i * 2 + 1];
      const { data: conv } = await supabase.from("conversations").insert({}).select().single();
      if (!conv) continue;
      await supabase.from("conversation_participants").insert([
        { conversation_id: conv.id, user_id: u1 },
        { conversation_id: conv.id, user_id: u2 },
      ]);
      const msgCount = rand(3, 8);
      const msgs = [];
      for (let m = 0; m < msgCount; m++) {
        msgs.push({
          conversation_id: conv.id,
          sender_id: m % 2 === 0 ? u1 : u2,
          text: messageTexts[rand(0, messageTexts.length - 1)],
          created_at: new Date(Date.now() - (msgCount - m) * 3600000 * rand(1, 4)).toISOString(),
        });
      }
      await supabase.from("messages").insert(msgs);
      msgsCreated += msgs.length;
      await supabase.from("conversations").update({
        last_message_text: msgs[msgs.length - 1].text,
        last_message_at: msgs[msgs.length - 1].created_at,
      }).eq("id", conv.id);
    }

    // ── Reports (batch 0 only, 20 reports) ──
    if (batch === 0 && createdUserIds.length >= 4) {
      const reportReasons = ["spam", "fake", "scam", "abuse", "inappropriate"];
      const reportDescs = [
        "Рассылает одинаковые сообщения всем подряд",
        "Фотографии не настоящие, взяты из интернета",
        "Просит перевести деньги под разными предлогами",
        "Оскорбительное поведение в чате",
        "Неприемлемый контент в профиле",
      ];
      const reportRows = [];
      for (let r = 0; r < 20; r++) {
        const reporter = createdUserIds[r % createdUserIds.length];
        const reported = createdUserIds[(r + 2) % createdUserIds.length];
        if (reporter === reported) continue;
        reportRows.push({
          reporter_id: reporter,
          reported_user_id: reported,
          reason: reportReasons[r % reportReasons.length],
          description: reportDescs[r % reportDescs.length],
          status: r < 5 ? "reviewed" : "pending",
        });
      }
      await supabase.from("reports").insert(reportRows);
    }

    // ── Meetups (batch 0 only, 30 events) ──
    if (batch === 0) {
      const meetupRows = [];
      for (let i = 0; i < 30; i++) {
        const hostId = createdUserIds[i % createdUserIds.length];
        const startHours = rand(24, 720); // 1-30 days ahead
        meetupRows.push({
          host_user_id: hostId,
          title: meetupTitles[i % meetupTitles.length],
          description: `Приглашаем всех желающих! Будет интересно и весело. Регистрируйтесь!`,
          city: cities[i % cities.length],
          start_time: new Date(Date.now() + startHours * 3600000).toISOString(),
          max_participants: rand(5, 50),
          tags: pick(interests, rand(2, 4)),
        });
      }
      await supabase.from("meetups").insert(meetupRows);

      // ── Communities (batch 0 only, 20) ──
      for (const c of communityNames) {
        const creatorId = createdUserIds[rand(0, createdUserIds.length - 1)];
        const { data: comm } = await supabase.from("communities").insert({
          name: c.name,
          description: c.desc,
          category: c.cat,
          creator_id: creatorId,
          members_count: rand(5, 200),
        }).select().single();
        if (comm) {
          const memberIds = pick(createdUserIds, rand(3, 10));
          const members = memberIds.map(uid => ({ community_id: comm.id, user_id: uid }));
          await supabase.from("community_members").insert(members).then(() => {});
        }
      }
      // ── Reports (batch 0 only, ~25) ──
      const reportReasons = ["spam", "fake", "scam", "abuse", "inappropriate"];
      const reportDescriptions = [
        "Подозрительное поведение в чате",
        "Возможно фейковый профиль",
        "Просит деньги в личных сообщениях",
        "Оскорбительные сообщения",
        "Неподобающий контент в профиле",
        "Спам рассылка",
        "Угрозы в личных сообщениях",
        "Предлагает подозрительные схемы",
        "Некорректное поведение на мероприятии",
        "Публикация запрещённого контента"
      ];
      
      const reportRows = [];
      for (let i = 0; i < 25; i++) {
        const reporterIdx = rand(0, createdUserIds.length - 1);
        let reportedIdx = rand(0, createdUserIds.length - 1);
        while (reportedIdx === reporterIdx) reportedIdx = rand(0, createdUserIds.length - 1);
        
        reportRows.push({
          reporter_id: createdUserIds[reporterIdx],
          reported_user_id: createdUserIds[reportedIdx],
          reason: reportReasons[rand(0, reportReasons.length - 1)],
          description: reportDescriptions[rand(0, reportDescriptions.length - 1)],
          status: ["pending", "pending", "pending", "reviewed", "resolved"][rand(0, 4)],
          created_at: randomDate(30),
        });
      }
      await supabase.from("reports").insert(reportRows);

      // ── Safety Alerts ──
      const alertReasons = [
        "Массовая рассылка одинаковых сообщений",
        "Подозрительные ссылки в сообщениях",
        "Всплеск жалоб на пользователя",
        "Аномально высокая активность",
        "Возможный фейковый профиль",
        "Попытки вывести пользователей с платформы",
        "Подозрительные финансовые запросы",
        "Агрессивное поведение в чатах",
        "Профиль с подозрительными данными",
        "Множественные аккаунты с одного устройства",
      ];
      const alertPriorities = ["low", "low", "medium", "medium", "medium", "high", "high", "critical"];
      const alertTargetTypes = ["user", "user", "user", "message", "community", "event"];
      
      const alertRows = [];
      for (let i = 0; i < 30; i++) {
        const priority = alertPriorities[rand(0, alertPriorities.length - 1)];
        alertRows.push({
          target_type: alertTargetTypes[rand(0, alertTargetTypes.length - 1)],
          target_id: createdUserIds[rand(0, createdUserIds.length - 1)],
          reason: alertReasons[rand(0, alertReasons.length - 1)],
          priority,
          status: i < 20 ? "open" : ["reviewing", "resolved", "dismissed"][rand(0, 2)],
          details: {
            suggested_action: priority === "critical" ? "Немедленная блокировка" :
              priority === "high" ? "Временное ограничение" :
              priority === "medium" ? "Проверить вручную" : "Мониторинг",
            risk_factors: ["mass_messages", "suspicious_links", "new_account", "low_trust"].slice(0, rand(1, 3)),
          },
          created_at: randomDate(14),
        });
      }
      await supabase.from("safety_alerts").insert(alertRows);

      // ── Flagged Messages ──
      const flagReasons = ["spam_pattern", "suspicious_link", "scam_keywords", "abusive_language", "external_redirect"];
      const flagRiskLevels = ["low", "medium", "medium", "high", "critical"];
      const flaggedMsgRows = [];
      
      for (let i = 0; i < 40; i++) {
        flaggedMsgRows.push({
          message_id: createdUserIds[rand(0, createdUserIds.length - 1)], // Using user_id as placeholder
          reporter_id: rand(0, 1) === 0 ? null : createdUserIds[rand(0, createdUserIds.length - 1)],
          reason: flagReasons[rand(0, flagReasons.length - 1)],
          risk_level: flagRiskLevels[rand(0, flagRiskLevels.length - 1)],
          status: i < 30 ? "pending" : ["reviewed", "resolved", "dismissed"][rand(0, 2)],
          ai_analysis: {
            score: rand(15, 95),
            flags: ["spam_pattern", "suspicious_link", "mass_sending", "external_link"].slice(0, rand(1, 3)),
            message_preview: [
              "Привет! Перейди по ссылке...",
              "Срочно нужны деньги...",
              "Хочешь заработать без вложений?",
              "Напиши мне в телеграм...",
              "Привет красотка)) пиши в вотсап",
            ][rand(0, 4)],
          },
          created_at: randomDate(7),
        });
      }
      await supabase.from("flagged_messages").insert(flaggedMsgRows);

      // ── Update some profiles with risk scores ──
      const riskUpdates = [];
      for (let i = 0; i < Math.min(20, createdUserIds.length); i++) {
        const isHighRisk = i < 5;
        riskUpdates.push(
          supabase.from("profiles").update({
            risk_score: isHighRisk ? rand(50, 90) : rand(0, 30),
            ai_confidence_score: rand(60, 100),
            safety_flags: isHighRisk ? ["suspicious_activity", "multiple_reports"] : [],
          }).eq("user_id", createdUserIds[i])
        );
      }
      await Promise.all(riskUpdates);
    }

    return new Response(
      JSON.stringify({
        success: true,
        batch,
        users_created: createdUserIds.length,
        posts_created: postRows.length,
        likes_created: likeRows.length,
        views_created: viewRows.length,
        messages_created: msgsCreated,
        meetups_created: batch === 0 ? 30 : 0,
        communities_created: batch === 0 ? 20 : 0,
        reports_created: batch === 0 ? 25 : 0,
        safety_alerts_created: batch === 0 ? 30 : 0,
        flagged_messages_created: batch === 0 ? 40 : 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
