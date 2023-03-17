// Function to download data to a file
function download(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        console.log(url);
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
        console.log("Success");
    }
}

let reader;

/**
 * Check for the various File API support.
 */
function checkFileAPI() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        reader = new FileReader();
        return true;
    } else {
        alert('The File APIs are not fully supported by your browser. Fallback required.');
        return false;
    }
}

function innerText(output, object){
    output = parse_content(output);
    object.set_students(output[0]);
    object.set_sections(output[1]);
    object.set_exams(output[2]);
}

/**
 * read text input
 */
function readText(filePath, end_object) {
    if(filePath.files && filePath.files[0]) {
        reader.onload = function (e) {
            innerText(e.target.result, end_object);
        };
        reader.readAsText(filePath.files[0]);
    }
}

/**
 * display content using a basic HTML replacement
 */
function parse_content(txt) {
    return JSON.parse(txt);
}


const removeChildren = (parent) => {
    if(parent === null)
        return;
    while(true){
        let next = parent.firstChild;
        if(next === null)
            break;
        parent.removeChild(next);
    }
};

function create_canvas(parent){
    // Grundvariablen
    var chartheight = 300;
    var yoffset = 30;
//document.getElementById('beschriftung').style.top = "300px";
    values = new Array();

    values[1]   = [135 , 142, 184, 171, 196,201, 189, 182], // Online Werbeumsatz in MIO / Mon 2010 Dtl.
        values[2]  = [113, 116, 147, 137, 138, 132, 129, 121,0,0,0,0], // 2009
        beschriftung = ["Jan", "Feb", "M&auml;r", "Apr", "Mai", "Jun", "Jul" ,"Aug"];

    vmax = 0 ;    // zur Anpassung der values an die Canvashöhe
    // Höchsten Wert bestimmen
    for(var i = 0; i < values[1].length; i++) {
        if (values[1][i] > vmax) {
            vmax = values[1][i];
        }
    }

//Canvas - Balken
    var bc = {
        canvas   : null,  // Canvas Element
        ctx      : null,  // 2D-Grafikkontext vom Canvas

        //values2    :   [19, 24, 25, 24, 42, 52, 47, 50],  // porzentale Veränderung zu 2009
        barWidth : 30,        // Breite der Balken
        barFill  : null,      // Farbverlauf für Säulen
        backgroundFill: null, // Farbverlauf für Hintergrund

        scale    : 1,         // Skalierungsfaktor während der Animation
        duration : 3,       // Dauer der Animation in Sekunden
        fps      : 25,        // Anzahl der Bilder pro Sekunde
        startTime: 0,         // Startzeitpunkt der Animation
        timer    : null,      // JavaScript Timer


        init: function() {
            //layer += 1;
            //alert (layer);
            bc.canvas = document.getElementById('canvas1');
            if(bc.canvas && bc.canvas.getContext) {
                bc.ctx = bc.canvas.getContext('2d');

                // Farbverläufe
                bc.barFill = bc.ctx.createLinearGradient( 100, 0, 0, 120);
                bc.barFill.addColorStop(0.7, 'lightcyan');
                bc.barFill.addColorStop(.71, 'white');

                //if (layer <2 ) {
                // alert ("bg"+layer+" erzeugen");
                bc.backgroundFill = bc.ctx.createLinearGradient( 0, 0, 0, bc.canvas.height);
                bc.backgroundFill.addColorStop(0.0, '#666666');
                bc.backgroundFill.addColorStop(1.0, '#CCCCCC');
                //}

                // Start
                bc.animStart();
            }
        },

        draw: function() {
            // Hintergrund zeichnen
            bc.ctx.fillStyle = bc.backgroundFill;
            bc.ctx.fillRect(0, 0, bc.canvas.width, bc.canvas.height);

            // Status retten und Ursprung nach unten verschieben
            // sowie Koordinaten an der x-Achse spiegeln
            bc.ctx.save();

            bc.ctx.translate(20, bc.canvas.height - yoffset);
            bc.ctx.scale(1, -1);

            bc.ctx.fillStyle = "red";
            // xxx bc.ctx.fillRect = (0,);

            // Säulen zeichnen
            for(var i = 0; i < values[1].length; i++) {

                bc.ctx.fillStyle = bc.barFill;
                bc.ctx.fillRect(i * (bc.barWidth + 10), 0, bc.barWidth, bc.scale * values[1][i] * (chartheight-yoffset*2) / vmax);
                //          x1          y1      x2        y2            Höhe des Canvas - Doppelter Rand / Höchstwert (zur Skalierung)

            }

            // Alten Status wiederherstellen
            bc.ctx.restore();
        },

        animate: function() {
            var diffTime = new Date().getTime() - bc.startTime;

            // Skalierungsfaktor (0.0 bis 1.0) für Säulen berechnen
            bc.scale = diffTime / (1000 * bc.duration);

            // Ende?
            if(diffTime >= 1000 * bc.duration) {
                bc.scale = 1.0; // Auf 1.0 setzen, damit die Säulen am Schluss mit
                                // Sicherheit mit dem richtigen Wert gezeichnet werden

                showData();

                clearInterval(bc.timer);


                // Neustart nach 10 Sekunden
                //setTimeout(bc.animStart, 1000 * 10);
            }

            bc.draw();
        },

        animStart: function() {
            bc.startTime = new Date().getTime();
            bc.timer = setInterval(bc.animate, 1000 / bc.fps);
        },


        // Make data output
    };

    function showData () {
        // Balken in Datenmaske erstellen
        for(var i = 0; i < values[1].length; i++) {

            var x1 = i * (bc.barWidth + 10) + 20;
            var y1 = chartheight - yoffset - bc.scale * values[1][i] * (chartheight-yoffset*2) / vmax;
            var x2 = i * (bc.barWidth + 10) + 20 + bc.barWidth;
            var y2 = chartheight - yoffset;

            balken = document.createElement('area');
            balken.setAttribute("title", beschriftung[i] + ": EUR " + values[1][i] + " Mio.");
            balken.setAttribute("shape", "rect");
            balken.setAttribute("coords", x1 + "," + y1 + "," + x2 + "," + y2);
            balken.setAttribute("href", "#");
            document.getElementById('data').appendChild(balken);

            // Titel einblenden
            var yTitle = y1;
            titel = document.createElement('div');
            titel.setAttribute("style", "left:" + x1 + "px; top:" + yTitle + "px;" );
            titel.innerHTML = values[1][i] ;        // +beschriftung[i]
            document.getElementById('titel').appendChild(titel);

            // Beschriftung einblenden
            yBeschriftung = chartheight - 22;
            beschr = document.createElement('div');
            beschr.setAttribute("style", "left:" + x1 + "px; top:" + yBeschriftung + "px;" );
            beschr.innerHTML = beschriftung[i] ;        // +beschriftung[i]
            document.getElementById('beschriftung').appendChild(beschr);


        }
    }

}
