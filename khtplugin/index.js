/**
 * @file Управляющий скрипт для динамического импорта модулей в зависимости от текущего URL.
 */

const khtModulesConfig = {
  '/user/control/segment/update/id/[0-9]+/': [
    'https://cdn.jsdelivr.net/gh/anleyn/js-to-front@b0d3d97/khtplugin/pages/user/control/segment/update/id/module.js',
  ],
};

const currentUrl = window.location.pathname;

/**
 * Импортирует модули, соответствующие переданному регулярному выражению пути.
 * @param {string} pathRegex Регулярное выражение для проверки соответствия URL.
 * @param {Array<string>} modules Массив путей к модулям для импорта.
 */
function khtImportModulesForPath(pathRegex, modules) {
  if (new RegExp(pathRegex).test(currentUrl) || pathRegex === '*') {
    modules.forEach((modulePath) => {
      import(modulePath)
        .then((module) => {
          if (module.default) {
            module.default();
          }
        })
        .catch((error) => {
          console.error(`Ошибка при загрузке модуля ${modulePath}:`, error);
        });
    });
  }
}

Object.keys(khtModulesConfig).forEach((pathRegex) => {
  khtImportModulesForPath(pathRegex, khtModulesConfig[pathRegex]);
});
