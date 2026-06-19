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
        document.getElementById('saved-orders-list').appendChild(order)
    }
}

document.getElementById('add-flower-btn').addEventListener('click', function() {
    const row = document.createElement('div')
    row.className = 'flower-row'

    row.innerHTML = `
        <input type="text" class="flower-name-input" placeholder="e.g. Rose">
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

    document.getElementById('flower-rows').appendChild(row)

    const flowerInput = row.querySelector('.flower-name-input')
    flowerInput.addEventListener('blur', function(){
        let flowerData = inventory[flowerInput.value]
        
        if(flowerData) {
            const activeType = document.querySelector('.type-btn.active')
            const type = activeType.dataset.type
            priceInput.value = flowerData[type]
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
        const rows = document.querySelectorAll('.flower-row')
        for(let j = 0; j < types.length; j++) {
            types[j].classList.remove('active')
        }  
        this.classList.add('active')

        for(let n = 0; n <rows.length; n++) {
            const flowerInput = rows[n].querySelector('.flower-name-input')
            const flowerData = inventory[flowerInput.value]
            const priceInput = rows[n].querySelector('.price-input')

            if(flowerData) {
                priceInput.value = flowerData[this.dataset.type]
            }
        }
    })
}

document.getElementById('calculate-btn').addEventListener('click', function(){
    let total = 0
    const rows = document.querySelectorAll('.flower-row')

    document.getElementById('results-breakdown').innerHTML = ''

    for(let i=0; i < rows.length; i++) {

        let name = (rows[i].querySelector('.flower-name-input').value)
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

    const flowers = []
    const rows = document.querySelectorAll('.flower-row')

    for(let i=0; i < rows.length; i++) {
        let name = rows[i].querySelector('.flower-name-input').value
        let qty = parseInt(rows[i].querySelector('.qty-input').value)
        let price = parseFloat(rows[i].querySelector('.price-input').value)
        flowers.push({name: name, qty: qty, price: price})
    }

    const total = document.getElementById('total-price').textContent

    const savedOrder = {name: orderName.value, type, flowers, total}

    const stored = localStorage.getItem('savedOrders')
    const allOrders = stored ? JSON.parse(stored) : []
    allOrders.push(savedOrder)
    localStorage.setItem('savedOrders', JSON.stringify(allOrders))
    renderSavedOrders()
    orderName.value = ""

})
renderSavedOrders()
