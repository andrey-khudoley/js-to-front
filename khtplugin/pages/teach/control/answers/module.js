/**
 * @file Модуль для ленты ответов
 * /teach/control/answers.* /
 */

const menuList = [];
const menuItems = {
  items: [
    { html: '<a href="#">Отметить прочитанными</a>' },
    { html: '<a href="#">Принять все</a>' },
  ],
};

/**
 * Выполняет клик по всем элементам на странице с data-action="set_reviewed_at".
 */
function selectAllReviewed() {
  document.querySelectorAll('[data-action="set_reviewed_at"]').forEach(element => {
    element.click();
  });
}

/**
 * Выполняет клик по всем элементам на странице с data-action="accept".
 */
function selectAllAccepted() {
  document.querySelectorAll('[data-action="accept"]').forEach(element => {
    element.click();
  });
}

/**
 * Добавляет пункты меню и их обработчики.
 * @param {Object} menuData Объект, содержащий массив данных пунктов меню.
 * @returns {Promise} Промис, завершающийся после добавления всех пунктов меню.
 */
function fillCustomMenuList(menuData) {
  return new Promise((resolve, reject) => {
    if (!menuData || !Array.isArray(menuData.items)) {
      reject(new Error('Неверные данные пунктов меню'));
      return;
    }

    menuData.items.forEach((item) => {
      if (item.html) {
        menuList.push(item);
      }
    });
    resolve();
  });
}

/**
 * Создает дополнительный элемент на странице в элементе с классом page-filter.
 */
function createCustomButton() {
  const customActions = document.querySelector('.page-filter');
  if (!customActions) return;

  const additionalActions = document.createElement('div');
  additionalActions.className = 'btn-group custom-action-group';
  additionalActions.innerHTML = `
    <button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
      Дополнительные действия <span class="caret"></span>
    </button>
    <ul class="dropdown-menu" role="menu">
      ${menuList.map((item) => `<li>${item.html}</li>`).join('')}
    </ul>
  `;

  customActions.insertBefore(additionalActions, customActions.firstChild);

  const menu = additionalActions.querySelector('.dropdown-menu');
  if (menu) {
    menu.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target.tagName === 'A') {
        switch (event.target.textContent) {
          case 'Отметить прочитанными':
            selectAllReviewed();
            break;
          case 'Принять все':
            selectAllAccepted();
            break;
        }
      }
    });
  }
}

/**
 * Главная функция модуля.
 */
function handle() {
  fillCustomMenuList(menuItems)
    .then(createCustomButton)
    .catch((error) => {
      console.error('Ошибка при добавлении пунктов меню:', error);
    });
}

export default handle;
