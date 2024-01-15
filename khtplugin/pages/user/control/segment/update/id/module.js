/**
 * @file Модуль для страницы редактирования сегмента
 * /user/control/segment/update/id/[0-9]+/
 */

const khtMenuItems = [];

/**
* Добавляет пункт меню и его обработчик
* @param {string} html HTML-разметка пункта меню
* @param {Function} handler Функция-обработчик для пункта меню
*/
function khtAddMenuItem(html, handler) {
  khtMenuItems.push({ html, handler });
}

/**
 * Создает дополнительный элемент на странице в элементе с классом page-actions
 * @returns {Promise} Промис, который разрешается после добавления дополнительных действий
 */
function khtCreateAdditionalActions() {
  return new Promise((resolve, reject) => {
    const pageActions = document.querySelector('.page-actions');
    if (!pageActions) {
      reject(new Error('Элемент с классом page-actions не найден'));
      return;
    }

    const additionalActions = document.createElement('div');
    additionalActions.className = 'btn-group pull-right';
    additionalActions.innerHTML = `
        <button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
            <span class="glyphicon glyphicon-plus"></span> Дополнительные действия <span class="caret"></span>
        </button>
        <ul class="dropdown-menu pull-right" role="menu">
            ${khtMenuItems.map((item) => `<li>${item.html}</li>`).join('')}
        </ul>
    `;

    const showUsersButton = pageActions.querySelector('button.btn');
    if (showUsersButton) {
      pageActions.insertBefore(additionalActions, showUsersButton);
      resolve();
    } else {
      reject(new Error('Кнопка для вставки дополнительных действий не найдена'));
    }
  });
}

/**
 * Выбирает радио-кнопку АРХИВ в элементе с классом widget-selector
 */
function khtSelectArchiveRadio() {
  const widgetSelector = document.querySelector('.widget-selector');
  if (!widgetSelector) return;

  const labels = widgetSelector.querySelectorAll('label');
  labels.forEach((label) => {
    if (label.textContent.includes('АРХИВ[неактивная][архивная]')) {
      const radioInput = label.querySelector('input[type="radio"]');
      if (radioInput) radioInput.checked = true;
    }
  });
}

/**
 * Главная функция модуля
 */
function handle() {
  khtCreateAdditionalActions()
    .then(() => {
      khtAddMenuItem('<a href="#">В архив</a>', () => {
        khtSelectArchiveRadio();
        document.querySelector('#segmentForm').submit();
      });
    })
    .catch((error) => {
      console.error('Ошибка при создании дополнительных действий:', error);
    });
}

export default handle;
