/*
  Пример настроек:

window.AKhJS001Auth = {
  server: 'https://core.khudoley.pro:22327/visit/tilda',
  authKey: 'key',
  authValue: 'value',
};

window.AKhJS001Control = {
  enable: false,
  debug: true,
};
*/

/**
 * Выводит сообщение в консоль, если включен режим отладки.
 * @param {string} message Сообщение для логирования.
 * @param {boolean} isError Указывает, является ли сообщение ошибкой.
 */
function AKhJS001Log(message, isError = false) {
  if (window.AKhJS001Control && window.AKhJS001Control.debug) {
    const logFunction = isError ? console.error : console.log;
    logFunction(`AKh - js001: ${message}`);
  }
}

/**
 * Проверяет, существуют ли объекты конфигурации.
 */
function AKhJS001CheckConfig() {
  if (!window.AKhJS001Auth || !window.AKhJS001Control) {
    AKhJS001Log('Конфигурация window.AKhJS001Auth или window.AKhJS001Control не определена.', true);
    return false;
  }
  return true;
}

/**
 * Генерирует шестнадцатеричное число заданной длины.
 * @param {number} length Длина числа.
 * @returns {string} Шестнадцатеричное число.
 */
function AKhJS001GenerateHex(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

/**
 * Получает из куки или генерирует UUID.
 * @returns {string} UUID пользователя.
 */
function AKhJS001GetOrCreateUUID() {
  const cookieName = 'akhUserUUID=';
  const existingUUID = document.cookie.split('; ').find((row) => row.startsWith(cookieName));
  if (existingUUID) {
    const uuid = existingUUID.split('=')[1];
    AKhJS001Log(`Используется существующий UUID: ${uuid}`);
    return uuid;
  }

  const newUUID = `${AKhJS001GenerateHex(8)}-${AKhJS001GenerateHex(4)}-4${AKhJS001GenerateHex(3)}-${[8, 9, 'a', 'b'][Math.floor(Math.random() * 4)]}${AKhJS001GenerateHex(3)}-${AKhJS001GenerateHex(12)}`;
  document.cookie = `${cookieName}${newUUID}; max-age=${30 * 24 * 60 * 60}; path=/`;
  AKhJS001Log(`Сгенерирован новый UUID: ${newUUID}`);
  return newUUID;
}

/**
 * Асинхронно получает IP-адрес пользователя.
 * @returns {Promise<string|null>} IP-адрес или null.
 */
async function AKhJS001FetchUserIP() {
  try {
    AKhJS001Log('Получение IP-адреса пользователя...');
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) throw new Error('Ошибка при получении IP');
    const data = await response.json();
    AKhJS001Log(`IP-адрес пользователя: ${data.ip}`);
    return data.ip;
  } catch (error) {
    AKhJS001Log(`Ошибка при получении IP: ${error}`, true);
    return null;
  }
}

/**
 * Асинхронно отправляет POST-запрос на сервер с данными пользователя.
 * @param {string} url Адрес сервера.
 * @param {Object} data Данные для отправки.
 */
async function AKhJS001SendPostRequest(url, data) {
  try {
    AKhJS001Log(`Отправка POST-запроса на: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [window.AKhJS001Auth.authKey]: window.AKhJS001Auth.authValue,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Ошибка отправки POST-запроса');
    const result = await response.json();
    AKhJS001Log(`Ответ сервера: ${JSON.stringify(result)}`);
  } catch (error) {
    AKhJS001Log(`Ошибка при отправке POST-запроса: ${error}`, true);
  }
}

/**
 * Извлекает URL и параметры текущей страницы.
 * @returns {{url: string, params: Object}} URL и параметры.
 */
function AKhJS001ExtractUrlAndParams() {
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlParams.entries());
  AKhJS001Log(`Текущий URL и параметры: ${currentUrl}, ${JSON.stringify(params)}`);
  return { url: currentUrl, params };
}

/**
 * Ожидает появления объектов на странице.
 * @param {number} timeout Максимальное время ожидания в мс.
 * @returns {Promise<void>} Промис, разрешающийся при наличии объектов.
 */
function AKhJS001WaitForObjects(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkExist = setInterval(() => {
      if (window.AKhJS001Auth && window.AKhJS001Control) {
        clearInterval(checkExist);
        resolve(); // Просто разрешаем промис
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkExist);
        reject(new Error('Таймаут ожидания объектов'));
      }
    }, 100);
  });
}

/**
 * Инициализирует скрипт.
 */
async function AKhJS001InitScript() {
  try {
    if (!AKhJS001CheckConfig()) {
      throw new Error('Конфигурация не определена.');
    }

    if (document.readyState !== 'complete') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', () => {
          resolve();
        });
      });
    }

    await AKhJS001WaitForObjects();

    AKhJS001Log('Скрипт инициализирован');

    const uuid = AKhJS001GetOrCreateUUID();
    const userIP = await AKhJS001FetchUserIP();
    const { url, params } = AKhJS001ExtractUrlAndParams();
    const data = {
      uuid, userIP, url, params,
    };

    await AKhJS001SendPostRequest(window.AKhJS001Auth.server, data);
  } catch (error) {
    AKhJS001Log(`Ошибка: ${error.message}`, true);
  }
}

AKhJS001InitScript();
