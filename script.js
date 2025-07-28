// Telegram WebApp polyfill
const tg = window.Telegram?.WebApp || {
    ready: () => console.log('Telegram WebApp not available'),
    showAlert: (msg) => alert(msg),
    expand: () => console.log('Expand not available'),
    enableClosingConfirmation: () => {},
    BackButton: {
        show: () => {},
        hide: () => {},
        onClick: (cb) => { window.backButtonCallback = cb; }
    },
    openTelegramLink: (url) => window.open(url, '_blank')
};

// Данные для авторизации
const users = {
    '1': { password: '1', role: 'user' },
    '2': { password: '2', role: 'admin' }
};

// Основная инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Логирование

    setTimeout(function() {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.classList.add('hidden');
            console.log('Splash hidden'); // Логирование
        }

        showAuthForm();
    }, 1000);
});

function showAuthForm() {
    const authView = document.getElementById('auth-view');
    if (!authView) {
        console.error('Auth form not found');
        return;
    }

    authView.classList.remove('hidden');
    console.log('Auth form shown'); // Логирование

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username')?.value;
            const password = document.getElementById('password')?.value;

            console.log('Login attempt:', username); // Логирование

            if (users[username] && users[username].password === password) {
                authView.classList.add('hidden');
                console.log('Login success, role:', users[username].role); // Логирование

                if (users[username].role === 'admin') {
                    showAdminPanel();
                } else {
                    showMainApp();
                }
            } else {
                tg.showAlert('Неверный логин или пароль');
            }
        });
    }
}

function showAdminPanel() {
    console.log('Showing admin panel'); // Логирование
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.classList.remove('hidden');
    } else {
        console.error('Admin panel not found');
    }
}

function showMainApp() {
    console.log('Showing main app'); // Логирование

    const app = document.getElementById('app');
    if (!app) {
        console.error('App container not found');
        return;
    }

    app.classList.remove('hidden');

    // Инициализация Telegram WebApp
    tg.ready();
    tg.expand();

    // Настройка кнопок
    document.getElementById('callBtn')?.addEventListener('click', () => {
        tg.openTelegramLink('tel:+79991234567');
    });

    document.getElementById('chatBtn')?.addEventListener('click', () => {
        tg.openTelegramLink('https://t.me/AutoService_Support');
    });

    // Навигация
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

    // Показать главный экран
    showMainView();
}

function showMainView() {
    console.log('Showing main view'); // Логирование
    setActiveView('main');
    document.querySelector('.main-content').style.display = 'block';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('visit-detail-view').style.display = 'none';
    tg.BackButton.hide();
}

function showHistoryView() {
    console.log('Showing history view'); // Логирование
    setActiveView('history');
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'block';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('visit-detail-view').style.display = 'none';
    tg.BackButton.show();
    tg.BackButton.onClick(showMainView);
}

function showProfileView() {
    console.log('Showing profile view'); // Логирование
    setActiveView('profile');
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
    document.getElementById('visit-detail-view').style.display = 'none';
    tg.BackButton.show();
    tg.BackButton.onClick(showMainView);
}

function setActiveView(view) {
    document.getElementById('main-tab')?.classList.remove('active');
    document.getElementById('history-tab')?.classList.remove('active');
    document.getElementById('profile-tab')?.classList.remove('active');

    document.getElementById(`${view}-tab`)?.classList.add('active');
}

// Делаем функции доступными для HTML
window.showVisitDetail = function(visitId) {
    console.log('Showing visit details:', visitId); // Логирование
    // Реализация функции
};

window.showEstimate = function() {
    tg.showAlert('Смета согласована 15.04.2023. Общая сумма: 125 430 руб.');
};
