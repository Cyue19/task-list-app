class Task {
    constructor(id, title, description, completed) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = completed;
    }
}

class StorageService {
    constructor() {
        this.database = firebase.firestore();
        this.tasksList = [];
    }

    async getTasksFromFireStore() {
        const tasks = [];
        const querySnapshot = await this.database.collection("tasks").get();
        for (let doc of querySnapshot.docs) {
            const task = new Task(doc.id, doc.data().title, doc.data().description, doc.data().completed);
            tasks.push(task);
        }
        return tasks;
    }

    async addTask(task) {
        try {
            const docRef = await this.database.collection("tasks").add({
                title: task.title,
                description: task.description,
                completed: task.completed
            });
            task.id = docRef.id;
            // this.tasksList.push(task);
        } catch (err) {
            console.log(err);
        }
    }

    async removeTask(task) {
        try {
            await this.database.collection("tasks").doc(task.id).delete();
            // this.tasks = this.tasksList.filter(x => x.id != task.id);
        } catch(err) {
            console.log(err);
        }
    }

    updateTask(task) {
        try {
            this.database.collection("tasks").doc(task.id).update({
                title: task.title,
                description: task.description,
                completed: task.completed
            });
        } catch(err) {
            console.log(err);
        }
    }
}

class UI {
    constructor() {
        this.titleInput = document.getElementById("title");
        this.descriptionInput = document.getElementById("description");
        this.addButton = document.getElementById("button");
        this.table = document.getElementById("table-body");
        this.rowTemplate = document.getElementById("row-template");
        this.completedIcon = document.getElementById("complete");
        this.incompleteIcon = document.getElementById("incomplete");
        this.storage = new StorageService();
    }

    initializeAddButton() {
        this.addButton.addEventListener("click", () => {
            const title = this.titleInput.value;
            const description = this.descriptionInput.value;

            const task = new Task(null, title, description, false);
            this.addTaskRowToList(task);
            this.storage.addTask(task);

            this.titleInput.value = null;
            this.descriptionInput.value = null;
        });
    }

    addTaskRowToList(task) {
        const row = this.rowTemplate.cloneNode(true);
        const cells = row.children;
    
        cells[0].innerHTML = task.title;
        cells[1].innerHTML = task.description;
        cells[2].innerHTML = this.getCompleteIcon(task.completed);

        cells[2].addEventListener("click", () => {
            this.updateCompleteStatus(task);
            this.storage.updateTask(task);
            cells[2].innerHTML = this.getCompleteIcon(task.completed);
        });
        
        cells[3].addEventListener("click", () => {
            row.remove();
            this.storage.removeTask(task);
        });
    
        row.classList.remove("d-none");
        this.table.append(row);
    }

    updateCompleteStatus(task) {
        task.completed = !task.completed;
    }

    getCompleteIcon(complete) {
        if (complete) {
            const icon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8"/>
                </svg>
            `;
            console.log("complete");
            return icon;
        } else {
            const icon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                </svg>
            `;
            console.log("incomplete");
            return icon;
        }
    }

    reloadSavedTasks(tasks) {
        for (let task of tasks) {
            this.addTaskRowToList(task);
            console.log(task.completed);
        }
    }
}

var ui = new UI();
document.addEventListener('DOMContentLoaded', async () => {
  ui.initializeAddButton();
  const tasks = await ui.storage.getTasksFromFireStore();
  ui.reloadSavedTasks(tasks);
});
