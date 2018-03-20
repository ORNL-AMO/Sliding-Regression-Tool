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
    dependent: {
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
        ]
    },
    independent: {
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

// Get file data on drop
dropZone.addEventListener('drop', function handleDrop(e) {
    e.stopPropagation(); e.preventDefault();
    var files = e.dataTransfer.files, f = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = e.target.result;
        if(!rABS) data = new Uint8Array(data);
        var wb = XLSX.read(data, {type: rABS ? 'binary' : 'array'});

        /* DO SOMETHING WITH workbook HERE */
        raw_json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {raw:false, header:1});

        formatJson();
    };
    if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);



});

function formatJson(){

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

    formatted_json["date"];
    formatted_json["dependent"];
    formatted_json["independent"];

    for(var i = 0; i < raw_json[0].length; i++){
        if(i == 0){
            formatted_json["date"] = [];
        }
        else if(i < 3){
            formatted_json["dependent"]= [];
        }
        else{
            formatted_json["independent"] = [];
        }
    }

    for(var i = 0; i < raw_json[0].length; i++){
        if(i == 0){
            formatted_json["date"][raw_json[0][i]] = [];
        }
        else if(i < 3){
            formatted_json["dependent"][raw_json[0][i]] = [];
        }
        else{
            formatted_json["independent"][raw_json[0][i]] = [];
        }
    }

    for( var i = 0; i < raw_json.length-1; i++) {
        for (var j = 0; j < raw_json[0].length; j++) {
            if(j == 0){
                formatted_json["date"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
            else if(j < 3){
                formatted_json["dependent"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
            else{
                formatted_json["independent"][raw_json[0][j]][i] = [raw_json[i+1][j]];
            }
        }
    }

    calcENPI();
}

var reg_model = {};

function calcENPI(){
    clearData();

    reg_model = calc2(5, formatted_json);

    fillDataBoxs(reg_model);
    fillDataTable(formatted_json);
    doRegression(formatted_json)
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

    var dataTable = document.getElementById("data-table");
    var firstRow = dataTable.insertRow(0);

    var independentKeys = Object.keys(json.independent);
    var dependentKeys = Object.keys(json.dependent);

    for(var i = 0; i < Object.keys(json.independent).length; i++){
        var newCol = firstRow.insertCell(0);
        newCol.innerHTML = ("<strong>"+independentKeys[i]+"</strong>");
        //newCol.innerHTML = json["independent"][independentKeys[i]];
    }

    for(var i = 0; i < Object.keys(json.dependent).length; i++){
        var newCol = firstRow.insertCell(0);
        newCol.innerHTML =("<strong>"+ dependentKeys[i]+"</strong>");
    }

    //Date should only have one col
    var newCol = firstRow.insertCell(0);
    newCol.innerHTML = ("<strong>"+Object.keys(json.date)[0]+"</strong>");

    for(var i = 1; i < json.date.Date.length; i++){
        var newRow = dataTable.insertRow(i);



        for(var j = 0; j < Object.keys(json.independent).length; j++){
            var newCol = newRow.insertCell(0);
            newCol.innerHTML = json["independent"][independentKeys[j]][i];
            //newCol.innerHTML = json["independent"][independentKeys[i]];
        }


        for(var j = 0; j < Object.keys(json.dependent).length; j++){
            var newCol = newRow.insertCell(0);
            newCol.innerHTML = json["dependent"][dependentKeys[j]][i];
        }

        //Date should only have one col
        var newCol = newRow.insertCell(0);
        newCol.innerHTML = json["date"][Object.keys(json.date)][i];
    }
}

function runTestCase(){
    clearData();
    reg_model = calc2(5, testJson);
    fillDataBoxs(reg_model);
    fillDataTable(testJson);

    doRegression(testJson);
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
}


