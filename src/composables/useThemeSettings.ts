import { computed, ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppliedTheme = 'light' | 'dark' | 'amoled';

export type ThemeSettings = {
  mode: ThemeMode;
  amoled: boolean;
};

const THEME_STORAGE_KEY = 'polaris:theme';

const defaultSettings: ThemeSettings = {
  mode: 'dark',
  amoled: false,
};

const settings = ref<ThemeSettings>(loadThemeSettings());
const systemPrefersDark = ref<boolean>(getSystemPrefersDark());
let isListeningToSystemTheme = false;

const resolvedTheme = computed<AppliedTheme>(() => resolveAppliedTheme(settings.value, systemPrefersDark.value));
const isAmoledAvailable = computed(() => settings.value.mode === 'dark' || settings.value.mode === 'system');

function getSystemPrefersDark() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function loadThemeSettings(): ThemeSettings {
  if (typeof localStorage === 'undefined') {
    return { ...defaultSettings };
  }

  const storedSettings = localStorage.getItem(THEME_STORAGE_KEY);

  if (!storedSettings) {
    return { ...defaultSettings };
  }

  try {
    const parsedSettings = JSON.parse(storedSettings) as Partial<ThemeSettings>;
    const mode = parsedSettings.mode;

    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') {
      return { ...defaultSettings };
    }

    return {
      mode,
      amoled: mode === 'light' ? false : parsedSettings.amoled === true,
    };
  } catch {
    return { ...defaultSettings };
  }
}

function persistThemeSettings() {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings.value));
}

function resolveAppliedTheme(themeSettings: ThemeSettings, prefersDark: boolean): AppliedTheme {
  if (themeSettings.mode === 'light') {
    return 'light';
  }

  if (themeSettings.mode === 'dark') {
    return themeSettings.amoled ? 'amoled' : 'dark';
  }

  if (!prefersDark) {
    return 'light';
  }

  return themeSettings.amoled ? 'amoled' : 'dark';
}

export function applyThemeSettings() {
  document.documentElement.dataset.theme = resolvedTheme.value;
  document.documentElement.style.colorScheme = resolvedTheme.value === 'light' ? 'light' : 'dark';
}

export function initializeThemeSettings() {
  applyThemeSettings();

  if (typeof window === 'undefined' || isListeningToSystemTheme) {
    return;
  }

  isListeningToSystemTheme = true;

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    systemPrefersDark.value = event.matches;
    applyThemeSettings();
  });
}

export function useThemeSettings() {
  function updateMode(mode: ThemeMode) {
    settings.value = {
      mode,
      amoled: mode === 'light' ? false : settings.value.amoled,
    };

    persistThemeSettings();
    applyThemeSettings();
  }

  function updateAmoled(amoled: boolean) {
    settings.value = {
      ...settings.value,
      amoled: isAmoledAvailable.value ? amoled : false,
    };

    persistThemeSettings();
    applyThemeSettings();
  }

  return {
    settings,
    resolvedTheme,
    isAmoledAvailable,
    updateMode,
    updateAmoled,
  };
}
