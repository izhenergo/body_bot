const tg = window.Telegram.WebApp;
let currentView = 'main';
let currentSlide = 0;
let startX = 0;
let isDragging = false;
let currentUser = null;

// Конфигурация пользователей
const users = {
    '1': { password: '1', role: 'user' },
    '2': { password: '2', role: 'admin' }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
        showAuthView();
        initTelegramApp();
    }, 1500);
});

function initTelegramApp() {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    tg.BackButton.hide();

    // Создаем основную структуру приложения после инициализации Telegram WebApp
    createAppStructure();
}

function createAppStructure() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="main-content">
            <!-- Основной контент приложения -->
            <div id="auth-view">
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
            
            <div id="main-view" style="display: none;">
                <!-- Основной контент после авторизации -->
                ${document.querySelector('.main-content').innerHTML}
            </div>
        </div>
    `;

    // Назначаем обработчики событий после создания структуры
    setupEventListeners();
}

function setupEventListeners() {
    // Авторизация
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
}

// Система авторизации
function showAuthView() {
    document.getElementById('auth-view').style.display = 'flex';
    document.getElementById('main-view').style.display = 'none';
}

function hideAuthView() {
    document.getElementById('auth-view').style.display = 'none';
}

function handleLogin() {
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!login || !password) {
        tg.showAlert('Введите логин и пароль');
        return;
    }

    if (users[login] && users[login].password === password) {
        currentUser = users[login];
        hideAuthView();
        document.getElementById('main-view').style.display = 'block';

        if (currentUser.role === 'admin') {
            showAdminScreen();
        }
    } else {
        tg.showAlert('Неверный логин или пароль');
    }
}

function showAdminScreen() {
    const adminScreen = document.createElement('div');
    adminScreen.className = 'admin-screen';
    adminScreen.innerHTML = `
        <div style="padding: 20px; text-align: center;">
            <h1>Административная панель</h1>
            <button class="btn btn-auth" onclick="logout()">Выйти</button>
        </div>
    `;
    document.getElementById('app').appendChild(adminScreen);
    document.getElementById('main-view').style.display = 'none';
}

function logout() {
    currentUser = null;
    const adminScreen = document.querySelector('.admin-screen');
    if (adminScreen) adminScreen.remove();

    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
    showAuthView();
}

// Глобальные функции
window.logout = logout;
