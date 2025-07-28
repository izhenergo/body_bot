// Проверяем, загружен ли Telegram WebApp
const tg = window.Telegram?.WebApp || {
    ready: () => console.log('Telegram WebApp not available'),
    showAlert: (msg) => alert(msg),
    expand: () => console.log('Expand not available'),
    enableClosingConfirmation: () => {},
    BackButton: {
        show: () => {},
        hide: () => {},
        onClick: () => {}
    },
    openTelegramLink: (url) => window.open(url, '_blank')
};

let currentView = 'main', currentSlide = 0;

// Данные для авторизации
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
    }
};

// Основная инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Сначала скрываем сплеш-скрин через 1 секунду
    setTimeout(function() {
        const splash = document.getElementById('splash');
        if (splash) splash.classList.add('hidden');

        // Затем показываем форму авторизации
        const authView = document.getElementById('auth-view');
        if (authView) {
            authView.classList.remove('hidden');

            // Обработчик формы авторизации
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    handleLogin();
                });
            }
        } else {
            console.error('Auth view not found');
        }
    }, 1000);
});

// Обработка входа
function handleLogin() {
    try {
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;

        if (!username || !password) {
            tg.showAlert('Введите логин и пароль');
            return;
        }

        if (users[username] && users[username].password === password) {
            document.getElementById('auth-view').classList.add('hidden');

            if (users[username].role === 'admin') {
                document.getElementById('admin-panel').classList.remove('hidden');
            } else {
                document.getElementById('app').classList.remove('hidden');
                initApp();
            }
        } else {
            tg.showAlert('Неверный логин или пароль');
        }
    } catch (e) {
        console.error('Login error:', e);
        tg.showAlert('Ошибка входа');
    }
}

// Инициализация приложения
function initApp() {
    try {
        // Инициализация Telegram WebApp
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
        tg.BackButton.hide();

        // Настройка обработчиков
        const callBtn = document.getElementById('callBtn');
        if (callBtn) callBtn.addEventListener('click', () => tg.openTelegramLink('tel:+79991234567'));

        const chatBtn = document.getElementById('chatBtn');
        if (chatBtn) chatBtn.addEventListener('click', () => tg.openTelegramLink('https://t.me/AutoService_Support'));

        // Инициализация навигации
        setupNavigation();

        // Инициализация карусели
        initCarousel();

        // Показать главный экран
        showMainView();
    } catch (e) {
        console.error('App init error:', e);
        tg.showAlert('Ошибка инициализации приложения');
    }
}

function setupNavigation() {
    const historyTab = document.getElementById('history-tab');
    const mainTab = document.getElementById('main-tab');
    const profileTab = document.getElementById('profile-tab');

    if (historyTab) historyTab.addEventListener('click', (e) => {
        e.preventDefault();
        showHistoryView();
    });

    if (mainTab) mainTab.addEventListener('click', (e) => {
        e.preventDefault();
        showMainView();
    });

    if (profileTab) profileTab.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileView();
    });
}

function initCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    let startX = 0, isDragging = false;

    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: false });

    carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const diff = startX - e.touches[0].clientX;
        if (Math.abs(diff) > 50) {
            isDragging = false;
            diff > 0 ? nextSlide() : prevSlide();
        }
    }, { passive: false });

    carousel.addEventListener('touchend', () => {
        isDragging = false;
    });

    updateCarousel();
}

// Навигация
function showMainView() {
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

// Карусель
function updateCarousel() {
    const carouselInner = document.querySelector('.carousel-inner');
    if (carouselInner) {
        carouselInner.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length > 0) {
        currentSlide = (currentSlide + 1) % slides.length;
        updateCarousel();
    }
}

function prevSlide() {
    const slides = document.querySelectorAll('.carousel-item');
    if (slides.length > 0) {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateCarousel();
    }
}

// Детали посещения
function showVisitDetail(visitId) {
    const visit = visits[visitId];
    if (!visit) return;

    const detailContent = document.getElementById('visit-detail-content');
    if (!detailContent) return;

    detailContent.innerHTML = `
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
            <ul>${visit.works.map(work => `<li>${work}</li>`).join('')}</ul>
        </div>
        <div class="current-status-card" style="margin-top: 20px;">
            <div class="current-status-title">Итоговая смета</div>
            <div class="current-status-text">Общая сумма: ${visit.total}</div>
            <button class="btn btn-estimate" onclick="window.tg.showAlert('Смета по ${visit.model}\\n\\n${visit.works.join('\\n')}\\n\\nИтого: ${visit.total}')">
                Показать полную смету
            </button>
        </div>
    `;

    document.querySelector('.main-content').style.display = 'none';
    document.getElementById('history-view').style.display = 'none';
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('visit-detail-view').style.display = 'block';

    tg.BackButton.show();
    tg.BackButton.onClick(showHistoryView);
}

function backToHistory() {
    showHistoryView();
}

function showEstimate() {
    tg.showAlert('Смета согласована 15.04.2023. Общая сумма: 125 430 руб.');
}

// Делаем функции доступными глобально для обработчиков в HTML
window.showVisitDetail = showVisitDetail;
window.showEstimate = showEstimate;
window.tg = tg;
