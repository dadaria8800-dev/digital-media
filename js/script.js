// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let recipesData = [];                 // сюда попадёт массив из JSON
let activeFilter = 'all';             // текущий активный фильтр

// ===== ССЫЛКИ НА DOM =====
const recipesContainer = document.getElementById('recipes-container');
const filterTags = document.querySelectorAll('.tag');

// Элементы модального окна
const modal = document.getElementById('recipe-modal');
const closeBtn = document.getElementById('close-modal');
const closeBtnBottom = document.getElementById('close-modal-btn');
const modalImage = document.getElementById('modal-image');
const modalTime = document.getElementById('modal-time');
const modalTitle = document.getElementById('modal-title');
const modalIngredients = document.getElementById('modal-ingredients');
const modalSteps = document.getElementById('modal-steps');


// ===== 1. ЗАГРУЗКА ДАННЫХ ИЗ JSON =====
async function loadRecipes() {
    try {
        const response = await fetch('data/data.json');

        // Если сервер вернул ошибку (404 и т.п.) — выбрасываем исключение
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        recipesData = await response.json();
        console.log('Данные успешно загружены:', recipesData);

        renderRecipes(recipesData);
        bindCardEvents();          // навешиваем обработчики на новые карточки

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showErrorMessage('Не удалось загрузить рецепты. Попробуйте обновить страницу позже.');
    }
}


// ===== 2. СОЗДАНИЕ И ВЫВОД КАРТОЧЕК =====
function createRecipeCard(recipe) {
    // Внешний <article> — как в исходном HTML
    const article = document.createElement('article');
    article.className = 'recipe-card';
    article.dataset.time = recipe.timeMinutes;

    // Блок с картинкой и бейджем категории
    const imageBlock = document.createElement('div');
    imageBlock.className = 'recipe-image';

    const img = document.createElement('img');
    img.src = recipe.image;
    img.alt = recipe.title;

    const badge = document.createElement('span');
    badge.className = 'recipe-badge';
    badge.textContent = recipe.category;

    imageBlock.append(img, badge);

    // Контент карточки
    const content = document.createElement('div');
    content.className = 'recipe-content';

    const titleRow = document.createElement('div');
    titleRow.className = 'recipe-title-row';

    const h3 = document.createElement('h3');
    h3.textContent = recipe.title;

    const favBtn = document.createElement('button');
    favBtn.className = 'favorite-button';
    favBtn.type = 'button';
    favBtn.setAttribute('aria-label', 'Добавить в избранное');
    favBtn.textContent = '☆';

    titleRow.append(h3, favBtn);

    const ingredientsTitle = document.createElement('p');
    ingredientsTitle.className = 'ingredients-title';
    ingredientsTitle.textContent = 'Ингредиенты:';

    const ingredientsList = document.createElement('ul');
    ingredientsList.className = 'ingredients';
    recipe.ingredients.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ingredientsList.appendChild(li);
    });

    const arrowBtn = document.createElement('button');
    arrowBtn.className = 'recipe-arrow';
    arrowBtn.dataset.recipe = recipe.id;
    arrowBtn.type = 'button';
    arrowBtn.setAttribute('aria-label', 'Открыть рецепт');
    arrowBtn.textContent = '›';

    content.append(titleRow, ingredientsTitle, ingredientsList, arrowBtn);

    article.append(imageBlock, content);
    return article;
}

function renderRecipes(recipes) {
    recipesContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    recipes.forEach(recipe => {
        fragment.appendChild(createRecipeCard(recipe));
    });

    recipesContainer.appendChild(fragment);
}


// ===== 3. СООБЩЕНИЕ ОБ ОШИБКЕ =====
function showErrorMessage(message) {
    recipesContainer.innerHTML = '';

    const errorBox = document.createElement('p');
    errorBox.className = 'error-message';
    errorBox.textContent = message;

    // Простое оформление, чтобы сообщение не терялось
    errorBox.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        padding: 30px;
        color: #A84C30;
        font-size: 16px;
    `;

    recipesContainer.appendChild(errorBox);
}


// ===== 4. НАВЕШИВАНИЕ СОБЫТИЙ НА КАРТОЧКИ =====
function bindCardEvents() {
    // Избранное
    document.querySelectorAll('.favorite-button').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
            button.textContent = button.classList.contains('selected') ? '★' : '☆';
        });
    });

    // Стрелка → открыть модалку
    document.querySelectorAll('.recipe-arrow').forEach(arrow => {
        arrow.addEventListener('click', () => openRecipeModal(arrow.dataset.recipe));
    });
}


// ===== 5. МОДАЛЬНОЕ ОКНО =====
function openRecipeModal(recipeId) {
    const recipe = recipesData.find(item => item.id === recipeId);
    if (!recipe) return;

    modalImage.src = recipe.image;
    modalImage.alt = recipe.title;
    modalTime.textContent = recipe.time;
    modalTitle.textContent = recipe.title;

    modalIngredients.innerHTML = '';
    modalSteps.innerHTML = '';

    recipe.ingredients.forEach(ing => {
        const li = document.createElement('li');
        li.textContent = ing;
        modalIngredients.appendChild(li);
    });

    recipe.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        modalSteps.appendChild(li);
    });

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    if (document.activeElement) {
        document.activeElement.blur();
    }
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

closeBtn.addEventListener('click', closeModal);
closeBtnBottom.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
});


// ===== 6. ФИЛЬТРАЦИЯ =====
function applyFilter(filterValue) {
    activeFilter = filterValue;

    document.querySelectorAll('.recipe-card').forEach(card => {
        const cardTime = Number(card.dataset.time);
        const matches = filterValue === 'all' || cardTime === Number(filterValue);
        card.style.display = matches ? 'block' : 'none';
    });
}

filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        applyFilter(tag.dataset.filter);
    });
});


// ===== 7. СТАРТ =====
document.addEventListener('DOMContentLoaded', loadRecipes);
// ===== 8. МОДАЛЬНЫЕ ОКНА "КОНТАКТЫ" И "О ПРОЕКТЕ" =====
const contactsModal = document.getElementById('contacts-modal');
const aboutModal = document.getElementById('about-modal');

const openContactsBtn = document.getElementById('open-contacts');
const openAboutBtn = document.getElementById('open-about');

const closeContactsBtn = document.getElementById('close-contacts');
const closeContactsBtnBottom = document.getElementById('close-contacts-btn');

const closeAboutBtn = document.getElementById('close-about');
const closeAboutBtnBottom = document.getElementById('close-about-btn');

// Функция для открытия
function openInfoModal(modalElement) {
    modalElement.style.display = 'flex';
    modalElement.setAttribute('aria-hidden', 'false');
}

// Функция для закрытия (с исправлением ошибки aria-hidden)
function closeInfoModal(modalElement) {
    if (document.activeElement) {
        document.activeElement.blur(); // Убираем фокус
    }
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
}

// Слушатели для окна "Контакты"
openContactsBtn.addEventListener('click', () => openInfoModal(contactsModal));
closeContactsBtn.addEventListener('click', () => closeInfoModal(contactsModal));
closeContactsBtnBottom.addEventListener('click', () => closeInfoModal(contactsModal));

// Слушатели для окна "О проекте"
openAboutBtn.addEventListener('click', () => openInfoModal(aboutModal));
closeAboutBtn.addEventListener('click', () => closeInfoModal(aboutModal));
closeAboutBtnBottom.addEventListener('click', () => closeInfoModal(aboutModal));

// Закрытие по клику на серый фон для обоих окон
[contactsModal, aboutModal].forEach(modalEl => {
    modalEl.addEventListener('click', (event) => {
        if (event.target === modalEl) {
            closeInfoModal(modalEl);
        }
    });
});