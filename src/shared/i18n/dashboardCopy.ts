export const dashboardCopyEn = {
  description:
    'Monitor digest freshness, refresh in place, or explicitly start a new digest cycle.',
  states: {
    loading: 'Loading your latest digest…',
    emptyTitle: 'No digest yet',
    emptyDescription:
      'Run a refresh to create your first digest shell, or force a new digest when you are ready to reset cadence.',
    errorTitle: 'Dashboard unavailable',
    errorRetry: 'Try again',
  },
  actions: {
    refresh: 'Refresh digest',
    refreshing: 'Refreshing…',
    forceUpdate: 'Generate new digest now',
    forcing: 'Generating…',
  },
  forceUpdateConfirm: {
    title: 'Start a new digest cycle?',
    description:
      'Your current digest will be marked superseded, cadence will reset from today, and a new digest will be generated from fresh sources.',
    confirm: 'Generate new digest',
    cancel: 'Keep current digest',
  },
  card: {
    title: 'Latest digest',
    viewDigest: 'Open digest',
    period: 'Coverage period',
    lastRefreshed: 'Last refreshed',
    nextDue: 'Next digest scheduled',
    signals: 'Signals captured',
    itemCount: '{{count}}',
    emptySummary:
      'Digest shell is ready. Summaries and signals will appear once the source pipeline is connected.',
  },
  freshness: {
    active: 'Active period',
    expired: 'Expired',
    expiredHint: 'This digest period has ended. Refresh or generate a new digest.',
  },
  shortcuts: {
    title: 'Shortcuts',
  },
  term: {
    eyebrow: 'Term',
    title: 'Term of the day',
    empty: 'The next generated digest will include a term of the day.',
  },
  errors: {
    loadFailed: 'We could not load your dashboard. Check your connection and try again.',
    actionFailed: 'Digest action failed. Try again in a moment.',
    preferencesRequired: 'Save your preferences in Settings before running digest actions.',
    unauthenticated: 'Sign in again to run digest actions.',
    preconditionFailed: 'This digest action cannot run in the current state.',
    permissionDenied: 'You do not have permission to run this digest action.',
    noSourceItems:
      'No signals matched your focus areas. Add interests in Settings or try again later.',
    openAiNotConfigured: 'Digest generation is not configured on the server. Contact support.',
  },
  feedback: {
    refreshed: 'Digest refreshed in place.',
    forced: 'New digest generated and cadence reset.',
    created: 'Your first digest shell is ready.',
  },
} as const;

export const dashboardCopyPl = {
  description:
    'Monitoruj swiezosc digestu, odswiezaj na miejscu lub jawnie rozpocznij nowy cykl digestu.',
  states: {
    loading: 'Ladowanie najnowszego digestu…',
    emptyTitle: 'Brak digestu',
    emptyDescription:
      'Uruchom odswiezenie, aby utworzyc pierwszy szkielet digestu, lub wymus nowy digest, gdy chcesz zresetowac rytm.',
    errorTitle: 'Panel niedostepny',
    errorRetry: 'Sprobuj ponownie',
  },
  actions: {
    refresh: 'Odswiez digest',
    refreshing: 'Odswiezanie…',
    forceUpdate: 'Wygeneruj nowy digest',
    forcing: 'Generowanie…',
  },
  forceUpdateConfirm: {
    title: 'Rozpoczac nowy cykl digestu?',
    description:
      'Obecny digest zostanie oznaczony jako zastapiony, rytm zostanie zresetowany od dzisiaj, a nowy digest zostanie wygenerowany ze swiezych zrodel.',
    confirm: 'Wygeneruj nowy digest',
    cancel: 'Zostaw obecny digest',
  },
  card: {
    title: 'Najnowszy digest',
    viewDigest: 'Otworz digest',
    period: 'Okres pokrycia',
    lastRefreshed: 'Ostatnie odswiezenie',
    nextDue: 'Nastepny digest zaplanowany',
    signals: 'Przechwycone sygnaly',
    itemCount: '{{count}}',
    emptySummary:
      'Szkielet digestu jest gotowy. Podsumowania i sygnaly pojawia sie po podlaczeniu zrodel.',
  },
  freshness: {
    active: 'Aktywny okres',
    expired: 'Wygasly',
    expiredHint: 'Ten okres digestu zakonczyl sie. Odswiez lub wygeneruj nowy digest.',
  },
  shortcuts: {
    title: 'Skroty',
  },
  term: {
    eyebrow: 'Termin',
    title: 'Termin dnia',
    empty: 'Nastepny wygenerowany digest bedzie zawieral termin dnia.',
  },
  errors: {
    loadFailed: 'Nie udalo sie zaladowac panelu. Sprawdz polaczenie i sprobuj ponownie.',
    actionFailed: 'Akcja digestu nie powiodla sie. Sprobuj ponownie za chwile.',
    preferencesRequired: 'Zapisz preferencje w Ustawieniach przed uruchomieniem akcji digestu.',
    unauthenticated: 'Zaloguj sie ponownie, aby uruchomic akcje digestu.',
    preconditionFailed: 'Tej akcji digestu nie mozna wykonac w obecnym stanie.',
    permissionDenied: 'Nie masz uprawnien do wykonania tej akcji digestu.',
    noSourceItems:
      'Brak sygnalow dla wybranych obszarow. Dodaj zainteresowania w Ustawieniach lub sprobuj pozniej.',
    openAiNotConfigured: 'Generowanie digestu nie jest skonfigurowane na serwerze. Skontaktuj sie z supportem.',
  },
  feedback: {
    refreshed: 'Digest odswiezony na miejscu.',
    forced: 'Wygenerowano nowy digest i zresetowano rytm.',
    created: 'Pierwszy szkielet digestu jest gotowy.',
  },
} as const;

export const dashboardCopyUk = {
  description:
    'Стежте за актуальністю дайджесту, оновлюйте на місці або явно починайте новий цикл.',
  states: {
    loading: 'Завантажуємо ваш останній дайджест…',
    emptyTitle: 'Ще немає дайджесту',
    emptyDescription:
      'Запустіть оновлення, щоб створити перший каркас дайджесту, або примусово згенеруйте новий, коли потрібно скинути каденс.',
    errorTitle: 'Панель недоступна',
    errorRetry: 'Спробувати ще раз',
  },
  actions: {
    refresh: 'Оновити дайджест',
    refreshing: 'Оновлення…',
    forceUpdate: 'Згенерувати новий дайджест',
    forcing: 'Генерація…',
  },
  forceUpdateConfirm: {
    title: 'Почати новий цикл дайджесту?',
    description:
      'Поточний дайджест буде позначено як замінений, каденс скинеться з сьогодні, а новий дайджест згенерується зі свіжих джерел.',
    confirm: 'Згенерувати новий дайджест',
    cancel: 'Залишити поточний дайджест',
  },
  card: {
    title: 'Останній дайджест',
    viewDigest: 'Відкрити дайджест',
    period: 'Період покриття',
    lastRefreshed: 'Останнє оновлення',
    nextDue: 'Наступний дайджест заплановано',
    signals: 'Зафіксовані сигнали',
    itemCount: '{{count}}',
    emptySummary:
      'Каркас дайджесту готовий. Підсумки та сигнали зʼявляться після підключення джерел.',
  },
  freshness: {
    active: 'Активний період',
    expired: 'Протермінований',
    expiredHint: 'Цей період дайджесту завершився. Оновіть або згенеруйте новий дайджест.',
  },
  shortcuts: {
    title: 'Швидкі посилання',
  },
  term: {
    eyebrow: 'Термін',
    title: 'Термін дня',
    empty: 'Наступний згенерований дайджест міститиме термін дня.',
  },
  errors: {
    loadFailed: 'Не вдалося завантажити панель. Перевірте зʼєднання та спробуйте ще раз.',
    actionFailed: 'Дію з дайджестом не виконано. Спробуйте ще раз незабаром.',
    preferencesRequired: 'Збережіть уподобання в Налаштуваннях перед діями з дайджестом.',
    unauthenticated: 'Увійдіть знову, щоб виконати дії з дайджестом.',
    preconditionFailed: 'Цю дію з дайджестом неможливо виконати в поточному стані.',
    permissionDenied: 'У вас немає дозволу на виконання цієї дії з дайджестом.',
    noSourceItems:
      'Немає сигналів для ваших тем. Додайте інтереси в Налаштуваннях або спробуйте пізніше.',
    openAiNotConfigured: 'Генерацію дайджесту не налаштовано на сервері. Зверніться до підтримки.',
  },
  feedback: {
    refreshed: 'Дайджест оновлено на місці.',
    forced: 'Новий дайджест згенеровано, каденс скинуто.',
    created: 'Перший каркас дайджесту готовий.',
  },
} as const;
