// Основные константы и переменные (глобальные)
var carsDatabase = [];
var clientsDatabase = [];
var currentDragItem = null;
var currentEditingCarId = null;

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
                typeOfRepair: "body-repair",
                description: "Кузовной ремонт после ДТП",
                clientId: 1,
                photos: [],
                documents: [],
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
                typeOfRepair: "painting",
                description: "Покраска переднего бампера",
                clientId: 2,
                photos: [],
                documents: [],
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
                name: "Мария Сидорova",
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
            const repairTypeText = getRepairTypeText(car.typeOfRepair);

            carCard.innerHTML = `
                <div class="car-status ${statusClass}">${statusText}</div>
                <h2><i class="fas fa-car"></i> ${car.brand} ${car.model}</h2>
                <p>Госномер: ${car.number}</p>
                <p>Статус: ${statusText}</p>
                <div class="car-meta">
                    <span><i class="fas fa-tachometer-alt"></i> ${car.odometer || '0'} км</span>
                    <span><i class="fas fa-wrench"></i> ${repairTypeText}</span>
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
        document.getElementById(`${view}-tab`).classList.add('active');

        // Update title
        const titles = {
            'main': 'Мои автомобили',
            'history': 'История обслуживания',
            'profile': 'Мой профиль'
        };
        document.getElementById('current-screen-title').textContent = titles[view];

        // Show appropriate view
        document.getElementById('cars-list-view').style.display = 'none';
        document.getElementById('car-details-view').style.display = 'none';
        document.getElementById('history-view').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';

        switch(view) {
            case 'main':
                document.getElementById('cars-list-view').style.display = 'block';
                this.updateCarsList();
                break;
            case 'history':
                document.getElementById('history-view').style.display = 'block';
                break;
            case 'profile':
                document.getElementById('profile-view').style.display = 'block';
                break;
        }
    },

    showCarDetails(carId) {
        // Для администратора сразу открываем редактирование
        const isAdmin = document.getElementById('adminSection').style.display === 'block';
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
        document.getElementById('car-model').textContent = `${car.brand} ${car.model}`;
        document.getElementById('car-plate').textContent = car.number;
        document.getElementById('car-vin').textContent = car.vin || 'Не указан';
        document.getElementById('car-year').textContent = car.year || 'Не указан';
        document.getElementById('car-mileage').textContent = car.odometer ? `${car.odometer} км` : 'Не указан';

        // Update repair status timeline
        this.updateRepairStatus(car.repairStatus || []);

        // Update photo gallery
        this.updatePhotoGallery(car.photos || []);

        // Update documents
        this.updateDocuments(car.documents || []);

        // Show car details view
        document.getElementById('cars-list-view').style.display = 'none';
        document.getElementById('car-details-view').style.display = 'block';
        document.getElementById('current-screen-title').textContent = `${car.brand} ${car.model}`;
    },

    updateRepairStatus(statusItems) {
        const timeline = document.getElementById('status-timeline');
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

    updatePhotoGallery(photos) {
        const gallery = document.getElementById('gallery-container');
        gallery.innerHTML = '';

        if (photos.length === 0) {
            gallery.innerHTML = '<p style="padding: 16px; text-align: center; color: var(--gray);">Фотографии по ремонту пока отсутствуют</p>';
            return;
        }

        photos.forEach(photo => {
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
        documentList.innerHTML = '';

        if (!documents || documents.length === 0) {
            documentList.innerHTML = '<p style="padding: 16px; text-align: center; color: var(--gray);">Документы пока отсутствуют</p>';
            return;
        }

        documents.forEach(doc => {
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
        modal.classList.add('show');
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    },

    hideGames() {
        const modal = document.getElementById('games-modal');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.remove('show');
        }, 300);
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
            document.getElementById('adminSection').style.display = 'none';
            document.getElementById('user-tabbar').style.display = 'none';
            document.getElementById('admin-tabbar').style.display = 'none';
            document.getElementById('auth-view').style.display = 'flex';
            document.getElementById('auth-view').style.opacity = '1';

            // Reset form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
        }
    }
};

// Администраторская панель (глобальная)
var Admin = {
    uploadedPhotos: [],
    uploadedDocuments: [],

    showAddCarPage() {
        document.getElementById('add-car-page').classList.add('active');
    },

    hideAddCarPage() {
        document.getElementById('add-car-page').classList.remove('active');
        this.clearForm();
    },

    clearForm() {
        document.getElementById('new-car-brand').value = '';
        document.getElementById('new-car-model').value = '';
        document.getElementById('new-car-number').value = '';
        document.getElementById('new-car-odometer').value = '';
        document.getElementById('new-car-year').value = '';
        document.getElementById('new-car-vin').value = '';
        document.getElementById('new-type-of-repair').value = 'body-repair';
        this.uploadedPhotos = [];
        this.uploadedDocuments = [];
        this.updatePhotoGallery();
        this.updateDocumentGallery();
    },

    handlePhotoUpload(files) {
        if (files && files.length === 0) return;

        if (files) {
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
                        this.updatePhotoGallery();
                    };
                    reader.readAsDataURL(file);
                }
            }
        } else {
            document.getElementById('edit-photo-upload-input').click();
        }
    },

    handleDocumentUpload(files) {
        if (files && files.length === 0) return;

        if (files) {
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
                    this.updateDocumentGallery();
                };
                reader.readAsDataURL(file);
            }
        } else {
            document.getElementById('edit-document-upload-input').click();
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

    updatePhotoGallery() {
        const container = document.getElementById('uploaded-photos-container');
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

    updateDocumentGallery() {
        const container = document.getElementById('uploaded-documents-container');
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
        this.updatePhotoGallery();
    },

    removeDocument(docId) {
        this.uploadedDocuments = this.uploadedDocuments.filter(doc => doc.id !== docId);
        this.updateDocumentGallery();
    },

    addNewCar() {
        const brand = document.getElementById('new-car-brand').value;
        const model = document.getElementById('new-car-model').value;
        const number = document.getElementById('new-car-number').value;
        const odometer = document.getElementById('new-car-odometer').value;
        const year = document.getElementById('new-car-year').value;
        const vin = document.getElementById('new-car-vin').value;
        const repairType = document.getElementById('new-type-of-repair').value;

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
            typeOfRepair: repairType,
            status: 'diagnostic',
            photos: this.uploadedPhotos,
            documents: this.uploadedDocuments,
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
        this.hideAddCarPage();
        updateCarsTable();

        alert(`Автомобиль ${brand} ${model} (${number}) успешно добавлен!`);
    },

    // Функции для редактирования автомобиля
    showEditCarForm(carId) {
        const car = carsDatabase.find(c => c.id === carId);
        if (!car) return;

        currentEditingCarId = carId;

        // Заполняем форму данными
        document.getElementById('edit-car-brand').value = car.brand;
        document.getElementById('edit-car-model').value = car.model;
        document.getElementById('edit-car-number').value = car.number;
        document.getElementById('edit-car-odometer').value = car.odometer;
        document.getElementById('edit-car-year').value = car.year;
        document.getElementById('edit-car-vin').value = car.vin;
        document.getElementById('edit-type-of-repair').value = car.typeOfRepair;
        document.getElementById('current-status-select').value = car.status;

        // Загружаем текущие фото и документы
        this.uploadedPhotos = car.photos || [];
        this.uploadedDocuments = car.documents || [];
        this.updatePhotoGallery();
        this.updateDocumentGallery();

        // Показываем модальное окно
        document.getElementById('edit-car-modal').classList.add('show');
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
        }
    },

    saveCarEdits() {
        const car = carsDatabase.find(c => c.id === currentEditingCarId);
        if (!car) return;

        // Обновляем данные
        car.brand = document.getElementById('edit-car-brand').value;
        car.model = document.getElementById('edit-car-model').value;
        car.number = document.getElementById('edit-car-number').value;
        car.odometer = document.getElementById('edit-car-odometer').value;
        car.year = document.getElementById('edit-car-year').value;
        car.vin = document.getElementById('edit-car-vin').value;
        car.typeOfRepair = document.getElementById('edit-type-of-repair').value;
        car.photos = this.uploadedPhotos;
        car.documents = this.uploadedDocuments;

        updateCarsTable();
        this.hideEditCarForm();
        alert('Данные автомобиля успешно обновлены!');
    },

    hideEditCarForm() {
        document.getElementById('edit-car-modal').classList.remove('show');
        this.uploadedPhotos = [];
        this.uploadedDocuments = [];
        currentEditingCarId = null;
    }
};

// Вспомогательные функции
function getRepairTypeText(type) {
    switch(type) {
        case 'body-repair': return 'Кузовной ремонт';
        case 'general-car': return 'Слесарный ремонт';
        case 'oil-change': return 'Замена масла';
        case 'maintenance': return 'Техническое обслуживание';
        case 'diagnostic': return 'Диагностика';
        default: return 'Ремонт';
    }
}

// Функции для работы с данными (глобальные)
function initTestData() {
    // Эта функция теперь вызывается в App.initTestData()
    updateCarsTable();
    updateClientsTable();
}

function openTab(tabId) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Показать выбранную вкладку
    document.getElementById(tabId).classList.add('active');

    // Обновить активный элемент в таббаре
    document.querySelectorAll('#admin-tabbar .tabbar-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`#admin-tabbar .tabbar-item[onclick="openTab('${tabId}')"]`).classList.add('active');
}

function updateCarsTable() {
    const tbody = document.getElementById('cars-table-body');
    tbody.innerHTML = '';

    carsDatabase.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>
                    <a href="javascript:void(0)" onclick="App.showCarDetails(${car.id})" 
                       style="color: var(--primary); text-decoration: underline; text-decoration-color: var(--primary); text-underline-offset: 2px; cursor: pointer;">
                        ${car.number}
                    </a>
                </td>
                <td>${car.brand}</td>
                <td>${car.model}</td>
                <td>
                    <select class="status-select" onchange="updateCarStatus(${car.id}, this.value)" data-car-id="${car.id}">
                        <option value="diagnostic" ${car.status === 'diagnostic' ? 'selected' : ''}>Дефектовка</option>
                        <option value="repair" ${car.status === 'repair' ? 'selected' : ''}>Ремонт</option>
                        <option value="painting" ${car.status === 'painting' ? 'selected' : ''}>Покраска</option>
                        <option value="ready" ${car.status === 'ready' ? 'selected' : ''}>Готов к выдаче</option>
                        <option value="completed" ${car.status === 'completed' ? 'selected' : ''}>Выдан клиенту</option>
                    </select>
                </td>
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
    tbody.innerHTML = '';

    clientsDatabase.forEach(client => {
        const clientCars = carsDatabase.filter(car => car.clientId === client.id);
        const carInfo = clientCars.length > 0
            ? `${clientCars[0].brand} ${clientCars[0].model} (${clientCars[0].number})`
            : 'Нет автомобилей';

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
    const searchText = document.getElementById('car-search').value.toLowerCase();
    const rows = document.getElementById('cars-table-body').getElementsByTagName('tr');

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
    const searchText = document.getElementById('client-search').value.toLowerCase();
    const rows = document.getElementById('clients-table-body').getElementsByTagName('tr');

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
    document.getElementById('auth-view').style.display = 'flex';
    document.getElementById('auth-view').style.opacity = '1';
    document.getElementById('app').classList.remove('show');
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('user-tabbar').style.display = 'none';
    document.getElementById('admin-tabbar').style.display = 'none';
});
