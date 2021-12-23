
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
    console.log(responseFromFetch);
}

GettingAllStations();

let getStartStation = document.querySelector('#start');
let getEndStation = document.querySelector('#end');
let getDateHTML = document.querySelector('input[type="date"]');
let getTimeHTML = document.querySelector('input[type="time"]');

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
    // GetDistanceEachStation( responseFromFetch );
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
let getTimeFromInput = null;

let getStartTripButton = document.querySelector('#submit-btn');
getStartTripButton.addEventListener('click', async (event) => {

    if (getStartStation.value === "" || getEndStation.value === ""
        || getDateHTML.value === "" || getTimeHTML.value === ""){
            alert("Error: some fields are not filled in.");
            event.preventDefault();
            return;
    }

    let testDate = new Date( getDateHTML.value + " " + getTimeHTML.value );
    
    if ( testDate.getHours() >= 2 && testDate.getHours() <= 4 ){
        alert("Error: Time must be in the ranges of 02:00 and 05:00.");
        event.preventDefault();
        return;
    }

    if (getStartStation.value === getEndStation.value){
        alert("Start station and End station cannot be the same!");
        event.preventDefault();
        return;
    }
    getTimeFromInput = document.querySelector('input[type="time"]');

    console.clear();
    console.log(getTimeHTML.value);
    timee = 0;
    // let nowGettingAllStationsOnPath = await GetStationsPath();
    // let nowGettingDistanceBetweenStations = await GetDistanceBetweenStations();
    // let nowGettingStartStationSchedule = await GetStartStationSchedule();
    // let nowGettingDistanceEachStation = await GetDistanceEachStation( getAllStationsOnPath );
    ExecuteMethods();
    event.preventDefault();
})

let startStationSchedule = null;
let getHoursFromStation = []; 
let getClosestTime = null;

async function ExecuteMethods(){

    let nowGettingAllStationsOnPath = await GetStationsPath();
    let nowGettingDistanceBetweenStations = await GetDistanceBetweenStations();
    let nowGettingStartStationSchedule = await GetStartStationSchedule();
    let nowGettingDistanceEachStation = await GetDistanceEachStation( getAllStationsOnPath );
}

async function GetStartStationSchedule(){

    let fetchSchedule = await fetch( "http://10.101.0.12:8080/schedule/" + getStartStation.value );
    let responseFromFetch = await fetchSchedule.json();

    // Getting the promise for the fetch
    let fetchAllStations = await fetch( "http://10.101.0.12:8080/stations" );
    // Getting the response json from the json promise
    let responseAllStations = await fetchAllStations.json();

    let indexOfStartStation = responseAllStations.findIndex(element => element.Name === getStartStation.value );
    let stationIdOfStartStation = responseAllStations[indexOfStartStation].StationId;
    console.log(stationIdOfStartStation);
    let indexOfEndStation = responseAllStations.findIndex(element => element.Name === getEndStation.value );
    let stationIdOfEndStation = responseAllStations[indexOfEndStation].StationId;
    console.log(stationIdOfEndStation);
    console.log(getAllStationsOnPath);

    let fetchAllSegments = await fetch( "http://10.101.0.12:8080/segments" );
    // Getting the response json from the json promise
    let responseFromAllSegments = await fetchAllSegments.json();
    console.log(responseFromAllSegments);

    let findSegmentIdIndex = getAllStationsOnPath.findIndex(element => element.Name === getStartStation.value);
    let segmentIdFromStartStation = getAllStationsOnPath[findSegmentIdIndex].SegmentId;
    console.log(segmentIdFromStartStation);

  

    startStationSchedule = responseFromFetch.filter(element => element.SegmentId === segmentIdFromStartStation);
    console.log(startStationSchedule);

    console.log(responseFromFetch);

    let indexOfStartingTime = null;
    let currentClosest = null;

    let hrs = getTimeFromInput.value.split(":")[0];
    let mins = getTimeFromInput.value.split(":")[1];

    for (let r = 0; r < startStationSchedule.length; r++) {

        let getRidOfFront = startStationSchedule[r].Time.toString().split("T");
        let getRidOfBack = getRidOfFront[1].split(".");
        console.log(getRidOfFront);
        console.log(getRidOfBack);

        let dummyDate = new Date(getRidOfFront[0] + " " + getRidOfBack[0]);
        console.log(dummyDate.getHours(), (parseInt(hrs) + 1));
        console.log(dummyDate.toLocaleTimeString("en-GB"), dummyDate, parseInt(hrs), startStationSchedule[r].Time);
        
        if (dummyDate.getHours() === parseInt(hrs)){
            console.log(dummyDate.getHours(), parseInt(hrs), startStationSchedule[r].Time, "yes");
            getHoursFromStation.push(getRidOfFront[0] + " " + getRidOfBack[0]);
        }
        else if (dummyDate.getHours() === (parseInt(hrs) + 1)){
            console.log(dummyDate.getHours(), parseInt(hrs), startStationSchedule[r].Time, "yes");
            getHoursFromStation.push(getRidOfFront[0] + " " + getRidOfBack[0]);
            break;
        }
    }
    
    console.log(getHoursFromStation);

    console.log(hrs);
    console.log(mins);

    let dateFromTimeValue = new Date( getTimeFromInput);
        console.log(dateFromTimeValue.getTime() );

    for (let t = 0; t < getHoursFromStation.length; t++) {

        let newDateInArray = new Date(getHoursFromStation[t]);
        let dateAsString = newDateInArray.toLocaleTimeString("en-GB");
        console.log(newDateInArray, getTimeFromInput.value);

        if (t === 0){
            currentClosest = 100;
        }
        
        console.log(parseInt(mins), newDateInArray.getMinutes());
        if (parseInt(mins) === newDateInArray.getMinutes()){
            indexOfStartingTime = t;
            break;
        }
        else{
            let dateDiff = (parseInt(mins) - newDateInArray.getMinutes());

            if(dateDiff < 0){
                indexOfStartingTime = t;
                break;
            }
            if (t === (getHoursFromStation.length - 1)){
                indexOfStartingTime = t;
                break;
            }
            if (currentClosest > dateDiff){
                currentClosest = dateDiff;
                indexOfStartingTime = t;
            }
        }
    }
    getClosestTime = getHoursFromStation[indexOfStartingTime];
    console.log(getClosestTime);
}

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

class Station
{
    constructor ( stationId, segmentId, name, time )
    {
        this.name = name;
        this.time = time;
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