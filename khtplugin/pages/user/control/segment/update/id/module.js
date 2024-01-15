/**
 * @file Модуль для страницы редактирования сегмента
 * /user/control/segment/update/id/[0-9]+/
 */

const khtpluginMenuList = [];
const khtpluginMenuItems = {
  items: [
    { html: '<a href="#">В архив</a>' },
  ],
};

/**
 * Выбирает радио-кнопку АРХИВ в элементе с классом widget-selector.
 */
function khtpluginSelectArchiveRadio() {
  const widgetSelector = document.querySelector('.widget-selector');
  if (!widgetSelector) return;

  const labels = widgetSelector.querySelectorAll('label');
  labels.forEach((label) => {
    if (label.textContent.includes('АРХИВ')) {
      const radioInput = label.querySelector('input[type="radio"]');
      if (radioInput) radioInput.checked = true;
    }
  });
}

/**
 * Добавляет пункт меню и его обработчик.
 * @param {Object} menuData Объект, содержащий массив данных пунктов меню.
 * @returns {Promise} Промис, завершающийся после добавления всех пунктов меню.
 */
function khtpluginFillMenuList(menuData) {
  return new Promise((resolve, reject) => {
    if (!menuData || !Array.isArray(menuData.items)) {
      reject(new Error('Неверные данные пунктов меню'));
      return;
    }

    menuData.items.forEach((item) => {
      if (item.html) {
        khtpluginMenuList.push(item);
      }
    });
    resolve();
  });
}

/**
 * Создает дополнительный элемент на странице в элементе с классом page-actions.
 */
function khtpluginCreateButton() {
  const pageActions = document.querySelector('.page-actions');
  if (!pageActions) return;

  const additionalActions = document.createElement('div');
  additionalActions.className = 'btn-group pull-right';
  additionalActions.innerHTML = `
    <button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false" style="margin-left: 10px;">
      <span class="glyphicon glyphicon-plus"></span> Дополнительные действия <span class="caret"></span>
    </button>
    <ul class="dropdown-menu pull-right" role="menu">
      ${khtpluginMenuList.map((item) => `<li>${item.html}</li>`).join('')}
    </ul>
  `;

  pageActions.insertBefore(additionalActions, pageActions.firstChild);

  const menu = additionalActions.querySelector('.dropdown-menu');
  if (menu) {
    menu.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target.tagName === 'A') {
        if (event.target.textContent === 'В архив') {
          khtpluginSelectArchiveRadio();
          document.querySelector('#segmentForm').submit();
        }
      }
    });
  }
}

/**
 * Главная функция модуля.
*/
function handle() {
  khtpluginFillMenuList(khtpluginMenuItems)
    .then(khtpluginCreateButton)
    .catch((error) => {
      console.error('Ошибка при добавлении пунктов меню:', error);
    });
}

export default handle;
