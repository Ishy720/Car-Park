//THIS JAVASCRIPT FILE WILL DEAL WITH BOOKING A PARKING SPOT
//TO-DO
//- FIX BUG WHERE IT STILL SHOWS SPOT 7 IS SELECTED WHEN ITS NOT
// ADD IN VISUAL THING TO SHOW ITS ACTUALLY SELECTED
//- READ IN PARKING AREAS FROM DATABASE
// - LINK IT TOGETHER WITH ISMAILS CODE

const allSpots = document.getElementById("parking spots")
const allAreas = document.getElementById("parking areas")
const bookingButton = document.getElementById("bookingButton")
bookingButton.style.display = 'none';
allSpots.style.display = 'none';

//HERE ADDS FUNCTIONALITY TO CLICKING THE PARKING SPOTS-----

function createButtons(parkingArea,amount)
{
    for(let i = 0; i < allParkingAreas.length;i++)
    {
        if(allParkingAreas[i] != parkingArea)
        {
            allParkingAreas[i].isDisplayed = false;
        }
    }
    allSpots.innerHTML = ' ';
    let row = document.createElement("div");
    row.setAttribute("id", "row");

    for(let i = 0; i < amount;i++)
    {
        if(i % 3 == 0)
        {
            row = document.createElement("div");
            row.setAttribute("id", "row");
            allSpots.appendChild(row);
        }
        let btn = document.createElement("button");
        btn.innerHTML = "parking spot"+i;
        btn.setAttribute("id", i);
        btn.classList += "spot";
        row.appendChild(btn);

    }
    parkingArea.isDisplayed = true;
}

//indexable parking areas and creating the parking areas
for(let i = 0; i < allParkingAreas.length;i++)
{
    let btn = document.createElement("button");
    btn.innerHTML = "parking area"+i;
    btn.classList += "parkingArea";
    allAreas.appendChild(btn);
}

const buttons = document.querySelectorAll(".parkingArea");
var count = 0;
var areaClickedIndex = 10;
buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
    const index =   Array.from(buttons).indexOf(e.target);
    areaClickedIndex = index;
    console.log(areaClickedIndex);
    parkingAreaSelected = allParkingAreas[areaClickedIndex]
    document.getElementById("info").innerHTML = "The parking area name is "+parkingAreaSelected.getName()+" The spot id is - "+parkingAreaSelected.getID()
    allSpots.style.display = 'initial';
    createButtons(parkingAreaSelected,parkingAreaSelected.parkingSpots.length)
    });

}); 

//------------------



var spotClickedIndex = 0;
allSpots.addEventListener('click',(e) =>{
    
    if(e.target.classList.contains('spot'))
    {
        index = e.target.id 
        console.log(index)
        const spotName = spotOne.parkingSpots[index].getName()
        document.getElementById("confirm").innerHTML = "confirm booking at - "+spotName+"?"
        bookingButton.style.display = 'initial';
    }


})

// displays all booked spaces
let element = document.getElementById("display");

/**
 * TODO: Iterate through JSON file
 */

fetch("public/ParkingAreaDB.json")
.then(function (response) {
    //The JSON data will arrive here
    return response.json();
})
.then(function (data) {
    appendData(data);
})
.catch(function (err) {
    // If an error occured, you will catch it here
    console.log(err);
});

for(let i = 0; i < data.length; i++)
{
    //append each array to the page
    element.innerHTML = 'Place: ' + data[i].parkingAreaName + ' ' + data[i].parkingSpots;
}

