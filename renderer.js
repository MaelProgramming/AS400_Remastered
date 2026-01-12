const fs = require('fs');
const path = require('path');

const legacyDiv = document.getElementById('legacy');
const clientInput = document.getElementById('clientName');
const addBtn = document.getElementById('addClientBtn');
const quitBtn = document.getElementById('quitBtn');
const clientTableBody = document.getElementById('clientTableBody');

// Directory for data
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Data file path
const dataFile = path.join(dataDir, 'clients.json');

// Load clients at startup
let clients = [];
if (fs.existsSync(dataFile)) {
  try {
    clients = JSON.parse(fs.readFileSync(dataFile));
  } catch (e) {
    console.error('Error reading clients.json:', e);
    clients = [];
  }
}

let currentCommand = '';
let showClients = false; // show clients only when command 1 is entered

function renderLegacy(message = '') {
  let clientList = '';
  if (showClients && clients.length > 0) {
    clientList = '\n' + clients.map(c => `${c.id} - ${c.name}`).join('\n');
  }

  legacyDiv.textContent =
`AS/400 SYSTEM - SESSION 5250

User      : ADMIN
Program   : CUSTMGR

--------------------------------
1. View clients
2. Add client
3. Quit

Command : ${currentCommand}

${message}${clientList}`;
}

// Keyboard handling for 5250-style commands
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') {
    currentCommand += e.key;
    renderLegacy();
  } else if (e.key === 'Backspace') {
    currentCommand = currentCommand.slice(0, -1);
    renderLegacy();
  } else if (e.key === 'Enter') {
    executeCommand(currentCommand);
    currentCommand = '';
  }
});

function executeCommand(cmd) {
  switch (cmd) {
    case '1':
      showClients = true;
      renderLegacy('>> CLIENT LIST');
      break;
    case '2':
      showClients = false;
      renderLegacy('>> Use the form on the right to add a client');
      break;
    case '3':
      window.close();
      break;
    default:
      showClients = false;
      renderLegacy('!! INVALID COMMAND');
  }
}

// Save clients to JSON file
function saveClients() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(clients, null, 2));
  } catch (e) {
    console.error('Error saving clients.json:', e);
  }
}

// Add client
addBtn.addEventListener('click', () => {
  const name = clientInput.value.trim();
  if (name) {
    const id = clients.length + 1;
    clients.push({ id, name });
    clientInput.value = '';
    updateClientTable();
    showClients = false; // hide list after adding
    renderLegacy(`>> Client added: ${name}`);
    saveClients();
  }
});

function updateClientTable() {
  clientTableBody.innerHTML = '';
  clients.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${c.id}</td><td>${c.name}</td>`;
    clientTableBody.appendChild(tr);
  });
}

// Quit app
quitBtn.addEventListener('click', () => {
  window.close();
});

// Initial render
updateClientTable();
renderLegacy();
