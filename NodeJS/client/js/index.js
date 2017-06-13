/**
 * Created by Linh Do on 25.05.2017.
 */

var aC_ButtonIndex = 0;
var colors = ["red", "blue", "green", "yellow", "cyan", "Coral", "grey"];

$("#addContentButton").draggable({cancel:false});
$(".dropdownBoxOptions").hide();
$( init );



$("#addContentButton").click(function() {
    $(".dropdownBoxOptions").toggle();
});

$("#addCalendarBox").click(function() {
    addCalendarBox();
});

$("#addWatchBox").click(function() {
    addWatchBox();
});

$("#addWeatherBox").click(function() {
    addWeatherBox();
});

function init() {
    var sockjs_url = '/echo';
    var sockjs = new SockJS(sockjs_url);

    sockjs.onopen = function() {
        console.log('resetConnections');
        sockjs.send('resetConnections');
        sockjs.close();
    };

    sockjs.onmessage = function(e)  {};
    sockjs.onclose = function() {};
    var SocketMessageHandler = socketMessageHandler();
}

function addWatchBox() {
// addContentBox();
    addContentBox();
    $("#contentBox"+(aC_ButtonIndex-1)).addClass('watchBox');
    addTime(aC_ButtonIndex-1);
}

function addCalendarBox() {
    addContentBox();
    $("#contentBox"+(aC_ButtonIndex-1)).addClass('calendarBox');
    addCalEvents(aC_ButtonIndex-1);

}

function addWeatherBox() {
    addContentBox();
    $("#contentBox"+(aC_ButtonIndex-1)).addClass('weatherBox');
    addWeather((aC_ButtonIndex-1));

}

function addContentBox() {
    $("#contentBoxPanel").append("<div id=" + ("contentBox"+aC_ButtonIndex)+" class='contentBox'></div>");
    $(".contentBox").draggable();
    aC_ButtonIndex++;
    $(".dropdownBoxOptions").hide();
    indexEditMode();
}

function addCalEvents(aC_ButtonIndex){
    var sockjs_url = '/echo';
    var sockjs = new SockJS(sockjs_url);
    sockjs.onopen = function() {
        sockjs.send('getCalEvents');
    };

    sockjs.onmessage = function(e)  {
        //prüfe, ob vom Server wirklich eine message gesendet wurde, die die Kalenderevents beinhaltet
        if(JSON.parse(e.data)[0]=="getCalInfos") {
            var calendarEvents = JSON.parse(e.data);
            var div = $("#contentBox"+aC_ButtonIndex);
            //entfernt den bisherigen Text des div Elements
            div.contents().filter(function () {
                return this.nodeType === 3; // Text nodes only
            }).remove();
            //Kalender Events in die div auflisten lassen
            for (var i = 1; i < calendarEvents.length; i++) {
                var event = calendarEvents[i];
                if(event[10]=='T'){
                    //formatiere datum, uhrzeit, eventname
                    event = event.substring(0,10) + ' ' + event.substring(11,19) + event.substring(25,event.length);
                }
                div.append($("<code>").text(event));
                div.append($("<br>"));
            }
        }
        //div.scrollTop(div.scrollTop()+10000);
        sockjs.close();
    };

    sockjs.onclose = function() {
    };
}

function addTime(aC_ButtonIndex){
    startTime(aC_ButtonIndex);
    function startTime(aC_ButtonIndex) {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        var y = today.getFullYear();
        var mo = today.getMonth()+1;
        var t = today.getDate();

        var weekday = new Array(7);
        weekday[0] = "Sonntag";
        weekday[1] = "Montag";
        weekday[2] = "Dienstag";
        weekday[3] = "Mittwoch";
        weekday[4] = "Donnerstag";
        weekday[5] = "Freitag";
        weekday[6] = "Samstag";

        var n = weekday[today.getDay()];

        $('#contentBox'+aC_ButtonIndex).html(h + ":" + m + ":" + s + '</Br>' + n + '</Br>' + t + "." + mo + "." + y);
        // document.getElementById('contentBox'+aC_ButtonIndex).innerHTML =
        //     h + ":" + m + ":" + s + '</Br>' + n + '</Br>' + t + "." + mo + "." + y;
        var t = setTimeout(startTime, 500);
    }
    function checkTime(i) {
        if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }
}

var myVar = setInterval(addWeather, 3000);
function addWeather(index){

    var div = $("#contentBox"+index);

    //fehleranfällig, das async=false gesetzt wird, synchron funktioniert aber alles viel langsamer
    // function getJSON(yourUrl) {
    //     var Httpreq = new XMLHttpRequest(); // a new request
    //         Httpreq.open("GET",yourUrl,false);
    //         Httpreq.send(null);
    //     return Httpreq.responseText;
    // }
	var city = "Hamburg"
	var source = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&lang" +"&appid=";
	var lang = "de"
	var appId = "8a33c4e62d48218b75a9adcdf31375e8"

	var address = source + appId;

	// var json = JSON.parse(getJSON(address));
    $.getJSON(address,function(json){
        // document.write(JSON.stringify(json));
        var beschr = json.weather[0].description;
        var tempCels = json.main.temp - 273.15; //Default in Kelvin - Umrechnung in Celsius
        tempCels = tempCels.toFixed(1);			//Beschränkung von einer Nachkommastelle
        var icohtml = '<img src=' + '\"' + 'http://openweathermap.org/img/w/' + json.weather[0].icon + '.png"' + 'height="100" width="100"' + '>';
        var icon = json.weather[0].icon;
        icon = icon.replace("\"","");
        var iconUrl = "http://openweathermap.org/img/w/" + icon + ".png";

        div.append($("<code>").text(city));
        div.append($("<br>"));
        div.append($("<code>").text(tempCels + "°"));
        div.append($(icohtml));
        div.append($("<br>"));
        div.append($("<code>").text(beschr));
        div.append($("<br>"));
    });

    // document.getElementById('contentBox'+aC_ButtonIndex).innerHTML =
    // city + '<br/>' + tempCels + "°" +  icohtml + '<br/>' + beschr + '<br/>';

	//console.log(json)
}

function socketMessageHandler(){
    var sockjs_url = '/echo';
    var sockjs = new SockJS(sockjs_url);

    sockjs.onopen = function() {
        //console.log("sockjs " + JSON.stringify(sockjs));
        console.log('open client socketMessageHandler');
        messageobj = {'messagetype': 'newConn','connName':'IndexConn'};
        message = JSON.stringify(messageobj);
        //sockjs.send('newConnName: IndexConn');
        sockjs.send(message);
    };

    sockjs.onmessage = function(e)  {
        //prüfe, ob vom Server wirklich eine message gesendet wurde, die die Kalenderevents beinhaltet
        console.log("IndexConn:" + e.data);
        // console.log("hi von app von Sm_app");
        //div.scrollTop(div.scrollTop()+10000);
        if(e.data == "indexEditMode"){
            indexEditMode();
        }
        if(e.data == "addWatchBox"){
            console.log("addWatchBox");
            addWatchBox();
        }
        if(e.data == "addCalendarBox"){
            console.log("addCalendarBox");
            addCalendarBox();
        }
        if(e.data == "addWeatherBox"){
            console.log("addWeatherBox");
            addWeatherBox();
        }

    };

    sockjs.onclose = function() {
        console.log('close');
    };
}

function indexEditMode() {
    console.log("dofunction: " + "indexEditMode");
    $('.contentBox').each(function(index, obj) {
        $( this ).css({"border-color": colors[index], "border-style": "solid"});
    });
}

/* When the user clicks on the button,
 toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it

/**
 *
 * //muss noch überarbeitet werden für jquery!!!!!!!!!!!!!!
 */
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}