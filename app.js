// API call
const TARGET_URL = 'https://www.wienerlinien.at/ogd_realtime/monitor?rbl=4210&rbl=4103&rbl=4153&rbl=4154'
const API_URL = 'https://corsproxy.io/?' + encodeURIComponent(TARGET_URL)
const updateClock = () => {
    const now = new Date()
    
    document.getElementById('clock-time').textContent = now.toLocaleTimeString('de-AT')
    
    // format data
    const dateOptions = { weekday: 'short', day: '2-digit', month: 'short' }
    document.getElementById('clock-date').textContent = now.toLocaleDateString('de-AT', dateOptions).toLowerCase()
}

const getCssClass = (lineName) => {
    const name = lineName.toLowerCase()
    
    if (name.startsWith('u')) {
        return name 
    }
    return 'tram'
}

const groupMonitors = (monitors) => {
    const grouped = {}
    
    monitors.forEach(monitor => {
        // skip empty data
        if (!monitor.lines || monitor.lines.length === 0) return
        
        const line = monitor.lines[0]
        const lineName = line.name
        const stopName = monitor.locationStop.properties.title
        
        // create a unique key for grouping
        const key = `${lineName}-${stopName}`
        
        if (!grouped[key]) {
            grouped[key] = {
                stopName: stopName,
                lineName: lineName,
                directions: []
            }
        }
        
        let timeToLeave = '-'
        let nextDepartures = []
        
        if (line.departures && line.departures.departure) {
            const deps = line.departures.departure
            
            // get the immediate next departure time
            if (deps.length > 0) {
                timeToLeave = deps[0].departureTime.countdown
            }
            
            // following departures for the "danach in..." text
            for (let i = 1; i < Math.min(deps.length, 4); i++) {
                if (deps[i].departureTime && deps[i].departureTime.countdown !== undefined) {
                    nextDepartures.push(deps[i].departureTime.countdown)
                }
            }
        }
        
        // save the parsed direction data
        grouped[key].directions.push({
            destination: line.towards,
            timeToLeave: timeToLeave,
            nextDepartures: nextDepartures
        })
    })
    
    return Object.values(grouped)
}

// building html objects
const renderDepartures = (monitors) => {
    const container = document.getElementById('departures')
    container.innerHTML = '' 

    // emptry state
    if (!monitors || monitors.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden')
        return
    }

    document.getElementById('empty-state').classList.add('hidden')
    
    const groupedLines = groupMonitors(monitors)

    groupedLines.forEach(group => {
        const cssClass = getCssClass(group.lineName)
        
        // left s
        const dir1 = group.directions[0] || { destination: '-', timeToLeave: '-', nextDepartures: [] }
        const nextText1 = dir1.nextDepartures.length > 0 ? `danach in ${dir1.nextDepartures.join(', ')} Minuten` : ''
        
        // right s
        const dir2 = group.directions[1] || { destination: '-', timeToLeave: '-', nextDepartures: [] }
        const nextText2 = dir2.nextDepartures.length > 0 ? `danach in ${dir2.nextDepartures.join(', ')} Minuten` : ''

        // list creation
        const li = document.createElement('li')
        li.className = `dep ${cssClass}`
        
        // html fulling
        li.innerHTML = `
            <div class="stop-name">${group.stopName}</div>
            
            <div class="circle ${dir1.timeToLeave === 0 ? 'imminent' : ''}">
                <span class="num">${dir1.timeToLeave}</span>
            </div>
            
            <div class="side">
                <span class="label">Nächste Abfahrt nach</span>
                <span class="dest">${dir1.destination} <span class="badge-icon">♿</span></span>
                <span class="next">${nextText1}</span>
            </div>
            
            <div class="center">
                <span class="line-name">${group.lineName}</span>
                <span class="walk">Gehzeit ~5 Minuten</span>
            </div>
            
            <div class="side side-right">
                <span class="label">${dir2.destination !== '-' ? 'Nächste Abfahrt nach' : ''}</span>
                <span class="dest">${dir2.destination !== '-' ? dir2.destination + ' <span class="badge-icon">♿</span>' : '-'}</span>
                <span class="next">${nextText2}</span>
            </div>
            
            <div class="circle ${dir2.timeToLeave === '-' ? 'empty' : ''} ${dir2.timeToLeave === 0 ? 'imminent' : ''}">
                <span class="num">${dir2.timeToLeave}</span>
            </div>
        `
        
        container.appendChild(li)
    })
}

// fetch data from the API
const fetchDepartures = async () => {
    const badge = document.getElementById('source-badge')
    
    try {
        // set ui to loading state
        badge.textContent = "LOADING"
        badge.className = "source-badge source-loading"

        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('API is not responding')
        
        const json = await response.json()
        //process the data and render the departures    
        if (json.data && json.data.monitors) {
            renderDepartures(json.data.monitors)
        }

        // live state
        badge.textContent = "LIVE"
        badge.className = "source-badge source-live"
        const updatedTime = new Date().toLocaleTimeString('de-AT')
        document.getElementById('warnings').textContent = `UPDATED ${updatedTime}`
        
    } catch (error) {
        console.error("Error fetching data:", error)
        
        // error state
        badge.textContent = "ERROR"
        badge.className = "source-badge source-error"
    }
}

// Update the clock every second
setInterval(updateClock, 1000)
updateClock()

// fetch departures every 15 seconds to prevent API spam
setInterval(fetchDepartures, 15000)
fetchDepartures()