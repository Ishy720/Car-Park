const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
const session = require('express-session')
const nodemailer = require('nodemailer') // require a module called nodemailer
const fsPromise = fs.promises // makes the synchronous fs module asynchronous

const cors = require('cors')  // enable CORS headers for http requests

app.use(cors())
const bodyParser = require('body-parser')

// --------------------------------------------------------
// ------Harry's Session Security + Cookie handling--------
// --------------------------------------------------------


app.use(bodyParser.json() )      // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(session({
    secret: 'AE58D18ED042E31B36C5B311ABDE5FDFA317E28949525B07B2467CA0362698BD',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

const verifySession = async (req, res, next) => {
    if (req.session.loggedIn === true) {
        next()
        return
    }
    res.redirect('/')
}

const verifyAdmin = async (req, res, next) => {
    if (req.session.username === 'Admin') {
        next()
        return
    }
    res.redirect('/')
}

// --------------------------------------------------------
// ------Harry's Session Security + Cookie handling--------
// --------------------------------------------------------

//Ismail
app.use(express.static('public'));
app.use(express.json());
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/js'));

//localhost:3000 Ismail
app.get('', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})


//localhost:3000/dashboard serving only if you are logged in as Admin Ismail Harry
app.get('/dashboard', verifySession, verifyAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/dashboard.html')
})

//localhost:3000/bookings Ismail Harry
app.get('/bookings', verifySession, (req, res) => {
    res.sendFile(__dirname + '/views/bookings.html')
})

//localhost:3000/map Ismail Harry
app.get('/map', verifySession, (req, res) => {
    res.sendFile(__dirname + '/views/map.html')
})

//handling a new parking area submission request Ismail Tolga
app.post('/public/dashboard.html', verifySession, async (req, res) => {
    
    const {parkingAreaName, lat, long, daysOpen, openingTime, closingTime, disabledSpotsBoolean, evSpotsBoolean} = req.body;
    
    let parkingSpots = [];
    let reviews = [];

    let parkingData = {
        parkingAreaName,
        lat,
        long,
        parkingSpots,
        daysOpen, 
        openingTime, 
        closingTime, 
        disabledSpotsBoolean, 
        evSpotsBoolean,
        reviews
    };
    
    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        //make a variable which holds all the data from database, so we can update it and replace it
        var database;

        if(error) {
            //database not found
            console.log("There was an error reading from the file specified");
        }

        else {
            //database found, parse the data found from it and place into database variable
            database = JSON.parse(data);

            let check = false;

            for(var i in database) {
                if(database[i].parkingAreaName == parkingAreaName) {
                    check = true;
                    res.json({ success: false, message: 'A parking area with that name already exists!' })
                }
            }

            if(check == false) {

            
                indexCounter =0;
                //generate 15 parking spots by default
                for(let i = 0; i < 15;i++)
                {
                    indexToAdd = i+1
                    indexCounter = i+1;
                    name = "Spot "+indexToAdd;
                    isOccupied= false;
                    isDisabledSpot= false;
                    hasElectricCharging= false;
                    isReserved= false;
                    let parkingSpotToInsert = {
                        name,
                        isOccupied,
                        isDisabledSpot,
                        hasElectricCharging,
                        isReserved
                    };
                    parkingData.parkingSpots.push(parkingSpotToInsert);
                }
                if(parkingData.evSpotsBoolean)
                {
                    for(let i = 0; i < 3;i++)
                    {
                        indexCounter +=1;
                        name = "Spot "+indexCounter;
                        isOccupied= false;
                        isDisabledSpot= false;
                        hasElectricCharging= true;
                        isReserved= false;
                        let parkingSpotToInsert = {
                            name,
                            isOccupied,
                            isDisabledSpot,
                            hasElectricCharging,
                            isReserved
                        };
                        parkingData.parkingSpots.push(parkingSpotToInsert);
                    }
                }
                if(parkingData.disabledSpotsBoolean)
                {
                    for(let i = 0; i < 3;i++)
                    {
                        indexCounter +=1;
                        name = "Spot "+indexCounter;
                        isOccupied= false;
                        isDisabledSpot= true;
                        hasElectricCharging= false;
                        isReserved= false;
                        let parkingSpotToInsert = {
                            name,
                            isOccupied,
                            isDisabledSpot,
                            hasElectricCharging,
                            isReserved
                        };
                        parkingData.parkingSpots.push(parkingSpotToInsert);
                    }
                }
                
                //add the new data received to the database variable
                database.push(parkingData);

                res.json({ success: true, message: 'Your parking area has been successfully added.' })
            }
        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })

    })    
})

//handling review submissions from front end to back end Ismail
app.post('/submitReview', verifySession, async (req, res) => {
    const {text, rating, parkingAreaBeingReviewed} = req.body;
    
    const user = await loadUserFromFile(req.session.username);
    
    let username = user.username;
    let userFirstName = user.first_name;
    let userLastName = user.last_name;
    let userFullName = userFirstName + " " + userLastName;

    let reviewData = {
        review: text,
        reviewRating: rating + "/5",
        nameOfUser: userFullName,
        userID: username,
        flagged: false
    }

    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        var database;

        if(error) {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else {
            database = JSON.parse(data);
            for(var i in database) {
                if(database[i].parkingAreaName == parkingAreaBeingReviewed) {
                    let parkingAreaIndex = database[i];
                    for(var element in parkingAreaIndex)
                    {
                        if(element == "reviews")
                        {
                            parkingAreaIndex[element].push(reviewData);
                            res.json({ success: true, message: 'Your review has been successfully added.' })
                        }
                    }
                }
            }
        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })

})


app.post('/flagReview', verifySession, (req, res) => {

    const {currentReview, currentRating, currentReviewUser, currentUsername, currentFlaggedStatus, currentParkingAreaName} = req.body;

    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        var database;

        if(error) {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else {
            database = JSON.parse(data);
            for(var i in database) {
                if(database[i].parkingAreaName == currentParkingAreaName) {
                    let parkingAreaIndex = database[i].reviews;
                    for(var element in parkingAreaIndex)
                    {
                        if(parkingAreaIndex[element].review == currentReview && parkingAreaIndex[element].reviewRating == currentRating
                            && parkingAreaIndex[element].nameOfUser == currentReviewUser && parkingAreaIndex[element].userID == currentUsername
                            && parkingAreaIndex[element].flagged == currentFlaggedStatus) {
                                parkingAreaIndex[element].flagged = true;
                                res.json({ success: true, message: 'The review is flagged by the system.' })
                        }
                    }
                }
            }
        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })
    
})

//handles deleting reviews from parking area database using parking area ID and review ID Ismail
app.delete('/deleteReview', verifySession, verifyAdmin, function(req, res) {

    //the id the user sent over from front end
    const {parkingAreaID, reviewID} = req.body;

    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        var database;

        if(error) {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else {
            database = JSON.parse(data);
            for(var i in database) {
                if(i == parkingAreaID) {
                    if(reviewID >= database[i].reviews.length || reviewID < 0) {
                        console.log("Index ID is out of bounds")
                        res.json({ success: false, message: 'Review ID does not exist in database.' })
                    }
                    else {
                        //database[i].reviews.splice(reviewID, 1);
                        selectedArea = database[parkingAreaID];
                        for(var i in selectedArea) {
                            if(i == "reviews") {
                                selectedArea[i].splice(reviewID, 1);
                                res.json({ success: true, message: 'The review has now been successfully deleted.' })
                            }
                        }
                    }
                }
            }
        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })


});

//TOLGA post method to delete a parking spot for a given parking area ID
app.post('/public/dashboardDeleteSpot', verifySession, (req, res) => {
    const {parkingAreaIDToEdit,parkingSlotToDelete} = req.body;
    let parkingSpots = [];
    let parkingData = {
        parkingAreaIDToEdit,
        parkingSlotToDelete
    };
    
    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        //make a variable which holds all the data from database, so we can update it and replace it
        var database;

        if(error) {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else {
            
            database = JSON.parse(data);
            
            if(parkingAreaIDToEdit >= database.length || parkingAreaIDToEdit < 0) {
                console.log("ID exceeds array index bounds");
            }
            else {
                //database found, parse the data found from it and place into database variable
                //console.log(parkingAreaIDToEdit);
                databaseElement =database[parkingAreaIDToEdit]
                for(var v in databaseElement)
                {
                    if(v == "parkingSpots")
                    {
                        parkingSpotArray = databaseElement[v];
                        if(parkingSlotToDelete > parkingSpotArray.length-1){
                            console.log("out of bound");
                        }
                        else{
                           // parkingSpotArray.splice(parkingSlotToDelete,1);
                            parkingSpotArray.splice(parkingSlotToDelete,1);
                        }
                    }

                }
            }    
        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })

    })    
})

//TOLGA post method to edit a parking spot for a given parking area ID
app.post('/public/dashboardEditSpot', verifySession, (req, res) => {
    const {parkingAreaIDToEdit,parkingSlotToEdit, isOccupied, isDisabledSpot, hasElectricCharging, isReserved} = req.body;
    let parkingSpots = [];

    let parkingData = {
        parkingAreaIDToEdit,
        parkingSlotToEdit,
        isOccupied,
        isDisabledSpot,
        hasElectricCharging,
        isReserved
    };
    
    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        //make a variable which holds all the data from database, so we can update it and replace it
        var database;

        if(error) {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else {
            
            database = JSON.parse(data);
            
            if(parkingAreaIDToEdit >= database.length || parkingAreaIDToEdit < 0) {
                console.log("ID exceeds array index bounds");
            }
            else {
                //database found, parse the data found from it and place into database variable
                //console.log(parkingAreaIDToEdit);
                databaseElement =database[parkingAreaIDToEdit]
                //console.log(databaseElement);
                for(var v in databaseElement)
                {

                    if( v =="parkingSpots" )
                    {
                        parkingSpotArray = databaseElement[v];
                        if(parkingSlotToEdit > parkingSpotArray.length-1){
                            console.log("out of bound");
                        }
                        else{
                            parkingSlot = parkingSpotArray[parkingSlotToEdit];
                            parkingSlot["isOccupied"] = isOccupied;
                            parkingSlot["isDisabledSpot"] = isDisabledSpot;
                            parkingSlot["hasElectricCharging"] = hasElectricCharging;
                            parkingSlot["isReserved"] = isReserved;
                        }
                    }
                }
            }         
        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })    
})

//TOLGA post method to add a new parking spot for a given parking area ID
app.post('/public/dashboardnewSpot', verifySession, (req, res) => {

    const {name, isOccupied, isDisabledSpot, hasElectricCharging, isReserved} = req.body;
    

    let parkingData = {
        name,
        isOccupied,
        isDisabledSpot,
        hasElectricCharging,
        isReserved
    };
    
    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        //make a variable which holds all the data from database, so we can update it and replace it
        var database;

        if(error) {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else {
            database = JSON.parse(data);
            if(name >= database.length || name < 0) {
                console.log("ID exceeds array index bounds");
            }
            else {
                //database found, parse the data found from it and place into database variable
                databaseElement =database[name]
                foundParkingArea = false;
                for(var v in databaseElement)
                {
                    //the website will look for the parking name entered and once it finds a matching name, it pushes the new spot.

                    if( v =="parkingSpots" )
                    {
                        parkingSpotArray = databaseElement[v];
                        spotAmount = databaseElement[v].length+1;
                        //gets highest spot number
                        lastSpotName = parkingSpotArray[parkingSpotArray.length-1].name.replace(/[^\d.-]/g, '');
                        lastSpotName++;
                        parkingData.name = "Spot "+lastSpotName;
                        databaseElement[v].push(parkingData);
                    }
                }
            }                 
        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })    
})

//handling delete parking area request
app.delete('/dashboard/parkingAreaIDToDelete', function(req, res) {

    //the id the user sent over from front end
    const {id} = req.body;

    //variable to hold contents of the json file
    var database;

        fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

            if(error) {
                //database not found
                console.log("There was an error reading from the file specified");
            }
            else {
                //database found, parse the data found from it and place into database variable
                database = JSON.parse(data);

                //check if id isn't valid
                if(id >= database.length || id < 0) {
                    console.log("FAILURE TO DELETE PARKING AREA WITH ID: " + id + ", ID EXCEEDS ARRAY INDEX BOUNDS.");
                    res.json({ success: false, message: 'This ID does not exist in the parking area database.' })
                }
                else {
                    //users id is valid, delete it from the database
                    for(var i = 0; i < database.length; i++) {
                        if(i == id) {
                            database.splice(i, 1);
                            res.json({ success: true, message: 'Parking area has been successfully deleted.' })
                        }
                    }
                }
                
                //write the new database back to the JSON file
                fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
                    if(error) {
                        //database not found
                        console.log("There was an error writing to the file specified");
                    }
                })
            }
        })
});


//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------

//Joeys code

app.post('/newBooking', verifySession, async (req, res) => 
{    
    const {
        username, 
        parkingareaname, 
        parkingspace, 
        disabled, 
        electric,         
        arrivaldate,
        arrivaltime,
        departuredate,
        departuretime,
        price,
        cardNumber,
        cvv,
        expirymonth,
        expiryyear,
        approved,
        notifyArrival,
        notifyDepart
    } = req.body;

    let parkingData = {
        username,
        parkingareaname,
        parkingspace,
        disabled,
        electric,
        arrivaldate,
        arrivaltime,
        departuredate,
        departuretime,
        price,
        cardNumber,
        cvv,
        expirymonth,
        expiryyear,
        approved,
        notifyArrival,
        notifyDepart
    };

    console.log(parkingData);
    
    fs.readFile(__dirname + '/public/bookings/booked.json', 'utf-8', (error, data) => {

        //contents of the database from the file
        var database;

        if(error) {
            console.log("Couldn't read the file/Couldn't find the file specified");
        }
        else {
            database = JSON.parse(data);

            fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data2) =>
            {
                var database2;
                if(error)
                {
                    console.log("error reading file for new booking");
                }
                else
                {
                    database2 = JSON.parse(data2);


                    for(var v in database2)
                    {
                        if(database2[v].parkingAreaName == parkingareaname)
                        {
                            for(var i in database2[v].parkingSpots)
                            {
                                if(database2[v].parkingSpots[i].name == parkingspace)
                                {
                                    if(database2[v].parkingSpots[i].isReserved == false || database2[v].parkingSpots[i].isOccupied == false)
                                    {
                                        database.push(parkingData);
                                        res.json({success: true, message: "You have booked this spot"});
                                    }
                                    else
                                    {
                                        res.json({success: false, message: "This spot is occupied at this time"});
                                    }
                                }
                            }
                        }
                    }

                    fs.writeFile(__dirname+'/public/ParkingAreaDB.json', JSON.stringify(database2, null, 4), (error) =>
                    {
                        if(error)
                        {
                            console.log("error writing to area db file");
                        }
                    })

                    fs.writeFile(__dirname + '/public/bookings/booked.json', JSON.stringify(database, null, 4), (error) => {
                        if(error) {
                            //database not found
                            console.log("There was an error writing to the file specified");
                        }
                    })
                }
            })
        }
    })

    //THIS CHANGES THE PARKING SPOT TO OCCUPIED
    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', (error, data) => {

        //contents of the database from the file
        var databaseParking;

        if(error) {
            console.log("Couldn't read the file/Couldn't find the file specified");
        }
        else {
            databaseParking = JSON.parse(data);
            console.log(databaseParking);
            //console.log(parkingareaname);
            for(var v in databaseParking)
            {
                if(databaseParking[v].parkingAreaName == parkingareaname)
                {   
                    console.log("naknm"+databaseParking[v]);
                    currentParking = databaseParking[v];
                    parkingSpotArray = currentParking.parkingSpots;
                    for(var x in parkingSpotArray)
                    {
                        if(parkingSpotArray[x].name == parkingspace)
                        {
                            parkingSpotArray[x].isReserved = true;
                        }
                    }
                }

                //console.log(databaseParking[v]);

            }
        }
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(databaseParking, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })
})

app.post('/checkbookingconflict', verifySession, async (req, res) => {
    const {arrivalDate, arrivalTime, departureDate, departureTime} = req.body;

    let arrDep = {arrivalDate, arrivalTime, departureDate, departureTime};

    // console.log(arrDep);

    fs.readFile(__dirname+'/public/bookings/booked.json', 'utf-8', (error, data) => {
        var databaseDates;

        if(error)
        {
            console.log("Couldn't read the file for booking conflict");
        }
        else
        {
            databaseDates = JSON.parse(data);
            // console.log("database dates" + databaseDates);
                //changes the spot if there is no conflict to unoccupied
                fs.readFile(__dirname+'/public/ParkingAreaDB.json', 'utf-8', (error, data) => {
                    //contents of the database from the file
                    var databaseParking;

                    if(error) {
                        console.log("Couldn't read the file/Couldn't find the file specified");
                    }
                    else 
                    {
                        databaseParking = JSON.parse(data);
                        //database dates for loop needs to be pushed to the last loop to make this work better
                        checkingwitharraybookingConflict(
                            arrDep.arrivalDate, 
                            arrDep.arrivalTime, 
                            arrDep.departureDate, 
                            arrDep.departureTime, 
                            databaseDates, databaseParking);

                    }
                    fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(databaseParking, null, 4), (error) => {
                        if(error) 
                        {
                            //database not found
                            console.log("There was an error writing to the file specified");
                        }
                    });
                });
        }
        
        
        fs.writeFile(__dirname + '/public/bookings/booked.json', JSON.stringify(databaseDates, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        });
    });
});


app.post('/deletebookingsbeforegivenvalue', verifySession, async (req, res) => {
    const {departureDate} = req.body;

    let depdata = {departureDate};

    fs.readFile(__dirname+'/public/bookings/booked.json', 'utf-8', (error, data) =>
    {
        var databasebooking;

        if(error)
        {
            console.log("There was an error reading from file");
        }
        else
        {
            databasebooking = JSON.parse(data);

            for(var v in databasebooking)
            {
                console.log(databasebooking[v].departuredate < departureDate);
                if(databasebooking[v].departuredate < departureDate)
                {
                    console.log(databasebooking[v]);
                    databasebooking.splice(v,1)
                }
            }
        }

        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/bookings/booked.json', JSON.stringify(databasebooking, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })
})

app.post('/changeapproval', verifyAdmin, (req, res) =>
{
    const {id, approvalordeny} = req.body;

    let approval = {id, approvalordeny};

    fs.readFile(__dirname+'/public/bookings/booked.json', 'utf-8', (error, data) =>
    {
        var database;

        if(error)
        {
            console.log("Couldn't read the file for booking conflict");
        }
        else
        {
            database = JSON.parse(data);

            database[approval.id].approved = approval.approvalordeny;
        }

        fs.writeFile(__dirname + '/public/bookings/booked.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        });
    })
})

//change the notify arrival value to true
app.post('/usernotfiyarrival', verifySession, async function(req, res) {
    const {id, arrival, username,  usercoordinateslong, usercoordinateslat} = req.body;

    let parseddata = {id, arrival, username,  usercoordinateslong, usercoordinateslat};

    fs.readFile(__dirname+'/public/bookings/booked.json', 'utf-8', async (error, data) =>
    {
        var database;

        if(error)
        {
            console.log("Error reading file for user notify");
        }
        else
        {
            database = JSON.parse(data);
            if(parseddata.id >= database.length || parseddata.id < 0 || !isNumericOnly(parseddata.id))
            {
                res.json({success: false, message: "This is not a valid booking"});
                return;
            }
            console.log(parseddata.username);
            console.log(database[parseddata.id].username == parseddata.username);
            if(database[parseddata.id].username == parseddata.username)
            {
                var now = new Date();
                var nownotime = new Date();

                var utcoffsetvariable = -now.getTimezoneOffset();
                now.setTime(now.getTime() + utcoffsetvariable * 60 * 1000);
                nownotime.setDate(nownotime.getDate() + 1);
                nownotime.setHours(0,0,0,0);

                var booking = new Date(database[parseddata.id].arrivaldate);
                var bookingnotime = new Date(database[parseddata.id].arrivaldate);
                bookingnotime.setDate(bookingnotime.getDate() + 1);
                bookingnotime.setHours(0,0,0,0);

                let splitdate = database[parseddata.id].arrivaltime.split(":");
                console.log(splitdate[0] + splitdate[1] + splitdate[2]);

                booking.setUTCHours(+splitdate[0]);
                booking.setUTCMinutes(splitdate[1]);


                    if(bookingnotime == nownotime)
                    {
                        if(booking < now)
                        {
                            if(booking.getUTCHours() - now.getUTCHours() >= 1)
                            {//too early. eg 13:40 is booking, time is now 12:
                                console.log(booking.getUTCHours());
                                if(booking.getUTCMinutes() - now.getUTCMinutes() < 0)
                                {
                                    console.log("more than an hour: too early" + booking.getUTCHours());
                                    res.json({success: false, message: "You are too early for this booking"});
                                    return;
                                }
                            }
                            else if (booking.getUTCHours() - now.getUTCHours() == 0)
                            {
                                if(booking.getUTCMinutes() - now.getUTCMinutes() >= -60 && booking.getUTCMinutes() - now.getUTCMinutes() <= 0)
                                {
                                    database[parseddata.id].notifyArrival = parseddata.arrival;
                                }
                                else if(booking.getUTCMinutes() - now.getUTCMinutes() > 0)
                                {
                                    console.log("late: send admin message");
                                    const user = await loadUserFromFile('Admin');
                                        try 
                                        {
                                            // asynchronously send a confirmation email to the user
                                            // if an exception occurs it is catched by the catch statement
                                            await sendEmail(
                                                user.email_address, 
                                                `Message from System about ${parseddata.username} & Booking ID ${parseddata.id}: `,
                                                '<b>Hi Admin, ' + '</b><br>' + `The following user, ${parseddata.username} ,has changed their 
                                                booking to arrived but was late. Booking ID: ${parseddata.id}` 
                                            )
                                            return;
                                        }
                                        catch (err) 
                                        {
                                            console.log(err)
                                            return
                                        }
                                }
                            }
                            else if(booking.getUTCHours() - now.getUTCHours() == -1) 
                            {
                                //if the current time is greater than the booked time then find out if the minutes
                                //are less than 60 and if so they are on time/within the hour
                                if(booking.getUTCMinutes() - now.getUTCMinutes() >= 0 && booking.getUTCMinutes() - now.getUTCMinutes() <= 60)
                                {
                                    database[parseddata.id].notifyArrival = parseddata.arrival;

                                }

                            }
                            console.log("booking with time is greater");
                        }
                        else if(booking > now)
                        {
                            if(booking.getUTCHours() - now.getUTCHours() >= 1)
                            {//too early. eg 13:40 is booking, time is now 12:
                                console.log(booking.getUTCHours());
                                if(booking.getUTCMinutes() - now.getUTCMinutes() < 0)
                                {
                                    console.log("more than an hour: too early" + booking.getUTCHours());
                                    res.json({success: false, message: "You are too early for this booking"});
                                    return;
                                }
                            }
                            else if (booking.getUTCHours() - now.getUTCHours() == 0)
                            {
                                if(booking.getUTCMinutes() - now.getUTCMinutes() >= -60 && booking.getUTCMinutes() - now.getUTCMinutes() <= 0)
                                {
                                    database[parseddata.id].notifyArrival = parseddata.arrival;
                                }
                                else if(booking.getUTCMinutes() - now.getUTCMinutes() > 0)
                                {
                                    console.log("late: send admin message");
                                    const user = await loadUserFromFile('Admin');
                                        try 
                                        {
                                            // asynchronously send a confirmation email to the user
                                            // if an exception occurs it is catched by the catch statement
                                            await sendEmail(
                                                user.email_address, 
                                                `Message from System about ${parseddata.username} & Booking ID ${parseddata.id}: `,
                                                '<b>Hi Admin, ' + '</b><br>' + `The following user, ${parseddata.username} ,has changed their 
                                                booking to arrived but was late. Booking ID: ${parseddata.id}` 
                                            )
                                            return;
                                        }
                                        catch (err) 
                                        {
                                            console.log(err)
                                            return
                                        }
                                }
                            }
                            else if(booking.getUTCHours() - now.getUTCHours() == -1) 
                            {
                                //if the current time is greater than the booked time then find out if the minutes
                                //are less than 60 and if so they are on time/within the hour
                                if(booking.getUTCMinutes() - now.getUTCMinutes() >= 0 && booking.getUTCMinutes() - now.getUTCMinutes() <= 60)
                                {
                                    database[parseddata.id].notifyArrival = parseddata.arrival;

                                }

                            }
                        }
                        console.log("booking is greater");
                    }
                    else if(bookingnotime < nownotime)
                    {
                        res.json("you are too early");
                        return;
                    }

                fs.readFile(__dirname+'/public/ParkingAreaDB.json', 'utf-8', async (error, data) =>
                {
                    var databasearea;

                    if(error)
                    {
                        console.log("Error reading file for user notify area");
                    }
                    else
                    {
                        databasearea = JSON.parse(data);

                        for(var v in databasearea)
                        {
                            if(databasearea[v].parkingAreaName == database[parseddata.id].parkingareaname)
                            {
                                if((databasearea[v].lat - parseddata.usercoordinateslat) < 0.05
                                &&  (databasearea[v].long - parseddata.usercoordinateslong) < 0.05)
                                {
                                    console.log("SUCCESS THE USER CHANGED THEIR ARRIVAL STATUS");
                                    database[parseddata.id].notifyArrival = parseddata.arrival;
                                }
                                else
                                {
                                    const user = await loadUserFromFile('Admin');
                                    try 
                                    {
                                        console.log("ERROR THE USER COORDINATES DON'T MATCH");
                                        // asynchronously send a confirmation email to the user
                                        // if an exception occurs it is catched by the catch statement
                                        await sendEmail(
                                            user.email_address, 
                                            `Message from System about ${parseddata.username} & Booking ID ${parseddata.id}: `,
                                            '<b>Hi Admin, ' + '</b><br>' + `The following user, ${parseddata.username} ,has tried to change their
                                            arrival status on this booking ID, ${parseddata.id}, but the coordinates list them as elsewhere:` 
                                        )
                                        res.json({success: false, message:'Location does not match booking spot/area'});
                                        return;
                                    }
                                    catch (err) 
                                    {
                                        console.log(err)
                                        return
                                    }
                                }
                            }
                        }

                        fs.writeFile(__dirname+'/public/bookings/booked.json', JSON.stringify(database, null, 4), (error) => 
                        {
                            if(error) 
                            {
                                //database not found
                                console.log("There was an error writing to the file specified");
                            }
                        })
                    }

                    fs.writeFile(__dirname+'/public/ParkingAreaDB.json', JSON.stringify(databasearea, null, 4), (error) => 
                    {
                        if(error) 
                        {
                            //database not found
                            console.log("There was an error writing to the file specified");
                        }
                    });
                })
            }
            else
            {
                res.json({success: false, message: 'This booking ID does not match with your username'});
                return;
            }
        }
    })
})

app.post('/usernotfiydepart', verifySession, async function(req, res) {
    const {id, depart, username,  usercoordinateslong, usercoordinateslat} = req.body;

    let parseddata = {id, depart, username,  usercoordinateslong, usercoordinateslat};
    console.log(depart);
    fs.readFile(__dirname+'/public/bookings/booked.json', 'utf-8', async (error, data) =>
    {
        var database;

        if(error)
        {
            console.log("Error reading file for user notify");
        }
        else
        {
            database = JSON.parse(data);
            if(parseddata.id >= database.length || parseddata.id < 0 || !isNumericOnly(parseddata.id))
            {
                res.json({success: false, message: "This is not a valid booking id"});
                return;
            }
            console.log(parseddata.username);
            console.log(database[parseddata.id].username == parseddata.username);
            if(database[parseddata.id].username == parseddata.username)
            {
                var now = new Date();
                var nownotime = new Date();

                var utcoffsetvariable = -now.getTimezoneOffset();
                now.setTime(now.getTime() + utcoffsetvariable * 60 * 1000);
                nownotime.setDate(nownotime.getDate() + 1);
                nownotime.setHours(0,0,0,0);

                var booking = new Date(database[parseddata.id].departuredate);
                var bookingnotime = new Date(database[parseddata.id].departuredate);
                bookingnotime.setDate(bookingnotime.getDate() + 1);
                bookingnotime.setHours(0,0,0,0);

                let splitdate = database[parseddata.id].departuretime.split(":");
                console.log(splitdate[0] + splitdate[1]);

                booking.setUTCHours(+splitdate[0]);
                booking.setUTCMinutes(splitdate[1]);

                if(database[parseddata.id].notifyArrival == true && database[parseddata.id].notifyDepart == false)
                {
                    if(bookingnotime == nownotime)
                    {
                        if(booking < now)
                        {
                            // if(booking.getUTCHours() - now.getUTCHours() >= 1)
                            // {//too early. eg 13:40 is booking, time is now 12:
                            //     console.log(booking.getUTCHours());
                            //     if(booking.getUTCMinutes() - now.getUTCMinutes() < 0)
                            //     {
                            //         console.log("more than an hour: too early");
                            //         res.json({success: false, message: "You are too early for this booking"});
                            //         return;
                            //     }
                            // }
                            if (booking.getUTCHours() - now.getUTCHours() == 0)
                            {
                                if(booking.getUTCMinutes() - now.getUTCMinutes() >= -60 && booking.getUTCMinutes() - now.getUTCMinutes() <= 0)
                                {
                                    database[parseddata.id].notifyDepart = parseddata.depart;
                                }
                                else if(booking.getUTCMinutes() - now.getUTCMinutes() > 0)
                                {
                                    database[parseddata.id].notifyDepart = parseddata.depart;
                                }
                            }
                            else if(booking.getUTCHours() - now.getUTCHours() == -1) 
                            {
                                //if the current time is greater than the booked time then find out if the minutes
                                //are less than 60 and if so they are on time/within the hour
                                if(booking.getUTCMinutes() - now.getUTCMinutes() < 0)
                                {
                                    console.log("late: send admin message");
                                    const user = await loadUserFromFile('Admin');
                                        try 
                                        {
                                            // asynchronously send a confirmation email to the user
                                            // if an exception occurs it is catched by the catch statement
                                            await sendEmail(
                                                user.email_address, 
                                                `Message from System about ${parseddata.username} & Booking ID ${parseddata.id}: `,
                                                '<b>Hi Admin, ' + '</b><br>' + `The following user, ${parseddata.username} ,has changed their 
                                                booking to depart but was late. Booking ID: ${parseddata.id}` 
                                            )
                                            return;
                                        }
                                        catch (err) 
                                        {
                                            console.log(err)
                                            return
                                        }
                                }

                            }
                        }
                        else if(booking > now)
                        {
                            if (booking.getUTCHours() - now.getUTCHours() == 0)
                            {
                                if(booking.getUTCMinutes() - now.getUTCMinutes() >= -60 && booking.getUTCMinutes() - now.getUTCMinutes() <= 0)
                                {
                                    database[parseddata.id].notifyDepart = parseddata.depart;
                                }
                                else if(booking.getUTCMinutes() - now.getUTCMinutes() > 0)
                                {
                                    database[parseddata.id].notifyDepart = parseddata.depart;
                                }
                            }
                            else if(booking.getUTCHours() - now.getUTCHours() == -1) 
                            {
                                //if the current time is greater than the booked time then find out if the minutes
                                //are less than 60 and if so they are on time/within the hour
                                if(booking.getUTCMinutes() - now.getUTCMinutes() < 0)
                                {
                                    database[parseddata.id].notifyDepart = parseddata.depart;
                                }
                                else
                                {
                                    console.log("late: send admin message");
                                    const user = await loadUserFromFile('Admin');
                                        try 
                                        {
                                            // asynchronously send a confirmation email to the user
                                            // if an exception occurs it is catched by the catch statement
                                            await sendEmail(
                                                user.email_address, 
                                                `Message from System about ${parseddata.username} & Booking ID ${parseddata.id}: `,
                                                '<b>Hi Admin, ' + '</b><br>' + `The following user, ${parseddata.username} ,has changed their 
                                                booking to depart but was late. Booking ID: ${parseddata.id}` 
                                            )
                                            return;
                                        }
                                        catch (err) 
                                        {
                                            console.log(err)
                                            return
                                        }
                                }

                            }
                        }
                    }
                    else if(bookingnotime < nownotime)
                    {
                        database[parseddata.id].notifyDepart = parseddata.depart;
                        console.log("late: send admin message");
                        const user = await loadUserFromFile('Admin');
                            try 
                            {
                                // asynchronously send a confirmation email to the user
                                // if an exception occurs it is catched by the catch statement
                                
                                await sendEmail(
                                    user.email_address, 
                                    `Message from System about ${parseddata.username} & Booking ID ${parseddata.id}: `,
                                    '<b>Hi Admin, ' + '</b><br>' + `The following user, ${parseddata.username} ,has changed their 
                                    booking to depart but was late. Booking ID: ${parseddata.id}` 
                                )
                                res.json({success: false, message: "This booking departure has passed"});
                                return;
                            }
                            catch (err) 
                            {
                                console.log(err)
                                return
                            }
                    }
                }

                fs.readFile(__dirname+'/public/ParkingAreaDB.json', 'utf-8', async (error, data) =>
                {
                    var databasearea;

                    if(error)
                    {
                        console.log("Error reading file for user notify area");
                    }
                    else
                    {
                        databasearea = JSON.parse(data);

                        for(var v in databasearea)
                        {
                            if(databasearea[v].parkingAreaName == database[parseddata.id].parkingareaname)
                            {
                                if((databasearea[v].lat - parseddata.usercoordinateslat) < 1.0
                                &&  (databasearea[v].long - parseddata.usercoordinateslong) < 1.0)
                                {
                                    console.log("SUCCESS THE USER CHANGED THEIR DEPART STATUS");
                                    database[parseddata.id].notifyDepart = parseddata.depart;
                                    console.log(database[parseddata.id].notifyDepart);
                                }
                                else
                                {
                                    const user = await loadUserFromFile('Admin');
                                    try 
                                    {
                                        console.log("ERROR THE USER COORDINATES DON'T MATCH");
                                        // asynchronously send a confirmation email to the user
                                        // if an exception occurs it is catched by the catch statement
                                        await sendEmail(
                                            user.email_address, 
                                            `Message from System about ${parseddata.username} & Booking ID ${parseddata.id}: `,
                                            '<b>Hi Admin, ' + '</b><br>' + `The following user, ${parseddata.username} ,has tried to change their
                                            depart status on this booking ID, ${parseddata.id}, but the coordinates list them as elsewhere:` 
                                        )
                                        res.json({success: false, message:'Location does not match booking spot/area'});
                                        return;
                                    }
                                    catch (err) 
                                    {
                                        console.log(err)
                                        return
                                    }
                                }
                            }
                        }

                        fs.writeFile(__dirname+'/public/bookings/booked.json', JSON.stringify(database, null, 4), (error) => 
                        {
                            if(error) 
                            {
                                //database not found
                                console.log("There was an error writing to the file specified");
                            }
                        })
                    }

                    fs.writeFile(__dirname+'/public/ParkingAreaDB.json', JSON.stringify(databasearea, null, 4), (error) => 
                    {
                        if(error) 
                        {
                            //database not found
                            console.log("There was an error writing to the file specified");
                        }
                    });
                })
            }
            else
            {
                res.json({success: false, message: 'This booking ID does not match with your username'});
                return;
            }
            
        }
    })
})

async function alertadminwithusernameandbookingid(username, bookingid)
{
    const user = await loadUserFromFile('Admin');
    try 
    {
        // asynchronously send a confirmation email to the user
        // if an exception occurs it is catched by the catch statement
        await sendEmail(
            user.email_address, 
            `Message from System about ${username} & Booking ID ${bookingid}: `,
            '<b>Hi Admin, ' + '</b><br>' + `The following user, ${username} , is late to
            their arrival booking. Booking ID: ${bookingid}` 
        )
    }
    catch (err) 
    {
        console.log(err);
    }
}

app.post('/alertadminpastonehourbooking', verifySession, async function(req, res)
{
    fs.readFile(__dirname+'/public/bookings/booked.json', 'utf-8',  async (error, data) =>
    {
        var database;

        if(error)
        {
            console.log("There was an error reading for the alerting of admin");
        }
        else
        {
            database = JSON.parse(data);
            for(var v in database)
            {
                console.log(database[v]);
                var now = new Date();
                var nownotime = new Date();

                var utcoffsetvariable = -now.getTimezoneOffset();
                now.setTime(now.getTime() + utcoffsetvariable * 60 * 1000);
                nownotime.setDate(nownotime.getDate() + 1);
                nownotime.setHours(0,0,0,0);

                var bookingarr = new Date(database[v].arrivaldate);
                var bookingarrnotime = new Date(database[v].arrivaldate);
                bookingarrnotime.setDate(bookingarrnotime.getDate() + 1);
                bookingarrnotime.setHours(0,0,0,0);

                var splitdatearr = database[v].arrivaltime.split(":");
                console.log(splitdatearr[0] + splitdatearr[1]);

                bookingarr.setUTCHours(+splitdatearr[0]);
                bookingarr.setUTCMinutes(splitdatearr[1]);

                var bookingdep = new Date(database[v].departuredate);
                var bookingdepnotime = new Date(database[v].departuredate);
                bookingdepnotime.setDate(bookingdepnotime.getDate() + 1);
                bookingdepnotime.setHours(0,0,0,0);

                let splitdatedep = database[v].departuretime.split(":");
                console.log(splitdatedep[0] + splitdatedep[1]);

                bookingdep.setUTCHours(+splitdatedep[0]);
                bookingdep.setUTCMinutes(splitdatedep[1]);

                if(database[v].notifyArrival == false && database[v].notifyDepart == false)
                {
                    if(bookingarrnotime == nownotime)
                    {
                        if(bookingarr < now)
                        {
                            if(booking.getUTCHours() - now.getUTCHours() == -1) 
                            {
                                //if the current time is greater than the booked time then find out if the minutes
                                //are less than 60 and if so they are on time/within the hour
                                if(booking.getUTCMinutes() - now.getUTCMinutes() < 0)
                                {
                                    console.log("late: send admin message");
                                    alertadminwithusernameandbookingid(database[v].username, v)
                                }
                            }
                        }
                    }
                    else if(bookingdepnotime < nownotime)
                    {
                        console.log("late: send admin message");
                        alertadminwithusernameandbookingid(database[v].username, v);
                    }
                }
                //if over 1 hour depart time alert admin
                else if(database[v].notifyArrival == true && database[v].notifyDepart == false)
                {
                    if(bookingdepnotime == nownotime)
                    {
                        if(bookingdep < now)
                        {
                            if(bookingdep.getUTCHours() - now.getUTCHours() == -1) 
                            {
                                //if the current time is greater than the booked time then find out if the minutes
                                //are less than 60 and if so they are on time/within the hour
                                if(bookingdep.getUTCMinutes() - now.getUTCMinutes() < 0)
                                {
                                    console.log("late: send admin message");
                                    const user = await loadUserFromFile('Admin');
                                    try 
                                    {
                                        // asynchronously send a confirmation email to the user
                                        // if an exception occurs it is catched by the catch statement
                                        await sendEmail(
                                            user.email_address, 
                                            `Message from System about ${database[v].username} & Booking ID ${v}: `,
                                            '<b>Hi Admin, ' + '</b><br>' + `The following user, ${database[v].username} , is late to
                                            their depart booking. Booking ID: ${v}` 
                                        )
                                    }
                                    catch (err) 
                                    {
                                        console.log(err);
                                    }
                                }
                            }
                        }
                    }
                    else if(bookingdepnotime < nownotime)
                    {
                        console.log("late: send admin message");
                        alertadminwithusernameandbookingid(database[v].username, v);
                    }
                }
            }
        }

        fs.writeFile(__dirname+'/public/bookings/booked.json', JSON.stringify(database, null, 4), (error) => 
        {
            if(error) 
            {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        });
    });
})

app.post('/displayspots', verifyAdmin, async (req, res) =>
{
    //res.send text to display spots.
    const {id} = req.body;

    let areaid = {id};

    fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', async (error, data) => 
    {

        var database;

        if(error) 
        {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else 
        {
            database = JSON.parse(data);



            if(id == null || id == undefined || id < 0 || id > database.length-1 || isNumericOnly(id) == false)
            {
                res.json({success: false, message: "You have not entered a valid id"});
                return;
            }
            else
            {           
                databaseelement = database[id].parkingSpots;
                let htmlprint = "";
                for(var i in databaseelement) 
                {
                    if(databaseelement[i].isOccupied == false || databaseelement[i].isReserved == false)
                    {
                        console.log(databaseelement[i].name);
                        console.log(i);
                        htmlprint += ` ${databaseelement[i].name} | `;
                    }

                }
                res.json({success: true, message: htmlprint});
                return;
            }

        }
        
        //update the database with the new data using the database variable
        fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database, null, 4), (error) => {
            if(error) {
                //database not found
                console.log("There was an error writing to the file specified");
            }
        })
    })

})

//passing a string date and time
async function checkingwitharraybookingConflict(arrivaldate, arrivaltime, departuredate, departuretime, databasebookings, databaseparkingareas)
{
    var bookingarrival = new Date(arrivaldate);
    var bookingdeparture = new Date(departuredate);

    var arrivalsplit = arrivaltime.split(":");
    var departuresplit = departuretime.split(":");

    bookingarrival.setUTCHours(arrivalsplit[0]);
    bookingarrival.setUTCMinutes(arrivalsplit[1]);

    bookingdeparture.setUTCHours(departuresplit[0]);
    bookingdeparture.setUTCMinutes(departuresplit[1]);
    console.log("testing");
    for(var i in databaseparkingareas)
    {
        var spotdb = databaseparkingareas[i].parkingSpots;
        for(var v in spotdb)
        {
            for(var j in databasebookings)
            {
                //go through booking array, spots array and parking area array
                if(databasebookings[j].parkingareaname == databaseparkingareas[i].parkingAreaName)
                {
                    if(spotdb[v].name == databasebookings[j].parkingspace)
                    {
                        console.log(`${spotdb[v].name} and ${databasebookings[j].parkingspace}`);
                        if(databasebookings[j].approved == "approve" || databasebookings[j].approved == "unknown" || databasebookings[j].approved == undefined)
                        {
                            var bookingarrivalarray = new Date(databasebookings[j].arrivaldate);
                            var bookingdeparturearray = new Date(databasebookings[j].departuredate);

                            var arrivalarraysplit = databasebookings[j].arrivaltime.split(":");
                            var departurearraysplit = databasebookings[j].departuretime.split(":");

                            bookingarrivalarray.setUTCHours(arrivalarraysplit[0]);
                            bookingarrivalarray.setUTCMinutes(arrivalarraysplit[1]);

                            bookingdeparturearray.setUTCHours(departurearraysplit[0]);
                            bookingdeparturearray.setUTCMinutes(departuresplit[1]);

                            console.log(bookingarrival);
                            console.log(bookingarrivalarray);

                            if( bookingarrival > bookingarrivalarray &&
                                bookingarrival > bookingdeparturearray &&
                                bookingdeparture > bookingarrivalarray &&
                                bookingdeparture > bookingdeparturearray)
                            {
                                console.log(`setting ${spotdb[v].name} in ${databaseparkingareas[i].parkingAreaName} to false`);
                                spotdb[v].isReserved = false;
                                spotdb[v].isOccupied = false;
                            }
                            else if(bookingarrival < bookingarrivalarray &&
                                    bookingarrival < bookingdeparturearray &&
                                    bookingdeparture < bookingarrivalarray &&
                                    bookingdeparture < bookingdeparturearray)
                            {

                                spotdb[v].isReserved = false;
                                spotdb[v].isOccupied = false;
                                console.log(`setting ${spotdb[v].name} in ${databaseparkingareas[i].parkingAreaName} to false`);
                            }
                            else
                            {
                                if(databasebookings[j].notifyArrival == true && databasebookings[j].notifyDepart == true)
                                {
                                    spotdb[v].isReserved = false;
                                    spotdb[v].isOccupied = false;
                                }
                                else if(databasebookings[j].notifyArrival == false && databasebookings[j].notifyDepart == false)
                                {
                                    spotdb[v].isReserved = true;
                                    spotdb[v].isOccupied = false;
                                    break;
                                }
                                else if(databasebookings[j].notifyArrival == true && databasebookings[j].notifyDepart == false)
                                {
                                    console.log(`setting ${spotdb[v].name} in ${databaseparkingareas[i].parkingAreaName} to occupied`);
                                    spotdb[v].isOccupied = true;
                                    spotdb[v].isReserved = false;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    console.log("testing2");
}

app.post('/changecurrentbooking', verifyAdmin, async (req, res) =>
{
    const {bookingid, parkingareaid, spotid} = req.body;

    let parsed = 
    {
        bookingid,
        parkingareaid,
        spotid
    }

    parsed.spotid-1;

    fs.readFile(__dirname + '/public/bookings/booked.json', 'utf-8', async (error, data) => 
    {

        var database;

        if(error) 
        {
            //database not found
            console.log("There was an error reading from the file specified");
        }
        else 
        {
            database = JSON.parse(data);


            fs.readFile(__dirname + '/public/ParkingAreaDB.json', 'utf-8', async (error, data) => 
            {

                var database2;
        
                if(error) 
                {
                    //database not found
                    console.log("There was an error reading from the file specified");
                }
                else 
                {
                    database2 = JSON.parse(data);


                    if(bookingid < 0 || bookingid > database.length || isNumericOnly(bookingid) == false || bookingid == null || bookingid == undefined)
                    {
                        res.json({success: false, message:"Invalid Booking ID"});
                        return;
                    }
                    if(parkingareaid < 0 || parkingareaid > database2.length || isNumericOnly(parkingareaid) == false 
                        || parkingareaid == null || parkingareaid == undefined)
                    {
                        res.json({success: false, message: "Invalid Parking Area ID"});
                        return;
                    }

                    databaseelement = database2[parkingareaid].parkingSpots;

                    if(parsed.spotid > databaseelement.length || parsed.spotid < 0 || isNumericOnly(parsed.spotid) == false || parsed.spotid == null || parsed.spotid == undefined)
                    {
                        res.json({success: false, message: "Invalid Spot"});
                        return;
                    }

                    checkingwitharraybookingConflict(database[bookingid].arrivaldate,
                        database[bookingid].arrivaltime,
                        database[bookingid].departuredate,
                        database[bookingid].departuretime,
                        database, database2);

                    
                    if(databaseelement[parsed.spotid].isOccupied == false && databaseelement[parsed.spotid].isReserved == false)
                    {
                        console.log(`Before change ${database[bookingid].parkingareaname}`);
                        console.log("before change " + database[bookingid].parkingspace);
                        database[bookingid].parkingareaname = database2[parkingareaid].parkingAreaName;
                        database[bookingid].parkingspace = databaseelement[parsed.spotid].name;
                        console.log(database2[parkingareaid].parkingAreaName);
                        console.log(databaseelement[parsed.spotid].name);

                        console.log("after change");
                        console.log(database[bookingid].parkingareaname);
                        console.log(database[bookingid].parkingspace);

                        for(var v in database)
                        {
                            console.log(database[v]);
                        }
                        res.json({success: true, message: "Booking space and spot changed"});
                    }
                    else
                    {
                        res.json({success: false, message: "This parking spot is occupied at this time"});
                        return;
                    }

                    //update the database with the new data using the database variable
                    fs.writeFile(__dirname + '/public/ParkingAreaDB.json', JSON.stringify(database2, null, 4), (error) => 
                    {
                        if(error) 
                        {
                            //database not found
                            console.log("There was an error writing to the file specified");
                        }
                    });

                    console.log(database[bookingid].parkingareaname)
    
                    //update the database with the new data using the database variable
                    fs.writeFile(__dirname + '/public/bookings/booked.json', JSON.stringify(database, null, 4), (error) => 
                    {
                        if(error) 
                        {
                            //database not found
                            console.log("There was an error writing to the file specified");
                        }
                    });
                }
            })
        }
    });
})

//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------


//Harry's code

// Load user schema from the file saved on disk
const raw_userSchema = fs.readFileSync('./UserData/userSchema.json', {encoding: 'utf-8', flag: 'r'})
const userSchema = JSON.parse(raw_userSchema)   

// A function which can add or remove fields from already existing user Data
const updateUserSchema = (new_schema) => {
    const new_keys = Object.keys(new_schema)
    new_keys.forEach((key, index) => {
        if (! (key in userSchema)) {
            userSchema[key] = new_schema[key]
        }
    })

    const current_keys = Object.keys(userSchema)
    current_keys.forEach((key, index) => {
        if (! (key in new_schema)) {
            delete userSchema[key]
        }
    })
    
    fs.writeFileSync('./UserData/userSchema.json', JSON.stringify(userSchema))

    updateExistingUsers()
}

// A function that goes through existing userData and updates it according to updated schematics
const updateExistingUsers = () => {
    const currentFolder = './UserData/';
    const fs = require('fs');

    fs.readdirSync(currentFolder).forEach(file => {
        if (file == 'userSchema.json') return

        const raw_oldSchema = fs.readFileSync(`./UserData/${file}`, {encoding: 'utf-8', flag: 'r'})
        const oldSchema = JSON.parse(raw_oldSchema)

        const new_keys = Object.keys(userSchema)

        new_keys.forEach((key, index) => {
            if (! (key in oldSchema)) {
                oldSchema[key] = userSchema[key]
            }
        })

        const current_keys = Object.keys(oldSchema)

        current_keys.forEach((key, index) => {
            if (! (key in userSchema)) {
                delete oldSchema[key]
            }
        })

        const updatedSchema = oldSchema
        
        fs.writeFileSync(`./UserData/${file}`, JSON.stringify(updatedSchema))
    });
}

updateExistingUsers()

// App router for the schema route used to retrieve and update the user schema
app.route('/schema')
    .get(verifySession, verifyAdmin, async (req, res) => {
        res.send(JSON.stringify(userSchema))
    })
    .patch(verifySession, verifyAdmin, async (req, res) => {
        const new_schema = req.body

        updateUserSchema(new_schema)

        res.json({ success: true, message: 'Schema successfully updated' })
    })


// Async function handling the ban and unban button and all data functionalities related with it.
app.post('/ban', verifySession, verifyAdmin, async (req, res) => {
    if (! await isUsernameTaken(req.body.username)) {
        console.log('Username does not exist.')
        res.json({ success: false, message: 'Username does not exist.' })
        return
    }

    const user = await loadUserFromFile(req.body.username)
    const bannedState = req.body.banned

    user.banned = bannedState

    fs.writeFileSync(`./UserData/${user.username}.json`, JSON.stringify(user))

    res.json({ success: true, message: `User banned state set to ${user.banned}` })

    try {
        await sendEmail(
            user.email_address,
            'Message from SE Admin',
            '<b>Hello ' + user.first_name + `</b><br><br> Your account has been ${user.banned ? 'banned' : 'unbanned'} by an Admin.`
        )
    }
    catch (err) {
        console.log(err)
    }
})

// Async function handling the delete and all data functionalities related with it.
const deleteUser = async (username) => {
    if (! await isUsernameTaken(username)) {
        console.log('Username does not exist.')
        return false
    }

    const user = await loadUserFromFile(username)
    try {
        // asynchronously delete the userdata from json file with the username of the user , JSON.stringify(current_formdata)
        // if an exception occurs it is catched by the catch statement
        await fsPromise.unlink('./UserData/' + user.username + '.json')
    }
    catch (err) {
        console.log(err)
        return false
    }

    console.log(user)
    try {
        await sendEmail(
            user.email_address,
            'Message from SE Admin',
            '<b>Hello ' + user.first_name + '</b><br><br> You have successfully deleted your account.'
        )
    }
    catch (err) {
        console.log(err)
        return false
    }

    return true
}

// Async function handling the delete button from /map and all data functionalities related with it.
app.post('/deleteMyAccount', verifySession, async (req, res) => {

    if (! await deleteUser(req.session.username)) {
        res.json({ success: false, message: 'User could not be successfully deleted.' })
        return
    }

    req.session.loggedIn = false
    req.session.username = ''

    res.cookie('username', '')

    res.json({ success: true, newpath: '/' })
})

// Async function handling the delete button from /dashboard and all data functionalities related with it.
app.post('/delete', verifySession, verifyAdmin, async function(req, res) {
    
    if (! await isUsernameTaken(req.body.username)) {
        console.log('Username does not exist.')
        res.json({ success: false, message: 'Username does not exist.' })
        return
    }

    if (! await deleteUser(req.body.username)) {
        res.json({ success: false, message: 'User could not be successfully deleted.' })
        return
    }
    
    res.json({ success: false, message: 'User was deleted! ' })
})

// Async function handling the login button and all data functionalities related with it.
app.post('/login', async function(req, res) {
    if (! await isUsernameTaken(req.body.username)) {
        console.log('Username does not exist.')
        res.json({ success: false, message: 'Username does not exist.' })
        return
    }

    const user = await loadUserFromFile(req.body.username)

    if (user.banned === true) {
        console.log('You have been banned.')
        res.json({ success: false, message: 'You are banned.' })
        return
    }

    if (user.password !== req.body.password) {
        console.log('Password is incorrect.')
        res.json({ success: false, message: 'Password is incorrect.' })
        return
    }

    req.session.loggedIn = true
    req.session.username = user.username

    res.cookie('username', user.username)

    // Redirecting Admin to dashboard
    if (user.username == 'Admin') {
        res.json({ success: true, newpath: '/dashboard' })
        return
    }

    res.json({ success: true, newpath: '/map' })
})

app.post('/logout', verifySession, async (req, res) => {
    req.session.loggedIn = false
    req.session.username = ''

    res.cookie('username', '')

    res.json({ success: true, newpath: '/' })
})

// Async function handling the submit button and all data functionalities related with it.
app.post('/submit', async function(req, res) {
    let current_formdata = userSchema  // set the current userSchema to have the structure of the pre-defined userSchema object literal
    current_formdata = req.body

    if (!validateFormData(current_formdata, res)) { // call a function that validates the formdata
        return
    }

    try {
        // asynchronously check if the username is taken and await the result
        // if an exception occurs it is catched by the catch statement
        if(await isUsernameTaken(current_formdata.username)) {
            res.json({success: false, message:'That username is already taken!'})
            return
        }
    }
    
    catch (err) {
        console.log(err)
        res.json({success: false, message:'Unknown SSSSSS error occurred in the server!'})
        return
    }
    
    try {
        // asynchronously write the userdata into a txt file with the username of the user
        // if an exception occurs it is catched by the catch statement
        await fsPromise.writeFile('./UserData/'+current_formdata.username+'.json', JSON.stringify(current_formdata))
    }
    catch (err) {
        console.log(err)
        res.json({success:false, message:'Unknown DDDDDDDD error occurred in the server!'})
        return
    }

    try {
        // asynchronously send a confirmation email to the user
        // if an exception occurs it is catched by the catch statement
        await sendEmail(
            current_formdata.email_address, 
            'SE Parking Management',
            '<b>Hello ' + current_formdata.first_name + '</b><br><br> You have successfully signed up.'
        )
    }
    catch (err) {
        console.log(err)
    }

    // tell the user that everything was successful if no errors were encountered
    res.json({success:true, message:'Your data was successfully submitted!'})
})


// Async function handling the retrieval of all usernames from userData.json files
app.get('/getAllUsers', verifySession, verifyAdmin, async (req, res) => {
    const filenames = await fsPromise.readdir('./UserData/')

    usernames = []

    for (const  username of filenames) {
        if (username === 'Admin.json' || username === 'userSchema.json') continue
        
        usernames.push(username.substring(0, username.indexOf('.json')))
    }

    res.json({ usernames: usernames })
})

// Async function handling the submit Message button and all data functionalities related with it.
app.post('/adminMessage', verifySession, verifyAdmin, async function(req, res) {
    let current_formdata = req.body
    let user = await loadUserFromFile(current_formdata.usernameSelect)

    try {
        // asynchronously send a confirmation email to the user
        // if an exception occurs it is catched by the catch statement
        await sendEmail(
            user.email_address, 
            'Message from SE Admin',
            '<b>Hello ' + user.first_name + '</b><br><br>' + current_formdata.adminMessageTextArea
        )
    }
    catch (err) {
        console.log(err)
        res.json({success: false, message:'No recipients defined!'})
        return
    }

    // tell the user that everything was successful if no errors were encountered
    res.json({success:true, message:'Your data was successfully submitted!'})
})

// Async function handling the submit Message button and all data functionalities related with it.
app.post('/userMessage', verifySession, async function(req, res) {
    let current_formdata = req.body

    const user = await loadUserFromFile('Admin')
    try {
        // asynchronously send a confirmation email to the user
        // if an exception occurs it is catched by the catch statement
        await sendEmail(
            user.email_address, 
            'Message from User: ' + req.session.username,
            '<b>Hi Admin, ' + '</b><br>' + 'Can you please help me with the following query: ' + '</b><br><br>' + current_formdata.adminMessageTextArea
        )
    }
    catch (err) {
        console.log(err)
        res.json({success: false, message:'No recipients defined!'})
        return
    }

    // tell the user that everything was successful if no errors were encountered
    res.json({success:true, message:'Your data was successfully submitted!'})
})

// Async function handling the users requesting their data button and all data functionalities related with it.
app.post('/requestData', verifySession, async function(req, res) {

    const user = await loadUserFromFile(req.session.username)
    try {
        // asynchronously send a confirmation email to the user
        // if an exception occurs it is catched by the catch statement
        await sendEmail(
            user.email_address, 
            'Message from Admin: ' + user.username,
            '<b>Hi ' + user.username + ',' + '</b><br>' + 'The data we hold about you is:'
            + '</b><br>' + 'First name: ' + user.first_name 
            + '</b><br>' + 'Last name: ' + user.last_name 
            + '</b><br>' + 'Email address: ' + user.email_address 
            + '</b><br>' + 'House number: ' + user.house_number 
            + '</b><br>' + 'Phone: ' + user.phone 
            + '</b><br>' + 'Password: ' + user.password 
            + '</b><br>' + 'Postcode: ' + user.postcode
            + '</b><br>' + 'Age: ' + user.age
            + '</b><br>' + 'Gender: ' + user.gender
            + '</b><br>' + 'Comments you have previously made: ' + user.comments
        )
    }
    catch (err) {
        console.log(err)
        res.json({success: false, message:'No recipients defined!'})
        return
    }

    // tell the user that everything was successful if no errors were encountered
    res.json({success:true, message:'Your data was successfully submitted!'})
})

// Checking if inputted page exists
app.use((req, res) => {
    res.status(404).send('This page does not exist. ')
})

// asynchronous function to check if a username already exists in UserData
async function isUsernameTaken(username) {
    const files = await fsPromise.readdir('./UserData/')
    username += '.json'
    for (let i = 0; i < files.length; i++) {
        if (username === files[i]) {
            return true
        }
    }
    return false
}

// An asynch function that loads users from UserData
const loadUserFromFile = async (username) => {
    const data = await fsPromise.readFile(`./UserData/${username}.json`, 'utf-8')
    const user = JSON.parse(data)
    return user
}

// asynchronous function to send an email
async function sendEmail(recipient_email, subject, body) {
    console.log(recipient_email)
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'soft.devuea@gmail.com', // dummy gmail account for testing purposes
            pass: 'J@n!T&4*B', // dummy password for testing purposes
        },
    })

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"SE Admin" <soft.devuea@gmail.com>', // sender address
        to: recipient_email, // send to receiver's address
        subject: subject, // top subject line
        html: body, // html body
    })
}

// a function to validate the data submitted by the user in every field
function validateFormData(current_formdata, res) {
    if (!isAlphaOnly(current_formdata.first_name.trim()) || current_formdata.first_name === '') {
        res.status(200).json({success:false, message:'First name can only contain letters!'})
        return false
    }
    if (!isAlphaOnly(current_formdata.last_name.trim()) || current_formdata.last_name === '') {
        res.status(200).json({success:false, message:'Second name can only contain letters!'})
        return false
    }
    if (!isValidEmail(current_formdata.email_address.trim()) || current_formdata.email_address === '') {
        res.status(200).json({success: false, message: 'This email is not valid!'})
        return false
    }
    if (!isNumericOnly(current_formdata.phone.trim()) || current_formdata.phone.trim().length !== 11 || current_formdata.phone === '') {
        res.status(200).json({success:false, message:'Phone numbers can only be numbers and be 11 characters long!'})
        return false
    }
    if (!isNumericOnly(current_formdata.house_number.trim()) || current_formdata.house_number === '') {
        res.status(200).json({success:false, message:'House number must be numeric!'})
        return false
    }
    if (!isAlphaNumericOrSpace(current_formdata.postcode.trim()) || current_formdata.postcode.trim().length > 8 || current_formdata.postcode === '') {
        res.status(200).json({success:false, message:'Postcode can only contain letters and numbers and be less than 8 characters long!'})
        return false
    }

    if (!isAlphaNumeric(current_formdata.username.trim()) || current_formdata.username.trim().length <= 3 || current_formdata.username === '') {
        res.status(200).json({success:false, message:'Username can only contain letters and numbers and be more than 3 characters long!'})
        return false
    }

    let pwdStrengthResult = checkPasswordStrength(current_formdata.password.trim())
    if (!isAlphaNumericSpecial(current_formdata.password.trim()) || !pwdStrengthResult.success || current_formdata.password === '') {
        res.status(200).json({success:false, message:'Password can only contain letters, numbers and special printable characters and cannot be less than 7 characters long!\n'+pwdStrengthResult.message})
        return false
    }

    if (!isNumericOnly(current_formdata.age.trim()) || current_formdata.age === '') {
        res.status(200).json({success:false, message:'Age number must be numeric!'})
        return false
    }

    if (!isAlphaOnly(current_formdata.gender.trim()) || current_formdata.gender === '') {
        res.status(200).json({success:false, message:'Gender can only contain letters!'})
        return false
    }

    if (!isAlphaNumericSpecial(current_formdata.comments.trim()) || current_formdata.comments.trim().length >= 200) {
        res.status(200).json({success:false, message:'Comments cannot be more than 200 characters!'})
        return false
    }

    return true
}

// a function that makes sure the requirements for the password are met
// you need to have: numbers, upper AND lower case letter and a special character
// be more than 7 characters long
function checkPasswordStrength(passwd) {
    let code, i, len
    let hasnumber = false, hasletter = false, haslowercase = false, hasspecial = false

    for (i = 0, len = passwd.length; i < len; i++) {
        code = passwd.charCodeAt(i)
        if (!hasnumber && code > 47 && code < 58) {
            hasnumber = true;
        }
        if (!hasletter && code > 64 && code < 91) {
            hasletter = true;
        }
        if (!haslowercase && code > 96 && code < 123) {
            haslowercase = true;
        }
        if (!hasspecial && code > 32 && code < 48) {
            hasspecial = true;
        }
    }

    if (!hasnumber || !hasletter || !haslowercase || !hasspecial) {
        return {success: false, message: 'Password must contain a number, special character, lower case and upper case letters'}
    }

    if (passwd.length < 6) {
        return {success: false, message: 'Minimum number of characters is 6'}
    }

    if (passwd.length > 12) {
        return {success: false, message: 'Maximum number of characters is 12'}
    }

    return {success: true, message: ''}
}

// a function to check if a string only contains alpha and numeric symbols
function isAlphaNumeric(str) {
    let code, i, len

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i)
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false
        }
    }
    return true
}

// a function to check if a string only contains alpha and numeric symbols
function isAlphaNumericOrSpace(str) {
    let code, i, len

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i)
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123) && // lower alpha (a-z)
            !(code == 32)) { // space
            return false
        }
    }
    return true
}

// a function to check if a string only contains alpha, numeric and special symbols
function isAlphaNumericSpecial(str) {
    let code, i, len

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i)
        if (!(code >= 32 && code < 48) && // special characters
            !(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false
        }
    }
    return true
}

// a function to check if a string only contains alpha symbols
function isAlphaOnly(str) {
    let code, i, len

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i)
        if (!(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false
        }
    }
    return true
}

// a function to check if a string only contains numeric symbols
function isNumericOnly(str) {
    let code, i, len

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i)
        if (!(code > 47 && code < 58)) {  // numeric (0-9)
            return false
        }
    }
    return true
}

// a function that uses regular expression to check the validity of an email
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // a regular expression to match a pattern for an email address, source: StackOverflow
    return re.test(String(email).toLowerCase());
}


//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------

//start the server Ismail
app.listen(port, () => console.info(`Listening on port ${port}`))