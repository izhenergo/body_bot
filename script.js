/**
 * AutoTrack Application Core
 * Гарантированно рабочая версия
 */

// Конфигурация приложения
const CONFIG = {
    DEBUG: true,
    SPLASH_DELAY: 1000,
    CREDENTIALS: {
        '1': { password: '1', role: 'user' },
        '2': { password: '2', role: 'admin' }
    }
};

// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp || {
    ready: () => log('Telegram WebApp not available'),
    showAlert: (msg) => alert(msg),
    expand: () => log('Expand not available'),
    BackButton: {
        show: () => log('BackButton shown'),
        hide: () => log('BackButton hidden'),
        onClick: (cb) => {
            log('BackButton callback set');
            window.backButtonCallback = cb;
        }
    },
    openTelegramLink: (url) => window.open(url, '_blank')
};

// Логирование
function log(message) {
    if (CONFIG.DEBUG) console.log(`[AutoTrack] ${message}`);
}

// Главная функция инициализации
function initApp() {
    log('Starting application initialization');

    // 1. Убираем splash screen
    setTimeout(() => {
        removeSplashScreen();
        showAuthForm();
    }, CONFIG.SPLASH_DELAY);
}

// Удаление splash screen
function removeSplashScreen() {
    const splash = document.getElementById('splash');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.remove();
            log('Splash screen removed');
        }, 300);
    }
}

// Показ формы авторизации
function showAuthForm() {
    const authView = document.getElementById('auth-view');
    if (authView) {
        authView.style.display = 'flex';
        setTimeout(() => {
            authView.style.opacity = '1';
            setupAuthForm();
            log('Auth form shown');
        }, 50);
    }
}

// Настройка формы авторизации
function setupAuthForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            processLogin();
        };
    }
}

// Обработка входа
function processLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    log(`Login attempt: ${username}`);

    if (!username || !password) {
        tg.showAlert('Введите логин и пароль');
        return;
    }

    const user = CONFIG.CREDENTIALS[username];
    if (user && user.password === password) {
        log(`Login successful, role: ${user.role}`);
        handleSuccessfulLogin(user.role);
    } else {
        tg.showAlert('Неверный логин или пароль');
    }
}

// Успешный вход
function handleSuccessfulLogin(role) {
    // Удаляем форму авторизации
    const authView = document.getElementById('auth-view');
    if (authView) {
        authView.style.opacity = '0';
        setTimeout(() => {
            authView.remove();
            log('Auth form removed');
        }, 300);
    }

    // Показываем соответствующий интерфейс
    if (role === 'admin') {
        showAdminPanel();
    } else {
        showMainApp();
    }
}

// Показ админ-панели
function showAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.style.display = 'block';
        setTimeout(() => {
            adminPanel.style.opacity = '1';
            setupAdminPanel();
            log('Admin panel shown');
        }, 50);
    }
}

// Настройка админ-панели
function setupAdminPanel() {
    tg.ready();
    tg.expand();

    document.querySelector('.btn-logout')?.addEventListener('click', () => {
        location.reload();
    });
}

// Показ основного приложения
function showMainApp() {
    const app = document.getElementById('app');
    if (app) {
        app.style.display = 'flex';
        setTimeout(() => {
            app.style.opacity = '1';
            setupMainApp();
            log('Main app shown');
        }, 50);
    }
}

// Настройка основного приложения
function setupMainApp() {
    // Инициализация Telegram WebApp
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    tg.BackButton.hide();

    // Настройка кнопок
    setupButtons();

    // Настройка навигации
    setupNavigation();

    // Показ главного экрана
    showMainView();
}

// Настройка кнопок
function setupButtons() {
    document.getElementById('callBtn')?.addEventListener('click', () => {
        tg.openTelegramLink('tel:+79991234567');
    });

    document.getElementById('chatBtn')?.addEventListener('click', () => {
        tg.openTelegramLink('https://t.me/AutoService_Support');
    });
}

// Настройка навигации
function setupNavigation() {
    document.getElementById('main-tab')?.addEventListener('click', (e) => {
        e.preventDefault();
        showMainView();
    });

    document.getElementById('history-tab')?.addEventListener('click', (e) => {
        e.preventDefault();
        showHistoryView();
    });

    document.getElementById('profile-tab')?.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileView();
    });
}

// Показ главного экрана
function showMainView() {
    setActiveTab('main');
    document.querySelector('.main-content').style.display = 'block';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    tg.BackButton.hide();
    log('Main view shown');
}

// Показ истории
function showHistoryView() {
    setActiveTab('history');
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'block';
    document.getElementById('profile-view').style.display = 'none';
    tg.BackButton.show();
    tg.BackButton.onClick(showMainView);
    log('History view shown');
}

// Показ профиля
function showProfileView() {
    setActiveTab('profile');
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
    tg.BackButton.show();
    tg.BackButton.onClick(showMainView);
    log('Profile view shown');
}

// Установка активной вкладки
function setActiveTab(tabName) {
    document.querySelectorAll('.tabbar-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
}

// Глобальные функции
window.showEstimate = function() {
    tg.showAlert('Смета согласована 15.04.2023. Общая сумма: 125 430 руб.');
};

window.showVisitDetail = function(visitId) {
    // Реализация просмотра деталей посещения
    tg.showAlert(`Детали посещения #${visitId}`);
};

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
