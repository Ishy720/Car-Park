/*
This file is responsible for any javascript related to dashboard.html, such as retrieving the user's input, validating it and sending it
to the server.
*/

function validateNumber(numberParam) {
    const regex = /(0|[1-9][0-9]*)/;
    return regex.test(numberParam);
}

function validateName(nameParam) {
    const regex = /^[A-Za-z ]+$/;
    return regex.test(nameParam);
}

function validateCoordinate(coordParam) {
    const regex = /^\d*\.?\d*$/;
    return regex.test(coordParam);
}

async function onSubmittedNewParkingArea() {

    //get the data from the page
    let parkingAreaName = document.getElementById('name').value;
    let lat = document.getElementById('lat').value;
    let long = document.getElementById('long').value;

    let daysSelected = false;
    let daysOpen = [];

    let openingTime = document.getElementById('openingTime').value;
    let closingTime = document.getElementById('closingTime').value;

    let disabledSpotsBoolean = evSpotsBoolean = false;

    if(document.getElementById('sundayCheckBox').checked) {
        daysSelected = true;
        daysOpen.push("Sunday");
    }

    if(document.getElementById('mondayCheckBox').checked) {
        daysSelected = true;
        daysOpen.push("Monday");
    }

    if(document.getElementById('tuesdayCheckBox').checked) {
        daysSelected = true;
        daysOpen.push("Tuesday");
    }

    if(document.getElementById('wednesdayCheckBox').checked) {
        daysSelected = true;
        daysOpen.push("Wednesday");
    }

    if(document.getElementById('thursdayCheckBox').checked) {
        daysSelected = true;
        daysOpen.push("Thursday");
    }

    if(document.getElementById('fridayCheckBox').checked) {
        daysSelected = true;
        daysOpen.push("Friday");
    }

    if(document.getElementById('saturdayCheckBox').checked) {
        daysSelected = true;
        daysOpen.push("Saturday");
    }

    if(document.getElementById('dpCheckBox').checked) {
        disabledSpotsBoolean = true;
    }

    if(document.getElementById('evCheckBox').checked) {
        evSpotsBoolean = true;
    }

    let errorMessages = "";

    //check if parking area name isn't valid
    if(parkingAreaName == "" || !validateName(parkingAreaName)) {
        errorMessages = errorMessages + "Valid parking area name required!\n";
    }

    //check if coordinates are invalid (THIS DOES NOT CHECK GENUITY OF COORDINATES, BING MAPS API DOES THIS)
    if(!validateCoordinate(lat) || !validateCoordinate(long) || lat == "" || long == "") {
        errorMessages = errorMessages + "Valid coordinates required!\n";
    }

    //check if the user didn't select at least one day for the car park to be open
    if(daysSelected == false) {
        errorMessages = errorMessages + "Parking area must be open on at least 1 day!\n";
    }

    //check if the user didn't select opening/closing times properly, both are required to be chosen
    if(openingTime == "Select time.." || closingTime == "Select time..") {
        errorMessages = errorMessages + "Valid opening/closing times required!\n";
    }

    //if errors were found, show them
    if(errorMessages != "") {
        alert(errorMessages);
    }

    else {

        const data = {
            parkingAreaName,
            lat,
            long,
            daysOpen,
            openingTime,
            closingTime,
            disabledSpotsBoolean,
            evSpotsBoolean
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        const response = await fetch('/public/dashboard.html', options);
        alert("Request sent to add parking area!");
        const responseBody = await response.json()
        alert(responseBody.message);
        location.reload();
    }

}

async function onDeleteParkingArea() {

    //get the parking area id the user submitted
    let parkingAreaIDToDelete = document.getElementById('parkingAreaNameDelete').value;
    let errorMessages = "";

    //check if the id isn't empty or not an integer
    if(parkingAreaIDToDelete == "" || !validateNumber(parkingAreaIDToDelete)) {
        errorMessages = errorMessages + "Valid parking area ID required!\n";
    }

    //if errors were found, show the errors
    if(errorMessages != "") {
        alert(errorMessages);
    }

    else {

        const data = {
            id: parkingAreaIDToDelete
        }

        const response = await fetch('/dashboard/parkingAreaIDToDelete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)  //if you do not want to send any addional data,  replace the complete JSON.stringify(YOUR_ADDITIONAL_DATA) with null
        })
        alert("Request sent to delete area!");
        const responseBody = await response.json();
        alert(responseBody.message);
        location.reload();
    }
}

function onDisplayParkingAreaReviews() {
    let parkingAreaIDInput = document.getElementById('parkingAreaNameReviewID').value;
    
    let errorMessages = "";

    //check if parking area name isn't valid
    if(!validateNumber(parkingAreaIDInput)) {
        errorMessages = errorMessages + "Input must be a number!\n";
    }

    if(errorMessages != "") {
        alert(errorMessages);
    }
    else {
         //use fetch api to retrieve database content
        fetch('/ParkingAreaDB.json').then((response) => {
            return response.json();
        }).then(data => {
            let validIDCap = data.length - 1;
            if(parkingAreaIDInput <= validIDCap && parkingAreaIDInput >= 0) {
                var reviewsDiv = document.getElementById('parkingAreaReviews');
                reviewsDiv.innerHTML = "";
                const reviewArrayFromParkingArea = data[parkingAreaIDInput].reviews;
                for(var i in reviewArrayFromParkingArea) {
                    let div = document.createElement("div");
                    let br = document.createElement("br");
                    div.innerHTML = i + ". Review: " + reviewArrayFromParkingArea[i].review
                    + " | Username: " + reviewArrayFromParkingArea[i].userID + " | Flagged for moderation?: " + reviewArrayFromParkingArea[i].flagged;

                    document.getElementById('parkingAreaReviews').appendChild(div);
                    document.getElementById('parkingAreaReviews').appendChild(br);
                }
            }
            else {
                alert("ID does not exist.");
            }

        }).catch((err) => {
            console.log(err);
        });
    }

}

async function onDeleteReview() {
    let parkingAreaID = document.getElementById('parkingAreaNameReviewID').value;
    let reviewID = document.getElementById('reviewIDToDelete').value;
    let errorMessages = "";

    if(parkingAreaID == "") {
        errorMessages = errorMessages + "Parking area ID must be declared!\n";
    }

    if(!validateNumber(reviewID)) {
        errorMessages = errorMessages + "Review ID must be a number!\n";
    }

    if(errorMessages != "") {
        alert(errorMessages);
    }
    else {

        const data = {
            parkingAreaID,
            reviewID
        };
    
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        const response = await fetch('/deleteReview', options);
        alert("Request sent to delete review ID " + reviewID + "!");
        const responseBody = await response.json()
        alert(responseBody.message)
        location.reload();
    }
}

function onSubmitNewParkingSpot()
{
    let name = document.getElementById('parkingAreaNameAddSlot').value;
    let disabledSlotCheckBox = document.getElementById('disabledSpotCheckBox');
    let EVSlotCheckBox = document.getElementById('evSpotCheckBox');
    let isDisabledSpot = false;
    let hasElectricCharging = false;
    let isOccupied = false;
    let isReserved = false;

    if(disabledSlotCheckBox.checked) {
        isDisabledSpot = true;
    }
    if(EVSlotCheckBox.checked) {
        hasElectricCharging = true;
    }
    let errorMessages = "";

    //check if the id isn't empty or not an integer
    if(name == "" || name < 0 || name > allParkingAreas.length-1 || !validateNumber(name)) {
        errorMessages = errorMessages + "Valid parking area ID required!\n";
    }

    if(isDisabledSpot && hasElectricCharging)
    {
        errorMessages = errorMessages + " The new parking spot cannot be an EV spot and a disabled spot. Can only be one or the other.\n";

    }
    //if errors were found, show the errors
    if(errorMessages != "") {
        console.log("FAILED: user entered invalid data, a new spot has not been added.");
        alert(errorMessages);
    }
    else{
        const data = {
            name,
            isOccupied,
            isDisabledSpot,
            hasElectricCharging,
            isReserved
        };
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    
        fetch('/public/dashboardnewSpot', options);
        console.log("PASSED: successfuly added a new parking spot!");
        alert("Request sent to add parking spot!");
        location.reload();
    }
}


currentSelectedParkingArea = null;
allParkingAreas = [];
parkingSpotsOfCurrentArea = [];

function loadAllParkingAreas()
{
    //use fetch api to retrieve database content
    fetch('/ParkingAreaDB.json').then((response) => {
        return response.json();
    }).then(data => {
        for(var i in data) {
            try {
                let currentParkingArea = data[i];
                allParkingAreas.push(currentParkingArea);
            }
            catch(ex) {
                console.log(ex);
            }
        }
    
    }).catch((err) => {
        console.log(err);
    });
}

parkingSpotDiv = document.getElementById("parking spots");
parkingDeleteSpotDiv = document.getElementById("parking spots delete");
function showSpotsForArea()
{
    //when the user clicks show spot, this function will generate the spots
    index = -1;
    spotClickedIndex = -1;
    let parkingAreaIDToShowSpots = document.getElementById('parkingAreaNameEditSlot').value;
    selectedParkingArea = allParkingAreas[parkingAreaIDToShowSpots]
    parkingSpotsOfCurrentArea = selectedParkingArea.parkingSpots;
    createSpotButtons(selectedParkingArea,parkingSpotsOfCurrentArea.length,parkingSpotDiv);
    displaySpotData();
}
parkingAreaIDToEdit = -1;
function showDeleteSpotsForArea()
{
       //when the user clicks show spot, this function will generate the spots
       //indexes are at -1 to select nothing as switching to a new parking area will remove current selection
       index = -1;
       delSpotClickedIndex = -1;
       let parkingAreaIDToShowSpots = document.getElementById('parkingAreaNameDeleteSlot').value;
       parkingAreaIDToEdit = document.getElementById('parkingAreaNameDeleteSlot').value;
       if(parkingAreaIDToShowSpots < 0 || parkingAreaIDToShowSpots > allParkingAreas.length-1 || parkingAreaIDToShowSpots == "")
       {
           alert("Invalid parking area ID selected, cannot display spots.")
       }
       else{
        selectedParkingArea = allParkingAreas[parkingAreaIDToShowSpots]
        parkingSpotsOfCurrentArea = selectedParkingArea.parkingSpots;
        createSpotButtons(selectedParkingArea,parkingSpotsOfCurrentArea.length,parkingDeleteSpotDiv); 
        displayDeleteSpotData();
       }
}

var spotClickedIndex = 0;
var delSpotClickedIndex = 0;
//CODE HERE DISPLAYS SPOT DATA-------
let spotNameStatus = document.getElementById('selectedParkingSpotName');
let spotOccupiedStatus = document.getElementById('SpotOccupied');
let spotReservedStatus = document.getElementById('SpotReserved');
let spotEVStatus = document.getElementById('SpotEV');
let spotDisableStatus = document.getElementById('SpotDisabled');

function displaySpotData()
{
    if(index >= 0)
    {
        //this function will display the spot data
        spotNameStatus.innerHTML = parkingSpotsOfCurrentArea[index].name;
        if(parkingSpotsOfCurrentArea[index].isOccupied)
        {
            spotOccupiedStatus.innerHTML = "Yes";
        } 
        else{
            spotOccupiedStatus.innerHTML = "No";       
        }

        if(parkingSpotsOfCurrentArea[index].isReserved)
        {
            spotReservedStatus.innerHTML = "Yes";
        } 
        else{
            spotReservedStatus.innerHTML = "No";       
        }

        if(parkingSpotsOfCurrentArea[index].hasElectricCharging)
        {
            spotEVStatus.innerHTML = "Yes";
        } 
        else{
            spotEVStatus.innerHTML = "No";       
        }
        if(parkingSpotsOfCurrentArea[index].isDisabledSpot)
        {
            spotDisableStatus.innerHTML = "Yes";
        } 
        else{
            spotDisableStatus.innerHTML = "No";       
        }
    }
    else{
        spotNameStatus.innerHTML = '-';
        spotOccupiedStatus.innerHTML = '-';
        spotReservedStatus.innerHTML = '-';
        spotEVStatus.innerHTML = '-';
        spotDisableStatus.innerHTML = '-';
    }

}

let spotDeleteNameStatus = document.getElementById('selectedParkingDeleteSpotName');
let spotDeleteOccupiedStatus = document.getElementById('DeleteSpotOccupied');
let spotDeleteReservedStatus = document.getElementById('DeleteSpotReserved');
let spotDeleteEVStatus = document.getElementById('DeleteSpotEV');
let spotDeleteDisableStatus = document.getElementById('DeleteSpotDisabled');



var totalSelectedAreaReserved = 0;
var totalSelectedAreaOccupied = 0;
var totalSelectedAreaFree = 0;

function showAreaStats(index)
{

}
function onClickShowAreaStats()
{
    
    document.getElementById('donutGraph').innerHTML = '';
    document.getElementById('donutGraph').style.height = "500px";
    document.getElementById('donutGraph').style.width = "800px";
    let parkingAreaStatsID = document.getElementById('parkingAreaNameStats').value;
    let totalSpacesDiv = document.getElementById('totalSpaces');
    let availableSpaceDiv = document.getElementById('availableSpaces');
    let occupiedSpaceDiv = document.getElementById('occupiedSpaces');
    let reservedSpaceDiv = document.getElementById('reservedSpaces');
    let disabledSpaceDiv = document.getElementById('disabledSpaces');
    let electricSpaceDiv = document.getElementById('electricSpaces');
    //if nothing is entered, default it to -1 for error checking
    if(parkingAreaStatsID == "")
    {
        parkingAreaStatsID = -1;
    }

    if(parkingAreaStatsID >= 0 && parkingAreaStatsID < allParkingAreas.length)
    {
        let currentStatsSpots = allParkingAreas[parkingAreaStatsID].parkingSpots;
        totalSpacesDiv.innerHTML = allParkingAreas[parkingAreaStatsID].parkingSpots.length;
        let totalAvailableSpaceCount = 0;
        totalOccupiedSpaceCount = 0;
        totalReservedSpaceCount = 0;

        let totalDisabledSpaceCount = 0;
        let totalElectricSpaceCount = 0;
        document.getElementById('selectedStatAreaName').innerHTML = allParkingAreas[parkingAreaStatsID].parkingAreaName;
        //for loop will gather the stats
        for(let i = 0;i < currentStatsSpots.length; i++)
        {
            let currentSpot = currentStatsSpots[i];
            //counts all non occupied/reserved spaces
            if(!currentSpot.isOccupied && !currentSpot.isReserved)
            {
                totalAvailableSpaceCount++;
            }
            //counts occupied spaces
            if(currentSpot.isOccupied)
            {
                totalOccupiedSpaceCount++;
            }
            //counts reserved spaces
            if(currentSpot.isReserved)
            {
                totalReservedSpaceCount++;
            }
            //count disabled spaces
            if(currentSpot.isDisabledSpot)
            {
                totalDisabledSpaceCount++;
            }
            //count electric spaces
            if(currentSpot.hasElectricCharging)
            {
                totalElectricSpaceCount++;
            }
    
    
        }
        freeSpaces = allParkingAreas[parkingAreaStatsID].parkingSpots.length-(totalOccupiedSpaceCount+totalReservedSpaceCount);
        availableSpaceDiv.innerHTML = totalAvailableSpaceCount;
        occupiedSpaceDiv.innerHTML = totalOccupiedSpaceCount;
        reservedSpaceDiv.innerHTML = totalReservedSpaceCount;
        disabledSpaceDiv.innerHTML = totalDisabledSpaceCount;
        electricSpaceDiv.innerHTML = totalElectricSpaceCount;
        totalSelectedAreaFree = freeSpaces;
        totalSelectedAreaOccupied = totalOccupiedSpaceCount;
        totalSelectedAreaReserved = totalReservedSpaceCount;

        //displays a graph graphically showing stats
        var data = anychart.data.set([
            ['Occupied', totalOccupiedSpaceCount],
            ['Reserved', totalReservedSpaceCount],
            ['Free', totalAvailableSpaceCount]
          ]);
        
        // create a pie chart with the data
        var chart = anychart.pie(data)
        // set the chart radius making a donut chart
        chart.innerRadius('55%');
        
        chart.title('Parking Area parking space usage')
        chart.container('donutGraph');
        chart.draw();
        console.log("PASSED: successfully displayed a graph to show parking spot usage");
    }
    else{
        //ELSE if the user enters out of bounds, display stats for the highest index parking area
        let currentStatsSpots = allParkingAreas[allParkingAreas.length-1].parkingSpots;
        totalSpacesDiv.innerHTML = allParkingAreas[allParkingAreas.length-1].parkingSpots.length;
        let totalAvailableSpaceCount = 0;
        totalOccupiedSpaceCount = 0;
        totalReservedSpaceCount = 0;
        freeSpaces = allParkingAreas[allParkingAreas.length-1].parkingSpots.length-(totalOccupiedSpaceCount+totalReservedSpaceCount);
        let totalDisabledSpaceCount = 0;
        let totalElectricSpaceCount = 0;
        document.getElementById('selectedStatAreaName').innerHTML = allParkingAreas[allParkingAreas.length-1].parkingAreaName;
        //for loop will gather the stats
        for(let i = 0;i < currentStatsSpots.length; i++)
        {
            let currentSpot = currentStatsSpots[i];
            //counts all non occupied/reserved spaces
            if(!currentSpot.isOccupied && !currentSpot.isReserved)
            {
                totalAvailableSpaceCount++;
            }
            //counts occupied spaces
            if(currentSpot.isOccupied)
            {
                totalOccupiedSpaceCount++;
            }
            //counts reserved spaces
            if(currentSpot.isReserved)
            {
                totalReservedSpaceCount++;
            }
            //count disabled spaces
            if(currentSpot.isDisabledSpot)
            {
                totalDisabledSpaceCount++;
            }
            //count electric spaces
            if(currentSpot.hasElectricCharging)
            {
                totalElectricSpaceCount++;
            }
    
    
        }
        availableSpaceDiv.innerHTML = totalAvailableSpaceCount;
        occupiedSpaceDiv.innerHTML = totalOccupiedSpaceCount;
        reservedSpaceDiv.innerHTML = totalReservedSpaceCount;
        disabledSpaceDiv.innerHTML = totalDisabledSpaceCount;
        electricSpaceDiv.innerHTML = totalElectricSpaceCount;
        totalSelectedAreaFree = freeSpaces;
        totalSelectedAreaOccupied = totalOccupiedSpaceCount;
        totalSelectedAreaReserved = totalReservedSpaceCount;
        var data = anychart.data.set([
            ['Occupied', totalOccupiedSpaceCount],
            ['Reserved', totalReservedSpaceCount],
            ['Free', freeSpaces]
          ]);
        
        // create a pie chart with the data
        var chart = anychart.pie(data)
        // set the chart radius making a donut chart
        chart.innerRadius('55%');
        chart.title('Parking Area parking space usage');
        chart.container('donutGraph');
        chart.draw();
        alert("Invalid parking area ID! Now displaying last parking area.");
        console.log("PASSED: successfully displayed a graph to show parking spot usage");
    }
    
}


function displayDeleteSpotData()
{
    if(index >= 0)
    {
        //this function will display the spot data
        spotDeleteNameStatus.innerHTML = parkingSpotsOfCurrentArea[index].name;
        if(parkingSpotsOfCurrentArea[index].isOccupied)
        {
            spotDeleteOccupiedStatus.innerHTML = "Yes";
        } 
        else{
            spotDeleteOccupiedStatus.innerHTML = "No";       
        }

        if(parkingSpotsOfCurrentArea[index].isReserved)
        {
            spotDeleteReservedStatus.innerHTML = "Yes";
        } 
        else{
            spotDeleteReservedStatus.innerHTML = "No";       
        }

        if(parkingSpotsOfCurrentArea[index].hasElectricCharging)
        {
            spotDeleteEVStatus.innerHTML = "Yes";
        } 
        else{
            spotDeleteEVStatus.innerHTML = "No";       
        }
        if(parkingSpotsOfCurrentArea[index].isDisabledSpot)
        {
            spotDeleteDisableStatus.innerHTML = "Yes";
        } 
        else{
            spotDeleteDisableStatus.innerHTML = "No";       
        }
    }
    else{
        spotDeleteNameStatus.innerHTML = '-';
        spotDeleteOccupiedStatus.innerHTML = '-';
        spotDeleteReservedStatus.innerHTML = '-';
        spotDeleteEVStatus.innerHTML = '-';
        spotDeleteDisableStatus.innerHTML = '-';
    }

}
//------------

//this code deals with a parking spot being selected and will display the info related to the spot
parkingSpotDiv.addEventListener('click',(e) =>{
    
    if(e.target.classList.contains('spot'))
    {
        index = e.target.id;
        spotClickedIndex = index;       
        parkingSpotsOfCurrentArea = selectedParkingArea.parkingSpots;
        displaySpotData();
    }
});
//this code deals with a parking spot being selected and will display the info related to the spot - for the delete section
parkingDeleteSpotDiv.addEventListener('click',(e) =>{
    
    if(e.target.classList.contains('spotdel'))
    {
        index = e.target.id;
        delSpotClickedIndex = index;       
        parkingSpotsOfCurrentArea = selectedParkingArea.parkingSpots;
        displayDeleteSpotData();
    }
});
//This function will generate parking spots for the selected parking area
function createSpotButtons(selectedParkingArea,amount, parkingSpotDiv)
{
    parkingSpotDiv.innerHTML = ' ';
    let row = document.createElement("div");
    row.setAttribute("id", "row");

    for(let i = 0; i < amount;i++)
    {
        if(i % 4 == 0)
        {
            row = document.createElement("div");
            row.setAttribute("id", "row");
            parkingSpotDiv.appendChild(row);
        }
        let btn = document.createElement("button");
        indexSpot = i+1;
        btn.innerHTML = "Parking Spot "+indexSpot;
        btn.setAttribute("id", i);
        if(parkingSpotDiv.id == 'parking spots delete')
        {
            btn.classList += "spotdel";
        }
        else{
            btn.classList += "spot";
        }
        if(selectedParkingArea.parkingSpots[i].isOccupied)
        {
            btn.classList +=" occupied";
        }
        else
        {
            btn.classList +=" unoccupied";
        }
        row.appendChild(btn);
    }
    console.log("PASSED: Successfully created spot buttons");
}

loadAllParkingAreas();

function onDeleteParkingSpots()
{
    //let parkingAreaIDToEdit = document.getElementById('parkingAreaNameDeleteSlot').value;
    let parkingSlotToDelete = delSpotClickedIndex;
    let errorMessages = "";
    if(parkingAreaIDToEdit == "" || parkingSlotToDelete == "" || parkingAreaIDToEdit < 0 || parkingAreaIDToEdit > allParkingAreas.length-1 || parkingSlotToDelete < 0) {
        errorMessages = errorMessages + "Valid parking area ID required! or you must select a parking slot!\n";
    }

    if(errorMessages != "") {
        console.log("FAILED: User has entered invalid data, cannot delete parking spot");
        alert(errorMessages);
    }
    else{
        const data = {
            parkingAreaIDToEdit,
            parkingSlotToDelete
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        fetch('/public/dashboardDeleteSpot', options);
        console.log("PASSED: successfully deleted selected parking spot");
        alert("Request sent to delete selected parking spot");
        location.reload();
    }


}


function onSubmitEditParkingSpot()
{
    let parkingAreaIDToEdit = document.getElementById('parkingAreaNameEditSlot').value;
    let parkingSlotToEdit = spotClickedIndex;
    let occupiedSlotCheckBox = document.getElementById('occupiedEditSpotCheckBox');
    let reservedSlotCheckBox = document.getElementById('reservedEditSpotCheckBox');
    let disabledSlotCheckBox = document.getElementById('disabledEditSpotCheckBox');
    let EVSlotCheckBox = document.getElementById('evEditSpotCheckBox');
    let isDisabledSpot = false;
    let hasElectricCharging = false;
    let isOccupied = false;
    let isReserved = false;
    //checking if the boxes are checked
    if(occupiedSlotCheckBox.checked)
    {
        isOccupied = true;
    }
    if(reservedSlotCheckBox.checked)
    {
        isReserved = true;
    }
    if(disabledSlotCheckBox.checked) {
        isDisabledSpot = true;
    }
    if(EVSlotCheckBox.checked) {
        hasElectricCharging = true;
    }
    let errorMessages = "";
    if(parkingAreaIDToEdit == "" || parkingSlotToEdit == "" || parkingAreaIDToEdit < 0 || parkingSlotToEdit < 0) {
        errorMessages = errorMessages + "Valid parking area ID required! or you must select a parking slot!\n";
    }

    if(isReserved && isOccupied)
    {
        errorMessages = errorMessages = " A spot cannot be occupied AND reserved, it can be only one or the other!\n"
    }
    if(hasElectricCharging && isDisabledSpot)
    {
        errorMessages = errorMessages = " A spot cannot be a disabled spot and cannot have EV charging, must have only one or the other\n"
    }

    if(errorMessages != "") {
        console.log("FAILED: User has entered invalid data, cannot modify parking spot");
        alert(errorMessages);
    }
    else
    {
        const data = {
            parkingAreaIDToEdit,
            parkingSlotToEdit,
            isOccupied,
            isDisabledSpot,
            hasElectricCharging,
            isReserved
        };
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    
        fetch('/public/dashboardEditSpot', options);
        console.log("PASSED: successfully modified selected parking spot");
        alert("Request sent to modify parking spot!");
        location.reload();
    }
    
}

allBookings = [];


function loadAllBookings()
{
    //use fetch api to retrieve database content
    fetch('/bookings/booked.json').then((response) => {
        return response.json();
    }).then(data => {
        for(var i in data) {
            try {
                let currentBooking = data[i];
                allBookings.push(currentBooking);
            }
            catch(ex) {
                console.log(ex);
            }
        }
    
    }).catch((err) => {
        console.log(err);
    });
}

loadAllBookings();

function outputAllParkingAreas(div)
{
    //use fetch api to retrieve database content
    fetch('/ParkingAreaDB.json').then((response) => {
        return response.json();
    }).then(data => {
        for(var i in data) {
            try {
                let currentParkingAreaName = data[i].parkingAreaName;
                div.innerHTML = div.innerHTML + i + ". " + currentParkingAreaName + " | ";
            }
            catch(ex) {
                console.log(ex);
            }
        }
    
    }).catch((err) => {
        console.log(err);
    });
}

// ----------
// On-click asynch function handling the banning/unbanning and removal of users, as well as updating and changing the userData schema
// ----------

document.getElementById('submitDELETE').onclick = async function () {
    const username = document.getElementById("deleteUser").value

    if (!username) {
        alert('Username field cannot be empty.')
        return
    }

    if (username == 'Admin') {
        alert('Cannot delete yourself (Admin). ')
        return
    }

    const answer = window.confirm("Do you really want to delete this user?")

    if (answer == false) {
        alert('Deletion cancelled! ')
        return
    }

    const rawResponse = await fetch('/delete', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username})
    })
    const serverResponse = await rawResponse.json()

    console.log(serverResponse)

    if (serverResponse.success == false) {
        alert(serverResponse.message)
        return
    }
}

function outputAllBookings(div)
{
    //use fetch api to retrieve database content
    fetch('/bookings/booked.json').then((response) => {
        return response.json();
    }).then(data => {
        for(var i in data) {
            try {
                let username = data[i].username;
                let areaname = data[i].parkingareaname;
                let parkingspace = data[i].parkingspace;
                let arrivalDate = data[i].arrivaldate;
                let arrivalTime = data[i].arrivaltime;
                let departureDate = data[i].departuredate;
                let departureTime = data[i].departuretime;
                let arrival = data[i].notifyArrival;
                let depart = data[i].notifyDepart;
                let approval = data[i].approved;

                if(approval != "deny")
                {
                    div.innerHTML = div.innerHTML + i + ". Username: " + username + " |  ParkingAreaName:  "
                    + areaname + " |  ParkingSpot: "
                    + parkingspace + "| ArrivalDate: "
                    + arrivalDate + " |  ArrivalTime: "
                    + arrivalTime + " |  departureDate: "
                    + departureDate + " |  departureTime: "
                    + departureTime + " |  Approval: "
                    + approval + " | Arrived: "
                    + arrival + " | Departed: "
                    + depart + "<br/>" + "<br/>";
                }
            }
            catch(ex) {
                console.log(ex);
            }
        }
    
    }).catch((err) => {
        console.log(err);
    });
}

function onSubmitViewBookingsForSpot()
{
    let parkingAreaIDToView = document.getElementById('parkingAreaNameEditSlot').value;
    let parkingSlotToEdit = spotClickedIndex;
    let errorMessages = "";
    if(parkingAreaIDToView == "" || parkingAreaIDToView == "" || parkingAreaIDToView < 0 || parkingAreaIDToView < 0) {
        errorMessages = errorMessages + "Valid parking area ID required! or you must select a parking slot!\n";
    }

    if(errorMessages != "") {
        alert(errorMessages);
    }
    else
    {
        const data = {
            parkingAreaIDToView,
        };
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    }
    
}

function outputAllParkingAreas(div)
{
    //use fetch api to retrieve database content
    fetch('/ParkingAreaDB.json').then((response) => {
        return response.json();
    }).then(data => {
        for(var i in data) {
            try {
                let currentParkingAreaName = data[i].parkingAreaName;
                div.innerHTML = div.innerHTML + i + ". " + currentParkingAreaName + " | ";
            }
            catch(ex) {
                console.log(ex);
            }
        }
    
    }).catch((err) => {
        console.log(err);
    });
}

function output(div)
{
    //use fetch api to retrieve database content
    fetch('/ParkingAreaDB.json').then((response) => {
        return response.json();
    }).then(data => {
        for(var i in data) {
            try {
                let currentParkingAreaName = data[i].parkingAreaName;
                div.innerHTML = div.innerHTML + i + ". " + currentParkingAreaName + " | ";
            }
            catch(ex) {
                console.log(ex);
            }
        }
    
    }).catch((err) => {
        console.log(err);
    });
}

// ----------
// On-click asynch function handling the banning/unbanning and removal of users, as well as updating and changing the userData schema
// ----------

document.getElementById('submitDELETE').onclick = async function () {
    const username = document.getElementById("deleteUser").value

    if (!username) {
        alert('Username field cannot be empty.')
        return
    }

    if (username == 'Admin') {
        alert('Cannot delete yourself (Admin). ')
        return
    }

    const answer = window.confirm("Do you really want to delete this user?")

    if (answer == false) {
        alert('Deletion cancelled! ')
        return
    }

    const rawResponse = await fetch('/delete', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username})
    })
    const serverResponse = await rawResponse.json()

    console.log(serverResponse)

    if (serverResponse.success == false) {
        alert(serverResponse.message)
        return
    }
}

let buttonareaprint = document.createElement("button");
buttonareaprint.id = "buttonarea";
buttonareaprint.innerHTML = "Select Parking Area ID";

let buttonarea = document.getElementById("buttonarea");
let spotsdiv = document.getElementById("bookingspots");

const createareaprint = document.createElement("input");

document.getElementById("selectbooking").onclick = function()
{
    if(!document.getElementById("bookingsid").value)
    {
        alert("Booking ID cannot be empty");
        return;
    }

    var areaDiv = document.getElementById("bookingareas");

    while(areaDiv.firstChild)
    {
        areaDiv.removeChild(areaDiv.firstChild);
    }

    createareaprint.type = "text";
    createareaprint.id = "areaprint";
    const areaprinttext = document.createElement("div");
    areaprinttext.id = "printarea";
    areaprinttext.innerHTML = "<br/> <br/> *Enter ID of Parking Area: ";
    var print = document.getElementById("displayparkingareas");

    outputAllParkingAreas(print);
    areaDiv.appendChild(areaprinttext);
    areaDiv.appendChild(createareaprint);
    areaDiv.innerHTML += "<br/> <br/>";
    areaDiv.appendChild(buttonareaprint);
}

const selectspotbutton = document.createElement('button');
selectspotbutton.id = "spotbutton";
selectspotbutton.innerHTML = "Select spot to change to";

const selectspotfield = document.createElement('input');
selectspotfield.type = "text";
selectspotfield.id = "fieldspot";
selectspotfield.placeholder = "Enter the spot id";

let selectspottext = document.createElement("div");
selectspottext.id = "spottext";


buttonareaprint.onclick = async function()
{
    while(spotsdiv.firstChild)
    {
        spotsdiv.removeChild(spotsdiv.firstChild);
    }

    spotsdiv.appendChild(selectspottext);
    spotsdiv.appendChild(selectspotfield);
    spotsdiv.appendChild(selectspotbutton);
    selectspottext.innerHTML = "";
    
    console.log(document.getElementById("areaprint").value);


    const response = await fetch('/displayspots',
    {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: document.getElementById("areaprint").value})
    })

    const serverresponding = await response.json();

    if(serverresponding.success == true)
    {
        selectspottext.innerHTML += "<br> Spots Available at the selected booking time: <br><br>" + serverresponding.message + "<br><br> <br>*Enter Spot ID to change booking to: <br>";

        return;
    }
}

selectspotbutton.onclick = async () =>
{
    let idsparsed = 
    {
        bookingid: document.getElementById("bookingsid").value,
        parkingareaid: document.getElementById("areaprint").value,
        spotid: document.getElementById("fieldspot").value-1
    }

    console.log(idsparsed);

    const serverresponse = await fetch('/changecurrentbooking', 
    {
        method: 'POST',
        headers: 
        {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(idsparsed)
    });

    const messagefromserver = await serverresponse.json();

    if(messagefromserver.success == true)
    {
        alert(messagefromserver.message);
        return;
    }
    else
    {
        alert(messagefromserver.message);
        return;
    }
}

document.getElementById("approvebutton").onclick = function()
{
    if(!enterparkingareafield.value)
    {
        alert("Booking ID cannot be empty");
        return;
    }

    const doublecheck = window.confirm("Are you sure you want to Approve this booking ID");
    
    if(doublecheck == false)
    {
        alert("Approval cancelled");
        return;
    }


    fetch('/changeapproval', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: enterparkingareafield.value, approvalordeny: "Approve"}) 
    });

    window.location.reload();
}

document.getElementById("denybutton").onclick = function()
{
    if(!enterparkingareafield.value)
    {
        alert("Booking ID cannot be empty");
        return;
    }

    const doublecheck = window.confirm("Are you sure you want to Approve this booking ID");
    
    if(doublecheck == false)
    {
        alert("Approval cancelled");
        return;
    }


    fetch('/changeapproval', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: enterparkingareafield.value, approvalordeny: "Deny"}) 
    });

    window.location.reload();
}

document.getElementById('submitBAN').onclick = async function () {
    const username = document.getElementById("deleteUser").value

    if (!username) {
        alert('Username field cannot be empty.')
        return
    }
  
    if (username == 'Admin') {
        alert('Cannot ban yourself (Admin). ')
        return
    }

    const answer = window.confirm("Do you really want to ban this user?")

    if (answer == false) {
        alert('Banning cancelled! ')
        return
    }

    const rawResponse = await fetch('/ban', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, banned: true})
    })

    const serverResponse = await rawResponse.json()
    console.log(serverResponse)
    
    alert(serverResponse.message)
}

document.getElementById('submitUNBAN').onclick = async function () {
    const username = document.getElementById("deleteUser").value

    if (!username) {
        alert('Username field cannot be empty.')
        return
    }

    const answer = window.confirm("Do you really want to unban this user?")

    if (answer == false) {
        alert('Unbanning cancelled! ')
        return
    }
  
    const rawResponse = await fetch('/ban', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, banned: false})
    })
    
    const serverResponse = await rawResponse.json()
    console.log(serverResponse)

    alert(serverResponse.message)
}

// Submit the email message from Admin to User to the server
const formdata = { // define the structure of the form data object literal
    usernameSelect: '',
    adminMessageTextArea: '',
}
document.getElementById('submitADMINmessage').onclick = async function () {
    let data = formdata // set the current data to have the structure of the pre-defined data object literal

    data.usernameSelect = document.getElementById('usernameSelect').value
    data.adminMessageTextArea = document.getElementById('adminMessageTextArea').value

    const rawResponse = await fetch('/adminMessage', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)    
    })
    const serverResponse = await rawResponse.json()

    console.log(serverResponse)

    alert(serverResponse.message)
}

// Submit the changed schema to the server
document.getElementById('submitSCHEMA').onclick = async function () {
    const schema = document.getElementById('userSchemaTextArea').value
    
    try {
        JSON.parse(schema)
    }
    catch {
        alert('Schema provided is not a valid JSON')
        return
    }

    if (schema.startsWith("{\"first_name\":\"\",\"last_name\":\"\",\"email_address\":\"\",\"phone\":\"\",\"house_number\":\"\",\"postcode\":\"\",\"username\":\"\",\"password\":\"\",\"age\":\"\",\"gender\":\"\",\"comments\":\"\",\"banned\":false") == false) {
        alert('Default userSchema cannot be changed!')
        return
    }
    else {
        const rawResponse = await fetch('/schema', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: schema
        })
        const serverResponse = await rawResponse.json()

        console.log(serverResponse)

        alert(serverResponse.message)
    }
}

// When the dashboard loads we populate the user Schema text area with the current schema from the server
window.onload = async function () {
    let rawResponse = await fetch('/schema', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
    })
    let serverResponse = await rawResponse.text()

    document.getElementById('userSchemaTextArea').value = serverResponse

    // Here we fetch all the usernames from userData and populate the dropdown menu with the retrieved info

    var today = new Date().toISOString().split('T')[0];
    console.log(today);
    let todayvalue= {
        arrivalDate: today, 
        arrivalTime: "00:00", 
        departureDate: today,
        departureTime: "23:59"
    };

    await fetch('/alertadminpastonehourbooking', 
    {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    await fetch('/checkbookingconflict', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todayvalue),
    })

    await fetch('/deletebookingsbeforegivenvalue', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todayvalue),
    })

    rawResponse = await fetch('/getAllUsers', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
    })
    serverResponse = await rawResponse.json()

    const usernames = serverResponse.usernames

    var select = document.getElementById("usernameSelect");

    for (const username of usernames) {
        var el = document.createElement("option");
        el.textContent = username;
        el.value = username;
        select.appendChild(el);
    }
  
    //console.log(serverResponse)
}

// An async function dealing with the logout button and sending admins back to login page after they press logout
document.getElementById('logout').onclick = async function () {

    const answer = window.confirm("Do you really want to leave?")

    if (answer == false) {
        alert('Logout unsuccessful! ')
        return
    }

    const rawResponse = await fetch('/logout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    const serverResponse = await rawResponse.json()
  
    console.log(serverResponse)
  
    if (serverResponse.success == false) {
        alert(serverResponse.message)
        return
    }
    
    let url = serverResponse.newpath
    window.location.href = url
}

// ----------
// ----------
// ----------

const parkingAreaListReviewDiv = document.getElementById('parkingAreaListForReview');
outputAllParkingAreas(parkingAreaListReviewDiv)

const parkingAreaListDiv = document.getElementById('parkingAreaList');
outputAllParkingAreas(parkingAreaListDiv)

const parkingAreaListSlotDiv = document.getElementById('parkingAreaListForSlots');
outputAllParkingAreas(parkingAreaListSlotDiv)

const parkingAreaListStatsDiv = document.getElementById('parkingAreaListForStats');
outputAllParkingAreas(parkingAreaListStatsDiv)

const parkingAreaListSlotChangeDiv = document.getElementById('parkingAreaListForSlotChange');
outputAllParkingAreas(parkingAreaListSlotChangeDiv);

const parkingAreaListSlotDeleteDiv = document.getElementById('parkingAreaListForSlotDelete');
outputAllParkingAreas(parkingAreaListSlotDeleteDiv);

const parkingAreaListViewSpots = document.getElementById("viewareas");
outputAllParkingAreas(parkingAreaListViewSpots);

const enterparkingareafield = document.getElementById('parkingAreaNameid');
const outputAllBookingsToPage = document.getElementById("bookinglists");
outputAllBookings(outputAllBookingsToPage);

//query submit buttons on page
const newAreaButton = document.getElementById('submitArea');
const deleteAreaButton = document.getElementById('submitDeleteArea');
const newSpotButton = document.getElementById('submitAddSpot');
const editSpotButton = document.getElementById('submitEditSpot');
const deleteSpotButton = document.getElementById('submitDeleteSpot');
const showSpotButton = document.getElementById('submitshowSpots');
const showDeleteSpotButton = document.getElementById('submitshowDeleteSpots');
const showStatsButton = document.getElementById('submitshowStats');
const displayParkingReviewsBtn = document.getElementById('displayParkingAreaReviewsBtn');
const deleteReviewButton = document.getElementById('deleteReviewBtn');


//add event listeners for the buttons on the page
newAreaButton.addEventListener("click", onSubmittedNewParkingArea);
deleteAreaButton.addEventListener("click", onDeleteParkingArea);
displayParkingReviewsBtn.addEventListener("click", onDisplayParkingAreaReviews);
deleteReviewButton.addEventListener("click", onDeleteReview)
newSpotButton.addEventListener("click",onSubmitNewParkingSpot);
editSpotButton.addEventListener("click",onSubmitEditParkingSpot);
showSpotButton.addEventListener("click",showSpotsForArea);
showDeleteSpotButton.addEventListener("click",showDeleteSpotsForArea);
deleteSpotButton.addEventListener("click",onDeleteParkingSpots);
showStatsButton.addEventListener("click", onClickShowAreaStats);