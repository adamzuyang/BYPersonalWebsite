const apiUrl = "http://barnettyang.herokuapp.com/pathDepartures"  // ?timeStamp={epoch timestamp in millis}

let pathDeparturesBusy = false;

async function fetchPathDepartures() {
    if (pathDeparturesBusy) {
        return;
    }
    const now = Date.now();
    const response = await fetch(`${apiUrl}?timestamp=${now}`);
    const data = await response.json();

    let element = document.getElementById("pathDepartures");
    let elementHTML = "";
    for (const result of data.results) {
        let destinationsHTML = `<h3>${result.consideredStation}</h3>`;
        for (const destination of result.destinations) {
            let directionsHTML = `<h4>${destination.label}</h4>`;
            for (const message of destination.messages) {
                let timeZone = message.lastUpdated.slice(-6);
                let lastUpdatedSeconds = message.lastUpdated.split(".")[0];
                lastUpdatedSeconds = Math.floor(Date.parse(lastUpdatedSeconds+timeZone) / 1000);

                let nowSeconds = Math.floor(Date.now() / 1000);
                let projectedDepartureSeconds = lastUpdatedSeconds + parseInt(message.secondsToArrival, 10);
                let projectedDeparture = new Date(projectedDepartureSeconds * 1000);
                projectedDeparture = projectedDeparture.toLocaleTimeString("it-IT", {timeZone:"America/New_York"});

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
                directionsHTML += `<span> ${message.target} ${hours}${minutes}${seconds} | Est: ${projectedDeparture}ET</span>`;
                directionsHTML = `<div style="margin-bottom:5px">` + directionsHTML + `</div>`
            }
            directionsHTML = `<div style="margin-bottom:10px">` + directionsHTML + `</div>`;
            destinationsHTML += directionsHTML;
        }
        destinationsHTML = `<div class="col-lg-3 mb-4">` + destinationsHTML + `</div>`;
        elementHTML += destinationsHTML;
    }
    element.innerHTML = elementHTML;

    pathDeparturesBusy = false;
}

fetchPathDepartures();
setInterval(fetchPathDepartures, 5000);
