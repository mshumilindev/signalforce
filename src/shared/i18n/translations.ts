import {
  dashboardCopyEn,
  dashboardCopyPl,
  dashboardCopyUk,
} from '@/shared/i18n/dashboardCopy';
import {
  digestsCopyEn,
  digestsCopyPl,
  digestsCopyUk,
} from '@/shared/i18n/digestsCopy';
import {
  preferencesCopyEn,
  preferencesCopyPl,
  preferencesCopyUk,
} from '@/shared/i18n/preferencesCopy';
import { savedCopyEn, savedCopyPl, savedCopyUk } from '@/shared/i18n/savedCopy';

export const supportedLanguages = ['en', 'pl', 'uk'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

const en = {
  auth: {
    loading: 'Checking your session…',
    signInWithGoogle: 'Continue with Google',
    signOut: 'Sign out',
    errors: {
      config: 'Firebase is not configured. Add VITE_FIREBASE_* values to your environment.',
      popupClosed: 'Sign-in was cancelled. Try again when you are ready.',
      profilePermission:
        'Your Google sign-in worked, but Firestore blocked saving your profile. Deploy firestore.rules to signalforge-msdev.',
      profileUnavailable:
        'Your profile could not be saved right now. Check your connection and try again.',
      unknown: 'Sign-in failed. Please try again.',
    },
  },
  appShell: {
    homeLabel: 'Go to dashboard',
    primaryNavigation: 'Primary navigation',
    productName: 'SignalForge',
  },
  language: {
    label: 'Language',
    en: 'English',
    pl: 'Polish',
    uk: 'Ukrainian',
  },
  routes: {
    login: 'Login',
    dashboard: 'Dashboard',
    digests: 'Digests',
    digestDetail: 'Digest detail',
    settings: 'Settings',
    saved: 'Saved',
    terms: 'Terms',
  },
  pages: {
    login: {
      eyebrow: 'Access',
      title: 'Sign in to SignalForge',
      description: 'Use your Google account to access your private engineering digest workspace.',
    },
    dashboard: {
      eyebrow: 'Command center',
      title: 'Your strategic engineering digest',
      description:
        'Monitor digest freshness, refresh in place, or explicitly start a new digest cycle.',
    },
    digests: {
      eyebrow: 'Archive',
      title: 'Digest history',
      description: 'Browse active, superseded, and expired digests from newest to oldest.',
    },
    digestDetail: {
      eyebrow: 'Digest',
      title: 'Digest detail',
      description: 'Read the full digest and save individual source items for later.',
    },
    settings: {
      eyebrow: 'Preferences',
      title: 'Settings',
      description: 'Update language, focus areas, tone, and digest cadence.',
    },
    saved: {
      eyebrow: 'Library',
      title: 'Saved items',
      description: 'Your saved signals from across digests, ready to revisit any time.',
    },
    terms: {
      eyebrow: 'Learning',
      title: 'Terms',
      description: 'Term explanations will be introduced through backend-generated digests.',
    },
  },
  preferences: preferencesCopyEn,
  dashboard: dashboardCopyEn,
  digests: digestsCopyEn,
  saved: savedCopyEn,
} as const;

type WidenStrings<TValue> = TValue extends string
  ? string
  : { readonly [TKey in keyof TValue]: WidenStrings<TValue[TKey]> };

type TranslationTree = WidenStrings<typeof en>;

const pl: TranslationTree = {
  auth: {
    loading: 'Sprawdzanie sesji…',
    signInWithGoogle: 'Kontynuuj przez Google',
    signOut: 'Wyloguj',
    errors: {
      config: 'Firebase nie jest skonfigurowany. Dodaj wartosci VITE_FIREBASE_* do srodowiska.',
      popupClosed: 'Logowanie zostalo anulowane. Sprobuj ponownie, gdy bedziesz gotowy.',
      profilePermission:
        'Logowanie Google dziala, ale Firestore zablokowal zapis profilu. Wdróz firestore.rules do signalforge-msdev.',
      profileUnavailable:
        'Nie udalo sie zapisac profilu. Sprawdz polaczenie i sprobuj ponownie.',
      unknown: 'Logowanie nie powiodlo sie. Sprobuj ponownie.',
    },
  },
  appShell: {
    homeLabel: 'Przejdz do panelu',
    primaryNavigation: 'Nawigacja glowna',
    productName: 'SignalForge',
  },
  language: {
    label: 'Jezyk',
    en: 'Angielski',
    pl: 'Polski',
    uk: 'Ukrainski',
  },
  routes: {
    login: 'Logowanie',
    dashboard: 'Panel',
    digests: 'Digesty',
    digestDetail: 'Szczegoly digestu',
    settings: 'Ustawienia',
    saved: 'Zapisane',
    terms: 'Terminy',
  },
  pages: {
    login: {
      eyebrow: 'Dostep',
      title: 'Zaloguj sie do SignalForge',
      description: 'Uzyj konta Google, aby wejsc do prywatnej przestrzeni digestow inzynierskich.',
    },
    dashboard: {
      eyebrow: 'Centrum dowodzenia',
      title: 'Twoj strategiczny digest inzynierski',
      description:
        'Monitoruj swiezosc digestu, odswiezaj na miejscu lub jawnie rozpocznij nowy cykl digestu.',
    },
    digests: {
      eyebrow: 'Archiwum',
      title: 'Historia digestow',
      description: 'Historyczne digesty pojawia sie po wdrozeniu cyklu zycia.',
    },
    digestDetail: {
      eyebrow: 'Digest',
      title: 'Szczegoly digestu',
      description: 'Widok szczegolowy jest gotowy na przyszla tresc digestu.',
    },
    settings: {
      eyebrow: 'Preferencje',
      title: 'Ustawienia',
      description: 'Zmien jezyk, obszary, ton i rytm digestu w dowolnym momencie.',
    },
    saved: {
      eyebrow: 'Biblioteka',
      title: 'Zapisane elementy',
      description: 'Zapisane sygnaly pojawia sie po dodaniu elementow digestu.',
    },
    terms: {
      eyebrow: 'Nauka',
      title: 'Terminy',
      description: 'Wyjasnienia terminow pojawia sie w digestach generowanych przez backend.',
    },
  },
  preferences: preferencesCopyPl,
  dashboard: dashboardCopyPl,
  digests: digestsCopyPl,
  saved: savedCopyPl,
};

const uk: TranslationTree = {
  auth: {
    loading: 'Перевіряємо вашу сесію…',
    signInWithGoogle: 'Продовжити з Google',
    signOut: 'Вийти',
    errors: {
      config: 'Firebase не налаштовано. Додайте значення VITE_FIREBASE_* до середовища.',
      popupClosed: 'Вхід скасовано. Спробуйте ще раз, коли будете готові.',
      profilePermission:
        'Вхід через Google пройшов, але Firestore заблокував збереження профілю. Задеплойте firestore.rules у signalforge-msdev.',
      profileUnavailable:
        'Не вдалося зберегти профіль. Перевірте зʼєднання та спробуйте ще раз.',
      unknown: 'Не вдалося увійти. Спробуйте ще раз.',
    },
  },
  appShell: {
    homeLabel: 'Перейти до панелі',
    primaryNavigation: 'Основна навігація',
    productName: 'SignalForge',
  },
  language: {
    label: 'Мова',
    en: 'Англійська',
    pl: 'Польська',
    uk: 'Українська',
  },
  routes: {
    login: 'Вхід',
    dashboard: 'Панель',
    digests: 'Дайджести',
    digestDetail: 'Деталі дайджесту',
    settings: 'Налаштування',
    saved: 'Збережене',
    terms: 'Терміни',
  },
  pages: {
    login: {
      eyebrow: 'Доступ',
      title: 'Увійдіть у SignalForge',
      description: 'Увійдіть через Google, щоб отримати доступ до приватного робочого простору дайджестів.',
    },
    dashboard: {
      eyebrow: 'Центр керування',
      title: 'Ваш стратегічний інженерний дайджест',
      description:
        'Стежте за актуальністю дайджесту, оновлюйте на місці або явно починайте новий цикл.',
    },
    digests: {
      eyebrow: 'Архів',
      title: 'Історія дайджестів',
      description: 'Попередні дайджести зʼявляться після реалізації життєвого циклу.',
    },
    digestDetail: {
      eyebrow: 'Дайджест',
      title: 'Деталі дайджесту',
      description: 'Маршрут деталей готовий для майбутнього вмісту дайджесту.',
    },
    settings: {
      eyebrow: 'Уподобання',
      title: 'Налаштування',
      description: 'Змінюйте мову, фокус, тон і каденс дайджесту будь-коли.',
    },
    saved: {
      eyebrow: 'Бібліотека',
      title: 'Збережені елементи',
      description: 'Збережені сигнали зʼявляться після додавання елементів дайджесту.',
    },
    terms: {
      eyebrow: 'Навчання',
      title: 'Терміни',
      description: 'Пояснення термінів прийдуть через дайджести, згенеровані бекендом.',
    },
  },
  preferences: preferencesCopyUk,
  dashboard: dashboardCopyUk,
  digests: digestsCopyUk,
  saved: savedCopyUk,
};

export const resources = {
  en: { translation: en },
  pl: { translation: pl },
  uk: { translation: uk },
} as const satisfies Record<SupportedLanguage, { translation: TranslationTree }>;

type JoinKeys<TValue, TPrefix extends string = ''> = TValue extends string
  ? TPrefix
  : {
      [TKey in keyof TValue & string]: JoinKeys<
        TValue[TKey],
        TPrefix extends '' ? TKey : `${TPrefix}.${TKey}`
      >;
    }[keyof TValue & string];

export type TranslationKey = JoinKeys<TranslationTree>;
