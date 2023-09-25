async function onSubmittedNewReview() {
    const text = document.getElementById('reviewTextBox').value;
    const rating = document.getElementById('ratingSlider').value;
    const parkingAreaBeingReviewed = document.getElementById('selectedParkingAreaText').innerHTML;
    
    let errMessages = "";
    if(text == "") {
        errMessages = errMessages + "Please leave a review!\n"
    }
    if(parkingAreaBeingReviewed == "N/A") {
        errMessages = errMessages + "Please select a parking area to review!\n"
    }

    if(errMessages != "") {
        alert(errMessages);
    }
    else {
        const data = {
            text,
            rating,
            parkingAreaBeingReviewed
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    
        const response = await fetch('/submitReview', options);
        alert('Request sent to submit your review.');
        const responseBody = await response.json();
        alert(responseBody.message);
        location.reload();
    }
}


const reviewSubmitButton = document.getElementById('submitReviewButton');
reviewSubmitButton.addEventListener("click", onSubmittedNewReview);