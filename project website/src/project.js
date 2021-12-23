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
    
    console.log(responseFromStationsFetch); // for my own use
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

    console.log(responseFromPathFetch); // for my own use
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

    // for my own use
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

    // Getting all segments
    let fetchAllSegments = await fetch( "http://10.101.0.12:8080/segments" );
    let responseFromAllSegments = await fetchAllSegments.json();

    // Getting segment id index of the first station
    let findSegmentIdIndex = getAllStationsOnPath.findIndex(element => element.Name === getStartStation.value);
    // Getting segment id of the first station
    let segmentIdFromStartStation = getAllStationsOnPath[findSegmentIdIndex].SegmentId;

    // Getting the start station schedule WITH ONLY the matching segments id's
    startStationSchedule = responseFromScheduleFetch.filter(element => element.SegmentId === segmentIdFromStartStation);
    
    let hrs = getTimeHTML.value.split(":")[0]; // getting hours from input time string
    let mins = getTimeHTML.value.split(":")[1]; // getting minutes from input time string

    GetMatchingHours( hrs );

    let indexOfStartingTime = GetClosestTimeToInputTime( mins );
    
    getClosestTime = getHoursFromStation[indexOfStartingTime]; // setting closest time
    
    // for my own use
    console.log(getAllStationsOnPath);
    console.log(responseFromAllSegments);
    console.log(segmentIdFromStartStation);
    console.log(startStationSchedule);
    console.log(responseFromScheduleFetch);
    console.log(getHoursFromStation);
    console.log(hrs);
    console.log(mins);
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

        // Temp date to get matching time hours
        let dummyDate = new Date(getRidOfFront[0] + " " + getRidOfBack[0]);
        
        // If hours match from temp date and hours from input, push to array
        if (dummyDate.getHours() === parseInt(hrs)){            
            getHoursFromStation.push(getRidOfFront[0] + " " + getRidOfBack[0]);
        }
        // Getting the first time for the next hour (in case input hour is that last for that hour)  
        else if (dummyDate.getHours() === (parseInt(hrs) + 1)){
            getHoursFromStation.push(getRidOfFront[0] + " " + getRidOfBack[0]);
            return;
        }

        // for my own use
        console.log(getRidOfFront);
        console.log(getRidOfBack);
        console.log(dummyDate.getHours(), (parseInt(hrs) + 1));
        console.log(dummyDate.toLocaleTimeString("en-GB"), dummyDate, parseInt(hrs), startStationSchedule[r].Time);
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

        // Intializing currentClosest to large number
        if (t === 0){
            currentClosest = 100;
        }

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

        // for my own use
        console.log(newDateInArray, getTimeHTML.value);
        console.log(parseInt(mins), newDateInArray.getMinutes()); 
    }
    return indexOfStartingTime;
}

//#endregion

//#region Getting the distance between each station on the path

async function GetDistanceEachStation( stationsOnPath ){

    console.log(stationsOnPath); // for my own use

    let counter = 0; // for my own use
    
    for (let i = 0; i < stationsOnPath.length; i++) {
        
        // Creating date from the closest time to the input time
        let timeDate = new Date(getClosestTime);
        
        // If first index, start at closest time
        if (i === 0){
            // Formating time
            let splittingByColon = timeDate.toLocaleTimeString("en-GB").toString().split(":");
            let newFormatedTime = splittingByColon[0] + ":" + splittingByColon[1];

            // Start at closest time
            let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                stationsOnPath[i].Name, newFormatedTime);
            array.push(newStationClass);
        }
        // Add times to previous times
        else if(i >= 1){
            // Fetching distance between current and previous station
            let fetchDistance = await fetch ( "http://10.101.0.12:8080/distance/" + stationsOnPath[i - 1].Name
                + "/" + stationsOnPath[i].Name );
            let responseFromFetch = await fetchDistance.json();

            // Fetching average speed for trains
            let fetchSpeed = await fetch( "http://10.101.0.12:8080/averageTrainSpeed" );
            let newresponse = await fetchSpeed.json();

            // Getting average speed
            let averageSpeed = newresponse[0].AverageSpeed;

            // Each minute for an hour, the train goes ... km/min
            let getSpeedInMinutesForHour = averageSpeed/60;
            let getTimeTaken = (responseFromFetch/averageSpeed) * 60;

            // setting new added minutes from time between stations
            timeDate = new Date(getDateHTML.value + " " + array[i - 1].time)
            timeDate.setMinutes( timeDate.getMinutes() + Math.ceil(getTimeTaken) )
            
            // Formating time to just show hours and minutes
            let formatTime = timeDate.toLocaleTimeString("en-GB");
            let splittingByColon = formatTime.toString().split(":");
            let newFormatedTime = splittingByColon[0] + ":" + splittingByColon[1];

            // If there's not a duplicate (back-to-back) station, add to array
            if (getAllStationsOnPath[i].StationId !== getAllStationsOnPath[i - 1].StationId){
                let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                    stationsOnPath[i].Name, newFormatedTime);
                array.push(newStationClass);
            }

            // for my own use
            counter+=responseFromFetch;
            timee+=getTimeTaken;

            // Logs for my own use
            console.log("response "+ responseFromFetch);
            console.log("Distance " + stationsOnPath[i - 1].Name + " and " +
                stationsOnPath[i].Name + ": " + responseFromFetch);
            console.log("counter " + counter);
            console.log("distance left: " + (totalDistance - counter));
            console.log("speed " + averageSpeed);
            console.log("Average minute speed: " + getSpeedInMinutesForHour);
            console.log("Time between stations: " + getTimeTaken);
            console.log("time " + timee);
        }
    }
    // Logs for my own use
    console.log("final counter " + counter);
    console.log("final time " + timee);
    console.log(array);
    console.log(getAllStationsOnPath);

    CreateGrid();
}

//#endregion

let isDifferent = false;
let getGrid = document.querySelector('.grid-container');

//#region Creating Grid

function CreateGrid(){

    // Setting how many rows in grid (number of stations on path)
    getGrid.style.gridTemplateRows = "repeat(" + (array.length + 1) + ", 100px )";
    // Getting number of columns for grid
    let getNumberOfColumns = window.getComputedStyle(getGrid).getPropertyValue("grid-template-columns").split(" ").length;
    let columnTitles = [ "Station Name", "Path", "Arrival Time", "Information", "Notifications" ];

    CreateDetailsForColumnTitles( getNumberOfColumns, columnTitles );

    CreateNameAndTime();
}

//#endregion

//#region Creating details for each column in grid

function CreateDetailsForColumnTitles( getNumberOfColumns, columnTitles ){

    const firstColumn = 0, thirdColumn = 2;

    // Create all titles for each column in grid
    for (let l = 0; l < getNumberOfColumns; l++) {

        // Creating details for each column title
        let currentTitleElement = document.createElement('h5');
        currentTitleElement.innerHTML = columnTitles[l];
        currentTitleElement.style.fontSize = "15.5px";
        currentTitleElement.style.gridRow = 1;
        currentTitleElement.style.gridColumn = (l + 1);

        // Positioning title
        if (l === firstColumn){
            currentTitleElement.style.textAlign = "end";
            currentTitleElement.style.placeSelf = "end end";
            currentTitleElement.style.marginRight = "30px";
        }
        // Positioning title
        else if (l === thirdColumn){
            currentTitleElement.style.textAlign = "start";
            currentTitleElement.style.placeSelf = "end start";
            currentTitleElement.style.marginLeft = "10px";
        }
        // Positioning title
        else{
            currentTitleElement.style.textAlign = "center";
            currentTitleElement.style.placeSelf = "end center";
        }

        currentTitleElement.style.textDecoration = "underline";
        currentTitleElement.style.marginBottom = "30px";
        getGrid.appendChild(currentTitleElement);
    }
}

//#endregion

//#region Creating name and time and canvas details for grid

function CreateNameAndTime(){

    for (let i = 1; i <= array.length; i++) {

        // Creating details to display station name
        let theName = document.createElement("div");

        // If start station
        if(i === 1){
            theName.innerHTML = "Start at " + array[i - 1].name;
        }
        // If end station
        else if (i === (array.length)){
            theName.innerHTML = "Arrive at " + array[i - 1].name;
        }
        // If normal station on path
        else{
            theName.innerHTML = array[i - 1].name;
        }
        
        theName.style.gridRow = (i + 1);
        theName.style.gridColumn = 1;
        theName.style.textAlign = "end";
        theName.style.fontSize = "14.75px";
        getGrid.appendChild(theName);

        // Creating details to display time
        let theTime = document.createElement("div");
        theTime.innerHTML = array[i - 1].time;
        theTime.style.gridRow = (i + 1);
        theTime.style.gridColumn = 3;
        theTime.style.fontSize = "14.75px";
        theTime.style.marginLeft = "15px";
        getGrid.appendChild(theTime);

        if(i > 1){
            // If the segment id is different to the previous, set to true (changing segments)
            if (array[i - 1].SegmentId !== array[i - 2].SegmentId){
                isDifferent = true;
            }
        }

        // If it's the last index, don't create extra line,
        // else, create the line between stations
        if (i !== (array.length)){
            CreateLine( i, isDifferent );
        }
        CreateRectangle( i, isDifferent );
    }
}

//#endregion

//#region Creating line between stations

function CreateLine( i, isDifferent ){
    // Creating canvas and canvas details
    let createCanvas = document.createElement('canvas');
    SettingCanvasWidthHeight( createCanvas );
    let canvas2d = createCanvas.getContext('2d');
    canvas2d.beginPath();
    canvas2d.moveTo(2,0);
    canvas2d.lineWidth = 2;
    canvas2d.lineTo(0, 300);
    canvas2d.stroke();
    
    CreatingCanvasDetails( createCanvas, canvas2d, i, isDifferent, "40%" );
}

//#endregion

//#region Creating Rectangle (dot point for each station)

function CreateRectangle( i, isDifferent ){
    // Creating canvas and canvas details
    let createCanvas = document.createElement('canvas');
    SettingCanvasWidthHeight( createCanvas );
    let canvas2d = createCanvas.getContext('2d');
    canvas2d.fillRect(0,0,7,7);

    CreatingCanvasDetails( createCanvas, canvas2d, i, isDifferent, "37%" )
}

//#endregion

//#region Setting canvas width/height

function SettingCanvasWidthHeight( createCanvas ){

    createCanvas.width = 30;
    createCanvas.height = 100;
}

//#endregion

//#region Creating details for canvas (line and dot)

function CreatingCanvasDetails ( createCanvas, canvas2d, i, isDifferent, value ){

    // If the segment is different, change the color to blue; else, keep black
    if (isDifferent) {
        canvas2d.fillStyle = "#1F06FE";
    }
    else{
        canvas2d.fillStyle = "black";
    } 

    document.body.appendChild(createCanvas);
    createCanvas.style.gridColumn = 2;
    createCanvas.style.gridRow = (i + 1);
    createCanvas.style.marginLeft = value;
    getGrid.appendChild(createCanvas);
}

//#endregion