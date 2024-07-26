const apiKey = '$2a$10$zW3TUHT3ml29eE3CzCfhR..g5UDEkmJiTJAI8mbruYVq.t6L/T0ja'; // Replace with your JSONBin API key
const binId = '66a0e037acd3cb34a86a985766a0e037acd3cb34a86a9857'; // Replace with your JSONBin bin ID

const predefinedItems = [
    { "name": "فلافل" },
    { "name": "حلومي" },
    { "name": "مقالي" },
    { "name": "فلافل حلومي" },
    { "name": "فلافل مقالي" },
    { "name": "مقالي حلومي" },
    { "name": "صحن فلافل" },
    { "name": "صحن مقالي" },
];

async function fetchItems() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Master-Key': apiKey }
        });
        if (response.status === 401) {
            throw new Error('Unauthorized: Check your API key and bin ID');
        }
        const data = await response.json();
        return data.record.items || [];
    } catch (error) {
        console.error('Error fetching items:', error);
        return [];
    }
}

async function saveItems(items) {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify({ items })
        });
    } catch (error) {
        console.error('Error saving items:', error);
    }
}

function createItemElement(name, number, choices, id) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    itemDiv.setAttribute('data-id', id);

    const itemText = document.createElement('span');
    itemText.textContent = `${name} - ${number} ${choices.join(' ')}`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', async () => {
        await deleteItemFromJsonBin(id);
        itemDiv.remove();
    });

    itemDiv.appendChild(itemText);
    itemDiv.appendChild(deleteButton);

    return itemDiv;
}

async function addItemToJsonBin(item) {
    const items = await fetchItems();
    items.push(item);
    await saveItems(items);
}

async function deleteItemFromJsonBin(id) {
    let items = await fetchItems();
    items = items.filter(item => item.id !== id);
    await saveItems(items);
}

function toggleChoice(choiceId) {
    const button = document.getElementById(choiceId);
    if (button.classList.contains('selected')) {
        button.classList.remove('selected');
        button.style.backgroundColor = '';
    } else {
        button.classList.add('selected');
        button.style.backgroundColor = 'lightblue';
    }
}

function addItem(name, number, inputId) {
    if (name && number) {
        const sm = document.getElementById('sm' + inputId.slice(-1)).classList.contains('selected') ? 'ohne 🍅' : '';
        const rm = document.getElementById('rm' + inputId.slice(-1)).classList.contains('selected') ? 'ohne 🥒' : '';
        const fm = document.getElementById('fm' + inputId.slice(-1)).classList.contains('selected') ? 'ohne 🥬' : '';
        const choices = [sm, rm, fm].filter(choice => choice);
        const id = Date.now().toString(); // Generate a unique ID for the item
        const newItem = { name, number, choices, id };
        addItemToJsonBin(newItem).then(() => {
            document.getElementById(inputId).value = '';
            document.getElementById('sm' + inputId.slice(-1)).classList.remove('selected');
            document.getElementById('rm' + inputId.slice(-1)).classList.remove('selected');
            document.getElementById('fm' + inputId.slice(-1)).classList.remove('selected');
            document.getElementById('sm' + inputId.slice(-1)).style.backgroundColor = '';
            document.getElementById('rm' + inputId.slice(-1)).style.backgroundColor = '';
            document.getElementById('fm' + inputId.slice(-1)).style.backgroundColor = '';
        });
    }
}

async function loadItems() {
    const items = await fetchItems();
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';
    items.forEach(item => {
        const itemElement = createItemElement(item.name, item.number, item.choices, item.id);
        itemList.appendChild(itemElement);
    });
}

function resetTotals() {
    // Functionality to reset totals if needed
}

document.addEventListener('DOMContentLoaded', () => {
    const predefinedList = document.getElementById('predefinedList');
    predefinedItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');

        itemDiv.innerHTML = `
            <strong>${item.name}</strong>
            <input type="number" id="number${index + 1}" placeholder="Enter number" onkeypress="handleKeyPress(event, '${item.name}', 'number${index + 1}')">
            <button onclick="addItem('${item.name}', document.getElementById('number${index + 1}').value, 'number${index + 1}')">Add</button>
            <button class="choice-btn" id="sm${index + 1}" onclick="toggleChoice('sm${index + 1}')">ohne 🍅</button>
            <button class="choice-btn" id="rm${index + 1}" onclick="toggleChoice('rm${index + 1}')">ohne 🥒</button>
            <button class="choice-btn" id="fm${index + 1}" onclick="toggleChoice('fm${index + 1}')">ohne 🥬</button>
            <div>Total for ${item.name}: <span id="total${index + 1}">0</span></div>
        `;
        predefinedList.appendChild(itemDiv);
    });

    loadItems();
});

function handleKeyPress(event, name, inputId) {
    if (event.key === 'Enter') {
        addItem(name, document.getElementById(inputId).value, inputId);
    }
}
