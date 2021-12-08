
let getAllStations = document.querySelectorAll('.all-stations');

async function GettingAllStations(){

    // Getting the promise for the fetch
    let theFetch = await fetch( "http://10.101.0.12:8080/stations" );
    // Getting the response json from the json promise
    let responseFromFetch = await theFetch.json();

    // For each station, create a new option with the name of the station
    for (let i = 0; i < responseFromFetch.length; i++) {
        // For each select (2), create an option and append the station name
        for (let m = 0; m < getAllStations.length; m++) {
            let createOption = document.createElement('option');
            createOption.innerHTML = responseFromFetch[i].Name;
            getAllStations[m].appendChild(createOption);
        }
    }
}

GettingAllStations();
