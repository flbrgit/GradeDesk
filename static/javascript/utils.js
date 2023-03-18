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
    location.reload();
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
