const input = document.getElementById('todo-input');
const prioritySelect = document.getElementById('priority-select');
const addButton = document.getElementById('add-button');
const list = document.getElementById('todo-list');
const filters = document.querySelectorAll('.filter');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let dragSrcIndex = null;
let sortByPriority = false;

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function addDragAndDrop(li, index) {
  li.setAttribute('draggable', true);

  li.addEventListener('dragstart', () => {
    dragSrcIndex = index;
    li.classList.add('dragging');
  });

  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    li.classList.add('drag-over');
  });

  li.addEventListener('dragleave', () => {
    li.classList.remove('drag-over');
  });

  li.addEventListener('drop', () => {
    li.classList.remove('drag-over');
    if (dragSrcIndex === null || dragSrcIndex === index) return;

    const movedItem = todos[dragSrcIndex];
    todos.splice(dragSrcIndex, 1);
    todos.splice(index, 0, movedItem);

    saveTodos();
    renderTodos();
  });

  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    dragSrcIndex = null;
  });
}

function renderTodos() {
  list.innerHTML = '';
  let filtered = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true;
  });

  if (sortByPriority) {
    filtered.sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });
  }

  filtered.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = `${todo.priority} ${todo.completed ? 'completed' : ''}`;

    addDragAndDrop(li, index);

    if (todo.editing) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = todo.text;
      editInput.className = 'edit-input';

      const editSelect = document.createElement('select');
      editSelect.className = 'edit-select';

      ['low', 'medium', 'high'].forEach(level => {
        const opt = document.createElement('option');
        opt.value = level;
        opt.textContent = level[0].toUpperCase() + level.slice(1);
        if (level === todo.priority) opt.selected = true;
        editSelect.appendChild(opt);
      });

      const saveChanges = () => {
        todos[index].text = editInput.value.trim();
        todos[index].priority = editSelect.value;
        todos[index].editing = false;
        saveTodos();
        renderTodos();
      };

      editInput.onkeydown = (e) => {
        if (e.key === 'Enter') saveChanges();
        if (e.key === 'Escape') {
          todos[index].editing = false;
          renderTodos();
        }
      };

      editInput.onblur = () => saveChanges();
      editSelect.onchange = () => saveChanges();

      li.appendChild(editInput);
      li.appendChild(editSelect);
      editInput.focus();
    } else {
      const span = document.createElement('span');
      span.textContent = todo.text;
      span.onclick = () => toggleTodo(index);

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️';
      editBtn.title = 'Edit';
      editBtn.onclick = () => {
        todos[index].editing = true;
        renderTodos();
      };

      const delBtn = document.createElement('button');
      delBtn.textContent = '✕';
      delBtn.title = 'Delete';
      delBtn.onclick = () => deleteTodo(index);

      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(delBtn);
    }

    list.appendChild(li);
  });

  const sortBtn = document.getElementById('sort-toggle');
  if (sortBtn) {
    sortBtn.textContent = sortByPriority ? 'Sort: Priority 🔽' : 'Sort: Manual 🔀';
  }
}

function toggleSortMode() {
  sortByPriority = !sortByPriority;
  renderTodos();
}

function addTodo() {
  const text = input.value.trim();
  let priority = prioritySelect.value;

  if (priority === 'Priority' || !priority) {
    priority = 'low';
  }

  if (text === '') return;

  todos.push({ text, priority, completed: false, editing: false });
  input.value = '';
  prioritySelect.selectedIndex = 0;
  saveTodos();
  renderTodos();
}

function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

filters.forEach(button => {
  button.onclick = () => {
    filters.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderTodos();
  };
});

addButton.onclick = addTodo;
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTodo();
});

document.addEventListener('DOMContentLoaded', () => {
  const sortButton = document.createElement('button');
  sortButton.id = 'sort-toggle';
  sortButton.textContent = 'Sort: Manual 🔀';
  sortButton.onclick = toggleSortMode;
  document.querySelector('.filters').appendChild(sortButton);
});

renderTodos();
