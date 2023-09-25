// --------------------------------------------------------------
// --------------------------------------------------------------


// Harry's code for both login and sign up page, INFORM me before making any changes


// --------------------------------------------------------------
// --------------------------------------------------------------

const formdata = { // define the structure of the form data object literal
    first_name: '',
    last_name: '',
    email_address: '',
    phone: '',
    house_number: '',
    postcode: '',
    username: '',
    password: '',
    age: '',
    gender: '',
    comments: '',
}

document.getElementById('submitLOGIN').onclick = async function () {
    const username = document.getElementById("usernameLOGIN").value;
    const password = document.getElementById("passwordLOGIN").value;

    if (!username || !password) {
        alert('Username and password cannot be empty.')
        return
    }

    const rawResponse = await fetch('/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
    })

    const serverResponse = await rawResponse.json()

    console.log(serverResponse)

    if (serverResponse.success == false) {
        alert(serverResponse.message)
        return
    }

    let url = serverResponse.newpath
    window.location.href = url;
}

// this is the on-click event handler for the submit SIGNUP button
document.getElementById('submitSIGNUP').onclick /*document.getElementById('privacypolicy').onclick*/ = async function () {
    const url = 'http://localhost:3000/submit'
    let data = formdata // set the current data to have the structure of the pre-defined data object literal

    const checkbox = document.getElementById("privacypolicy")

    if (checkbox.checked == false) {
        alert('You must agree to our Privacy Policy first! ')
        return
    }

    // below we take the information from the form and we store in the data object
    data.first_name = document.getElementById('fname').value
    data.last_name = document.getElementById('sname').value
    data.email_address = document.getElementById('email').value
    data.phone = document.getElementById('phone').value
    data.house_number = document.getElementById('houseN').value
    data.postcode = document.getElementById('postcode').value
    data.username = document.getElementById('username').value
    data.password = document.getElementById('password').value
    data.age = document.getElementById('age').value
    data.gender = document.getElementById('gender').value
    data.comments = document.getElementById('comments').value

    // use the built-in fetch api to sent an http post request to the server
    const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const content = await rawResponse.json()

    // display either error or success message in either red or green colour
    document.getElementById('submitSIGNUPlabel').innerHTML = content.message
    if (content.success) {
        document.getElementById('submitSIGNUPlabel').style.color = '#00ff00'
    }
    else {
        document.getElementById('submitSIGNUPlabel').style.color = '#ff0000'
    }
}

// Side Menu Open & Close
function openNav() {
    document.getElementById("sideNav").style.width = "100%";
}
function closeNav() {
    document.getElementById("sideNav").style.width = "0%";
}

// Contact Info Pop Up
function togglePopup(){
    document.getElementById("popup-1").classList.toggle("active");
}

// Privacy Policy Pop Up
function togglePopup1(){
    document.getElementById("popup-2").classList.toggle("active");
}