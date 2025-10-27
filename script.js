// Основные константы и переменные (глобальные)
var carsDatabase = [];
var clientsDatabase = [];
var currentDragItem = null;
var currentEditingCarId = null;
var autoSaveTimeout = null;
var isScrollEnabled = false;
var serviceHistoryDB = {};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    App.init();
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';

    // Инициализация обработчиков событий
    const phoneInput = document.getElementById('new-car-owner-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }

    // Добавляем обработчик ресайза
    window.addEventListener('resize', function() {
        if (document.getElementById('app').classList.contains('show')) {
            App.checkScrollNeeded();
        }
    });
});

// Клиентское приложение (глобальное)
var App = {
    currentView: 'main',
    currentCar: null,
    historyCarId: null,
    carouselState: null,
    repairCarouselState: null,

    init() {
        this.historyCarId = null;
        this.initTestData();
        this.updateSafeAreaPadding();

        setTimeout(() => {
            document.getElementById('splash').style.opacity = '0';
            document.getElementById('auth-view').classList.add('show');

            setTimeout(() => {
                document.getElementById('splash').style.display = 'none';
            }, 500);

            document.getElementById('username').focus();
        }, 1500);

        document.getElementById('login-form').onsubmit = (e) => {
            e.preventDefault();
            this.handleLogin();
        };

        // Инициализация наблюдателя за изменениями DOM
        this.initDOMObserver();
    },

    initDOMObserver() {
        const observer = new MutationObserver(() => {
            if (document.getElementById('app').classList.contains('show')) {
                this.checkScrollNeeded();
            }
        });

        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            observer.observe(mainContent, {
                subtree: true,
                childList: true,
                characterData: true
            });
        }
    },

    checkScrollNeeded: function() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Проверяем, нужен ли скролл
        const needsScroll = mainContent.scrollHeight > mainContent.clientHeight;

        if (needsScroll !== isScrollEnabled) {
            isScrollEnabled = needsScroll;
            document.body.classList.toggle('no-scroll', !needsScroll);
            mainContent.style.overflowY = needsScroll ? 'auto' : 'hidden';
        }
    },

    updateSafeAreaPadding: function() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS) {
            document.body.classList.add('ios-device');
            console.log('iOS device detected - applying safe area padding');
        }
    },

    applyIOSFixes: function() {
        if (document.body.classList.contains('ios-device')) {
            // Динамически обновляем отступы для безопасных зон
            const elements = document.querySelectorAll('.main-content, .profile-view, .car-details-compact');
            elements.forEach(el => {
                const currentPadding = parseInt(getComputedStyle(el).paddingTop) || 20;
                el.style.paddingTop = `calc(${currentPadding}px + env(safe-area-inset-top))`;
            });
        }
    },

    showOnlineBooking: function() {
        alert('🚧 Функция "Запись онлайн" находится в разработке\n\nМы активно работаем над этой функцией и скоро она будет доступна!');
    },

    initTestData() {
        carsDatabase = [
            {
                id: 1,
                number: "А123БВ777",
                brand: "Volkswagen",
                model: "Tiguan",
                year: 2019,
                vin: "WVGZZZ5NZJW123456",
                odometer: "45230",
                status: "painting",
                description: "Кузовной ремонт после ДТП",
                clientId: 1,
                photos: {
                    diagnostic: [
                        {
                            id: 1,
                            dataUrl: 'images/Photo_1.jpg',
                            caption: 'Первичный осмотр повреждений',
                            uploadedAt: '2023-05-10',
                            status: 'diagnostic'
                        }
                    ],
                    repair: [
                        {
                            id: 2,
                            dataUrl: 'images/Photo_2.jpg',
                            caption: 'Рихтовка правого крыла',
                            uploadedAt: '2023-05-12',
                            status: 'repair'
                        },
                        {
                            id: 3,
                            dataUrl: 'images/Photo_2.jpg',
                            caption: 'Замена элементов кузова',
                            uploadedAt: '2023-05-13',
                            status: 'repair'
                        }
                    ],
                    painting: [],
                    ready: [],
                    completed: []
                },
                documents: {
                    'work-certificate': [
                        {
                            id: 1,
                            name: 'Акт выполненных работ.pdf',
                            type: 'pdf',
                            size: '2.4 MB',
                            date: '15.05.2023',
                            url: '#'
                        }
                    ],
                    'payment-receipt': [
                        {
                            id: 2,
                            name: 'Чек об оплате.jpg',
                            type: 'image',
                            size: '1.2 MB',
                            date: '15.05.2023',
                            url: '#'
                        }
                    ],
                    'invoice': [
                        {
                            id: 3,
                            name: 'Счет-фактура №123.pdf',
                            type: 'pdf',
                            size: '1.8 MB',
                            date: '14.05.2023',
                            url: '#'
                        }
                    ],
                    'contract': [
                        {
                            id: 4,
                            name: 'Договор на ремонт.docx',
                            type: 'doc',
                            size: '3.1 MB',
                            date: '10.05.2023',
                            url: '#'
                        }
                    ],
                    'warranty': [
                        {
                            id: 5,
                            name: 'Гарантийный талон.pdf',
                            type: 'pdf',
                            size: '0.9 MB',
                            date: '15.05.2023',
                            url: '#'
                        }
                    ]
                },
                repairStatus: [
                    {
                        id: 1,
                        date: '11.05.2023',
                        title: 'Приемка автомобиля',
                        description: 'Автомобиль принят на плановое ТО',
                        status: 'completed'
                    },
                    {
                        id: 2,
                        date: '11.05.2023',
                        title: 'Замена масла в ДВС',
                        description: 'Отработанное масло слито из автомобиля',
                        status: 'completed'
                    },
                    {
                        id: 3,
                        date: '11.05.2023',
                        title: 'Замена масла в ДВС',
                        description: 'Заменен масляный фильтр',
                        status: 'completed'
                    },
                    {
                        id: 4,
                        date: '11.05.2023',
                        title: 'Замена масла в ДВС',
                        description: 'Залито новое масло в ДВС',
                        status: 'completed'
                    },
                    {
                        id: 5,
                        date: '11.05.2023',
                        title: 'Готов к выдаче',
                        description: 'Автомобиль готов к выдаче',
                        status: 'completed'
                    },
                    {
                        id: 6,
                        date: '11.05.2023',
                        title: 'Выдан клиенту',
                        description: 'Автомобиль выдан клиенту',
                        status: 'completed'
                    },
                ]
            },
            {
                id: 2,
                number: "Х987УК177",
                brand: "Kia",
                model: "Sportage",
                year: 2021,
                vin: "KNDPMCAC5M7123456",
                odometer: "18750",
                status: "completed",
                description: "Покраска переднего бампера",
                clientId: 2,
                photos: {
                    diagnostic: [
                        {
                            id: 4,
                            dataUrl: 'images/diagnostic-1.jpg',
                            caption: 'Осмотр бампера на повреждения',
                            uploadedAt: '2023-05-01',
                            status: 'diagnostic'
                        }
                    ],
                    repair: [
                        {
                            id: 5,
                            dataUrl: 'images/repair-1.jpg',
                            caption: 'Подготовка поверхности бампера',
                            uploadedAt: '2023-05-02',
                            status: 'repair'
                        },
                        {
                            id: 6,
                            dataUrl: 'images/repair-2.jpg',
                            caption: 'Шлифовка бампера',
                            uploadedAt: '2023-05-03',
                            status: 'repair'
                        }
                    ],
                    painting: [],
                    ready: [],
                    completed: []
                },
                documents: {
                    'work-certificate': [
                        {
                            id: 1,
                            name: 'Акт выполненных работ.pdf',
                            type: 'pdf',
                            size: '1.5 MB',
                            date: '07.05.2023',
                            url: '#'
                        }
                    ],
                    'payment-receipt': [
                        {
                            id: 2,
                            name: 'Квитанция об оплате.png',
                            type: 'image',
                            size: '0.8 MB',
                            date: '07.05.2023',
                            url: '#'
                        }
                    ],
                    'invoice': [
                        {
                            id: 3,
                            name: 'Счет №456.pdf',
                            type: 'pdf',
                            size: '1.2 MB',
                            date: '06.05.2023',
                            url: '#'
                        }
                    ],
                    'contract': [
                        {
                            id: 4,
                            name: 'Договор на покраску.docx',
                            type: 'doc',
                            size: '2.3 MB',
                            date: '01.05.2023',
                            url: '#'
                        }
                    ],
                    'warranty': [
                        {
                            id: 5,
                            name: 'Гарантия 12 месяцев.pdf',
                            type: 'pdf',
                            size: '0.7 MB',
                            date: '07.05.2023',
                            url: '#'
                        }
                    ]
                },
                repairStatus: [
                    {
                        id: 1,
                        date: '01.05.2023',
                        title: 'Приемка автомобиля',
                        description: 'Автомобиль принят на покраску бампера',
                        status: 'completed'
                    },
                    {
                        id: 2,
                        date: '02.05.2023',
                        title: 'Дефектовка',
                        description: 'Оценка состояния бампера',
                        status: 'completed'
                    },
                    {
                        id: 3,
                        date: '03.05.2023',
                        title: 'Подготовка к покраске',
                        description: 'Шлифовка и грунтовка бампера',
                        status: 'completed'
                    },
                    {
                        id: 4,
                        date: '04.05.2023',
                        title: 'Покраска',
                        description: 'Нанесение лакокрасочного покрытия',
                        status: 'completed'
                    },
                    {
                        id: 5,
                        date: '05.05.2023',
                        title: 'Сборка',
                        description: 'Установка бампера на автомобиль',
                        status: 'completed'
                    },
                    {
                        id: 6,
                        date: '06.05.2023',
                        title: 'Готов к выдаче',
                        description: 'Автомобиль прошел контроль качества',
                        status: 'completed'
                    },
                    {
                        id: 7,
                        date: '07.05.2023',
                        title: 'Выдан клиенту',
                        description: 'Клиент забрал автомобиль',
                        status: 'completed'
                    }
                ]
            }
        ];

        clientsDatabase = [
            { id: 1, name: "Иван Петров", phone: "+79123456789", email: "ivan.petrov@example.com", cars: [1] },
            { id: 2, name: "Мария Сидорова", phone: "+79129876543", email: "maria.sidorova@example.com", cars: [2] }
        ];

        updateCarsTable();
        updateClientsTable();

        serviceHistoryDB = {
            1: [
                {
                    id: 1,
                    date: '11.05.2023',
                    startDate: '11.05.2023',
                    endDate: '11.05.2023',
                    type: 'Замена масла в ДВС',
                    title: 'Плановое ТО',
                    mileage: '45,230 км',
                    photos: [
                        {
                            id: 1,
                            dataUrl: 'images/Photo_1.jpg',
                            caption: 'Повреждения до ремонта',
                            uploadedAt: '2023-05-10'
                        },
                        {
                            id: 2,
                            dataUrl: 'images/Photo_2.jpg',
                            caption: 'Процесс ремонта',
                            uploadedAt: '2023-05-12'
                        }
                    ],
                    documents: [
                        {
                            id: 1,
                            name: 'Акт выполненных работ.pdf',
                            type: 'pdf',
                            size: '2.4 MB',
                            date: '15.05.2023',
                            url: '#'
                        }
                    ]
                }
            ],
            2: [
                {
                    id: 1,
                    date: '07.05.2023',
                    startDate: '01.05.2023',
                    endDate: '07.05.2023',
                    type: 'Покраска',
                    title: 'Покраска переднего бампера',
                    description: 'Полная покраска переднего бампера с подготовкой поверхности',
                    mileage: '18,750 км',
                    totalCost: 25000,
                    photos: [
                        {
                            id: 1,
                            dataUrl: 'images/diagnostic-1.jpg',
                            caption: 'Бампер до покраски',
                            uploadedAt: '2023-05-01'
                        }
                    ],
                    documents: [
                        {
                            id: 1,
                            name: 'Акт выполненных работ.pdf',
                            type: 'pdf',
                            size: '1.5 MB',
                            date: '07.05.2023',
                            url: '#'
                        }
                    ]
                }
            ]
        };
    },

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Введите логин и пароль');
            return;
        }

        document.getElementById('auth-view').style.opacity = '0';

        setTimeout(() => {
            document.getElementById('auth-view').style.display = 'none';

            if (username === '1' && password === '1') {
                // Regular user - hide header and add user mode class
                document.getElementById('app').classList.add('show', 'user-mode');
                document.getElementById('user-tabbar').style.display = 'flex';
                document.getElementById('admin-tabbar').style.display = 'none';
                document.getElementById('app-header').style.display = 'none';

                this.initUserInterface();
                this.navigateTo('main');
            } else if (username === '2' && password === '2') {
                // Admin user - remove user mode class and show admin interface
                document.getElementById('app').classList.remove('user-mode');
                document.getElementById('adminSection').style.display = 'block';
                document.getElementById('user-tabbar').style.display = 'none';
                document.getElementById('admin-tabbar').style.display = 'flex';
                document.getElementById('app').style.display = 'none';
                document.getElementById('app-header').style.display = 'block';

                updateCarsTable();
                updateClientsTable();
            } else {
                alert('Неверный логин или пароль');
                document.getElementById('auth-view').style.display = 'flex';
                document.getElementById('auth-view').style.opacity = '1';
            }
        }, 500);
    },

    initUserInterface() {
        this.updateCarsList();
        this.updateProfile();
        document.getElementById('current-screen-title').textContent = 'Мои автомобили';
        document.getElementById('cars-list-view').style.display = 'block';
        document.getElementById('car-details-view').style.display = 'none';
        document.getElementById('history-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';

        // Проверяем нужен ли скролл после инициализации
        setTimeout(() => this.checkScrollNeeded(), 100);
    },

    updateCarsList() {
        const carsList = document.getElementById('cars-list-view');
        if (!carsList) return;

        carsList.innerHTML = '';
        carsDatabase.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.setAttribute('data-car-id', car.id);
            carCard.onclick = () => this.showCarDetails(car.id);
            carCard.innerHTML = `
            <h2><i class="fas fa-car"></i> ${car.brand} ${car.model}</h2>
            <p>Госномер: ${car.number}</p>
            <div class="car-meta">
                <span><i class="fas fa-tachometer-alt"></i> ${car.odometer || '0'} км</span>
            </div>
        `;
            carsList.appendChild(carCard);
        });

        this.checkScrollNeeded();
    },

    showCarDetails(carId) {
        const adminSection = document.getElementById('adminSection');
        const isAdmin = adminSection && adminSection.style.display === 'block';
        if (isAdmin) {
            Admin.showEditCarForm(carId);
            return;
        }

        this.currentCar = carId;
        const car = carsDatabase.find(c => c.id === carId);

        if (!car) {
            alert('Автомобиль не найден!');
            return;
        }

        this.updateElementText('car-model', `${car.brand} ${car.model}`);
        this.updateElementText('car-plate', car.number);
        this.updateElementText('car-vin', car.vin || 'Не указан');
        this.updateElementText('car-year', car.year || 'Не указан');
        this.updateElementText('car-mileage', car.odometer ? `${car.odometer} км` : 'Не указан');

        this.updateRepairStatus(car.repairStatus || []);
        this.updatePhotoGallery(car.photos || [], 'modern-gallery');
        this.updateDocuments(car.documents || []);
        this.updateDocumentsCount(car.documents || []);

        this.hideElement('cars-list-view');
        this.showElement('car-details-view');

        const titleElement = document.getElementById('current-screen-title');
        if (titleElement) titleElement.textContent = `${car.brand} ${car.model}`;

        // Проверяем нужен ли скролл после загрузки деталей
        setTimeout(() => this.checkScrollNeeded(), 100);
    },

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = text;
    },

    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'block';
    },

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) element.style.display = 'none';
    },

    navigateTo(view) {
        this.currentView = view;

        // Сбрасываем состояние истории при переходе на эту вкладку
        if (view === 'history') {
            this.historyCarId = null;
            // Всегда показываем выбор автомобиля при переходе на вкладку истории
            this.showCarSelectionHistory();
        }

        document.querySelectorAll('#user-tabbar .tabbar-item').forEach(item => {
            item.classList.remove('active');
        });

        const viewTab = document.getElementById(`${view}-tab`);
        if (viewTab) {
            viewTab.classList.add('active');
        }

        // Скрываем все view
        ['cars-list-view', 'car-details-view', 'history-view', 'profile-view'].forEach(viewId => {
            const element = document.getElementById(viewId);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Показываем нужную view
        switch(view) {
            case 'main':
                document.getElementById('cars-list-view').style.display = 'block';
                this.updateCarsList();
                break;
            case 'history':
                document.getElementById('history-view').style.display = 'block';
                // Теперь всегда показываем выбор автомобиля
                this.showCarSelectionHistory();
                break;
            case 'profile':
                document.getElementById('profile-view').style.display = 'block';
                this.updateProfile();
                break;
        }

        setTimeout(() => this.checkScrollNeeded(), 100);
        setTimeout(() => this.applyIOSFixes(), 100);
    },

    goBackToHistory: function() {
        document.getElementById('repair-details-view').style.display = 'none';
        document.getElementById('history-car-view').style.display = 'block';
    },

    navigateToHistoryFromCar: function(carId) {
        this.historyCarId = carId;
        this.navigateTo('history');
        this.showCarHistory(carId);
    },

    showCarHistory: function(carId) {
        console.log('Showing history for car:', carId);

        const car = carsDatabase.find(c => c.id === carId);
        if (!car) {
            console.error('Car not found:', carId);
            alert('Автомобиль не найден!');
            return;
        }

        // Показываем правильные элементы
        document.getElementById('history-selection-view').style.display = 'none';
        document.getElementById('history-car-view').style.display = 'block';
        document.getElementById('repair-details-view').style.display = 'none';

        // Рендерим историю ремонтов
        this.renderServiceHistory(carId);

        setTimeout(() => this.checkScrollNeeded(), 100);
    },

    showRepairDetails: function(carId, repairId) {
        console.log('Showing repair details:', carId, repairId);

        const repairs = serviceHistoryDB[carId];
        if (!repairs) {
            console.error('No repairs found for car:', carId);
            return;
        }

        const repair = repairs.find(r => r.id === repairId);
        if (!repair) {
            console.error('Repair not found:', repairId);
            return;
        }

        // Скрываем список и показываем детали
        document.getElementById('history-car-view').style.display = 'none';
        document.getElementById('repair-details-view').style.display = 'block';

        // Заполняем информацию о ремонте
        const infoGrid = document.getElementById('repair-info-grid');
        infoGrid.innerHTML = `
    <div class="info-item">
        <span class="info-label">Дата ремонта:</span>
        <span class="info-value">${repair.startDate || repair.date}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Пробег:</span>
        <span class="info-value">${repair.mileage}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Тип ремонта:</span>
        <span class="info-value">${repair.type}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Стоимость:</span>
        <span class="info-value">${repair.totalCost ? repair.totalCost.toLocaleString('ru-RU') : '0'} руб.</span>
    </div>
    <div class="info-item full-width">
        <span class="info-label">Описание:</span>
        <span class="info-value">${repair.description || 'Описание отсутствует :('}</span>
    </div>
`;

        // Обновляем фотографии
        this.updatePhotoGallery(repair.photos || [], 'repair-photos-gallery');
        document.getElementById('repair-photos-count').textContent =
            `${repair.photos ? repair.photos.length : 0} ${this.getWordForm(repair.photos ? repair.photos.length : 0, ['фото', 'фото', 'фото'])}`;

        // Обновляем документы
        this.updateDocumentsList(repair.documents || [], 'repair-documents-list');
        document.getElementById('repair-documents-count').textContent =
            `${repair.documents ? repair.documents.length : 0} ${this.getWordForm(repair.documents ? repair.documents.length : 0, ['документ', 'документа', 'документов'])}`;
    },

// Добавляем функцию для возврата из деталей ремонта
    goBackFromRepairDetails: function() {
        document.getElementById('repair-details-view').style.display = 'none';
        document.getElementById('history-car-view').style.display = 'block';
    },

    renderServiceHistory: function(carId) {
        const container = document.getElementById('repairs-list-container');
        const repairs = serviceHistoryDB[carId] || [];

        if (repairs.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-history" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 16px;"></i>
            <p style="color: var(--gray); text-align: center; padding: 40px;">История обслуживания отсутствует</p>
        </div>
    `;
            return;
        }

        // Сортируем ремонты по дате (новые сверху)
        const sortedRepairs = [...repairs].sort((a, b) => {
            return new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-'));
        });

        container.innerHTML = sortedRepairs.map(repair => `
    <div class="repair-card" onclick="App.showRepairDetails(${carId}, ${repair.id})">
        <div class="repair-header">
            <span class="repair-date">${repair.date}</span>
            <span class="repair-type">${repair.type}</span>
        </div>
        <h3 class="repair-title">${repair.title}</h3>
        <div class="repair-details">
            <span class="repair-mileage"><i class="fas fa-tachometer-alt"></i> ${repair.mileage}</span>
        </div>
        <div class="repair-meta">
            <span class="repair-photos-count ${repair.photos && repair.photos.length === 0 ? 'disabled' : ''}">
                <i class="fas fa-camera"></i> ${repair.photos ? repair.photos.length : 0}
            </span>
            <span class="repair-documents-count ${repair.documents && repair.documents.length === 0 ? 'disabled' : ''}">
                <i class="fas fa-file-alt"></i> ${repair.documents ? repair.documents.length : 0}
            </span>
        </div>
    </div>
`).join('');
    },

    showCarSelectionHistory: function() {
        this.historyCarId = null;
        document.getElementById('history-selection-view').style.display = 'block';
        document.getElementById('history-car-view').style.display = 'none';
        document.getElementById('repair-details-view').style.display = 'none';
        this.updateHistoryCarsList();
    },

    updateHistoryCarsList: function() {
        const historyCarsList = document.getElementById('history-cars-list');
        if (!historyCarsList) return;

        historyCarsList.innerHTML = '';

        if (carsDatabase.length === 0) {
            historyCarsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-car" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 16px;"></i>
                <p style="color: var(--gray); text-align: center;">У вас нет автомобилей в истории</p>
            </div>
        `;
            return;
        }

        carsDatabase.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.onclick = () => this.showCarHistory(car.id);
            carCard.innerHTML = `
            <h2><i class="fas fa-car"></i> ${car.brand} ${car.model}</h2>
            <p>Госномер: ${car.number}</p>
            <div class="car-meta">
                <span><i class="fas fa-tachometer-alt"></i> ${car.odometer || '0'} км</span>
                <span class="status-badge">${getStatusText(car.status)}</span>
            </div>
        `;
            historyCarsList.appendChild(carCard);
        });
    },

    showRepairDetails: function(carId, repairId) {
        console.log('Showing repair details:', carId, repairId);

        const repairs = serviceHistoryDB[carId];
        if (!repairs) {
            console.error('No repairs found for car:', carId);
            return;
        }

        const repair = repairs.find(r => r.id === repairId);
        if (!repair) {
            console.error('Repair not found:', repairId);
            return;
        }

        // Скрываем список и показываем детали
        document.getElementById('history-car-view').style.display = 'none';
        document.getElementById('repair-details-view').style.display = 'block';

        // Заполняем информацию о ремонте
        const infoGrid = document.getElementById('repair-info-grid');
        infoGrid.innerHTML = `
    <div class="info-item">
        <span class="info-label">Дата ремонта:</span>
        <span class="info-value">${repair.startDate || repair.date}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Пробег:</span>
        <span class="info-value">${repair.mileage}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Тип ремонта:</span>
        <span class="info-value">${repair.type}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Стоимость:</span>
        <span class="info-value">${repair.totalCost ? repair.totalCost.toLocaleString('ru-RU') : '0'} руб.</span>
    </div>
    <div class="info-item full-width">
        <span class="info-label">Описание:</span>
        <span class="info-value">${repair.description || 'Описание отсутствует'}</span>
    </div>
`;

        // Берем фотографии из первого автомобиля пользователя "1"
        const firstCar = carsDatabase.find(car => car.id === 1);
        let repairPhotos = repair.photos || [];

        // Если у ремонта нет фотографий, берем из первого автомобиля
        if (repairPhotos.length === 0 && firstCar) {
            // Собираем все фотографии из автомобиля
            const allCarPhotos = [];
            for (const status in firstCar.photos) {
                if (firstCar.photos[status] && Array.isArray(firstCar.photos[status])) {
                    allCarPhotos.push(...firstCar.photos[status]);
                }
            }
            repairPhotos = allCarPhotos.slice(0, 5); // Берем первые 5 фотографий
        }

        // Берем документы из первого автомобиля пользователя "1"
        let repairDocuments = repair.documents || [];

        // Если у ремонта нет документов, берем из первого автомобиля
        if (repairDocuments.length === 0 && firstCar) {
            // Собираем все документы из автомобиля
            const allCarDocuments = [];
            for (const type in firstCar.documents) {
                if (firstCar.documents[type] && Array.isArray(firstCar.documents[type])) {
                    allCarDocuments.push(...firstCar.documents[type]);
                }
            }
            repairDocuments = allCarDocuments.slice(0, 3); // Берем первые 3 документа
        }

        // Обновляем документы
        this.updateDocumentsList(repairDocuments, 'repair-documents-list');
        document.getElementById('repair-documents-count').textContent =
            `${repairDocuments.length} ${this.getWordForm(repairDocuments.length, ['документ', 'документа', 'документов'])}`;
    },

    updateDocumentsList: function(documents, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        if (!documents || documents.length === 0) {
            container.innerHTML = '<p class="empty-text">Документы отсутствуют</p>';
            return;
        }

        container.innerHTML = documents.map(doc => `
        <div class="document-item">
            <div class="document-icon"><i class="${this.getDocumentIcon(doc.type)}"></i></div>
            <div class="document-info">
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">${doc.date} · ${doc.size}</div>
            </div>
            <div class="document-actions">
                <button class="document-btn" onclick="App.downloadDocument('${doc.url || '#'}', '${doc.name}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="document-btn" onclick="App.shareDocument('${doc.url || '#'}', '${doc.name}')">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
    },

    updateHistoryCarsList: function() {
        const historyCarsList = document.getElementById('history-cars-list');
        if (!historyCarsList) return;

        historyCarsList.innerHTML = '';
        carsDatabase.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.onclick = () => this.showCarHistory(car.id);
            carCard.innerHTML = `
                <h2><i class="fas fa-car"></i> ${car.brand} ${car.model}</h2>
                <p>Госномер: ${car.number}</p>
                <div class="car-meta">
                    <span><i class="fas fa-tachometer-alt"></i> ${car.odometer || '0'} км</span>
                </div>
            `;
            historyCarsList.appendChild(carCard);
        });

        this.checkScrollNeeded();
    },

    showServiceHistory: function() {
        if (this.currentCar) {
            this.navigateToHistoryFromCar(this.currentCar);
        } else {
            this.historyCarId = null;
            this.navigateTo('history');
        }
    },

    updateRepairStatus(statusItems) {
        const timeline = document.getElementById('status-timeline');
        if (!timeline) return;

        timeline.innerHTML = '';
        if (statusItems.length === 0) {
            timeline.innerHTML = '<p style="padding: 16px; text-align: center; color: var(--gray);">Статусы ремонта пока отсутствуют</p>';
            return;
        }

        const sortedItems = [...statusItems].sort((a, b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));

        sortedItems.forEach(item => {
            const statusItem = document.createElement('div');
            statusItem.className = `status-item ${item.status}`;

            let statusIcon = 'fas fa-clock';
            let statusText = '';

            switch(item.status) {
                case 'completed':
                    statusIcon = 'fas fa-check-circle';
                    statusText = 'Завершено';
                    break;
                case 'active':
                    statusIcon = 'fas fa-spinner';
                    statusText = 'В процессе';
                    break;
                case 'pending':
                    statusIcon = 'fas fa-clock';
                    statusText = 'Ожидает';
                    break;
            }

            statusItem.innerHTML = `
                <div class="status-dot"></div>
                <div class="status-header">
                    <div class="status-date">${item.date}</div>
                    <div class="status-badge ${item.status}">
                        <i class="${statusIcon}"></i> ${statusText}
                    </div>
                </div>
                <div class="status-title">${item.title}</div>
                <div class="status-desc">${item.description}</div>
            `;

            timeline.appendChild(statusItem);
        });
    },

    updatePhotoGallery: function(photos, containerId) {
        const gallery = document.getElementById(containerId);
        if (!gallery) return;

        gallery.innerHTML = '';

        if (!photos || photos.length === 0) {
            gallery.innerHTML = `
            <div class="empty-gallery" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-camera" style="font-size: 3rem; margin-bottom: 16px; display: block; color: var(--gray-light);"></i>
                <p>Фотографии отсутствуют</p>
            </div>
        `;
            return;
        }

        // Собираем все фотографии в один массив
        const allPhotos = [];
        if (typeof photos === 'object' && !Array.isArray(photos)) {
            // Если photos - это объект с разными статусами (diagnostic, repair, painting и т.д.)
            for (const status in photos) {
                if (photos[status] && Array.isArray(photos[status])) {
                    allPhotos.push(...photos[status]);
                }
            }
        } else if (Array.isArray(photos)) {
            // Если photos - это простой массив
            allPhotos.push(...photos);
        }

        if (allPhotos.length === 0) {
            gallery.innerHTML = `
            <div class="empty-gallery" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-camera" style="font-size: 3rem; margin-bottom: 16px; display: block; color: var(--gray-light);"></i>
                <p>Фотографии отсутствуют</p>
            </div>
        `;
            return;
        }

        // Отображаем фотографии
        allPhotos.forEach((photo, index) => {
            const photoElement = document.createElement('div');
            photoElement.className = 'gallery-item';
            photoElement.onclick = () => App.openCarousel(allPhotos, index);

            const img = document.createElement('img');

            // Исправляем пути к изображениям
            let imageUrl = photo.dataUrl || photo.url;

            // Если это относительный путь, добавляем базовый URL
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                if (imageUrl.startsWith('images/')) {
                    // Оставляем как есть, если путь правильный
                } else if (!imageUrl.includes('/')) {
                    imageUrl = 'images/' + imageUrl;
                }
            }

            img.src = imageUrl;
            img.alt = photo.caption || 'Фото ремонта';
            img.loading = 'lazy';

            // Добавляем обработчик ошибок
            img.onerror = function() {
                console.error('Ошибка загрузки изображения:', imageUrl);
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                this.alt = 'Изображение не найдено';
            };

            // Убираем все подписи и баннеры - показываем только изображение
            photoElement.appendChild(img);
            gallery.appendChild(photoElement);
        });

        // Обновляем счетчик фотографий
        this.updatePhotosCount(allPhotos.length);
    },

// Упрощенный метод для открытия карусели
    openCarousel: function(photos, startIndex) {
        console.log('Opening carousel with photos:', photos);

        // Фильтруем только фотографии с валидными URL
        const validPhotos = photos.filter(photo => {
            const url = photo.dataUrl || photo.url;
            return url && (url.startsWith('http') || url.startsWith('data:') || url.includes('images/'));
        });

        if (validPhotos.length === 0) {
            alert('Нет доступных фотографий для просмотра');
            return;
        }

        this.carouselState = {
            photos: validPhotos,
            currentIndex: Math.min(startIndex, validPhotos.length - 1),
            total: validPhotos.length
        };

        const carousel = document.getElementById('gallery-carousel');
        const track = document.getElementById('carousel-track');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const indicators = document.getElementById('carousel-indicators');

        if (!carousel || !track) {
            console.error('Carousel elements not found');
            return;
        }

        // Очищаем и заполняем трек
        track.innerHTML = '';
        validPhotos.forEach((photo, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';

            const img = document.createElement('img');
            let imageUrl = photo.dataUrl || photo.url;

            // Исправляем пути к изображениям для карусели
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                if (imageUrl.startsWith('images/')) {
                    // Оставляем как есть
                } else if (!imageUrl.includes('/')) {
                    imageUrl = 'images/' + imageUrl;
                }
            }

            img.src = imageUrl;
            img.alt = photo.caption || 'Фото ремонта';
            img.loading = 'eager';

            img.onerror = function() {
                console.error('Error loading carousel image:', imageUrl);
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
            };

            // Добавляем подпись если есть
            if (photo.caption) {
                const caption = document.createElement('div');
                caption.className = 'carousel-caption';
                caption.textContent = photo.caption;
                slide.appendChild(caption);
            }

            slide.appendChild(img);
            track.appendChild(slide);
        });

        // Обновляем индикаторы
        indicators.innerHTML = '';
        validPhotos.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `carousel-indicator ${index === this.carouselState.currentIndex ? 'active' : ''}`;
            indicator.onclick = () => this.goToPhoto(index);
            indicators.appendChild(indicator);
        });

        // Показываем карусель
        carousel.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Устанавливаем начальную позицию
        this.goToPhoto(this.carouselState.currentIndex);

        console.log('Carousel opened successfully');
    },

// Также добавьте метод для обновления счетчика фотографий
    updatePhotosCount: function(count) {
        const countElement = document.getElementById('photos-count');
        if (countElement) {
            countElement.textContent = `${count} ${this.getWordForm(count, ['фото', 'фото', 'фото'])}`;
        }
    },

    showRepairDetails: function(carId, repairId) {
        console.log('Showing repair details:', carId, repairId);

        const repairs = serviceHistoryDB[carId];
        if (!repairs) {
            console.error('No repairs found for car:', carId);
            return;
        }

        const repair = repairs.find(r => r.id === repairId);
        if (!repair) {
            console.error('Repair not found:', repairId);
            return;
        }

        // Скрываем список и показываем детали
        document.getElementById('history-car-view').style.display = 'none';
        document.getElementById('repair-details-view').style.display = 'block';

        // Заполняем информацию о ремонте
        const infoGrid = document.getElementById('repair-info-grid');
        infoGrid.innerHTML = `
    <div class="info-item">
        <span class="info-label">Дата ремонта:</span>
        <span class="info-value">${repair.startDate || repair.date}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Пробег:</span>
        <span class="info-value">${repair.mileage}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Тип ремонта:</span>
        <span class="info-value">${repair.type}</span>
    </div>
    <div class="info-item">
        <span class="info-label">Стоимость:</span>
        <span class="info-value">${repair.totalCost ? repair.totalCost.toLocaleString('ru-RU') : '0'} руб.</span>
    </div>
    <div class="info-item full-width">
        <span class="info-label">Описание:</span>
        <span class="info-value">${repair.description || 'Описание отсутствует :('}</span>
    </div>
`;

        // Берем фотографии из первого автомобиля пользователя "1"
        const firstCar = carsDatabase.find(car => car.id === 1);
        let repairPhotos = repair.photos || [];

        // Если у ремонта нет фотографий, берем из первого автомобиля
        if (repairPhotos.length === 0 && firstCar) {
            // Собираем все фотографии из автомобиля
            const allCarPhotos = [];
            for (const status in firstCar.photos) {
                if (firstCar.photos[status] && Array.isArray(firstCar.photos[status])) {
                    allCarPhotos.push(...firstCar.photos[status]);
                }
            }
            repairPhotos = allCarPhotos.slice(0, 5); // Берем первые 5 фотографий
        }

        // Обновляем фотографии ремонта с использованием новой галереи
        this.updatePhotoGallery(repairPhotos, 'repair-photos-gallery');
        document.getElementById('repair-photos-count').textContent =
            `${repairPhotos.length} ${this.getWordForm(repairPhotos.length, ['фото', 'фото', 'фото'])}`;

        // Берем документы из первого автомобиля пользователя "1"
        let repairDocuments = repair.documents || [];

        // Если у ремонта нет документов, берем из первого автомобиля
        if (repairDocuments.length === 0 && firstCar) {
            // Собираем все документы из автомобиля
            const allCarDocuments = [];
            for (const type in firstCar.documents) {
                if (firstCar.documents[type] && Array.isArray(firstCar.documents[type])) {
                    allCarDocuments.push(...firstCar.documents[type]);
                }
            }
            repairDocuments = allCarDocuments.slice(0, 3); // Берем первые 3 документа
        }

        // Обновляем документы
        this.updateDocumentsList(repairDocuments, 'repair-documents-list');
        document.getElementById('repair-documents-count').textContent =
            `${repairDocuments.length} ${this.getWordForm(repairDocuments.length, ['документ', 'документа', 'документов'])}`;
    },

    // Методы для карусели ремонта
    openRepairCarousel: function(photos, startIndex) {
        // Фильтруем фотографии с корректными URL
        const validPhotos = photos.filter(photo =>
            photo.dataUrl || photo.url
        );

        if (validPhotos.length === 0) {
            alert('Нет доступных фотографий для просмотра');
            return;
        }

        this.repairCarouselState = {
            photos: validPhotos,
            currentIndex: Math.min(startIndex, validPhotos.length - 1),
            total: validPhotos.length
        };

        const carousel = document.getElementById('repair-gallery-carousel');
        const track = document.getElementById('repair-carousel-track');
        const prevBtn = document.getElementById('repair-carousel-prev');
        const nextBtn = document.getElementById('repair-carousel-next');
        const indicators = document.getElementById('repair-carousel-indicators');

        if (!carousel || !track) return;

        // Очищаем и заполняем трек
        track.innerHTML = '';
        validPhotos.forEach((photo, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';

            const img = document.createElement('img');
            img.src = photo.dataUrl || photo.url;
            img.alt = photo.caption || 'Фото ремонта';
            img.loading = 'eager';
            img.onerror = function() {
                // Запасное изображение при ошибке загрузки
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                this.alt = 'Изображение не найдено';
            };

            slide.appendChild(img);
            track.appendChild(slide);
        });

        // Обновляем индикаторы
        indicators.innerHTML = '';
        validPhotos.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `carousel-indicator ${index === this.repairCarouselState.currentIndex ? 'active' : ''}`;
            indicator.onclick = () => this.goToRepairPhoto(index);
            indicators.appendChild(indicator);
        });

        // Обновляем состояние кнопок навигации
        this.updateRepairNavButtons();

        // Показываем карусель
        carousel.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Устанавливаем начальную позицию
        this.goToRepairPhoto(this.repairCarouselState.currentIndex);

        // Добавляем обработчики жестов
        this.addRepairCarouselGestures();
    },

    updateRepairNavButtons: function() {
        const prevBtn = document.getElementById('repair-carousel-prev');
        const nextBtn = document.getElementById('repair-carousel-next');

        if (prevBtn) prevBtn.disabled = this.repairCarouselState.currentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.repairCarouselState.currentIndex === this.repairCarouselState.total - 1;
    },

    addRepairCarouselGestures: function() {
        const trackContainer = document.querySelector('#repair-gallery-carousel .carousel-track-container');
        if (!trackContainer) return;

        let startX = 0;
        let isDragging = false;
        const swipeThreshold = 50;

        const onStart = (e) => {
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            isDragging = true;
            document.querySelector('#repair-carousel-track').style.transition = 'none';
        };

        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
        };

        const onEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const diffX = endX - startX;

            document.querySelector('#repair-carousel-track').style.transition = 'transform 0.3s ease';

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    this.prevRepairPhoto();
                } else {
                    this.nextRepairPhoto();
                }
            } else {
                this.goToRepairPhoto(this.repairCarouselState.currentIndex);
            }
        };

        // Удаляем старые обработчики
        trackContainer.removeEventListener('touchstart', onStart);
        trackContainer.removeEventListener('touchmove', onMove);
        trackContainer.removeEventListener('touchend', onEnd);
        trackContainer.removeEventListener('mousedown', onStart);
        trackContainer.removeEventListener('mousemove', onMove);
        trackContainer.removeEventListener('mouseup', onEnd);
        trackContainer.removeEventListener('mouseleave', onEnd);

        // Добавляем новые обработчики
        trackContainer.addEventListener('touchstart', onStart);
        trackContainer.addEventListener('touchmove', onMove, { passive: false });
        trackContainer.addEventListener('touchend', onEnd);
        trackContainer.addEventListener('mousedown', onStart);
        trackContainer.addEventListener('mousemove', onMove);
        trackContainer.addEventListener('mouseup', onEnd);
        trackContainer.addEventListener('mouseleave', onEnd);
    },

    closeRepairCarousel: function() {
        const carousel = document.getElementById('repair-gallery-carousel');
        if (carousel) {
            carousel.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.repairCarouselState = null;
        }
    },

    prevRepairPhoto: function() {
        if (this.repairCarouselState && this.repairCarouselState.currentIndex > 0) {
            this.goToRepairPhoto(this.repairCarouselState.currentIndex - 1);
        }
    },

    nextRepairPhoto: function() {
        if (this.repairCarouselState && this.repairCarouselState.currentIndex < this.repairCarouselState.total - 1) {
            this.goToRepairPhoto(this.repairCarouselState.currentIndex + 1);
        }
    },

    goToRepairPhoto: function(index) {
        const track = document.getElementById('repair-carousel-track');
        const indicators = document.querySelectorAll('#repair-carousel-indicators .carousel-indicator');

        if (!track || index < 0 || index >= this.repairCarouselState.total) return;

        // Обновляем позицию трека
        track.style.transform = `translateX(-${index * 100}%)`;

        // Обновляем индикаторы
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Обновляем текущий индекс
        this.repairCarouselState.currentIndex = index;

        // Обновляем кнопки навигации
        this.updateRepairNavButtons();
    },

    updateDocumentsCount: function(documents) {
        const countElement = document.getElementById('documents-count');
        if (!countElement) return;

        let totalDocuments = 0;

        if (documents && typeof documents === 'object') {
            for (const type in documents) {
                if (documents[type] && Array.isArray(documents[type])) {
                    totalDocuments += documents[type].length;
                }
            }
        } else if (Array.isArray(documents)) {
            totalDocuments = documents.length;
        }

        countElement.textContent = `${totalDocuments} ${this.getWordForm(totalDocuments, ['документ', 'документа', 'документов'])}`;
    },

    openCarousel(photos, startIndex) {
        // Фильтруем фотографии с корректными URL
        const validPhotos = photos.filter(photo =>
            photo.dataUrl || photo.url
        );

        if (validPhotos.length === 0) {
            alert('Нет доступных фотографий для просмотра');
            return;
        }

        this.carouselState = {
            photos: validPhotos,
            currentIndex: Math.min(startIndex, validPhotos.length - 1),
            total: validPhotos.length
        };

        const carousel = document.getElementById('gallery-carousel');
        const track = document.getElementById('carousel-track');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        const indicators = document.getElementById('carousel-indicators');

        if (!carousel || !track) return;

        // Очищаем и заполняем трек
        track.innerHTML = '';
        validPhotos.forEach((photo, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';

            const img = document.createElement('img');
            img.src = photo.dataUrl || photo.url;
            img.alt = photo.caption || 'Фото ремонта';
            img.loading = 'eager';
            img.onerror = function() {
                // Запасное изображение при ошибке загрузки
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                this.alt = 'Изображение не найдено';
            };

            slide.appendChild(img);
            track.appendChild(slide);
        });

        // Обновляем индикаторы
        indicators.innerHTML = '';
        validPhotos.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `carousel-indicator ${index === this.carouselState.currentIndex ? 'active' : ''}`;
            indicator.onclick = () => this.goToPhoto(index);
            indicators.appendChild(indicator);
        });

        // Обновляем состояние кнопок навигации
        this.updateNavButtons();

        // Показываем карусель
        carousel.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Устанавливаем начальную позицию
        this.goToPhoto(this.carouselState.currentIndex);

        // Добавляем обработчики жестов
        this.addCarouselGestures();
    },

    updateNavButtons() {
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');

        if (prevBtn) prevBtn.disabled = this.carouselState.currentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.carouselState.currentIndex === this.carouselState.total - 1;
    },

    addCarouselGestures() {
        const trackContainer = document.querySelector('.carousel-track-container');
        if (!trackContainer) return;

        let startX = 0;
        let isDragging = false;
        const swipeThreshold = 50;

        const onStart = (e) => {
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            isDragging = true;
            document.querySelector('.carousel-track').style.transition = 'none';
        };

        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
        };

        const onEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            const diffX = endX - startX;

            document.querySelector('.carousel-track').style.transition = 'transform 0.3s ease';

            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    this.prevPhoto();
                } else {
                    this.nextPhoto();
                }
            } else {
                this.goToPhoto(this.carouselState.currentIndex);
            }
        };

        // Добавляем новые обработчики
        trackContainer.addEventListener('touchstart', onStart);
        trackContainer.addEventListener('touchmove', onMove, { passive: false });
        trackContainer.addEventListener('touchend', onEnd);
        trackContainer.addEventListener('mousedown', onStart);
        trackContainer.addEventListener('mousemove', onMove);
        trackContainer.addEventListener('mouseup', onEnd);
        trackContainer.addEventListener('mouseleave', onEnd);
    },

    closeCarousel() {
        const carousel = document.getElementById('gallery-carousel');
        if (carousel) {
            carousel.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.carouselState = null;
        }
    },

    prevPhoto() {
        if (this.carouselState && this.carouselState.currentIndex > 0) {
            this.goToPhoto(this.carouselState.currentIndex - 1);
        }
    },

    nextPhoto() {
        if (this.carouselState && this.carouselState.currentIndex < this.carouselState.total - 1) {
            this.goToPhoto(this.carouselState.currentIndex + 1);
        }
    },

    goToPhoto(index) {
        const track = document.getElementById('carousel-track');
        const indicators = document.querySelectorAll('.carousel-indicator');

        if (!track || index < 0 || index >= this.carouselState.total) return;

        // Обновляем позицию трека
        track.style.transform = `translateX(-${index * 100}%)`;

        // Обновляем индикаторы
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Обновляем текущий индекс
        this.carouselState.currentIndex = index;

        // Обновляем кнопки навигации
        this.updateNavButtons();
    },

    updateDocuments(documents) {
        const documentList = document.getElementById('document-list');
        if (!documentList) return;

        documentList.innerHTML = '';
        const allDocuments = [];
        for (const type in documents) {
            if (documents[type] && Array.isArray(documents[type])) allDocuments.push(...documents[type]);
        }

        if (allDocuments.length === 0) {
            documentList.innerHTML = '<p style="padding: 16px; text-align: center; color: var(--gray);">Документы пока отсутствуют</p>';
            return;
        }

        allDocuments.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'document-item';
            const icon = this.getDocumentIcon(doc.type);
            docItem.innerHTML = `
                <div class="document-icon"><i class="${icon}"></i></div>
                <div class="document-info">
                    <div class="document-name">${doc.name}</div>
                    <div class="document-meta">${doc.date} · ${doc.size}</div>
                </div>
                <div class="document-actions">
                    <button class="document-btn" onclick="App.downloadDocument('${doc.url}', '${doc.name}')"><i class="fas fa-download"></i></button>
                    <button class="document-btn" onclick="App.shareDocument('${doc.url}', '${doc.name}')"><i class="fas fa-share-alt"></i></button>
                </div>
            `;
            documentList.appendChild(docItem);
        });
    },

    updateDocumentsCount(documents) {
        const countElement = document.getElementById('documents-count');
        if (!countElement) return;
        let totalDocuments = 0;
        for (const type in documents) {
            if (documents[type] && Array.isArray(documents[type])) totalDocuments += documents[type].length;
        }
        countElement.textContent = `${totalDocuments} ${this.getWordForm(totalDocuments, ['документ', 'документа', 'документов'])}`;
    },

    getWordForm: function(number, forms) {
        number = Math.abs(number) % 100;
        const n1 = number % 10;
        if (number > 10 && number < 20) return forms[2];
        if (n1 > 1 && n1 < 5) return forms[1];
        if (n1 === 1) return forms[0];
        return forms[2];
    },

    getDocumentIcon(type) {
        switch(type) {
            case 'pdf': return 'fas fa-file-pdf';
            case 'doc': case 'docx': return 'fas fa-file-word';
            case 'xls': case 'xlsx': return 'fas fa-file-excel';
            case 'jpg': case 'png': case 'gif': return 'fas fa-file-image';
            default: return 'fas fa-file';
        }
    },

    downloadDocument(url, name) {
        alert(`Документ "${name}" будет скачан с URL: ${url}\n\nВ реальном приложении здесь будет реализовано скачивание файла.`);
    },

    shareDocument(url, name) {
        if (navigator.share) {
            navigator.share({ title: name, text: `Документ из автосервиса: ${name}`, url: url })
                .catch(err => {
                    console.error('Ошибка при попытке поделиться:', err);
                    alert('Не удалось поделиться документом. Скопируйте ссылку вручную.');
                });
        } else {
            alert(`Ссылка на документ "${name}": ${url}\n\nСкопируйте и отправьте вручную.`);
        }
    },

    updateProfile: function() {
        // Здесь должна быть логика получения данных пользователя
        // Пока используем тестовые данные
        this.updateElementText('profile-name', 'Иван Петров');
        this.updateElementText('profile-phone', '+7 (912) 345-67-89');
        this.updateElementText('profile-email', 'ivan.petrov@example.com');

        console.log('Profile updated successfully');
    },

    writeToManager() {
        const telegramUrl = 'https://t.me/MobileApps18';
        window.open(telegramUrl, '_blank');
    },

    callService() {
        if (confirm('Позвонить в автосервис?')) window.location.href = 'tel:+79998887766';
    },

    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            document.getElementById('app').classList.remove('show', 'user-mode');
            document.getElementById('adminSection').style.display = 'none';
            document.getElementById('user-tabbar').style.display = 'none';
            document.getElementById('admin-tabbar').style.display = 'none';

            document.getElementById('auth-view').style.display = 'flex';
            document.getElementById('auth-view').style.opacity = '1';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
        }
    }
};

// Администраторская панель
var Admin = {
    uploadedPhotos: [],
    uploadedDocuments: [],
    currentCar: null,
    currentPhotoStatus: null,
    tempNewCar: null,
    currentEditingClientId: null,
    currentModalView: 'edit-car', // Текущее представление в модальном окне

    showAddCarPage() {
        this.tempNewCar = {
            id: 'new-' + Date.now(),
            photos: { diagnostic: [], repair: [], painting: [], ready: [], completed: [] },
            documents: { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] }
        };
        this.currentCar = this.tempNewCar;
        const modal = document.getElementById('add-car-modal');
        if (modal) {
            modal.classList.add('show');
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    },

    hideAddCarModal() {
        const modal = document.getElementById('add-car-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.remove('show');
                this.clearForm();
                this.tempNewCar = null;
                this.currentCar = null;
            }, 300);
        }
    },

    clearForm() {
        ['new-car-owner-name', 'new-car-owner-phone', 'new-car-brand', 'new-car-model', 'new-car-number', 'new-car-odometer', 'new-car-year', 'new-car-vin'].forEach(id => this.setInputValue(id, ''));
        this.setInputValue('new-car-status', 'diagnostic');
        this.uploadedPhotos = [];
        this.uploadedDocuments = [];
    },

    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) input.value = value;
    },

    showEditCarForm(carId) {
        const car = carsDatabase.find(c => c.id === carId);
        if (!car) return;
        currentEditingCarId = carId;
        this.currentCar = car;

        // Заполняем поля формы
        ['edit-car-brand', 'edit-car-model', 'edit-car-number', 'edit-car-odometer', 'edit-car-year', 'edit-car-vin'].forEach((id, i) =>
            this.setInputValue(id, [car.brand, car.model, car.number, car.odometer, car.year, car.vin][i]));
        this.setInputValue('current-status-select', car.status);
        this.uploadedPhotos = [];
        this.uploadedDocuments = [];

        // Показываем основное представление редактирования
        this.showModalView('edit-car');

        const modal = document.getElementById('edit-car-modal');
        if (modal) {
            modal.classList.add('show');
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    },

    // Показать определенное представление в модальном окне
    showModalView(viewName) {
        this.currentModalView = viewName;

        // Скрываем все представления
        document.getElementById('edit-car-content').style.display = 'none';
        document.getElementById('edit-photo-content').style.display = 'none';
        document.getElementById('edit-document-content').style.display = 'none';

        // Показываем кнопку "Назад" только для фото и документов
        const backBtn = document.getElementById('modal-back-btn');
        if (backBtn) {
            backBtn.style.display = (viewName !== 'edit-car') ? 'block' : 'none';
        }

        // Устанавливаем заголовок
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) {
            switch(viewName) {
                case 'edit-car':
                    modalTitle.textContent = 'Редактирование автомобиля';
                    break;
                case 'edit-photo':
                    modalTitle.textContent = 'Редактирование фотографий';
                    break;
                case 'edit-document':
                    modalTitle.textContent = 'Закрывающая документация';
                    break;
            }
        }

        // Показываем нужное представление
        switch(viewName) {
            case 'edit-car':
                document.getElementById('edit-car-content').style.display = 'block';
                break;
            case 'edit-photo':
                document.getElementById('edit-photo-content').style.display = 'block';
                this.loadStatusPhotos();
                break;
            case 'edit-document':
                document.getElementById('edit-document-content').style.display = 'block';
                this.loadStatusDocuments();
                break;
        }
    },

    // Переход назад к редактированию автомобиля
    goBackToEditCar() {
        this.showModalView('edit-car');
    },

    // Показать редактирование фотографий
    showPhotoEdit() {
        if (!this.currentCar) {
            alert('Сначала выберите автомобиль');
            return;
        }
        this.showModalView('edit-photo');
    },

    // Показать редактирование документов
    showDocumentEdit() {
        if (!this.currentCar) {
            alert('Сначала выберите автомобиль');
            return;
        }
        this.showModalView('edit-document');
    },

    updateRepairStatuses() {
        if (!this.currentCar) return;

        const statusSelect = document.getElementById('current-status-select');
        const newStatus = statusSelect.value;

        const statusOrder = ['diagnostic', 'repair', 'painting', 'ready', 'completed'];
        const currentStatusIndex = statusOrder.indexOf(newStatus);

        this.currentCar.repairStatus.forEach((status, index) => {
            if (index <= currentStatusIndex) {
                status.status = 'completed';
            } else if (index === currentStatusIndex + 1) {
                status.status = 'active';
            } else {
                status.status = 'pending';
            }
        });

        this.currentCar.status = newStatus;
        updateCarsTable();

        if (App.currentCar === this.currentCar.id) {
            App.updateRepairStatus(this.currentCar.repairStatus || []);
        }
    },

    autoSaveCar() {
        if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => { this.saveCarEdits(); }, 1000);
    },

    saveCarEdits() {
        const car = carsDatabase.find(c => c.id === currentEditingCarId);
        if (!car) return;
        car.brand = document.getElementById('edit-car-brand')?.value || car.brand;
        car.model = document.getElementById('edit-car-model')?.value || car.model;
        car.number = document.getElementById('edit-car-number')?.value || car.number;
        car.odometer = document.getElementById('edit-car-odometer')?.value || car.odometer;
        car.year = document.getElementById('edit-car-year')?.value || car.year;
        car.vin = document.getElementById('edit-car-vin')?.value || car.vin;
        updateCarsTable();
        alert('Данные автомобиля успешно обновлены!');
    },

    hideEditCarForm() {
        const modal = document.getElementById('edit-car-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.remove('show');
                this.uploadedPhotos = [];
                this.uploadedDocuments = [];
                currentEditingCarId = null;
                this.currentCar = null;
            }, 300);
        }
    },

    // Загрузка фотографий статусов
    loadStatusPhotos() {
        const targetCar = this.currentCar;
        if (!targetCar) return;

        ['diagnostic', 'repair', 'painting', 'ready', 'completed'].forEach(status => {
            const container = document.getElementById(`${status}-photos`);
            if (container) {
                container.innerHTML = '';
                if (targetCar.photos && targetCar.photos[status] && targetCar.photos[status].length > 0) {
                    targetCar.photos[status].forEach(photo => {
                        const photoElement = document.createElement('div');
                        photoElement.className = 'status-photo-item';
                        photoElement.innerHTML = `
                            <img src="${photo.dataUrl}" alt="Фото статуса" class="status-photo">
                            <button class="status-photo-delete" onclick="Admin.deleteStatusPhoto('${status}', ${photo.id})"><i class="fas fa-times"></i></button>
                        `;
                        container.appendChild(photoElement);
                    });
                } else {
                    container.innerHTML = '<p class="no-photos-message">Нет фотографий для этого статуса</p>';
                }
            }
        });
    },

    // Загрузка документов
    loadStatusDocuments() {
        const targetCar = this.currentCar;
        if (!targetCar) return;

        ['work-certificate', 'payment-receipt', 'invoice', 'contract', 'warranty'].forEach(type => {
            const container = document.getElementById(`${type}-docs`);
            if (container) {
                container.innerHTML = '';
                if (targetCar.documents && targetCar.documents[type] && targetCar.documents[type].length > 0) {
                    targetCar.documents[type].forEach(doc => {
                        const docElement = document.createElement('div');
                        docElement.className = 'status-photo-item';
                        docElement.innerHTML = `
                            <div class="document-preview"><i class="${App.getDocumentIcon(doc.type)}"></i><span>${doc.name}</span></div>
                            <button class="status-photo-delete" onclick="Admin.deleteStatusDocument('${type}', ${doc.id})"><i class="fas fa-times"></i></button>
                        `;
                        container.appendChild(docElement);
                    });
                } else {
                    container.innerHTML = '<p class="no-photos-message">Нет документов этого типа</p>';
                }
            }
        });
    },

    uploadPhotoForStatus(status) {
        if (!this.currentCar) return;
        this.currentPhotoStatus = status;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (e) => this.handleStatusPhotoUpload(e.target.files, status);
        input.click();
    },

    handleStatusPhotoUpload(files, status) {
        if (!files || files.length === 0) return;
        const targetCar = this.currentCar;
        if (!targetCar) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!targetCar.photos) targetCar.photos = { diagnostic: [], repair: [], painting: [], ready: [], completed: [] };
                    if (!targetCar.photos[status]) targetCar.photos[status] = [];
                    targetCar.photos[status].push({
                        id: Date.now() + i,
                        dataUrl: e.target.result,
                        name: file.name,
                        uploadedAt: new Date().toISOString()
                    });
                    this.loadStatusPhotos();
                };
                reader.readAsDataURL(file);
            }
        }
    },

    deleteStatusPhoto(status, photoId) {
        const targetCar = this.currentCar;
        if (!targetCar || !targetCar.photos || !targetCar.photos[status]) return;
        targetCar.photos[status] = targetCar.photos[status].filter(photo => photo.id !== photoId);
        this.loadStatusPhotos();
    },

    uploadDocumentForType(type) {
        if (!this.currentCar) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => this.handleStatusDocumentUpload(e.target.files, type);
        input.click();
    },

    handleStatusDocumentUpload(files, type) {
        if (!files || files.length === 0) return;
        const targetCar = this.currentCar;
        if (!targetCar) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!targetCar.documents) targetCar.documents = { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] };
                if (!targetCar.documents[type]) targetCar.documents[type] = [];
                const fileType = this.getFileType(file.name);
                targetCar.documents[type].push({
                    id: Date.now() + i,
                    dataUrl: e.target.result,
                    name: file.name,
                    type: fileType,
                    size: this.formatFileSize(file.size),
                    uploadedAt: new Date().toISOString()
                });
                this.loadStatusDocuments();
            };
            reader.readAsDataURL(file);
        }
    },

    deleteStatusDocument(type, docId) {
        const targetCar = this.currentCar;
        if (!targetCar || !targetCar.documents || !targetCar.documents[type]) return;
        targetCar.documents[type] = targetCar.documents[type].filter(doc => doc.id !== docId);
        this.loadStatusDocuments();
    },

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'pdf';
        if (['doc', 'docx'].includes(ext)) return 'doc';
        if (['xls', 'xlsx'].includes(ext)) return 'xls';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
        return 'file';
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    showEditClientForm(clientId) {
        const client = clientsDatabase.find(c => c.id === clientId);
        if (!client) return;
        this.currentEditingClientId = clientId;
        this.setInputValue('edit-client-name', client.name);
        this.setInputValue('edit-client-phone', client.phone);
        this.loadClientCars(clientId);
        const modal = document.getElementById('edit-client-modal');
        if (modal) {
            modal.classList.add('show');
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    },

    loadClientCars(clientId) {
        const clientCarsList = document.getElementById('client-cars-list');
        if (!clientCarsList) return;
        const clientCars = carsDatabase.filter(car => car.clientId === clientId);
        clientCarsList.innerHTML = '';
        if (clientCars.length === 0) {
            clientCarsList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">У клиента нет автомобилей</p>';
            return;
        }
        clientCars.forEach(car => {
            const carItem = document.createElement('div');
            carItem.className = 'client-car-item';
            carItem.innerHTML = `
                <div class="client-car-info"><strong>${car.brand} ${car.model}</strong><div>${car.number}</div></div>
                <div class="client-car-actions"><button class="btn btn-secondary btn-sm" onclick="Admin.showEditCarForm(${car.id}); Admin.hideEditClientModal();"><i class="fas fa-edit"></i></button></div>
            `;
            clientCarsList.appendChild(carItem);
        });
    },

    saveClientChanges() {
        const client = clientsDatabase.find(c => c.id === this.currentEditingClientId);
        if (!client) return;
        client.name = document.getElementById('edit-client-name')?.value || client.name;
        client.phone = document.getElementById('edit-client-phone')?.value || client.phone;
        updateClientsTable();
        this.hideEditClientModal();
        alert('Данные клиента успешно обновлены!');
    },

    hideEditClientModal() {
        const modal = document.getElementById('edit-client-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.remove('show');
                this.currentEditingClientId = null;
            }, 300);
        }
    },

    addNewCar() {
        const brand = document.getElementById('new-car-brand')?.value || '';
        const model = document.getElementById('new-car-model')?.value || '';
        const number = document.getElementById('new-car-number')?.value || '';
        const odometer = document.getElementById('new-car-odometer')?.value || '';
        const year = document.getElementById('new-car-year')?.value || '';
        const vin = document.getElementById('new-car-vin')?.value || '';
        const status = document.getElementById('new-car-status')?.value || 'diagnostic';
        const ownerName = document.getElementById('new-car-owner-name')?.value || '';
        const ownerPhone = document.getElementById('new-car-owner-phone')?.value || '';

        if (!brand || !model || !number) {
            alert('Пожалуйста, заполните обязательные поля автомобиля: марка, модель и гос. номер');
            return;
        }
        if (!ownerName || !ownerPhone) {
            alert('Пожалуйста, заполните обязательные поля собственника: ФИО и телефон');
            return;
        }

        const phoneRegex = /^(\+7|8)[\d\-\(\)\s]{10,15}$/;
        if (!phoneRegex.test(ownerPhone.replace(/\s/g, ''))) {
            alert('Пожалуйста, введите корректный номер телефона в формате +7 XXX XXX-XX-XX');
            return;
        }

        const existingCar = carsDatabase.find(car => car.number === number);
        if (existingCar) {
            alert(`Автомобиль с гос. номером ${number} уже существует в базе!`);
            return;
        }

        const clientId = this.findOrCreateClient(ownerName, ownerPhone);
        const photos = this.tempNewCar ? this.tempNewCar.photos : { diagnostic: [], repair: [], painting: [], ready: [], completed: [] };
        const documents = this.tempNewCar ? this.tempNewCar.documents : { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] };

        const newCar = {
            id: carsDatabase.length > 0 ? Math.max(...carsDatabase.map(c => c.id)) + 1 : 1,
            number, brand, model, year, vin, odometer, status, clientId, photos, documents,
            repairStatus: [
                {
                    id: 1,
                    date: new Date().toLocaleDateString('ru-RU'),
                    title: 'Приемка автомобиля',
                    description: 'Автомобиль принят на ремонт',
                    status: 'completed'
                },
                {
                    id: 2,
                    date: new Date(Date.now() + 86400000).toLocaleDateString('ru-RU'),
                    title: 'Дефектовка',
                    description: 'Диагностика повреждений и составление плана работ',
                    status: 'pending'
                },
                {
                    id: 3,
                    date: new Date(Date.now() + 172800000).toLocaleDateString('ru-RU'),
                    title: 'Рихтовка кузова',
                    description: 'Устранение вмятин и деформаций кузова',
                    status: 'pending'
                },
                {
                    id: 4,
                    date: new Date(Date.now() + 259200000).toLocaleDateString('ru-RU'),
                    title: 'Покраска',
                    description: 'Нанесение лакокрасочного покрытия',
                    status: 'pending'
                },
                {
                    id: 5,
                    date: new Date(Date.now() + 345600000).toLocaleDateString('ru-RU'),
                    title: 'Сборка',
                    description: 'Сборка и установка деталей после покраски',
                    status: 'pending'
                },
                {
                    id: 6,
                    date: new Date(Date.now() + 432000000).toLocaleDateString('ru-RU'),
                    title: 'Готов к выдаче',
                    description: 'Автомобиль прошел контроль качества',
                    status: 'pending'
                },
                {
                    id: 7,
                    date: new Date(Date.now() + 518400000).toLocaleDateString('ru-RU'),
                    title: 'Выдан клиенту',
                    description: 'Клиент забрал автомобиль',
                    status: 'pending'
                }
            ],
            createdAt: new Date().toISOString()
        };

        carsDatabase.push(newCar);
        this.hideAddCarModal();
        updateCarsTable();
        updateClientsTable();
        alert(`Автомобиль ${brand} ${model} (${number}) успешно добавлен для клиента ${ownerName}!`);
    },

    findOrCreateClient(name, phone) {
        const normalizedPhone = phone.replace(/\D/g, '');
        let client = clientsDatabase.find(c => c.phone.replace(/\D/g, '') === normalizedPhone);
        if (client) {
            if (name && client.name !== name) client.name = name;
            return client.id;
        }

        const newClientId = clientsDatabase.length > 0 ? Math.max(...clientsDatabase.map(c => c.id)) + 1 : 1;
        const newClient = { id: newClientId, name, phone, email: '', cars: [] };
        clientsDatabase.push(newClient);
        return newClientId;
    }
};

// Вспомогательные функции
function getStatusText(status) {
    switch(status) {
        case 'diagnostic': return 'Дефектовка';
        case 'repair': return 'Ремонт';
        case 'painting': return 'Покраска';
        case 'ready': return 'Готов к выдаче';
        case 'completed': return 'Выдан клиенту';
        default: return 'Не определен';
    }
}

// Функции для работы с данными
function initTestData() { updateCarsTable(); updateClientsTable(); }

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const tab = document.getElementById(tabId); if (tab) tab.classList.add('active');
    document.querySelectorAll('#admin-tabbar .tabbar-item').forEach(item => item.classList.remove('active'));
    const tabItem = document.querySelector(`#admin-tabbar .tabbar-item[onclick="openTab('${tabId}')"]`);
    if (tabItem) tabItem.classList.add('active');
}

function updateCarsTable() {
    const tbody = document.getElementById('cars-table-body');
    if (!tbody) return; tbody.innerHTML = '';
    carsDatabase.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><a href="javascript:void(0)" onclick="Admin.showEditCarForm(${car.id})" class="car-number-link">${car.number}</a></td><td>${car.brand}</td><td>${car.model}</td>`;
        tbody.appendChild(row);
    });
}

function updateClientsTable() {
    const tbody = document.getElementById('clients-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    clientsDatabase.forEach(client => {
        const clientCars = carsDatabase.filter(car => car.clientId === client.id);
        let carsHtml = 'Нет автомобилей';

        if (clientCars.length > 0) {
            carsHtml = clientCars.map(car =>
                `<a href="javascript:void(0)" onclick="Admin.showEditCarForm(${car.id})" class="car-number-link" style="display: block; margin-bottom: 4px;">${car.number} (${car.brand} ${car.model})</a>`
            ).join('');
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="javascript:void(0)" onclick="Admin.showEditClientForm(${client.id})" class="client-name-link">${client.name}</a></td>
            <td>${client.phone}</td>
            <td class="client-cars-cell">${carsHtml}</td>
        `;
        tbody.appendChild(row);
    });

    if (tbody.children.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: var(--gray);"><i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>Клиенты не найдены</td></tr>';
    }
}

function searchCars() {
    const searchInput = document.getElementById('car-search'); if (!searchInput) return;
    const searchText = searchInput.value.toLowerCase(); const tbody = document.getElementById('cars-table-body'); if (!tbody) return;
    const rows = tbody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td'); let found = false;
        for (let j = 0; j < cells.length; j++) { if (cells[j].textContent.toLowerCase().includes(searchText)) { found = true; break; } }
        rows[i].style.display = found ? '' : 'none';
    }
}

function searchClients() {
    const searchInput = document.getElementById('client-search'); if (!searchInput) return;
    const searchText = searchInput.value.toLowerCase(); const tbody = document.getElementById('clients-table-body'); if (!tbody) return;
    const rows = tbody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td'); let found = false;
        for (let j = 0; j < 3; j++) { if (cells[j] && cells[j].textContent.toLowerCase().includes(searchText)) { found = true; break; } }
        rows[i].style.display = found ? '' : 'none';
    }
}

function logout() {
    document.getElementById('auth-view').style.display = 'flex';
    document.getElementById('auth-view').style.opacity = '1';
    document.getElementById('app').classList.remove('show', 'user-mode');
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function updateRepairPhotoGallery(photos, containerId) {
    const gallery = document.getElementById(containerId);
    if (!gallery) return;

    gallery.innerHTML = '';

    if (!photos || photos.length === 0) {
        gallery.innerHTML = `
            <div class="empty-gallery" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--gray);">
                <i class="fas fa-camera" style="font-size: 3rem; margin-bottom: 16px; display: block; color: var(--gray-light);"></i>
                <p>Фотографии отсутствуют</p>
            </div>
        `;
        return;
    }

    photos.forEach((photo, index) => {
        const photoElement = document.createElement('div');
        photoElement.className = 'gallery-item';
        photoElement.onclick = () => App.openCarousel(photos, index);

        const img = document.createElement('img');
        img.src = photo.dataUrl || photo.url;
        img.alt = photo.caption || 'Фото ремонта';
        img.loading = 'lazy';

        photoElement.appendChild(img);
        gallery.appendChild(photoElement);
    });
}

function downloadDocument(url, name) {
    // Эмуляция скачивания - в реальном приложении здесь будет fetch + создание ссылки
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Скачивание документа: ${name}`);
}

function shareDocument(url, name) {
    if (navigator.share) {
        navigator.share({
            title: name,
            text: `Документ из автосервиса: ${name}`,
            url: url
        }).catch(error => {
            console.log('Ошибка при попытке поделиться:', error);
            fallbackShare(url, name);
        });
    } else {
        fallbackShare(url, name);
    }
}

function fallbackShare(url, name) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert(`Ссылка на документ "${name}" скопирована в буфер обмена:\n${url}`);
        }).catch(err => {
            alert(`Ссылка на документ "${name}": ${url}\nСкопируйте и отправьте вручную.`);
        });
    } else {
        alert(`Ссылка на документ "${name}": ${url}\nСкопируйте и отправьте вручную.`);
    }
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length === 0) return;

    // Форматирование российского номера
    if (value.startsWith('7') || value.startsWith('8')) {
        if (value.length === 1) {
            input.value = '+7 (';
        } else if (value.length <= 4) {
            input.value = '+7 (' + value.substring(1);
        } else if (value.length <= 7) {
            input.value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4);
        } else if (value.length <= 9) {
            input.value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7);
        } else {
            input.value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7, 9) + '-' + value.substring(9, 11);
        }
    } else if (value.startsWith('9') && value.length <= 10) {
        // Для номеров без +7/8 в начале
        if (value.length <= 3) {
            input.value = value;
        } else if (value.length <= 6) {
            input.value = value.substring(0, 3) + '-' + value.substring(3);
        } else {
            input.value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
        }
    }
}

// Исправленная getDocumentTypeText
function getDocumentTypeText(type) {
    switch(type) {
        case 'work-certificate': return 'Акт выполненных работ';
        case 'payment-receipt': return 'Чек об оплате';
        case 'invoice': return 'Счет-фактура';
        case 'contract': return 'Договор';
        case 'warranty': return 'Гарантийный талон';
        default: return 'Документ';
    }
}

// Также добавьте эту функцию для обновления счетчика фотографий в ремонте
function updateRepairPhotosCount(count) {
    const countElement = document.getElementById('repair-photos-count');
    if (countElement) {
        countElement.textContent = `${count} ${App.getWordForm(count, ['фото', 'фото', 'фото'])}`;
    }
}
