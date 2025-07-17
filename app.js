document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard stats
    loadDashboardStats();
    
    // Set branch from dropdown
    const branchSelect = document.getElementById('branchSelect');
    if (branchSelect) {
        branchSelect.addEventListener('change', function() {
            loadDashboardStats();
        });
    }
});

// Load dashboard statistics
function loadDashboardStats() {
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    
    // In a real app, you would fetch from Google Sheets
    // fetch(`${API_URL}?action=getDashboardStats&branch=${branch}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         updateDashboardStats(data);
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    
    // For demo, use mock data
    setTimeout(() => {
        updateDashboardStats(getMockDashboardStats(branch));
    }, 500);
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    document.getElementById('todayAppointments').textContent = stats.todayAppointments;
    document.getElementById('pendingReports').textContent = stats.pendingReports;
    document.getElementById('duePayments').textContent = `₹${stats.duePayments.toLocaleString('en-IN')}`;
}

// Mock dashboard stats
function getMockDashboardStats(branch) {
    const stats = {
        branch_a: {
            todayAppointments: 8,
            pendingReports: 5,
            duePayments: 3420
        },
        branch_b: {
            todayAppointments: 4,
            pendingReports: 3,
            duePayments: 2000
        }
    };
    
    return stats[branch] || { todayAppointments: 0, pendingReports: 0, duePayments: 0 };
}