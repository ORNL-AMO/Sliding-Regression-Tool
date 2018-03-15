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

var fittedModel;
var yValues;
var rSquare, fStatistic, mean_base, variance, mean_1, mean_2, vari1, vari2, firstO, secondO, durbanWatson, meanAbsE;
var normalityCond;
var iResidual = [];

function calcENPI(){

    calc2(5, formatted_json);

    fillDataBoxs();

    //display();
}

function fillDataBoxs(){

    document.getElementById("fitted-model").textContent = fittedModel;
    document.getElementById("r-square").textContent = rSquare;
    document.getElementById("f-statistic").textContent = fStatistic;
    document.getElementById("mean").textContent = mean_base;
    document.getElementById("variance").textContent = variance;
    document.getElementById("mean-1").textContent = mean_1;
    document.getElementById("mean-2").textContent = mean_2;
    document.getElementById("var-1").textContent = vari1;
    document.getElementById("var-2").textContent = vari2;
    document.getElementById("first-order").textContent = firstO;
    document.getElementById("second-order").textContent = secondO;
    document.getElementById("durbin-watson").textContent = durbanWatson;
    document.getElementById("mean-abs-error").textContent = meanAbsE;
    document.getElementById("normality").textContent = normalityCond;
    document.getElementById("i-residual").textContent = iResidual;

    console.log(iResidual);

}


function display(){
    /* The function */

    function json2table(json, classes) {
        var cols = Object.keys(json[0]);

        var headerRow = '';
        var bodyRows = '';

        classes = classes || '';

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        cols.map(function(col) {
            headerRow += '<th>' + capitalizeFirstLetter(col) + '</th>';
        });

        json.map(function(row) {
            bodyRows += '<tr>';

            cols.map(function(colName) {
                bodyRows += '<td>' + row[colName] + '</td>';
            })

            bodyRows += '</tr>';
        });

        return '<table class="' +
            classes +
            '"><thead><tr>' +
            headerRow +
            '</tr></thead><tbody>' +
            bodyRows +
            '</tbody></table>';
    }

    document.getElementById('tableGoesHere').innerHTML = json2table(raw_json, 'table');
}


function runTestCase(){
    calc2(5, testJson);
    fillDataBoxs();
}
