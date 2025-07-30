/**
 * AutoBodyCare - Приложение для кузовного ремонта
 * Версия 2.0
 */

// Конфигурация приложения
const Config = {
    APP_NAME: 'AutoBodyCare',
    API_BASE_URL: 'https://api.autobodycare.example/v1',
    DEBUG_MODE: true,
    DEFAULT_CAR_IMAGE: 'https://via.placeholder.com/300x200?text=AutoBodyCare',
    THEME_COLORS: {
        primary: '#4361EE',
        secondary: '#3F37C9',
        accent: '#4895EF',
        danger: '#F72585',
        success: '#4CC9F0'
    },
    TEST_USER: {
        username: 'user',
        password: '123',
        name: 'Иван Петров',
        phone: '+7 (912) 345-67-89',
        email: 'ivan.petrov@example.com'
    }
};

// Состояние приложения
const State = {
    currentUser: null,
    currentView: 'main',
    currentCarId: null,
    cars: [],
    serviceHistory: [],
    isLoading: false
};

// DOM элементы
const DOM = {
    splash: document.getElementById('splash'),
    authView: document.getElementById('auth-view'),
    loginForm: document.getElementById('login-form'),
    app: document.getElementById('app'),
    mainContent: document.getElementById('main-content'),
    currentScreenTitle: document.getElementById('current-screen-title'),

    // Views
    carsListView: document.getElementById('cars-list-view'),
    carDetailsView: document.getElementById('car-details-view'),
    historyView: document.getElementById('history-view'),
    profileView: document.getElementById('profile-view'),

    // Tabbar
    tabbarItems: document.querySelectorAll('.tabbar-item'),

    // Car details elements
    carModel: document.getElementById('car-model'),
    carPlate: document.getElementById('car-plate'),
    carVin: document.getElementById('car-vin'),
    carYear: document.getElementById('car-year'),
    carMileage: document.getElementById('car-mileage'),
    carStatus: document.getElementById('car-status'),
    carWorkType: document.getElementById('car-work-type')
};

// Утилиты
const Utils = {
    log(message, data = null) {
        if (Config.DEBUG_MODE) {
            console.log(`[${Config.APP_NAME}] ${message}`, data || '');
        }
    },

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    },

    showLoader() {
        DOM.mainContent.innerHTML = `
      <div class="loader-container">
        <div class="loader-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    `;
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    },

    handleError(error) {
        Utils.log('Ошибка:', error);
        Utils.showToast(error.message || 'Произошла ошибка', 'error');
    }
};

// API методы (заглушки для демонстрации)
const Api = {
    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === Config.TEST_USER.username && password === Config.TEST_USER.password) {
                    resolve({ ...Config.TEST_USER, token: 'mock-token-12345' });
                } else {
                    reject(new Error('Неверный логин или пароль'));
                }
            }, 800);
        });
    },

    async getCars() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        model: 'Volkswagen Tiguan',
                        plate: 'А123БВ777',
                        vin: 'WVGZZZ5NZJW123456',
                        year: 2019,
                        mileage: 45230,
                        status: 'in_progress',
                        workType: 'body_repair',
                        image: Config.DEFAULT_CAR_IMAGE,
                        lastServiceDate: '2023-04-15'
                    },
                    {
                        id: 2,
                        model: 'Kia Sportage',
                        plate: 'Х987УК177',
                        vin: 'KNDPMCAC5M7123456',
                        year: 2021,
                        mileage: 18750,
                        status: 'completed',
                        workType: 'painting',
                        image: Config.DEFAULT_CAR_IMAGE,
                        lastServiceDate: '2023-01-10'
                    }
                ]);
            }, 600);
        });
    },

    async getServiceHistory(carId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const histories = {
                    1: [
                        {
                            id: 101,
                            date: '2023-04-15',
                            serviceType: 'body_repair',
                            description: 'Устранение повреждений правого борта',
                            mileage: 45230,
                            cost: 87500,
                            parts: [
                                { name: 'Крыло правое', price: 32500 },
                                { name: 'Покраска', price: 55000 }
                            ]
                        },
                        {
                            id: 102,
                            date: '2023-01-10',
                            serviceType: 'maintenance',
                            description: 'Плановое ТО',
                            mileage: 42000,
                            cost: 12500,
                            parts: [
                                { name: 'Масло двигателя', price: 4500 },
                                { name: 'Фильтр масляный', price: 1500 },
                                { name: 'Фильтр воздушный', price: 2000 },
                                { name: 'Работа', price: 4500 }
                            ]
                        }
                    ],
                    2: [
                        {
                            id: 201,
                            date: '2023-03-20',
                            serviceType: 'painting',
                            description: 'Покраска капота и крыши',
                            mileage: 18750,
                            cost: 68500,
                            parts: [
                                { name: 'Материалы', price: 48500 },
                                { name: 'Работа', price: 20000 }
                            ]
                        }
                    ]
                };

                resolve(histories[carId] || []);
            }, 500);
        });
    }
};

// Основной класс приложения
class AutoBodyCareApp {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Обработчик формы входа
        DOM.loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Обработчики навигации
        DOM.tabbarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.id.replace('-tab', '');
                this.navigateTo(view);
            });
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            Utils.showToast('Введите логин и пароль', 'error');
            return;
        }

        try {
            Utils.showLoader();
            const user = await Api.login(username, password);
            await this.handleSuccessfulLogin(user);
        } catch (error) {
            Utils.handleError(error);
        }
    }

    async handleSuccessfulLogin(user) {
        State.currentUser = user;
        Utils.log(`Пользователь авторизован: ${user.name}`);

        // Загружаем данные автомобилей
        try {
            State.cars = await Api.getCars();
            this.renderCarsList();
        } catch (error) {
            Utils.handleError(error);
        }

        // Показываем основное приложение
        DOM.authView.style.opacity = '0';
        setTimeout(() => {
            DOM.authView.style.display = 'none';
            DOM.app.classList.add('show');
            this.navigateTo('main');
        }, 500);
    }

    navigateTo(view, params = {}) {
        State.currentView = view;

        // Обновляем активную вкладку
        DOM.tabbarItems.forEach(item => item.classList.remove('active'));
        document.getElementById(`${view}-tab`)?.classList.add('active');

        // Обновляем заголовок
        const titles = {
            main: 'Мои автомобили',
            history: 'История обслуживания',
            profile: 'Мой профиль'
        };
        DOM.currentScreenTitle.textContent = titles[view];

        // Скрываем все view
        DOM.carsListView.style.display = 'none';
        DOM.carDetailsView.style.display = 'none';
        DOM.historyView.style.display = 'none';
        DOM.profileView.style.display = 'none';

        // Показываем нужную view
        switch (view) {
            case 'main':
                DOM.carsListView.style.display = 'block';
                this.renderCarsList();
                break;

            case 'history':
                DOM.historyView.style.display = 'block';
                if (State.currentCarId) {
                    this.renderServiceHistory(State.currentCarId);
                }
                break;

            case 'profile':
                DOM.profileView.style.display = 'block';
                this.renderProfile();
                break;
        }
    }

    renderCarsList() {
        if (!State.cars.length) {
            DOM.carsListView.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-car"></i>
          <p>Нет добавленных автомобилей</p>
        </div>
      `;
            return;
        }

        DOM.carsListView.innerHTML = State.cars.map(car => `
      <div class="car-card" data-car-id="${car.id}" onclick="App.showCarDetails(${car.id})">
        <div class="car-status ${car.status === 'completed' ? 'completed' : ''}">
          ${car.status === 'completed' ? 'Готов' : 'В работе'}
        </div>
        <h2><i class="fas fa-car"></i> ${car.model}</h2>
        <p>Госномер: ${car.plate}</p>
        <p>Год выпуска: ${car.year}</p>
        <div class="car-meta">
          <span><i class="fas fa-tachometer-alt"></i> ${Utils.formatNumber(car.mileage)} км</span>
          <span><i class="fas fa-wrench"></i> ${this.getWorkTypeName(car.workType)}</span>
        </div>
      </div>
    `).join('');
    }

    async showCarDetails(carId) {
        State.currentCarId = carId;
        const car = State.cars.find(c => c.id === carId);

        if (!car) {
            Utils.showToast('Автомобиль не найден', 'error');
            return;
        }

        // Обновляем данные в карточке автомобиля
        DOM.carModel.textContent = car.model;
        DOM.carPlate.textContent = car.plate;
        DOM.carVin.textContent = car.vin;
        DOM.carYear.textContent = car.year;
        DOM.carMileage.textContent = `${Utils.formatNumber(car.mileage)} км`;
        DOM.carStatus.textContent = car.status === 'completed' ? 'Готов' : 'В работе';
        DOM.carWorkType.textContent = this.getWorkTypeName(car.workType);

        // Показываем карточку
        DOM.carsListView.style.display = 'none';
        DOM.carDetailsView.style.display = 'block';
        DOM.currentScreenTitle.textContent = car.model;

        // Загружаем историю обслуживания
        try {
            State.serviceHistory = await Api.getServiceHistory(carId);
        } catch (error) {
            Utils.handleError(error);
        }
    }

    renderServiceHistory(carId) {
        if (!State.serviceHistory.length) {
            DOM.historyView.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history"></i>
          <p>Нет данных об обслуживании</p>
        </div>
      `;
            return;
        }

        DOM.historyView.innerHTML = `
      <div class="history-list">
        <h2><i class="fas fa-history"></i> История обслуживания</h2>
        ${State.serviceHistory.map(service => `
          <div class="history-item">
            <h3>
              <span class="history-date">${Utils.formatDate(service.date)}</span> - 
              ${this.getServiceTypeName(service.serviceType)}
            </h3>
            <p><i class="fas fa-info-circle"></i> ${service.description}</p>
            <p><i class="fas fa-tachometer-alt"></i> Пробег: ${Utils.formatNumber(service.mileage)} км</p>
            <p><i class="fas fa-ruble-sign"></i> Стоимость: ${Utils.formatNumber(service.cost)} руб.</p>
            ${service.parts?.length ? `
              <div class="parts-list">
                <p><strong>Запчасти:</strong></p>
                <ul>
                  ${service.parts.map(part => `
                    <li>${part.name} - ${Utils.formatNumber(part.price)} руб.</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
    }

    renderProfile() {
        if (!State.currentUser) return;

        DOM.profileView.innerHTML = `
      <div class="profile-view">
        <h2><i class="fas fa-user"></i> Мой профиль</h2>
        
        <div class="profile-info">
          <p><strong><i class="fas fa-user-tie"></i> Имя:</strong> ${State.currentUser.name}</p>
          <p><strong><i class="fas fa-phone"></i> Телефон:</strong> ${State.currentUser.phone}</p>
          <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${State.currentUser.email}</p>
          <p><strong><i class="fas fa-car"></i> Автомобилей:</strong> ${State.cars.length}</p>
        </div>
        
        <button class="btn btn-primary" onclick="App.logout()">
          <i class="fas fa-sign-out-alt"></i> Выйти
        </button>
      </div>
    `;
    }

    getWorkTypeName(type) {
        const types = {
            'body_repair': 'Кузовной ремонт',
            'painting': 'Покраска',
            'maintenance': 'Техобслуживание',
            'diagnostics': 'Диагностика'
        };
        return types[type] || type;
    }

    getServiceTypeName(type) {
        const types = {
            'body_repair': 'Кузовной ремонт',
            'painting': 'Покраска',
            'maintenance': 'Техническое обслуживание',
            'diagnostics': 'Диагностика'
        };
        return types[type] || type;
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            State.currentUser = null;
            State.cars = [];
            State.serviceHistory = [];

            DOM.app.classList.remove('show');
            DOM.authView.style.display = 'flex';
            DOM.authView.style.opacity = '1';

            // Сбрасываем форму входа
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Делаем App глобальным для обработчиков в HTML
    window.App = new AutoBodyCareApp();

    // Запускаем splash screen
    setTimeout(() => {
        document.getElementById('splash').style.opacity = '0';
        document.getElementById('auth-view').classList.add('show');

        setTimeout(() => {
            document.getElementById('splash').style.display = 'none';
        }, 500);
    }, 1500);
});
