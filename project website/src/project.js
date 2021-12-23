//#region Getting all stations to display in dropdowns

document.addEventListener('DOMContentLoaded', GettingAllStations);

// Getting all stations from 
let getAllStations = document.querySelectorAll('.all-stations');

async function GettingAllStations(){

    // Getting all stations
    let fetchingAllStations = await fetch( "http://10.101.0.12:8080/stations" );
    let responseFromStationsFetch = await fetchingAllStations.json();

    // For each station, create a new option with the name of the station
    for (let i = 0; i < responseFromStationsFetch.length; i++) {
        // For each select (2), create an option and append the station name
        for (let m = 0; m < getAllStations.length; m++) {
            let createOption = document.createElement('option');
            createOption.innerHTML = responseFromStationsFetch[i].Name;
            getAllStations[m].appendChild(createOption);
        }
    }
    console.log(responseFromStationsFetch);
}

//#endregion

// Getting all input fields on screen
let getStartStation = document.querySelector('#start');
let getEndStation = document.querySelector('#end');
let getDateHTML = document.querySelector('input[type="date"]');
let getTimeHTML = document.querySelector('input[type="time"]');

let getNumStationsOnPath = 0;
let getAllStationsOnPath = null;

//#region Getting all stations on path

async function GetStationsPath(){

    // Fetching/Reponse for the path between start and end station
    let fetchPath = await fetch( "http://10.101.0.12:8080/path/" + getStartStation.value 
        + "/" + getEndStation.value ); 
    let responseFromPathFetch = await fetchPath.json();

    getNumStationsOnPath = responseFromPathFetch.length; // number of stations on path
    getAllStationsOnPath = responseFromPathFetch; // array of station objects on path

    console.log(responseFromPathFetch);
}

//#endregion

let totalDistance = 0; /* CAN DELETE */

// Building array with all stations on path
let array = [];
array.length = getNumStationsOnPath;

//#region Getting distance between start and end station (in km)

async function GetDistanceBetweenStations(){

    let fetchDistance = await fetch ( "http://10.101.0.12:8080/distance/" + getStartStation.value 
        + "/" + getEndStation.value );
    let responseFromDistanceFetch = await fetchDistance.json();
    totalDistance = responseFromDistanceFetch; /* CAN DELETE */

    console.log("Distance between beginning stations: " + responseFromDistanceFetch); /* CAN DELETE */
}

//#endregion

let timee = 0; /* CAN DELETE */

let getStartTripButton = document.querySelector('#submit-btn'); // getting start trip button 

//#region When button is clicked, validate input, call all other methods needed
getStartTripButton.addEventListener('click', async (event) => {

    const minTime = 2, maxTime = 4;

    // Validating if all fields are filled out
    if (getStartStation.value === "" || getEndStation.value === ""
        || getDateHTML.value === "" || getTimeHTML.value === ""){
            alert("Error: Some fields are not filled in.");
            event.preventDefault();
            return;
    }

    // Validating if start and end station are the same (not allowed)
    if (getStartStation.value === getEndStation.value){
        alert("Error: Start station and End station cannot be the same.");
        event.preventDefault();
        return;
    }

    // temp date to validate
    let tempDate = new Date( getDateHTML.value + " " + getTimeHTML.value ); 
    
    // Validating if time is between valid ranges
    if ( tempDate.getHours() >= minTime && tempDate.getHours() <= maxTime ){
        alert("Error: Time must be in the ranges of 0" + minTime + ":00 and 0" + (maxTime + 1)+ ":00.");
        event.preventDefault();
        return;
    }

    console.clear(); // clearing console
    console.log(getTimeHTML.value); /* CAN DELETE */
    timee = 0; /* CAN DELETE */
    ExecuteMethods(); // If all checks out, continue with path
    event.preventDefault();
})

let startStationSchedule = null;
let getHoursFromStation = []; 
let getClosestTime = null;

//#region Calling all methods needed

async function ExecuteMethods(){

    let nowGettingAllStationsOnPath = await GetStationsPath();
    let nowGettingDistanceBetweenStations = await GetDistanceBetweenStations();
    let nowGettingStartStationSchedule = await GetStartStationSchedule();
    let nowGettingDistanceEachStation = await GetDistanceEachStation( getAllStationsOnPath );
}

//#endregion

//#region Getting start station schedule

async function GetStartStationSchedule(){

    // Getting schedule from start station
    let fetchSchedule = await fetch( "http://10.101.0.12:8080/schedule/" + getStartStation.value );
    let responseFromScheduleFetch = await fetchSchedule.json();

    console.log(getAllStationsOnPath);

    // Getting all segments
    let fetchAllSegments = await fetch( "http://10.101.0.12:8080/segments" );
    let responseFromAllSegments = await fetchAllSegments.json();

    console.log(responseFromAllSegments);

    // Getting segment id index of the first station
    let findSegmentIdIndex = getAllStationsOnPath.findIndex(element => element.Name === getStartStation.value);
    // Getting segment id of the first station
    let segmentIdFromStartStation = getAllStationsOnPath[findSegmentIdIndex].SegmentId;
    
    console.log(segmentIdFromStartStation);

    // Getting the start station schedule WITH ONLY the matching segments id's
    startStationSchedule = responseFromScheduleFetch.filter(element => element.SegmentId === segmentIdFromStartStation);

    console.log(startStationSchedule);
    console.log(responseFromScheduleFetch);
    
    let hrs = getTimeHTML.value.split(":")[0]; // getting hours from input time string
    let mins = getTimeHTML.value.split(":")[1]; // getting minutes from input time string

    console.log(getHoursFromStation);

    console.log(hrs);
    console.log(mins);

    GetMatchingHours( hrs );

    let indexOfStartingTime = GetClosestTimeToInputTime( mins );
    
    getClosestTime = getHoursFromStation[indexOfStartingTime]; // setting closest time
    
    console.log(getClosestTime);
}

//#endregion

//#region Get macthing times from temp date and input time

function GetMatchingHours( hrs ){

    // Get the times where the hours match the input time hours
    for (let r = 0; r < startStationSchedule.length; r++) {

        // Splitting the time string to get time after char T
        let getRidOfFront = startStationSchedule[r].Time.toString().split("T");
        // Splitting the time string to get time before char .
        let getRidOfBack = getRidOfFront[1].split(".");

        console.log(getRidOfFront);
        console.log(getRidOfBack);

        // Temp date to get matching time hours
        let dummyDate = new Date(getRidOfFront[0] + " " + getRidOfBack[0]);

        console.log(dummyDate.getHours(), (parseInt(hrs) + 1));
        console.log(dummyDate.toLocaleTimeString("en-GB"), dummyDate, parseInt(hrs), startStationSchedule[r].Time);
        
        // If hours match from temp date and hours from input, push to array
        if (dummyDate.getHours() === parseInt(hrs)){
            console.log(dummyDate.getHours(), parseInt(hrs), startStationSchedule[r].Time, "yes");
            
            getHoursFromStation.push(getRidOfFront[0] + " " + getRidOfBack[0]);
        }
        // Getting the first time for the next hour (in case input hour is that last for that hour)  
        else if (dummyDate.getHours() === (parseInt(hrs) + 1)){
            console.log(dummyDate.getHours(), parseInt(hrs), startStationSchedule[r].Time, "yes");
            
            getHoursFromStation.push(getRidOfFront[0] + " " + getRidOfBack[0]);
            return;
        }
    }
}

//#region Getting closest time to input time

function GetClosestTimeToInputTime( mins ){

    let indexOfStartingTime = -1;
    let currentClosest = null;

    // Getting closest time to input time
    for (let t = 0; t < getHoursFromStation.length; t++) {

        // Creating date from current station on path
        let newDateInArray = new Date(getHoursFromStation[t]);

        console.log(newDateInArray, getTimeHTML.value);

        // Intializing currentClosest to large number
        if (t === 0){
            currentClosest = 100;
        }
        
        console.log(parseInt(mins), newDateInArray.getMinutes());

        // If the times match (time to leave now), return the current index
        if (parseInt(mins) === newDateInArray.getMinutes()){
            return t;
        }
        else{
            // Getting the difference in minutes from input time and current temp date
            let dateDiff = (parseInt(mins) - newDateInArray.getMinutes());

            // If difference is negative, return index (meaning next closest time)
            // OR If the time is in the next hour, return index
            if(dateDiff < 0 || t === (getHoursFromStation.length - 1)){
                return t;
            }
            // If closest time is greater than the difference, set current closest to difference
            if (currentClosest > dateDiff){
                currentClosest = dateDiff;
                indexOfStartingTime = t;
            }
        }
    }
    return indexOfStartingTime;
}

//#endregion

async function GetDistanceEachStation( stationsOnPath ){
    let counter = 0;
    console.log(stationsOnPath);
    for (let i = 0; i < stationsOnPath.length; i++) {
        
        let timeDate = new Date(getClosestTime);
        
        if (i === 0){
            let splittingByColon = timeDate.toLocaleTimeString("en-GB").toString().split(":");
            let newFormatedTime = splittingByColon[0] + ":" + splittingByColon[1];

            let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                stationsOnPath[i].Name, newFormatedTime);
            array.push(newStationClass);
        }
        else if(i >= 1){
            let fetchDistance = await fetch ( "http://10.101.0.12:8080/distance/" + stationsOnPath[i - 1].Name
             + "/" + stationsOnPath[i].Name );
            let responseFromFetch = await fetchDistance.json();
            console.log("response "+ responseFromFetch);
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

            console.log(stationsOnPath.length);
            console.log(stationsOnPath[i]);
            console.log(i);
            console.log(array);
            console.log(array[i - 1]);

            timeDate = new Date(getDateHTML.value + " " + array[i - 1].time)
            timeDate.setMinutes( timeDate.getMinutes() + Math.ceil(getTimeTaken) )
            let formatTime = timeDate.toLocaleTimeString("en-GB");
            let splittingByColon = formatTime.toString().split(":");
            let newFormatedTime = splittingByColon[0] + ":" + splittingByColon[1];
            console.log(formatTime);
            
            console.log("Time between stations: " + getTimeTaken);

            timee+=getTimeTaken;

            console.log("time " + timee);

            if (getAllStationsOnPath[i].StationId !== getAllStationsOnPath[i - 1].StationId){
                let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                    stationsOnPath[i].Name, newFormatedTime);
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

let isDifferent = false;
let isFirstRow = false;

function CreateGrid(){

    let getGrid = document.querySelector('.grid-container');
    getGrid.style.gridTemplateRows = "repeat(" + (array.length + 1) + ", 100px )";
    let getNumberOfColumns = window.getComputedStyle(getGrid).getPropertyValue("grid-template-columns").split(" ").length;
    
    let columnTitles = [ "Station Name", "Path", "Arrival Time", "Information", "Notifications" ];
    //let columnTitlesHeight = [ "30%", "100%", "62%", "63%", "60%" ];

    for (let l = 0; l < getNumberOfColumns; l++) {
        let currentTitleElement = document.createElement('h5');
        currentTitleElement.innerHTML = columnTitles[l];
        currentTitleElement.style.fontSize = "15.5px";
        currentTitleElement.style.gridRow = 1;
        //currentTitleElement.style.borderBottom = "3px solid black";
        currentTitleElement.style.gridColumn = (l + 1);

        if (l === 0){
            currentTitleElement.style.textAlign = "end";
            currentTitleElement.style.placeSelf = "end end";
            currentTitleElement.style.marginRight = "30px";
        }
        else if (l === 2){
            currentTitleElement.style.textAlign = "start";
            currentTitleElement.style.placeSelf = "end start";
            currentTitleElement.style.marginLeft = "10px";
        }
        else{
            currentTitleElement.style.textAlign = "center";
            currentTitleElement.style.placeSelf = "end center";
        }
        currentTitleElement.style.textDecoration = "underline";
        currentTitleElement.style.marginBottom = "30px";
        getGrid.appendChild(currentTitleElement);
    }

    for (let i = 1; i <= array.length; i++) {
        let theName = document.createElement("div");

        if(i === 1){
            theName.innerHTML = "Start at " + array[i - 1].name;
        }
        else if (i === (array.length)){
            theName.innerHTML = "Arrive at " + array[i - 1].name;
        }
        else{
            theName.innerHTML = array[i - 1].name;
        }
        
        theName.style.gridRow = (i + 1);
        theName.style.gridColumn = 1;
        theName.style.textAlign = "end";
        theName.style.fontSize = "14.75px";
        getGrid.appendChild(theName);

        let theTime = document.createElement("div");
        theTime.innerHTML = array[i - 1].time;
        theTime.style.gridRow = (i + 1);
        theTime.style.gridColumn = 3;
        theTime.style.fontSize = "14.75px";
        theTime.style.marginLeft = "15px";
        getGrid.appendChild(theTime);

        if (i === 1){
            theName.style.gridRowGap = "30px";
            theTime.style.gridRowGap = "30px";
            isFirstRow = true;
        }
        else{
            isFirstRow = false;
        }

        if(i > 1){
            if (array[i - 1].SegmentId !== array[i - 2].SegmentId){
                isDifferent = true;
            }
        }

        if (i !== (array.length)){
            CreateLine( getGrid, i, isDifferent, isFirstRow );
        }
        CreateRectangle( getGrid, i, isDifferent, isFirstRow );
    }
    
}
function CreateLine( getGrid, i, isDifferent, isFirstRow ){
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
    if(isFirstRow){
        createCanvas.style.gridRowGap = "30px";
    }

    canvas2d.stroke();
    document.body.appendChild(createCanvas);
    createCanvas.style.gridColumn = 2;
    createCanvas.style.gridRow = (i + 1);
    createCanvas.style.marginLeft = "40%";
    getGrid.appendChild(createCanvas);
}
function CreateRectangle( getGrid, i, isDifferent, isFirstRow ){
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
    if(isFirstRow){
        createCanvas.style.gridRowGap = "30px";
    }
    
    canvas2d.fillRect(0,0,7,7)
    document.body.appendChild(createCanvas);
    createCanvas.style.gridColumn = 2;
    createCanvas.style.gridRow = (i + 1);
    createCanvas.style.marginLeft = "37%";
    createCanvas.style.zIndex = 10;
    getGrid.appendChild(createCanvas);
}
