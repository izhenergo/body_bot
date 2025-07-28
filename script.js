// Улучшенная версия script.js с гарантированным отображением
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // 1. Убираем сплеш-скрин через 1 секунду
    setTimeout(function() {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.pointerEvents = 'none';
        }

        // 2. Показываем форму авторизации с анимацией
        const authView = document.getElementById('auth-view');
        if (authView) {
            authView.style.display = 'flex';
            authView.style.opacity = '1';
        }

        // 3. Настройка обработчика формы
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.onsubmit = function(e) {
                e.preventDefault();
                handleLogin();
            };
        }
    }, 1000);

    // Функция обработки входа
    function handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log('Login attempt with:', username);

        // Проверка учетных данных
        const validLogins = {
            '1': { password: '1', role: 'user' },
            '2': { password: '2', role: 'admin' }
        };

        if (validLogins[username] && validLogins[username].password === password) {
            // Скрываем форму авторизации
            const authView = document.getElementById('auth-view');
            if (authView) {
                authView.style.display = 'none';
            }

            // Показываем соответствующий интерфейс
            if (validLogins[username].role === 'admin') {
                document.getElementById('admin-panel').style.display = 'block';
            } else {
                showMainAppInterface();
            }
        } else {
            alert('Неверный логин или пароль');
        }
    }

    // Функция показа основного интерфейса
    function showMainAppInterface() {
        const app = document.getElementById('app');
        if (app) {
            // Гарантированное отображение приложения
            app.style.display = 'block';
            app.style.opacity = '1';

            // Принудительный показ главного экрана
            document.querySelector('.main-content').style.display = 'block';
            document.getElementById('history-view').style.display = 'none';
            document.getElementById('profile-view').style.display = 'none';

            // Инициализация кнопок
            initButtons();

            // Инициализация навигации
            initNavigation();
        }
    }

    function initButtons() {
        // Кнопка звонка
        const callBtn = document.getElementById('callBtn');
        if (callBtn) {
            callBtn.onclick = function() {
                window.open('tel:+79991234567', '_blank');
            };
        }

        // Кнопка чата
        const chatBtn = document.getElementById('chatBtn');
        if (chatBtn) {
            chatBtn.onclick = function() {
                window.open('https://t.me/AutoService_Support', '_blank');
            };
        }
    }

    function initNavigation() {
        // Инициализация таббара
        document.getElementById('main-tab').onclick = function(e) {
            e.preventDefault();
            showView('main');
        };

        document.getElementById('history-tab').onclick = function(e) {
            e.preventDefault();
            showView('history');
        };

        document.getElementById('profile-tab').onclick = function(e) {
            e.preventDefault();
            showView('profile');
        };
    }

    function showView(viewName) {
        // Скрываем все вью
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('history-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';

        // Показываем нужное вью
        switch(viewName) {
            case 'main':
                document.querySelector('.main-content').style.display = 'block';
                break;
            case 'history':
                document.getElementById('history-view').style.display = 'block';
                break;
            case 'profile':
                document.getElementById('profile-view').style.display = 'block';
                break;
        }
    }
});
