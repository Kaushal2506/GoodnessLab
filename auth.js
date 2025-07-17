// Hardcoded credentials (for demo only - in production use proper authentication)
const users = [
    { username: 'owner', password: 'owner123', role: 'owner', name: 'Lab Owner' },
    { username: 'staff1', password: 'staff123', role: 'employee', name: 'John Doe' },
    { username: 'staff2', password: 'staff123', role: 'employee', name: 'Priya Sharma' }
];

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'login.html' || currentPage === '') {
        // If already logged in, redirect to dashboard
        if (sessionStorage.getItem('loggedInUser')) {
            try {
                window.location.href = 'dashboard.html';
            } catch (err) {
                console.error('Redirect error:', err);
            }
        } else {
            // Autofill if remembered
            const remembered = JSON.parse(localStorage.getItem('rememberedUser'));
            if (remembered) {
                document.getElementById('username').value = remembered.username;
                document.getElementById('password').value = remembered.password;
                document.getElementById('remember').checked = true;
            }
        }
    } else {
        // On protected pages (not login), redirect to login if not logged in
        if (!sessionStorage.getItem('loggedInUser')) {
            window.location.href = 'login.html';
        } else {
            // Set the logged in user name in UI if available
            const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
            const userDisplay = document.getElementById('loggedInUser');
            if (userDisplay) {
                userDisplay.textContent = user.name;
            }
        }
    }
});

// Login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const remember = document.getElementById('remember').checked;

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));

            if (remember) {
                localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            // Redirect to dashboard
            try {
                window.location.href = 'dashboard.html';
            } catch (err) {
                console.error('Redirect failed:', err);
            }
        } else {
            showToast('Invalid username or password', 'error');
        }
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });
}

// Sidebar toggle for mobile
const sidebarToggle = document.getElementById('sidebarToggle');
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
        document.getElementById('sidebar')?.classList.toggle('-translate-x-full');
        document.getElementById('sidebarBackdrop')?.classList.toggle('hidden');
    });
}

const sidebarBackdrop = document.getElementById('sidebarBackdrop');
if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', function () {
        document.getElementById('sidebar')?.classList.add('-translate-x-full');
        sidebarBackdrop.classList.add('hidden');
    });
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    if (type === 'error') {
        toast.classList.remove('bg-green-500');
        toast.classList.add('bg-red-500');
    } else {
        toast.classList.remove('bg-red-500');
        toast.classList.add('bg-green-500');
    }

    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}
