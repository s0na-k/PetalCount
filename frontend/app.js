console.log('app.js loaded')
document.getElementById('add-flower-btn').addEventListener('click', function() {
    const row = document.createElement('div')
    row.className = 'flower-row'

    row.innerHTML = `
        <input type="text" placeholder="e.g. Rose">
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

    const removeBtn = row.querySelector('.remove-btn')
    removeBtn.addEventListener('click', function() {
        removeBtn.parentElement.parentElement.removeChild(removeBtn.parentElement)
    })
})

const types = document.querySelectorAll('.type-btn')
for(let i = 0; i < types.length; i++) {
    types[i].addEventListener('click', function(){
        for(let j = 0; j < types.length; j++) {
            types[j].classList.remove('active')
        }  
        this.classList.add('active')
    })
}

document.getElementById('calculate-btn').addEventListener('click', function(){
    let total = 0
    const rows = document.querySelectorAll('.flower-row')

    for(let i=0; i < rows.length; i++) {
        
        let qty = parseInt(rows[i].querySelector('.qty-input').value)
        let price = parseFloat(rows[i].querySelector('.price-input').value)

        if (isNaN(qty)) {
            qty = 1
        }
        if (isNaN(price)) {
            price = 0
        }
        total += qty * price

    }
    
    document.getElementById('results').className = 'results-section'

    document.getElementById('total-price').textContent = '$' + total.toFixed(2)

})