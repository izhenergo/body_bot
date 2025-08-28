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

    showAddCarPage() {
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
            }, 300);
        }
    },

    clearForm() {
        this.setInputValue('new-car-brand', '');
        this.setInputValue('new-car-model', '');
        this.setInputValue('new-car-number', '');
        this.setInputValue('new-car-odometer', '');
        this.setInputValue('new-car-year', '');
        this.setInputValue('new-car-vin', '');
        this.setInputValue('new-car-status', 'diagnostic');

        this.uploadedPhotos = [];
        this.uploadedDocuments = [];
        this.updateAdminPhotoGallery('new-uploaded-photos-container');
        this.updateAdminDocumentGallery('new-uploaded-documents-container');
    },

    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value;
        }
    },

    handlePhotoUpload(files, containerId = 'uploaded-photos-container') {
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadedPhotos.push({
                        id: Date.now() + i,
                        file: file,
                        dataUrl: e.target.result,
                        name: file.name,
                        type: 'image'
                    });
                    this.updateAdminPhotoGallery(containerId);
                };
                reader.readAsDataURL(file);
            }
        }
    },

    handleDocumentUpload(files, containerId = 'uploaded-documents-container') {
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileType = this.getFileType(file.name);
                this.uploadedDocuments.push({
                    id: Date.now() + i,
                    file: file,
                    dataUrl: e.target.result,
                    name: file.name,
                    type: fileType,
                    size: this.formatFileSize(file.size),
                    date: new Date().toLocaleDateString('ru-RU')
                });
                this.updateAdminDocumentGallery(containerId);
            };
            reader.readAsDataURL(file);
        }
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

    updateAdminPhotoGallery(containerId = 'uploaded-photos-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (this.uploadedPhotos.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--gray); padding: 20px;">Нет загруженных фотографий</div>';
            return;
        }

        this.uploadedPhotos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${photo.dataUrl}" alt="Фото автомобиля" class="photo-preview">
                <div class="photo-counter">${index + 1}</div>
                <div class="photo-actions">
                    <button class="photo-action-btn" onclick="Admin.removePhoto(${photo.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(photoItem);
        });
    },

    updateAdminDocumentGallery(containerId = 'uploaded-documents-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (this.uploadedDocuments.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--gray); padding: 20px;">Нет загруженных документов</div>';
            return;
        }

        this.uploadedDocuments.forEach((doc, index) => {
            const docItem = document.createElement('div');
            docItem.className = 'document-item-admin';
            docItem.innerHTML = `
                <div class="document-icon-admin">
                    <i class="${App.getDocumentIcon(doc.type)}"></i>
                </div>
                <div class="document-name-admin">${doc.name}</div>
                <div class="document-actions-admin">
                    <button class="document-action-btn delete" onclick="Admin.removeDocument(${doc.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(docItem);
        });
    },

    removePhoto(photoId) {
        this.uploadedPhotos = this.uploadedPhotos.filter(photo => photo.id !== photoId);
        this.updateAdminPhotoGallery();
    },

    removeDocument(docId) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== docId);
        this.updateAdminDocumentGallery();
    },

    addNewCar() {
        const brand = document.getElementById('new-car-brand')?.value || '';
        const model = document.getElementById('new-car-model')?.value || '';
        const number = document.getElementById('new-car-number')?.value || '';
        const odometer = document.getElementById('new-car-odometer')?.value || '';
        const year = document.getElementById('new-car-year')?.value || '';
        const vin = document.getElementById('new-car-vin')?.value || '';
        const status = document.getElementById('new-car-status')?.value || 'diagnostic';

        if (!brand || !model || !number) {
            alert('Пожалуйста, заполните обязательные поля: марка, модель и гос. номер');
            return;
        }

        const newCar = {
            id: carsDatabase.length > 0 ? Math.max(...carsDatabase.map(c => c.id)) + 1 : 1,
            number: number,
            brand: brand,
            model: model,
            year: year,
            vin: vin,
            odometer: odometer,
            status: status,
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

        alert(`Автомобиль ${brand} ${model} (${number}) успешно добавлен!`);
    },

    // Функции для редактирования автомобиля
    showEditCarForm(carId) {
        const car = carsDatabase.find(c => c.id === carId);
        if (!car) return;

        currentEditingCarId = carId;
        this.currentCar = car;

        // Заполняем форму данными
        this.setInputValue('edit-car-brand', car.brand);
        this.setInputValue('edit-car-model', car.model);
        this.setInputValue('edit-car-number', car.number);
        this.setInputValue('edit-car-odometer', car.odometer);
        this.setInputValue('edit-car-year', car.year);
        this.setInputValue('edit-car-vin', car.vin);
        this.setInputValue('current-status-select', car.status);

        // Загружаем текущие фото и документы
        this.uploadedPhotos = [];
        this.uploadedDocuments = [];
        this.updateAdminPhotoGallery();
        this.updateAdminDocumentGallery();

        // Показываем модальное окно
        const modal = document.getElementById('edit-car-modal');
        if (modal) {
            modal.classList.add('show');
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    },

    // Автоматическое сохранение при изменении полей
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

            // Добавляем запись в историю статусов
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

        // Обновляем данные
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

    // Функции для работы с фотографиями
    showPhotoEditPage() {
        if (!this.currentCar) return;

        // Показываем страницу редактирования фотографий
        const page = document.getElementById('photo-edit-page');
        if (page) {
            page.classList.add('active');
        }

        // Загружаем фотографии для текущего автомобиля
        this.loadStatusPhotos();
    },

    hidePhotoEditPage() {
        const page = document.getElementById('photo-edit-page');
        if (page) {
            page.classList.remove('active');
        }
    },

    loadStatusPhotos() {
        if (!this.currentCar) return;

        const statuses = ['diagnostic', 'repair', 'painting', 'ready', 'completed'];

        statuses.forEach(status => {
            const container = document.getElementById(`${status}-photos`);
            if (container) {
                container.innerHTML = '';

                if (this.currentCar.photos && this.currentCar.photos[status] && this.currentCar.photos[status].length > 0) {
                    this.currentCar.photos[status].forEach(photo => {
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
        if (!this.currentCar) return;

        this.currentPhotoStatus = status;

        // Создаем скрытый input для загрузки фото
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = (e) => this.handleStatusPhotoUpload(e.target.files, status);
        input.click();
    },

    handleStatusPhotoUpload(files, status) {
        if (!files || files.length === 0) return;
        if (!this.currentCar) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Инициализируем объект photos если его нет
                    if (!this.currentCar.photos) {
                        this.currentCar.photos = {
                            diagnostic: [],
                            repair: [],
                            painting: [],
                            ready: [],
                            completed: []
                        };
                    }

                    // Инициализируем массив для статуса если его нет
                    if (!this.currentCar.photos[status]) {
                        this.currentCar.photos[status] = [];
                    }

                    // Добавляем фото
                    this.currentCar.photos[status].push({
                        id: Date.now() + i,
                        dataUrl: e.target.result,
                        name: file.name,
                        uploadedAt: new Date().toISOString()
                    });

                    // Обновляем отображение
                    this.loadStatusPhotos();
                };
                reader.readAsDataURL(file);
            }
        }
    },

    deleteStatusPhoto(status, photoId) {
        if (!this.currentCar || !this.currentCar.photos || !this.currentCar.photos[status]) return;

        this.currentCar.photos[status] = this.currentCar.photos[status].filter(photo => photo.id !== photoId);
        this.loadStatusPhotos();
    },

    // Функции для работы с документами
    showDocumentEditPage() {
        if (!this.currentCar) return;

        // Показываем страницу редактирования документов
        const page = document.getElementById('document-edit-page');
        if (page) {
            page.classList.add('active');
        }

        // Загружаем документы для текущего автомобиля
        this.loadStatusDocuments();
    },

    hideDocumentEditPage() {
        const page = document.getElementById('document-edit-page');
        if (page) {
            page.classList.remove('active');
        }
    },

    loadStatusDocuments() {
        if (!this.currentCar) return;

        const documentTypes = ['work-certificate', 'payment-receipt', 'invoice', 'contract', 'warranty'];

        documentTypes.forEach(type => {
            const container = document.getElementById(`${type}-docs`);
            if (container) {
                container.innerHTML = '';

                if (this.currentCar.documents && this.currentCar.documents[type] && this.currentCar.documents[type].length > 0) {
                    this.currentCar.documents[type].forEach(doc => {
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
        if (!this.currentCar) return;

        // Создаем скрытый input для загрузки документа
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => this.handleStatusDocumentUpload(e.target.files, type);
        input.click();
    },

    handleStatusDocumentUpload(files, type) {
        if (!files || files.length === 0) return;
        if (!this.currentCar) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                // Инициализируем объект documents если его нет
                if (!this.currentCar.documents) {
                    this.currentCar.documents = {
                        'work-certificate': [],
                        'payment-receipt': [],
                        'invoice': [],
                        'contract': [],
                        'warranty': []
                    };
                }

                // Инициализируем массив для типа если его нет
                if (!this.currentCar.documents[type]) {
                    this.currentCar.documents[type] = [];
                }

                const fileType = this.getFileType(file.name);

                // Добавляем документ
                this.currentCar.documents[type].push({
                    id: Date.now() + i,
                    dataUrl: e.target.result,
                    name: file.name,
                    type: fileType,
                    size: this.formatFileSize(file.size),
                    uploadedAt: new Date().toISOString()
                });

                // Обновляем отображение
                this.loadStatusDocuments();
            };
            reader.readAsDataURL(file);
        }
    },

    deleteStatusDocument(type, docId) {
        if (!this.currentCar || !this.currentCar.documents || !this.currentCar.documents[type]) return;

        this.currentCar.documents[type] = this.currentCar.documents[type].filter(doc => doc.id !== docId);
        this.loadStatusDocuments();
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
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Показать выбранную вкладку
    const tab = document.getElementById(tabId);
    if (tab) {
        tab.classList.add('active');
    }

    // Обновить активный элемент в таббаре
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

function updateCarStatus(carId, newStatus) {
    const car = carsDatabase.find(c => c.id === carId);
    if (car) {
        car.status = newStatus;

        // Добавляем запись в историю статусов
        if (!car.repairStatus) car.repairStatus = [];
        car.repairStatus.push({
            id: Date.now(),
            date: new Date().toLocaleDateString('ru-RU'),
            title: `Статус изменен на: ${getStatusText(newStatus)}`,
            description: 'Статус ремонта обновлен',
            status: 'completed'
        });

        updateClientsTable();
        alert('Статус автомобиля успешно обновлен!');
    }
}

function updateClientsTable() {
    const tbody = document.getElementById('clients-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    clientsDatabase.forEach(client => {
        const clientCars = carsDatabase.filter(car => car.clientId === client.id);
        let carInfo = 'Нет автомобилей';

        if (clientCars.length > 0) {
            const car = clientCars[0];
            carInfo = `<a href="javascript:void(0)" onclick="Admin.showEditCarForm(${car.id})" 
                         class="car-number-link">${car.number}</a>`;
        }

        const status = clientCars.length > 0
            ? carsDatabase.find(car => car.clientId === client.id).status
            : 'none';

        const statusText = getStatusText(status);
        const statusClass = getStatusClass(status);

        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${carInfo}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            `;

        tbody.appendChild(row);
    });
}

function getStatusClass(status) {
    switch(status) {
        case 'diagnostic': return 'status-pending';
        case 'repair':
        case 'painting': return 'status-in-progress';
        case 'ready': return 'status-completed';
        case 'completed': return 'status-completed';
        default: return '';
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

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].textContent.toLowerCase().includes(searchText)) {
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

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
        adminSection.style.display = 'none';
    }

    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';
});
