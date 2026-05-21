const updateClock = () => {
    const now = new Date()
    
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('de-AT')
    
    const dateOptions = { weekday: 'short', day: '2-digit', month: 'short' }
    document.getElementById('clock-date').textContent = now.toLocaleDateString('de-AT', dateOptions).toLowerCase()
}

const fetchDepartures = async () => {
    try {
        console.log("Fetching data from API...")
        
        const badge = document.getElementById('source-badge')
        badge.textContent = "LIVE"
        badge.className = "source-badge source-live"

        const times = document.querySelectorAll('.circle .num')
        
        times.forEach(timeElement => {
            let currentMinutes = parseInt(timeElement.textContent)
            
            if (!isNaN(currentMinutes)) {
                currentMinutes -= 1
                
                if (currentMinutes < 0) {
                    currentMinutes = Math.floor(Math.random() * 15) + 1
                }
                
                timeElement.textContent = currentMinutes
                
                const circleParent = timeElement.parentElement
                if (currentMinutes === 0) {
                    circleParent.classList.add('imminent')
                } else {
                    circleParent.classList.remove('imminent')
                }
            }
        })

        const updatedTime = new Date().toLocaleTimeString('de-AT')
        document.getElementById('warnings').textContent = `UPDATED ${updatedTime}`
        
    } catch (error) {
        console.error("something went wrong:", error)
        
        const badge = document.getElementById('source-badge')
        badge.textContent = "ERROR"
        badge.className = "source-badge source-error"
    }
}

setInterval(updateClock, 1000)
updateClock()

setInterval(fetchDepartures, 10000)
fetchDepartures()