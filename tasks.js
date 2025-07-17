document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    loadTasks();
    
    // Set up event listeners
    document.getElementById('refreshTasks').addEventListener('click', loadTasks);
    document.getElementById('applyTaskFilters').addEventListener('click', filterTasks);
    document.getElementById('saveTaskStatusBtn').addEventListener('click', updateTaskStatus);
    document.getElementById('cancelTaskStatusBtn').addEventListener('click', hideTaskStatusModal);
    
    // Set branch from dropdown
    const branchSelect = document.getElementById('branchSelect');
    if (branchSelect) {
        branchSelect.addEventListener('change', function() {
            loadTasks();
        });
    }
});

// Load tasks from Google Sheets
function loadTasks() {
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    
    showTasksLoading(true);
    
    // In a real app, you would fetch from Google Sheets
    // fetch(`${API_URL}?action=getTasks&branch=${branch}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         showTasksLoading(false);
    //         displayTasks(data);
    //     })
    //     .catch(error => {
    //         showTasksLoading(false);
    //         console.error('Error:', error);
    //         showToast('Failed to load tasks', 'error');
    //     });
    
    // For demo, use mock data
    setTimeout(() => {
        showTasksLoading(false);
        displayTasks(getMockTasks(branch));
    }, 800);
}

// Display tasks in the table
function displayTasks(tasks) {
    const tbody = document.getElementById('tasksTableBody');
    tbody.innerHTML = '';
    
    if (tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No tasks found
                </td>
            </tr>
        `;
        return;
    }
    
    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${task.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${task.patientName}</div>
                <div class="text-sm text-gray-500">${task.patientContact}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatDate(task.date)}</div>
                <div class="text-sm text-gray-500">${task.time}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${task.address || task.branch}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${task.phlebotomist || 'Not assigned'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${task.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 update-task" data-id="${task.id}">Update</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to update buttons
    document.querySelectorAll('.update-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            showTaskStatusModal(taskId);
        });
    });
}

// Filter tasks
function filterTasks() {
    const dateFilter = document.getElementById('taskDateFilter').value;
    const phlebotomistFilter = document.getElementById('taskPhlebotomistFilter').value;
    const statusFilter = document.getElementById('taskStatusFilter').value;
    
    // In a real app, you would fetch filtered data from server
    // For demo, we'll just filter the displayed data
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    let tasks = getMockTasks(branch);
    
    if (dateFilter) {
        tasks = tasks.filter(task => task.date === dateFilter);
    }
    
    if (phlebotomistFilter !== 'all') {
        tasks = tasks.filter(task => task.phlebotomist === phlebotomistFilter);
    }
    
    if (statusFilter !== 'all') {
        tasks = tasks.filter(task => task.status === statusFilter);
    }
    
    displayTasks(tasks);
}

// Show task status modal
function showTaskStatusModal(taskId) {
    // In a real app, you would fetch the task data from Google Sheets
    // fetch(`${API_URL}?action=getTask&id=${taskId}`)
    //     .then(response => response.json())
    //     .then(task => {
    //         populateTaskStatusForm(task);
    //         document.getElementById('taskModalTitle').textContent = 'Update Task Status';
    //         document.getElementById('taskStatusModal').classList.remove('hidden');
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //         showToast('Failed to load task data', 'error');
    //     });
    
    // For demo, use mock data
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    const tasks = getMockTasks(branch);
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        populateTaskStatusForm(task);
        document.getElementById('taskModalTitle').textContent = 'Update Task Status';
        document.getElementById('taskStatusModal').classList.remove('hidden');
    }
}

// Populate task status form
function populateTaskStatusForm(task) {
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskPatient').value = task.patientName;
    document.getElementById('taskDateTime').value = `${formatDate(task.date)} at ${task.time}`;
    document.getElementById('taskLocation').value = task.address || task.branch;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskNotes').value = task.notes || '';
}

// Hide task status modal
function hideTaskStatusModal() {
    document.getElementById('taskStatusModal').classList.add('hidden');
}

// Update task status
function updateTaskStatus() {
    const taskId = document.getElementById('taskId').value;
    const status = document.getElementById('taskStatus').value;
    const notes = document.getElementById('taskNotes').value;
    
    if (!taskId || !status) {
        showToast('Please select a status', 'error');
        return;
    }
    
    // Show loading
    showTasksLoading(true);
    
    // In a real app, you would send this to Google Sheets
    // fetch(API_URL, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ 
    //         action: 'updateTaskStatus',
    //         taskId,
    //         status,
    //         notes
    //     })
    // })
    // .then(response => response.json())
    // .then(data => {
    //     showToast('Task status updated successfully');
    //     hideTaskStatusModal();
    //     loadTasks();
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    //     showToast('Failed to update task status', 'error');
    //     showTasksLoading(false);
    // });
    
    // For demo, just show success message
    showToast('Task status updated successfully');
    hideTaskStatusModal();
    loadTasks();
}

// Show loading state for tasks
function showTasksLoading(show) {
    const tbody = document.getElementById('tasksTableBody');
    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Format date as DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
}

// Mock data for demo
function getMockTasks(branch = 'branch_a') {
    const branches = {
        branch_a: [
            {
                id: 'TSK1234',
                patientId: 'PAT1234',
                patientName: 'Rahul Sharma',
                patientContact: '9876543210',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                address: '123 Main St, Apartment 4B',
                branch: 'Branch A',
                phlebotomist: 'John Doe',
                status: 'Pending',
                notes: 'Fasting required',
                tests: 'CBC,LFT,Thyroid'
            },
            {
                id: 'TSK1235',
                patientId: 'PAT1235',
                patientName: 'Priya Patel',
                patientContact: '8765432109',
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                time: '14:30',
                address: '',
                branch: 'Branch A',
                phlebotomist: '',
                status: 'Pending',
                notes: '',
                tests: 'KFT,Diabetes'
            }
        ],
        branch_b: [
            {
                id: 'TSK2234',
                patientId: 'PAT2234',
                patientName: 'Amit Kumar',
                patientContact: '7654321098',
                date: new Date().toISOString().split('T')[0],
                time: '11:15',
                address: '456 Oak Ave, Floor 2',
                branch: 'Branch B',
                phlebotomist: 'Priya Sharma',
                status: 'In Progress',
                notes: 'Senior citizen discount applied',
                tests: 'Lipid,Vitamin'
            },
            {
                id: 'TSK2235',
                patientId: 'PAT2235',
                patientName: 'Neha Gupta',
                patientContact: '6543210987',
                date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
                time: '09:00',
                address: '',
                branch: 'Branch B',
                phlebotomist: '',
                status: 'Pending',
                notes: '',
                tests: 'CBC,Urine'
            }
        ]
    };
    
    return branches[branch] || [];
}