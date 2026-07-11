console.log('app.js loaded')
// TODO: Add character counter (e.g. "27/50") for the saved order name input
// TODO: Replace alert() and confirm() dialogs with custom styled modals
// TODO: Add "Did you mean?" fuzzy matching

// [ ]: Week 5
// TODO: Add price adjustment field to allow flourist to set final selling price
// TODO: Add discount field (% or flat amount) to results section
// TODO: Add print/save as PDF button in the modal
// TODO: Add show/hide toggle for saved orders list
// TODO: Add filter options for saved orders (name, items, price)
// TODO: Add optional Notes field to saved orders
// TODO: Add optional Link field to saved orders (for website arrangements)
// TODO: Add optional Photo upload to saved orders
// TODO: Auto-open modal after saving an order to show available options


const inventory = {
    "rose": { cost: 2, loose: 4, wrapped: 6, vase: 7 },
    "red rose": { cost: 2, loose: 5, wrapped: 7, vase: 8 },
    "hydrangea": { cost: 2, loose: 6, wrapped: 8, vase: 10 },
    "greenery": { cost: 0.5, loose: 1, wrapped: 2, vase: 2.5 },
    "lily": { cost: 3, loose: 8, wrapped: 10, vase: 14 },
    "tulip": { cost: 1.5, loose: 4, wrapped: 5, vase: 6 },
    "peony": { cost: 6, loose: 18, wrapped: 25, vase: 30 },
}

let editingIndex = null

/** Capitalizes each word in a string
 * @param {string} str - The string to convert to title case
 * @returns {string} The title-cased string
 */ 
function toTitleCase(str) {
    const arr = str.split(" ")
    const capitalized = arr.map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1)
    })
    return capitalized.join(" ")
}

/** Creates and appends a new item row to the calculator.
 * @param {string} [name] - Item name (optional, for loading saved orders)
 * @param {number} [qty] - Quantity (optional, for loading saved orders)
 * @param {number} [price] - Unit price (optional, for loading saved orders)
 */
function createItemRow(name, qty, price) {
    const row = document.createElement('div')
    row.className = 'item-row'

    row.innerHTML = `
        <input type="text" class="item-name-input" placeholder="e.g. Rose, Myrtle, Vase">
        <input type="number" step="1" class="qty-input" min="0" placeholder="1">
        <input type="number" class="price-input" min="0" placeholder="0.00">
        <button class="remove-btn">x</button>
    `
    // Blocks invalid characters (e, +, -, .) from quantity input
    const qtyInput = row.querySelector('.qty-input')
    qtyInput.addEventListener('keydown', function (event) {
        if (event.key === 'e' || event.key === '+' || event.key === '-' || event.key === '.') {
            event.preventDefault()
        }
    })
    // Defaults quantity to 1 if left empty on blur
    qtyInput.addEventListener('blur', function () {
        let qty = parseInt(qtyInput.value)
        if (isNaN(qty)) {
            qtyInput.value = 1
        }
    })
    // Blocks invalid characters (e, +, -) from price input
    const priceInput = row.querySelector('.price-input')
    priceInput.addEventListener('keydown', function (event) {
        if (event.key === 'e' || event.key === '+' || event.key === '-') {
            event.preventDefault()
        }
    })
    // Defaults price to 0.00 and formats 2 decimal places on blur
    priceInput.addEventListener('blur', function () {
        let price = parseFloat(priceInput.value)

        if (isNaN(price)) {
            priceInput.value = (0).toFixed(2)
        } else {
            priceInput.value = price.toFixed(2)
        }
    })

    document.getElementById('item-rows').appendChild(row)

    const itemInput = row.querySelector('.item-name-input')
    // Looks up item in inventory and auto-fills the unit price
    itemInput.addEventListener('blur', function () {
        itemInput.value = itemInput.value.toLowerCase()
        let itemData = inventory[itemInput.value]

        if (itemData) {
            const activeType = document.querySelector('.type-btn.active')
            const type = activeType.dataset.type
            priceInput.value = itemData[type]
        }
        itemInput.value = toTitleCase(itemInput.value)
    })


    const removeBtn = row.querySelector('.remove-btn')
    // Removes the selected item from the arrangement
    removeBtn.addEventListener('click', function () {
        removeBtn.parentElement.parentElement.removeChild(removeBtn.parentElement)
    })

    if (name) itemInput.value = name
    if (qty) qtyInput.value = qty
    if (price) priceInput.value = price
}

/**
 * Clears and re-renders all saved orders from localStorage.
 */
function renderSavedOrders() {
    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []

    document.getElementById('saved-orders-list').innerHTML = ''

    for (let i = 0; i < allOrders.length; i++) {
        const order = document.createElement('div')
        order.className = 'saved-order-item'
        order.innerHTML = `
        <div>
         <span class="saved-order-name">${allOrders[i].name}</span>
         <span class="saved-order-meta"> · ${allOrders[i].type} · ${allOrders[i].total}</span>
        </div>
       
        <div class="saved-order-actions">
        <i class="fa-solid fa-rotate-right action-load"></i>
        <i class="fa-solid fa-pen action-edit"></i>
        <i class="fa-solid fa-trash action-delete"></i>
        </div>
        `
        const loadBtn = order.querySelector('.action-load')
        loadBtn.addEventListener('click', function (event) {
            loadOrder(allOrders[i])
            event.stopPropagation()
        })

        const editBtn = order.querySelector('.action-edit')
        editBtn.addEventListener('click', function(event) {
            editOrder(allOrders[i], i)
            event.stopPropagation()
        })


        const deleteBtn = order.querySelector('.action-delete')
        deleteBtn.addEventListener('click', function (event) {
            deleteOrder(i)
            event.stopPropagation()
        })

        // Opens the modal and populates it with the clicked order's data
        order.addEventListener('click', function () {
            const modal = document.getElementById('order-modal')
            modal.classList.remove('hidden')

            let modalName = document.getElementById('modal-name')
            modalName.textContent = allOrders[i].name
            let modalType = document.getElementById('modal-type')
            modalType.textContent = allOrders[i].type
            let modalTotal = document.getElementById('modal-total')
            modalTotal.innerHTML = ` 
                <span>Total</span>
                <span>${allOrders[i].total}</span>
            `

            let modalItems = document.getElementById('modal-items')
            modalItems.innerHTML = ''

            for (let j = 0; j < allOrders[i].items.length; j++) {
                const modalRow = document.createElement('tr')
                modalRow.innerHTML = `
                <td>${allOrders[i].items[j].name}</td>
                <td>${allOrders[i].items[j].qty}</td>
                <td>${allOrders[i].items[j].price}</td>
                `
                modalItems.appendChild(modalRow)
            }

            modal.dataset.index = i
        })

        document.getElementById('saved-orders-list').appendChild(order)
    }

}

/** Loads a saved order into the calculator fields and sets the arrangmenet type
 * @param {object} order - The saved order object to load
 */
function loadOrder(order) {
    document.getElementById('order-modal').classList.add('hidden')
    document.getElementById('item-rows').innerHTML = ''
    const type = document.querySelector(`[data-type="${order.type}"]`)
    const typeBtns = document.querySelectorAll(".type-btn")

    for (let i = 0; i < typeBtns.length; i++) {
        typeBtns[i].classList.remove('active')
    }
    type.classList.add('active')

    for (let i = 0; i < order.items.length; i++) {
        createItemRow(order.items[i].name, order.items[i].qty, order.items[i].price)
    }
    window.scrollTo(0, 0)
}

/** Loads a saved order into the calculator for editing, and sets the editing index to overwrite on save.
 * @param {object} order - The saved order to edit
 * @param {number} index - The index of the order to overwrite on save
 */
function editOrder(order, index) {
    loadOrder(order)
    editingIndex = index
    document.getElementById('order-name-input').value = order.name
}

/** Deletes a saved order by inde, after user confirmation.
 * @param {number} index - The index of the order to delete
*/
function deleteOrder(index) {
    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []
    const check = confirm(`Are you sure you want to delete "${allOrders[index].name}"?`)
    if (check) {
        allOrders.splice(index, 1)
        localStorage.setItem('savedOrders', JSON.stringify(allOrders))
        renderSavedOrders()
    }
}

// Loads an order into the calculator rows when the 'Load' button inside the modal is clicked
document.getElementById('modal-load-btn').addEventListener('click', function() {
    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []
    const index = parseInt(document.getElementById('order-modal').dataset.index)
    const order = allOrders[index]
    loadOrder(order)
})

// Loads an order into the calculator to edit, when the 'Edit' button inside the modal is clicked
document.getElementById('modal-edit-btn').addEventListener('click', function() {
    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []
    const index = parseInt(document.getElementById('order-modal').dataset.index)
    const order = allOrders[index]
    editOrder(order, index)
})

// Deletes an order when the 'Delete' button inside the modal is clicked
document.getElementById('modal-delete-btn').addEventListener('click', function () {
    const index = parseInt(document.getElementById('order-modal').dataset.index)
    deleteOrder(index)
    document.getElementById('order-modal').classList.add('hidden')
})


const closeBtn = document.getElementById('close-btn')
// Closes the modal when the X button is clicked
closeBtn.addEventListener('click', function () {
    const modal = document.getElementById('order-modal')
    modal.classList.add('hidden')
})
// Hides modal when the user clicks away
document.getElementById('order-modal').addEventListener('click', function (event) {
    if (event.target === this) {
        this.classList.add('hidden')
    }
})

// Creates and appends a new item row when Add Item is clicked
document.getElementById('add-item-btn').addEventListener('click', function() {
    createItemRow()
})

const types = document.querySelectorAll('.type-btn')
for(let i = 0; i < types.length; i++) {
    // Switches the active arrangement type and updates all item prices
    types[i].addEventListener('click', function(){
        const rows = document.querySelectorAll('.item-row')
        for(let j = 0; j < types.length; j++) {
            types[j].classList.remove('active')
        }  
        this.classList.add('active')

        for(let n = 0; n <rows.length; n++) {
            const itemInput = rows[n].querySelector('.item-name-input')
            const itemData = inventory[itemInput.value.toLowerCase()]
            const priceInput = rows[n].querySelector('.price-input')

            if(itemData) {
                priceInput.value = itemData[this.dataset.type]
            }
        }
    })
}

// Handles the calculation of the total price of the arrangement
document.getElementById('calculate-btn').addEventListener('click', function () {
    let total = 0
    const rows = document.querySelectorAll('.item-row')

    document.getElementById('results-breakdown').innerHTML = ''

    for (let i = 0; i < rows.length; i++) {

        let name = (rows[i].querySelector('.item-name-input').value)
        let qty = parseInt(rows[i].querySelector('.qty-input').value)
        let price = parseFloat(rows[i].querySelector('.price-input').value)

        if (isNaN(qty)) {
            qty = 1
        }
        if (isNaN(price)) {
            price = 0
        }
        total += qty * price
        const row = document.createElement('div')
        row.className = 'result-line'
        row.innerHTML = `
        <span>${name} x ${qty}</span>
        <span>$${(qty * price).toFixed(2)}</span>
        `
        document.getElementById('results-breakdown').appendChild(row)

    }

    document.getElementById('results').className = 'results-section'

    document.getElementById('total-price').textContent = '$' + total.toFixed(2)

})

// Saves current order to localStorage, blocking duplicate name+type combinations
document.getElementById('save-order-btn').addEventListener('click', function () {
    const orderName = document.getElementById('order-name-input')
    if (!orderName.value) {
        alert('Please enter a name for this order')
        return
    }

    const activeType = document.querySelector('.type-btn.active')
    const type = activeType.dataset.type

    const items = []
    const rows = document.querySelectorAll('.item-row')

    for (let i = 0; i < rows.length; i++) {
        let name = rows[i].querySelector('.item-name-input').value
        let qty = parseInt(rows[i].querySelector('.qty-input').value)
        let price = parseFloat(rows[i].querySelector('.price-input').value)
        items.push({ name, qty, price })
    }

    const total = document.getElementById('total-price').textContent

    const savedOrder = { name: orderName.value, type, items, total }

    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []

    
    savedOrder.name = toTitleCase(savedOrder.name)  

    // If not editing, check for duplicates and save as a new order, if editing, overwrite that order after confirming
    if (editingIndex == null) {
        for (let i = 0; i < allOrders.length; i++) {
            if (allOrders[i].name.toLowerCase() == savedOrder.name.toLowerCase() && allOrders[i].type == savedOrder.type) {
                alert("There is already a saved order with this name & type.\nPlease enter a different name or type. ")
                return
            }
        }
        allOrders.push(savedOrder)
    } else {
        const check = confirm(`Save changes to "${allOrders[editingIndex].name}"?`)
        if (check) {
            allOrders[editingIndex] = savedOrder
            editingIndex = null
        } else {
            return
        }
    }     
    
    localStorage.setItem('savedOrders', JSON.stringify(allOrders))
    renderSavedOrders()
    orderName.value = ""

})
renderSavedOrders()
