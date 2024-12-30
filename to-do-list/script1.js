// Select the input field, task list, and add task button
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');

// Function to add a task
function addTask(taskText) {
    const task = document.createElement('div');
    task.className = 'task';
    task.innerHTML = `
        <span class="task-text">${taskText}</span>
        <button class="light-blue" onclick="changeButtonColor(this)"></button>
        <img src="trashcan.png" class="trashcan" onclick="deleteTask(this)" alt="Trashcan" />
    `;
    
    // Add click event listener to the task text
    const taskTextSpan = task.querySelector('.task-text');
    taskTextSpan.addEventListener('click', function() {
        const currentText = this.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        // Replace span with input
        this.replaceWith(input);
        input.focus();
        
        // Handle input blur and enter key
        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                finishEditing.call(this);
            }
        });
        
        function finishEditing() {
            const newText = this.value.trim();
            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = newText || currentText; // Use old text if new text is empty
            this.replaceWith(span);
            saveTasks();
        }
    });
    
    taskList.appendChild(task);
    saveTasks(); // Save tasks to localStorage after adding
}

// Function to save tasks to localStorage
function saveTasks() {
    const tasks = [];
    const taskElements = taskList.getElementsByClassName('task');
    for (let task of taskElements) {
        const taskText = task.querySelector('.task-text').textContent;
        tasks.push(taskText);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Retrieve tasks or use an empty array
    tasks.forEach(taskText => addTask(taskText)); // Add each task to the list
}

// Event listener for the "Add Task" button
addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        addTask(taskText); // Call the function to add the task
        taskInput.value = ''; // Clear the input field after adding
    }
});

// Event listener for the input field to detect "Enter" key
taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { // Check if the pressed key is "Enter"
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText); // Call the function to add the task
            taskInput.value = ''; // Clear the input field after adding
        }
    }
});

// Function to change button color
function changeButtonColor(button) {
    button.classList.toggle('green'); // Toggle green class
}

// Function to delete a task
function deleteTask(button) {
    const task = button.closest('.task');
    taskList.removeChild(task); // Remove the task from the task list
    saveTasks(); // Save updated tasks to localStorage after deletion
}

// Load tasks from localStorage when the page loads
document.addEventListener('DOMContentLoaded', loadTasks);