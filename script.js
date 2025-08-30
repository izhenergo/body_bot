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

    init() {
        // Инициализируем тестовые данные ДО авторизации
        this.initTestData();

        // Show auth form after splash
        setTimeout(() => {
            document.getElementById('splash').style.opacity = '0';
            document.getElementById('auth-view').classList.add('show');

            setTimeout(() => {
                document.getElementById('splash').style.display = 'none';
            }, 500);

            // Focus on username field
            document.getElementById('username').focus();
        }, 1500);

        // Handle login form
        document.getElementById('login-form').onsubmit = (e) => {
            e.preventDefault();
            this.handleLogin();
        };
    },

    // Инициализация тестовых данных для всех пользователей
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
                status: "diagnostic",
                description: "Кузовной ремонт после ДТП",
                clientId: 1,
                photos: {
                    diagnostic: [],
                    repair: [],
                    painting: [],
                    ready: [],
                    completed: []
                },
                documents: {
                    'work-certificate': [],
                    'payment-receipt': [],
                    'invoice': [],
                    'contract': [],
                    'warranty': []
                },
                repairStatus: [
                    {
                        id: 1,
                        date: '10.05.2023',
                        title: 'Приемка автомобиля',
                        description: 'Автомобиль принят на ремонт после ДТП',
                        status: 'completed'
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
                status: "ready",
                description: "Покраска переднего бампера",
                clientId: 2,
                photos: {
                    diagnostic: [],
                    repair: [],
                    painting: [],
                    ready: [],
                    completed: []
                },
                documents: {
                    'work-certificate': [],
                    'payment-receipt': [],
                    'invoice': [],
                    'contract': [],
                    'warranty': []
                },
                repairStatus: [
                    {
                        id: 1,
                        date: '01.05.2023',
                        title: 'Приемка автомобиля',
                        description: 'Автомобиль принят на покраску',
                        status: 'completed'
                    }
                ]
            }
        ];

        clientsDatabase = [
            {
                id: 1,
                name: "Иван Петров",
                phone: "+79123456789",
                email: "ivan.petrov@example.com",
                cars: [1]
            },
            {
                id: 2,
                name: "Мария Сидорова",
                phone: "+79129876543",
                email: "maria.sidorova@example.com",
                cars: [2]
            }
        ];
    },

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!username || !password) {
            alert('Введите логин и пароль');
            return;
        }

        // Hide auth form
        document.getElementById('auth-view').style.opacity = '0';

        setTimeout(() => {
            document.getElementById('auth-view').style.display = 'none';

            if (username === '1' && password === '1') {
                // Regular user
                document.getElementById('app').classList.add('show');
                document.getElementById('user-tabbar').style.display = 'flex';
                document.getElementById('admin-tabbar').style.display = 'none';

                // Инициализируем интерфейс для пользователя
                this.initUserInterface();
                this.navigateTo('main');
            } else if (username === '2' && password === '2') {
                // Admin user
                document.getElementById('adminSection').style.display = 'block';
                document.getElementById('user-tabbar').style.display = 'none';
                document.getElementById('admin-tabbar').style.display = 'flex';
                document.getElementById('app').style.display = 'none';

                // Инициализируем интерфейс для администратора
                updateCarsTable();
                updateClientsTable();
            } else {
                alert('Неверный логин или пароль');
                document.getElementById('auth-view').style.display = 'flex';
                document.getElementById('auth-view').style.opacity = '1';
            }
        }, 500);
    },

    // Инициализация интерфейса для пользователя
    initUserInterface() {
        // Обновляем список автомобилей
        this.updateCarsList();

        // Устанавливаем правильный заголовок
        document.getElementById('current-screen-title').textContent = 'Мои автомобили';

        // Показываем основной контент
        document.getElementById('cars-list-view').style.display = 'block';
        document.getElementById('car-details-view').style.display = 'none';
        document.getElementById('history-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';
    },

    // Обновление списка автомобилей для пользователя
    updateCarsList() {
        const carsList = document.getElementById('cars-list-view');
        if (!carsList) return;

        // Очищаем существующий список
        carsList.innerHTML = '';

        // Добавляем автомобили из базы данных
        carsDatabase.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.setAttribute('data-car-id', car.id);
            carCard.onclick = () => this.showCarDetails(car.id);

            const statusClass = car.status === 'completed' || car.status === 'ready' ? 'completed' : '';
            const statusText = getStatusText(car.status);

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

    navigateTo(view) {
        this.currentView = view;

        // Update active tab
        document.querySelectorAll('#user-tabbar .tabbar-item').forEach(item => {
            item.classList.remove('active');
        });

        const viewTab = document.getElementById(`${view}-tab`);
        if (viewTab) {
            viewTab.classList.add('active');
        }

        // Update title
        const titles = {
            'main': 'Мои автомобили',
            'history': 'История обслуживания',
            'profile': 'Мой профиль'
        };
        const titleElement = document.getElementById('current-screen-title');
        if (titleElement) {
            titleElement.textContent = titles[view] || 'Мои автомобили';
        }

        // Show appropriate view
        const views = ['cars-list-view', 'car-details-view', 'history-view', 'profile-view'];
        views.forEach(viewId => {
            const element = document.getElementById(viewId);
            if (element) {
                element.style.display = 'none';
            }
        });

        switch(view) {
            case 'main':
                const carsListView = document.getElementById('cars-list-view');
                if (carsListView) {
                    carsListView.style.display = 'block';
                    this.updateCarsList();
                }
                break;
            case 'history':
                const historyView = document.getElementById('history-view');
                if (historyView) {
                    historyView.style.display = 'block';
                }
                break;
            case 'profile':
                const profileView = document.getElementById('profile-view');
                if (profileView) {
                    profileView.style.display = 'block';
                }
                break;
        }
    },

    showCarDetails(carId) {
        // Для администратора сразу открываем редактирование
        const adminSection = document.getElementById('adminSection');
        const isAdmin = adminSection && adminSection.style.display === 'block';
        if (isAdmin) {
            Admin.showEditCarForm(carId);
            return;
        }

        // Для обычного пользователя показываем детали
        this.currentCar = carId;
        const car = carsDatabase.find(c => c.id === carId);

        if (!car) {
            alert('Автомобиль не найден!');
            return;
        }

        // Update car details
        this.updateElementText('car-model', `${car.brand} ${car.model}`);
        this.updateElementText('car-plate', car.number);
        this.updateElementText('car-vin', car.vin || 'Не указан');
        this.updateElementText('car-year', car.year || 'Не указан');
        this.updateElementText('car-mileage', car.odometer ? `${car.odometer} км` : 'Не указан');

        // Update repair status timeline
        this.updateRepairStatus(car.repairStatus || []);

        // Update photo gallery
        this.updatePhotoGallery(car.photos || []);

        // Update documents
        this.updateDocuments(car.documents || []);

        // Show car details view
        this.hideElement('cars-list-view');
        this.showElement('car-details-view');

        const titleElement = document.getElementById('current-screen-title');
        if (titleElement) {
            titleElement.textContent = `${car.brand} ${car.model}`;
        }
    },

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    },

    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    },

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
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

        statusItems.forEach(item => {
            const statusItem = document.createElement('div');
            statusItem.className = `status-item ${item.status}`;

            statusItem.innerHTML = `
                    <div class="status-dot"></div>
                    <div class="status-date">${item.date}</div>
                    <div class="status-title">${item.title}</div>
                    <div class="status-desc">${item.description}</div>
                `;

            timeline.appendChild(statusItem);
        });
    },

    updatePhotoGallery(photos, containerId = 'gallery-container') {
        const gallery = document.getElementById(containerId);

        // Проверяем существование элемента
        if (!gallery) {
            console.error(`Элемент с ID ${containerId} не найден!`);
            return;
        }

        gallery.innerHTML = '';

        // Собираем все фотографии из всех статусов
        const allPhotos = [];
        for (const status in photos) {
            if (photos[status] && Array.isArray(photos[status])) {
                allPhotos.push(...photos[status]);
            }
        }

        if (allPhotos.length === 0) {
            gallery.innerHTML = '<p style="padding: 16px; text-align: center; color: var(--gray);">Фотографии по ремонту пока отсутствуют</p>';
            return;
        }

        allPhotos.forEach(photo => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            galleryItem.innerHTML = `
                    <img src="${photo.dataUrl || photo.url}" alt="Фото автомобиля" class="gallery-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 200\"%3E%3Crect width=\"300\" height=\"200\" fill=\"%23E9ECEF\"/%3E%3Ctext x=\"150\" y=\"100\" font-family=\"Arial\" font-size=\"16\" text-anchor=\"middle\" fill=\"%236C757D\"%3EФото недоступно%3C/text%3E%3C/svg%3E'">
                    <div class="gallery-caption">${photo.caption || 'Фото автомобиля'}</div>
                `;

            gallery.appendChild(galleryItem);
        });
    },

    updateDocuments(documents) {
        const documentList = document.getElementById('document-list');
        if (!documentList) return;

        documentList.innerHTML = '';

        // Собираем все документы из всех типов
        const allDocuments = [];
        for (const type in documents) {
            if (documents[type] && Array.isArray(documents[type])) {
                allDocuments.push(...documents[type]);
            }
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
                    <div class="document-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="document-info">
                        <div class="document-name">${doc.name}</div>
                        <div class="document-meta">${doc.date} · ${doc.size}</div>
                    </div>
                    <div class="document-actions">
                        <button class="document-btn" onclick="App.downloadDocument('${doc.url}', '${doc.name}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="document-btn" onclick="App.shareDocument('${doc.url}', '${doc.name}')">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                `;

            documentList.appendChild(docItem);
        });
    },

    getDocumentIcon(type) {
        switch(type) {
            case 'pdf': return 'fas fa-file-pdf';
            case 'doc':
            case 'docx': return 'fas fa-file-word';
            case 'xls':
            case 'xlsx': return 'fas fa-file-excel';
            case 'jpg':
            case 'png':
            case 'gif': return 'fas fa-file-image';
            default: return 'fas fa-file';
        }
    },

    downloadDocument(url, name) {
        alert(`Документ "${name}" будет скачан с URL: ${url}\n\nВ реальном приложении здесь будет реализовано скачивание файла.`);
    },

    shareDocument(url, name) {
        if (navigator.share) {
            navigator.share({
                title: name,
                text: `Документ из автосервиса: ${name}`,
                url: url
            }).catch(err => {
                console.error('Ошибка при попытке поделиться:', err);
                alert('Не удалось поделиться документом. Скопируйте ссылку вручную.');
            });
        } else {
            alert(`Ссылка на документ "${name}": ${url}\n\nСкопируйте и отправьте вручную.`);
        }
    },

    showServiceHistory() {
        this.navigateTo('history');
    },

    showGames() {
        const modal = document.getElementById('games-modal');
        if (modal) {
            modal.classList.add('show');
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    },

    hideGames() {
        const modal = document.getElementById('games-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.classList.remove('show');
            }, 300);
        }
    },

    openGame(gameName) {
        alert(`Открываем игру: ${gameName}\nЗдесь будет интеграция с @Zer0_Emission_Bot`);
        this.hideGames();
    },

    writeToManager() {
        alert('Открываем чат с менеджером');
    },

    callService() {
        if (confirm('Позвонить в автосервис по номеру +7 (123) 456-78-90?')) {
            window.location.href = 'tel:+71234567890';
        }
    },

    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            document.getElementById('app').classList.remove('show');

            const adminSection = document.getElementById('adminSection');
            if (adminSection) {
                adminSection.style.display = 'none';
            }

            document.getElementById('user-tabbar').style.display = 'none';
            document.getElementById('admin-tabbar').style.display = 'none';

            const authView = document.getElementById('auth-view');
            if (authView) {
                authView.style.display = 'flex';
                authView.style.opacity = '1';
            }

            // Reset form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';

            const usernameInput = document.getElementById('username');
            if (usernameInput) {
                usernameInput.focus();
            }
        }
    }
};

// Администраторская панель (глобальная)
var Admin = {
    uploadedPhotos: [],
    uploadedDocuments: [],
    currentCar: null,
    currentPhotoStatus: null,
    tempNewCar: null,
    currentEditingClientId: null,

    showAddCarPage() {
        // Создаем временный объект автомобиля
        this.tempNewCar = {
            id: 'new-' + Date.now(),
            photos: {
                diagnostic: [],
                repair: [],
                painting: [],
                ready: [],
                completed: []
            },
            documents: {
                'work-certificate': [],
                'payment-receipt': [],
                'invoice': [],
                'contract': [],
                'warranty': []
            }
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
        this.setInputValue('new-car-owner-name', '');
        this.setInputValue('new-car-owner-phone', '');
        this.setInputValue('new-car-brand', '');
        this.setInputValue('new-car-model', '');
        this.setInputValue('new-car-number', '');
        this.setInputValue('new-car-odometer', '');
        this.setInputValue('new-car-year', '');
        this.setInputValue('new-car-vin', '');
        this.setInputValue('new-car-status', 'diagnostic');

        this.uploadedPhotos = [];
        this.uploadedDocuments = [];
    },

    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value;
        }
    },

    showPhotoEditPage() {
        if (!this.currentCar) {
            if (!this.tempNewCar) {
                this.tempNewCar = {
                    id: 'new-' + Date.now(),
                    photos: {
                        diagnostic: [],
                        repair: [],
                        painting: [],
                        ready: [],
                        completed: []
                    }
                };
            }
            this.currentCar = this.tempNewCar;
        }

        const page = document.getElementById('photo-edit-page');
        if (page) {
            page.classList.add('active');
        }

        this.loadStatusPhotos();
    },

    showDocumentEditPage() {
        if (!this.currentCar) {
            if (!this.tempNewCar) {
                this.tempNewCar = {
                    id: 'new-' + Date.now(),
                    documents: {
                        'work-certificate': [],
                        'payment-receipt': [],
                        'invoice': [],
                        'contract': [],
                        'warranty': []
                    }
                };
            }
            this.currentCar = this.tempNewCar;
        }

        const page = document.getElementById('document-edit-page');
        if (page) {
            page.classList.add('active');
        }

        this.loadStatusDocuments();
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

        const photos = this.tempNewCar ? this.tempNewCar.photos : {
            diagnostic: [], repair: [], painting: [], ready: [], completed: []
        };

        const documents = this.tempNewCar ? this.tempNewCar.documents : {
            'work-certificate': [], 'payment-receipt': [], 'invoice': [], 'contract': [], 'warranty': []
        };

        const newCar = {
            id: carsDatabase.length > 0 ? Math.max(...carsDatabase.map(c => c.id)) + 1 : 1,
            number: number,
            brand: brand,
            model: model,
            year: year,
            vin: vin,
            odometer: odometer,
            status: status,
            clientId: clientId,
            photos: photos,
            documents: documents,
            repairStatus: [{
                id: 1,
                date: new Date().toLocaleDateString('ru-RU'),
                title: 'Приемка автомобиля',
                description: 'Автомобиль принят на ремонт',
                status: 'completed'
            }],
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
            if (name && client.name !== name) {
                client.name = name;
            }
            return client.id;
        }

        const newClientId = clientsDatabase.length > 0 ? Math.max(...clientsDatabase.map(c => c.id)) + 1 : 1;

        const newClient = {
            id: newClientId,
            name: name,
            phone: phone,
            email: '',
            cars: []
        };

        clientsDatabase.push(newClient);
        return newClientId;
    },

    showEditCarForm(carId) {
        const car = carsDatabase.find(c => c.id === carId);
        if (!car) return;

        currentEditingCarId = carId;
        this.currentCar = car;

        this.setInputValue('edit-car-brand', car.brand);
        this.setInputValue('edit-car-model', car.model);
        this.setInputValue('edit-car-number', car.number);
        this.setInputValue('edit-car-odometer', car.odometer);
        this.setInputValue('edit-car-year', car.year);
        this.setInputValue('edit-car-vin', car.vin);
        this.setInputValue('current-status-select', car.status);

        this.uploadedPhotos = [];
        this.uploadedDocuments = [];

        const modal = document.getElementById('edit-car-modal');
        if (modal) {
            modal.classList.add('show');
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    },

    autoSaveCar() {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        autoSaveTimeout = setTimeout(() => {
            this.saveCarEdits();
        }, 1000);
    },

    updateCurrentStatus(newStatus) {
        const car = carsDatabase.find(c => c.id === currentEditingCarId);
        if (car) {
            car.status = newStatus;

            if (!car.repairStatus) car.repairStatus = [];
            car.repairStatus.push({
                id: Date.now(),
                date: new Date().toLocaleDateString('ru-RU'),
                title: `Статус изменен на: ${getStatusText(newStatus)}`,
                description: 'Статус ремонта обновлен администратором',
                status: 'completed'
            });

            updateCarsTable();
        }
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

    hidePhotoEditPage() {
        const page = document.getElementById('photo-edit-page');
        if (page) {
            page.classList.remove('active');
        }
    },

    loadStatusPhotos() {
        const targetCar = this.currentCar || this.tempNewCar;
        if (!targetCar) return;

        const statuses = ['diagnostic', 'repair', 'painting', 'ready', 'completed'];

        statuses.forEach(status => {
            const container = document.getElementById(`${status}-photos`);
            if (container) {
                container.innerHTML = '';

                if (targetCar.photos && targetCar.photos[status] && targetCar.photos[status].length > 0) {
                    targetCar.photos[status].forEach(photo => {
                        const photoElement = document.createElement('div');
                        photoElement.className = 'status-photo-item';
                        photoElement.innerHTML = `
                            <img src="${photo.dataUrl}" alt="Фото статуса" class="status-photo">
                            <button class="status-photo-delete" onclick="Admin.deleteStatusPhoto('${status}', ${photo.id})">
                                <i class="fas fa-times"></i>
                            </button>
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
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
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
                    if (!targetCar.photos) {
                        targetCar.photos = {
                            diagnostic: [],
                            repair: [],
                            painting: [],
                            ready: [],
                            completed: []
                        };
                    }

                    if (!targetCar.photos[status]) {
                        targetCar.photos[status] = [];
                    }

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
        const targetCar = this.currentCar || this.tempNewCar;
        if (!targetCar || !targetCar.photos || !targetCar.photos[status]) return;

        targetCar.photos[status] = targetCar.photos[status].filter(photo => photo.id !== photoId);
        this.loadStatusPhotos();
    },

    hideDocumentEditPage() {
        const page = document.getElementById('document-edit-page');
        if (page) {
            page.classList.remove('active');
        }
    },

    loadStatusDocuments() {
        const targetCar = this.currentCar || this.tempNewCar;
        if (!targetCar) return;

        const documentTypes = ['work-certificate', 'payment-receipt', 'invoice', 'contract', 'warranty'];

        documentTypes.forEach(type => {
            const container = document.getElementById(`${type}-docs`);
            if (container) {
                container.innerHTML = '';

                if (targetCar.documents && targetCar.documents[type] && targetCar.documents[type].length > 0) {
                    targetCar.documents[type].forEach(doc => {
                        const docElement = document.createElement('div');
                        docElement.className = 'status-photo-item';
                        docElement.innerHTML = `
                            <div class="document-preview">
                                <i class="${App.getDocumentIcon(doc.type)}"></i>
                                <span>${doc.name}</span>
                            </div>
                            <button class="status-photo-delete" onclick="Admin.deleteStatusDocument('${type}', ${doc.id})">
                                <i class="fas fa-times"></i>
                            </button>
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
        input.type = 'file';
        input.multiple = true;
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
                if (!targetCar.documents) {
                    targetCar.documents = {
                        'work-certificate': [],
                        'payment-receipt': [],
                        'invoice': [],
                        'contract': [],
                        'warranty': []
                    };
                }

                if (!targetCar.documents[type]) {
                    targetCar.documents[type] = [];
                }

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
                <div class="client-car-info">
                    <strong>${car.brand} ${car.model}</strong>
                    <div>${car.number}</div>
                </div>
                <div class="client-car-actions">
                    <button class="btn btn-secondary btn-sm" onclick="Admin.showEditCarForm(${car.id}); Admin.hideEditClientModal();">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
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

// Функции для работы с данными (глобальные)
function initTestData() {
    updateCarsTable();
    updateClientsTable();
}

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const tab = document.getElementById(tabId);
    if (tab) {
        tab.classList.add('active');
    }

    document.querySelectorAll('#admin-tabbar .tabbar-item').forEach(item => {
        item.classList.remove('active');
    });

    const tabItem = document.querySelector(`#admin-tabbar .tabbar-item[onclick="openTab('${tabId}')"]`);
    if (tabItem) {
        tabItem.classList.add('active');
    }
}

function updateCarsTable() {
    const tbody = document.getElementById('cars-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    carsDatabase.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>
                    <a href="javascript:void(0)" onclick="Admin.showEditCarForm(${car.id})" 
                       class="car-number-link">
                        ${car.number}
                    </a>
                </td>
                <td>${car.brand}</td>
                <td>${car.model}</td>
            `;

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
                `<a href="javascript:void(0)" onclick="Admin.showEditCarForm(${car.id})" 
                   class="car-number-link" style="display: block; margin-bottom: 4px;">
                    ${car.number} (${car.brand} ${car.model})
                 </a>`
            ).join('');
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <a href="javascript:void(0)" onclick="Admin.showEditClientForm(${client.id})" 
                   class="client-name-link">
                    ${client.name}
                </a>
            </td>
            <td>${client.phone}</td>
            <td class="client-cars-cell">${carsHtml}</td>
        `;

        tbody.appendChild(row);
    });

    if (tbody.children.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 40px; color: var(--gray);">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Клиенты не найдены
                </td>
            </tr>
        `;
    }
}

function searchCars() {
    const searchInput = document.getElementById('car-search');
    if (!searchInput) return;

    const searchText = searchInput.value.toLowerCase();
    const tbody = document.getElementById('cars-table-body');
    if (!tbody) return;

    const rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].textContent.toLowerCase().includes(searchText)) {
                found = true;
                break;
            }
        }

        rows[i].style.display = found ? '' : 'none';
    }
}

function searchClients() {
    const searchInput = document.getElementById('client-search');
    if (!searchInput) return;

    const searchText = searchInput.value.toLowerCase();
    const tbody = document.getElementById('clients-table-body');
    if (!tbody) return;

    const rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;

        for (let j = 0; j < 3; j++) {
            if (cells[j] && cells[j].textContent.toLowerCase().includes(searchText)) {
                found = true;
                break;
            }
        }

        rows[i].style.display = found ? '' : 'none';
    }
}

function logout() {
    const authView = document.getElementById('auth-view');
    if (authView) {
        authView.style.display = 'flex';
        authView.style.opacity = '1';
    }

    const app = document.getElementById('app');
    if (app) {
        app.classList.remove('show');
    }

    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
        adminSection.style.display = 'none';
    }

    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length > 0) {
        value = value.match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        input.value = !value[2] ? value[1] : '+7 (' + value[2] + ') ' + value[3] +
            (value[4] ? '-' + value[4] : '') + (value[5] ? '-' + value[5] : '');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    App.init();

    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
        adminSection.style.display = 'none';
    }

    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';

    const phoneInput = document.getElementById('new-car-owner-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});
