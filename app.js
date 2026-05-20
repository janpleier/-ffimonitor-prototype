function updateClock() {
    const now = new Date()
    
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('de-AT')
    
    const dateOptions = { weekday: 'short', day: '2-digit', month: 'short' }
    document.getElementById('clock-date').textContent = now.toLocaleDateString('de-AT', dateOptions).toLowerCase()
}

setInterval(updateClock, 1000)
updateClock()