import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sliding-regression',
  templateUrl: './sliding-regression.component.html',
  styleUrls: ['./sliding-regression.component.css']
})
export class SlidingRegressionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  calcSlidingRegression(){
// #---------------------------------------------------------------------------------------------------------------------------
// #---------------------------------------------------------------------------------------------------------------------------
// #Read table
//     df = pd.read_excel("Test Data.xlsx")
//
// #####STEP 1 - RUN REGRESSION ANALYSIS FOR ALL VARIABLES FOR ALL TIME FRAMES######
//
//   #define independent variables
// #This needs to be setup such that lesser/greater than 3 variables can also be handled
    var var1 = df.columns[3];
    var var2 = df.columns[4];
    var var3 = df.columns[5];
    var variables = [var1,var2,var3];
    var variables_tuples;
    var variables_list;

//#find all combinations of the independent variables as list of lists
    variables_list = []
    for i in range(1,len(variables)+1){

      variables_tuples = list(itertools.combinations(variables, i))

      temp_list = []

      temp_list = [list(elem)
      for elem in variables_tuples]
      ;

      variables_list += temp_list


//#Regression table for electricity
      df_results = pd.DataFrame(df.loc[0
    :
      len(df)
    ],
      columns = ['Date']
    )

      rows = len(df.index)
      col = len(variables_list)
      for i in range(0, col):
      result = []

      if len(variables_list[i]) == 1:
      v1 = variables_list[i][0]
      result_title = ['Date', "R-Square" + str(i), "Intercept" + str(i), str(v1) + "Co-eff" + str(i), str(v1) + "p-value" + str(i)]

      for j in range(0, rows - 11):

      //#choose electricity and the variables
      electricity = df["Elect (MMBTU)"][j
    :
      j + 12
    ]
      var =
      df[variables_list[i]][j
    :
      j + 12
    ]
      var =
      sm.add_constant(
      var )
      model = sm.OLS(electricity,
      var )
    .
      fit()
      predictions = model.predict(
      var )
      result.append([df["Date"].iloc[j], model.rsquared, model.params['const'], model.params[v1], model.pvalues[v1]])
      df_temp = pd.DataFrame(data = result, columns = result_title)
      df_results = pd.merge(df_results, df_temp, on = 'Date')

    else:
      if len(variables_list[i]) == 2:
      v1 = variables_list[i][0]
      v2 = variables_list[i][1]
      result_title = ['Date', "R-Square" + str(i), "Intercept" + str(i), str(v1) + "Co-eff" + str(i), str(v1) + "p-value" + str(i), str(v2) + "Co-eff" + str(i), str(v2) + "p-value" + str(i)]

      for j in range(0, rows - 11):

      //#choose electricity and the variables
      electricity = df["Elect (MMBTU)"][j
    :
      j + 12
    ]
      var =
      df[variables_list[i]][j
    :
      j + 12
    ]
      var =
      sm.add_constant(
      var )
      model = sm.OLS(electricity,
      var )
    .
      fit()
      predictions = model.predict(
      var )
      result.append([df["Date"].iloc[j], model.rsquared, model.params['const'], model.params[v1], model.pvalues[v1], model.params[v2], model.pvalues[v2]])
      df_temp = pd.DataFrame(data = result, columns = result_title)
      df_results = pd.merge(df_results, df_temp, on = 'Date')

    else:
      v1 = variables_list[i][0]
      v2 = variables_list[i][1]
      v3 = variables_list[i][2]
      result_title = ['Date', "R-Square" + str(i), "Intercept" + str(i), str(v1) + "Co-eff" + str(i), str(v1) + "p-value" + str(i), str(v2) + "Co-eff" + str(i), str(v2) + "p-value" + str(i), str(v3) + "Co-eff" + str(i), str(v3) + "p-value" + str(i)]

      for j in range(0, rows - 11):

      //#choose electricity and the variables
      electricity = df["Elect (MMBTU)"][j
    :
      j + 12
    ]
      var =
      df[variables_list[i]][j
    :
      j + 12
    ]
      var =
      sm.add_constant(
      var )
      model = sm.OLS(electricity,
      var )
    .
      fit()
      predictions = model.predict(
      var )
      result.append([df["Date"].iloc[j], model.rsquared, model.params['const'], model.params[v1], model.pvalues[v1], model.params[v2], model.pvalues[v2], model.params[v3], model.pvalues[v3]])
      df_temp = pd.DataFrame(data = result, columns = result_title)
      df_results = pd.merge(df_results, df_temp, on = 'Date')

// #Add months/year for reference
      df_results["Months"] = 0
      df_results["Year"] = 0
      for i in range(0, len(df_results.index)):
      df_results["Months"][i] = df_results["Date"].iloc[i].month
      df_results["Year"][i] = df_results["Date"].iloc[i].year
    }

// #--------------------------------------------------------------------------------------------------------------------------
// #---------------------------------------------------------------------------------------------------------------------------
//
//
// #####STEP 2 - FINDING MODELS THAT PASS AND THOSE THAT FAIL######
//
//   #Adding model qualifiation criterias - taking to long to run in python, probably inefficient coding

    rows = len(df.index)
    col= len(variables_list)
    for i in range(0,col):
    df_results['Model'+str(i)]=0

    if len(variables_list[i]) == 1:
    v1 = variables_list[i][0]

    for j in range(0,rows-11):
    if(df_results["R-Square"+str(i)][j]>0.5 and df_results[str(v1)+"p-value"+str(i)][j]<0.2):
    df_results.loc[:,("Model"+str(i))][j] = "Pass"

  else:
    df_results.loc[:,("Model"+str(i))][j] = "Fail"

  else:
    if len(variables_list[i]) == 2:
    v1 = variables_list[i][0]
    v2 = variables_list[i][1]

    for j in range(0,rows-11):
    if(df_results["R-Square"+str(i)][j]>0.5 and df_results[str(v1)+"p-value"+str(i)][j]<0.2 and df_results[str(v2)+"p-value"+str(i)][j]<0.2):
    df_results.loc[:,("Model"+str(i))][j] = "Pass"

  else:
    df_results.loc[:,("Model"+str(i))][j] = "Fail"

  else:
    v1 = variables_list[i][0]
    v2 = variables_list[i][1]
    v3 = variables_list[i][2]

    for j in range(0,rows-11):
    if(df_results["R-Square"+str(i)][j]>0.5 and df_results[str(v1)+"p-value"+str(i)][j]<0.2 and df_results[str(v2)+"p-value"+str(i)][j]<0.2 and df_results[str(v3)+"p-value"+str(i)][j]<0.2):
    df_results.loc[:,("Model"+str(i))][j] = "Pass"

  else:
    df_results.loc[:,("Model"+str(i))][j] = "Fail"

// #--------------------------------------------------------------------------------------------------------------------------
// #---------------------------------------------------------------------------------------------------------------------------

//#####STEP 3 - FINDING SAVINGS ######
  //#The savings numbers are caculated in this section with base year as the first 12 months and model year as year2.
//#we use model6 to determine savings, in the tool the user should be able to choose model and model year.
//#Lets fix the base year to be first 12 months for the initial version of the tool.

      model_year = str("2006-01-01")   // #needs to be user defined; year is defined by the 12month period following specified period
    year = 12   //# model year jan 2016 corresponds to the 12th row on the table {df["Date"][12]}; find this from user input
    model = 6   //                       #needs to be user defined

    df_savings = pd.merge(df, df_results, on='Date')

    df_savings["Total Actual Elect"] = 0
    df_savings["Total Model Elect"] = 0
    df_savings["%Savings"] = 0.00

    rows = len(df.index)
    for j in range(0,rows-11):
    df_savings["Total Actual Elect"][j] = sum(df["Elect (MMBTU)"][j:j+12])

  // #this provides a example for model-6 with model year starting with jan 2016. It should be based on user input // note some model might not have all 3 variables, run a loop maybe
    df_savings["Total Model Elect"][j] = df_savings["ProductionCo-eff"+str(model)][year] * sum(df["Production"][j:j+12]) + df_savings["HDDCo-eff"+str(model)][year] * sum(df["HDD"][j:j+12]) +df_savings["CDDCo-eff"+str(model)][year] * sum(df["CDD"][j:j+12]) + df_savings["Intercept"+str(model)][year]*12

    // #the tool will consider the first row of the input and the 11 months following it as the baseline year
    df_savings["%Savings"][j] = 1 - ((df_savings["Total Model Elect"][0]*df_savings["Total Actual Elect"][j])/(df_savings["Total Actual Elect"][0]*df_savings["Total Model Elect"][j]))

    df_savings.style.format({'%Savings': '{:,.2%}'.format})



// #--------------------------------------------------------------------------------------------------------------------------
// #---------------------------------------------------------------------------------------------------------------------------
// #####STEP 4 - RESULTS: PLOTS AND TABLES ######
//
//   #For Table
// #Return the actual actual and modelled energy savings plus the % savings corresponding to Jan of each year from savings tables
// #calculate annual savings from total savings number
//
//
// #plot the sliding R-Square graph based on user input - here plotting for 3-variable
//       #hightlight the models that pass in green and the ones that fail in red
// #hightlight the modelyear that was chosen with a spceial design
// #create a secodnary axis that shows the total savings curve
    rows = len(df_results.index)
    months = range(1,rows+1)
    fig = plt.figure(figsize=(15,8))

    plot1 = fig.add_subplot(2,2,1)
    plot1.set_xlabel("Month")
    plot1.set_ylabel("R- Square")
    plot1.set_title("Electricity")
    plot1.set_ylim([0,1])

    plot1.plot(months, df_results["R-Square6"], color='green', linestyle='dashed', marker='o',markerfacecolor='blue', markersize=4)

    plt.show()

#--------------------------------------------------------------------------------------------------------------------------
#---------------------------------------------------------------------------------------------------------------------------# Features to be added

# the model takes the first 12 months as the baseline period


  }

}