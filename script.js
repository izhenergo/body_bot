// Упрощенная и надежная версия script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');

    // 1. Скрываем splash screen
    setTimeout(function() {
        const splash = document.getElementById('splash');
        if (splash) splash.style.display = 'none';

        // 2. Показываем форму авторизации
        const authView = document.getElementById('auth-view');
        if (authView) authView.style.display = 'block';

        // 3. Обработка входа
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.onsubmit = function(e) {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                // Простая проверка логина
                if ((username === '1' && password === '1') ||
                    (username === '2' && password === '2')) {

                    authView.style.display = 'none';

                    // Показываем нужный интерфейс
                    if (username === '2') {
                        document.getElementById('admin-panel').style.display = 'block';
                    } else {
                        const app = document.getElementById('app');
                        app.style.display = 'block';

                        // Принудительно показываем главный экран
                        document.querySelector('.main-content').style.display = 'block';
                        document.getElementById('history-view').style.display = 'none';
                        document.getElementById('profile-view').style.display = 'none';

                        // Инициализация кнопок
                        document.getElementById('callBtn').onclick = function() {
                            window.open('tel:+79991234567');
                        };

                        document.getElementById('chatBtn').onclick = function() {
                            window.open('https://t.me/AutoService_Support');
                        };
                    }
                } else {
                    alert('Неверный логин или пароль');
                }
            };
        }
    }, 1000);
});
