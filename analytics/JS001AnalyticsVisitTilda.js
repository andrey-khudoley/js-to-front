/*
  Пример настроек:

const AKhJS001Auth = {
  server: 'https://core.khudoley.pro:22327/visit/tilda',
  authKey: 'key',
  authValue: 'value',
};

const AKhJS001Control = {
  enable: false,
  debug: true,
};
*/

/**
 * Проверяет, существуют ли объекты конфигурации и выводит сообщения в случае их отсутствия.
 */
function AKhJS001CheckConfig() {
  if (typeof AKhJS001Auth === 'undefined') {
    console.error('AKh - js001: Конфигурация AKhJS001Auth не определена.');
    return false;
  }

  if (typeof AKhJS001Control === 'undefined') {
    console.error('AKh - js001: Конфигурация AKhJS001Control не определена.');
    return false;
  }

  return true;
}

/**
 * Выводит сообщение в консоль, если включен режим отладки.
 * @param {string} message Сообщение для логирования.
 * @param {boolean} isError Указывает, является ли сообщение ошибкой.
 */
function AKhJS001Log(message, isError = false) {
  if (AKhJS001Control && AKhJS001Control.debug) {
    const logFunction = isError ? console.error : console.log;
    logFunction(`AKh - js001: ${message}`);
  }
}

/**
 * Получает из куки или генерирует UUID,
 * сохраняет UUID в куки, если он не существует.
 * @returns {string} UUID пользователя.
 */
function AKhJS001GetOrCreateUUID() {
  // Пытаемся найти существующий UUID в куки
  const existingUUID = document.cookie.split('; ').find((row) => row.startsWith('akhUserUUID='));
  if (existingUUID) {
    const uuid = existingUUID.split('=')[1];
    AKhJS001Log(`Используется существующий UUID: ${uuid}`);
    return uuid;
  }

  // Функция для генерации шестнадцатеричного числа заданной длины
  const hex = (length) => Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  // Формируем UUID в соответствии со стандартом UUID v4
  const newUUID = `${hex(8)}-${hex(4)}-4${hex(3)}-${[8, 9, 'a', 'b'][Math.floor(Math.random() * 4)]}${hex(3)}-${hex(12)}`;

  // Сохраняем UUID в куки
  document.cookie = `akhUserUUID=${newUUID}; max-age=${30 * 24 * 60 * 60}; path=/`;
  AKhJS001Log(`Сгенерирован новый UUID: ${newUUID}`);
  return newUUID;
}

/**
 * Асинхронно получает IP-адрес пользователя через внешний API.
 * Возвращает `null` в случае неудачи или если время ожидания истекло.
 * @returns {Promise<string|null>} Промис. IP-адрес или `null`.
 */
async function AKhJS001FetchUserIP() {
  try {
    AKhJS001Log('Получение IP-адреса пользователя...');

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(), 10000);
    });

    const fetchPromise = fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => {
        AKhJS001Log(`IP-адрес пользователя: ${data.ip}`);
        return data.ip;
      });

    return await Promise.race([fetchPromise, timeoutPromise]) || null;
  } catch (error) {
    AKhJS001Log('Ошибка при получении IP', true, error);
    return null;
  }
}

/**
 * Асинхронно отправляет POST-запрос на указанный сервер с данными пользователя.
 * @param {string} url Адрес сервера.
 * @param {Object} data Данные для отправки.
 */
async function AKhJS001SendPostRequest(url, data) {
  try {
    AKhJS001Log(`Отправка POST-запроса на: ${url}`);
    AKhJS001Log(`Данные запроса: ${JSON.stringify(data)}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [AKhJS001Auth.authKey]: AKhJS001Auth.authValue,
      },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      AKhJS001Log(`Ответ сервера: ${JSON.stringify(result)}`);
    } else {
      const textResponse = await response.text();
      AKhJS001Log(`Ответ сервера (не JSON): ${textResponse}`);
    }
  } catch (error) {
    AKhJS001Log(`Ошибка при отправке POST-запроса: ${error}`, true);
  }
}

/**
 * Извлекает URL и параметры текущей страницы.
 * @returns {{url: string, params: Object}} Объект, содержащий URL и параметры страницы.
 */
function AKhJS001ExtractUrlAndParams() {
  const currentUrl = window.location.origin + window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams.entries());
  AKhJS001Log(`Текущий URL и параметры: ${currentUrl}, ${JSON.stringify(params)}`);

  return { url: currentUrl, params };
}

/**
 * Инициализирует скрипт после загрузки документа.
 */
async function AKhJS001InitScript() {
  if (!AKhJS001CheckConfig()) {
    return;
  }

  if (!AKhJS001Control.enable) {
    AKhJS001Log('Скрипт отключен');
    return;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    AKhJS001Log('Скрипт инициализирован');
    const uuid = AKhJS001GetOrCreateUUID();
    const userIP = await AKhJS001FetchUserIP();
    const { url, params } = AKhJS001ExtractUrlAndParams();
    const data = {
      uuid, userIP, url, params,
    };

    AKhJS001SendPostRequest(AKhJS001Auth.server, data);
  });
}

AKhJS001InitScript();
