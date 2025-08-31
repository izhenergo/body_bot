// Основные константы и переменные (глобальные)
var carsDatabase = [];
var clientsDatabase = [];
var currentDragItem = null;
var currentEditingCarId = null;
var autoSaveTimeout = null;

// Клиентское приложение (глобальное)
var App = {
    currentView: 'main',
    currentCar: null,
    historyCarId: null,

    init() {
        this.historyCarId = null;
        this.initTestData();

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
                photos: { diagnostic: [], repair: [], painting: [], ready: [], completed: [] },
                documents: { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] },
                repairStatus: [
                    {
                        id: 1,
                        date: '10.05.2023',
                        title: 'Приемка автомобиля',
                        description: 'Автомобиль принят на ремонт после ДТП',
                        status: 'completed'
                    },
                    {
                        id: 2,
                        date: '11.05.2023',
                        title: 'Дефектовка',
                        description: 'Проведена полная диагностика повреждений',
                        status: 'completed'
                    },
                    {
                        id: 3,
                        date: '12.05.2023',
                        title: 'Рихтовка кузова',
                        description: 'Устранение вмятин и деформаций кузова',
                        status: 'completed'
                    },
                    {
                        id: 4,
                        date: '15.05.2023',
                        title: 'Покраска',
                        description: 'Начата покраска поврежденных элементов',
                        status: 'active'
                    },
                    {
                        id: 5,
                        date: '18.05.2023',
                        title: 'Сборка',
                        description: 'Предстоит сборка после покраски',
                        status: 'pending'
                    },
                    {
                        id: 6,
                        date: '20.05.2023',
                        title: 'Готов к выдаче',
                        description: 'Автомобиль будет готов к выдаче',
                        status: 'pending'
                    }
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
                photos: { diagnostic: [], repair: [], painting: [], ready: [], completed: [] },
                documents: { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] },
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
                        description: 'Автомobile прошел контроль качества',
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

                this.initUserInterface();
                this.navigateTo('main');
            } else if (username === '2' && password === '2') {
                // Admin user - remove user mode class and show admin interface
                document.getElementById('app').classList.remove('user-mode');
                document.getElementById('adminSection').style.display = 'block';
                document.getElementById('user-tabbar').style.display = 'none';
                document.getElementById('admin-tabbar').style.display = 'flex';
                document.getElementById('app').style.display = 'none';

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
        document.getElementById('current-screen-title').textContent = 'Мои автомобили';
        document.getElementById('cars-list-view').style.display = 'block';
        document.getElementById('car-details-view').style.display = 'none';
        document.getElementById('history-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';
    },

    updateCarsList() {
        const carsList = document.getElementById('cars-list-view');
        if (!carsList) return;

        carsList.innerHTML = '';
        carsDatabase.forEach(car => {
            const statusClass = car.status === 'completed' || car.status === 'ready' ? 'completed' : '';
            const statusText = getStatusText(car.status);

            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.setAttribute('data-car-id', car.id);
            carCard.onclick = () => this.showCarDetails(car.id);
            carCard.innerHTML = `
                <div class="car-status ${statusClass}">${statusText}</div>
                <h2><i class="fas fa-car"></i> ${car.brand} ${car.model}</h2>
                <p>Госномер: ${car.number}</p>
                <p>Статус: ${statusText}</p>
                <div class="car-meta">
                    <span><i class="fas fa-tachometer-alt"></i> ${car.odometer || '0'} км</span>
                </div>
            `;
            carsList.appendChild(carCard);
        });
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

        const statusBadge = document.getElementById('car-status-badge');
        if (statusBadge) {
            const statusText = getStatusText(car.status);
            const statusIcons = {
                'diagnostic': 'fas fa-search',
                'repair': 'fas fa-tools',
                'painting': 'fas fa-paint-roller',
                'ready': 'fas fa-check-circle',
                'completed': 'fas fa-car'
            };
            const statusIcon = statusIcons[car.status] || 'fas fa-clock';

            statusBadge.innerHTML = `<i class="${statusIcon}"></i> ${statusText}`;
            statusBadge.className = 'car-status-badge ' + car.status;
        }

        this.updateRepairStatus(car.repairStatus || []);
        this.updatePhotoGallery(car.photos || []);
        this.updatePhotosCount(car.photos || []);
        this.updateDocuments(car.documents || []);
        this.updateDocumentsCount(car.documents || []);

        this.hideElement('cars-list-view');
        this.showElement('car-details-view');

        const titleElement = document.getElementById('current-screen-title');
        if (titleElement) titleElement.textContent = `${car.brand} ${car.model}`;
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
        document.querySelectorAll('#user-tabbar .tabbar-item').forEach(item => item.classList.remove('active'));
        const viewTab = document.getElementById(`${view}-tab`);
        if (viewTab) viewTab.classList.add('active');

        const titles = {
            'main': 'Мои автомобили',
            'history': 'История обслуживания',
            'profile': 'Мой профиль'
        };
        const titleElement = document.getElementById('current-screen-title');
        if (titleElement) titleElement.textContent = titles[view] || 'Мои автомобили';

        ['cars-list-view', 'car-details-view', 'history-view', 'profile-view'].forEach(viewId => {
            const element = document.getElementById(viewId);
            if (element) element.style.display = 'none';
        });

        switch(view) {
            case 'main':
                document.getElementById('cars-list-view').style.display = 'block';
                this.updateCarsList();
                break;
            case 'history':
                document.getElementById('history-view').style.display = 'block';
                // Если есть ID автомобиля, показываем его историю
                if (this.historyCarId) {
                    this.showCarHistory(this.historyCarId);
                } else {
                    // Иначе показываем стандартную историю с выбором
                    this.showCarSelectionHistory();
                }
                break;
            case 'profile':
                document.getElementById('profile-view').style.display = 'block';
                break;
        }
    },

    navigateToHistoryFromCar: function(carId) {
        // Сохраняем ID автомобиля для истории
        this.historyCarId = carId;

        // Переходим на вкладку истории
        this.navigateTo('history');

        // Показываем историю конкретного автомобиля
        this.showCarHistory(carId);
    },

    showCarHistory: function(carId) {
        const car = carsDatabase.find(c => c.id === carId);
        if (!car) return;

        // Обновляем заголовок
        document.getElementById('current-screen-title').textContent = `История: ${car.brand} ${car.model}`;

        // Показываем кнопку возврата к выбору автомобиля
        const backButton = document.getElementById('history-back-button');
        if (backButton) {
            backButton.style.display = 'block';
        }

        // Используем существующую структуру истории
        this.renderExistingHistory(carId);
    },

    showCarSelectionHistory: function() {
        // Сбрасываем ID автомобиля
        this.historyCarId = null;

        // Обновляем заголовок
        document.getElementById('current-screen-title').textContent = 'История обслуживания';

        // Скрываем кнопку возврата
        const backButton = document.getElementById('history-back-button');
        if (backButton) {
            backButton.style.display = 'none';
        }

        // Возвращаем стандартное содержимое истории
        this.renderStandardHistory();
    },

    renderExistingHistory: function(carId) {
        const historyView = document.getElementById('history-view');
        if (!historyView) return;

        const car = carsDatabase.find(c => c.id === carId);
        const carTitle = car ? `${car.brand} ${car.model} (${car.number})` : 'Автомобиль';

        // Получаем историю обслуживания для конкретного автомобиля
        const serviceHistory = this.getServiceHistoryForCar(carId);

        historyView.innerHTML = `
        <div class="history-header">
            <button id="history-back-button" class="back-button" onclick="App.showCarSelectionHistory()" style="display: block;">
                <i class="fas fa-arrow-left"></i> Назад к выбору
            </button>
            <h2><i class="fas fa-history"></i> История обслуживания</h2>
        </div>
        <div class="history-list">
            <h3>${carTitle}</h3>
            
            ${serviceHistory.length > 0 ?
            serviceHistory.map(service => `
                    <div class="history-item">
                        <h3><span class="history-date">${service.date}</span> - ${service.title}</h3>
                        <p><i class="fas fa-car-crash"></i> ${service.description}</p>
                        <p><i class="fas fa-tachometer-alt"></i> Пробег: ${service.mileage} км</p>
                        <p><i class="fas fa-ruble-sign"></i> Стоимость: ${service.totalCost.toLocaleString('ru-RU')} руб.</p>
                        
                        ${service.workItems && service.workItems.length > 0 ? `
                            <div class="parts-list">
                                <p><strong>Работы:</strong></p>
                                <ul>
                                    ${service.workItems.map(item => `<li>${item.name} - ${item.cost.toLocaleString('ru-RU')} руб.</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${service.parts && service.parts.length > 0 ? `
                            <div class="parts-list">
                                <p><strong>Запчасти:</strong></p>
                                <ul>
                                    ${service.parts.map(part => `<li>${part.name} - ${part.quantity} шт. × ${part.price.toLocaleString('ru-RU')} руб.</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `).join('')
            :
            '<p style="padding: 20px; text-align: center; color: var(--gray);">История обслуживания отсутствует</p>'
        }
        </div>
    `;
    },

    renderStandardHistory: function() {
        const historyView = document.getElementById('history-view');
        if (!historyView) return;

        // Возвращаем оригинальную разметку без примеров
        historyView.innerHTML = `
        <div class="history-header">
            <button id="history-back-button" class="back-button" onclick="App.showCarSelectionHistory()" style="display: none;">
                <i class="fas fa-arrow-left"></i> Назад к выбору
            </button>
            <h2><i class="fas fa-history"></i> История обслуживания</h2>
        </div>
        <div class="history-list">
            <p>Выберите автомобиль для просмотра истории:</p>
            <div id="history-cars-list">
                <!-- Список автомобилей будет заполнен динамически -->
            </div>
        </div>
    `;

        // Заполняем список автомобилей
        this.updateHistoryCarsList();
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
    },

    showServiceHistory: function() {
        // Если мы в карточке автомобиля, переходим на историю этого автомобиля
        if (this.currentCar) {
            this.navigateToHistoryFromCar(this.currentCar);
        } else {
            // Иначе переходим на обычную историю с выбором автомобиля
            this.historyCarId = null;
            this.navigateTo('history');
        }
    },

    getServiceHistoryForCar: function(carId) {
        // Тестовая база данных истории обслуживания
        const serviceHistoryDB = {
            1: [ // Volkswagen Tiguan
                {
                    date: '15.04.2023',
                    mileage: '45,230',
                    title: 'Кузовной ремонт',
                    description: 'Устранение повреждений правого борта после ДТП',
                    workItems: [
                        { name: 'Рихтовка правого борта', cost: 25000 },
                        { name: 'Покраска элементов', cost: 40000 },
                        { name: 'Замена молдинга', cost: 5000 }
                    ],
                    parts: [
                        { name: 'Молдинг правого борта', quantity: 1, price: 3500 },
                        { name: 'ЛКМ', quantity: 2, price: 7500 }
                    ],
                    totalCost: 87500,
                    warranty: '12 месяцев'
                },
                {
                    date: '10.01.2023',
                    mileage: '42,000',
                    title: 'Плановое ТО',
                    description: 'Регламентное техническое обслуживание',
                    workItems: [
                        { name: 'Замена масла двигателя', cost: 3000 },
                        { name: 'Замена масляного фильтра', cost: 1500 },
                        { name: 'Замена воздушного фильтра', cost: 2000 },
                        { name: 'Диагностика ходовой', cost: 2000 }
                    ],
                    parts: [
                        { name: 'Масло моторное 5W-40', quantity: 5, price: 600 },
                        { name: 'Фильтр масляный', quantity: 1, price: 1200 },
                        { name: 'Фильтр воздушный', quantity: 1, price: 1500 }
                    ],
                    totalCost: 12500,
                    warranty: '6 месяцев'
                }
            ],
            2: [ // Kia Sportage
                {
                    date: '20.03.2023',
                    mileage: '18,750',
                    title: 'Покраска переднего бампера',
                    description: 'Локальный ремонт ЛКП переднего бампера',
                    workItems: [
                        { name: 'Подготовка поверхности', cost: 5000 },
                        { name: 'Покраска бампера', cost: 15000 }
                    ],
                    parts: [
                        { name: 'ЛКМ', quantity: 1, price: 4000 },
                        { name: 'Лак', quantity: 1, price: 3000 }
                    ],
                    totalCost: 27000,
                    warranty: '12 месяцев'
                }
            ]
        };

        return serviceHistoryDB[carId] || [];
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

    updatePhotoGallery(photos, containerId = 'gallery-container') {
        const gallery = document.getElementById(containerId);
        if (!gallery) return;

        gallery.innerHTML = '';
        const allPhotos = [];
        for (const status in photos) {
            if (photos[status] && Array.isArray(photos[status])) {
                allPhotos.push(...photos[status].map(photo => ({ ...photo, status })));
            }
        }

        if (allPhotos.length === 0) {
            gallery.innerHTML = '<div class="empty-state"><i class="fas fa-camera" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 16px;"></i><p style="color: var(--gray); text-align: center;">Фотографии по ремонту пока отсутствуют</p></div>';
            return;
        }

        allPhotos.sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
        allPhotos.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${photo.dataUrl || photo.url}" alt="Фото автомобиля" class="gallery-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 200\"%3E%3Crect width=\"300\" height=\"200\" fill=\"%23E9ECEF\"/%3E%3Ctext x=\"150\" y=\"100\" font-family=\"Arial\" font-size=\"16\" text-anchor=\"middle\" fill=\"%236C757D\"%3EФото недоступно%3C/text%3E%3C/svg%3E'">
                <div class="gallery-caption">
                    <span class="photo-status">${getStatusText(photo.status)}</span>
                    ${photo.caption || 'Фото автомобиля'}
                </div>
            `;
            gallery.appendChild(galleryItem);
        });
    },

    updatePhotosCount(photos) {
        const countElement = document.getElementById('photos-count');
        if (!countElement) return;
        let totalPhotos = 0;
        for (const status in photos) {
            if (photos[status] && Array.isArray(photos[status])) totalPhotos += photos[status].length;
        }
        countElement.textContent = `${totalPhotos} ${this.getWordForm(totalPhotos, ['фото', 'фотографии', 'фотографий'])}`;
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

    getWordForm(number, forms) {
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

    showGames() {
        const modal = document.getElementById('games-modal');
        if (modal) { modal.classList.add('show'); setTimeout(() => { modal.style.opacity = '1'; }, 10); }
    },
    hideGames() {
        const modal = document.getElementById('games-modal');
        if (modal) { modal.style.opacity = '0'; setTimeout(() => { modal.classList.remove('show'); }, 300); }
    },
    openGame(gameName) { alert(`Открываем игру: ${gameName}\nЗдесь будет интеграция с @Zer0_Emission_Bot`); this.hideGames(); },
    writeToManager() {
        const telegramUrl = 'https://t.me/MobileApps18';
        window.open(telegramUrl, '_blank');
    },
    callService() { if (confirm('Позвонить в автосервис по номеру +7 (999) 888-77-66?')) window.location.href = 'tel:+79998887766'; },
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
    uploadedPhotos: [], uploadedDocuments: [], currentCar: null, currentPhotoStatus: null, tempNewCar: null, currentEditingClientId: null,

    showAddCarPage() {
        this.tempNewCar = { id: 'new-' + Date.now(), photos: { diagnostic: [], repair: [], painting: [], ready: [], completed: [] }, documents: { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] } };
        this.currentCar = this.tempNewCar;
        const modal = document.getElementById('add-car-modal');
        if (modal) { modal.classList.add('show'); setTimeout(() => { modal.style.opacity = '1'; }, 10); }
    },

    hideAddCarModal() {
        const modal = document.getElementById('add-car-modal');
        if (modal) { modal.style.opacity = '0'; setTimeout(() => { modal.classList.remove('show'); this.clearForm(); this.tempNewCar = null; this.currentCar = null; }, 300); }
    },

    clearForm() {
        ['new-car-owner-name', 'new-car-owner-phone', 'new-car-brand', 'new-car-model', 'new-car-number', 'new-car-odometer', 'new-car-year', 'new-car-vin'].forEach(id => this.setInputValue(id, ''));
        this.setInputValue('new-car-status', 'diagnostic');
        this.uploadedPhotos = []; this.uploadedDocuments = [];
    },

    setInputValue(id, value) { const input = document.getElementById(id); if (input) input.value = value; },

    showPhotoEditPage() {
        if (!this.currentCar) {
            if (!this.tempNewCar) this.tempNewCar = { id: 'new-' + Date.now(), photos: { diagnostic: [], repair: [], painting: [], ready: [], completed: [] } };
            this.currentCar = this.tempNewCar;
        }
        const page = document.getElementById('photo-edit-page');
        if (page) { page.classList.add('active'); } this.loadStatusPhotos();
    },

    showDocumentEditPage() {
        if (!this.currentCar) {
            if (!this.tempNewCar) this.tempNewCar = { id: 'new-' + Date.now(), documents: { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] } };
            this.currentCar = this.tempNewCar;
        }
        const page = document.getElementById('document-edit-page');
        if (page) { page.classList.add('active'); } this.loadStatusDocuments();
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

        if (!brand || !model || !number) { alert('Пожалуйста, заполните обязательные поля автомобиля: марка, модель и гос. номер'); return; }
        if (!ownerName || !ownerPhone) { alert('Пожалуйста, заполните обязательные поля собственника: ФИО и телефон'); return; }

        const phoneRegex = /^(\+7|8)[\d\-\(\)\s]{10,15}$/;
        if (!phoneRegex.test(ownerPhone.replace(/\s/g, ''))) { alert('Пожалуйста, введите корректный номер телефона в формате +7 XXX XXX-XX-XX'); return; }

        const existingCar = carsDatabase.find(car => car.number === number);
        if (existingCar) { alert(`Автомобиль с гос. номером ${number} уже существует в базе!`); return; }

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
        updateCarsTable(); updateClientsTable();
        alert(`Автомобиль ${brand} ${model} (${number}) успешно добавлен для клиента ${ownerName}!`);
    },

    findOrCreateClient(name, phone) {
        const normalizedPhone = phone.replace(/\D/g, '');
        let client = clientsDatabase.find(c => c.phone.replace(/\D/g, '') === normalizedPhone);
        if (client) { if (name && client.name !== name) client.name = name; return client.id; }

        const newClientId = clientsDatabase.length > 0 ? Math.max(...clientsDatabase.map(c => c.id)) + 1 : 1;
        const newClient = { id: newClientId, name, phone, email: '', cars: [] };
        clientsDatabase.push(newClient);
        return newClientId;
    },

    showEditCarForm(carId) {
        const car = carsDatabase.find(c => c.id === carId);
        if (!car) return;
        currentEditingCarId = carId; this.currentCar = car;
        ['edit-car-brand', 'edit-car-model', 'edit-car-number', 'edit-car-odometer', 'edit-car-year', 'edit-car-vin'].forEach((id, i) =>
            this.setInputValue(id, [car.brand, car.model, car.number, car.odometer, car.year, car.vin][i]));
        this.setInputValue('current-status-select', car.status);
        this.uploadedPhotos = []; this.uploadedDocuments = [];
        const modal = document.getElementById('edit-car-modal');
        if (modal) { modal.classList.add('show'); setTimeout(() => { modal.style.opacity = '1'; }, 10); }
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

    autoSaveCar() { if (autoSaveTimeout) clearTimeout(autoSaveTimeout); autoSaveTimeout = setTimeout(() => { this.saveCarEdits(); }, 1000); },

    saveCarEdits() {
        const car = carsDatabase.find(c => c.id === currentEditingCarId);
        if (!car) return;
        car.brand = document.getElementById('edit-car-brand')?.value || car.brand;
        car.model = document.getElementById('edit-car-model')?.value || car.model;
        car.number = document.getElementById('edit-car-number')?.value || car.number;
        car.odometer = document.getElementById('edit-car-odometer')?.value || car.odometer;
        car.year = document.getElementById('edit-car-year')?.value || car.year;
        car.vin = document.getElementById('edit-car-vin')?.value || car.vin;
        updateCarsTable(); alert('Данные автомобиля успешно обновлены!');
    },

    hideEditCarForm() {
        const modal = document.getElementById('edit-car-modal');
        if (modal) { modal.style.opacity = '0'; setTimeout(() => { modal.classList.remove('show'); this.uploadedPhotos = []; this.uploadedDocuments = []; currentEditingCarId = null; this.currentCar = null; }, 300); }
    },

    hidePhotoEditPage() { const page = document.getElementById('photo-edit-page'); if (page) page.classList.remove('active'); },
    hideDocumentEditPage() { const page = document.getElementById('document-edit-page'); if (page) page.classList.remove('active'); },

    loadStatusPhotos() {
        const targetCar = this.currentCar || this.tempNewCar;
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

    uploadPhotoForStatus(status) {
        if (!this.currentCar && !this.tempNewCar) return;
        this.currentPhotoStatus = status;
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*'; input.multiple = true;
        input.onchange = (e) => this.handleStatusPhotoUpload(e.target.files, status);
        input.click();
    },

    handleStatusPhotoUpload(files, status) {
        if (!files || files.length === 0) return;
        const targetCar = this.currentCar || this.tempNewCar;
        if (!targetCar) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (!targetCar.photos) targetCar.photos = { diagnostic: [], repair: [], painting: [], ready: [], completed: [] };
                    if (!targetCar.photos[status]) targetCar.photos[status] = [];
                    targetCar.photos[status].push({ id: Date.now() + i, dataUrl: e.target.result, name: file.name, uploadedAt: new Date().toISOString() });
                    this.loadStatusPhotos();
                };
                reader.readAsDataURL(file);
            }
        }
    },

    deleteStatusPhoto(status, photoId) {
        const targetCar = this.currentCar || this.tempNewCar;
        if (!targetCar || !targetCar.photos || !targetCar.photos[status]) return;
        targetCar.photos[status] = targetCar.photos[status].filter(photo => photo.id !== photoId);
        this.loadStatusPhotos();
    },

    loadStatusDocuments() {
        const targetCar = this.currentCar || this.tempNewCar;
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

    uploadDocumentForType(type) {
        if (!this.currentCar && !this.tempNewCar) return;
        const input = document.createElement('input');
        input.type = 'file'; input.multiple = true;
        input.onchange = (e) => this.handleStatusDocumentUpload(e.target.files, type);
        input.click();
    },

    handleStatusDocumentUpload(files, type) {
        if (!files || files.length === 0) return;
        const targetCar = this.currentCar || this.tempNewCar;
        if (!targetCar) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!targetCar.documents) targetCar.documents = { 'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': [] };
                if (!targetCar.documents[type]) targetCar.documents[type] = [];
                const fileType = this.getFileType(file.name);
                targetCar.documents[type].push({ id: Date.now() + i, dataUrl: e.target.result, name: file.name, type: fileType, size: this.formatFileSize(file.size), uploadedAt: new Date().toISOString() });
                this.loadStatusDocuments();
            };
            reader.readAsDataURL(file);
        }
    },

    deleteStatusDocument(type, docId) {
        const targetCar = this.currentCar || this.tempNewCar;
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
        const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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
        if (modal) { modal.classList.add('show'); setTimeout(() => { modal.style.opacity = '1'; }, 10); }
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
        updateClientsTable(); this.hideEditClientModal(); alert('Данные клиента успешно обновлены!');
    },

    hideEditClientModal() {
        const modal = document.getElementById('edit-client-modal');
        if (modal) { modal.style.opacity = '0'; setTimeout(() => { modal.classList.remove('show'); this.currentEditingClientId = null; }, 300); }
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

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 0) {
        value = value.match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        input.value = !value[2] ? value[1] : '+7 (' + value[2] + ') ' + value[3] + (value[4] ? '-' + value[4] : '') + (value[5] ? '-' + value[5] : '');
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

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    App.init();
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';

    const phoneInput = document.getElementById('new-car-owner-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});
