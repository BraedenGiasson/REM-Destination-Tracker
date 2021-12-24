
//let nearest = require('../../node_modules/nearest-date'); // getting package
// import nearest from '../package-lock.json'; // getting package


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

let totalDistance = 0; 

// Building array with all stations on path
let arrayOfStationsOnPath = [];
arrayOfStationsOnPath.length = getNumStationsOnPath;

//#region Getting distance between start and end station (in km)

async function GetDistanceBetweenStations(){

    let fetchDistance = await fetch ( "http://10.101.0.12:8080/distance/" + getStartStation.value 
        + "/" + getEndStation.value );
    let responseFromDistanceFetch = await fetchDistance.json();
    totalDistance = responseFromDistanceFetch; 

    // for my own use
    console.log("Distance between beginning stations: " + responseFromDistanceFetch); 
}

//#endregion

let timee = 0; 

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
    console.log(getTimeHTML.value); 
    timee = 0; 

    ExecuteMethods(); // If all checks out, continue with path
    event.preventDefault();
})

let startStationSchedule = null;
let getHoursFromStation = []; 
let getClosestTime = null;
let getNewHoursFromStation = [];
let newClosestTime = null;

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

    GetMatchingHours( hrs, startStationSchedule, getHoursFromStation );

    let indexOfStartingTime = GetClosestTimeToInputTime( mins, getHoursFromStation );
    
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

function GetMatchingHours( theHours, theSchedule, arrayToAddTo ){

    console.log(theHours);
    // Get the times where the hours match the input time hours
    for (let r = 0; r < theSchedule.length; r++) {

        // Splitting the time string to get time after char T
        let getRidOfFront = theSchedule[r].Time.toString().split("T");
        // Splitting the time string to get time before char .
        let getRidOfBack = getRidOfFront[1].split(".");

        // Temp date to get matching time hours
        let dummyDate = new Date(getRidOfFront[0] + " " + getRidOfBack[0]);
        
        // If hours match from temp date and hours from input, push to array
        if (dummyDate.getHours() === parseInt(theHours)){            
            arrayToAddTo.push(getRidOfFront[0] + " " + getRidOfBack[0]);
        }
        // Getting the first time for the next hour (in case input hour is that last for that hour)  
        else if (dummyDate.getHours() === (parseInt(theHours) + 1)){
            arrayToAddTo.push(getRidOfFront[0] + " " + getRidOfBack[0]);
            console.log(arrayToAddTo);
            return;
        }

        // for my own use
        console.log(getRidOfFront);
        console.log(getRidOfBack);
        console.log(dummyDate.getHours(), (parseInt(theHours) + 1));
        console.log(dummyDate.toLocaleTimeString("en-GB"), dummyDate, parseInt(theHours), theSchedule[r].Time);
    }
}

//#endregion

//#region Getting closest time to input time
function GetClosestTimeToInputTime( mins, arrayToAddTo ){

    let indexOfStartingTime = -1;
    let currentClosest = null;

    // Getting closest time to input time
    for (let t = 0; t < arrayToAddTo.length; t++) {

        // Creating date from current station on path
        let newDateInArray = new Date(arrayToAddTo[t]);

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
            if(dateDiff < 0 || t === (arrayToAddTo.length - 1)){
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

let isSwitchedSegment = false;
let isFirstStationOnNewSegment = false;

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

            // adding to array
            let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                stationsOnPath[i].Name, newFormatedTime);
            arrayOfStationsOnPath.push(newStationClass);
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

            console.log(isSwitchedSegment); // Logs for my own use

            // If there's not a duplicate (back-to-back) station, add to array
            if (getAllStationsOnPath[i].StationId !== getAllStationsOnPath[i - 1].StationId){

                // Checking if switched segment
                if(isSwitchedSegment){

                    // Creating date from the closest time to the input time
                    let newTimeDate = new Date(newClosestTime);
                   
                    // setting new added minutes from time between stations
                    // If it's first station on segment, new date with closest time
                    if (isFirstStationOnNewSegment){
                        newTimeDate = new Date(newClosestTime);
                        isFirstStationOnNewSegment = false;
                    }
                    // If it's not first station on segment
                    else{
                        newTimeDate = new Date(getDateHTML.value + " " + arrayOfStationsOnPath[i - 2].time);
                    }
                   
                    // adding minutes to time
                    newTimeDate.setMinutes( newTimeDate.getMinutes() + Math.ceil(getTimeTaken) )
                    
                    // Formating time to just show hours and minutes
                    let formatTime = newTimeDate.toLocaleTimeString("en-GB");
                    let splittingByColon = formatTime.toString().split(":");
                    let newFormatedTime = splittingByColon[0] + ":" + splittingByColon[1];

                    // Adding to array of stations on path
                    let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                        stationsOnPath[i].Name, newFormatedTime);
                    arrayOfStationsOnPath.push(newStationClass);

                    // Logs for my own use
                    console.log(newTimeDate);
                    console.log(arrayOfStationsOnPath);
                    console.log(newClosestTime);
                    console.log(getAllStationsOnPath);
                }
                else{

                    // setting new added minutes from time between stations
                    timeDate = new Date(getDateHTML.value + " " + arrayOfStationsOnPath[i - 1].time)
                    timeDate.setMinutes( timeDate.getMinutes() + Math.ceil(getTimeTaken) )
                    
                    // Formating time to just show hours and minutes
                    let formatTime = timeDate.toLocaleTimeString("en-GB");
                    let splittingByColon = formatTime.toString().split(":");
                    let newFormatedTime = splittingByColon[0] + ":" + splittingByColon[1];
                    console.log(getAllStationsOnPath);

                    // Adding to array of stations on path
                    let newStationClass = new Station(stationsOnPath[i].StationId, stationsOnPath[i].SegmentId, 
                        stationsOnPath[i].Name, newFormatedTime);
                    arrayOfStationsOnPath.push(newStationClass);
                }
            }
            else{

                if (getAllStationsOnPath[i].SegmentId !== getAllStationsOnPath[i- 1].SegmentId){
                    console.log(getAllStationsOnPath[i + 1].SegmentId);

                    let getNextStationSegmentId = getAllStationsOnPath[i + 1].SegmentId;
                    let segmentIdToSearchFor = getNextStationSegmentId;

                    // Getting schedule from start station
                    let fetchNewSchedule = await fetch( "http://10.101.0.12:8080/schedule/" + stationsOnPath[i].Name );
                    let responseFromNewScheduleFetch = await fetchNewSchedule.json();

                    let getScheduleWithOnlyRightSegmentId = responseFromNewScheduleFetch.filter(element => element.SegmentId === segmentIdToSearchFor);

                    let getPreviousTime = arrayOfStationsOnPath[i - 1].time + ":00"; 

                    let hrsFromPreviousTime = getPreviousTime.split(":")[0];
                    let minsFromPreviousTime = getPreviousTime.split(":")[1];

                    GetMatchingHours( hrsFromPreviousTime, getScheduleWithOnlyRightSegmentId, getNewHoursFromStation );

                    let indexNewClosestTime = GetClosestTimeToInputTime( minsFromPreviousTime, getNewHoursFromStation );

                    newClosestTime = getNewHoursFromStation[indexNewClosestTime]; // setting closest time

                    isSwitchedSegment = true;
                    isFirstStationOnNewSegment = true;

                    // Logs for my own use
                    console.log(arrayOfStationsOnPath);
                    console.log(getPreviousTime);
                    console.log(getScheduleWithOnlyRightSegmentId);
                    console.log(indexNewClosestTime);
                    console.log(getNewHoursFromStation);
                    console.log(newClosestTime);
                    console.log(responseFromNewScheduleFetch);
                }
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
    console.log(arrayOfStationsOnPath);
    console.log(getAllStationsOnPath);

    CreateGrid();
}

//#endregion

let isDifferent = false;
let getGrid = document.querySelector('.grid-container');

//#region Creating Grid

function CreateGrid(){

    // Setting how many rows in grid (number of stations on path)
    getGrid.style.gridTemplateRows = "repeat(" + (arrayOfStationsOnPath.length + 1) + ", 100px )";
    // Getting number of columns for grid
    let getNumberOfColumns = window.getComputedStyle(getGrid).getPropertyValue("grid-template-columns").split(" ").length;
    let columnTitles = [ "Station Name", "Path", "Arrival Time", "Information", "Notifications" ];

    CreateDetailsForColumnTitles( getNumberOfColumns, columnTitles );

    CreateNameAndTime();
}

//#endregion

//#region Creating details for each column in grid

function CreateDetailsForColumnTitles( getNumberOfColumns, columnTitles ){

    const firstColumn = 0, thirdColumn = 2, fourthColumn = 3, fifthColumn = 4;

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
        else if (l === fourthColumn){
            currentTitleElement.style.textAlign = "start";
            currentTitleElement.style.placeSelf = "end center";
            currentTitleElement.style.marginRight = "40px";
        }
        else if (l === fifthColumn){
            currentTitleElement.style.textAlign = "start";
            currentTitleElement.style.placeSelf = "end center";
            currentTitleElement.style.marginRight = "110px";
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
/* MIGHT NEED TO REMOVE */
async function CreateNameAndTime(){

    let currentClosestDay = 100;

    for (let i = 1; i <= arrayOfStationsOnPath.length; i++) {

        // Creating details to display station name
        let theName = document.createElement("div");

        // If start station
        if(i === 1){
            theName.innerHTML = "Start at " + arrayOfStationsOnPath[i - 1].name;
        }
        // If end station
        else if (i === (arrayOfStationsOnPath.length)){
            theName.innerHTML = "Arrive at " + arrayOfStationsOnPath[i - 1].name;
        }
        // If normal station on path
        else{
            theName.innerHTML = arrayOfStationsOnPath[i - 1].name;
        }
        
        theName.style.gridRow = (i + 1);
        theName.style.gridColumn = 1;
        theName.style.textAlign = "end";
        theName.style.fontSize = "14.75px";
        getGrid.appendChild(theName);

        // Creating details to display time
        let theTime = document.createElement("div");
        theTime.innerHTML = arrayOfStationsOnPath[i - 1].time;
        CreateStylingForInformation( theTime, i, 3, "15px", false, "32px" );

        // Fetching 2 pieces of information for current station
        let fetchStationInformation = await fetch( "http://10.101.0.12:8080/stations/" 
            + arrayOfStationsOnPath[i - 1].StationId);
        let responseFromInformation = await fetchStationInformation.json();

        // Creating details to display city
        let theInformation2 = document.createElement("div");
        theInformation2.innerHTML = "City: " + responseFromInformation[0].City;
        CreateStylingForInformation( theInformation2, i, 4, "50px", false, "32px" );

        // Creating details to display street name
        let theInformation1 = document.createElement("div");
        theInformation1.innerHTML = "Street Name: " + responseFromInformation[0].StreetName;
        CreateStylingForInformation( theInformation1, i, 4, "50px", true, "32px" );

        // Fetching (if any) notifications for current station
        let fetchNotifications = await fetch( "http://10.101.0.12:8080/notifications/"
            + arrayOfStationsOnPath[i - 1].StationId );
        let responseFromNotifications = await fetchNotifications.json();

        // If there are any notifications, display them
        if (responseFromNotifications.length > 0){
            
            // Displaying the name of the notification
            let theNotificationsName = document.createElement("div");
            theNotificationsName.innerHTML = "Name: " + responseFromNotifications[0].Name;
            CreateStylingForInformation( theNotificationsName, i, 5, "20px", false, "32px" );

            // Displaying the description of the notification
            let theNotificationsDesc = document.createElement("div");
            theNotificationsDesc.innerHTML = "Description: " + responseFromNotifications[0].Description;
            CreateStylingForInformation( theNotificationsDesc, i, 5, "20px", true, "32px" );
        
            console.log(responseFromNotifications); // my use
        }

        if(i > 1){
            
            // If the segment id is different to the previous, set to true (changing segments)
            if (arrayOfStationsOnPath[i - 1].segmentId !== arrayOfStationsOnPath[i - 2].segmentId){
                isDifferent = true;
            }
        }

        // If it's the last index, don't create extra line,
        // else, create the line between stations
        if (i !== arrayOfStationsOnPath.length){
            CreateLine( i, isDifferent );
        }
        CreateRectangle( i, isDifferent ); // creating rectangle

        //#region External API from https://newsapi.org/docs/endpoints/everything

        if (i === arrayOfStationsOnPath.length){
            
            // Getting p to display segment names
            let getPElement = document.querySelector('#segment-name');
            getPElement.style.display = "block";

            // If two segments, display names
            if(isDifferent){
                getPElement.innerHTML = "(Black is segment " + arrayOfStationsOnPath[0].segmentId
                    + ", Blue is segment " + arrayOfStationsOnPath[arrayOfStationsOnPath.length - 1].segmentId + ")";
            }
            // If one segments, display name
            else{
                getPElement.innerHTML = "(Black is segment " + arrayOfStationsOnPath[0].segmentId + ")";
            }

            // Fetching news from api
            let fetchNews = await fetch("https://newsapi.org/v2/everything?q=bitcoin&apiKey=449b2941ac034f4e9dc5db76988a4085");
            let responseFromNewsFetch = await fetchNews.json();
            console.log(responseFromNewsFetch);

            ExternalAPILogic( responseFromNewsFetch, currentClosestDay );

        }

        //#endregion
    }
}

//#endregion

function ExternalAPILogic( responseFromNewsFetch, currentClosestDay ){

    let indexOfClosestDateDay = null;
    let arrayOfTimesFromNews = []; // array of times

    //#region I tried using a library to find nearest time, but couldn't get it to work

            // Putting all response times in an array
            for (let n = 0; n < responseFromNewsFetch.articles.length; n++) {

                // Splitting the time string to get time after char T
                let getRidOfFront = responseFromNewsFetch.articles[n].publishedAt.toString().split("T");

                arrayOfTimesFromNews.push( new Date(getRidOfFront[0]) ); // adding to array
            }
            console.log(arrayOfTimesFromNews); // my own use

            let inputDate = new Date( getDateHTML.value );

            //let findIndexOfNearestDate = nearest(arrayOfTimesFromNews, inputDate); //. finding nearest date using library
            //console.log(findIndexOfNearestDate); // my own use

    //#endregion

            // Finding the news article with the closest date to input date
            for (let c = 0; c < responseFromNewsFetch.articles.length; c++) {

                // Splitting the time string to get time after char T
                let getRidOfFront = responseFromNewsFetch.articles[c].publishedAt.toString().split("T");

                // If the dates are the same
                if (getDateHTML.value == getRidOfFront[0]){
                    indexOfClosestDateDay = c;
                    break;
                }
                else{

                    let getUnformatedDateFromNews = getRidOfFront[0].toString().split("-");
                    let getUnformatedDateFromInput = getDateHTML.value.toString().split("-");

                    // Checking if the months match
                    if (parseInt(getUnformatedDateFromInput[1]) === parseInt(getUnformatedDateFromNews[1])){

                        // Getting difference in days
                        let getDiffInDays = Math.abs(parseInt(getUnformatedDateFromInput[2]) - parseInt(getUnformatedDateFromNews[2]));

                        // Getting current closest
                        if (currentClosestDay > getDiffInDays){
                            currentClosestDay = getDiffInDays;
                            indexOfClosestDateDay = c;
                        }
                    }

                    // my use
                    console.log(getUnformatedDateFromNews);
                    console.log(getUnformatedDateFromInput);
                }
            }
            console.log(indexOfClosestDateDay);

            // Getting news article title and hyperlinking it
            let getTitleHTML = document.querySelector('#title');
            let titleText = responseFromNewsFetch.articles[indexOfClosestDateDay].title;
            let titleHyperlinked = titleText.link(responseFromNewsFetch.articles[indexOfClosestDateDay].url);
            getTitleHTML.innerHTML = titleHyperlinked;

            // Showing div with api information
            let getDivForTitle = document.querySelector('#external-api')
            getDivForTitle.style.display = "flex";

}

//#region Creating styling elements for current element to be displayed

function CreateStylingForInformation( currentElement, i, columnNumber, leftMarginAmount, ifMarginTop, marginTopAmount ){

    currentElement.style.gridRow = (i + 1);
    currentElement.style.gridColumn = columnNumber;
    currentElement.style.fontSize = "14.75px";
    currentElement.style.marginLeft = leftMarginAmount;

    // If need a margin top, set the margin top
    if (ifMarginTop) {
        currentElement.style.marginTop = marginTopAmount;
    }

    getGrid.appendChild(currentElement);
}

//#endregion

//#region Creating line between stations

function CreateLine( i, isDifferent ){
    // Creating canvas and canvas details
    let createCanvas = document.createElement('canvas');
    SettingCanvasWidthHeight( createCanvas );
    let canvas2d = createCanvas.getContext('2d');
    FillCanvasBasedOnIfDifferent( canvas2d, isDifferent, "stroke" );
    canvas2d.beginPath();
    canvas2d.moveTo(2,0);
    canvas2d.lineWidth = 2;
    canvas2d.lineTo(0, 300);
    canvas2d.stroke();
    
    CreatingCanvasDetails( createCanvas, i, "64%" );
}

//#endregion

//#region Creating Rectangle (dot point for each station)

function CreateRectangle( i, isDifferent ){
    // Creating canvas and canvas details
    let createCanvas = document.createElement('canvas');
    SettingCanvasWidthHeight( createCanvas );
    let canvas2d = createCanvas.getContext('2d');
    FillCanvasBasedOnIfDifferent( canvas2d, isDifferent, "fill" );
    canvas2d.fillRect(0,0,7.5,7.5);

    CreatingCanvasDetails( createCanvas, i, "60%" )
}

//#endregion

//#region Setting canvas width/height

function SettingCanvasWidthHeight( createCanvas ){

    createCanvas.width = 30;
    createCanvas.height = 100;
}

//#endregion

//#region Filling canvas

function FillCanvasBasedOnIfDifferent( canvas2d, isDifferent, styling ){

    // If the segment is different, change the color to blue; else, keep black
    if (isDifferent) {

        // If the canvas is the rectangle
        if (styling == "fill"){
            canvas2d.fillStyle = "#1F06FE";
        }
        else if (styling == "stroke"){
            canvas2d.strokeStyle = "#1F06FE";
        }
    }
    else{

        // If the canvas is the line
        if (styling == "fill"){
            canvas2d.fillStyle = "black";
        }
        else if (styling == "stroke"){
            canvas2d.strokeStyle = "black";
        }
    } 
}

//#endregion

//#region Creating details for canvas (line and dot)

function CreatingCanvasDetails ( createCanvas, i, value ){

    document.body.appendChild(createCanvas);
    createCanvas.style.gridColumn = 2;
    createCanvas.style.gridRow = (i + 1);
    createCanvas.style.marginLeft = value;
    getGrid.appendChild(createCanvas);
}

//#endregion