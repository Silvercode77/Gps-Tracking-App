
document.addEventListener('DOMContentLoaded', function () {
  // Get the tabs
const fixtureTableBody = document.querySelector('#fixtureTable tbody');
const transportTab = document.getElementById('transportTab');
const fixturesTab = document.getElementById('fixturesTab');
const fixtureTableContainer = document.getElementById('fixtureTableContainer');
const busInfoContainer = document.getElementById('busInfoContainer');
const loginText = document.getElementById("loginText");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
// Add these variables at the top
let isLoggedIn = false;
const editControls = document.getElementById('editControls');
const editFixturesBtn = document.getElementById('editFixturesBtn');

loginText.addEventListener("click", () => {
  loginModal.classList.add("show");
});

closeModal.addEventListener("click", () => {
  loginModal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.classList.remove("show");
  }
});

const loginBtn = document.querySelector(".login-btn");

loginBtn.addEventListener("click", async () => {
  const username = document.querySelector(".input-box[type='text']").value;
  const password = document.querySelector(".input-box[type='password']").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const result = await response.json();
    console.log("Server response:", result);

        if (response.ok) {
            isLoggedIn = true;
            editControls.style.display = 'block';
            loginModal.style.display = 'none';
            loginText.textContent = 'Logout';
        } else {
            alert('Échec de la connexion. Veuillez vérifier vos identifiants.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Une erreur est produite lors de la connexion .');
    }
});



// Add this to your front.js
let isEditMode = false;
let originalData = []; // To store original data for cancel functionality

// Modify your edit button handler
editFixturesBtn.addEventListener('click', function() {
    if (isLoggedIn) {
        enterEditMode();
    }
});

// Add new row button handler
document.getElementById('addRowBtn').addEventListener('click', addNewRow);

// Save button handler
document.getElementById('saveChangesBtn').addEventListener('click', saveTableChanges);

// Cancel button handler
document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);

function enterEditMode() {
    isEditMode = true;
    originalData = getCurrentTableData(); // Save original data
    
    // Show/hide buttons
    editFixturesBtn.style.display = 'none';
    document.getElementById('addRowBtn').style.display = 'inline-block';
    document.getElementById('saveChangesBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    
    // Make cells editable and add delete buttons
    const rows = document.querySelectorAll('#fixtureTable tbody tr');
    rows.forEach(row => {
        makeRowEditable(row);
        addDeleteButton(row);
    });
}

function makeRowEditable(row) {
    row.classList.add('editable-row');
    const cells = row.querySelectorAll('td:not(.action-column)');
    cells.forEach(cell => {
        cell.contentEditable = true;
        cell.classList.add('editable-cell');
    });
}

function addDeleteButton(row) {
    // Remove existing action cell if it exists
    const existingActionCell = row.querySelector('.action-column');
    if (existingActionCell) {
        existingActionCell.remove();
    }
    
    // Create new action cell with delete button
    const actionCell = document.createElement('td');
    actionCell.className = 'action-column';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-row-btn';
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.addEventListener('click', function() {
        row.remove();
    });
    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);
}

function addNewRow() {
    const tbody = document.querySelector('#fixtureTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="editable-cell" contenteditable="true"></td>
        <td class="editable-cell" contenteditable="true"></td>
    `;
    tbody.appendChild(newRow);
    makeRowEditable(newRow);
    addDeleteButton(newRow);
}

function getCurrentTableData() {
    const rows = document.querySelectorAll('#fixtureTable tbody tr');
    return Array.from(rows).map(row => {
        return {
            busId: row.cells[0].textContent,
            destination: row.cells[1].textContent
        };
    });
}

function cancelEdit() {
    isEditMode = false;
    
    // Restore original buttons
    editFixturesBtn.style.display = 'inline-block';
    document.getElementById('addRowBtn').style.display = 'none';
    document.getElementById('saveChangesBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
    
    // Reload original data
    renderFixtureTable(originalData);
}

async function saveTableChanges() {
    const changes = getCurrentTableData();
    
    try {
        const response = await fetch('/update-fixtures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(changes)
        });
        
        if (response.ok) {
            alert('Modifications enregistrées avec succès !');
            isEditMode = false;
            
            // Update buttons
            editFixturesBtn.style.display = 'inline-block';
            document.getElementById('addRowBtn').style.display = 'none';
            document.getElementById('saveChangesBtn').style.display = 'none';
            document.getElementById('cancelEditBtn').style.display = 'none';
            
            // Remove edit styling
            const rows = document.querySelectorAll('#fixtureTable tbody tr');
            rows.forEach(row => {
                row.classList.remove('editable-row');
                const cells = row.querySelectorAll('td');
                cells.forEach(cell => {
                    cell.contentEditable = false;
                    cell.classList.remove('editable-cell');
                });
                // Remove delete buttons
                const actionCell = row.querySelector('.action-column');
                if (actionCell) {
                    actionCell.remove();
                }
            });
        } else {
            alert('Échec de enregistrement des modifications.');
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('Une erreur est produite lors de enregistrement.');
    }
}

// Update your renderFixtureTable function to include the action column
function renderFixtureTable(data) {
    const tbody = document.querySelector('#fixtureTable tbody');
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.busId}</td>
            <td>${item.destination}</td>
        `;
        tbody.appendChild(row);
    });
}


transportTab.addEventListener('click', () => {
    // Show bus info, hide table
    console.log('HERER',window.specBus);
    displayBusData(window.specBus);
});

fixturesTab.addEventListener('click', () => {
    // Show table, hide bus info
    fixtureTableContainer.style.display = 'block';
    busInfoContainer.style.display = 'none';

    fixturesTab.classList.add('active');
    transportTab.classList.remove('active');

    loadFixtures(); // Optional: load data
});


  // Fetch fixtures from the server (modify the URL to match your API endpoint)
  function loadFixtures() {
    fetch('/fixtures')
        .then(response => response.json())
        .then(data => {
            if (data && Array.isArray(data)) {
                // Store the fetched data for edit mode cancel
                originalData = data.map(row => ({
                    busId: row.BUS_ID,
                    destination: row.DEST
                }));
                renderFixtureTable(originalData);
            } else {
                console.error('Invalid data format received:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching fixtures:', error);
        });
}

  // Initially load transport data when the page loads (optional)
  loadFixtures();
});
function displayBusData(busData) {
    fixtureTableContainer.style.display = 'none';
    busInfoContainer.style.display = 'block';
    transportTab.classList.add('active');
    fixturesTab.classList.remove('active');
    busInfoContainer.style.display = 'block';
    fixtureTableContainer.style.display = 'none';
console.log(busData.Destination);
    busInfoContainer.innerHTML = `
        <div class="bus-info">
            <h3>Bus ${busData.bus_id}</h3>
            <div class="bus-details">
                <p><strong>Localisation:</strong> ${busData.latitude.toFixed(6)}, ${busData.longitude.toFixed(6)}</p>
                <p><strong>Distance:</strong> ${(busData.route?.distance / 1000).toFixed(1)} km</p>
                <p><strong>ETA:</strong> ${busData.route?.duration} minutes</p>
            </div>
        </div>
    `;
}
function renderFixtureTable(data) {
    fixtureTableBody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.busId || row.BUS_ID}</td>
            <td>${row.destination || row.DEST}</td>
            ${isEditMode ? '<td class="action-column"><button class="delete-row-btn">Supprimer</button></td>' : ''}
        `;

        if (isEditMode) {
            const deleteBtn = tr.querySelector('.delete-row-btn');
            deleteBtn.addEventListener('click', () => {
                tr.remove();
                // Optional: also delete from local memory if needed
            });
        }

        fixtureTableBody.appendChild(tr);
    });
}
function enterEditMode() {
    isEditMode = true;
    originalData = getCurrentTableData();

    editFixturesBtn.style.display = 'none';
    document.getElementById('addRowBtn').style.display = 'inline-block';
    document.getElementById('saveChangesBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    renderFixtureTable(originalData);

    const rows = document.querySelectorAll('#fixtureTable tbody tr');
    rows.forEach(row => makeRowEditable(row));
}