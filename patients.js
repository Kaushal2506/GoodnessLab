document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    loadPatients();
    
    // Set up event listeners
    document.getElementById('addPatientBtn').addEventListener('click', showAddPatientModal);
    document.getElementById('cancelPatientBtn').addEventListener('click', hidePatientModal);
    document.getElementById('savePatientBtn').addEventListener('click', savePatient);
    document.getElementById('searchPatient').addEventListener('input', searchPatients);
    document.getElementById('filterStatus').addEventListener('change', filterPatients);
    document.getElementById('filterDate').addEventListener('change', filterPatients);
    
    // Set branch from dropdown
    const branchSelect = document.getElementById('branchSelect');
    if (branchSelect) {
        branchSelect.addEventListener('change', function() {
            loadPatients();
        });
    }
});

// Google Sheets API URL (replace with your Apps Script web app URL)
const API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Load patients from Google Sheets
function loadPatients() {
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    
    showLoading(true);
    
    // In a real app, you would fetch from Google Sheets
    // fetch(`${API_URL}?action=getPatients&branch=${branch}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         showLoading(false);
    //         displayPatients(data);
    //     })
    //     .catch(error => {
    //         showLoading(false);
    //         console.error('Error:', error);
    //         showToast('Failed to load patients', 'error');
    //     });
    
    // For demo, use mock data
    setTimeout(() => {
        showLoading(false);
        displayPatients(getMockPatients(branch));
    }, 800);
}

// Display patients in the table
function displayPatients(patients) {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';
    
    if (patients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    No patients found
                </td>
            </tr>
        `;
        return;
    }
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${patient.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${patient.fullName}</div>
                <div class="text-sm text-gray-500">${patient.contact}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${patient.age} yrs</div>
                <div class="text-sm text-gray-500">${patient.gender}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${patient.contact}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${patient.tests.split(',').slice(0, 2).join(', ')}</div>
                ${patient.tests.split(',').length > 2 ? '<div class="text-xs text-gray-500">+' + (patient.tests.split(',').length - 2) + ' more</div>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${patient.totalAmount}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${patient.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                      patient.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                    ${patient.paymentStatus}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 edit-patient" data-id="${patient.id}">Edit</button>
                <button class="text-red-600 hover:text-red-900 delete-patient" data-id="${patient.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-patient').forEach(button => {
        button.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            editPatient(patientId);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-patient').forEach(button => {
        button.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            deletePatient(patientId);
        });
    });
}

// Show add patient modal
function showAddPatientModal() {
    document.getElementById('modalTitle').textContent = 'Add New Patient';
    document.getElementById('patientId').value = '';
    document.getElementById('patientForm').reset();
    document.getElementById('patientModal').classList.remove('hidden');
}

// Hide patient modal
function hidePatientModal() {
    document.getElementById('patientModal').classList.add('hidden');
}


// Update the savePatient function in patients.js
function savePatient() {
    const form = document.getElementById('patientForm');
    const formData = new FormData(form);
    const patientId = document.getElementById('patientId').value;
    
    // Validate form
    if (!formData.get('fullName') || !formData.get('age') || !formData.get('gender') || 
        !formData.get('contact') || !formData.get('tests') || !formData.get('visitType') || 
        !formData.get('branch') || !formData.get('totalAmount') || !formData.get('paymentStatus')) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Prepare patient data
    const patient = {
        id: patientId || generateId(),
        fullName: formData.get('fullName'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        contact: formData.get('contact'),
        tests: Array.from(formData.getAll('tests')).join(','),
        visitType: formData.get('visitType'),
        branch: formData.get('branch'),
        phlebotomist: formData.get('phlebotomist'),
        totalAmount: formData.get('totalAmount'),
        paymentStatus: formData.get('paymentStatus'),
        notes: formData.get('notes'),
        date: new Date().toISOString().split('T')[0],
        reportStatus: 'Pending',
        amountPaid: formData.get('paymentStatus') === 'Paid' ? formData.get('totalAmount') : 0
    };
    
    // Show loading
    showLoading(true);
    
    // In a real app, you would send this to Google Sheets
    const action = patientId ? 'updatePatient' : 'addPatient';
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, patient })
    })
    .then(response => response.json())
    .then(data => {
        showToast(patientId ? 'Patient updated successfully' : 'Patient added successfully');
        hidePatientModal();
        loadPatients();
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Failed to save patient', 'error');
        showLoading(false);
    });
}

// Edit patient
function editPatient(patientId) {
    // In a real app, you would fetch the patient data from Google Sheets
    // fetch(`${API_URL}?action=getPatient&id=${patientId}`)
    //     .then(response => response.json())
    //     .then(patient => {
    //         populatePatientForm(patient);
    //         document.getElementById('modalTitle').textContent = 'Edit Patient';
    //         document.getElementById('patientModal').classList.remove('hidden');
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //         showToast('Failed to load patient data', 'error');
    //     });
    
    // For demo, use mock data
    const patients = getMockPatients();
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        populatePatientForm(patient);
        document.getElementById('modalTitle').textContent = 'Edit Patient';
        document.getElementById('patientModal').classList.remove('hidden');
    }
}

// Populate patient form
function populatePatientForm(patient) {
    document.getElementById('patientId').value = patient.id;
    document.getElementById('fullName').value = patient.fullName;
    document.getElementById('age').value = patient.age;
    document.getElementById('gender').value = patient.gender;
    document.getElementById('contact').value = patient.contact;
    
    // Select multiple tests
    const testsSelect = document.getElementById('tests');
    const tests = patient.tests.split(',');
    Array.from(testsSelect.options).forEach(option => {
        option.selected = tests.includes(option.value);
    });
    
    document.getElementById('visitType').value = patient.visitType;
    document.getElementById('branch').value = patient.branch;
    document.getElementById('phlebotomist').value = patient.phlebotomist || '';
    document.getElementById('totalAmount').value = patient.totalAmount;
    document.getElementById('paymentStatus').value = patient.paymentStatus;
    document.getElementById('notes').value = patient.notes || '';
}

// Delete patient
function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    // In a real app, you would send delete request to Google Sheets
    // fetch(`${API_URL}?action=deletePatient&id=${patientId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         showToast('Patient deleted successfully');
    //         loadPatients();
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //         showToast('Failed to delete patient', 'error');
    //     });
    
    // For demo, just show success message
    showToast('Patient deleted successfully');
    loadPatients();
}

// Search patients
function searchPatients() {
    const searchTerm = document.getElementById('searchPatient').value.toLowerCase();
    // In a real app, you would fetch filtered data from server
    // For demo, we'll just filter the displayed data
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    const patients = getMockPatients(branch).filter(patient => 
        patient.fullName.toLowerCase().includes(searchTerm) || 
        patient.contact.includes(searchTerm) ||
        patient.id.includes(searchTerm)
    );
    displayPatients(patients);
}

// Filter patients by status and date
function filterPatients() {
    const status = document.getElementById('filterStatus').value;
    const date = document.getElementById('filterDate').value;
    
    // In a real app, you would fetch filtered data from server
    // For demo, we'll just filter the displayed data
    const branchSelect = document.getElementById('branchSelect');
    const branch = branchSelect ? branchSelect.value : 'branch_a';
    let patients = getMockPatients(branch);
    
    if (status !== 'all') {
        patients = patients.filter(patient => patient.paymentStatus === status);
    }
    
    if (date) {
        patients = patients.filter(patient => patient.date === date);
    }
    
    displayPatients(patients);
}

// Show loading state
function showLoading(show) {
    const tbody = document.getElementById('patientsTableBody');
    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Generate random ID
function generateId() {
    return 'PAT' + Math.floor(1000 + Math.random() * 9000);
}

// Mock data for demo
function getMockPatients(branch = 'branch_a') {
    const branches = {
        branch_a: [
            {
                id: 'PAT1234',
                fullName: 'Rahul Sharma',
                age: 32,
                gender: 'Male',
                contact: '9876543210',
                tests: 'CBC,LFT,Thyroid',
                visitType: 'Home',
                branch: 'Branch A',
                phlebotomist: 'John Doe',
                totalAmount: 1200,
                paymentStatus: 'Paid',
                notes: 'Fasting required',
                date: '2023-06-15'
            },
            {
                id: 'PAT1235',
                fullName: 'Priya Patel',
                age: 28,
                gender: 'Female',
                contact: '8765432109',
                tests: 'KFT,Diabetes',
                visitType: 'Lab',
                branch: 'Branch A',
                phlebotomist: '',
                totalAmount: 800,
                paymentStatus: 'Due',
                notes: '',
                date: '2023-06-16'
            }
        ],
        branch_b: [
            {
                id: 'PAT2234',
                fullName: 'Amit Kumar',
                age: 45,
                gender: 'Male',
                contact: '7654321098',
                tests: 'Lipid,Vitamin',
                visitType: 'Home',
                branch: 'Branch B',
                phlebotomist: 'Priya Sharma',
                totalAmount: 1500,
                paymentStatus: 'Partial',
                notes: 'Senior citizen discount applied',
                date: '2023-06-14'
            },
            {
                id: 'PAT2235',
                fullName: 'Neha Gupta',
                age: 24,
                gender: 'Female',
                contact: '6543210987',
                tests: 'CBC,Urine',
                visitType: 'Lab',
                branch: 'Branch B',
                phlebotomist: '',
                totalAmount: 600,
                paymentStatus: 'Paid',
                notes: '',
                date: '2023-06-17'
            }
        ]
    };
    
    return branches[branch] || [];
}