// Update time display
function updateTime() {
    const timeElement = document.getElementById('chatgpt-time');
    if (!timeElement) return; // Guard clause if element doesn't exist

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // Format time with larger font for hours:minutes
    timeElement.innerHTML = `
        <span style="font-size: 1.2em">${hours}:${minutes}</span>
        <span style="font-size: 0.8em">:${seconds}</span>
    `;
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Home page loaded');
    // Initial update
    updateTime();
    // Update every second
    setInterval(updateTime, 1000);
});

// Todo list functionality with localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function createTodoElement(task) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
        </div>
        <button class="delete-task"><i class="fas fa-trash"></i></button>
    `;
    
    if (task.completed) {
        li.classList.add('completed');
    }
    
    // Add delete functionality
    li.querySelector('.delete-task').addEventListener('click', function() {
        const taskIndex = todos.indexOf(task);
        if (taskIndex > -1) {
            todos.splice(taskIndex, 1);
            saveTodos();
        }
        li.remove();
    });
    
    // Add checkbox functionality
    li.querySelector('.task-checkbox').addEventListener('change', function(e) {
        task.completed = e.target.checked;
        if (task.completed) {
            li.classList.add('completed');
        } else {
            li.classList.remove('completed');
        }
        saveTodos();
    });
    
    return li;
}

function loadTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = ''; // Clear existing list
    todos.forEach(task => {
        todoList.appendChild(createTodoElement(task));
    });
}

function addTask() {
    const input = document.getElementById('new-task');
    const taskText = input.value.trim();
    
    if (taskText) {
        const task = {
            text: taskText,
            completed: false
        };
        todos.push(task);
        saveTodos();
        document.getElementById('todo-list').appendChild(createTodoElement(task));
        input.value = '';
    }
}

// Load saved todos when page loads
loadTodos();

// Handle Enter key in new task input
document.getElementById('new-task').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Theme Switching
const themeButtons = document.querySelectorAll('.theme-btn');
const body = document.body;

// Load saved theme from localStorage
const savedTheme = localStorage.getItem('preferred-theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    themeButtons.forEach(btn => {
        if (btn.dataset.theme === savedTheme) {
            btn.classList.add('active');
        }
    });
}

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        themeButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const theme = btn.dataset.theme;
        body.setAttribute('data-theme', theme);
        localStorage.setItem('preferred-theme', theme);

        // Add animation effect
        body.style.animation = 'none';
        body.offsetHeight; // Trigger reflow
        body.style.animation = null;
    });
});

// Sidebar Toggle
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
let isSidebarOpen = false;

sidebarToggle.addEventListener('click', () => {
    isSidebarOpen = !isSidebarOpen;
    sidebar.classList.toggle('active');
    sidebarToggle.innerHTML = isSidebarOpen ? 
        '<i class="fas fa-times"></i>' : 
        '<i class="fas fa-bars"></i>';
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target) && isSidebarOpen) {
        isSidebarOpen = false;
        sidebar.classList.remove('active');
        sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// ChatGPT integration
async function askChatGPT() {
    const input = document.getElementById('chatgpt-input');
    const response = document.getElementById('chatgpt-response');
    const question = input.value.trim();
    
    if (!question) return;
    
    response.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
    
    try {
        // Note: You'll need to replace this with your actual API integration
        // This is just a placeholder to show the UI functionality
        setTimeout(() => {
            response.innerHTML = `<div class="chatgpt-answer">
                <i class="fas fa-robot"></i>
                <p>To use the ChatGPT integration, you'll need to add your API key and implement the actual API calls.</p>
            </div>`;
            input.value = '';
        }, 1500);
        
        // Actual implementation would look something like this:
        /*
        const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{"role": "user", "content": question}]
            })
        });
        const data = await apiResponse.json();
        response.innerHTML = `<div class="chatgpt-answer">
            <i class="fas fa-robot"></i>
            <p>${data.choices[0].message.content}</p>
        </div>`;
        */
    } catch (error) {
        response.innerHTML = `<div class="chatgpt-answer error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Sorry, there was an error processing your request.</p>
        </div>`;
    }
}

// Handle Enter key in ChatGPT input
document.getElementById('chatgpt-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        askChatGPT();
    }
});