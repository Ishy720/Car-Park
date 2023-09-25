//THIS JAVASCRIPT CLASS HAS ALL THE OBJECT
class ParkingSpot {
    constructor(name)
    {
        this.name = name;
    }

    getName() {
        return this.name;
    }
}

class ParkingArea {
    
    constructor(name, id)
    {
        this.name = name;
        this.id = id;
        this.parkingSpots = [];
        this.parkingSpotButtons = [];
        this.isDisplayed = false;
    }

    getID() {
        return this.id
    }
    getName() {
        return this.name;
    }
}
var spotOne = new ParkingArea("PARKING AREA 1",3);
var spotTwo = new ParkingArea("PARKING AREA 2",4);
var spotThree = new ParkingArea("PARKING AREA 3", 5);

pSpotOne = new ParkingSpot("SPOT1");
pSpotTwo = new ParkingSpot("SPOT2");
pSpotThree = new ParkingSpot("SPOT3");
pSpotFour = new ParkingSpot("SPOT4");
pSpotFive = new ParkingSpot("SPOT5");
pSpotSix = new ParkingSpot("SPOT6");
pSpotSeven = new ParkingSpot("SPOT7");

spotOne.parkingSpots = [pSpotOne,pSpotTwo,pSpotThree,pSpotFour,pSpotFive,pSpotSix, pSpotSeven]
spotTwo.parkingSpots = [pSpotOne,pSpotTwo,pSpotThree,pSpotFour,pSpotFive]
spotThree.parkingSpots = [pSpotOne,pSpotTwo,pSpotThree]
allParkingAreas = [spotOne,spotTwo,spotThree]

