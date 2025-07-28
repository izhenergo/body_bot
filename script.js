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

// Данные о посещениях
const visits = {
    1: {
        model: "BMW X5 (G05)",
        number: "А123БВ777",
        date: "15.04.2023 - 25.04.2023",
        beforeImg: "splash1.jpg",
        afterImg: "splash2.jpg",
        works: [
            "Ремонт правого переднего крыла - 25 000 руб.",
            "Замена правой передней фары - 18 500 руб.",
            "Покраска правых дверей - 32 000 руб.",
            "Ремонт порога - 15 000 руб."
        ],
        total: "90 500 руб."
    },
    2: {
        model: "Audi Q7",
        number: "В456СЕ777",
        date: "10.02.2023 - 20.02.2023",
        beforeImg: "audi_damage.webp",
        afterImg: "audi_repaired.webp",
        works: [
            "Ремонт заднего бампера - 18 000 руб.",
            "Покраска задней двери - 22 000 руб.",
            "Замена стекла задней двери - 35 000 руб."
        ],
        total: "75 000 руб."
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
        showAuthView();
        initTelegramApp();
        setupEventListeners();
    }, 1500);
});

function initTelegramApp() {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    tg.BackButton.hide();
}

function setupEventListeners() {
    // Авторизация
    document.getElementById('loginBtn').addEventListener('click', handleLogin);

    // Навигация
    document.getElementById('main-tab').addEventListener('click', () => showView('main'));
    document.getElementById('history-tab').addEventListener('click', () => showView('history'));
    document.getElementById('profile-tab').addEventListener('click', () => showView('profile'));

    // Кнопки действий
    document.getElementById('callBtn')?.addEventListener('click', () => tg.openTelegramLink('tel:+79991234567'));
    document.getElementById('chatBtn')?.addEventListener('click', () => tg.openTelegramLink('https://t.me/AutoService_Support'));

    // Карусель
    const carousel = document.getElementById('carousel');
    carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
    carousel.addEventListener('touchend', handleTouchEnd);
}

// Система авторизации
function showAuthView() {
    document.getElementById('auth-view').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
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

        if (currentUser.role === 'admin') {
            showAdminScreen();
        } else {
            showMainApp();
        }
    } else {
        tg.showAlert('Неверный логин или пароль');
    }
}

function showMainApp() {
    document.getElementById('app').style.display = 'block';
    showView('main');
    updateCarousel();
}

function showAdminScreen() {
    const adminScreen = document.createElement('div');
    adminScreen.className = 'black-screen';
    adminScreen.innerHTML = `
        <h1>Административная панель</h1>
        <button onclick="logout()">Выйти</button>
    `;
    document.body.appendChild(adminScreen);
}

function logout() {
    currentUser = null;
    document.getElementById('app').style.display = 'none';

    const adminScreen = document.querySelector('.black-screen');
    if (adminScreen) adminScreen.remove();

    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
    showAuthView();
}

// Навигация по приложению
function showView(view) {
    if (!currentUser) return showAuthView();

    currentView = view;

    // Скрываем все вью
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('visit-detail-view').style.display = 'none';

    // Сбрасываем активные табы
    document.getElementById('main-tab').classList.remove('active');
    document.getElementById('history-tab').classList.remove('active');
    document.getElementById('profile-tab').classList.remove('active');

    // Показываем нужную вью
    switch(view) {
        case 'main':
            document.querySelector('.main-content').style.display = 'block';
            document.getElementById('main-tab').classList.add('active');
            tg.BackButton.hide();
            break;
        case 'history':
            document.getElementById('history-view').style.display = 'block';
            document.getElementById('history-tab').classList.add('active');
            tg.BackButton.show();
            tg.BackButton.onClick(() => showView('main'));
            break;
        case 'profile':
            document.getElementById('profile-view').style.display = 'block';
            document.getElementById('profile-tab').classList.add('active');
            tg.BackButton.show();
            tg.BackButton.onClick(() => showView('main'));
            break;
    }
}

function showVisitDetail(visitId) {
    const visit = visits[visitId];
    let worksHtml = visit.works.map(work => `<li>${work}</li>`).join('');

    document.getElementById('visit-detail-content').innerHTML = `
        <div class="history-car-info">
            <div class="history-car-model">${visit.model}</div>
            <div class="history-car-number">${visit.number}</div>
            <div class="history-date">${visit.date}</div>
        </div>
        <div class="history-carousel">
            <div class="history-carousel-inner">
                <div class="history-carousel-item">
                    <img src="${visit.beforeImg}" alt="До ремонта" loading="lazy">
                    <div class="history-carousel-caption">До ремонта</div>
                </div>
                <div class="history-carousel-item">
                    <img src="${visit.afterImg}" alt="После ремонта" loading="lazy">
                    <div class="history-carousel-caption">После ремонта</div>
                </div>
            </div>
        </div>
        <div class="history-work-list">
            <h3>Выполненные работы:</h3>
            <ul>${worksHtml}</ul>
        </div>
        <div class="current-status-card" style="margin-top: 20px;">
            <div class="current-status-title">Итоговая смета</div>
            <div class="current-status-text">Общая сумма: ${visit.total}</div>
            <button class="btn btn-estimate" onclick="tg.showAlert('Смета по ${visit.model}\\n\\n${visit.works.join('\\n')}\\n\\nИтого: ${visit.total}')">
                Показать полную смету
            </button>
        </div>
    `;

    document.getElementById('visit-detail-view').style.display = 'block';
    tg.BackButton.show();
    tg.BackButton.onClick(() => showView('history'));
}

function showEstimate() {
    tg.showAlert('Смета согласована 15.04.2023. Общая сумма: 125 430 руб.');
}

// Работа с каруселью
function updateCarousel() {
    document.querySelector('.carousel-inner').style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-item');
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    const slides = document.querySelectorAll('.carousel-item');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
}

function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
}

function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const diff = startX - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
        isDragging = false;
        diff > 0 ? nextSlide() : prevSlide();
    }
}

function handleTouchEnd() {
    isDragging = false;
}

// Поддержка iOS
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.body.style.minHeight = '100vh';
    document.body.style.minHeight = '-webkit-fill-available';
    document.getElementById('app').style.minHeight = '-webkit-fill-available';
}

// Глобальные функции
window.logout = logout;
window.showVisitDetail = showVisitDetail;
window.showEstimate = showEstimate;
