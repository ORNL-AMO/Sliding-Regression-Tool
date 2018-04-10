
function getCombinations(array) {
    const results = [[]];
    for (const value of array) {
        const copy = [...results];
        for (const prefix of copy) {
            results.push(prefix.concat(value));
        }
    }
    return results.slice(1);
}


//TODO Needs work
function findResults(json){

    var table = {
        combinations: [],
        results: [],
        savings: []
    }

    var independents = [];

    var independentKeys = Object.keys(json.independent);
    var dependentKeys = Object.keys(json.dependent);
    var dateKeys = Object.keys(json.date);

    Object.keys(json.independent).forEach(function(key, index) {
        independents.push(key);
    });

    var independentCombinations = getCombinations(independents);

    table.combinations = independentCombinations;

    var rows = json.date.Date.length;
    var col = independentCombinations.length;
    var totalResult = [];

    for(var i = 0; i < col; i++){
        var result = [];
        var variables = [];

        for(var k = 0; k < independentCombinations[i].length; k++){
            variables[k] = independentCombinations[i][0];
        }

        //TODO
        var results = {
            Date: [],
        };
        results["rSquare"] = [];
        results["Intercept" + i] = [];
        results["fittedModel"] = [];


        for(var k = 0; k < independentCombinations[i].length; k++){

            results[independentCombinations[i][k] + "Coeff" + i] = [];
            results[independentCombinations[i][k] + "pvalue" + i] = [];
        }

        for(var j = 0; j < (rows - 11); j++) {
            var electricity = json.dependent[dependentKeys[0]].slice(j, j + 12);
            var independentVariables = [];

            for(var k = 0; k < independentCombinations[i].length; k++) {
                independentVariables[k] = json.independent[independentCombinations[i][k]].slice(j, j + 12);
            }
            var model = calc3(5, electricity, independentVariables);

            results.Date[j] = json.date[dateKeys[0]][j];

            results["rSquare"][j] = model.rSquare;
            results["Intercept" + i][j] = model.intercept;

            for(var n = 0; n < independentCombinations[i].length; n++){
                results[independentCombinations[i][n] + "Coeff" + i][j] = model.params[n];
                results[independentCombinations[i][n] + "pvalue" + i][j] = "p Value of " + independentCombinations[i][n];
            }

            results["fittedModel"][j] = model.fittedModel;
        }

        totalResult[i] = results;
    }

    table.results = totalResult;

    return table;

    ///////////#####STEP 2 - FINDING MODELS THAT PASS AND THOSE THAT FAIL######/////////////////
    //TODO
}

function findSavings(json, table, dependentNumber){

    ///////////#####STEP 3 - FINDING SAVINGS ######/////////////////
    //# The savings numbers are caculated in this section with base year as the first 12 months and model year as year2.
    //# we use model6 to determine savings, in the tool the user should be able to choose model and model year.
    //# Lets fix the base year to be first 12 months for the initial version of the tool.


    var rows = json.date.Date.length;
    var independentKeys = Object.keys(json.independent);
    var dependentKeys = Object.keys(json.dependent);
    var independents = [];

    Object.keys(json.independent).forEach(function(key, index) {
        independents.push(key);
    });

    var dependent = dependentKeys[dependentNumber];

    var year = document.getElementById(dependent + "-model-year-selector").value;
    var model = document.getElementById(dependent + "-model-selector").value;
    var savings = [];

    savings["Total Actual " + dependent] = [];
    savings["Total Model " + dependent] = [];
    savings["%Savings"] = [];

    for(var i = 0; i < (rows - 11); i++) {
        savings["Total Model " + dependent][i] = 0;
        var sum = 0;
        for(var j = 0; j < 12; j++){
            sum += Number((json.dependent[dependent].slice(i, i + 12))[j])
        }

        for(var k = 0; k < table.combinations[model].length; k++){
            var independentSum = 0;

            for(var j = 0; j < 12; j++){
                independentSum += Number((json.independent[table.combinations[model][k]].slice(i, i + 12))[j][0])
            }
            //console.log(totalResult[model][independents[k] + "Coeff" + model] [year]);

            //json.independent[independentKeys[i]][year] *
            savings["Total Model " + dependent][i] += table.results[model][table.combinations[model][k] + "Coeff" + model][year] * independentSum;
        }

        savings["Total Model " + dependent][i] += table.results[model]["Intercept" + model][year] * 12;
        savings["Total Actual " + dependent][i] = sum;

        savings["%Savings"][i] = ((1 - ((savings["Total Model " + dependent][0] * savings["Total Actual " + dependent][i]) / (savings["Total Actual " + dependent][0] * savings["Total Model " + dependent][i])))*100).toFixed(2) + "%";
    }

    console.log(savings);

    table.savings = savings;

    console.log(table);

    return table;
}


function findSavingsPoint(json, table, dependentNumber, year, model){

    ///////////#####STEP 3 - FINDING SAVINGS ######/////////////////
    //# The savings numbers are caculated in this section with base year as the first 12 months and model year as year2.
    //# we use model6 to determine savings, in the tool the user should be able to choose model and model year.
    //# Lets fix the base year to be first 12 months for the initial version of the tool.

    var rows = json.date.Date.length;
    var independentKeys = Object.keys(json.independent);
    var dependentKeys = Object.keys(json.dependent);
    var independents = [];

    Object.keys(json.independent).forEach(function(key, index) {
        independents.push(key);
    });

    var dependent = dependentKeys[dependentNumber];

    var savings = [];

    savings["Total Actual " + dependent] = [];
    savings["Total Model " + dependent] = [];
    savings["%Savings"] = [];

    for(var i = 0; i < (rows - 11); i++) {
        savings["Total Model " + dependent][i] = 0;
        var sum = 0;
        for(var j = 0; j < 12; j++){
            sum += Number((json.dependent[dependent].slice(i, i + 12))[j])
        }

        for(var k = 0; k < table.combinations[model].length; k++){
            var independentSum = 0;

            for(var j = 0; j < 12; j++){
                independentSum += Number((json.independent[table.combinations[model][k]].slice(i, i + 12))[j][0])
            }
            //console.log(totalResult[model][independents[k] + "Coeff" + model] [year]);

            //json.independent[independentKeys[i]][year] *
            savings["Total Model " + dependent][i] += table.results[model][table.combinations[model][k] + "Coeff" + model][year] * independentSum;
        }

        savings["Total Model " + dependent][i] += table.results[model]["Intercept" + model][year] * 12;
        savings["Total Actual " + dependent][i] = sum;

        savings["%Savings"][i] = ((1 - ((savings["Total Model " + dependent][0] * savings["Total Actual " + dependent][i]) / (savings["Total Actual " + dependent][0] * savings["Total Model " + dependent][i])))*100).toFixed(2) + "%";
    }

    return savings;
}