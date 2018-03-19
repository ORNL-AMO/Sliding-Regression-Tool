
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
    console.log(independentCombinations);

    var rows = json.date.Date.length;
    var col = independentCombinations.length;

    for(var i = 0; i < col; i++){
        var result = [];

        if(independentCombinations[i].length == 1){
            var v1 = independentCombinations[i][0];

            var result_title = ['Date', "R-Square " + i, "Intercept " + i, v1 + " Co-eff " + i,
                v1 + "p-value " + i];


            for(var j = 0; j < (rows - 11); j++){
                var electricity = json.dependent.Electricity.slice(j, j + 12);

                var variable = json.independent[independentCombinations[i][0]].slice(j, j + 12);

                console.log(electricity);
                console.log(variable);

                // variable = sm.add_constant(var)

                //Works for variable size of 1 independent
                var modal = calc3(5, electricity, variable);

                console.log(modal);
                //model = sm.OLS(electricity, variable).fit()
                // predictions = model.predict(var)
                // result.append(
                //     [df["Date"].iloc[j], model.rsquared, model.params['const'], model.params[v1], model.pvalues[v1]])
                // df_temp = pd.DataFrame(data=result, columns=result_title)

            }
        }
        else if(independentCombinations[i].length == 2){
            console.log(2);
        }
        else if(independentCombinations[i].length == 3){
            console.log(3);
        }

    }

}