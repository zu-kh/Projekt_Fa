document.addEventListener('DOMContentLoaded', () => {
    const itemForm = document.getElementById('itemForm');
    const itemNumberInput = document.getElementById('itemNumber');
    const itemNameInput = document.getElementById('itemName');
    const itemList = document.getElementById('itemList');
    const apiKey = $2a$10$ZDvaG5KQD3SlE751pCmAIOEaLgwNVgVBixBwX6tl/A3evXQaZ1iE6 ; // Replace with your jsonbin.io API key
    const binId = 66a0e037acd3cb34a86a9857 ; // Replace with your bin ID

    // Function to create a new item element
    function createItemElement(number, name, id) {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        itemDiv.setAttribute('data-id', id);

        const itemText = document.createElement('span');
        itemText.textContent = `${number}: ${name}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', async () => {
            const id = itemDiv.getAttribute('data-id');
            await deleteItemFromJsonBin(id);
            itemDiv.remove();
        });

        itemDiv.appendChild(itemText);
        itemDiv.appendChild(deleteButton);

        return itemDiv;
    }

    // Function to fetch items from jsonbin.io
    async function fetchItems() {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                headers: {
                    'X-Master-Key': apiKey
                }
            });
            const data = await response.json();
            return data.record.items || [];
        } catch (error) {
            console.error('Error fetching items:', error);
            return [];
        }
    }

    // Function to save items to jsonbin.io
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

    // Function to add item to jsonbin.io
    async function addItemToJsonBin(item) {
        const items = await fetchItems();
        items.push(item);
        await saveItems(items);
    }

    // Function to delete item from jsonbin.io
    async function deleteItemFromJsonBin(id) {
        let items = await fetchItems();
        items = items.filter(item => item.id !== id);
        await saveItems(items);
    }

    // Handle form submission
    itemForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const number = itemNumberInput.value;
        const name = itemNameInput.value;
        const id = Date.now().toString(); // Generate a unique ID for the item

        if (number && name) {
            const newItem = { number, name, id };
            await addItemToJsonBin(newItem);
            const newItemElement = createItemElement(number, name, id);
            itemList.appendChild(newItemElement);

            // Clear the form inputs
            itemNumberInput.value = '';
            itemNameInput.value = '';
        }
    });

    // Load items on page load
    async function loadItems() {
        const items = await fetchItems();
        items.forEach(item => {
            const itemElement = createItemElement(item.number, item.name, item.id);
            itemList.appendChild(itemElement);
        });
    }

    loadItems();
});
