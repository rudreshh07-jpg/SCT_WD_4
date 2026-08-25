const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const taskTitle = document.getElementById("taskTitle");
const clearCompleted = document.getElementById("clearCompleted");
const filters = document.getElementById("filters");
const today = document.getElementById("today");

let currentFilter = "all";

let tasks = JSON.parse(
  localStorage.getItem("tasklyTasks") || "[]"
);

today.textContent = new Intl.DateTimeFormat(
  "en",
  {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }
)
  .format(new Date())
  .toUpperCase();


function saveTasks() {
  localStorage.setItem(
    "tasklyTasks",
    JSON.stringify(tasks)
  );
}


function formatDate(value) {
  if (!value) {
    return "NO DUE DATE";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short"
    }
  )
    .format(new Date(value + "T00:00:00"))
    .toUpperCase();
}


function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (task) {
      return !task.completed;
    });
  }

  if (currentFilter === "completed") {
    return tasks.filter(function (task) {
      return task.completed;
    });
  }

  return tasks;
}


function updateSummary() {
  const total = tasks.length;

  const completed = tasks.filter(function (task) {
    return task.completed;
  }).length;

  const remaining = total - completed;

  const progress = total
    ? Math.round((completed / total) * 100)
    : 0;

  taskCount.textContent =
    `${remaining} task${remaining === 1 ? "" : "s"} remaining`;

  progressText.textContent =
    `${completed} of ${total} done`;

  progressBar.style.width =
    progress + "%";

  if (!total) {
    taskTitle.textContent =
      "What needs your attention?";
  } else if (completed === total) {
    taskTitle.textContent =
      "Everything is complete. Nice work.";
  } else {
    taskTitle.textContent =
      "What needs your attention?";
  }
}


function renderTasks() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = "";

  if (!visibleTasks.length) {
    let message = "";

    if (!tasks.length) {
      message = `
        <strong>Your list is clear.</strong>
        Add your first task and start moving.
      `;
    } else if (currentFilter === "completed") {
      message = `
        <strong>No completed tasks yet.</strong>
        Finish something and it will appear here.
      `;
    } else {
      message = `
        <strong>Nothing active right now.</strong>
        You are all caught up.
      `;
    }

    taskList.innerHTML =
      `<div class="empty-state">${message}</div>`;

    updateSummary();

    return;
  }


  visibleTasks.forEach(function (task) {
    const taskElement =
      document.createElement("article");

    taskElement.className =
      `task-item ${task.completed ? "done" : ""}`;


    let priorityLabel = "";

    if (task.priority === "high") {
      priorityLabel = "HIGH PRIORITY";
    } else if (task.priority === "low") {
      priorityLabel = "LOW PRIORITY";
    } else {
      priorityLabel = "NORMAL";
    }


    taskElement.innerHTML = `
      <input
        class="check"
        type="checkbox"
        ${task.completed ? "checked" : ""}
      >

      <div class="task-main">
        <div class="task-name"></div>

        <div class="task-meta">
          <span class="priority ${task.priority}">
            ${priorityLabel}
          </span>

          <span>
            ${formatDate(task.dueDate)}
          </span>
        </div>
      </div>

      <div class="task-actions">
        <button class="task-action edit">
          ✎
        </button>

        <button class="task-action delete">
          ×
        </button>
      </div>
    `;


    const taskName =
      taskElement.querySelector(".task-name");

    taskName.textContent =
      task.text;


    const checkbox =
      taskElement.querySelector(".check");

    checkbox.onchange = function () {
      task.completed =
        !task.completed;

      saveTasks();

      renderTasks();
    };


    const deleteButton =
      taskElement.querySelector(".delete");

    deleteButton.onclick = function () {
      tasks = tasks.filter(function (item) {
        return item.id !== task.id;
      });

      saveTasks();

      renderTasks();
    };


    const editButton =
      taskElement.querySelector(".edit");

    editButton.onclick = function () {
      const updatedTask =
        prompt(
          "Edit task",
          task.text
        );

      if (
        updatedTask &&
        updatedTask.trim()
      ) {
        task.text =
          updatedTask.trim();

        saveTasks();

        renderTasks();
      }
    };


    taskList.appendChild(taskElement);
  });


  updateSummary();
}


taskForm.onsubmit = function (event) {
  event.preventDefault();

  const text =
    taskInput.value.trim();


  if (!text) {
    taskInput.focus();

    return;
  }


  tasks.unshift({
    id: Date.now(),
    text: text,
    priority: priorityInput.value,
    dueDate: dateInput.value,
    completed: false
  });


  saveTasks();


  taskInput.value = "";

  priorityInput.value = "normal";

  dateInput.value = "";


  currentFilter = "all";


  document
    .querySelectorAll(".filter")
    .forEach(function (button) {
      button.classList.toggle(
        "active",
        button.dataset.filter === "all"
      );
    });


  renderTasks();

  taskInput.focus();
};


filters.onclick = function (event) {
  const button =
    event.target.closest(".filter");

  if (!button) {
    return;
  }


  currentFilter =
    button.dataset.filter;


  document
    .querySelectorAll(".filter")
    .forEach(function (filterButton) {
      filterButton.classList.toggle(
        "active",
        filterButton === button
      );
    });


  renderTasks();
};


clearCompleted.onclick = function () {
  tasks = tasks.filter(function (task) {
    return !task.completed;
  });


  saveTasks();

  renderTasks();
};


renderTasks();