const testJson = {
    date: {
        Date: [
            '2005-01-01',
            '2005-02-01',
            '2005-03-01',
            '2005-04-01',
            '2005-05-01',
            '2005-06-01',
            '2005-07-01',
            '2005-08-01',
            '2005-09-01',
            '2005-10-01',
            '2005-11-01',
            '2005-12-01'
        ]
    },
    values: {
        Electricity: [
            6075.318831,
            5768.226051,
            5470.3460544,
            4581.3124563,
            4288.868001906,
            4621.746339,
            4246.5813261,
            4707.7323174,
            4773.7572651,
            4579.2651711,
            4829.5457868,
            6208.392369
        ],
        Gas: [
            4316.274,
            3568.024,
            3414.274,
            2740.849,
            5188.143,
            1604.125,
            1507.775,
            1656.4,
            1883.95,
            1632.825,
            1960.825,
            2656.799
        ],
        Production: [
            109.5382382292,
            103.9349541867,
            60.1583053615,
            212.5378753515,
            445.6962714325,
            231.7735643654,
            288.7031661072,
            417.9111857026,
            347.4208473192,
            353.9181710968,
            348.5802413136,
            275.6994466116
        ],
        HDD: [
            793,
            646,
            595,
            174,
            85,
            0,
            0,
            0,
            5,
            136,
            357,
            800
        ],
        CDD: [
            2,
            0,
            0,
            39,
            67,
            414,
            563,
            554,
            370,
            72,
            5,
            0
        ]
    }
};

var dropZone = document.getElementById('dropZone');

// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
var raw_json;
var formatted_json = {};
var display_json = {};
var types = [];
var fileName = "";
var tables = [];

// Get file data on drop
dropZone.addEventListener('drop', function handleDrop(e) {
    e.stopPropagation(); e.preventDefault();
    var files = e.dataTransfer.files, f = files[0];

    fileName = files[0].name;

    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        if(!rABS) data = new Uint8Array(data);
        var wb = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
        /* DO SOMETHING WITH workbook HERE */
        raw_json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {raw:false, header:1});

        formatDisplayJson();
    };
    if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
});

function formatDisplayJson(){

    // for(var i = 0; i < raw_json[0].length; i++){
    //     formatted_json[raw_json[0][i]] = [];
    // }
    //
    //
    // for( var i = 0; i < raw_json.length-1; i++) {
    //     for (var j = 0; j < raw_json[0].length; j++) {
    //         formatted_json[raw_json[0][j]][i] = raw_json[i+1][j];
    //     }
    // }

    display_json["date"];
    display_json["values"];

    for(var i = 0; i < raw_json[0].length; i++){
        if(i == 0){
            display_json["date"] = [];
        }
        else {
            display_json["values"] = [];
        }
    }

    for(var i = 0; i < raw_json[0].length; i++){
        if(i == 0){
            display_json["date"][raw_json[0][i]] = [];
        }
        else{
            display_json["values"][raw_json[0][i]] = [];
        }
    }

    for( var i = 0; i < raw_json.length-1; i++) {
        for (var j = 0; j < raw_json[0].length; j++) {
            if(j == 0){
                display_json["date"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
            else{
                display_json["values"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
        }
    }


    setupENPI();
}

function reformatJson(){

    // for(var i = 0; i < raw_json[0].length; i++){
    //     formatted_json[raw_json[0][i]] = [];
    // }
    //
    //
    // for( var i = 0; i < raw_json.length-1; i++) {
    //     for (var j = 0; j < raw_json[0].length; j++) {
    //         formatted_json[raw_json[0][j]][i] = raw_json[i+1][j];
    //     }
    // }

    getTypes();

    formatted_json["date"];
    formatted_json["dependent"];
    formatted_json["independent"];

    for(var i = 0; i < raw_json[0].length; i++){
        if(i == 0){
            formatted_json["date"] = [];
        }
        else if(types[i] == "Dependent"){
            formatted_json["dependent"]= [];
        }
        else if(types[i] == "Independent"){
            formatted_json["independent"] = [];
        }
    }

    for(var i = 0; i < raw_json[0].length; i++){
        if(i == 0){
            formatted_json["date"][raw_json[0][i]] = [];
        }
        else if(types[i] == "Dependent"){
            formatted_json["dependent"][raw_json[0][i]] = [];
        }
        else if( types[i] == "Independent"){
            formatted_json["independent"][raw_json[0][i]] = [];
        }
    }

    for( var i = 0; i < raw_json.length-1; i++) {
        for (var j = 0; j < raw_json[0].length; j++) {
            if(j == 0){
                formatted_json["date"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
            else if(types[j] == "Dependent"){
                formatted_json["dependent"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
            else if(types[j] == "Independent"){
                formatted_json["independent"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
        }
    }
}

function getTypes(){

    types = [];

    var typeElements = document.getElementsByClassName("selector");

    //For Dates
    types[0] = "None";

    for(var i = 1; i < typeElements.length+1; i++){
        types[i] = typeElements[i-1].value;
    }

    var numberOfDependents = 0;
    var numberOfIndependents = 0;

    for(var i = 0; i < types.length; i++){
        if(types[i] == "Dependent"){
            numberOfDependents++;
        }
        else if(types[i] == "Independent"){
            numberOfIndependents++;
        }
    }

    if(numberOfDependents == 0 && numberOfIndependents == 0){
        var alert = document.getElementById("alert-box");
        alert.innerHTML = "<strong>Alert</strong>" +
                          "<br>" +
                          "You do not have enough Dependent or Independent columns";
        alert.style.display = "inline";
        document.getElementById("alert-box-row").style.paddingTop = "30px";
        document.getElementById("calculate-btn").disabled = true;
    }
    else if(numberOfDependents == 0){
        var alert = document.getElementById("alert-box");
        alert.innerHTML = "<strong>Alert</strong>" +
            "<br>" +
            "You do not have enough Dependent columns";
        alert.style.display = "inline";
        document.getElementById("alert-box-row").style.paddingTop = "30px";
        document.getElementById("calculate-btn").disabled = true;
    }
    else if(numberOfIndependents == 0){
        var alert = document.getElementById("alert-box");
        alert.innerHTML = "<strong>Alert</strong>" +
            "<br>" +
            "You do not have enough Independent columns";
        alert.style.display = "inline";
        document.getElementById("alert-box-row").style.paddingTop = "30px";
        document.getElementById("calculate-btn").disabled = true;
    }
    else{
        document.getElementById("alert-box").style.display = "none";
        document.getElementById("alert-box-row").style.paddingTop = "0px";
        document.getElementById("calculate-btn").disabled = false;
    }
}

var reg_model = {};

function setupENPI(){
    clearData();

    //reg_model = calc2(5, formatted_json);

    //fillDataBoxs(reg_model);
    fillDataTable(display_json);
    //doRegression(formatted_json)
}

function calcENPI(){

    var numberOfDependents = 0;
    var numberOfIndependents = 0;

    for(var i = 0; i < types.length; i++){
        if(types[i] == "Dependent"){
            numberOfDependents++;
        }
        else if(types[i] == "Independent"){
            numberOfIndependents++;
        }
    }

    if(numberOfDependents > 0 && numberOfIndependents > 0) {
        reformatJson();



        //Works, but do heat map first
        //loadModelContainer(numberOfDependents);

        document.getElementById("model-selection-row").style.display = "inline";
    }
}

function makeHeatmap(){

}

function recalculateSavings(dependentNumber){
    tables[dependentNumber] = findSavings(formatted_json, tables[dependentNumber], dependentNumber);
}

function loadModelContainer(numberOfDependents){

    var modelContainer = document.getElementById("models");
    modelContainer.innerHTML = "";

    for(var i = 0; i < numberOfDependents; i++) {

        tables[i] = findResults(formatted_json);

        var dependentName = Object.keys(formatted_json["dependent"])[i];


        modelContainer.innerHTML += "<div class=\"row\">\n" +
            "          <div class=\"col-2\"></div>\n" +
            "          <div class=\"col-8 model-selection-container\">\n" +
            "            <div class=\"row\">\n" +
            "              <div class=\"col-4\">\n" +
            "                <div class=\"row\">\n" +
            "                  <div class=\"col-12\">\n" +
            "                    <div style=\"text-align: center;\"></div>\n" +
            "                  </div>\n" +
            "                </div>\n" +
            "                <div class=\"row\" style='padding-top: 22px;'>\n" +
            "                  <div id='" + dependentName + "-energy' class=\"col-12\" style=\"text-align: center;\">\n" +
            "                  </div>\n" +
            "                </div>\n" +
            "              </div>\n" +
            "              <div class=\"col-4\">\n" +
            "                <div class=\"row\">\n" +
            "                  <div class=\"col-12\">\n" +
            "                    <div style=\"text-align: center;\"><strong>Model Year</strong></div>\n" +
            "                  </div>\n" +
            "                </div>\n" +
            "                <div class=\"row\">\n" +
            "                  <div class=\"col-12\" style=\"text-align: center;\">\n" +
            "                    <select id='" + dependentName + "-model-year-selector' class=\"model-selector\" onchange=\"recalculateSavings(" + i + ")\">\n" +
            "                    </select>\n" +
            "                  </div>\n" +
            "                </div>\n" +
            "              </div>\n" +
            "              <div class=\"col-4\">\n" +
            "                <div class=\"row\">\n" +
            "                  <div class=\"col-12\">\n" +
            "                    <div style=\"text-align: center;\"><strong>Model</strong></div>\n" +
            "                  </div>\n" +
            "                </div>\n" +
            "                <div class=\"row\">\n" +
            "                  <div class=\"col-12\" style=\"text-align: center;\">\n" +
            "                    <select id=\"" + dependentName + "-model-selector\" class=\"model-selector\" onchange=\"recalculateSavings(" + i + ")\">\n" +
            "                    </select>\n" +
            "                  </div>\n" +
            "                </div>\n" +
            "              </div>\n" +
            "            </div>\n" +
            "          </div>\n" +
            "          <div class=\"col-2\"></div>\n" +
            "          <div class='col-2'></div>" +
            "          <div class='col-8' style='height: 150px; width: 100px; background-color: red;'></div>" +
            "          <div class='col-2'></div>" +
            "        </div>";

        var energy = document.getElementById(dependentName + "-energy");
        energy.innerHTML = "<strong>" + dependentName + "</strong>";


        var modelYearSelector = document.getElementById(dependentName + "-model-year-selector");
        modelYearSelector.innerHTML = "";

        for(var j = 0; j < (formatted_json["date"][Object.keys(formatted_json.date)].length-11); j++) {
            modelYearSelector.innerHTML += "<option value="+j+">" + formatted_json["date"][Object.keys(formatted_json.date)][j] + "</option>";
        }

        var models = document.getElementById(dependentName + "-model-selector");
        models.innerHTML = "";

        for(var j = 0; j < tables[i].combinations.length; j++){
            var combinationStr = "";
            for(var k = 0; k < tables[i].combinations[j].length; k++){
                combinationStr += tables[i].combinations[j][k];
                if(k != (tables[i].combinations[j].length-1)){
                    combinationStr += " / ";
                }
            }
            models.innerHTML += "<option value=" + i + ">" + combinationStr + "</option>";
        }

        tables[i] = findSavings(formatted_json, tables[i], i);

    }
}



function fillDataBoxs(json){

    document.getElementById("fitted-model").textContent = json.fittedModal;
    document.getElementById("r-square").textContent = json.rSquare;
    document.getElementById("f-statistic").textContent = json.fStatistic;
    document.getElementById("mean").textContent = json.mean_base;
    document.getElementById("variance").textContent = json.variance;
    document.getElementById("mean-1").textContent = json.mean_1;
    document.getElementById("mean-2").textContent = json.mean_2;
    document.getElementById("var-1").textContent = json.vari1;
    document.getElementById("var-2").textContent = json.vari2;
    document.getElementById("first-order").textContent = json.firstO;
    document.getElementById("second-order").textContent = json.secondO;
    document.getElementById("durbin-watson").textContent = json.durbanWatson;
    document.getElementById("mean-abs-error").textContent = json.meanAbsE;
    document.getElementById("normality").textContent = json.normalityCond;
    document.getElementById("i-residual").textContent = json.iResidual;
}

function fillDataTable(json){

    var nameDisplay = document.getElementById("filename-display");
    nameDisplay.innerHTML = "<strong>" + fileName + "</strong>";
    nameDisplay.style.display = "block";

    document.getElementById("filename-display-row").style.paddingTop = "50px";

    var dataTable = document.getElementById("data-table");
    var firstRow = dataTable.insertRow(0);

    var valueKeys = Object.keys(json.values);

    for(var i = 0; i < json.date.Date.length; i++){
        var newRow = dataTable.insertRow(i);

        for(var j = Object.keys(json.values).length-1; j >= 0; j--){
            var newCol = newRow.insertCell(0);
            newCol.innerHTML = json["values"][valueKeys[j]][i];
            newCol.style.textAlign = "center";
            //newCol.innerHTML = json["independent"][independentKeys[i]];
        }
        //Date should only have one col
        var newCol = newRow.insertCell(0);
        newCol.innerHTML = json["date"][Object.keys(json.date)][i];
        newCol.style.textAlign = "center";
    }

    firstRow = dataTable.insertRow(0);
    firstRow.id = "title-row";

    for(var i = Object.keys(json.values).length-1; i >= 0; i--){
        var newCol = firstRow.insertCell(0);
        newCol.innerHTML = ("<strong>"+valueKeys[i]+"</strong>");
        newCol.style.textAlign = "center";
    }

    //Date should only have one col
    var newCol = firstRow.insertCell(0);
    newCol.innerHTML = ("<strong>"+Object.keys(json.date)[0]+"</strong>");
    newCol.style.textAlign = "center";

    firstRow = dataTable.insertRow(0);
    firstRow.id = "type-row";

    for(var i = 0; i < (Object.keys(json.values).length+1); i++){
        var newCol = firstRow.insertCell(0);
        if(i != (Object.keys(json.values).length)) {    //No option for Date
            newCol.innerHTML = ("<select name=\"\" class=\"selector\" onchange=\"getTypes()\">\n" +
                                "    <option value=\"None\">None</option>\n" +
                                "    <option value=\"Dependent\">Dependent</option>\n" +
                                "    <option value=\"Independent\">Independent</option>\n" +
                                "  </select>");
            newCol.style.textAlign = "center";
            //newCol.style.textAlign = "center";
        }
    }
    firstRow.style.backgroundColor = "white";

    document.getElementById("calculate-btn").style.display = "inline";
    document.getElementById("calculate-btn-row").style.paddingTop = "30px";
    document.getElementById("data-table-div").style.height = "500px";

    getTypes();
}

function runTestCase(){
    clearData();
    //reg_model = calc2(5, testJson);
    //fillDataBoxs(reg_model);
    fillDataTable(testJson);
    getTypes();

    //doRegression(testJson);
}

function clearData(){
    document.getElementById("data-table").innerHTML="";

    document.getElementById("fitted-model").textContent = "";
    document.getElementById("r-square").textContent = "";
    document.getElementById("f-statistic").textContent = "";
    document.getElementById("mean").textContent = "";
    document.getElementById("variance").textContent = "";
    document.getElementById("mean-1").textContent = "";
    document.getElementById("mean-2").textContent = "";
    document.getElementById("var-1").textContent = "";
    document.getElementById("var-2").textContent = "";
    document.getElementById("first-order").textContent = "";
    document.getElementById("second-order").textContent = "";
    document.getElementById("durbin-watson").textContent = "";
    document.getElementById("mean-abs-error").textContent = "";
    document.getElementById("normality").textContent = "";
    document.getElementById("i-residual").textContent = "";

    var nameDisplay = document.getElementById("filename-display");
    nameDisplay.innerHTML = "";
    nameDisplay.style.display = "none";

    document.getElementById("filename-display-row").style.paddingTop = "0px";
    document.getElementById("data-table-div").style.height = "0px";
    document.getElementById("alert-box").style.display = "none";

}


