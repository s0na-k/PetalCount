console.log('app.js loaded')

const inventory = {
  "red rose":        { cost: 3,   loose: 9,  wrapped: 12, vase: 15 },
  "white hydrangea": { cost: 8,   loose: 24, wrapped: 32, vase: 40 },
  "white carnation": { cost: 2,   loose: 6,  wrapped: 8,  vase: 10 },
  "greenery":        { cost: 2.5, loose: 7,  wrapped: 10, vase: 12 },
  "lily":            { cost: 4,   loose: 12, wrapped: 16, vase: 20 },
  "tulip":           { cost: 2,   loose: 6,  wrapped: 8,  vase: 10 },
  "peony":           { cost: 7,   loose: 21, wrapped: 28, vase: 35 },
}

function renderSavedOrders() {
    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []

    document.getElementById('saved-orders-list').innerHTML= ''

    for(let i = 0; i < allOrders.length; i++) {
        const order = document.createElement('div')
        order.className = 'saved-order-item'
        order.innerHTML = `
        <div class="saved-order-name">${allOrders[i].name}</div>
        <span class="saved-order-meta">${allOrders[i].type} · ${allOrders[i].total}</span>
        `
        order.addEventListener('click', function() {
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

            for(let j = 0; j < allOrders[i].items.length; j++) {
                const modalRow = document.createElement('tr')
                modalRow.innerHTML = `
                <td>${allOrders[i].items[j].name}</td>
                <td>${allOrders[i].items[j].qty}</td>
                <td>${allOrders[i].items[j].price}</td>
                `
                modalItems.appendChild(modalRow)
            }
        })
        
        document.getElementById('saved-orders-list').appendChild(order)
    }

}

const closeBtn = document.getElementById('close-btn')
closeBtn.addEventListener('click', function () {
    const modal = document.getElementById('order-modal')
    modal.classList.add('hidden')
})

document.getElementById('order-modal').addEventListener('click', function(event) {
    if(event.target === this) {
        this.classList.add('hidden')
    }
})

document.getElementById('add-item-btn').addEventListener('click', function() {
    const row = document.createElement('div')
    row.className = 'item-row'

    row.innerHTML = `
        <input type="text" class="item-name-input" placeholder="e.g. Rose, Myrtle, Vase">
        <input type="number" step="1" class="qty-input" min="0" placeholder="1">
        <input type="number" class="price-input" min="0" placeholder="0.00">
        <button class="remove-btn">x</button>
    `
    const qtyInput = row.querySelector('.qty-input')
    qtyInput.addEventListener('keydown', function(event) {
        if (event.key === 'e' || event.key === '+' || event.key === '-' || event.key === '.') {
            event.preventDefault()
        }
    })
    qtyInput.addEventListener('blur', function() {
        let qty = parseInt(qtyInput.value)
        if(isNaN(qty)) {
            qtyInput.value = 1
        }
    })

    const priceInput = row.querySelector('.price-input')
    priceInput.addEventListener('keydown', function(event) {
        if (event.key === 'e' || event.key === '+' || event.key === '-') {
            event.preventDefault()
        }
    })
    priceInput.addEventListener('blur', function() {
        let price = parseFloat(priceInput.value)

        if(isNaN(price)) {
            priceInput.value = (0).toFixed(2)
        }
        else {
             priceInput.value = price.toFixed(2)
        }
    }) 

    document.getElementById('item-rows').appendChild(row)

    const itemInput = row.querySelector('.item-name-input')
    itemInput.addEventListener('blur', function(){
        let itemData = inventory[itemInput.value]
        
        if(itemData) {
            const activeType = document.querySelector('.type-btn.active')
            const type = activeType.dataset.type
            priceInput.value = itemData[type]
        }
    }) 


    const removeBtn = row.querySelector('.remove-btn')
    removeBtn.addEventListener('click', function() {
        removeBtn.parentElement.parentElement.removeChild(removeBtn.parentElement)
    })
})

const types = document.querySelectorAll('.type-btn')
for(let i = 0; i < types.length; i++) {
    types[i].addEventListener('click', function(){
        const rows = document.querySelectorAll('.item-row')
        for(let j = 0; j < types.length; j++) {
            types[j].classList.remove('active')
        }  
        this.classList.add('active')

        for(let n = 0; n <rows.length; n++) {
            const itemInput = rows[n].querySelector('.item-name-input')
            const itemData = inventory[itemInput.value]
            const priceInput = rows[n].querySelector('.price-input')

            if(itemData) {
                priceInput.value = itemData[this.dataset.type]
            }
        }
    })
}

document.getElementById('calculate-btn').addEventListener('click', function(){
    let total = 0
    const rows = document.querySelectorAll('.item-row')

    document.getElementById('results-breakdown').innerHTML = ''

    for(let i=0; i < rows.length; i++) {

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
        <span>$${(qty*price).toFixed(2)}</span>
        `
        document.getElementById('results-breakdown').appendChild(row)

    }
    
    document.getElementById('results').className = 'results-section'

    document.getElementById('total-price').textContent = '$' + total.toFixed(2)

})

document.getElementById('save-order-btn').addEventListener('click', function() {
    const orderName = document.getElementById('order-name-input')
    if (!orderName.value) {
       alert('Please enter a name for this order') 
       return
    }

    const activeType = document.querySelector('.type-btn.active')
    const type = activeType.dataset.type

    const items = []
    const rows = document.querySelectorAll('.item-row')

    for(let i=0; i < rows.length; i++) {
        let name = rows[i].querySelector('.item-name-input').value
        let qty = parseInt(rows[i].querySelector('.qty-input').value)
        let price = parseFloat(rows[i].querySelector('.price-input').value)
        items.push({name, qty, price})
    }

    const total = document.getElementById('total-price').textContent

    const savedOrder = {name: orderName.value, type, items, total}

    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []
    allOrders.push(savedOrder)
    localStorage.setItem('savedOrders', JSON.stringify(allOrders))
    renderSavedOrders()
    orderName.value = ""

})
renderSavedOrders()
