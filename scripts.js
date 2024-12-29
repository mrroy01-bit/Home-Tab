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

// Theme switcher toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Home page loaded');
    // Initial update
    updateTime();
    // Update every second
    setInterval(updateTime, 1000);
    
    // Theme switcher toggle
    const toggleBtn = document.getElementById('toggle-theme-switcher');
    const themeSwitcher = document.querySelector('.theme-switcher');
    
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeSwitcher.classList.toggle('active');
    });

    // Close theme switcher when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeSwitcher.contains(e.target)) {
            themeSwitcher.classList.remove('active');
        }
    });

    // Custom background functionality
    const bgUpload = document.getElementById('bg-upload');
    const customBgBtn = document.querySelector('.custom-bg-btn');
    
    function applyCustomBackground(backgroundData) {
        document.body.style.backgroundImage = `linear-gradient(135deg, 
            var(--gradient-1),
            var(--gradient-2),
            var(--gradient-3),
            var(--gradient-4)), 
            url(${backgroundData})`;
        
        // Update active states
        themeButtons.forEach(btn => btn.classList.remove('active'));
        customBgBtn.classList.add('active');
        
        // Remove theme attribute but keep gradients
        document.documentElement.removeAttribute('data-theme');
    }
    
    bgUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const backgroundData = e.target.result;
                // Save the custom background to localStorage
                localStorage.setItem('custom-background', backgroundData);
                localStorage.setItem('selected-theme', 'custom');
                
                // Apply the custom background
                applyCustomBackground(backgroundData);
            };
            reader.readAsDataURL(file);
        }
    });

    // Theme buttons functionality
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    function setActiveTheme(theme) {
        // Check if we should load custom background
        if (theme === 'custom') {
            const customBg = localStorage.getItem('custom-background');
            if (customBg) {
                applyCustomBackground(customBg);
                return;
            }
        }

        // Reset custom background if switching to a theme
        document.body.style.backgroundImage = '';
        customBgBtn.classList.remove('active');

        // Remove previous theme
        document.documentElement.classList.remove(
            'theme-ocean',
            'theme-sunset',
            'theme-forest',
            'theme-galaxy',
            'theme-desert',
            'theme-arctic',
            'theme-volcano'
        );
        
        // Set new theme
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.add(`theme-${theme}`);
        
        // Save theme preference
        localStorage.setItem('selected-theme', theme);
        
        // Update active button state
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
        });

        // Preload next theme's background
        const nextThemeBtn = document.querySelector(`.theme-btn[data-theme="${theme}"]`).nextElementSibling;
        if (nextThemeBtn) {
            const nextTheme = nextThemeBtn.getAttribute('data-theme');
            const img = new Image();
            img.src = `images/${nextTheme}.jpg`;
        }
    }

    // Preload all theme backgrounds
    const themes = ['ocean', 'sunset', 'forest', 'galaxy', 'desert', 'arctic', 'volcano'];
    themes.forEach(theme => {
        const img = new Image();
        img.src = `images/${theme}.jpg`;
    });

    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = button.getAttribute('data-theme');
            setActiveTheme(theme);
        });
    });

    // Load saved theme or default to ocean
    const savedTheme = localStorage.getItem('selected-theme') || 'ocean';
    setActiveTheme(savedTheme);
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

// Quick Links functionality with localStorage
let quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [];

function saveQuickLinks() {
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
}

function createQuickLinkElement(link) {
    const linkElement = document.createElement('a');
    linkElement.href = link.url;
    linkElement.className = 'quick-link';
    linkElement.target = '_blank';
    linkElement.innerHTML = `
        <i class="${link.icon}"></i>
        <span>${link.name}</span>
        <button class="delete-link" title="Delete Link">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add delete functionality
    const deleteBtn = linkElement.querySelector('.delete-link');
    deleteBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent link from opening
        e.stopPropagation(); // Prevent event bubbling
        
        // Get stored links
        let links = JSON.parse(localStorage.getItem('quickLinks')) || [];
        // Remove the link
        links = links.filter(l => l.url !== link.url);
        // Save back to localStorage
        localStorage.setItem('quickLinks', JSON.stringify(links));
        // Remove from DOM
        linkElement.remove();
    });

    return linkElement;
}

function loadQuickLinks() {
    const quickLinksContainer = document.getElementById('quick-links');
    if (!quickLinksContainer) return;

    // Get reference to add button before clearing
    const addButton = document.getElementById('add-quick-link');
    if (addButton) {
        addButton.remove(); // Temporarily remove the button
    }

    // Add custom links at the end of the container
    quickLinks.forEach(link => {
        quickLinksContainer.appendChild(createQuickLinkElement(link));
    });

    // Add the button back at the end
    if (addButton) {
        quickLinksContainer.appendChild(addButton);
    }
}

function showAddLinkModal() {
    const modal = document.getElementById('add-link-modal');
    if (modal) {
        modal.style.display = 'block';
        // Clear previous inputs
        document.getElementById('link-name').value = '';
        document.getElementById('link-url').value = '';
        const iconSelect = document.getElementById('icon-select');
        if (iconSelect) {
            iconSelect.selectedIndex = 0;
            const iconPreview = document.getElementById('icon-preview');
            if (iconPreview) {
                iconPreview.innerHTML = '<i class="fas fa-link"></i>';
            }
        }
    }
}

function hideAddLinkModal() {
    const modal = document.getElementById('add-link-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function addQuickLink() {
    const name = document.getElementById('link-name').value.trim();
    const url = document.getElementById('link-url').value.trim();
    const iconSelect = document.getElementById('icon-select');
    const icon = iconSelect ? iconSelect.value : 'fas fa-link';

    if (!name || !url) {
        alert('Please fill in both name and URL fields');
        return;
    }

    // Add http:// if no protocol is specified
    const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;

    const link = { name, url: finalUrl, icon };
    quickLinks.push(link);
    saveQuickLinks();
    loadQuickLinks();
    hideAddLinkModal();
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load existing quick links
    loadQuickLinks();
    
    // Set up event listeners
    const addButton = document.getElementById('add-quick-link');
    if (addButton) {
        addButton.addEventListener('click', showAddLinkModal);
    }

    const saveButton = document.getElementById('save-link');
    if (saveButton) {
        saveButton.addEventListener('click', addQuickLink);
    }

    const cancelButton = document.getElementById('cancel-link');
    if (cancelButton) {
        cancelButton.addEventListener('click', hideAddLinkModal);
    }

    const iconSelect = document.getElementById('icon-select');
    if (iconSelect) {
        iconSelect.addEventListener('change', (e) => {
            const iconPreview = document.getElementById('icon-preview');
            if (iconPreview) {
                iconPreview.innerHTML = `<i class="${e.target.value}"></i>`;
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('add-link-modal');
        if (e.target === modal) {
            hideAddLinkModal();
        }
    });

    // Add some CSS styles dynamically for the delete button
    const style = document.createElement('style');
    style.textContent = `
        .quick-link {
            position: relative;
        }
        .delete-link {
            position: absolute;
            top: -5px;
            right: -5px;
            background: rgba(255, 0, 0, 0.8);
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            font-size: 12px;
        }
        .quick-link:hover .delete-link {
            display: flex;
        }
        .delete-link:hover {
            background: rgba(255, 0, 0, 1);
        }
    `;
    document.head.appendChild(style);
});