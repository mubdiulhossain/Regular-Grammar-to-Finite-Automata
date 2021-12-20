var input = document.getElementById("myFile");
var reader = new FileReader();
var output = document.getElementById("inputString");
var mainview = document.getElementById("mainView");

reader.onloadend = function () {
    if (reader.result.length != 0) {
        output.value = reader.result;
    }
    else {
        mainview.innerHTML = "File is empty or not supported!";
    }
}
input.addEventListener("change", handleFiles, false);

function handleFiles() {
    var fileSelected = this.files[0]; /* now you can work with the file list */
    reader.readAsBinaryString(fileSelected);
    
}

function clearTextField() {
    output.value = "";
    mainview.innerHTML = "";
}
