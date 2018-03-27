
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

            results["rSquare" + i][j] = model.rSquare;

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

    console.log(totalResult);
}

