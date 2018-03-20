
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

    Object.keys(json.independent).forEach(function(key, index) {
        independents.push(key);
    });

    var independentCombinations = getCombinations(independents);
    //console.log(independentCombinations);

    var rows = json.date.Date.length;
    var col = independentCombinations.length;

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

        console.log(results);

        for(var j = 0; j < (rows - 11); j++) {
            var electricity = json.dependent.Electricity.slice(j, j + 12);
            var independentVariables = [];

            for(var k = 0; k < independentCombinations[i].length; k++){
                independentVariables[k] = json.independent[independentCombinations[i][k]].slice(j, j + 12);
            }

            var model = calc3(5, electricity, independentVariables);

            console.log(model);

            results.Date[j] = json.date.Date[j];
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

        //
        //df_results = pd.merge(df_results, df_temp, on='Date')


        // if(independentCombinations[i].length == 1){
        //     var v1 = independentCombinations[i][0];
        //
        //     var result_title = ['Date', "R-Square " + i, "Intercept " + i, v1 + " Co-eff " + i,
        //         v1 + "p-value " + i];
        //
        //     for(var j = 0; j < (rows - 11); j++){
        //         var electricity = json.dependent.Electricity.slice(j, j + 12);
        //
        //
        //         var independentVariables = [];
        //
        //         independentVariables[0] = json.independent[independentCombinations[i][0]].slice(j, j + 12);
        //
        //         //console.log(electricity);
        //         //console.log(variable);
        //
        //         // variable = sm.add_constant(var)
        //
        //         var model = calc3(5, electricity, independentVariables);
        //         // predictions = model.predict(var)
        //
        //          // result.append(
        //          //     [df["Date"].iloc[j], model.rsquared, model.params['const'], model.params[v1], model.pvalues[v1]])
        //          // df_temp = pd.DataFrame(data=result, columns=result_title)
        //
        //         // console.log("Date: " + json.date.Date[j] + "\t" + model.rSquare + "\t" + model.fittedModal + "\t" + model.params[0]
        //         //             + "\tP Value: ?\t");
        //
        //     }
        // }
        // else if(independentCombinations[i].length == 2){
        //     var v1 = independentCombinations[i][0];
        //     var v2 = independentCombinations[i][1];
        //
        //     var result_title = ['Date', "R-Square " + i, "Intercept " + i, v1 + " Co-eff " + i,
        //         v1 + "p-value " + i, v2 + " Co-eff " + i, v2 + " p-value " + i];
        //
        //     for(var j = 0; j < (rows - 11); j++) {
        //         var electricity = json.dependent.Electricity.slice(j, j + 12);
        //
        //         //console.log(json.independent[independentCombinations[i][0]]);
        //
        //         var independentVariables = [];
        //         independentVariables[0] = json.independent[independentCombinations[i][0]].slice(j, j + 12);
        //         independentVariables[1] = json.independent[independentCombinations[i][1]].slice(j, j + 12);
        //
        //         //console.log(electricity);
        //         //console.log(variable);
        //
        //         // variable = sm.add_constant(var)
        //
        //         //Works for variable size of 1 independent
        //         var modal = calc3(5, electricity, independentVariables);
        //
        //         console.log(modal);
        //         //model = sm.OLS(electricity, variable).fit()
        //         // predictions = model.predict(var)
        //         // result.append(
        //         //     [df["Date"].iloc[j], model.rsquared, model.params['const'], model.params[v1], model.pvalues[v1]])
        //         // df_temp = pd.DataFrame(data=result, columns=result_title)
        //     }
        // }
        // else if(independentCombinations[i].length == 3){
        //     console.log(3);
        // }

    }

}