
// klasa todo zarzadza lista zadani wyswielaniem
class Todo {
  constructor({ listEl, searchInput, clearSearchBtn, addForm, addErrorEl, taskTextInput, taskDueInput }) {
    this.listEl = listEl;
    this.searchInput = searchInput;
    this.clearSearchBtn = clearSearchBtn;
    this.addForm = addForm;
    this.addErrorEl = addErrorEl;
    this.taskTextInput = taskTextInput;
    this.taskDueInput = taskDueInput;

  // klucz do localstorage
  this.storageKey = 'ai1.labB.todo.v1';
    this.tasks = [];
  // term przechowuje fraze wyszukiwawcza wpisana przez uzytkownika
  this.term = '';
    this.editingId = null;

    this.load();
    this.bindEvents();
    this.draw();
  }

  load() {
  // wczytuje tablice z localstorage
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.tasks = raw ? JSON.parse(raw) : [];
    } catch {
      // w razie bledu ustawia pusta tablice
      this.tasks = [];
    }
  }
  save() {
  // zapisuje do localstorage
    localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
  }

  setTerm(t) {
    this.term = (t || '').trim();
    this.draw();
  }

  get filtered() {
  // getter zwraca przefiltrowana tablice zadan
    const q = this.term.toLowerCase();
    if (q.length < 2) return this.tasks;
    return this.tasks.filter(t => t.text.toLowerCase().includes(q));
  }

  static escapeRegExp(str) {
    // pomocnicza funccja do znakow specjalnych
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  highlight(text) {
    const q = this.term.trim();
    if (q.length < 2) return this.escapeHTML(text);
    const pattern = new RegExp(Todo.escapeRegExp(q), 'gi');
    return this.escapeHTML(text).replace(pattern, (m) => `<mark>${this.escapeHTML(m)}</mark>`);
  }

  static isFutureOrEmpty(dueStr) {
    // sprawdzanie daty
    if (!dueStr) return true;
    const due = new Date(dueStr);
    if (Number.isNaN(due.getTime())) return false;
    const now = new Date();
    return due.getTime() > now.getTime();
  }

  validateNew(text, dueStr) {
    const t = (text || '').trim();
    if (t.length < 3) return 'tekst zadania musi miec >= 3 znaki.';
    if (t.length > 255) return 'tekst zadania nie moze przekraczac 255 znakow.';
    if (!Todo.isFutureOrEmpty(dueStr)) return 'data musi byc pusta albo w przyszlosci.';
    return '';
  }

  addTask(text, dueStr) {
    const err = this.validateNew(text, dueStr);
    if (err) throw new Error(err);

    const task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      due: dueStr || '', 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tasks.push(task);
    this.save();
    this.draw();
  }

  removeTask(id) {
    const i = this.tasks.findIndex(t => t.id === id);
    if (i >= 0) {
      this.tasks.splice(i, 1);
      if (this.editingId === id) this.editingId = null;
      this.save();
      this.draw();
    }
  }

  updateTask(id, { text, due }) {
    const t = this.tasks.find(x => x.id === id);
    if (!t) return;
    const newText = (text ?? t.text).trim();
    const newDue = due ?? t.due;

    const err = this.validateNew(newText, newDue);
    if (err) throw new Error(err);

    t.text = newText;
    t.due = newDue;
    t.updatedAt = new Date().toISOString();
    this.save();
    this.draw();
  }

  draw() {
  // aktualizacja widoku listy po zmianie czegokolwiek
    const items = this.filtered;
    this.listEl.innerHTML = '';

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = this.term.length >= 2 ? 'brak wynikow wyszukiwania.' : 'brak zadan. dodaj pierwsze ponizej.';
      this.listEl.appendChild(empty);
      return;
    }

    for (const task of items) {
      const row = document.createElement('div');
      row.className = 'item';
      row.dataset.id = task.id;

      if (this.editingId === task.id) {
        const editor = document.createElement('div');
        editor.className = 'editor';

        const inputs = document.createElement('div');
        inputs.className = 'inputs';

        const txt = document.createElement('input');
        txt.type = 'text';
        txt.value = task.text;
        txt.maxLength = 255;
        txt.autofocus = true;

        const due = document.createElement('input');
        due.type = 'datetime-local';
        if (task.due) {
          due.value = task.due;
        }

        inputs.appendChild(txt);
        inputs.appendChild(due);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn';
        saveBtn.textContent = 'zapisz';

        editor.appendChild(inputs);
        editor.appendChild(saveBtn);

        saveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          try {
            this.updateTask(task.id, { text: txt.value, due: due.value });
            this.editingId = null;
          } catch (err) {
            alert(err.message);
          }
        });

        const handleOutside = (ev) => {
          if (row.contains(ev.target)) return;
          try {
            this.updateTask(task.id, { text: txt.value, due: due.value });
          } catch (err) {
            alert(err.message);
          } finally {
            this.editingId = null;
            document.removeEventListener('mousedown', handleOutside, true);
          }
        };
        setTimeout(() => {
          document.addEventListener('mousedown', handleOutside, true);
        }, 0);

        row.appendChild(editor);
      } else {
        const textCol = document.createElement('div');
        textCol.className = 'text';
        textCol.innerHTML = this.highlight(task.text);
        textCol.title = 'kliknij, aby edytowac';
        textCol.addEventListener('click', () => {
          this.editingId = task.id;
          this.draw();
        });

        const dueCol = document.createElement('div');
        dueCol.className = 'due';
        if (task.due) {
          const dueDate = new Date(task.due);
          const isPast = !Number.isNaN(dueDate.getTime()) && dueDate.getTime() <= Date.now();
          dueCol.textContent = formatDateTime(task.due);
          if (isPast) dueCol.classList.add('danger');
        } else {
          dueCol.textContent = '\u2014';
        }

        const delBtn = document.createElement('button');
        delBtn.className = 'btn';
        delBtn.textContent = 'usun';
        delBtn.title = 'usun to zadanie';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('usunac to zadanie?')) this.removeTask(task.id);
        });

        row.appendChild(textCol);
        row.appendChild(dueCol);
        row.appendChild(delBtn);
      }

      this.listEl.appendChild(row);
    }
  }

  bindEvents() {
  // poczlaczenie zdarzen do przyciskow
    this.searchInput.addEventListener('input', () => this.setTerm(this.searchInput.value));
    this.clearSearchBtn.addEventListener('click', () => {
      this.searchInput.value = '';
      this.setTerm('');
      this.searchInput.focus();
    });

    this.addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addErrorEl.textContent = '';
      try {
        this.addTask(this.taskTextInput.value, this.taskDueInput.value);
        this.taskTextInput.value = '';
        this.taskDueInput.value = '';
        this.searchInput.focus();
      } catch (err) {
        this.addErrorEl.textContent = err.message;
      }
    });
  }
}

function formatDateTime(localStr) {
  try {
    const d = new Date(localStr);
    if (Number.isNaN(d.getTime())) return localStr;
    return d.toLocaleString('pl-PL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return localStr;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new Todo({
    listEl: document.getElementById('list'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearch'),
    addForm: document.getElementById('addForm'),
    addErrorEl: document.getElementById('addError'),
    taskTextInput: document.getElementById('taskText'),
    taskDueInput: document.getElementById('taskDue'),
  });


});
