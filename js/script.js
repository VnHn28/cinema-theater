$(document).ready(function(){
    const arrMovie = [];
    const arrMovieSeating = [];
    let seatingIndex = 0;
    let whichMovieSeats; // The index of the movie whose seats are being displayed
    let seatSelection; // How many seats are left to pick
    let numofseatstoSelect; // The original number of seats the user wanted
    let arrSelectedseat = []; // Holds currently picked seats {row, col}

    $("#bottom").hide();

    $("#btnAddMovie").click(function(){
        let duplicateSchedule = false;

        if ($("#txtTitle").val().trim() === "") {
            alert("Please enter a movie title!");
            return;
        }
        if(arrMovie.length){
            const newMovieTime = $("#cmbTime option:selected").text();
            const newMovieStudio = $("#cmbStudio option:selected").val();
            for (const movie of arrMovie) {
                if(movie.time === newMovieTime && movie.studio === newMovieStudio){
                    duplicateSchedule = true;
                    break;
                }
            }
        }

        if (duplicateSchedule){
            alert("Unable to set this schedule for this cinema!");
        } else {
            const movie = {
                title: $("#txtTitle").val(),
                time: $("#cmbTime option:selected").text(),
                studio: $("#cmbStudio option:selected").val(),
                index: seatingIndex
            };

            arrMovie.push(movie);
            seatingIndex++;

            generateSeats();
            displaySchedule();
        }
    });

    function generateSeats(){
        const arrRow = [];
        for (let i = 0; i < 15; i++) {
            const arrCollumn = [];
            const row = String.fromCharCode(i + 65);
            for (let j = 0; j < 18; j++) {
                const seatId = row + (j < 10 ? '0' + j : j);
                const objSeat = {
                    id: seatId,
                    status: "non", // 'non', 'picked', 'booked'
                    row: i,
                    col: j
                };
                arrCollumn.push(objSeat);
            }
            arrRow.push(arrCollumn);
        }
        arrMovieSeating.push(arrRow);
    }

    $("#cmbSchedule").change(displaySchedule);

    function displaySchedule(){
        const thisStudio = $("#cmbSchedule option:selected").val();
        const timeTable = $("#timeTable");
        $("#timeTable").empty();
        for (const movie of arrMovie) {
            if(movie.studio === thisStudio){
                const newSchedule = $("<div>", {
                    class: 'movieSchedule',
                    text: `${movie.time} _ ${movie.title}`,
                    'data-index': movie.index
                });
                timeTable.append(newSchedule);
            }
        }
    }

    $("body").on("click", ".movieSchedule", function(){
        whichMovieSeats = $(this).data('index');
        displaySeats();
    });

    function displaySeats(){
        if (typeof whichMovieSeats === 'undefined') return;

        const movieSeating = arrMovieSeating[whichMovieSeats];
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
                    }
                    seatsContainer.append(seat);
                }
            }
        }
    }

    $("#btnSelect").click(function(){
        const numSeats = parseInt($("#numSeats").val(), 10);
        if (isNaN(numSeats) || numSeats <= 0) {
            alert("Please enter a valid number of seats.");
            return;
        }

        seatSelection = numSeats;
        numofseatstoSelect = numSeats;
        arrSelectedseat = []; // Reset previous selections

        $("#bottom").show();
        $("#seatLeft").text("Seats to pick: " + seatSelection);
    });

    // --- Seat Interaction Event Handlers ---

    $("body").on("mouseenter", ".availableSeat", function(){
        $(this).fadeTo("fast", 0.8);
    }).on("mouseleave", ".availableSeat", function(){
        $(this).fadeTo("fast", 1);
    });

    $("body").on("click", ".availableSeat", function(){
        if (typeof seatSelection === 'undefined' || numofseatstoSelect <= 0) {
            alert("Please first select the number of seats you want to book.");
            return;
        }

        const seat = $(this);
        const seatStatus = seat.data('status');
        const seatRow = seat.data('row');
        const seatCol = seat.data('col');

        if (seatStatus === 'picked') {
            // DESELECT a seat
            seat.css({"background-color": 'grey'}).data('status', 'non');
            seatSelection++;
            arrSelectedseat = arrSelectedseat.filter(s => !(s.row === seatRow && s.col === seatCol));
        } else if (seatStatus === 'non') {
            // SELECT a seat
            if (seatSelection > 0) {
                seat.css({"background-color": '#fec700'}).data('status', 'picked');
                seatSelection--;
                arrSelectedseat.push({ row: seatRow, col: seatCol });
            } else {
                alert(`You have already selected ${numofseatstoSelect} seat(s).`);
            }
        }
        $("#seatLeft").text("Seats to pick: " + seatSelection);
    });

    $("#btnBook").click(function(){
        if (seatSelection > 0) {
            alert(`Please select ${seatSelection} more seat(s) to continue.`);
            return;
        }
        if (arrSelectedseat.length === 0) {
            alert("No seats were selected to book.");
            return;
        }

        const movieSeating = arrMovieSeating[whichMovieSeats];
        for (const ticket of arrSelectedseat) {
            const thisRow = ticket.row;
            const thisCol = ticket.col;
            movieSeating[thisRow][thisCol].status = "booked";
        }

        // Reset state and UI
        seatSelection = undefined;
        numofseatstoSelect = 0;
        arrSelectedseat = [];
        $("#bottom").hide();
        displaySeats();
    });

    $("body").on("click", ".bookedSeat", function(){
        alert("This seat is already booked!");
    });
});