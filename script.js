const tg = window.Telegram.WebApp;
let currentView = 'main', currentSlide = 0, startX = 0, isDragging = false;
let currentUser = null;

// Данные пользователей и их роли
const users = {
    '1': { password: '1', role: 'user', view: 'main' },
    '2': { password: '2', role: 'admin', view: 'black' }
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

// Черный экран для админа
const blackScreen = `
    <div id="black-screen" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #000; color: #fff; display: flex; justify-content: center; align-items: center; z-index: 1000;">
        <h1>Административная панель</h1>
        <button onclick="logout()" style="position: absolute; bottom: 20px; background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Выйти</button>
    </div>
`;

// Функции авторизации
function showAuthView() {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('auth-view').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function hideAuthView() {
    document.getElementById('auth-view').style.display = 'none';
}

function login() {
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    if (users[login] && users[login].password === password) {
        currentUser = users[login];

        if (currentUser.view === 'black') {
            document.body.insertAdjacentHTML('beforeend', blackScreen);
            hideAuthView();
        } else {
            document.getElementById('app').style.display = 'flex';
            document.getElementById('app').classList.add('visible');
            hideAuthView();
            showMainView();
        }

        tg.showAlert(`Добро пожаловать, ${login}!`);
    } else {
        tg.showAlert('Неверный логин или пароль');
    }
}

function logout() {
    currentUser = null;
    const blackScreen = document.getElementById('black-screen');
    if (blackScreen) blackScreen.remove();

    document.getElementById('login').value = '';
    document.getElementById('password').value = '';

    showAuthView();
}

// Функции навигации по приложению
function showMainView() {
    if (!currentUser) {
        showAuthView();
        return;
    }

    if (currentUser.view === 'black') return;

    currentView = 'main';
    document.querySelector('.main-content').style.display = 'block';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('visit-detail-view').style.display = 'none';
    document.getElementById('main-tab').classList.add('active');
    document.getElementById('history-tab').classList.remove('active');
    document.getElementById('profile-tab').classList.remove('active');
    tg.BackButton.hide();
}

function showHistoryView() {
    currentView = 'history';
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'block';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('visit-detail-view').style.display = 'none';
    document.getElementById('main-tab').classList.remove('active');
    document.getElementById('history-tab').classList.add('active');
    document.getElementById('profile-tab').classList.remove('active');
    tg.BackButton.show();
    tg.BackButton.onClick(showMainView);
}

function showProfileView() {
    currentView = 'profile';
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'block';
    document.getElementById('visit-detail-view').style.display = 'none';
    document.getElementById('main-tab').classList.remove('active');
    document.getElementById('history-tab').classList.remove('active');
    document.getElementById('profile-tab').classList.add('active');
    tg.BackButton.show();
    tg.BackButton.onClick(showMainView);
}

function showVisitDetail(visitId) {
    currentView = 'visit-detail';
    const visit = visits[visitId];

    let worksHtml = '';
    visit.works.forEach(work => {
        worksHtml += `<li>${work}</li>`;
    });

    const detailContent = `
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

    document.getElementById('visit-detail-content').innerHTML = detailContent;
    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('visit-detail-view').style.display = 'block';

    tg.BackButton.show();
    tg.BackButton.onClick(backToHistory);
}

function backToHistory() {
    showHistoryView();
}

function showEstimate() {
    tg.showAlert('Смета согласована 15.04.2023. Общая сумма: 125 430 руб.');
}

// Функции карусели
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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Показываем сплеш-скрин 1.5 секунды, затем форму авторизации
    setTimeout(() => {
        showAuthView();
        updateCarousel();
    }, 1500);

    // Обработчики кнопок
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('callBtn')?.addEventListener('click', () => tg.openTelegramLink('tel:+79991234567'));
    document.getElementById('chatBtn')?.addEventListener('click', () => tg.openTelegramLink('https://t.me/AutoService_Support'));
    document.getElementById('history-tab').addEventListener('click', showHistoryView);
    document.getElementById('main-tab').addEventListener('click', showMainView);
    document.getElementById('profile-tab').addEventListener('click', showProfileView);

    // Обработчики карусели
    const carousel = document.getElementById('carousel');
    carousel.addEventListener('touchstart', handleTouchStart, { passive: false });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
    carousel.addEventListener('touchend', handleTouchEnd);

    // Поддержка iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.minHeight = '100vh';
        document.body.style.minHeight = '-webkit-fill-available';
        document.getElementById('app').style.minHeight = '-webkit-fill-available';
    }

    // Инициализация Telegram WebApp
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    tg.BackButton.hide();
});
