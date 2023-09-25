// displays all booked spaces
let element = document.getElementById("display");
element.innerHTML = "testing";

fetch("public/ParkingAreaDB.json")
.then(respon => response.json())
.then(data =>  {console.log(data)})

// for(let i = 0; i < allParkingAreas.length; i++)
// {

// }