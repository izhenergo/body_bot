// Конфигурация
const DEBUG = true;
function debugLog(message) {
    if (DEBUG) console.log('[AutoTrack DEBUG]', message);
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM полностью загружен');

    // Инициализация Telegram WebApp с обработкой ошибок
    const tg = window.Telegram?.WebApp || {
        ready: () => debugLog('Telegram WebApp не доступен'),
        showAlert: (msg) => alert(msg),
        expand: () => debugLog('Expand не доступен'),
        BackButton: {
            show: () => debugLog('BackButton показан'),
            hide: () => debugLog('BackButton скрыт'),
            onClick: (cb) => {
                debugLog('BackButton callback установлен');
                window.backButtonCallback = cb;
            }
        }
    };

    // Скрываем splash screen через 1 секунду
    setTimeout(() => {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.classList.add('hidden');
            debugLog('Splash screen скрыт');
            showAuthForm();
        } else {
            debugLog('Splash screen не найден', 'error');
        }
    }, 1000);

    // Показ формы авторизации
    function showAuthForm() {
        const authView = document.getElementById('auth-view');
        if (authView) {
            authView.classList.remove('hidden');
            debugLog('Форма авторизации показана');

            document.getElementById('login-form').addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin();
            });
        } else {
            debugLog('Форма авторизации не найдена', 'error');
        }
    }

    // Обработка входа
    function handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        debugLog(`Попытка входа: ${username}`);

        // Проверка учетных данных
        const users = {
            '1': { password: '1', role: 'user' },
            '2': { password: '2', role: 'admin' }
        };

        if (users[username] && users[username].password === password) {
            document.getElementById('auth-view').classList.add('hidden');
            debugLog(`Успешный вход, роль: ${users[username].role}`);

            // Инициализация Telegram WebApp
            tg.ready();
            tg.expand();

            if (users[username].role === 'admin') {
                showAdminPanel();
            } else {
                showMainApp();
            }
        } else {
            tg.showAlert('Неверный логин или пароль');
        }
    }

    // Показ основного приложения
    function showMainApp() {
        const app = document.getElementById('app');
        if (app) {
            app.classList.remove('hidden');
            debugLog('Основное приложение показано');

            // Принудительное отображение контента
            document.querySelector('.main-content').style.display = 'block';
            document.getElementById('history-view').style.display = 'none';
            document.getElementById('profile-view').style.display = 'none';

            // Инициализация навигации
            initNavigation();

            // Инициализация кнопок
            initButtons();
        } else {
            debugLog('Основное приложение не найдено', 'error');
        }
    }

    // Инициализация навигации
    function initNavigation() {
        debugLog('Инициализация навигации');

        document.getElementById('main-tab').addEventListener('click', function(e) {
            e.preventDefault();
            showView('main');
        });

        document.getElementById('history-tab').addEventListener('click', function(e) {
            e.preventDefault();
            showView('history');
        });

        document.getElementById('profile-tab').addEventListener('click', function(e) {
            e.preventDefault();
            showView('profile');
        });
    }

    // Показ конкретного view
    function showView(viewName) {
        debugLog(`Переключение на view: ${viewName}`);

        // Скрываем все views
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('history-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';

        // Показываем нужный view
        switch(viewName) {
            case 'main':
                document.querySelector('.main-content').style.display = 'block';
                tg.BackButton.hide();
                break;
            case 'history':
                document.getElementById('history-view').style.display = 'block';
                tg.BackButton.show();
                tg.BackButton.onClick(() => showView('main'));
                break;
            case 'profile':
                document.getElementById('profile-view').style.display = 'block';
                tg.BackButton.show();
                tg.BackButton.onClick(() => showView('main'));
                break;
        }

        // Обновляем активную вкладку
        document.querySelectorAll('.tabbar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.getElementById(`${viewName}-tab`).classList.add('active');
    }

    // Инициализация кнопок
    function initButtons() {
        debugLog('Инициализация кнопок');

        document.getElementById('callBtn')?.addEventListener('click', () => {
            tg.openTelegramLink('tel:+79991234567');
        });

        document.getElementById('chatBtn')?.addEventListener('click', () => {
            tg.openTelegramLink('https://t.me/AutoService_Support');
        });
    }

    // Показ админ-панели
    function showAdminPanel() {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.remove('hidden');
            debugLog('Админ-панель показана');

            document.querySelector('.btn-logout')?.addEventListener('click', () => {
                location.reload();
            });
        } else {
            debugLog('Админ-панель не найдена', 'error');
        }
    }
});
