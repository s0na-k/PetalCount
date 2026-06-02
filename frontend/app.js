console.log('app.js loaded')
document.getElementById('add-flower-btn').addEventListener('click', function() {
    const row = document.createElement('div')
    row.className = 'flower-row'

    row.innerHTML = `
        <input type="text" placeholder="e.g. Rose">
        <input type="number" placeholder="1">
        <input type="number" placeholder="0.00">
        <button class="remove-btn">x</button>
    `
    document.getElementById('flower-rows').appendChild(row)

    const removeBtn = row.querySelector('.remove-btn')
    removeBtn.addEventListener('click', function() {
        removeBtn.parentElement.parentElement.removeChild(removeBtn.parentElement)
    })
})