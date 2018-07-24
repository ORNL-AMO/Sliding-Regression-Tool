// import {findResults} from './app/maths.ts'

d3 = require('d3');
Json2csvParser = require('json2csv').Parser;
converter = require('json-2-csv');
saveAs = require('file-saver').saveAs;

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

        raw_json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[wb.SheetNames.length-1]], {raw:false, header:1});

        console.log(raw_json);
        //clean raw_json of null rows
        for(var i = 0; i < raw_json.length; i++){
            console.log(raw_json[i]);
            if(raw_json[i].length == 0){ //null position
                raw_json.splice(i, 1);
            }
        }
        console.log(raw_json);

        formatDisplayJson();
    };
    if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
});

function formatDisplayJson(){

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

    getTypes();

    formatted_json["date"];
    formatted_json["dependent"];
    formatted_json["independent"];

    console.log(raw_json);

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
                //TODO make these not arrays
                formatted_json["dependent"][raw_json[0][j]][i] = [parseFloat([raw_json[i + 1][j]][0].replace(/,/g, ''))];
            }
            else if(types[j] == "Independent"){
                formatted_json["independent"][raw_json[0][j]][i] = [parseFloat([raw_json[i+1][j]][0].replace(/,/g, ''))];
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

    fillDataTable(display_json);
}


var models = [];
var count = 0;
var savingCount = 0;
var savingsLines = [];

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

        tables = [];

        for(var i = 0; i < numberOfDependents; i++) {
            tables[i] = findResults(formatted_json, i);
        }

        var displayJsons = [];
        for(var i =0; i < tables.length; i++){
            displayJsons[i] = [];
            for(var j = 0; j < tables[i]["results"].length; j++){
                displayJsons[i][j] = makeDisplayJson(tables[i]["results"][j], i, j);
            }
        }

        savingsLines = findSavingsLine(displayJsons);


        document.getElementById("displayZone").innerHTML = "";

        document.getElementById("display-format-col").style.display = "inline";
        document.getElementById("export-btn").style.display = "inline";
    }
}

function makeDisplayJson(json, dependentNumber, model){
    var heatmapData = [];

    for(var i = 0; i < json["Date"].length; i++){
        heatmapData[i] = {Date: json["Date"][i][0], rSquare: json["rSquare"][i], index: i, fittedModel: json[(json["comboNumber"][i]) + "fittedModel"][i], savings:  findSavingsPoint(formatted_json, tables[dependentNumber], dependentNumber, i, model)};
    }

    return heatmapData;
}

function displayHeatmaps(){

    var displayJsons = [];

    document.getElementById("displayZone").innerHTML = "";

    models = [];
    count = 0;

    var combinations = [];

    for(var j = 0; j < tables[0].combinations.length; j++){
        var combinationStr = "";
        for(var k = 0; k < tables[0].combinations[j].length; k++){
            combinationStr += tables[0].combinations[j][k];
            if(k != (tables[0].combinations[j].length-1)){
                combinationStr += " / ";
            }
        }
        combinations[j] = combinationStr;
    }

    for(var i =0; i < tables.length; i++){
        displayJsons[i] = [];
        for(var j = 0; j < tables[i]["results"].length; j++){
            displayJsons[i][j] = makeDisplayJson(tables[i]["results"][j], i, j);
        }
        makeHeatmap(displayJsons[i], i, combinations);
    }

    loadListeners(displayJsons, combinations);
}

function makeHeatmap(displayJson, number, combinations){

    var dependentKeys = Object.keys(formatted_json.dependent);

    document.getElementById("displayZone").innerHTML += "   <div class='row'>" +
                                                        "       <div class='col-2'></div>" +
                                                        "       <div class='col-8 heatmap-title'><strong>" + dependentKeys[number] + "</strong></div>" +
                                                        "       <div class='col-2'></div>" +
                                                        "   </div>" +
                                                        "   <div id='heatmap-row" + number + "' class=\"row heatmap-row\">\n" +
                                                        "    <div id='heatmap-y-axis-col" + number + "' class=\"col-2 heatmap-y-axis-col\" style='padding-right: 0px'>" +
                                                        "       <div id='y-axis" + number + "' class='heatmap-y-axis'></div>" +
                                                        "   </div>\n" +
                                                        "    <div class=\"col-8\" style='padding-left: 2px'>\n" +
                                                        "      <div id='heatmap-container" + number + "' class='heatmap-container' style='padding-left: 2px'></div>\n" +
                                                        "    </div>\n" +
                                                        "    <div class=\"col-2\"></div>\n" +
                                                        "  </div>\n" +
                                                        "\n" +
                                                        "  <div id='model-info-table-container" + number + "' class=\"row\">\n" +
                                                        "    <div class=\"col-2\"></div>\n" +
                                                        "    <div id='model-info-table-col" + number + "' class=\"col-8\">\n" +
                                                        "      <div id='model-info-table-div" + number + "'>\n" +
                                                        "        <table id='model-info-table" + number + "'>\n" +
                                                        "          <tr></tr>\n" +
                                                        "        </table>\n" +
                                                        "      </div>\n" +
                                                        "      <div class=\"col-2\"></div>\n" +
                                                        "    </div>\n" +
                                                        "  </div>\n";

    var container = document.getElementById("heatmap-container" + number);

    container.innerHTML = "";

    const margin = { top: 0, right: 0, bottom: 0, left: 30 },
        gridSize = Math.floor(20),
        width = (gridSize * displayJson[0].length) + margin.left,
        height = gridSize * displayJson.length;

    var colorDomain = d3.extent(displayJson, function(d){
        return d.rSquare;
    });

    var colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range(["red","green"]);

    var svg = d3.select("#heatmap-container" + number)
        .append("svg")
        .attr("id", "heatmap" + number)
        .attr("width", function(){
            return (gridSize * displayJson[0].length) + margin.left;
        })
        .attr("height", height + 70)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dates = [];

    for(var i = 0; i < displayJson[0].length; i++){
        dates[i] = displayJson[0][i]["Date"];
    }

    var colLabels = svg.append("g")
        .selectAll(".colLabelg")
        .data(dates)
        .enter()
        .append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize; })
        .style("text-anchor", "left")
        .attr("transform", "translate( -5 , 65) rotate (-90)")
        .style("font-size", "12px");

    for(var i = 0; i < displayJson[0].length; i++){
        dates[i] = displayJson[0][i]["Date"];
    }


    document.getElementById("y-axis"+number).innerHTML = "";
    for(var i = 0; i < combinations.length; i++){
        document.getElementById("y-axis"+number).innerHTML += "<div style='position: relative; top: " + (71) +"px; text-align: right; font-size:12px; padding-top: 2px;'>" + combinations[i] + "</div>";
    }


    for(var i = 0; i < displayJson.length; i++) {
        for (var j = 0; j < displayJson[i].length; j++) {

            models[count] = {modelCombo: i, modelYear: j, dependentNumber: number};
            count++;

            svg.append("rect")
                .attr("x", () => {
                return(displayJson[i][j].index - 1) * gridSize;
                })
                .attr("y", () => {
                        return(i) * gridSize + 70;
                })
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", () => {
                        return colorScale(displayJson[i][j].rSquare);
                })
                .attr("class", "hour bordered");
        }
    }
}

function loadListeners(displayJsons, combinations){

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //Load 'rect' listeners in a whole chunk or else they get replaced
    d3.selectAll("rect")
        .each( function(d, i){
            var i = i;
            d3.select(this)
                .on("click", () => {
                var modelInfoTable = document.getElementById("model-info-table"  + models[i].dependentNumber);

                modelInfoTable.innerHTML = "";

                document.getElementById("model-info-table-div" + models[i].dependentNumber).style.height = "100%";

                var newRow = modelInfoTable.insertRow(0);

                //rSquared Value
                newCol = newRow.insertCell(0);
                newCol.innerHTML =  displayJsons[models[i].dependentNumber][models[i].modelCombo][models[i].modelYear].rSquare;
                newCol.style.textAlign = "center";
                newCol.width = "50%";
                newCol.style.overflowX = "auto";

                //Fitted Model
                var newCol = newRow.insertCell(0);
                newCol.innerHTML = displayJsons[models[i].dependentNumber][models[i].modelCombo][models[i].modelYear].fittedModel;
                newCol.style.textAlign = "center";
                newCol.width = "50%";
                newCol.style.overflowX = "auto";

                newRow = modelInfoTable.insertRow(0);

                //rSquared Value
                newCol = newRow.insertCell(0);
                newCol.innerHTML = "<strong>rSquare Value</strong>";
                newCol.style.textAlign = "center";
                newCol.width = "50%";

                //Fitted Model
                var newCol = newRow.insertCell(0);
                newCol.innerHTML = "<strong>Fitted Model</strong>";
                newCol.style.textAlign = "center";
                newCol.width = "50%";

                newRow = modelInfoTable.insertRow(0);

                //Title
                newCol = newRow.insertCell(0);
                newCol.colSpan = "2";
                newCol.innerHTML = "<strong>Model Information</strong>";
                newCol.style.textAlign = "center";
                newCol.style.fontSize = "20px";
            })
            .on("mouseover", () => {
                div.transition()
                    .duration(200)
                    .style("opacity", 1);
                div.html(displayJsons[models[i].dependentNumber][models[i].modelCombo][models[i].modelYear].Date + "<br/>" + combinations[models[i].modelCombo] + "<br/>" + displayJsons[models[i].dependentNumber][models[i].modelCombo][models[i].modelYear].rSquare + "<br/>" + displayJsons[models[i].dependentNumber][models[i].modelCombo][models[i].modelYear].fittedModel)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                    div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        })
}

var clickableBoxData = [];

function displayGraphs(){

    var displayJsons = [];

    document.getElementById("displayZone").innerHTML = "";

    clickableBoxData = [];
    count = 0;
    savingCount = 0;

    var combinations = [];

    for(var j = 0; j < tables[0].combinations.length; j++){
        var combinationStr = "";
        for(var k = 0; k < tables[0].combinations[j].length; k++){
            combinationStr += tables[0].combinations[j][k];
            if(k != (tables[0].combinations[j].length-1)){
                combinationStr += " / ";
            }
        }
        combinations[j] = combinationStr;
    }


    for(var i =0; i < tables.length; i++){
        displayJsons[i] = [];
        for(var j = 0; j < tables[i]["results"].length; j++){
            displayJsons[i][j] = makeDisplayJson(tables[i]["results"][j], i, j);
        }
        makeGraphElements(i);

    }

    for(var i = 0; i < tables.length; i++){

        var dataJsons = [];

        for(var k = 0; k < displayJsons[i].length; k++) {
            dataJsons[k]= [{}];
            for (var j = 0; j < displayJsons[i][k].length; j++) {
                dataJsons[k][j] = {modelCombo: k, modelYear: j, dependentNumber: i, rSquare: displayJsons[i][k][j].rSquare, savingsPercent: savingsLines[i][k][j], fittedModel: displayJsons[i][k][j].fittedModel};
            }
        }

        lineLock[i] = true;

        makeGraph(displayJsons[i], i, combinations, dataJsons);
        makeSavingsGraph(displayJsons[i], i, combinations, dataJsons);
        makeGuideLine(displayJsons[i], i, combinations, dataJsons);
    }

    loadGraphListeners(combinations, displayJsons);
}

const lineColors = [
    '#84B641',
    '#7030A0',
    '#E1CD00',
    '#A03123',
    '#2ABDDA',
    '#DE762D',
    '#306DBE',
    '#1E7640',
    '#1b1e76',
    '#f22790',
    '#ed0a08',
    '#0200ff',
    '#e6c300',
    '#3ded3e',
    '#7e62ed',
    '#ff5e00',
    '#00c9ed',
    '#5bed9e',
    '#5c4424',
    '#02b318',
    '#ff0087',
    '#4f00ed',
    '#519fa8'
];

function makeGraphElements(number){

    var dependentKeys = Object.keys(formatted_json.dependent);

    document.getElementById("displayZone").innerHTML += "   <div class='row'>" +
                                                        "       <div class='col-2'></div>" +
                                                        "       <div class='col-8 graph-title'><strong>" + dependentKeys[number] + "</strong></div>" +
                                                        "       <div class='col-2'></div>" +
                                                        "   </div>" +
                                                        "   <div class='row'>" +
                                                        "       <div class='col-2'></div>" +
                                                        "       <div class='col-8 rGraph-title'><strong>rSquare Graph</strong></div>" +
                                                        "       <div class='col-2'></div>" +
                                                        "   </div>" +
                                                        "   <div id='graph-row" + number + "' class=\"row graph-row\">\n" +
                                                        "    <div id='y-axis" + number + "' class=\"col-2\" style='padding-right: 0px'></div>\n" +
                                                        "    <div id='graph-col' class=\"col-8\">\n" +
                                                        "      <div id='graph-container" + number + "' class='graph-container'></div>\n" +
                                                        "           <div id='savingsGraph-title" + number +"' class='col-12 savingsGraph-title' style='padding: 0px; text-align: center; background-color: #d8d9d9; height: 40px'></div>" +
                                                        "      <div id='savings-graph-container" + number + "' class='savings-graph-container'></div>\n" +
                                                        "    </div>\n" +
                                                        "    <div id='legendCol" + number + "' class='col-2' style='padding-left: 0px; overflow: auto;'>" +
                                                        "       <div id='legend" + number + "' ></div>" +
                                                        "    </div>\n" +
                                                        "  </div>\n" +
                                                        "   <div id='graph-row" + number + "' class=\"row graph-row\">\n" +
                                                        "    <div class=\"col-2\" style='padding: 0px'></div>\n" +
                                                        "    <div id='graph-col' class=\"col-8\">\n" +
                                                        "       <div id='range-display-row" + number + "' class='row range-display-row'>" +
                                                        "           <div class='col-1' style='padding: 0px'></div>" +
                                                        "           <div id='range-display-start-col" + number + "' class='col-3' style='padding: 0px'>" +
                                                        "               <div id='range-display-start" + number + "' class='range-display-start'></div>" +
                                                        "           </div>" +
                                                        "           <div id='current-position-col" + number + "' class='col-4' style='padding: 0px'>" +
                                                        "               <div id='current-position" + number + "' class='current-position'></div>" +
                                                        "           </div>" +
                                                        "           <div id='range-display-end-col" + number + "' class='col-3' style='padding: 0px'>" +
                                                        "               <div id='range-display-end" + number + "' class='range-display-end'></div>" +
                                                        "           </div>" +
                                                        "           <div class='col-1' style='padding: 0px'></div>" +
                                                        "       </div>\n" +
                                                        "    </div>\n" +
                                                        "    <div class='col-2' style='padding: 0px'>" +
                                                        "    </div>\n" +
                                                        "  </div>\n" +
                                                        "\n" +
                                                        "  <div id='model-info-table-container" + number + "' class=\"row\">\n" +
                                                        "    <div id='' class=\"col-1\"></div>\n" +
                                                        "    <div id='model-info-table-col" + number + "' class=\"col-10\">\n" +
                                                        "      <div id='model-info-table-div" + number + "'>\n" +
                                                        "        <table id='model-info-table" + number + "'>\n" +
                                                        "          <tr></tr>\n" +
                                                        "        </table>\n" +
                                                        "      </div>\n" +
                                                        "      <div class=\"col-1\"></div>\n" +
                                                        "    </div>\n" +
                                                        "  </div>\n"; //+
                                                        // "  <div id='savings-download-btn-row" + number + "'  class=\"row savings-download-btn-row\">\n" +
                                                        // "    <div id='' class=\"col-2\"></div>\n" +
                                                        // "    <div id='savings-download-btn-col" + number + "' class=\"col-8\">\n" +
                                                        // "      <div id='savings-download-btn-div" + number + "' style='text-align: center'>\n" +
                                                        // "           <button id='savings-download-btn" + number + "' class='savings-download-btn' type=\"button\" onclick=''><i id=\"dragAndDropArrow\" class=\"fas fa-download\"></i></button>" +
                                                        // "      </div>\n" +
                                                        // "      <div class=\"col-2\"></div>\n" +
                                                        // "    </div>\n" +
                                                        // "  </div>\n";
}


var rMargin = {top: 10, right: 15, bottom: 75, left: 50};

var activeModels = [];

function makeGraph(displayJson, number, combinations, dataJsons) {

    var width = document.getElementById("graph-container" + number).offsetWidth - rMargin.left - rMargin.right // Use the window's width
        , height = document.getElementById("graph-container" + number).offsetHeight - rMargin.top - rMargin.bottom; // Use the window's height

    d3.select("#graph-container" + number).selectAll('svg').remove();

    var svg = d3.select("#graph-container" + number).append('svg')
        .attr("width", width + rMargin.left + rMargin.right)
        .attr("height", height + rMargin.top + rMargin.bottom)
        .attr("id", "rSvg" + number)
        .style("z-index", "10")
        .append("g")
            .attr("transform", "translate(" + rMargin.left + "," + rMargin.top + ")");

    var titleSvg = d3.select("#savingsGraph-title" + number).append('svg')
        .attr("width", width + rMargin.left + rMargin.right)
        .attr("height", document.getElementById("savingsGraph-title" + number).offsetHeight)
        .attr("id", "savingsTitleSvg" + number)
        .append("g")
        .attr("transform", "translate(" + rMargin.left + ", 0)");

    titleSvg.append('foreignObject')
        .attr("id", "savingsTitleText" + number)
        .attr("class", "savingsTitleText")
        .attr("width", document.getElementById("savingsGraph-title" + number).offsetWidth)
        .attr("height", "40px")
        .attr("transform", "translate(" + (-rMargin.left) + ", 0)")
        .text("Savings Percentage Graph")
        .style("font-weight", "bold")
        .style("text-align", "center");


    var x = d3.scaleLinear()
        .rangeRound([0, width]);

    var x_date = d3.scaleLinear()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    // Scale the range of the data
    x.domain([0, dataJsons[0].length]);
    y.domain([0, 1]);

    // define the line
    var valueline = d3.line()
        .x(function (d) {
            return x(d.modelYear);
        })
        .y(function (d) {
            return y(d.rSquare);
        });

    var graph = svg.append('rect')
        .attr("id", "graph" + number)
        .attr("class", "graph")
        .attr("width", width + rMargin.left + rMargin.right)
        .attr("height", height + rMargin.top + rMargin.bottom)
        .attr("transform", "translate(" + (-rMargin.left) + "," + (-rMargin.top) + ")")
        .style("fill", "#d8d9d9");

    var date = [];

    for(var i = 0; i < displayJson[0].length; i++){
        date[i] = {"date": new Date(parseInt(displayJson[0][i]["Date"].substring(0, 4)),parseInt(displayJson[0][i]["Date"].substring(5, 7)),parseInt(displayJson[0][i]["Date"].substring(8, 10))), "value": i};
    }

    console.log(date[0].date);

    if(date[0].date == "Invalid Date"){ //Test for a different date format

        var day;
        var month;
        var year;


        for(var i = 0; i < displayJson[0].length; i++) {

            day = "";
            month = "";
            year = "";

            var breaks = 0;

            for (var j = 0; j < displayJson[0][i]["Date"].length; j++) {

                if(displayJson[0][i]["Date"][j] == "/"){
                    breaks++;
                }
                else if(breaks == 0){
                    day += displayJson[0][i]["Date"][j];
                }
                else if(breaks == 1){
                    month += displayJson[0][i]["Date"][j];
                }
                else if(breaks == 2){
                    year += displayJson[0][i]["Date"][j];
                }

            }

            date[i] = {"date": new Date(year, month, day), "value": i};

        }
    }

    x_date.domain([date[0].date, date[date.length - 1].date]);

    // Add the X Axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x_date)
            .tickFormat(d3.timeFormat("%Y-%m-%d")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y)); // Create an axis component with d3.axisLeft

    var data = [];

    var legendSvg = d3.select("#legend" + number)
                    .append("svg")
                    .attr("id", "legendSvg"+number)
                    .attr("height", document.getElementById("legendCol"+number).offsetHeight);

    const gridSize = 20;

    activeModels[number] = [];

    for(var i = 0; i < dataJsons.length; i++) {

        clickableBoxData[count] = {data: dataJsons, dependentNumber: number, number: i};

        svg.append("path")
            .data([dataJsons[i]])
            .attr("id", "line"+count)
            .attr("class", "line")
            .style("stroke", lineColors[i])
            .style("stroke-width", "3px")
            .style("fill", "none")
            .attr("d", valueline);

        legendSvg.append("rect")
            .attr("id", "clickableTile"+count)
            .attr("class", "clickableTile")
            .attr("x", 5)
            .attr("y", () => {
                return(i) * (gridSize + 10);
            })
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", lineColors[i])
            .style("padding-bottom", "10px");

        legendSvg.append("rect")
            .attr("class", "clickableBox")
            .attr("x", 5 + gridSize)
            .attr("y", () => {
                return(i) * (gridSize + 10);
            })
            .attr("width", 200)
            .attr("height", gridSize)
            .style("fill", "#dedede");

        legendSvg.append('text').text(combinations[i])
            .attr("class", "clickableText")
            .attr("x", 8 + gridSize)
            .attr("y", () => {
                return(i) * (gridSize + 10) + 15;
            })
            .attr('fill', 'black');

        activeModels[number][combinations[i]] = true;

        count++;
    }

    //make model-info-table
    var modelInfoTable = document.getElementById("model-info-table"  + number);

    modelInfoTable.innerHTML = "";

    document.getElementById("model-info-table-div" + number).style.height = "100%";
    document.getElementById("model-info-table-div" + number).style.paddingTop = "5px";

    //Load table backwards
    for(var i = dataJsons.length-1; 0 <= i; i--) {

        var newRow = modelInfoTable.insertRow(0);

        //Savings %
        newCol = newRow.insertCell(0);
        newCol.innerHTML = "-";
        newCol.id = combinations[i] + "Savings" + number;
        newCol.style.textAlign = "center";
        newCol.width = "25%";
        newCol.style.overflowX = "auto";

        //rSquared Value
        newCol = newRow.insertCell(0);
        newCol.innerHTML = "-";
        newCol.id = combinations[i] + "rSquared" + number;
        newCol.style.textAlign = "center";
        newCol.width = "25%";
        newCol.style.overflowX = "auto";

        //Fitted Model
        var newCol = newRow.insertCell(0);
        newCol.innerHTML = "-";
        newCol.id = combinations[i] + "FittedModel" + number;
        newCol.style.textAlign = "center";
        newCol.width = "25%";
        newCol.style.overflowX = "auto";

        //Model
        var newCol = newRow.insertCell(0);
        newCol.innerHTML = combinations[i];
        newCol.id = combinations[i] + "Model" + number;
        newCol.style.textAlign = "center";
        newCol.width = "25%";
        newCol.style.overflowX = "auto";

    }

    //Make table col headers for the model-info-table last
    newRow = modelInfoTable.insertRow(0);

    //savings %
    newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Savings %</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //rSquared Value
    newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>rSquare Value</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //Fitted Model
    var newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Fitted Model</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //Model
    var newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Model</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    newRow = modelInfoTable.insertRow(0);

    //Title
    newCol = newRow.insertCell(0);
    newCol.colSpan = "4";
    newCol.innerHTML = "<strong>Model Information</strong>";
    newCol.style.textAlign = "center";
    newCol.style.fontSize = "20px";
}

function remakeModelInfoTable(number, combinations){
    //make model-info-table
    var modelInfoTable = document.getElementById("model-info-table"  + number);

    modelInfoTable.innerHTML = "";

    document.getElementById("model-info-table-div" + number).style.height = "100%";
    document.getElementById("model-info-table-div" + number).style.paddingTop = "5px";

    //Load table backwards
    for(var i = combinations.length-1; 0 <= i; i--) {
        if(activeModels[number][combinations[i]]) {
            var newRow = modelInfoTable.insertRow(0);

            //Savings %
            newCol = newRow.insertCell(0);
            newCol.innerHTML = "-";
            newCol.id = combinations[i] + "Savings" + number;
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";

            //rSquared Value
            newCol = newRow.insertCell(0);
            newCol.innerHTML = "-";
            newCol.id = combinations[i] + "rSquared" + number;
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";

            //Fitted Model
            var newCol = newRow.insertCell(0);
            newCol.innerHTML = "-";
            newCol.id = combinations[i] + "FittedModel" + number;
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";

            //Model
            var newCol = newRow.insertCell(0);
            newCol.innerHTML = combinations[i];
            newCol.id = combinations[i] + "Model" + number;
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";
        }
    }

    //Make table col headers for the model-info-table last
    newRow = modelInfoTable.insertRow(0);

    //savings %
    newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Savings %</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //rSquared Value
    newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>rSquare Value</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //Fitted Model
    var newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Fitted Model</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //Model
    var newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Model</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    newRow = modelInfoTable.insertRow(0);

    //Title
    newCol = newRow.insertCell(0);
    newCol.colSpan = "4";
    newCol.innerHTML = "<strong>Model Information</strong>";
    newCol.style.textAlign = "center";
    newCol.style.fontSize = "20px";
}

function changeModelInfoTableModels(number, combinations){
    //make model-info-table
    var modelInfoTable = document.getElementById("model-info-table"  + number);

    modelInfoTable.innerHTML = "";

    document.getElementById("model-info-table-div" + number).style.height = "100%";
    document.getElementById("model-info-table-div" + number).style.paddingTop = "5px";

    //Load table backwards
    for(var i = combinations.length-1; 0 <= i; i--) {
        if(activeModels[number][combinations[i]]) {
            var newRow = modelInfoTable.insertRow(0);

            //Savings %
            newCol = newRow.insertCell(0);
            newCol.id = combinations[i] + "Savings" + number;
            newCol.innerHTML =  positionValues[i][combinations[i] + "Savings" + number];
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";

            //rSquared Value
            newCol = newRow.insertCell(0);
            newCol.id = combinations[i] + "rSquared" + number;
            newCol.innerHTML = positionValues[i][combinations[i] + "rSquared" + number];
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";

            //Fitted Model
            var newCol = newRow.insertCell(0);
            newCol.id = combinations[i] + "FittedModel" + number;
            newCol.innerHTML = positionValues[i][combinations[i] + "FittedModel" + number];
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";

            //Model
            var newCol = newRow.insertCell(0);
            newCol.innerHTML = combinations[i];
            newCol.id = combinations[i] + "Model" + number;
            newCol.style.textAlign = "center";
            newCol.width = "25%";
            newCol.style.overflowX = "auto";
        }
    }

    //Make table col headers for the model-info-table last
    newRow = modelInfoTable.insertRow(0);

    //savings %
    newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Savings %</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //rSquared Value
    newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>rSquare Value</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //Fitted Model
    var newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Fitted Model</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    //Model
    var newCol = newRow.insertCell(0);
    newCol.innerHTML = "<strong>Model</strong>";
    newCol.style.textAlign = "center";
    newCol.width = "25%";

    newRow = modelInfoTable.insertRow(0);

    //Title
    newCol = newRow.insertCell(0);
    newCol.colSpan = "4";
    newCol.innerHTML = "<strong>Model Information</strong>";
    newCol.style.textAlign = "center";
    newCol.style.fontSize = "20px";
}

const savingsMargin = {top: 10, right: 15, bottom: 10, left: 50};

function makeSavingsGraph(displayJson, number, combinations, dataJsons){

    // 2. Use the margin convention practice
    var width = document.getElementById("savings-graph-container" + number).offsetWidth - savingsMargin.left - savingsMargin.right // Use the window's width
        , height = document.getElementById("savings-graph-container" + number).offsetHeight - savingsMargin.top - savingsMargin.bottom; // Use the window's height

    d3.select("#savings-graph-container" + number).selectAll('svg').remove();

    var svg = d3.select("#savings-graph-container" + number).append('svg')
        .attr("width", width + savingsMargin.left + savingsMargin.right)
        .attr("height", height + savingsMargin.top + savingsMargin.bottom)
        .attr("id", "savingsSvg" + number)
        .append("g")
        .attr("transform", "translate(" + savingsMargin.left + "," + savingsMargin.top + ")");

    var x = d3.scaleLinear()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    // Scale the range of the data
    x.domain([0, dataJsons[0].length]);

    // define the line
    var valueline = d3.line()
        .x(function (d) {
            return x(d.modelYear);
        })
        .y(function (d) {
            return y(d.savingsPercent);
        });

    var graph = svg.append('rect')
        .attr("id", "savings-graph" + number)
        .attr("class", "graph")
        .attr("width", width + savingsMargin.left + savingsMargin.right)
        .attr("height", height + savingsMargin.top + savingsMargin.bottom)
        .attr("transform", "translate(" + (-savingsMargin.left) + "," + (-savingsMargin.top) + ")")
        .style("fill", "#d8d9d9");

    var maxs = [];
    var mins = [];

    var count = 0;
    for(var i = 0; i < dataJsons.length; i++) {
        if(activeModels[number][combinations[i]]) {
            maxs[count] = Math.max.apply(Math, dataJsons[i].map(function (d) {
                return d.savingsPercent;
            }));
            mins[count] = Math.min.apply(Math, dataJsons[i].map(function (d) {
                return d.savingsPercent;
            }));
            count++;
        }
    }

    y.domain([ Math.min.apply(null, mins), Math.max.apply(null, maxs)]);

    for(var i = 0; i < dataJsons.length; i++) {
        if(activeModels[number][combinations[i]]) {
            svg.append("path")
                .data([dataJsons[i]])
                .attr("id", "savingsLine" + savingCount)
                .attr("class", "line")
                .style("stroke", lineColors[i])
                .style("stroke-width", "3px")
                .style("fill", "none")
                .attr("d", valueline);

            savingCount++;
        }
    }

    var format = d3.format(".2f")

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y)
              .tickFormat(d => format(d) + "%")); // Create an axis component with d3.axisLeft

    document.getElementById("range-display-start" + number).innerHTML = "Start Period: " + displayJson[0][0]["Date"];
    document.getElementById("range-display-end" + number).innerHTML = "End Period: " + displayJson[0][displayJson[0].length-1]["Date"];
    document.getElementById("current-position" + number).innerHTML = "Position Date: ---";

}

var lineLock = [];
var lastPosition = [];

function makeGuideLine(displayJson, number, combinations, dataJsons){

    d3.selectAll("#rSvg" + number).selectAll("line").remove();
    d3.selectAll("#savingsSvg" + number).selectAll("line").remove();

    //Set up a guidline lock bool for each dependent graph; True = unlocked, False = locked

    var rWidth = document.getElementById("graph-container" + number).offsetWidth - rMargin.left - rMargin.right // Use the window's width
        , rHeight = document.getElementById("graph-container" + number).offsetHeight - rMargin.top - rMargin.bottom; // Use the window's height

    var x = d3.scaleLinear()
        .rangeRound([0, rWidth]);

    var y = d3.scaleLinear()
        .rangeRound([rHeight, 0]);

    // Scale the range of the data
    x.domain([0, dataJsons[0].length]);
    y.domain([0, 1]);

    var savingsWidth = document.getElementById("graph-container" + number).offsetWidth - savingsMargin.left - savingsMargin.right // Use the window's width
        , savingsHeight = document.getElementById("graph-container" + number).offsetHeight - savingsMargin.top - savingsMargin.bottom; // Use the window's height

    var guideLine = d3.select("#rSvg" + number).append("line")
        .attr("id", "guideLine")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", rHeight)
        .style("stroke", "red")
        .style('pointer-events', 'none')
        .style("display", "none");

    var savingsGuideLine = d3.select("#savingsSvg" + number).append("line")
        .attr("id", "guideLine")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", savingsHeight)
        .style("stroke", "red")
        .style('pointer-events', 'none')
        .style("display", "none");

    document.getElementById("savingsGraph-title" + number).offsetHeight;


    if(!lineLock[number]){

        guideLine.style("display", null);
        savingsGuideLine.style("display", null);

        guideLine.style("stroke", "black");
        savingsGuideLine.style("stroke", "black");

        guideLine.attr("transform", 'translate(' + (x(lastPosition[number]) + rMargin.left) + ',' + rMargin.top + ')');
        savingsGuideLine.attr("transform", 'translate(' + (x(lastPosition[number]) + savingsMargin.left) + ',' + savingsMargin.top + ')');

    }


    d3.select("#rSvg" + number).append('rect')
        .attr("id", "coverBox" + number)
        .attr("class", "coverBox")
        .attr("width", rWidth )
        .attr("height", (rHeight + rMargin.bottom))
        .style("opacity", "0")
        .attr("transform", "translate(" + (rMargin.left) + "," + (rMargin.top) + ")")
        .on("mouseover", () => {
            if(lineLock[number]){
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);
            }
        })
        .on("mousemove", () => {
            if(lineLock[number]) {
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);

                xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);

                guideLine.attr("transform", 'translate(' + (x(xPosition) + rMargin.left) + ',' + rMargin.top + ')');
                savingsGuideLine.attr("transform", 'translate(' + (x(xPosition) + savingsMargin.left) + ',' + savingsMargin.top + ')');

                updateModelInfoTable(number, dataJsons, combinations, Math.floor(xPosition), displayJson);
            }
        })
        .on("mouseout", () => {
            if(lineLock[number]){
                guideLine.style("display", "none");
                savingsGuideLine.style("display", "none");

                document.getElementById("current-position" + number).innerHTML = "Position Date: ---";

                remakeModelInfoTable(number, combinations);
            }
        })
        .on("click", () => {
            lineLock[number] = !lineLock[number];

            xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);

            if(lineLock[number]){
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);
                guideLine.style("stroke", "red");
                savingsGuideLine.style("stroke", "red");

                guideLine.attr("transform", 'translate(' + (x(xPosition) + rMargin.left) + ',' + rMargin.top + ')');
                savingsGuideLine.attr("transform", 'translate(' + (x(xPosition) + savingsMargin.left) + ',' + savingsMargin.top + ')');

                updateModelInfoTable(number, dataJsons, combinations, Math.floor(xPosition), displayJson);
            }
            else{
                guideLine.style("stroke", "black");
                savingsGuideLine.style("stroke", "black");

                lastPosition[number] = xPosition;
            }
        });

    d3.select("#savingsTitleSvg" + number).append('rect')
        .attr("id", "savingsTitleCoverBox" + number)
        .attr("class", "coverBox")
        .attr("width", rWidth)
        .attr("height", "50px")
        .style("opacity", "0")
        .style("z-index", "10")
        .attr("transform", "translate(" + (rMargin.left) + ", 0)")
        .on("mouseover", () => {
            if(lineLock[number]){
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);
            }
        })
        .on("mousemove", () => {
                if(lineLock[number]) {
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);

                xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);

                guideLine.attr("transform", 'translate(' + (x(xPosition) + rMargin.left) + ',' + rMargin.top + ')');
                savingsGuideLine.attr("transform", 'translate(' + (x(xPosition) + savingsMargin.left) + ',' + savingsMargin.top + ')');

                updateModelInfoTable(number, dataJsons, combinations, Math.floor(xPosition), displayJson);
            }
        })
        .on("mouseout", () => {
                if(lineLock[number]){
                guideLine.style("display", "none");
                savingsGuideLine.style("display", "none");

                document.getElementById("current-position" + number).innerHTML = "Position Date: ---";

                remakeModelInfoTable(number, combinations);
            }
        })
        .on("click", () => {
            lineLock[number] = !lineLock[number];

            xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);

            if(lineLock[number]){
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);
                guideLine.style("stroke", "red");
                savingsGuideLine.style("stroke", "red");

                guideLine.attr("transform", 'translate(' + (x(xPosition) + rMargin.left) + ',' + rMargin.top + ')');
                savingsGuideLine.attr("transform", 'translate(' + (x(xPosition) + savingsMargin.left) + ',' + savingsMargin.top + ')');

                updateModelInfoTable(number, dataJsons, combinations, Math.floor(xPosition), displayJson);
            }
            else{
                guideLine.style("stroke", "black");
                savingsGuideLine.style("stroke", "black");

                lastPosition[number] = xPosition;
            }
        });

    d3.select("#savingsSvg" + number).append('rect')
        .attr("id", "coverBox" + number)
        .attr("class", "coverBox")
        .attr("width", savingsWidth )
        .attr("height", savingsHeight + savingsMargin.top )
        .style("opacity", "0")
        .attr("transform", "translate(" + (savingsMargin.left) + ", 0 )")
        .on("mouseover", () => {
            if(lineLock[number]){
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);
            }
        })
        .on("mousemove", () => {
            if(lineLock[number]){
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);

                xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);

                guideLine.attr("transform", 'translate(' + (x(xPosition) + rMargin.left) + ',' + rMargin.top + ')');
                savingsGuideLine.attr("transform", 'translate(' + (x(xPosition) + savingsMargin.left) + ',' + savingsMargin.top + ')');

                updateModelInfoTable(number, dataJsons, combinations, Math.floor(xPosition), displayJson);
            }
        })
        .on("mouseout", () => {
                if(lineLock[number]){
                guideLine.style("display", "none");
                savingsGuideLine.style("display", "none");

                document.getElementById("current-position" + number).innerHTML = "Position Date: ---";

                remakeModelInfoTable(number, combinations);
            }
        })
        .on("click", () => {
            lineLock[number] = !lineLock[number];

            xPosition = x.invert(d3.mouse(d3.event.currentTarget)[0]);

            if(lineLock[number]){
                guideLine.style("display", null);
                savingsGuideLine.style("display", null);
                guideLine.style("stroke", "red");
                savingsGuideLine.style("stroke", "red");

                guideLine.attr("transform", 'translate(' + (x(xPosition) + rMargin.left) + ',' + rMargin.top + ')');
                savingsGuideLine.attr("transform", 'translate(' + (x(xPosition) + savingsMargin.left) + ',' + savingsMargin.top + ')');

                updateModelInfoTable(number, dataJsons, combinations, Math.floor(xPosition), displayJson);
            }
            else{
                guideLine.style("stroke", "black");
                savingsGuideLine.style("stroke", "black");

                lastPosition[number] = xPosition;
            }
        });
}

var positionValues = [];

function updateModelInfoTable(number, dataJsons, combinations, position, displayJson){

    document.getElementById("current-position" + number).innerHTML = "Position Date: " + displayJson[0][position].Date;

    for(var i = combinations.length-1; 0 <= i; i--) {

        positionValues[i] = [];

        positionValues[i][combinations[i] + "Savings" + number] = (dataJsons[i][position].savingsPercent).toFixed(2);
        positionValues[i][combinations[i] + "rSquared" + number] = dataJsons[i][position].rSquare.toFixed(4);
        positionValues[i][combinations[i] + "FittedModel" + number] = dataJsons[i][position].fittedModel;

        if(activeModels[number][combinations[i]]) {
            document.getElementById(combinations[i] + "rSquared" + number).innerHTML = dataJsons[i][position].rSquare.toFixed(4);
            document.getElementById(combinations[i] + "Savings" + number).innerHTML = (dataJsons[i][position].savingsPercent).toFixed(2);
            document.getElementById(combinations[i] + "FittedModel" + number).innerHTML = dataJsons[i][position].fittedModel;
        }
    }
}

function loadGraphListeners(combinations, displayJsons){

    var x = d3.scaleLinear()
        .rangeRound([0, document.getElementById("graph-col").offsetWidth]);

    var y = d3.scaleLinear()
        .rangeRound([document.getElementById("graph-col").offsetHeight, 0]);

    x.domain([0, formatted_json["date"]["Date"].length-11]);
    y.domain([0, 1]);

    var valueline = d3.line()
        .x(function (d) {
            return x(d.modelYear);
        })
        .y(function (d) {
            return y(d.rSquare);
        });

    d3.selectAll(".clickableBox")
        .each( function(d, i){
            var i = i;
            d3.select(this)
                .on("click", () => {
                    if(document.getElementById("line"+i).style.strokeWidth !== "0px") {
                        d3.select("#line" + i)
                            .style("stroke-width", "0px");

                        d3.select("#savingsLine" + i)
                            .style("stroke-width", "0px");

                        d3.select("#clickableTile"+i)
                            .style("fill", "gray");

                        activeModels[Math.floor(i / combinations.length)][combinations[i % combinations.length]] = false;
                        changeModelInfoTableModels(Math.floor(i / combinations.length), combinations);

                        for(var z = 0; z < tables.length; z++){

                            var dataJsons = [];
                            for(var k = 0; k < displayJsons[z].length; k++) {
                                dataJsons[k]= [{}];
                                for (var j = 0; j < displayJsons[z][k].length; j++) {
                                    dataJsons[k][j] = {modelCombo: k, modelYear: j, dependentNumber: z, rSquare: displayJsons[z][k][j].rSquare, savingsPercent: savingsLines[z][k][j], fittedModel: displayJsons[z][k][j].fittedModel};
                                }
                            }
                            makeSavingsGraph(displayJsons[z], z, combinations, dataJsons);
                            makeGuideLine(displayJsons[z], z, combinations, dataJsons);
                        }
                    }
                    else{
                        d3.select("#line" + i)
                            .style("stroke-width", "3px");

                        d3.select("#savingsLine" + i)
                            .style("stroke-width", "3px");

                        d3.select("#clickableTile"+i)
                            .style("fill", lineColors[clickableBoxData[i].number]);

                        activeModels[Math.floor(i / combinations.length)][combinations[i % combinations.length]] = true;
                        changeModelInfoTableModels(Math.floor(i / combinations.length), combinations);

                        for(var z = 0; z < tables.length; z++){

                            var dataJsons = [];
                            for(var k = 0; k < displayJsons[z].length; k++) {
                                dataJsons[k]= [{}];
                                for (var j = 0; j < displayJsons[z][k].length; j++) {
                                    dataJsons[k][j] = {modelCombo: k, modelYear: j, dependentNumber: z, rSquare: displayJsons[z][k][j].rSquare, savingsPercent: savingsLines[z][k][j], fittedModel: displayJsons[z][k][j].fittedModel};
                                }
                            }
                            makeSavingsGraph(displayJsons[z], z, combinations, dataJsons);
                            makeGuideLine(displayJsons[z], z, combinations, dataJsons);
                        }
                    }
                });
            });

    d3.selectAll(".clickableText")
        .each( function(d, i){
            var i = i;
            d3.select(this)
                .on("click", () => {
                    if(document.getElementById("line"+i).style.strokeWidth !== "0px") {
                        d3.select("#line" + i)
                            .style("stroke-width", "0px");

                        d3.select("#savingsLine" + i)
                            .style("stroke-width", "0px");

                        d3.select("#clickableTile"+i)
                            .style("fill", "gray");

                        activeModels[Math.floor(i / combinations.length)][combinations[i % combinations.length]] = false;
                        changeModelInfoTableModels(Math.floor(i / combinations.length), combinations);

                        for(var z = 0; z < tables.length; z++){

                            var dataJsons = [];
                            for(var k = 0; k < displayJsons[z].length; k++) {
                                dataJsons[k]= [{}];
                                for (var j = 0; j < displayJsons[z][k].length; j++) {
                                    dataJsons[k][j] = {modelCombo: k, modelYear: j, dependentNumber: z, rSquare: displayJsons[z][k][j].rSquare, savingsPercent: savingsLines[z][k][j], fittedModel: displayJsons[z][k][j].fittedModel};
                                }
                            }
                            makeSavingsGraph(displayJsons[z], z, combinations, dataJsons);
                            makeGuideLine(displayJsons[z], z, combinations, dataJsons);
                        }
                    }
                    else{
                        d3.select("#line" + i)
                            .style("stroke-width", "3px");

                        d3.select("#savingsLine" + i)
                            .style("stroke-width", "3px");

                        d3.select("#clickableTile"+i)
                            .style("fill", lineColors[clickableBoxData[i].number]);

                        activeModels[Math.floor(i / combinations.length)][combinations[i % combinations.length]] = true;
                        changeModelInfoTableModels(Math.floor(i / combinations.length), combinations);

                        for(var z = 0; z < tables.length; z++){

                            var dataJsons = [];
                            for(var k = 0; k < displayJsons[z].length; k++) {
                                dataJsons[k]= [{}];
                                for (var j = 0; j < displayJsons[z][k].length; j++) {
                                    dataJsons[k][j] = {modelCombo: k, modelYear: j, dependentNumber: z, rSquare: displayJsons[z][k][j].rSquare, savingsPercent: savingsLines[z][k][j], fittedModel: displayJsons[z][k][j].fittedModel};
                                }
                            }
                            makeSavingsGraph(displayJsons[z], z, combinations, dataJsons);
                            makeGuideLine(displayJsons[z], z, combinations, dataJsons);
                        }
                    }
                });
            });

    d3.selectAll(".clickableTile")
        .each( function(d, i){
            var i = i;
            d3.select(this)
                .on("click", () => {
                    if(document.getElementById("line"+i).style.strokeWidth !== "0px") {
                        d3.select("#line" + i)
                            .style("stroke-width", "0px");

                        d3.select("#savingsLine" + i)
                            .style("stroke-width", "0px");

                        d3.select(this)
                            .style("fill", "gray");

                        activeModels[Math.floor(i / combinations.length)][combinations[i % combinations.length]] = false;
                        changeModelInfoTableModels(Math.floor(i / combinations.length), combinations);

                        for(var z = 0; z < tables.length; z++){

                            var dataJsons = [];
                            for(var k = 0; k < displayJsons[z].length; k++) {
                                dataJsons[k]= [{}];
                                for (var j = 0; j < displayJsons[z][k].length; j++) {
                                    dataJsons[k][j] = {modelCombo: k, modelYear: j, dependentNumber: z, rSquare: displayJsons[z][k][j].rSquare, savingsPercent: savingsLines[z][k][j], fittedModel: displayJsons[z][k][j].fittedModel};
                                }
                            }
                            makeSavingsGraph(displayJsons[z], z, combinations, dataJsons);
                            makeGuideLine(displayJsons[z], z, combinations, dataJsons);
                        }
                    }
                    else{
                        d3.select("#line" + i)
                            .style("stroke-width", "3px");

                        d3.select("#savingsLine" + i)
                            .style("stroke-width", "3px");

                        d3.select(this)
                            .style("fill", lineColors[clickableBoxData[i].number]);

                        activeModels[Math.floor(i / combinations.length)][combinations[i % combinations.length]] = true;
                        changeModelInfoTableModels(Math.floor(i / combinations.length), combinations);

                        for(var z = 0; z < tables.length; z++){

                            var dataJsons = [];
                            for(var k = 0; k < displayJsons[z].length; k++) {
                                dataJsons[k]= [{}];
                                for (var j = 0; j < displayJsons[z][k].length; j++) {
                                    dataJsons[k][j] = {modelCombo: k, modelYear: j, dependentNumber: z, rSquare: displayJsons[z][k][j].rSquare, savingsPercent: savingsLines[z][k][j], fittedModel: displayJsons[z][k][j].fittedModel};
                                }
                            }
                            makeSavingsGraph(displayJsons[z], z, combinations, dataJsons);
                            makeGuideLine(displayJsons[z], z, combinations, dataJsons);
                        }
                    }
                });
            });
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
            models.innerHTML += "<option value=" + j + ">" + combinationStr + "</option>";
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
    document.getElementById("clear-btn").style.display = "inline";
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

    // document.getElementById("fitted-model").textContent = "";
    // document.getElementById("r-square").textContent = "";
    // document.getElementById("f-statistic").textContent = "";
    // document.getElementById("mean").textContent = "";
    // document.getElementById("variance").textContent = "";
    // document.getElementById("mean-1").textContent = "";
    // document.getElementById("mean-2").textContent = "";
    // document.getElementById("var-1").textContent = "";
    // document.getElementById("var-2").textContent = "";
    // document.getElementById("first-order").textContent = "";
    // document.getElementById("second-order").textContent = "";
    // document.getElementById("durbin-watson").textContent = "";
    // document.getElementById("mean-abs-error").textContent = "";
    // document.getElementById("normality").textContent = "";
    // document.getElementById("i-residual").textContent = "";

    var nameDisplay = document.getElementById("filename-display");
    nameDisplay.innerHTML = "";
    nameDisplay.style.display = "none";

    document.getElementById("filename-display-row").style.paddingTop = "0px";
    document.getElementById("data-table-div").style.height = "0px";
    document.getElementById("alert-box").style.display = "none";
    document.getElementById("clear-btn").style.display = "none";
    document.getElementById("calculate-btn").style.display = "none";
    document.getElementById("calculate-btn-row").style.paddingTop = "0px";
    document.getElementById("export-btn").style.display = "none";
    document.getElementById("displayZone").innerHTML = "";
    document.getElementById("display-format-col").style.display = "none";
}

function exportData(){

    //var export_formatJson = {};
    var export_formatJson = [];
    var fields = [];

    var dependentNames = Object.keys(formatted_json.dependent);

    var totalOutputKeys = [];

    for(var z = 0; z < tables.length; z++) {


            for (var i = 0; i < tables[z]["results"][0]["Date"].length; i++) {

                export_formatJson[z * tables[z]["results"][0]["Date"].length + i] = {};

                for(var k = 0; k < tables[z]["results"].length; k++) {

                    var outputKeys = Object.keys(tables[z]["results"][k]);

                    //date
                    export_formatJson[i][outputKeys[0]] = tables[z]["results"][k][outputKeys[0]][i][0];
                    //pValue for model
                    //export_formatJson[i]["pValue"] = tables[z]["results"][k]["pValue"][i];

                    for (var j = 1; j < outputKeys.length; j++) {
                        if(outputKeys[j] != "comboNumber" && outputKeys[j] != "rSquare"){
                            export_formatJson[i]["(" + dependentNames[z] + ")" + outputKeys[j]] = tables[z]["results"][k][outputKeys[j]][i];
                        }
                    }
                }
            }

    }

    const json2csvParser = new Json2csvParser({ outputKeys });
    const csv = json2csvParser.parse(export_formatJson);

    var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});

    saveAs(blob, "export.xlsx");

}


function date(){
    const date = new Date();
    const dateStr = date.getMonth() + '-' + date.getDate() + '-' + date.getFullYear();
}




