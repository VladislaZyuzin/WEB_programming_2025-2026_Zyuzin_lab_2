let tasks = [];
let sortAsc = true;
let filterStatus = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  // Создание структуры приложения
  const container = document.createElement('div');
  container.className = 'container';
  document.body.appendChild(container);

  // Заголовок
  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = '📝 Мой To-Do List';
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Организуйте свои задачи эффективно';
  header.appendChild(title);
  header.appendChild(subtitle);
  container.appendChild(header);

  // Форма добавления задачи
  const taskForm = document.createElement('div');
  taskForm.className = 'task-form';
  
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group';
  
  const taskInput = document.createElement('input');
  taskInput.type = 'text';
  taskInput.placeholder = 'Введите новую задачу...';
  taskInput.className = 'task-input-field';

  const taskDate = document.createElement('input');
  taskDate.type = 'date';
  taskDate.className = 'task-date-field';

  const addButton = document.createElement('button');
  addButton.className = 'add-btn';
  
  const addIcon = document.createElement('span');
  addIcon.textContent = '➕';
  const addText = document.createTextNode(' Добавить');
  addButton.appendChild(addIcon);
  addButton.appendChild(addText);

  inputGroup.append(taskInput, taskDate, addButton);
  taskForm.appendChild(inputGroup);
  container.appendChild(taskForm);

  // Панель управления
  const controlsPanel = document.createElement('div');
  controlsPanel.className = 'controls-panel';

  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '🔍 Поиск задач...';
  searchInput.className = 'search-field';
  searchContainer.appendChild(searchInput);

  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'filters-container';

  const statusFilter = document.createElement('select');
  statusFilter.className = 'status-filter';
  
  const filterOptions = [
    { value: 'all', text: '📋 Все задачи' },
    { value: 'incomplete', text: '⏳ Активные' },
    { value: 'completed', text: '✅ Выполненные' }
  ];
  
  filterOptions.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    statusFilter.appendChild(optionElement);
  });

  const sortButton = document.createElement('button');
  sortButton.className = 'sort-btn';
  
  const sortIcon = document.createElement('span');
  sortIcon.textContent = '📅';
  const sortText = document.createTextNode(' Сортировать по дате');
  sortButton.appendChild(sortIcon);
  sortButton.appendChild(sortText);

  const clearCompletedBtn = document.createElement('button');
  clearCompletedBtn.className = 'clear-btn';
  
  const clearIcon = document.createElement('span');
  clearIcon.textContent = '🗑️';
  const clearText = document.createTextNode(' Очистить выполненные');
  clearCompletedBtn.appendChild(clearIcon);
  clearCompletedBtn.appendChild(clearText);

  filtersContainer.append(statusFilter, sortButton, clearCompletedBtn);
  controlsPanel.append(searchContainer, filtersContainer);
  container.appendChild(controlsPanel);

  // Статистика
  const statsPanel = document.createElement('div');
  statsPanel.className = 'stats-panel';
  container.appendChild(statsPanel);

  // Список задач
  const taskList = document.createElement('ul');
  taskList.className = 'task-list';
  taskList.id = 'taskList';
  container.appendChild(taskList);

  // Загрузка и первоначальная отрисовка
  loadTasks();
  updateStats();
  renderTasks();

  // Обработчики событий
  addButton.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderTasks();
  });
  
  statusFilter.addEventListener('change', () => {
    filterStatus = statusFilter.value;
    renderTasks();
  });
  
  sortButton.addEventListener('click', toggleSort);
  clearCompletedBtn.addEventListener('click', clearCompletedTasks);

  // Функции
  function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value;
    
    if (text === '') {
      showNotification('Введите название задачи!', 'error');
      return;
    }

    const task = {
      id: Date.now(),
      text: text,
      date: date || new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();
    
    taskInput.value = '';
    taskDate.value = '';
    taskInput.focus();
    
    showNotification('Задача добавлена!', 'success');
  }

  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
    showNotification('Задача удалена', 'info');
  }

  function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
      updateStats();
    }
  }

  function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const newText = prompt('Редактировать задачу:', task.text);
    if (newText !== null && newText.trim() !== '') {
      task.text = newText.trim();
    }

    const newDate = prompt('Редактировать дату (ГГГГ-ММ-ДД):', task.date);
    if (newDate !== null && newDate.trim() !== '') {
      task.date = newDate.trim();
    }

    saveTasks();
    renderTasks();
    showNotification('Задача обновлена', 'success');
  }

  function toggleSort() {
    tasks.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt);
      const dateB = new Date(b.date || b.createdAt);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
    
    sortAsc = !sortAsc;
    
    // Обновляем текст кнопки
    sortButton.textContent = '';
    const newSortIcon = document.createElement('span');
    newSortIcon.textContent = '📅';
    const newSortText = document.createTextNode(sortAsc ? ' Сортировать по дате ↑' : ' Сортировать по дате ↓');
    sortButton.appendChild(newSortIcon);
    sortButton.appendChild(newSortText);
    
    renderTasks();
    saveTasks();
  }

  function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
      showNotification('Нет выполненных задач для удаления', 'info');
      return;
    }

    if (confirm(`Удалить ${completedCount} выполненных задач?`)) {
      tasks = tasks.filter(task => !task.completed);
      saveTasks();
      renderTasks();
      updateStats();
      showNotification(`Удалено ${completedCount} задач`, 'success');
    }
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    // Очищаем статистику
    while (statsPanel.firstChild) {
      statsPanel.removeChild(statsPanel.firstChild);
    }

    // Создаем элементы статистики
    const stats = [
      { label: 'Всего:', value: total },
      { label: 'Активные:', value: active },
      { label: 'Выполненные:', value: completed }
    ];

    stats.forEach(stat => {
      const statItem = document.createElement('div');
      statItem.className = 'stat-item';

      const statLabel = document.createElement('span');
      statLabel.className = 'stat-label';
      statLabel.textContent = stat.label;

      const statValue = document.createElement('span');
      statValue.className = 'stat-value';
      statValue.textContent = stat.value;

      statItem.appendChild(statLabel);
      statItem.appendChild(statValue);
      statsPanel.appendChild(statItem);
    });
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasksJSON = localStorage.getItem('todoTasks');
    if (tasksJSON) {
      tasks = JSON.parse(tasksJSON);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Без даты';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  }

  function renderTasks() {
    // Очищаем список
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }

    let filteredTasks = tasks.filter(task => {
      if (filterStatus === 'completed' && !task.completed) return false;
      if (filterStatus === 'incomplete' && task.completed) return false;
      if (searchQuery && !task.text.toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (filteredTasks.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      
      const emptyIcon = document.createElement('div');
      emptyIcon.textContent = '📝';
      
      const emptyText = document.createElement('p');
      emptyText.textContent = searchQuery ? 'Задачи не найдены' : 'Нет задач';
      
      const emptySubtext = document.createElement('small');
      emptySubtext.textContent = searchQuery ? 'Попробуйте изменить запрос' : 'Добавьте первую задачу!';
      
      emptyState.appendChild(emptyIcon);
      emptyState.appendChild(emptyText);
      emptyState.appendChild(emptySubtext);
      taskList.appendChild(emptyState);
      return;
    }

    filteredTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.draggable = true;
      li.dataset.id = task.id;

      // Создаем структуру задачи через DOM методы
      const taskContent = document.createElement('div');
      taskContent.className = 'task-content';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;

      const taskInfo = document.createElement('div');
      taskInfo.className = 'task-info';

      const taskText = document.createElement('span');
      taskText.className = 'task-text';
      taskText.textContent = task.text;

      const taskDate = document.createElement('span');
      taskDate.className = 'task-date';
      taskDate.textContent = formatDate(task.date);

      taskInfo.appendChild(taskText);
      taskInfo.appendChild(taskDate);

      taskContent.appendChild(checkbox);
      taskContent.appendChild(taskInfo);

      const taskActions = document.createElement('div');
      taskActions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-edit';
      editBtn.title = 'Редактировать';
      editBtn.textContent = '✏️';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.title = 'Удалить';
      deleteBtn.textContent = '🗑️';

      taskActions.appendChild(editBtn);
      taskActions.appendChild(deleteBtn);

      li.appendChild(taskContent);
      li.appendChild(taskActions);

      // Обработчики событий
      checkbox.addEventListener('change', () => toggleTask(task.id));
      editBtn.addEventListener('click', () => editTask(task.id));
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      // Drag and Drop
      li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        li.classList.add('dragging');
      });

      li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
      });

      li.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      li.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragId = parseInt(e.dataTransfer.getData('text/plain'));
        const dropId = parseInt(li.dataset.id);
        
        if (dragId === dropId) return;
        
        const dragIndex = tasks.findIndex(t => t.id === dragId);
        const dropIndex = tasks.findIndex(t => t.id === dropId);
        
        const [dragTask] = tasks.splice(dragIndex, 1);
        tasks.splice(dropIndex, 0, dragTask);
        
        saveTasks();
        renderTasks();
        showNotification('Порядок задач изменен', 'info');
      });

      taskList.appendChild(li);
    });
  }
});
