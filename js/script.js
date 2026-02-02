$(document).ready(function(){
    let arrMovie = [];
    let movie;
    let objSeat;
    let arrMovieSeating = [];
    let seatingIndex=0;
    let whichmovieSeats;
    let seatSelection;
    let numofseatstoSelect;

    //if(seatSelection<=0){
        $("#bottom").hide();
    //}

    $("#btnAddMovie").click(function(){
        let duplicateSchedule = false;
        if(arrMovie.length){
            for (var i = 0; i < arrMovie.length; i++) {
                let thisMovie = arrMovie[i];
                let movie_time=$("#cmbTime option:selected").text();
                let movie_studio=$("#cmbStudio option:selected").val();
                if(thisMovie.time==movie_time && thisMovie.studio==movie_studio){
                    duplicateSchedule = true;
                    break;
                }
            }
        }
        if (duplicateSchedule){
            alert("Unable to set this schedule for this cinema!");
        } else {
            movie = new Object();
            movie.title=$("#txtTitle").val();
            movie.time=$("#cmbTime option:selected").text();
            movie.studio=$("#cmbStudio option:selected").val();
            movie.index=seatingIndex;

            arrMovie.push(movie);
            seatingIndex++;

            generateSeats();

            displaySchedule();
        }
    })

    function generateSeats(){
        let arrRow=[];
        //$("#seats").innerHTML=t;
        for (var i = 0; i < 15; i++) {
            var arrCollumn = [];
            row=String.fromCharCode(i+65);
            for (var j = 0; j < 18; j++) {
                //console.log(row+j)
                objSeat = new Object();
                if(j<10){
                    objSeat.id = row+'0'+j;
                } else{
                    objSeat.id = row+j;
                }
                objSeat.status = "non";
                objSeat.row = row;
                objSeat.col = j;
                arrCollumn.push(objSeat);
            }
            arrRow.push(arrCollumn);
        }
        arrMovieSeating.push(arrRow);
    }

    $("#cmbSchedule").change(function(){
        displaySchedule();
    })

    function displaySchedule(){
        var thisStudio = $("#cmbSchedule option:selected").val();
        //alert(thisStudio)
        $("#timeTable").empty();
        for (var i = 0; i < arrMovie.length; i++) {
            let thisMovie = arrMovie[i];
            if(thisMovie.studio==thisStudio){
                //alert("in");
                var newSchedule=document.createElement("div");
                newSchedule.innerHTML = thisMovie.time+' _ '+thisMovie.title;
                newSchedule.value = thisMovie.index;
                newSchedule.className = 'movieSchedule';
                let loc = $("#timeTable");
                loc.append(newSchedule);
            }
        }
    }

    $("body").on("click", ".movieSchedule", function(){
        whichmovieSeats = $(this).val();
        //alert(whichmovieSeats);
        displaySeats();
    })

    function displaySeats(){
        //alert(arrMovieSeating.length);
        var stairs = 0;
        var splicechairArr = 0
        let thisMovie = whichmovieSeats;
        //alert(thisMovie);
        let movieSeating = arrMovieSeating[thisMovie];
        $("#seats").empty();
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 20; j++) {
                var seat = document.createElement("div");
                if (j==4||j==15) {
                    stairs+=1;
                    seat.className = "stair";
                } else {
                    seat.innerHTML = movieSeating[i][j-stairs].id;
                    seat.value = movieSeating[i][j-stairs].status;
                    //console.log(seat.value);
                    seat.row = movieSeating[i][j-stairs].row;
                    //console.log(seat.row);
                    seat.col = movieSeating[i][j-stairs].col;
                    //console.log(seat.col);
                    seat.mov = whichmovieSeats;
                    //console.log(seat.mov);
                    seat.arr = splicechairArr;

                    if(seat.value=="non"){
                        seat.className = "availableSeat";
                    } else if(seat.value=="booked"){
                        seat.className="bookedSeat";
                    }
                    splicechairArr++;
                }

                let loc = $("#seats");
                loc.append(seat);
            }
            stairs=0;
        }
    }

    $("#btnSelect").click(function(){
        seatSelection=$("#numSeats").val();
        numofseatstoSelect=seatSelection;

        $("#bottom").show();
        $("#seatLeft").html("Seats to pick: "+seatSelection);
        alert("Seats to pick: "+seatSelection);
        mTix();

    })

    function mTix(){
        let thisMovie;
        let arrSelectedseat = [];

        if(seatSelection>-1){
            $("body").on("mouseenter", ".availableSeat", function(){
                $(this).fadeTo("fast",0.8);
            });
            $("body").on("mouseleave", ".availableSeat", function(){
                $(this).fadeTo("fast", 1);
            });

            if(seatSelection>0){ 
                $("body").on("click", ".availableSeat", function(){
                    thisMovie = $(this).prop('mov');

                    if($(this).prop('value')=='non'){
                        $(this).css({"background-color":'#fec700'});
                        $(this).prop('value', 'picked');
                        
                        objTicket = new Object();
                        objTicket.index = $(this).prop('arr');
                        objTicket.row = $(this).prop('row');;
                        objTicket.col = $(this).prop('col');
                        arrSelectedseat.push(objTicket);

                        // alert(arrSelectedseat.length);
                        seatSelection--;
                         alert(seatSelection);
                    } else if($(this).prop('value')=="picked"){
                        console.log("clicked");
                        for (var i = 0; i < arrSelectedseat.length; i++) {
                            if(arrSelectedseat[i].index==$(this).prop('arr')){
                                arrSelectedseat.splice(i,1);
                            }
                        }
                        $(this).css({"background-color":'grey'});
                        $(this).prop('value', 'non');
                        seatSelection++;
                        // alert(seatSelection);
                    }
                    //alert($(this).val());
                    
                });
            } else if(seatSelection==0){
                $("body").on("click", ".availableSeat", function(){
                    alert("Currently already "+numofseatstoSelect+" seat(s) are selected!")
                });
            } 

            $("#btnBook").click(function(){
                for (var i = 0; i < arrSelectedseat.length; i++) {
                    let thisRow = arrSelectedseat[i].row;
                    //alert(thisRow);
                    let thisCol = arrSelectedseat[i].col;
                    //alert(thisCol);
                    let movieSeating = arrMovieSeating[thisMovie];

                    movieSeating[thisRow][thisCol].status = "booked";
                }
                seatSelection--;
                $("#bottom").hide();
                displaySeats();
            });

            $("body").on("click", ".bookedSeat", function(){
                       alert("This seat is already booked!");
            });
        } 
    }

})