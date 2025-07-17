document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    loadAppointments();
    loadPatientsForAppointments();
    generateCalendar();
    
    // Set up event listeners
    document.getElementById('addAppointmentBtn').addEventListener('click', showAddAppointmentModal);
    document.getElementById('cancelAppointmentBtn').addEventListener('click', hideAppointmentModal);
    document.getElementById('saveAppointmentBtn').addEventListener('click', saveAppointment);
    document.getElementById('appointmentFilter').addEventListener('change', filterAppointments);
    document.getElementById('prevWeek').addEventListener('click', previousWeek);
    document.getElementById('nextWeek').addEventListener('click', nextWeek);
    
    // Set branch from dropdown
    const branchSelect = document.getElementById('branchSelect');
    if (branchSelect) {
        branchSelect.addEventListener('change', function() {
            loadAppointments();
            generateCalendar();
        });
    }
});

let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start on Monday

// Load appointments from Google Sheets
function loadAppointments() {
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    
    showAppointmentsLoading(true);
    
    // In a real app, you would fetch from Google Sheets
    // fetch(`${API_URL}?action=getAppointments&branch=${branch}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         showAppointmentsLoading(false);
    //         displayAppointments(data);
    //     })
    //     .catch(error => {
    //         showAppointmentsLoading(false);
    //         console.error('Error:', error);
    //         showToast('Failed to load appointments', 'error');
    //     });
    
    // For demo, use mock data
    setTimeout(() => {
        showAppointmentsLoading(false);
        displayAppointments(getMockAppointments(branch));
    }, 800);
}

// Load patients for appointment form
function loadPatientsForAppointments() {
    // In a real app, you would fetch from Google Sheets
    // fetch(`${API_URL}?action=getPatients`)
    //     .then(response => response.json())
    //     .then(data => {
    //         populatePatientDropdown(data);
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //     });
    
    // For demo, use mock data
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    populatePatientDropdown(getMockPatients(branch));
}

// Display appointments in the table
function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    No appointments found
                </td>
            </tr>
        `;
        return;
    }
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${appointment.patientName}</div>
                <div class="text-sm text-gray-500">${appointment.patientContact}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatDate(appointment.date)}</div>
                <div class="text-sm text-gray-500">${appointment.time}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${appointment.type === 'Home' ? 'Home Visit' : 'Lab Visit'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${appointment.tests.split(',').slice(0, 2).join(', ')}
                ${appointment.tests.split(',').length > 2 ? '<div class="text-xs text-gray-500">+' + (appointment.tests.split(',').length - 2) + ' more</div>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${appointment.phlebotomist || 'Not assigned'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${appointment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                      appointment.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${appointment.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 edit-appointment" data-id="${appointment.id}">Edit</button>
                <button class="text-red-600 hover:text-red-900 delete-appointment" data-id="${appointment.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            editAppointment(appointmentId);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-appointment').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            deleteAppointment(appointmentId);
        });
    });
}

// Generate calendar view
function generateCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';
    
    // Update current week display
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    document.getElementById('currentWeek').textContent = 
        `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;
    
    // Generate time slots (9am to 5pm)
    for (let hour = 9; hour <= 17; hour++) {
        const row = document.createElement('tr');
        
        // Time cell
        const timeCell = document.createElement('td');
        timeCell.className = 'py-2 text-sm text-gray-500 border-r border-b border-gray-200';
        timeCell.textContent = `${hour}:00 - ${hour + 1}:00`;
        row.appendChild(timeCell);
        
        // Day cells
        for (let day = 0; day < 7; day++) {
            const dayCell = document.createElement('td');
            dayCell.className = 'p-1 border-r border-b border-gray-200 h-20';
            
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(dayDate.getDate() + day);
            
            // In a real app, you would show appointments for this time slot
            // For demo, we'll just show a placeholder
            if (Math.random() > 0.7) {
                dayCell.innerHTML = `
                    <div class="bg-blue-50 border border-blue-200 rounded p-1 h-full overflow-hidden">
                        <div class="text-xs font-medium text-blue-800 truncate">Patient Name</div>
                        <div class="text-xs text-blue-600 truncate">Home Visit</div>
                    </div>
                `;
            }
            
            row.appendChild(dayCell);
        }
        
        calendarBody.appendChild(row);
    }
}

// Show add appointment modal
function showAddAppointmentModal() {
    document.getElementById('appointmentModalTitle').textContent = 'Schedule New Appointment';
    document.getElementById('appointmentId').value = '';
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentModal').classList.remove('hidden');
}

// Hide appointment modal
function hideAppointmentModal() {
    document.getElementById('appointmentModal').classList.add('hidden');
}

// Save appointment (add or update)
function saveAppointment() {
    const form = document.getElementById('appointmentForm');
    const formData = new FormData(form);
    const appointmentId = document.getElementById('appointmentId').value;
    
    // Validate form
    if (!formData.get('patient') || !formData.get('date') || !formData.get('time') || 
        !formData.get('type') || !formData.get('status')) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Get patient details
    const patientSelect = document.getElementById('appointmentPatient');
    const selectedPatient = patientSelect.options[patientSelect.selectedIndex];
    const patientName = selectedPatient.text;
    const patientContact = selectedPatient.getAttribute('data-contact');
    const patientTests = selectedPatient.getAttribute('data-tests');
    
    // Prepare appointment data
    const appointment = {
        id: appointmentId || generateId(),
        patientId: formData.get('patient'),
        patientName,
        patientContact,
        tests: patientTests,
        date: formData.get('date'),
        time: formData.get('time'),
        type: formData.get('type'),
        phlebotomist: formData.get('phlebotomist'),
        status: formData.get('status'),
        notes: formData.get('notes'),
        branch: document.getElementById('branchSelect').value
    };
    
    // Show loading
    showAppointmentsLoading(true);
    
    // In a real app, you would send this to Google Sheets
    const action = appointmentId ? 'updateAppointment' : 'addAppointment';
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, appointment })
    })
    .then(response => response.json())
    .then(data => {
        showToast(appointmentId ? 'Appointment updated successfully' : 'Appointment scheduled successfully');
        hideAppointmentModal();
        loadAppointments();
        generateCalendar();
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to save appointment', 'error');
        showAppointmentsLoading(false);
    });
}

// Edit appointment
function editAppointment(appointmentId) {
    // In a real app, you would fetch the appointment data from Google Sheets
    // fetch(`${API_URL}?action=getAppointment&id=${appointmentId}`)
    //     .then(response => response.json())
    //     .then(appointment => {
    //         populateAppointmentForm(appointment);
    //         document.getElementById('appointmentModalTitle').textContent = 'Edit Appointment';
    //         document.getElementById('appointmentModal').classList.remove('hidden');
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //         showToast('Failed to load appointment data', 'error');
    //     });
    
    // For demo, use mock data
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    const appointments = getMockAppointments(branch);
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        populateAppointmentForm(appointment);
        document.getElementById('appointmentModalTitle').textContent = 'Edit Appointment';
        document.getElementById('appointmentModal').classList.remove('hidden');
    }
}

// Populate appointment form
function populateAppointmentForm(appointment) {
    document.getElementById('appointmentId').value = appointment.id;
    document.getElementById('appointmentDate').value = appointment.date;
    document.getElementById('appointmentTime').value = appointment.time;
    document.getElementById('appointmentType').value = appointment.type;
    document.getElementById('appointmentPhlebotomist').value = appointment.phlebotomist || '';
    document.getElementById('appointmentStatus').value = appointment.status;
    document.getElementById('appointmentNotes').value = appointment.notes || '';
    
    // Set patient in dropdown
    const patientSelect = document.getElementById('appointmentPatient');
    for (let i = 0; i < patientSelect.options.length; i++) {
        if (patientSelect.options[i].value === appointment.patientId) {
            patientSelect.selectedIndex = i;
            break;
        }
    }
}

// Populate patient dropdown
function populatePatientDropdown(patients) {
    const patientSelect = document.getElementById('appointmentPatient');
    
    // Clear existing options except the first one
    while (patientSelect.options.length > 1) {
        patientSelect.remove(1);
    }
    
    // Add patient options
    patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = patient.fullName;
        option.setAttribute('data-contact', patient.contact);
        option.setAttribute('data-tests', patient.tests);
        patientSelect.appendChild(option);
    });
}

// Delete appointment
function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    // Show loading
    showAppointmentsLoading(true);
    
    // In a real app, you would send delete request to Google Sheets
    // fetch(`${API_URL}?action=deleteAppointment&id=${appointmentId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         showToast('Appointment deleted successfully');
    //         loadAppointments();
    //         generateCalendar();
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //         showToast('Failed to delete appointment', 'error');
    //         showAppointmentsLoading(false);
    //     });
    
    // For demo, just show success message
    showToast('Appointment deleted successfully');
    loadAppointments();
    generateCalendar();
}

// Filter appointments
function filterAppointments() {
    const filter = document.getElementById('appointmentFilter').value;
    const today = new Date().toISOString().split('T')[0];
    
    // In a real app, you would fetch filtered data from server
    // For demo, we'll just filter the displayed data
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    let appointments = getMockAppointments(branch);
    
    if (filter === 'today') {
        appointments = appointments.filter(a => a.date === today);
    } else if (filter === 'upcoming') {
        appointments = appointments.filter(a => a.date >= today && a.status !== 'Completed' && a.status !== 'Cancelled');
    } else if (filter === 'completed') {
        appointments = appointments.filter(a => a.status === 'Completed');
    }
    
    displayAppointments(appointments);
}

// Navigate to previous week
function previousWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    generateCalendar();
}

// Navigate to next week
function nextWeek() {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    generateCalendar();
}

// Show loading state for appointments
function showAppointmentsLoading(show) {
    const tbody = document.getElementById('appointmentsTableBody');
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
function getMockAppointments(branch = 'branch_a') {
    const branches = {
        branch_a: [
            {
                id: 'APT1234',
                patientId: 'PAT1234',
                patientName: 'Rahul Sharma',
                patientContact: '9876543210',
                tests: 'CBC,LFT,Thyroid',
                date: new Date().toISOString().split('T')[0],
                time: '10:00',
                type: 'Home',
                phlebotomist: 'John Doe',
                status: 'Scheduled',
                notes: 'Fasting required',
                branch: 'Branch A'
            },
            {
                id: 'APT1235',
                patientId: 'PAT1235',
                patientName: 'Priya Patel',
                patientContact: '8765432109',
                tests: 'KFT,Diabetes',
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                time: '14:30',
                type: 'Lab',
                phlebotomist: '',
                status: 'Confirmed',
                notes: '',
                branch: 'Branch A'
            }
        ],
        branch_b: [
            {
                id: 'APT2234',
                patientId: 'PAT2234',
                patientName: 'Amit Kumar',
                patientContact: '7654321098',
                tests: 'Lipid,Vitamin',
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                time: '11:15',
                type: 'Home',
                phlebotomist: 'Priya Sharma',
                status: 'Completed',
                notes: 'Senior citizen discount applied',
                branch: 'Branch B'
            },
            {
                id: 'APT2235',
                patientId: 'PAT2235',
                patientName: 'Neha Gupta',
                patientContact: '6543210987',
                tests: 'CBC,Urine',
                date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
                time: '09:00',
                type: 'Lab',
                phlebotomist: '',
                status: 'Scheduled',
                notes: '',
                branch: 'Branch B'
            }
        ]
    };
    
    return branches[branch] || [];
}