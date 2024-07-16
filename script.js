const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const scanStatus = document.getElementById('scan-status');
const stopButton = document.getElementById('stop-button');
const startButton = document.getElementById('start-button');
const inventoryCheck = document.getElementById('inventory-check');
const resultContainer = document.getElementById('result-container');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');

let html5QrCode;
let cart = [];

// Inventory data directly in the script
const inventory = [
    {"id": "001", "name": "Item 1", "quantity": 10, "price": 9.99},
    {"id": "002", "name": "Item 2", "quantity": 5, "price": 14.99},
    {"id": "003", "name": "Item 3", "quantity": 8, "price": 19.99}
];

function onScanSuccess(decodedText, decodedResult) {
    console.log(`Code scanned = ${decodedText}`, decodedResult);
    searchInput.value = decodedText;
    scanStatus.textContent = 'QR Code detected!';
    scanStatus.classList.remove('scanning');
    scanStatus.classList.add('success');
    setTimeout(() => {
        scanStatus.textContent = 'Waiting for QR Code...';
        scanStatus.classList.remove('success');
        scanStatus.classList.add('scanning');
    }, 1000);
    checkInventory(decodedText);
}

function onScanError(errorMessage) {
    console.error(errorMessage);
}

function startScanner() {
    html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanError)
        .then(() => {
            console.log("QR Code scanning started.");
            scanStatus.textContent = 'Waiting for QR Code...';
            scanStatus.classList.add('scanning');
            stopButton.style.display = 'inline-block';
            startButton.style.display = 'none';
        })
        .catch((err) => {
            console.error(`Unable to start scanning: ${err}`);
            scanStatus.textContent = 'Error starting scanner';
        });
}

function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            console.log('QR Code scanning stopped.');
            scanStatus.textContent = 'Scanner stopped';
            scanStatus.classList.remove('scanning', 'success');
            stopButton.style.display = 'none';
            startButton.style.display = 'inline-block';
        }).catch((err) => {
            console.error(`Unable to stop scanning: ${err}`);
        });
    }
}

function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        checkInventory(searchTerm);
    }
}

function checkInventory(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
        resultContainer.innerHTML = `
            <h3>Inventory Check Result:</h3>
            <p>Item: ${item.name}</p>
            <p>ID: ${item.id}</p>
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${item.price.toFixed(2)}</p>
            <button onclick="addToCart('${item.id}')">Add to Cart</button>
        `;
    } else {
        resultContainer.innerHTML = `<p>Item with ID ${itemId} not found in inventory.</p>`;
    }
}

function addToCart(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (item && item.quantity > 0) {
        cart.push({ ...item, quantity: 1 });
        item.quantity--;
        updateCartDisplay();
        checkInventory(itemId);
    } else {
        alert('Item is out of stock');
    }
}

function removeFromCart(index) {
    const removedItem = cart.splice(index, 1)[0];
    const inventoryItem = inventory.find(i => i.id === removedItem.id);
    inventoryItem.quantity += removedItem.quantity;
    updateCartDisplay();
}

function updateCartDisplay() {
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name} - $${item.price.toFixed(2)} 
            <span class="delete-item" onclick="removeFromCart(${index})">❌</span>
        `;
        cartItems.appendChild(li);
        total += item.price;
    });
    cartTotal.textContent = total.toFixed(2);
}

// Start scanner when the page loads
window.addEventListener('load', startScanner);

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

stopButton.addEventListener('click', stopScanner);
startButton.addEventListener('click', startScanner);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (html5QrCode) {
        html5QrCode.stop().catch(err => console.error(err));
    }
});
