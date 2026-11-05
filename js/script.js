let recipesData = []; 

// Ждем, пока вся страница HTML загрузится, прежде чем запускать скрипт
document.addEventListener('DOMContentLoaded', () => {
    
    // 2. ЗАГРУЗКА JSON
    // Используем fetch, чтобы скачать файл data.json из папки data
    fetch('data/data.json')
        .then(response => response.json()) // Превращаем ответ в объект JS
        .then(data => {
            recipesData = data; // Сохраняем данные в нашу глобальную переменную
            console.log("Данные успешно загружены:", recipesData); // Проверка в консоли
        })
        .catch(error => console.error("Ошибка загрузки данных:", error));

    // 3. ФУНКЦИЯ 1: РАБОТА ФИЛЬТРОВ (Кнопки "5 минут", "10 минут" и т.д.)
    const filterTags = document.querySelectorAll('.tag');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Сначала убираем класс 'active' у всех кнопок
            filterTags.forEach(t => t.classList.remove('active'));
            // Потом добавляем класс 'active' той кнопке, по которой кликнули
            tag.classList.add('active');
        });
    });

    // 4. ФУНКЦИЯ 2: ИЗБРАННОЕ (Клик по звездочке)
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // toggle - это переключатель. Если класс был, он удалится, если не было - добавится
            button.classList.toggle('selected');
            
            // Меняем текст звездочки (пустая/закрашенная)
            if (button.classList.contains('selected')) {
                button.textContent = "★"; // Закрашенная звезда
            } else {
                button.textContent = "☆"; // Пустая звезда
            }
        });
    });

    // 5. ФУНКЦИЯ 3 и 4: МОДАЛЬНОЕ ОКНО
    const modal = document.getElementById('recipe-modal');
    const closeBtn = document.getElementById('close-modal');
    const recipeArrows = document.querySelectorAll('.recipe-arrow'); // Все кнопки-стрелочки

    // Элементы внутри модального окна, которые мы будем менять
    const modalImage = document.getElementById('modal-image');
    const modalTime = document.getElementById('modal-time');
    const modalTitle = document.getElementById('modal-title');
    const modalIngredients = document.getElementById('modal-ingredients');
    const modalSteps = document.getElementById('modal-steps');

    // Вешаем клик на каждую стрелочку в карточках
    recipeArrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            // Получаем id рецепта из атрибута data-recipe
            const recipeId = arrow.getAttribute('data-recipe');
            
            // Ищем нужный рецепт в наших загруженных данных
            const recipe = recipesData.find(item => item.id === recipeId);

            if (recipe) {
                // Заполняем модалку данными из JSON
                modalImage.src = recipe.image;
                modalTime.textContent = recipe.time;
                modalTitle.textContent = recipe.title;
                
                // Очищаем старые списки ингредиентов и шагов
                modalIngredients.innerHTML = '';
                modalSteps.innerHTML = '';

                // Добавляем ингредиенты
                recipe.ingredients.forEach(ing => {
                    const li = document.createElement('li');
                    li.textContent = ing;
                    modalIngredients.appendChild(li);
                });

                // Добавляем шаги приготовления
                recipe.steps.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step;
                    modalSteps.appendChild(li);
                });

                // Показываем модалку (в CSS у нас display: none, меняем на flex)
                modal.style.display = 'flex';
                modal.setAttribute('aria-hidden', 'false'); // Для доступности
            }
        });
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none'; // Скрываем
        modal.setAttribute('aria-hidden', 'true');
    });
    
    // Закрытие по кнопке внизу
    const closeBtnBottom = document.getElementById('close-modal-btn');
    if (closeBtnBottom) {
        closeBtnBottom.addEventListener('click', () => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        });
    }


    // Закрытие модалки по клику на серый фон (вне окна)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
    