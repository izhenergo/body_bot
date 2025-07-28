// Минимальная версия с гарантированной работой
document.addEventListener('DOMContentLoaded', function() {
    console.log('Старт инициализации приложения');

    // 1. Убираем splash screen через 1 секунду
    setTimeout(function() {
        const splash = document.getElementById('splash');
        if (splash) splash.style.display = 'none';

        // 2. Показываем форму авторизации
        const authView = document.getElementById('auth-view');
        if (authView) authView.style.display = 'block';

        // 3. Обработка формы входа
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.onsubmit = function(e) {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                // 4. Проверка логина/пароля
                if ((username === '1' && password === '1') ||
                    (username === '2' && password === '2')) {

                    // 5. Скрываем форму авторизации
                    authView.style.display = 'none';

                    // 6. Показываем нужный интерфейс
                    if (username === '2') {
                        // Админ-панель
                        document.getElementById('admin-panel').style.display = 'block';
                    } else {
                        // Основное приложение
                        const app = document.getElementById('app');
                        app.style.display = 'block';

                        // Принудительно показываем главный экран
                        document.querySelector('.main-content').style.display = 'block';
                        document.getElementById('history-view').style.display = 'none';
                        document.getElementById('profile-view').style.display = 'none';

                        // Инициализация кнопок
                        document.getElementById('callBtn').onclick = function() {
                            window.open('tel:+79991234567', '_blank');
                        };

                        document.getElementById('chatBtn').onclick = function() {
                            window.open('https://t.me/AutoService_Support', '_blank');
                        };

                        // Навигация по табам
                        document.getElementById('main-tab').onclick = function(e) {
                            e.preventDefault();
                            document.querySelector('.main-content').style.display = 'block';
                            document.getElementById('history-view').style.display = 'none';
                            document.getElementById('profile-view').style.display = 'none';
                        };

                        document.getElementById('history-tab').onclick = function(e) {
                            e.preventDefault();
                            document.querySelector('.main-content').style.display = 'none';
                            document.getElementById('history-view').style.display = 'block';
                            document.getElementById('profile-view').style.display = 'none';
                        };

                        document.getElementById('profile-tab').onclick = function(e) {
                            e.preventDefault();
                            document.querySelector('.main-content').style.display = 'none';
                            document.getElementById('history-view').style.display = 'none';
                            document.getElementById('profile-view').style.display = 'block';
                        };
                    }
                } else {
                    alert('Неверный логин или пароль');
                }
            };
        }
    }, 1000);
});
