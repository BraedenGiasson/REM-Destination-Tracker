
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

let getStartStation = document.querySelector('#start');
let getEndStation = document.querySelector('#end');

let getNumStationsOnPath = 0;
let getAllStationsOnPath = null;

async function GetStationsPath(){

    // let fetching = await fetch( "http://10.101.0.12:8080/schedule/Brossard" );
    // let fetching = await fetch( " http://10.101.0.12:8080/notifications/22" );
    // let fetching = await fetch( " http://10.101.0.12:8080/schedule/Sainte-Dorothée" );
    // let fetching = await fetch( " http://10.101.0.12:8080/distance/Sainte-Dorothée/Bois-Franc" );
    let fetching = await fetch( "http://10.101.0.12:8080/path/" + getStartStation.value 
    + "/" + getEndStation.value ); 
    let responseFromFetch = await fetching.json();

    getNumStationsOnPath = responseFromFetch.length;

    getAllStationsOnPath = responseFromFetch;

    console.log(responseFromFetch);
    GetDistanceEachStation( responseFromFetch );
}
let totalDistance = 0;
let array = [];
array.length = getNumStationsOnPath;

async function GetDistanceBetweenStations(){

    let fetchDistance = await fetch ( "http://10.101.0.12:8080/distance/" + getStartStation.value 
    + "/" + getEndStation.value );
    let responseFromFetch = await fetchDistance.json();
    totalDistance = responseFromFetch;

    console.log("Distance between beginning stations: " + responseFromFetch);
}

let timee = 0;

let getStartTripButton = document.querySelector('#submit-btn');
getStartTripButton.addEventListener('click', (event) => {
    console.log(document.querySelector('input[type="time"]').value);
    console.clear();
    timee = 0;
    GetStationsPath();
    GetDistanceBetweenStations();
    GetStartStationSchedule();
    event.preventDefault();
})

async function GetStartStationSchedule(){

    let fetchSchedule = await fetch( "http://10.101.0.12:8080/schedule/" + getStartStation.value );
    let responseFromFetch = await fetchSchedule.json();

    console.log(responseFromFetch);
}

async function GetDistanceEachStation( stationsOnPath ){
    let counter = 0;
    console.log(stationsOnPath);
    for (let i = 0; i < stationsOnPath.length; i++) {
        
        if (i == 0){
            let fetchDistance = await fetch ( "http://10.101.0.12:8080/distance/" + stationsOnPath[i].Name 
            + "/" + stationsOnPath[i + 1].Name );
            let responseFromFetch = await fetchDistance.json();

            console.log("Distance " + stationsOnPath[i].Name + " and " +
            stationsOnPath[i + 1].Name + ": " + responseFromFetch);

            counter += responseFromFetch;

            console.log("counter " + counter);

            console.log("distance left: " + (totalDistance - counter));

            let fetchSpeed = await fetch( "http://10.101.0.12:8080/averageTrainSpeed" );
            let newresponse = await fetchSpeed.json();

            let newResult = newresponse[0].AverageSpeed;
            console.log("speed " + newResult);

            // Each minute for an hour, the train goes ... km/min
            let getSpeedInMinutesForHour = newResult/60;

            console.log("Average minute speed: " + getSpeedInMinutesForHour);

            let getTimeTaken = (responseFromFetch/newResult) * 60;
            
            console.log("Time between stations: " + getTimeTaken);

            timee+=getTimeTaken;

            console.log("time " + timee);

            let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                stationsOnPath[i + 1].Name, getTimeTaken);
            array.push(newStationClass);
        }
        else if(i > 1){
            let fetchDistance = await fetch ( "http://10.101.0.12:8080/distance/" + stationsOnPath[i - 1].Name 
            + "/" + stationsOnPath[i].Name );
            let responseFromFetch = await fetchDistance.json();
 
            console.log("Distance " + stationsOnPath[i - 1].Name + " and " +
            stationsOnPath[i].Name + ": " + responseFromFetch);

            counter+=responseFromFetch;

            console.log("counter " + counter);

            console.log("distance left: " + (totalDistance - counter));

            let fetchSpeed = await fetch( "http://10.101.0.12:8080/averageTrainSpeed" );
            let newresponse = await fetchSpeed.json();

            let newResult = newresponse[0].AverageSpeed;
            console.log("speed " + newResult);

            // Each minute for an hour, the train goes ... km/min
            let getSpeedInMinutesForHour = newResult/60;

            console.log("Average minute speed: " + getSpeedInMinutesForHour);

            let getTimeTaken = (responseFromFetch/newResult) * 60;
            
            console.log("Time between stations: " + getTimeTaken);

            timee+=getTimeTaken;

            console.log("time " + timee);

            if (getAllStationsOnPath[i].StationId !== getAllStationsOnPath[i - 1].StationId){
                let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                    stationsOnPath[i].Name, getTimeTaken);
                array.push(newStationClass);
            }
        }
    }
    console.log("final counter " + counter);
    console.log("final time " + timee);

    console.log(array);
    CreateGrid();
    console.log(getAllStationsOnPath);
}

async function CalculateTime( distance ){

    let fetchSpeed = await fetch( "http://10.101.0.12:8080/averageTrainSpeed" );
    let responseFromFetch = await fetchSpeed.json();

    let newResult = responseFromFetch[0].AverageSpeed;
    console.log("speed " + newResult);

    // Each minute for an hour, the train goes ... km/min
    let getSpeedInMinutesForHour = newResult/60;

    console.log("Average minute speed: " + getSpeedInMinutesForHour);

    let getTimeTaken = distance * getSpeedInMinutesForHour;
    
    console.log("Time between stations: " + getTimeTaken);

    timee+=getTimeTaken;

    console.log("time " + timee);
}

let isDifferent = false;
function CreateGrid(){

    let getGrid = document.querySelector('.grid-container');
    getGrid.style.gridTemplateRows = "repeat(" + getNumStationsOnPath + ", 100px )";
    console.log(getGrid.style.gridTemplateRows.length);
    // let isDifferent = false;

    for (let i = 0; i < array.length; i++) {
        let theName = document.createElement("div");
        theName.innerHTML = array[i].name;
        theName.style.gridRow = (i + 1);
        theName.style.gridColumn = 1;
        theName.style.textAlign = "end";
        getGrid.appendChild(theName);

        let theTime = document.createElement("div");
        theTime.innerHTML = array[i].time;
        theTime.style.gridRow = (i + 1);
        theTime.style.gridColumn = 3;
        getGrid.appendChild(theTime);

        if(i > 0){
            if (array[i].SegmentId !== array[i - 1].SegmentId){
                isDifferent = true;
            }
        }

        CreateLine( getGrid, i, isDifferent );
        CreateRectangle( getGrid, i, isDifferent );

        //let createCanvas = document.createElement('canvas');
        // createCanvas.width = 30;
        // createCanvas.height = 100;
        // let canvas2d = createCanvas.getContext('2d');
        // canvas2d.beginPath();
        // canvas2d.moveTo(0,0);
        // canvas2d.lineTo(0, 300);
        // canvas2d.stroke();
        
        // let canvas2d = createCanvas.getContext('2d');
        // canvas2d.fillStyle = "blue";
        // canvas2d.fillRect(20,20,5,5)
        // //canvas2d.fill();
        // document.body.appendChild(createCanvas);
        // createCanvas.style.gridColumn = 2;
        // createCanvas.style.gridRow = (i + 1);
        // getGrid.appendChild(createCanvas);
        

        /*let createCanvas = document.createElement('canvas');
        createCanvas.width = 30;
        createCanvas.height = 30;
        let canvas2d = createCanvas.getContext('2d');
        let x = createCanvas.width / 2;
        let y = createCanvas.height / 2;
        let radius = 45;
        canvas2d.beginPath();
        canvas2d.arc(createCanvas.width, createCanvas.height, radius,0, 2 * Math.PI, false);
        canvas2d.lineWidth = 3;
        canvas2d.strokeStyle = '#FF0000';
        canvas2d.stroke();
        document.body.appendChild(createCanvas);
        createCanvas.style.gridColumn = 2;
        createCanvas.style.gridRow = (i + 1);
        getGrid.appendChild(createCanvas);*/
    }
    
}
function CreateLine( getGrid, i, isDifferent ){
    let createCanvas = document.createElement('canvas');
    createCanvas.width = 30;
    createCanvas.height = 100;
    let canvas2d = createCanvas.getContext('2d');
    canvas2d.beginPath();
    canvas2d.moveTo(2,0);
    canvas2d.lineWidth = 2;
    canvas2d.lineTo(0, 300);

    if (isDifferent){
        canvas2d.strokeStyle = "#1F06FE";
    }
    else{
        canvas2d.strokeStyle = "black";
    }

    canvas2d.stroke();
    document.body.appendChild(createCanvas);
    createCanvas.style.gridColumn = 2;
    createCanvas.style.gridRow = (i + 1);
    createCanvas.style.marginLeft = "40%";
    getGrid.appendChild(createCanvas);
}
function CreateRectangle( getGrid, i, isDifferent ){
    let createCanvas = document.createElement('canvas');
    createCanvas.width = 30;
    createCanvas.height = 100;
    let canvas2d = createCanvas.getContext('2d');

    if (isDifferent) {
        canvas2d.fillStyle = "#1F06FE";
    }
    else{
        canvas2d.fillStyle = "black";
    }
    
    canvas2d.fillRect(0,0,7,7)
    document.body.appendChild(createCanvas);
    createCanvas.style.gridColumn = 2;
    createCanvas.style.gridRow = (i + 1);
    createCanvas.style.marginLeft = "37%";
    createCanvas.style.zIndex = 10;
    getGrid.appendChild(createCanvas);
}

class Station
{
    constructor ( stationId, segmentId, name, time )
    {
        this.name = name;
        this.time = time.toFixed(2);
        this.stationId = stationId;
        this.segmentId = segmentId;
    }
    get Name(){
        return this.name;
    }
    get Time(){
        return this.time;
    }
    get StationId(){
        return this.stationId;
    }
    get SegmentId(){
        return this.segmentId;
    }
}