// ----------
// On-click asynch function handling Users deleting their accounts, as well as logout functionality for users and admins and requesting personal data
// ----------

document.getElementById('request').onclick = async function () {

    const rawResponse = await fetch('/requestData', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    const serverResponse = await rawResponse.json()

    console.log(serverResponse)

    alert(serverResponse.message)
}

document.getElementById('submitDELETEMYSELF').onclick = async function () {

    const answer = window.confirm("Do you really want to delete your account?")

    if (answer == false) {
        alert('Deletion cancelled! ')
        return
    }

    const rawResponse = await fetch('/deleteMyAccount', {
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
    window.location.href = url;
}

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
    window.location.href = url;
}

// Submit the email message from User to Admin to the server
const formdata = { // define the structure of the form data object literal
    adminMessageTextArea: '',
}
document.getElementById('submitUSERmessage').onclick = async function () {
    let data = formdata // set the current data to have the structure of the pre-defined data object literal

    data.adminMessageTextArea = document.getElementById('userMessageTextArea').value

    const rawResponse = await fetch('/userMessage', {
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

// ----------
// ----------
// ----------
