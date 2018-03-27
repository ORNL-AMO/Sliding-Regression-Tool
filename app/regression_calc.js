var json;

var N = 0;
var maxN = 16;
var M = 4;
var X = new makeArray2(M, maxN);
var Y = new Array;
var SX = 0;
var SY = 0;
var SXX = 0;
var SXY = 0;
var SYY = 0;
var m = 0;
var abort = false;


var regrCoeff = new Array;
var sigDig =3;



function slidingRegression(){

}




function makeArray2 (X,Y)
{
    var count;
    this.length = X+1;
    for (var count = 0; count <= X+1; count++)
        this[count] = new makeArray(Y);
}

function makeArray (Y)
{
    var count;
    this.length = Y+1;
    for (var count = 0; count <= Y+1; count++)
        this[count] = 0;
}

function det(A)
{
    var Length = A.length-1;
    if (Length == 1) return (A[1][1]);
    else
    {
        var i;
        var sum = 0;
        var factor = 1;
        for (var i = 1; i <= Length; i++)
        {
            if (A[1][i] != 0)
            {
                minor = new makeArray2(Length-1,Length-1);
                var m;
                var n;
                var theColumn;
                for (var m = 1; m <= Length-1; m++)
                {
                    if (m < i) theColumn = m;
                    else theColumn = m+1;
                    for (var n = 1; n <= Length-1; n++)
                    {
                        minor[n][m] = A[n+1][theColumn];
// alert(minor[n][m]);
                    }
                }
                sum = sum + A[1][i]*factor*det(minor);
            }
            factor = -factor;
        } // end i
    }
    return(sum);
}

function inverse(A) {
    var Length = A.length - 1;
    var B = new makeArray2(Length, Length);
    var d = det(A);
    if (d == 0) alert("singular matrix--check data");
    else
    {
        var i;
        var j;
        for (var i = 1; i <= Length; i++)
        {
            for (var j = 1; j <= Length; j++)
            {

                minor = new makeArray2(Length-1,Length-1);
                var m;
                var n;
                var theColumn;
                var theRow;
                for (var m = 1; m <= Length-1; m++)
                {
                    if (m < j) theColumn = m;
                    else theColumn = m+1;
                    for (var n = 1; n <= Length-1; n++)
                    {
                        if (n < i) theRow = n;
                        else theRow = n+1;
                        minor[n][m] = A[theRow][theColumn];
// alert(minor[n][m]);
                    }
                }

                var temp = (i+j)/2;
                if (temp == Math.round(temp)) factor = 1;
                else factor = -1;

                B[j][i] =  det(minor)*factor/d;


            } // j

        }
    }
    return(B);
}

function shiftRight(theNumber, k) {
    if (k == 0) return (theNumber)
    else
    {
        var k2 = 1;
        var num = k;
        if (num < 0) num = -num;
        for (var i = 1; i <= num; i++)
        {
            k2 = k2*10
        }
    }
    if (k>0)
    {return(k2*theNumber)}
    else
    {return(theNumber/k2)}
}

function roundSigDig(theNumber, numDigits) {
    with (Math)
    {
        if (theNumber == 0) return(0);
        else if(abs(theNumber) < 0.000000000001) return(0);
        else
        {
            var k = floor(log(abs(theNumber))/log(10))-numDigits
            var k2 = shiftRight(round(shiftRight(abs(theNumber),-k)),k)
            if (theNumber > 0) return(k2);
            else return(-k2)
        }
    }
}

function clearForms (){
    document.theForm.output.value=""
    document.theForm.residual_values.value=""
    document.theForm.RMEAN.value=""

    document.theForm.ESQV.value=""
    document.theForm.mean1.value=""
    document.theForm.mean2.value=""

    document.theForm.VR1.value=""
    document.theForm.VR2.value=""
    document.theForm.FR1.value=""

    document.theForm.SR2.value=""
    document.theForm.DW.value=""
    document.theForm.MAE.value=""


    document.theForm.NCON.value=""
    for (i = 0; i <= 15; i++)
    {
        document.theForm[3+6*i].value=""
        document.theForm[4+6*i].value=""
        document.theForm[5+6*i].value=""
        document.theForm[6+6*i].value=""
        document.theForm[7+6*i].value=""
        document.theForm[8+6*i].value=""
    }
}

function stripSpaces (InString)  {
    OutString="";
    for (Count=0; Count < InString.length; Count++)  {
        TempChar=InString.substring (Count, Count+1);
        if (TempChar!=" ")
            OutString=OutString+TempChar;
    }
    return (OutString);
}

function buildxy()  {
    e = 2.718281828459045;
    pi = 3.141592653589793;
    abort = false;

    with (Math) {
        N = 0;
        var searching = true;

        //This is set to the number of independent because we have in our json
        var numvariables = Object.keys(json.independent).length;

        var independentKeys = Object.keys(json.independent);
        var dependentKeys = Object.keys(json.dependent);


        //Runs through as many rows as there are dates available
        for (var i = 0; i < json.date.Date.length; i++) {

            for(var j = 0; j < numvariables; j++){
                var key = independentKeys[j];
                X[j+1][N] = json["independent"][key][N];
            }

            Y[N] = json["dependent"][dependentKeys[0]][N];

            N++;

        }
    }
    M = numvariables;
}

function buildxy2(dependent, independent){
    e = 2.718281828459045;
    pi = 3.141592653589793;
    abort = false;

    with (Math) {
        N = 0;
        var searching = true;

        //This is set to the number of independent because we have in our json
        var numvariables = independent.length;

        //Runs through as many rows as there are dates available
        for (var i = 0; i < dependent.length; i++) {

            for(var j = 0; j < numvariables; j++){
                X[j+1][N] = independent[j][N];
            }

            Y[N] = dependent[N][0];

            N++;

        }
    }
    M = numvariables;
}


function linregr()
{
    if (!abort) {
        e = 2.718281828459045;
        pi = 3.141592653589793;
        var k;
        var i;
        var j;
        var sum;

        B = new makeArray(M+1);
        P = new makeArray2(M+1, M+1);
        invP = new makeArray2(M+1, M+1);
        var mtemp = M+1;

//              if (N < M+1) alert("your need at least "+ mtemp +" points");
        with (Math)
        {
            for (i = 0; i <  N; i++) X[0][i] = 1;
            for (i = 1; i <= M+1; i++)
            {
                sum = 0;
                for (k = 0; k < N; k++){
                    sum = sum + X[i-1][k]*Y[k];
                }
                B[i] = sum;

                for (j = 1; j <= M+1; j++)
                {
                    sum = 0;
                    for (k = 0; k < N; k++) sum = sum + X[i-1][k]*X[j-1][k];
                    P[i][j] = sum;
                }
            }

            invP = inverse(P);
            for (k = 0; k <= M; k++)
            {
                sum = 0;

                for (j = 1; j <= M+1; j++)
                {
                    sum = sum + invP[k+1][j]*B[j];
                }
// alert("here");
                regrCoeff[k] = sum;
            }
        }
    }
}

function calc2(){

    var num = calc2.arguments[0];
    json = calc2.arguments[1];
    var model = {
        fittedModal: "",
        params: [],
        yValues: "",
        rSquare: "",
        fStatistic: "",
        mean: "",
        variance: "",
        mean_1: "",
        mean_2: "",
        vari1: "",
        vari2: "",
        firstO: "",
        secondO: "",
        durbanWatson: "",
        meanAbsE: "",
        normalityCond: "",
        iResidual: []
    };

    if (num == 1)
    {
    }
    else  if (num == 2)
    {

    }
    else  if (num == 3)
    {
    }
    else  if (num == 4)
    {
    }
    else  if (num == 5)
    {
        with (Math)
        {
            buildxy();
// alert("here");
            linregr();

            var predicted = new Array;
            var residual = new Array;
            var output = "Y = " + roundSigDig(regrCoeff[0], sigDig);
            var SE=0;
            var ST = 0;


            for (i = 1; i <=M; i++) {
                output += " + (" + roundSigDig(regrCoeff[i], sigDig) + ")X" + i;
                model.params[i-1] = roundSigDig(regrCoeff[i], sigDig);
            }

            //console.log("The Fitted Model is :" + output);

            model.fittedModal = output;

            for ( i = -1; i < N-1; i++)
            {
                y = regrCoeff[0];


                for (j = 1; j <=M; j++) y +=regrCoeff[j]*X[j][i+1];

                //console.log("Predicted Y Value " + (i+2) + ": " + roundSigDig(y, sigDig));
                model.yValues[i+2] = "Predicted Y Value " + (i+2) + ": " + roundSigDig(y, sigDig);

                predicted[i] = roundSigDig(y, sigDig);

                residual[i] =  (Y[i+1] - predicted[i]);

                //console.log("ith Residual: " + "("+(i+2)+")"+ Math.round(residual[i]*Math.pow(10,4))/Math.pow(10,4)+"    ");

                model.iResidual[i+1] = ("("+(i+2)+") "+ Math.round(residual[i]*Math.pow(10,4))/Math.pow(10,4)+"\t\t");

                SE += residual[i];
                ST += Y[i+1];

            }


            var MSE = 0;
            var MST = 0;

            MSE = SE/N;
            MST = ST/N;

            var SSE = 0;
            var SST = 0;


            for (i = 0; i < N; i++) {
                SSE += (residual[i-1] - MSE)*(residual[i-1] - MSE);

                SST += (Y[i] - MST) *(Y[i] - MST);

            }
            var FR;
            var RRSQ;

            RRSQ = 1-(SSE/SST);

            FR = ((N-M-1)*(SST-SSE))/(M*SSE);
            //console.log("F-Statistic: " + FR);
            model.fStatistic = FR;
            //console.log("R-Square: " + RRSQ);
            model.rSquare = RRSQ;


        }

        //start analysis************************************************************


        var Pi=Math.PI; var PiD2=Pi/2; var PiD4=Pi/4; var Pi2=2*Pi
        var e=2.718281828459045235; var e10 = 1.105170918075647625
        var Deg=180/Pi

        function Norm(z) {
            z=Math.abs(z)
            var p=1+ z*(0.04986735+ z*(0.02114101+ z*(0.00327763+ z*(0.0000380036+ z*(0.0000488906+ z*0.000005383)))))
            p=p*p; p=p*p; p=p*p
            return 1/(p*p)
        }

        function CalcNr(theForm) {
            console.log("NR: " + Fmt(ANorm(eval(document.theForm.pn.value))));
        }

        function ANorm(p) { var v=0.5; var dv=0.5; var z=0
            while(dv>1e-6) { z=1/v-1; dv=dv/2; if(Norm(z)>p) { v=v-dv } else { v=v+dv } }
            return z
        }

        function Fmt(x) {
            var v
            if(x>=0) { v=''+(x+0.00005) } else { v=''+(x-0.00005) }
            return v.substring(0,v.indexOf('.')+5)
        }
        function FishF(f,n1,n2) {
            var x=n2/(n1*f+n2)
            if((n1%2)==0) { return StatCom(1-x,n2,n1+n2-4,n2-2)*Math.pow(x,n2/2) }
            if((n2%2)==0){ return 1-StatCom(x,n1,n1+n2-4,n1-2)*Math.pow(1-x,n1/2) }

            var th=Math.atan(Math.sqrt(n1*f/n2)); var a=th/PiD2; var sth=Math.sin(th); var cth=Math.cos(th)
            if(n2>1) { a=a+sth*cth*StatCom(cth*cth,2,n2-3,-1)/PiD2 }
            if(n1==1) { return 1-a }
            var c=4*StatCom(sth*sth,n2+1,n1+n2-4,n2-2)*sth*Math.pow(cth,n2)/Pi
            if(n2==1) { return 1-a+c/2 }
            var k=2; while(k<=(n2-1)/2) {c=c*k/(k-.5); k=k+1 }
            return 1-a+c
        }
        function StatCom(q,i,j,b) {
            var zz=1; var z=zz; var k=i; while(k<=j) { zz=zz*q*k/(k-b); z=z+zz; k=k+2 }
            return z
        }

        function AFishF(p,n1,n2) { var v=0.5; var dv=0.5; var f=0
            while(dv>1e-10) { f=1/v-1; dv=dv/2; if(FishF(f,n1,n2)>p) { v=v-dv } else { v=v+dv } }
            return f
        }

        var SUME = 0.0;
        var StdE = 0.0;
        for(i=0; i<N-1; i++)  {
            SUME += residual[i-1];
        }
        var len = N-1;
        var mid = Math.floor(len/2);
        var SUME1 = 0;
        var SUME2 = 0;
        var NE1 = 0;
        var NE2 = 0;
        for(i= 0; i<mid; i++) {
            SUME1 += residual[i-1];
            NE1++;
        }
        for(i=mid; i<len; i++) {
            SUME2 += residual[i-1];
            NE2++;
        }
        var mean1 = SUME1/NE1;
        var mean2 = SUME2/NE2;
        // Do the math
        var XE = SUME/len;
        var XE1 = Math.round(10000000*XE)/10000000;
        var mn1 = Math.round(10000000*mean1)/10000000;
        var mn2 = Math.round(10000000*mean2)/10000000;
        //console.log("Mean: " + XE1);
        model.mean = XE1;
        //console.log("Mean: First Half: " + mn1);
        model.mean_1 = mn1;
        //console.log("Mean: Second Half: " + mn2);
        model.mean_2 = mn2;

        //calculate Standard Deviation
        // Run through all the input, add those that have valid values
        for(i = 0; i <N-1; i++) {
            StdE += Math.pow((residual[i-1] - XE), 2);
        }
        var V1 =StdE/(len-2);
        var Vari2 = Math.round(V1*10000000)/10000000;
        //console.log("Variance : " + Vari2);
        model.variance = Vari2;
        //Standard deviation for both parts
        var StdE1=0;
        var StdE2=0;
        for(i=0; i<mid; i++) {
            StdE1 += Math.pow(((residual[i-1])-mean1),2);
        }
        for(i=mid; i<len; i++) {
            StdE2 += Math.pow(((residual[i-1])-mean2),2);
        }
        var VR1 = StdE1/(NE1-2);
        var var1 = Math.round(10000000*VR1)/10000000;
        //console.log("Variance: The First Half: " + var1);
        model.vari1 = var1;
        var VR2 = StdE2/(NE2-2);
        var var2 = Math.round(10000000*VR2)/10000000;
        //console.log("Variance: The Second Half: " + var2);
        model.vari2 = var2;

        //AUTO CORRELATIONS
        var listA = new Array();
        var listB = new Array();
        var listC = new Array();
        var listA2 = new Array();
        var a1 = 0;
        var sumA=0;
        for(i=1; i<len; i++) {
            listA[a1] = parseFloat(residual[i-1]);
            sumA += parseFloat(residual[i-1]);
            a1++;
        }
        var a4 = 0;
        var sumA2=0;
        for(i=2; i<len; i++) {
            listA2[a4] = parseFloat(residual[i-1]);
            sumA2 += parseFloat(residual[i-1]);
            a4++;
        }
        var a2 = 0;
        var sumB=0;
        for(i=0; i<len-1; i++) {
            listB[a2] = parseFloat(residual[i-1]);
            sumB += parseFloat(residual[i-1]);
            a2++;
        }
        var a3 = 0;
        var sumC=0;
        for(i=0; i<len-2; i++) {
            listC[a3] = parseFloat(residual[i-1]);
            sumC += parseFloat(residual[i-1]);
            a3++;
        }
        var meanA = sumA/a1;
        var meanA2 = sumA2/a4;
        var meanB = sumB/a2;
        var meanC = sumC/a3;
        //calculate variance and co-variance
        var varA = 0;
        var varB = 0;
        var covarAB = 0;
        for(i=0; i<listA.length; i++) {
            varA += Math.pow((listA[i]-meanA),2);
            varB += Math.pow((listB[i]-meanB),2);
            covarAB += ((listB[i]-meanB)* (listA[i]-meanA));
        }
        var R1 = covarAB / Math.sqrt(varA*varB);
        var R11 = Math.round(10000000*R1)/10000000;
        //console.log("First Order Serial-Correlation: " + R11);
        model.firstO = R11;
        //******************
        var varA2 = 0;
        var varC = 0;
        var covarA2C = 0;
        for(i=0; i<listA2.length; i++) {
            varA2 += Math.pow((listA2[i]-meanA2),2);
            varC += Math.pow((listC[i]-meanC),2);
            covarA2C += ((listA2[i]-meanA2)* (listC[i]-meanC));
        }
        var R2 = covarA2C / Math.sqrt(varA2*varC);
        var R21 = Math.round(10000000*R2)/10000000;
        //console.log("Second Order Serial-Correlation: " + R21);
        model.secondO = R21;


        var ERR = residual[-1];
        var SUMABSERR = Math.abs(ERR);
        var SSE = residual[-1]*residual[-1];
        var DWNN =0;
        var DWND = (residual[-1]*residual[-1]);
        var SUMERR= residual[-1];
        var DWN=0; var MAE=0;
        for(i=1; i<N; i++)  {
            ERR = residual[i-1];
            SUMERR = SUMERR + ERR;
            SUMABSERR = SUMABSERR + Math.abs(ERR);
            DWNN = DWNN +(residual[i-1]- residual[i-2])*(residual[i-1]-residual[i-2]) ;
            DWND = DWND +(residual[i-1]*residual[i-1]);
            SSE = SSE + ERR * ERR;
        }
        var MAE = SUMABSERR / N;
        var DW = DWNN/DWND;
        MAE = Math.round(MAE*100000)/100000;
        //console.log("Mean Absolute Error: " + MAE);
        model.meanAbsE = MAE;
        DW = Math.round(DW*100000)/100000;
        //console.log("Durbin Watson Statistic: " + DW);
        model.durbanWatson = DW;

        //NORMALITY
        var SUMF = 0;
        var FXX = 0;
        var FX = 0;
        var xvalN = new Array();
        var freq = new Array();


        for(i = 0; i < len; i++) {
            xvalN[i] = residual[i];
            freq[i] = 1
        }


        //calculate FX and FXX
        for(i2=0; i2<xvalN.length; i2++) {
            SUMF += parseFloat(freq[i2]);
            FX += parseFloat(xvalN[i2]) * parseFloat(freq[i2]);
            FXX += parseFloat(freq[i2]) * (Math.pow(parseFloat(xvalN[i2]), 2));
        }
        //calculate Standard Deviation
        var SN2 = FXX - ((FX*FX)/SUMF);
        SN2 = SN2/(SUMF);
        var stdN = Math.sqrt(SN2);
        var meanN = FX / SUMF;

        //Standardize the Data
        var zval = new Array();
        for(i3 = 0; i3 < xvalN.length; i3++) {
            zval[i3] = (xvalN[i3] - meanN) / stdN;
        }

        //sort the list Z(I)
        var zvalS = new Array();
        for(i=0; i<zval.length; i++)  {
            zvalS[i] = zval[i];
        }
        for(i=0; i<zvalS.length-1; i++) {
            for(j=i+1;j<zvalS.length; j++) {
                if( eval(zvalS[j]) < eval(zvalS[i]))  {
                    temp = zvalS[i];
                    zvalS[i] = zvalS[j];
                    zvalS[j] = temp;
                }
            }
        }
        //Corresponding Frequecies
        var freqS = new Array();
        for(i=0; i<freq.length; i++)  {
            freqS[i] = freq[i];
        }
        for(i=0; i<zval.length; i++) {
            for(j=0;j<zval.length; j++) {
                if(zvalS[i]==zval[j])  {
                    freqS[i] = freq[j];
                }
            }
        }
        //calculate F from here
        var fval = new Array();
        var F1 = 0;
        for(i6=0; i6<zvalS.length; i6++) {
            F1 = Norm(zvalS[i6]);
            if(zvalS[i6]>=0)  {
                fval[i6] = 1 - (F1)/2;  }
            else  {
                fval[i6] = F1/2; }
            F1=0;
        }

        //calculate J from here
        var jval = new Array();
        jval[0] = freqS[0]/SUMF;

        for(i7=1; i7<zvalS.length; i7++) {
            jval[i7] = jval[i7-1] + (freqS[i7]/SUMF);
        }

        var DP = new Array();
        DP[0] = Math.abs(jval[0] - fval[0]);

        for (i=1; i<N; i++)  {
            A = Math.abs(jval[i] - fval[i]);
            B = Math.abs(fval[i] - jval[i-1]);
            DP[i] = Math.max(A,B);
        }

        //sort the list DP(I)
        for(i=0; i<DP.length-1; i++) {
            for(j=i+1;j<DP.length; j++) {
                if( eval(DP[j]) < eval(DP[i]))  {
                    temp = DP[i];
                    DP[i] = DP[j];
                    DP[j] = temp;
                }
            }
        }
        var DPP = DP[DP.length-1];
        var D = DPP;
        var td = D + "";   //forcing to be a string

        var A0 = Math.sqrt(SUMF);
        var C1 =  A0  - 0.01 + (0.85/A0);
        var D15 = 0.775/C1;
        var D10 = 0.819/C1;
        var D05 = 0.895/C1;
        var D025 = 0.995/C1;
        var t2N = D;


        //determine the conclusion
        if (t2N > D025)   {
            //console.log("Evidence against normality");
            model.normalityCond = "Evidence against normality";
        }
        else if ((t2N <= D025) && (t2N > D05))  {
            //console.log("Sufficient evidence against normality");
            model.normalityCond = "Sufficient evidence against normality";
        }
        else if ((t2N <= D05) && (t2N > D10))  {
            //console.log("Suggestive evidence against normality");
            model.normalityCond = "Suggestive evidence against normality";
        }
        else if ((t2N <= D10) && (t2N > D15))  {
            //console.log("Little evidence against normality");
            model.normalityCond = "Little evidence against normality";
        }
        else if (t2N <=D15)  {
            //console.log("No evidences against normality");
            model.normalityCond = "No evidences against normality";
        }
        else {
            //console.log("Evidence against normality");
            model.normalityCond = "Evidence against normality";
        }

    }
    else  if (num == 6)
    {
    }
    return model;
}

function calc3(num, dependent, independent){

    var model = {
        fittedModal: "",
        params: [],
        yValues: "",
        rSquare: "",
        fStatistic: "",
        mean: "",
        variance: "",
        mean_1: "",
        mean_2: "",
        vari1: "",
        vari2: "",
        firstO: "",
        secondO: "",
        durbanWatson: "",
        meanAbsE: "",
        normalityCond: "",
        iResidual: []
    };

    if (num == 1)
    {
    }
    else  if (num == 2)
    {

    }
    else  if (num == 3)
    {
    }
    else  if (num == 4)
    {
    }
    else  if (num == 5)
    {
        with (Math)
        {
            buildxy2(dependent, independent);

            linregr();

            var predicted = new Array;
            var residual = new Array;
            var output = "Y = " + roundSigDig(regrCoeff[0], sigDig);
            var SE = 0;
            var ST = 0;


            for (i = 1; i <=M; i++) {
                output += " + (" + roundSigDig(regrCoeff[i], sigDig) + ")X" + i;
                model.params[i-1] = roundSigDig(regrCoeff[i], sigDig);
            }

            //console.log("The Fitted Model is :" + output);

            model.fittedModal = output;

            for ( i = -1; i < N-1; i++)
            {
                y = regrCoeff[0];


                for (j = 1; j <=M; j++) y +=regrCoeff[j]*X[j][i+1];

                //console.log("Predicted Y Value " + (i+2) + ": " + roundSigDig(y, sigDig));
                model.yValues[i+2] = "Predicted Y Value " + (i+2) + ": " + roundSigDig(y, sigDig);

                predicted[i] = roundSigDig(y, sigDig);

                residual[i] =  (Y[i+1] - predicted[i]);

                //console.log("ith Residual: " + "("+(i+2)+")"+ Math.round(residual[i]*Math.pow(10,4))/Math.pow(10,4)+"    ");

                model.iResidual[i+1] = ("("+(i+2)+") "+ Math.round(residual[i]*Math.pow(10,4))/Math.pow(10,4)+"\t\t");

                SE += residual[i];
                //console.log(Number(Y[i+1]));
                ST += Number(Y[i+1]);

            }


            var MSE = 0;
            var MST = 0;

            //console.log(ST);
            // console.log(N);

            MSE = SE/N;
            MST = ST/N;

            var SSE = 0;
            var SST = 0;

            for (i = 0; i < N; i++) {
                SSE += (residual[i-1] - MSE)*(residual[i-1] - MSE);

                SST += (Y[i] - MST) *(Y[i] - MST);
            }

            // console.log(SST);
            // console.log("/////////////////////////////////////////////////////////");

            var FR;
            var RRSQ;

            RRSQ = 1-(SSE/SST);

            FR = ((N-M-1)*(SST-SSE))/(M*SSE);
            //console.log("F-Statistic: " + FR);
            model.fStatistic = FR;
            //console.log("R-Square: " + RRSQ);
            model.rSquare = RRSQ;


        }

        //start analysis************************************************************


        var Pi=Math.PI; var PiD2=Pi/2; var PiD4=Pi/4; var Pi2=2*Pi
        var e=2.718281828459045235; var e10 = 1.105170918075647625
        var Deg=180/Pi

        function Norm(z) {
            z=Math.abs(z)
            var p=1+ z*(0.04986735+ z*(0.02114101+ z*(0.00327763+ z*(0.0000380036+ z*(0.0000488906+ z*0.000005383)))))
            p=p*p; p=p*p; p=p*p
            return 1/(p*p)
        }

        function CalcNr(theForm) {
            console.log("NR: " + Fmt(ANorm(eval(document.theForm.pn.value))));
        }

        function ANorm(p) { var v=0.5; var dv=0.5; var z=0
            while(dv>1e-6) { z=1/v-1; dv=dv/2; if(Norm(z)>p) { v=v-dv } else { v=v+dv } }
            return z
        }

        function Fmt(x) {
            var v
            if(x>=0) { v=''+(x+0.00005) } else { v=''+(x-0.00005) }
            return v.substring(0,v.indexOf('.')+5)
        }
        function FishF(f,n1,n2) {
            var x=n2/(n1*f+n2)
            if((n1%2)==0) { return StatCom(1-x,n2,n1+n2-4,n2-2)*Math.pow(x,n2/2) }
            if((n2%2)==0){ return 1-StatCom(x,n1,n1+n2-4,n1-2)*Math.pow(1-x,n1/2) }

            var th=Math.atan(Math.sqrt(n1*f/n2)); var a=th/PiD2; var sth=Math.sin(th); var cth=Math.cos(th)
            if(n2>1) { a=a+sth*cth*StatCom(cth*cth,2,n2-3,-1)/PiD2 }
            if(n1==1) { return 1-a }
            var c=4*StatCom(sth*sth,n2+1,n1+n2-4,n2-2)*sth*Math.pow(cth,n2)/Pi
            if(n2==1) { return 1-a+c/2 }
            var k=2; while(k<=(n2-1)/2) {c=c*k/(k-.5); k=k+1 }
            return 1-a+c
        }
        function StatCom(q,i,j,b) {
            var zz=1; var z=zz; var k=i; while(k<=j) { zz=zz*q*k/(k-b); z=z+zz; k=k+2 }
            return z
        }

        function AFishF(p,n1,n2) { var v=0.5; var dv=0.5; var f=0
            while(dv>1e-10) { f=1/v-1; dv=dv/2; if(FishF(f,n1,n2)>p) { v=v-dv } else { v=v+dv } }
            return f
        }

        var SUME = 0.0;
        var StdE = 0.0;
        for(i=0; i<N-1; i++)  {
            SUME += residual[i-1];
        }
        var len = N-1;
        var mid = Math.floor(len/2);
        var SUME1 = 0;
        var SUME2 = 0;
        var NE1 = 0;
        var NE2 = 0;
        for(i= 0; i<mid; i++) {
            SUME1 += residual[i-1];
            NE1++;
        }
        for(i=mid; i<len; i++) {
            SUME2 += residual[i-1];
            NE2++;
        }
        var mean1 = SUME1/NE1;
        var mean2 = SUME2/NE2;
        // Do the math
        var XE = SUME/len;
        var XE1 = Math.round(10000000*XE)/10000000;
        var mn1 = Math.round(10000000*mean1)/10000000;
        var mn2 = Math.round(10000000*mean2)/10000000;
        //console.log("Mean: " + XE1);
        model.mean = XE1;
        //console.log("Mean: First Half: " + mn1);
        model.mean_1 = mn1;
        //console.log("Mean: Second Half: " + mn2);
        model.mean_2 = mn2;

        //calculate Standard Deviation
        // Run through all the input, add those that have valid values
        for(i = 0; i <N-1; i++) {
            StdE += Math.pow((residual[i-1] - XE), 2);
        }
        var V1 =StdE/(len-2);
        var Vari2 = Math.round(V1*10000000)/10000000;
        //console.log("Variance : " + Vari2);
        model.variance = Vari2;
        //Standard deviation for both parts
        var StdE1=0;
        var StdE2=0;
        for(i=0; i<mid; i++) {
            StdE1 += Math.pow(((residual[i-1])-mean1),2);
        }
        for(i=mid; i<len; i++) {
            StdE2 += Math.pow(((residual[i-1])-mean2),2);
        }
        var VR1 = StdE1/(NE1-2);
        var var1 = Math.round(10000000*VR1)/10000000;
        //console.log("Variance: The First Half: " + var1);
        model.vari1 = var1;
        var VR2 = StdE2/(NE2-2);
        var var2 = Math.round(10000000*VR2)/10000000;
        //console.log("Variance: The Second Half: " + var2);
        model.vari2 = var2;

        //AUTO CORRELATIONS
        var listA = new Array();
        var listB = new Array();
        var listC = new Array();
        var listA2 = new Array();
        var a1 = 0;
        var sumA=0;
        for(i=1; i<len; i++) {
            listA[a1] = parseFloat(residual[i-1]);
            sumA += parseFloat(residual[i-1]);
            a1++;
        }
        var a4 = 0;
        var sumA2=0;
        for(i=2; i<len; i++) {
            listA2[a4] = parseFloat(residual[i-1]);
            sumA2 += parseFloat(residual[i-1]);
            a4++;
        }
        var a2 = 0;
        var sumB=0;
        for(i=0; i<len-1; i++) {
            listB[a2] = parseFloat(residual[i-1]);
            sumB += parseFloat(residual[i-1]);
            a2++;
        }
        var a3 = 0;
        var sumC=0;
        for(i=0; i<len-2; i++) {
            listC[a3] = parseFloat(residual[i-1]);
            sumC += parseFloat(residual[i-1]);
            a3++;
        }
        var meanA = sumA/a1;
        var meanA2 = sumA2/a4;
        var meanB = sumB/a2;
        var meanC = sumC/a3;
        //calculate variance and co-variance
        var varA = 0;
        var varB = 0;
        var covarAB = 0;
        for(i=0; i<listA.length; i++) {
            varA += Math.pow((listA[i]-meanA),2);
            varB += Math.pow((listB[i]-meanB),2);
            covarAB += ((listB[i]-meanB)* (listA[i]-meanA));
        }
        var R1 = covarAB / Math.sqrt(varA*varB);
        var R11 = Math.round(10000000*R1)/10000000;
        //console.log("First Order Serial-Correlation: " + R11);
        model.firstO = R11;
        //******************
        var varA2 = 0;
        var varC = 0;
        var covarA2C = 0;
        for(i=0; i<listA2.length; i++) {
            varA2 += Math.pow((listA2[i]-meanA2),2);
            varC += Math.pow((listC[i]-meanC),2);
            covarA2C += ((listA2[i]-meanA2)* (listC[i]-meanC));
        }
        var R2 = covarA2C / Math.sqrt(varA2*varC);
        var R21 = Math.round(10000000*R2)/10000000;
        //console.log("Second Order Serial-Correlation: " + R21);
        model.secondO = R21;


        var ERR = residual[-1];
        var SUMABSERR = Math.abs(ERR);
        var SSE = residual[-1]*residual[-1];
        var DWNN =0;
        var DWND = (residual[-1]*residual[-1]);
        var SUMERR= residual[-1];
        var DWN=0; var MAE=0;
        for(i=1; i<N; i++)  {
            ERR = residual[i-1];
            SUMERR = SUMERR + ERR;
            SUMABSERR = SUMABSERR + Math.abs(ERR);
            DWNN = DWNN +(residual[i-1]- residual[i-2])*(residual[i-1]-residual[i-2]) ;
            DWND = DWND +(residual[i-1]*residual[i-1]);
            SSE = SSE + ERR * ERR;
        }
        var MAE = SUMABSERR / N;
        var DW = DWNN/DWND;
        MAE = Math.round(MAE*100000)/100000;
        //console.log("Mean Absolute Error: " + MAE);
        model.meanAbsE = MAE;
        DW = Math.round(DW*100000)/100000;
        //console.log("Durbin Watson Statistic: " + DW);
        model.durbanWatson = DW;

        //NORMALITY
        var SUMF = 0;
        var FXX = 0;
        var FX = 0;
        var xvalN = new Array();
        var freq = new Array();


        for(i = 0; i < len; i++) {
            xvalN[i] = residual[i];
            freq[i] = 1
        }


        //calculate FX and FXX
        for(i2=0; i2<xvalN.length; i2++) {
            SUMF += parseFloat(freq[i2]);
            FX += parseFloat(xvalN[i2]) * parseFloat(freq[i2]);
            FXX += parseFloat(freq[i2]) * (Math.pow(parseFloat(xvalN[i2]), 2));
        }
        //calculate Standard Deviation
        var SN2 = FXX - ((FX*FX)/SUMF);
        SN2 = SN2/(SUMF);
        var stdN = Math.sqrt(SN2);
        var meanN = FX / SUMF;

        //Standardize the Data
        var zval = new Array();
        for(i3 = 0; i3 < xvalN.length; i3++) {
            zval[i3] = (xvalN[i3] - meanN) / stdN;
        }

        //sort the list Z(I)
        var zvalS = new Array();
        for(i=0; i<zval.length; i++)  {
            zvalS[i] = zval[i];
        }
        for(i=0; i<zvalS.length-1; i++) {
            for(j=i+1;j<zvalS.length; j++) {
                if( eval(zvalS[j]) < eval(zvalS[i]))  {
                    temp = zvalS[i];
                    zvalS[i] = zvalS[j];
                    zvalS[j] = temp;
                }
            }
        }
        //Corresponding Frequecies
        var freqS = new Array();
        for(i=0; i<freq.length; i++)  {
            freqS[i] = freq[i];
        }
        for(i=0; i<zval.length; i++) {
            for(j=0;j<zval.length; j++) {
                if(zvalS[i]==zval[j])  {
                    freqS[i] = freq[j];
                }
            }
        }
        //calculate F from here
        var fval = new Array();
        var F1 = 0;
        for(i6=0; i6<zvalS.length; i6++) {
            F1 = Norm(zvalS[i6]);
            if(zvalS[i6]>=0)  {
                fval[i6] = 1 - (F1)/2;  }
            else  {
                fval[i6] = F1/2; }
            F1=0;
        }

        //calculate J from here
        var jval = new Array();
        jval[0] = freqS[0]/SUMF;

        for(i7=1; i7<zvalS.length; i7++) {
            jval[i7] = jval[i7-1] + (freqS[i7]/SUMF);
        }

        var DP = new Array();
        DP[0] = Math.abs(jval[0] - fval[0]);

        for (i=1; i<N; i++)  {
            A = Math.abs(jval[i] - fval[i]);
            B = Math.abs(fval[i] - jval[i-1]);
            DP[i] = Math.max(A,B);
        }

        //sort the list DP(I)
        for(i=0; i<DP.length-1; i++) {
            for(j=i+1;j<DP.length; j++) {
                if( eval(DP[j]) < eval(DP[i]))  {
                    temp = DP[i];
                    DP[i] = DP[j];
                    DP[j] = temp;
                }
            }
        }
        var DPP = DP[DP.length-1];
        var D = DPP;
        var td = D + "";   //forcing to be a string

        var A0 = Math.sqrt(SUMF);
        var C1 =  A0  - 0.01 + (0.85/A0);
        var D15 = 0.775/C1;
        var D10 = 0.819/C1;
        var D05 = 0.895/C1;
        var D025 = 0.995/C1;
        var t2N = D;


        //determine the conclusion
        if (t2N > D025)   {
            //console.log("Evidence against normality");
            model.normalityCond = "Evidence against normality";
        }
        else if ((t2N <= D025) && (t2N > D05))  {
            //console.log("Sufficient evidence against normality");
            model.normalityCond = "Sufficient evidence against normality";
        }
        else if ((t2N <= D05) && (t2N > D10))  {
            //console.log("Suggestive evidence against normality");
            model.normalityCond = "Suggestive evidence against normality";
        }
        else if ((t2N <= D10) && (t2N > D15))  {
            //console.log("Little evidence against normality");
            model.normalityCond = "Little evidence against normality";
        }
        else if (t2N <=D15)  {
            //console.log("No evidences against normality");
            model.normalityCond = "No evidences against normality";
        }
        else {
            //console.log("Evidence against normality");
            model.normalityCond = "Evidence against normality";
        }

    }
    else  if (num == 6)
    {
    }

    return model;
}
