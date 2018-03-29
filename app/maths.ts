
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

function doRegression(json){

    var independents = [];

    var independentKeys = Object.keys(json.independent);
    var dependentKeys = Object.keys(json.dependent);
    var dateKeys = Object.keys(json.date);

    Object.keys(json.independent).forEach(function(key, index) {
        independents.push(key);
    });

    var independentCombinations = getCombinations(independents);
    //console.log(independentCombinations);

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
        results["rSquare" + i] = [];
        results["Intercept" + i] = [];


        for(var k = 0; k < independentCombinations[i].length; k++){

            results[independentCombinations[i][k] + "Coeff" + i] = [];
            results[independentCombinations[i][k] + "pvalue" + i] = [];
            // , "Intercept " + i, independentCombinations[i][k] + " Co-eff " + i,
            //     independentCombinations[i][k] + " p-value " + i];
        }

        for(var j = 0; j < (rows - 11); j++) {
            var electricity = json.dependent[dependentKeys[0]].slice(j, j + 12);
            var independentVariables = [];

            for(var k = 0; k < independentCombinations[i].length; k++) {
                independentVariables[k] = json.independent[independentCombinations[i][k]].slice(j, j + 12);
            }
            var model = calc3(5, electricity, independentVariables);
            //console.log(electricity);
            //console.log(independentVariables);
            //console.log("///////////////////////////////////////////////////");

            results.Date[j] = json.date[dateKeys[0]][j];

            //console.log(model);

            results["rSquare" + i][j] = model.rSquare;
            results["Intercept" + i][j] = model.intercept;

            for(var n = 0; n < independentCombinations[i].length; n++){
                results[independentCombinations[i][n] + "Coeff" + i][j] = model.params[n];
                results[independentCombinations[i][n] + "pvalue" + i][j] = "p Value of " + independentCombinations[i][n];
            }

            // console.log("Date: " + json.date.Date[j] + "\t" + model.rSquare + "\t" + model.fittedModal + "\t" + model.params[0]
            //             + "\tP Value: ?\t");

            //Defining a
            //df_temp = pd.DataFrame(data=result, columns=result_title)
        }

        totalResult[i] = results;

    }

    ///////////#####STEP 2 - FINDING MODELS THAT PASS AND THOSE THAT FAIL######/////////////////
    //TODO



    ///////////#####STEP 3 - FINDING SAVINGS ######/////////////////
    //# The savings numbers are caculated in this section with base year as the first 12 months and model year as year2.
    //# we use model6 to determine savings, in the tool the user should be able to choose model and model year.
    //# Lets fix the base year to be first 12 months for the initial version of the tool.

    var model_year = "2006-01-01";
    var year = 12;
    var model = 6;
    var savings = [];

    savings["Total Actual Elect"] = [];
    savings["Total Model Elect"] = [];
    savings["%Savings"] = [];

    console.log(independents);

    for(var i = 0; i < (rows - 11); i++) {
        savings["Total Model Elect"][i] = 0;
        var sum = 0;
        for(var j = 0; j < 12; j++){
            sum += Number((json.dependent[dependentKeys[0]].slice(i, i + 12))[j])
        }

        for(var k = 0; k < independentKeys.length; k++){
            var independentSum = 0;

            for(var j = 0; j < 12; j++){
                independentSum += Number((json.independent[independentKeys[k]].slice(i, i + 12))[j][0])
            }
            //console.log(totalResult[model][independents[k] + "Coeff" + model] [year]);

            //json.independent[independentKeys[i]][year] *
            savings["Total Model Elect"][i] += totalResult[model][independents[k] + "Coeff" + model][year] * independentSum;
        }

        savings["Total Model Elect"][i] += totalResult[model]["Intercept" + model][year] * 12;
        savings["Total Actual Elect"][i] = sum;

        savings["%Savings"][i] = 1 - ((savings["Total Model Elect"][0] * savings["Total Actual Elect"][i]) / (savings["Total Actual Elect"][0] * savings["Total Model Elect"][i]));
    }


    console.log(savings);
    console.log(totalResult);
}

