let tasks = JSON.parse(localStorage.getItem("todo-tasks")) || [];
let labels = JSON.parse(localStorage.getItem("todo-labels")) || [];

// Ajouter "Aucun label" par défaut si il n'existe pas
if (!labels.includes("Aucun label")) {
  labels.unshift("Aucun label");
  localStorage.setItem("todo-labels", JSON.stringify(labels));
}

let editingTaskId = null;

// Gestion modale tâche
const modal = document.getElementById("taskModal");
const addTaskBtn = document.getElementById("addTaskBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");

// Gestion modale label
const labelModal = document.getElementById("labelModal");
const addLabelBtn = document.getElementById("addLabelBtn");
const saveLabelBtn = document.getElementById("saveLabelBtn");
const cancelLabelBtn = document.getElementById("cancelLabelBtn");
const labelNameInput = document.getElementById("labelName");

addTaskBtn.onclick = () => {
  openModal();
};

cancelTaskBtn.onclick = () => closeModal();

addLabelBtn.onclick = () => {
  labelModal.classList.remove("hidden");
  labelNameInput.value = "";
};

cancelLabelBtn.onclick = () => {
  labelModal.classList.add("hidden");
};

saveLabelBtn.onclick = () => {
  const name = labelNameInput.value.trim();
  if (!name) return alert("Le nom est requis.");
  if (labels.includes(name)) return alert("Ce label existe déjà.");

  labels.push(name);
  localStorage.setItem("todo-labels", JSON.stringify(labels));
  labelModal.classList.add("hidden");
  renderLabelOptions(); // met à jour le <select>
};

saveTaskBtn.onclick = () => {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriority").value;
    const label = document.getElementById("taskLabel").value;

    if (!title) return alert("Titre requis");

    const task = {
        id: editingTaskId || Date.now().toString(),
        title,
        description,
        label,
        priority,
        status: editingTaskId ? tasks.find(t => t.id === editingTaskId).status : "todo",
    };

    if (editingTaskId) {
        tasks = tasks.map(t => (t.id === editingTaskId ? task : t));
        editingTaskId = null;
    } else {
        tasks.push(task);
    }

    saveAndRender();
    closeModal();
};

function openModal(task = null) {
    renderLabelOptions();
    modal.classList.remove("hidden");
    const modalTitle = document.getElementById("modalTitle");

    //edit
    if (task) {
        editingTaskId = task.id;
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description;
        document.getElementById("taskLabel").value = task.label;
        document.getElementById("taskPriority").value = task.priority;
        modalTitle.textContent = "Modifier la tâche";
    } else { //création
        editingTaskId = null;
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDescription").value = "";
        document.getElementById("taskLabel").value = "Aucun label";
        document.getElementById("taskPriority").value = "low";
        modalTitle.textContent = "Nouvelle tâche";
    }
}

function closeModal() {modal.classList.add("hidden");}

function saveAndRender() {
    localStorage.setItem("todo-tasks", JSON.stringify(tasks));
    localStorage.setItem("todo-labels", JSON.stringify(labels));
    renderTasks();
    renderLabelOptions();
}

function renderTasks() {
    ["todo", "in-progress", "done"].forEach(status => {
        const list = document.getElementById(status);
        list.innerHTML = "";
        tasks.filter(t => t.status === status).forEach(task => {
        const div = document.createElement("div");
        div.className = "task";
        div.setAttribute("draggable", true);
        div.setAttribute("data-id", task.id);
        div.setAttribute("data-priority", task.priority);
        div.innerHTML = `
            <strong>${task.title}</strong>
            <div class="label-badge" data-label="${task.label}">
                <span class="label-color"></span>${task.label}
            </div>
            <small>${task.description}</small>
            <button onclick="editTask('${task.id}')">✏️</button>
            <button onclick="deleteTask('${task.id}')">🗑️</button>
        `;
        addDragEvents(div);
        list.appendChild(div);
        });
    });
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndRender();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) openModal(task);
}

// Drag and drop
function addDragEvents(el) {
    el.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", el.getAttribute("data-id"));
    });
}

document.querySelectorAll(".column").forEach(column => {
    column.addEventListener("dragover", e => e.preventDefault());
    column.addEventListener("drop", e => {
        const id = e.dataTransfer.getData("text/plain");
        const task = tasks.find(t => t.id === id);
        const newStatus = column.getAttribute("data-status");
        if (task && newStatus) {
            task.status = newStatus;
            saveAndRender();
        }
    });
});

function renderLabelOptions() {
    const select = document.getElementById("taskLabel");
    select.innerHTML = "";

    labels.forEach(label => {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        select.appendChild(option);
    });
}

const manageLabelsModal = document.getElementById("manageLabelsModal");
const manageLabelsBtn = document.getElementById("manageLabelsBtn");
const closeManageLabelsBtn = document.getElementById("closeManageLabelsBtn");
const labelList = document.getElementById("labelList");

manageLabelsBtn.onclick = () => {
  renderManageLabels();
  manageLabelsModal.classList.remove("hidden");
};

closeManageLabelsBtn.onclick = () => {
  manageLabelsModal.classList.add("hidden");
};

function renderManageLabels() {
    labelList.innerHTML = "";

    if (labels.length === 1) { //seulement "Aucun label"
        const msg = document.createElement("p");
        msg.textContent = "Aucun label existant. Créez-en un pour commencer.";
        msg.style.fontStyle = "italic";
        msg.style.color = "#555";
        msg.style.textAlign = "center";
        labelList.appendChild(msg);
        return;
    }

    labels.filter(label => label !== "Aucun label").forEach((label, index) => {
        const li = document.createElement("li");

        const input = document.createElement("input");
        input.type = "text";
        input.value = label;
        input.maxLength = 20;

        const actions = document.createElement("div");
        actions.className = "label-actions";

        const renameBtn = document.createElement("button");
        renameBtn.textContent = "Renommer";
        renameBtn.classList.add("rename");
        renameBtn.onclick = () => {
            const newName = input.value.trim();
            if (!newName || labels.includes(newName)) {
                alert("Nom invalide ou déjà utilisé.");
                input.value = label;
                return;
            }
            
            const oldName = labels[index+1];
            labels[index+1] = newName;

            // Met à jour les tâches qui ont ce label
            tasks.forEach(task => {
                if (task.label === oldName) {
                    task.label = newName;
                }
            });

            saveAndRender();
            renderManageLabels();
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Supprimer";
        deleteBtn.classList.add("cancel-btn");
        deleteBtn.onclick = () => {
            const toDelete = labels[index+1];
            labels.splice(index+1, 1);

            // Supprime le label des tâches concernées
            tasks.forEach(task => {
                if (task.label === toDelete) {task.label = "Aucun label";}
            });

            saveAndRender();
            renderManageLabels();
        };

        actions.appendChild(renameBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(input);
        li.appendChild(actions);
        labelList.appendChild(li);
    });
}

renderTasks();