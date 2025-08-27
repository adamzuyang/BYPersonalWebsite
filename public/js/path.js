const pathDepartureProxy = "https://barnettyang.herokuapp.com/pathDepartures"  // ?timeStamp={epoch timestamp in millis}
const pathAlertsProxy = "https://barnettyang.herokuapp.com/pathAlerts"

const FAVORITES = ["GRV", "33S", "WTC", "CHR", "NEW"]
const DIRORDER = ["ToNY", "ToNJ"]

const READABLE_NAMES = {
    "GRV": "GROVE ST",
    "33S": "33RD ST",
    "WTC": "WORLD TRADE CTR",
    "CHR": "CHRISTOPHER ST",
    "EXP": "EXCHANGE PL",
    "HAR": "HARRISON",
    "JSQ": "JOURNAL SQ",
    "NEW": "NEWPORT",
    "NWK": "NEWARK",
    "HOB": "HOBOKEN",
    "09S": "9TH ST",
    "14S": "14TH ST",
    "23S": "23RD ST",
}

const READABLE_DIRS = {
    "ToNY": "To New York",
    "ToNJ": "To New Jersey",
}

function stationCompare(a, b) {
    let a_idx = FAVORITES.indexOf(a.consideredStation);
    let b_idx = FAVORITES.indexOf(b.consideredStation);
    if (a_idx == -1) {
        a_idx = FAVORITES.length;
    }
    if (b_idx == -1) {
        b_idx = FAVORITES.length;
    }
    return a_idx - b_idx;
}

function dirCompare(a, b) {
    let a_idx = DIRORDER.indexOf(a.label);
    let b_idx = DIRORDER.indexOf(b.label);
    if (a_idx == -1) {
        a_idx = DIRORDER.length;
    }
    if (b_idx == -1) {
        b_idx = DIRORDER.length;
    }
    return a_idx - b_idx;
}

async function fetchPathAlerts() {
    let element = document.getElementById("pathAlerts");

    const response = await fetch(pathAlertsProxy);
    if (response.status >= 400) {
        element.innerHTML = "Failed to retrieve alerts!";
        setTimeout(fetchPathAlerts, 5000);
        return;
    }
    const json = await response.json();
    let buttonElement = document.getElementById("pathAlertsButton");
    if (!(json.status == "Success")) {
        element.innerHTML = "Failed to retrieve alerts!";
    } else {
        let data = json.data;
        buttonElement.innerHTML = `See Alerts (${data.length})`
        if (data.length == 0) {
            element.innerHTML = "No Alerts!"
        } else {
            let elementHTML = "";
            for (const elem of data) {
                const msg = elem.incidentMessage;
                elementHTML += `<h5>${msg.subject}</h5><p>${msg.preMessage}</p>`
            }
            element.innerHTML = elementHTML;
        }
    }
    setTimeout(fetchPathAlerts, 30000);
}

async function fetchPathDepartures() {
    const now = Date.now();
    const nowSeconds = Math.floor(now / 1000);
    const response = await fetch(`${pathDepartureProxy}?timestamp=${now}`);
    if (response.status >= 400) {
        setTimeout(fetchPathDepartures, 5000);
        return;
    }
    const data = await response.json();

    let element = document.getElementById("pathDepartures");
    let elementHTML = "";
    let results = data.results;
    results.sort(stationCompare);
    for (const result of results) {
        let destinationsHTML = `<h4>${READABLE_NAMES[result.consideredStation] || result.consideredStation}</h4>`;
        let destinations = result.destinations;
        destinations.sort(dirCompare);
        for (const destination of result.destinations) {
            let directionsHTML = `<h5>${READABLE_DIRS[destination.label] || destination.label}</h5>`;
            for (const message of destination.messages) {
                let timeZone = message.lastUpdated.slice(-6);
                let lastUpdatedSeconds = message.lastUpdated.split(".")[0];
                let lastUpdated = Date.parse(lastUpdatedSeconds+timeZone)
                lastUpdatedSeconds = Math.floor(lastUpdated / 1000);
                let lastUpdatedTS = (new Date(lastUpdatedSeconds * 1000)).toLocaleTimeString("it-IT", {timeZone:"America/New_York"});

                let projectedDepartureSeconds = lastUpdatedSeconds + parseInt(message.secondsToArrival, 10);
                let projectedDeparture = new Date(projectedDepartureSeconds * 1000);
                let projectedDepartureTS = projectedDeparture.toLocaleTimeString("it-IT", {timeZone:"America/New_York"});

                let diffSeconds = projectedDepartureSeconds - nowSeconds;

                let seconds = Math.max(0, diffSeconds);
                let hours = Math.floor(seconds / 3600).toString() + ":";
                seconds %= 3600;
                let minutes = Math.floor(seconds / 60).toString() + ":";
                seconds = (seconds % 60).toString();
                if (hours == "0:") {
                    hours = "";
                } else if (hours.length < 3) {
                    hours = "0" + hours;
                }
                if (minutes.length < 3) {
                    minutes = "0" + minutes;
                }
                if (seconds.length < 2) {
                    seconds = "0" + seconds;
                }

                for (const color of message.lineColor.split(",")) {
                    // Add circles
                    directionsHTML += `<span style="height:12px;width:12px;background-color:#${color};border-radius:50%;display:inline-block;margin-left:-6px"></span>`
                }
                directionsHTML += `<span> <b>${message.target}</b> ${hours}${minutes}${seconds} | Est: ${projectedDepartureTS} | Up: ${lastUpdatedTS}</span>`;
                directionsHTML = `<div>` + directionsHTML + `</div>`
            }
            directionsHTML = `<div style="margin-bottom:10px">` + directionsHTML + `</div>`;
            destinationsHTML += directionsHTML;
        }
        destinationsHTML = `<div class="col-lg-3" style="margin-bottom:15px">` + destinationsHTML + `</div>`;
        elementHTML += destinationsHTML;
    }
    element.innerHTML = elementHTML;

    updateTimeElement = document.getElementById("pathUpdateTime");
    updateTimeElement.innerHTML = `Times are in ET. Up: ${(new Date(nowSeconds * 1000)).toLocaleTimeString("it-IT", {timeZone:"America/New_York"})}`
    setTimeout(fetchPathDepartures, 5000);
}

fetchPathAlerts();
fetchPathDepartures();
