// Проверяем поддержку функций Telegram WebApp
const isSupportedVersion = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.version >= 6.1;
const tg = window.Telegram?.WebApp || {};

// Конфигурация пользователей
const users = {
    '1': { password: '1', role: 'user' },
    '2': { password: '2', role: 'admin' }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
        initApp();
    }, 1500);
});

function initApp() {
    // Создаем базовую структуру приложения
    const app = document.getElementById('app');
    app.innerHTML = `
        <div id="auth-view" class="auth-container">
            <div class="auth-card">
                <h2 class="auth-title">Авторизация</h2>
                <div class="auth-form">
                    <div class="form-group">
                        <label for="login">Логин</label>
                        <input type="text" id="login" placeholder="Введите логин">
                    </div>
                    <div class="form-group">
                        <label for="password">Пароль</label>
                        <input type="password" id="password" placeholder="Введите пароль">
                    </div>
                    <button class="btn btn-auth" id="loginBtn">Войти</button>
                </div>
            </div>
        </div>
        
        <div id="main-view" style="display:none;">
            <!-- Основной контент будет загружен после авторизации -->
        </div>
    `;

    // Назначаем обработчики событий
    document.getElementById('loginBtn').addEventListener('click', handleLogin);

    // Инициализируем Telegram WebApp, если доступно
    if (isSupportedVersion) {
        try {
            tg.ready();
            tg.expand();
            if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
            if (tg.BackButton) tg.BackButton.hide();
        } catch (e) {
            console.error('Telegram WebApp error:', e);
        }
    }
}

function handleLogin() {
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!login || !password) {
        showAlert('Введите логин и пароль');
        return;
    }

    if (users[login] && users[login].password === password) {
        // Успешная авторизация
        document.getElementById('auth-view').style.display = 'none';
        loadMainContent();

        if (users[login].role === 'admin') {
            showAdminPanel();
        }
    } else {
        showAlert('Неверный логин или пароль');
    }
}

function loadMainContent() {
    const mainView = document.getElementById('main-view');
    mainView.style.display = 'block';
    mainView.innerHTML = `
        <div class="main-content">
            <!-- Здесь ваш основной контент приложения -->
            <h1>Добро пожаловать в приложение!</h1>
            <p>Ваш автомобиль находится в ремонте.</p>
            <button onclick="logout()">Выйти</button>
        </div>
    `;
}

function showAdminPanel() {
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    adminPanel.innerHTML = `
        <h2>Административная панель</h2>
        <p>Вы вошли как администратор</p>
    `;
    document.getElementById('main-view').appendChild(adminPanel);
}

function logout() {
    document.getElementById('main-view').style.display = 'none';
    document.getElementById('auth-view').style.display = 'flex';
    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
}

function showAlert(message) {
    if (tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message); // Fallback для старых версий
    }
}

// Глобальные функции
window.logout = logout;
window.showAlert = showAlert;
