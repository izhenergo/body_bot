/**
 * AutoTrack Application Core
 * Версия 2.0 - Модернизированная и оптимизированная
 */

// Конфигурация приложения
const CONFIG = {
    DEBUG: true,
    SPLASH_DELAY: 1500,
    API_ENDPOINT: 'https://api.autotrack.example',
    CREDENTIALS: {
        '1': { password: '1', role: 'user', name: 'Пользователь' },
        '2': { password: '2', role: 'admin', name: 'Администратор' }
    },
    CARS: [
        {
            id: 1,
            model: 'Volkswagen Tiguan',
            plate: 'А123БВ777',
            mileage: 45230,
            nextService: 2500,
            image: 'tiguan.jpg'
        },
        {
            id: 2,
            model: 'Kia Sportage',
            plate: 'Х987УК177',
            mileage: 18750,
            nextService: 6000,
            image: 'sportage.jpg'
        }
    ]
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
    openTelegramLink: (url) => window.open(url, '_blank'),
    enableClosingConfirmation: () => log('Closing confirmation enabled')
};

// Состояние приложения
const AppState = {
    currentUser: null,
    currentView: 'main',
    cars: [],
    history: [],
    isLoading: false
};

// DOM элементы
const DOM = {
    splash: document.getElementById('splash'),
    authView: document.getElementById('auth-view'),
    loginForm: document.getElementById('login-form'),
    app: document.getElementById('app'),
    adminPanel: document.getElementById('admin-panel'),
    mainContent: document.querySelector('.main-content'),
    tabbarItems: document.querySelectorAll('.tabbar-item')
};

// Утилиты
const Utils = {
    log(message) {
        if (CONFIG.DEBUG) console.log(`[AutoTrack] ${message}`);
    },

    showLoader() {
        DOM.mainContent.innerHTML = '<div class="loader">Загрузка...</div>';
    },

    hideLoader() {
        // Реализация скрытия лоадера
    },

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 3000);
        }, 100);
    }
};

// Основные функции приложения
const App = {
    init() {
        Utils.log('Инициализация приложения');

        // Показ splash screen
        setTimeout(() => {
            this.showAuthForm();
        }, CONFIG.SPLASH_DELAY);

        // Инициализация обработчиков событий
        this.initEventListeners();
    },

    initEventListeners() {
        // Форма авторизации
        if (DOM.loginForm) {
            DOM.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Навигация
        DOM.tabbarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.id.replace('-tab', '');
                this.navigateTo(view);
            });
        });

        // Кнопка выхода в админке
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    },

    showAuthForm() {
        Utils.log('Показ формы авторизации');
        DOM.splash.style.opacity = '0';

        setTimeout(() => {
            DOM.splash.style.display = 'none';
            DOM.authView.classList.add('show');

            // Фокус на поле ввода логина
            document.getElementById('username')?.focus();
        }, 500);
    },

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        Utils.log(`Попытка входа: ${username}`);

        if (!username || !password) {
            tg.showAlert('Введите логин и пароль');
            return;
        }

        const user = CONFIG.CREDENTIALS[username];
        if (user && user.password === password) {
            AppState.currentUser = { username, ...user };
            Utils.log(`Успешный вход: ${user.name} (${user.role})`);
            this.handleSuccessfulLogin();
        } else {
            tg.showAlert('Неверный логин или пароль');
            Utils.log('Ошибка входа: неверные учетные данные');
        }
    },

    handleSuccessfulLogin() {
        // Анимация скрытия формы авторизации
        DOM.authView.style.opacity = '0';

        setTimeout(() => {
            DOM.authView.style.display = 'none';

            // Показ соответствующего интерфейса
            if (AppState.currentUser.role === 'admin') {
                this.showAdminPanel();
            } else {
                this.showMainApp();
            }

            // Инициализация Telegram WebApp
            tg.ready();
            tg.expand();
            tg.enableClosingConfirmation();
        }, 500);
    },

    showMainApp() {
        Utils.log('Показ основного приложения');

        // Загрузка данных
        this.loadUserData();

        // Показ интерфейса
        DOM.app.classList.add('show');
        this.navigateTo('main');
    },

    showAdminPanel() {
        Utils.log('Показ админ-панели');
        DOM.adminPanel.style.display = 'block';

        setTimeout(() => {
            DOM.adminPanel.style.opacity = '1';

            // Загрузка данных администратора
            this.loadAdminData();
        }, 50);
    },

    loadUserData() {
        Utils.log('Загрузка данных пользователя');
        AppState.cars = CONFIG.CARS;
        this.renderCars();
    },

    loadAdminData() {
        Utils.log('Загрузка данных администратора');
        // Здесь может быть загрузка данных с сервера
    },

    renderCars() {
        if (!DOM.mainContent) return;

        let html = '';
        AppState.cars.forEach(car => {
            html += `
                <div class="car-card" data-id="${car.id}">
                    <h2>${car.model}</h2>
                    <p>Госномер: ${car.plate}</p>
                    <p>Пробег: ${Utils.formatNumber(car.mileage)} км</p>
                    <p>Следующее ТО: через ${Utils.formatNumber(car.nextService)} км</p>
                    <button class="btn btn-primary" onclick="App.showCarDetails(${car.id})">
                        Подробнее
                    </button>
                </div>
            `;
        });

        DOM.mainContent.innerHTML = html;
    },

    showCarDetails(carId) {
        const car = AppState.cars.find(c => c.id === carId);
        if (!car) return;

        const html = `
            <div class="car-details">
                <h2>${car.model}</h2>
                <p>Госномер: ${car.plate}</p>
                <p>Пробег: ${Utils.formatNumber(car.mileage)} км</p>
                <p>Следующее ТО: через ${Utils.formatNumber(car.nextService)} км</p>
                <div class="car-actions">
                    <button class="btn btn-primary" onclick="App.showServiceHistory(${car.id})">
                        История обслуживания
                    </button>
                    <button class="btn btn-secondary" onclick="App.navigateTo('main')">
                        Назад
                    </button>
                </div>
            </div>
        `;

        DOM.mainContent.innerHTML = html;
        tg.BackButton.show();
        tg.BackButton.onClick(() => this.navigateTo('main'));
    },

    showServiceHistory(carId) {
        // Заглушка для истории обслуживания
        const html = `
            <div class="history-list">
                <h2>История обслуживания</h2>
                <div class="history-item">
                    <p><strong>15.04.2023</strong> - Замена масла и фильтров</p>
                    <p>Пробег: 42 000 км</p>
                    <p>Стоимость: 12 500 руб.</p>
                </div>
                <div class="history-item">
                    <p><strong>10.01.2023</strong> - Диагностика ходовой</p>
                    <p>Пробег: 38 750 км</p>
                    <p>Стоимость: 3 200 руб.</p>
                </div>
                <button class="btn btn-secondary" onclick="App.showCarDetails(${carId})">
                    Назад
                </button>
            </div>
        `;

        DOM.mainContent.innerHTML = html;
        tg.BackButton.show();
        tg.BackButton.onClick(() => this.showCarDetails(carId));
    },

    navigateTo(view) {
        Utils.log(`Переход на экран: ${view}`);
        AppState.currentView = view;

        // Обновление активной вкладки
        DOM.tabbarItems.forEach(item => {
            item.classList.remove('active');
        });
        document.getElementById(`${view}-tab`)?.classList.add('active');

        // Показ соответствующего контента
        switch (view) {
            case 'main':
                this.renderCars();
                tg.BackButton.hide();
                break;

            case 'history':
                this.showHistoryView();
                tg.BackButton.show();
                tg.BackButton.onClick(() => this.navigateTo('main'));
                break;

            case 'profile':
                this.showProfileView();
                tg.BackButton.show();
                tg.BackButton.onClick(() => this.navigateTo('main'));
                break;
        }
    },

    showHistoryView() {
        // Заглушка для истории
        const html = `
            <div class="history-view">
                <h2>История поездок</h2>
                <p>Здесь будет отображаться история всех ваших поездок</p>
                <div class="placeholder">
                    <p>Функция находится в разработке</p>
                </div>
            </div>
        `;

        DOM.mainContent.innerHTML = html;
    },

    showProfileView() {
        const user = AppState.currentUser;
        const html = `
            <div class="profile-view">
                <h2>Профиль</h2>
                <div class="profile-info">
                    <p><strong>Имя:</strong> ${user.name}</p>
                    <p><strong>Роль:</strong> ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                </div>
                <button class="btn btn-primary" onclick="App.logout()">
                    Выйти
                </button>
            </div>
        `;

        DOM.mainContent.innerHTML = html;
    },

    logout() {
        Utils.log('Выход из системы');
        tg.showAlert(`До свидания, ${AppState.currentUser.name}!`);

        // Сброс состояния
        AppState.currentUser = null;

        // Перезагрузка страницы
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
};

// Глобальные функции
window.showEstimate = function() {
    tg.showAlert('Смета согласована 15.04.2023. Общая сумма: 125 430 руб.');
};

window.showVisitDetail = function(visitId) {
    tg.showAlert(`Детали посещения #${visitId}`);
};

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Псевдоним для удобства
    window.App = App;

    // Запуск приложения
    App.init();
});
