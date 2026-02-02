$(document).ready(function(){
    let currentMovie; // Holds the movie object whose seats are being displayed
    let selectedSeats = []; // Holds currently picked seats {row, col}
    let numSeatsToSelect; // The original number of seats the user wanted

    $("#bottom").hide();

    $("#btnAddMovie").click(function(){
        if ($("#txtTitle").val().trim() === "") {
            alert("Please enter a movie title!");
            return;
        }

        const movie = {
            title: $("#txtTitle").val(),
            time: $("#cmbTime option:selected").text(),
            studio: $("#cmbStudio option:selected").val(),
        };

        $.ajax({
            url: 'http://localhost:5001/api/movies',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(movie),
        })
        .done(function() {
            displaySchedule();
        })
        .fail(function(jqXHR) {
            alert(jqXHR.responseJSON.message);
        });
    });


    $("#cmbSchedule").change(displaySchedule);

    function displaySchedule(){
        const thisStudio = $("#cmbSchedule option:selected").val();
        const timeTable = $("#timeTable");
        
        $.ajax({
            url: `http://localhost:5001/api/movies/studio/${thisStudio}`,
            type: 'GET',
        })
        .done(function(movies) {
            timeTable.empty();
            for (const movie of movies) {
                const newSchedule = $("<div>", {
                    class: 'movieSchedule',
                    text: `${movie.time} _ ${movie.title}`,
                    'data-id': movie._id, // Use the movie's ID from the database
                });
                timeTable.append(newSchedule);
            }
        })
        .fail(function(err) {
            console.error(err);
        });
    }


    $("body").on("click", ".movieSchedule", function(){
        const movieId = $(this).data('id');
        $.ajax({
            url: `http://localhost:5001/api/movies/${movieId}`,
            type: 'GET',
        })
        .done(function(movie) {
            currentMovie = movie;
            displaySeats();
        })
        .fail(function(err) {
            console.error(err);
        });
    });

    function displaySeats(){
        if (!currentMovie) return;

        const movieSeating = currentMovie.seats;
        const seatsContainer = $("#seats").empty();

        for (let i = 0; i < 15; i++) {
            let stairs = 0;
            for (let j = 0; j < 20; j++) {
                if (j === 4 || j === 15) {
                    seatsContainer.append($("<div>", { class: "stair" }));
                    stairs++;
                } else {
                    const seatData = movieSeating[i][j - stairs];
                    const seat = $("<div>", {
                        text: seatData.id,
                        'data-status': seatData.status,
                        'data-row': seatData.row,
                        'data-col': seatData.col
                    });

                    if(seatData.status === "non"){
                        seat.addClass("availableSeat");
                    } else if(seatData.status === "booked"){
                        seat.addClass("bookedSeat");
                    } else if (seatData.status === 'picked') {
                        // This handles the case where the user navigates away and back
                        // while seats are selected but not booked.
                        seat.addClass("availableSeat").css({"background-color": '#fec700'});
                    }
                    seatsContainer.append(seat);
                }
            }
        }
    }

    $("#btnSelect").click(function() {
        const numSeats = parseInt($("#numSeats").val(), 10);

        if (isNaN(numSeats) || numSeats <= 0) {
            alert("Please enter a valid number of seats.");
            return;
        }

        numSeatsToSelect = numSeats;
        selectedSeats = []; // Reset previous selections

        $("#bottom").show();
        $("#seatLeft").text("Seats to pick: " + numSeatsToSelect);
    });

    // --- Seat Interaction Event Handlers ---

    $("body").on("mouseenter", ".availableSeat", function() {
        $(this).fadeTo("fast", 0.8);
    }).on("mouseleave", ".availableSeat", function() {
        $(this).fadeTo("fast", 1);
    });

    $("body").on("click", ".availableSeat", function() {
        if (!currentMovie || !numSeatsToSelect) {
            alert("Please select a movie and the number of seats first.");
            return;
        }

        const seat = $(this);
        const seatRow = seat.data('row');
        const seatCol = seat.data('col');
        const isPicked = seat.data('status') === 'picked';

        if (isPicked) {
            // DESELECT a seat
            seat.css({ "background-color": 'grey' }).data('status', 'non');
            selectedSeats = selectedSeats.filter(s => !(s.row === seatRow && s.col === seatCol));
        } else {
            // SELECT a seat
            if (selectedSeats.length < numSeatsToSelect) {
                seat.css({ "background-color": '#fec700' }).data('status', 'picked');
                selectedSeats.push({ row: seatRow, col: seatCol });
            } else {
                alert(`You have already selected ${numSeatsToSelect} seat(s).`);
            }
        }
        $("#seatLeft").text("Seats to pick: " + (numSeatsToSelect - selectedSeats.length));
    });

    $("#btnBook").click(function() {
        if (!currentMovie) {
            alert("Please select a movie first.");
            return;
        }
        if (selectedSeats.length !== numSeatsToSelect) {
            alert(`Please select ${numSeatsToSelect - selectedSeats.length} more seat(s).`);
            return;
        }

        $.ajax({
            url: `http://localhost:5001/api/movies/${currentMovie._id}/seats`,
            type: 'PATCH',
            contentType: 'application/json',
            data: JSON.stringify({ seats: selectedSeats }),
        })
        .done(function() {
            alert('Seats booked successfully!');
            selectedSeats = [];
            numSeatsToSelect = 0;
            currentMovie = null;
            $("#bottom").hide();
            $("#seats").empty();
            displaySchedule();
        })
        .fail(function(jqXHR) {
            alert('Error booking seats: ' + jqXHR.responseJSON.message);
        });
    });

    $("body").on("click", ".bookedSeat", function() {
        alert("This seat is already booked!");
    });

    // Initial load of the schedule
    displaySchedule();
});