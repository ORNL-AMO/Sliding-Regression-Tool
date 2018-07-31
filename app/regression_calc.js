const jStat = require('jStat').jStat;
const math = require('mathjs');
var json;

function slidingRegression() {
    var calc = {};

    /***** methods *****/

    //initializes a 'len' long array with all 0 values
    calc.makeArray = function (len) {
        var arr = [];
        for (var count = 0; count <= len + 1; count++)
            arr[count] = 0;
        return arr;
    }

    //initializes an x by y matrix with all 0 values
    calc.makeMatrix = function (x, y) {
        var mat = [];
        this.length = x + 1;
        for (var count = 0; count <= x + 1; count++)
            mat[count] = calc.makeArray(y);
        return mat;
    }

    //calculates the determinant of a square matrix
    calc.det = function (mat) {
        var len = mat.length - 1;
        if (len == 1) return (mat[1][1]);
        else {
            var sum = 0;
            var factor = 1;
            for (var i = 1; i <= len; i++) {
                if (mat[1][i] != 0) {
                    // var minor = new this.makeMatrix(len - 1, len - 1);
                    var minor = this.makeMatrix(len - 1, len - 1);
                    var col;
                    for (var m = 1; m < len; m++) {
                        if (m < i) col = m;
                        else col = m + 1;
                        for (var n = 1; n < len; n++) {
                            minor[n][m] = mat[n + 1][col];
                        }
                    }
                    sum = sum + mat[1][i] * factor * this.det(minor);
                }
                factor = -factor;
            } // end i
        }
        return sum;
    }

    //returns the inverse of a square matrix
    calc.inverse = function (mat) {
        // var determinant = this.det(mat);
        var determinant = math.det(mat);
        if (determinant == 0) {
            throw "calc.inverse called with singular matrix.";
        }
        var len = mat.length - 1;
        // var inv = new this.makeMatrix(len, len);
        var inv = this.makeMatrix(len, len);

        for (var i = 1; i <= len; i++) {
            for (var j = 1; j <= len; j++) {
                // minor = new this.makeMatrix(len - 1, len - 1);
                minor = this.makeMatrix(len - 1, len - 1);
                var col, row;
                for (var m = 1; m <= len - 1; m++) {
                    if (m < j) col = m;
                    else col = m + 1;
                    for (var n = 1; n <= len - 1; n++) {
                        if (n < i) row = n;
                        else row = n + 1;
                        minor[n][m] = mat[row][col];
                    }
                }

                var temp = (i + j) / 2;
                if (temp == Math.round(temp)) factor = 1;
                else factor = -1;

                inv[j][i] = this.det(minor) * factor / determinant;
            }
        }
        return inv;
    }

    calc.shiftRight = function(theNumber, k) {
        if (k == 0) return (theNumber)
        else {
            var k2 = 1;
            var num = k;
            if (num < 0) num = -num;
            for (var i = 1; i <= num; i++) {
                k2 = k2 * 10
            }
        }
        if (k > 0) { return (k2 * theNumber) }
        else { return (theNumber / k2) }
    }

    //rounds 'num' to have 'numDigits' significant digits
    calc.roundSigDig = function (num, numDigits) {
        with (Math) {
            if (num == 0) return (0);
            else if (abs(num) < 0.000000000001) return (0);
            var k = floor(log(abs(num)) / log(10)) - numDigits
            var k2 = this.shiftRight(round(this.shiftRight(abs(num), -k)), k)
            if (num > 0) return (k2);
            else return (-k2)
        }
    }

    calc.construct = function (dependent, independent) {
        with (Math) {
            //number of datapoints
            this.n = dependent.length;
            //number of independent variables
            this.m = independent.length;
            // this.indep = this.makeMatrix(this.m, this.n);
            // this.dep = this.makeArray(this.n);
            this.indep = [[]];
            this.dep = [];
            this.xBar = [];

            for (var i = 0; i < this.n; i++) {
                this.indep[0][i] = 1;
            }

            //Runs through each row (12 months)
            for (i = 0; i < this.n; i++) {
                this.dep[i] = dependent[i][0];
                //Runs through each independent variable
                for (var j = 0; j < this.m; j++) {
                    if (!this.indep[j + 1]) this.indep[j + 1] = [];
                    this.indep[j + 1][i] = independent[j][i][0];
                    if (this.xBar[j]) {
                        //+s used to prevent JS from turning to string and concatenating
                        this.xBar[j] = +this.xBar[j] + +independent[j][i];
                    } else {
                        this.xBar[j] = independent[j][i];
                    }
                }
            }
            
            for (j = 0; j < this.m; j++) {
                this.xBar[j] /= this.n;
            }
            

        }
    }

    calc.linregr = function () {
        var k;
        var i;
        var j;
        var sum;

        // this.B = new this.makeArray(this.m + 1);
        // var P = new this.makeMatrix(this.m + 1, this.m + 1);
        // this.invP = new this.makeMatrix(this.m + 1, this.m + 1);
        //this.m + 1
        var B = this.makeArray(this.m - 1);
        //this.m + 1, this.m + 1
        var P = this.makeMatrix(this.m - 1, this.m - 1);
        // var invP = this.makeMatrix(this.m + 1, this.m + 1);

        with (Math) {
            //i = 1; i <= this.m + 1
            for (i = 0; i <= this.m; i++) {
                sum = 0;
                for (k = 0; k < this.n; k++) {
                    //indep[i-1]
                    sum = sum + this.indep[i][k] * this.dep[k];
                }
                B[i] = sum;

                //j = 1; j <= this.m + 1
                for (j = 0; j <= this.m; j++) {
                    sum = 0;
                    //indep[i - 1], indep[j - 1]
                    for (k = 0; k < this.n; k++) sum = sum + this.indep[i][k] * this.indep[j][k];
                    P[i][j] = sum;
                }
            }

            // this.invP = this.inverse(this.P);
            var invP = math.inv(P);
            for (k = 0; k <= this.m; k++) {
                sum = 0;

                //j = 1; j <= this.m + 1
                for (j = 0; j <= this.m; j++) {
                    //invP[k + 1]
                    sum = sum + invP[k][j] * B[j];
                }
                // alert("here");
                this.regrCoeff[k] = sum;
            }
        }
    }

    calc.coeffTest = function (SSE, params) {
        //sum of squares of x (sum of (xi-xBar)^2)
        // var xSS = new Array;
        // var tVals = new Array;
        // for (var i = 0; i < this.m; i++) {
        //     xSS[i] = 0;
        //     for (var j = 0; j < this.n; j++) {
        //         //+s used to prevent JS from turning to string and concatenating
        //         xSS[i] = +xSS[i] + +Math.pow(this.indep[i][j] - this.xBar[i], 2);
        //     }
            
        // }
        // sse / (this.n - 2)

        //sigma ^ 2
        var stdev = SSE / (this.n - this.m - 1);
        //covariance matrix
        var trans = math.transpose(this.indep);
        var prod = math.multiply(this.indep, trans);
        var inv = math.inv(prod);
        var C = jStat.multiply(inv, stdev);
        var tstats = [];
        var pvals = [];
        for (var i = 0; i < this.m; i++) {
            tstats[i] = params[i] / math.sqrt(C[i+1][i+1]);
            pvals[i] = jStat.ttest(tstats[i], this.n - this.m, 2);
        }

        return pvals;
    }

    calc.calc3 = function (num, dependent, independent, independentNames) {

        var model = {
            fittedModel: "",
            params: [],
            yValues: "",
            rSquare: "",
            fStatistic: "",
            pValue: "",
            coeffPVals: [],
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
            intercept: "",
            iResidual: []
        };
        with (Math) {
            this.construct(dependent, independent);

            this.linregr();

            var predicted = new Array;
            var residual = new Array;
            var output = "Y = " + this.roundSigDig(this.regrCoeff[0], this.sigDig);
            model.intercept = this.regrCoeff[0];
            var SE = 0;
            var ST = 0;

            for (var i = 1; i <= this.m; i++) {
                output += " + (" + this.roundSigDig(this.regrCoeff[i], this.sigDig) + ")" + independentNames[i - 1];
                model.params[i - 1] = this.roundSigDig(this.regrCoeff[i], this.sigDig);
            }

            //console.log("The Fitted Model is :" + output);

            model.fittedModel = output;

            for (i = -1; i < this.n - 1; i++) {
                this.y = this.regrCoeff[0];


                for (j = 1; j <= this.m; j++) this.y += this.regrCoeff[j] * this.indep[j][i + 1];

                //console.log("Predicted Y Value " + (i+2) + ": " + this.roundSigDig(y, this.sigDig));
                model.yValues[i + 2] = "Predicted Y Value " + (i + 2) + ": " + this.roundSigDig(this.y, this.sigDig);

                predicted[i] = this.roundSigDig(this.y, this.sigDig);

                residual[i] = (this.dep[i + 1] - predicted[i]);

                //console.log("ith Residual: " + "("+(i+2)+")"+ Math.round(residual[i]*Math.pow(10,4))/Math.pow(10,4)+"    ");

                model.iResidual[i + 1] = ("(" + (i + 2) + ") " + Math.round(residual[i] * Math.pow(10, 4)) / Math.pow(10, 4) + "\t\t");

                SE += residual[i];
                //console.log(Number(Y[i+1]));

                //remove commas for getting number
                // Y[i+1] = parseFloat(Y[i+1].replace(/,/g, ''));
                //
                // console.log(Number(Y[i+1]));

                ST += Number(this.dep[i + 1]);

            }


            var MSE = 0;
            var MST = 0;

            //console.log(ST);
            // console.log(N);

            MSE = SE / this.n;
            MST = ST / this.n;

            var SSE = 0;
            var SST = 0;

            for (i = 0; i < this.n; i++) {
                SSE += (residual[i - 1] - MSE) * (residual[i - 1] - MSE);

                SST += (this.dep[i] - MST) * (this.dep[i] - MST);
            }

            // console.log(SST);
            // console.log("/////////////////////////////////////////////////////////");

            var FR;
            var RRSQ;

            RRSQ = 1 - (SSE / SST);

            FR = ((this.n - this.m - 1) * (SST - SSE)) / (this.m * SSE);
            var dfNum, dfDenom, pValue;
            //number of parameters in model
            dfNum = this.m;
            //number of data points - number of parameters - 1
            dfDenom = this.n - this.m - 1;
            pValue = jStat.ftest(FR, dfNum, dfDenom);

            model.coeffPVals = this.coeffTest(SSE, model.params);

            //console.log("F-Statistic: " + FR);
            model.fStatistic = FR;
            //console.log("P-value: " + pValue);
            model.pValue = pValue;
            //console.log("R-Square: " + RRSQ);
            model.rSquare = RRSQ;

            //start analysis************************************************************


            var PiD2 = PI / 2; var PiD4 = PI / 4; var Pi2 = 2 * PI
            var e = 2.718281828459045235; var e10 = 1.105170918075647625
            var Deg = 180 / PI

            function Norm(z) {
                z = Math.abs(z)
                var p = 1 + z * (0.04986735 + z * (0.02114101 + z * (0.00327763 + z * (0.0000380036 + z * (0.0000488906 + z * 0.000005383)))))
                p = p * p; p = p * p; p = p * p
                return 1 / (p * p)
            }

            function CalcNr(theForm) {
                console.log("NR: " + Fmt(ANorm(eval(document.theForm.pn.value))));
            }

            function ANorm(p) {
                var v = 0.5; var dv = 0.5; var z = 0
                while (dv > 1e-6) { z = 1 / v - 1; dv = dv / 2; if (Norm(z) > p) { v = v - dv } else { v = v + dv } }
                return z
            }

            function Fmt(x) {
                var v
                if (x >= 0) { v = '' + (x + 0.00005) } else { v = '' + (x - 0.00005) }
                return v.substring(0, v.indexOf('.') + 5)
            }
            function FishF(f, n1, n2) {
                var x = n2 / (n1 * f + n2)
                if ((n1 % 2) == 0) { return StatCom(1 - x, n2, n1 + n2 - 4, n2 - 2) * Math.pow(x, n2 / 2) }
                if ((n2 % 2) == 0) { return 1 - StatCom(x, n1, n1 + n2 - 4, n1 - 2) * Math.pow(1 - x, n1 / 2) }

                var th = Math.atan(Math.sqrt(n1 * f / n2)); var a = th / PiD2; var sth = Math.sin(th); var cth = Math.cos(th)
                if (n2 > 1) { a = a + sth * cth * StatCom(cth * cth, 2, n2 - 3, -1) / PiD2 }
                if (n1 == 1) { return 1 - a }
                var c = 4 * StatCom(sth * sth, n2 + 1, n1 + n2 - 4, n2 - 2) * sth * Math.pow(cth, n2) / PI
                if (n2 == 1) { return 1 - a + c / 2 }
                var k = 2; while (k <= (n2 - 1) / 2) { c = c * k / (k - .5); k = k + 1 }
                return 1 - a + c
            }
            function StatCom(q, i, j, b) {
                var zz = 1; var z = zz; var k = i; while (k <= j) { zz = zz * q * k / (k - b); z = z + zz; k = k + 2 }
                return z
            }

            function AFishF(p, n1, n2) {
                var v = 0.5; var dv = 0.5; var f = 0
                while (dv > 1e-10) { f = 1 / v - 1; dv = dv / 2; if (FishF(f, n1, n2) > p) { v = v - dv } else { v = v + dv } }
                return f
            }

            var SUME = 0.0;
            var StdE = 0.0;
            for (i = 0; i < this.n - 1; i++) {
                SUME += residual[i - 1];
            }
            var len = this.n - 1;
            var mid = Math.floor(len / 2);
            var SUME1 = 0;
            var SUME2 = 0;
            var NE1 = 0;
            var NE2 = 0;
            for (i = 0; i < mid; i++) {
                SUME1 += residual[i - 1];
                NE1++;
            }
            for (i = mid; i < len; i++) {
                SUME2 += residual[i - 1];
                NE2++;
            }
            var mean1 = SUME1 / NE1;
            var mean2 = SUME2 / NE2;
            // Do the math
            var XE = SUME / len;
            var XE1 = Math.round(10000000 * XE) / 10000000;
            var mn1 = Math.round(10000000 * mean1) / 10000000;
            var mn2 = Math.round(10000000 * mean2) / 10000000;
            //console.log("Mean: " + XE1);
            model.mean = XE1;
            //console.log("Mean: First Half: " + mn1);
            model.mean_1 = mn1;
            //console.log("Mean: Second Half: " + mn2);
            model.mean_2 = mn2;

            //calculate Standard Deviation
            // Run through all the input, add those that have valid values
            for (i = 0; i < this.n - 1; i++) {
                StdE += Math.pow((residual[i - 1] - XE), 2);
            }
            var V1 = StdE / (len - 2);
            var Vari2 = Math.round(V1 * 10000000) / 10000000;
            //console.log("Variance : " + Vari2);
            model.variance = Vari2;
            //Standard deviation for both parts
            var StdE1 = 0;
            var StdE2 = 0;
            for (i = 0; i < mid; i++) {
                StdE1 += Math.pow(((residual[i - 1]) - mean1), 2);
            }
            for (i = mid; i < len; i++) {
                StdE2 += Math.pow(((residual[i - 1]) - mean2), 2);
            }
            var VR1 = StdE1 / (NE1 - 2);
            var var1 = Math.round(10000000 * VR1) / 10000000;
            //console.log("Variance: The First Half: " + var1);
            model.vari1 = var1;
            var VR2 = StdE2 / (NE2 - 2);
            var var2 = Math.round(10000000 * VR2) / 10000000;
            //console.log("Variance: The Second Half: " + var2);
            model.vari2 = var2;

            //AUTO CORRELATIONS
            var listA = new Array();
            var listB = new Array();
            var listC = new Array();
            var listA2 = new Array();
            var a1 = 0;
            var sumA = 0;
            for (i = 1; i < len; i++) {
                listA[a1] = parseFloat(residual[i - 1]);
                sumA += parseFloat(residual[i - 1]);
                a1++;
            }
            var a4 = 0;
            var sumA2 = 0;
            for (i = 2; i < len; i++) {
                listA2[a4] = parseFloat(residual[i - 1]);
                sumA2 += parseFloat(residual[i - 1]);
                a4++;
            }
            var a2 = 0;
            var sumB = 0;
            for (i = 0; i < len - 1; i++) {
                listB[a2] = parseFloat(residual[i - 1]);
                sumB += parseFloat(residual[i - 1]);
                a2++;
            }
            var a3 = 0;
            var sumC = 0;
            for (i = 0; i < len - 2; i++) {
                listC[a3] = parseFloat(residual[i - 1]);
                sumC += parseFloat(residual[i - 1]);
                a3++;
            }
            var meanA = sumA / a1;
            var meanA2 = sumA2 / a4;
            var meanB = sumB / a2;
            var meanC = sumC / a3;
            //calculate variance and co-variance
            var varA = 0;
            var varB = 0;
            var covarAB = 0;
            for (i = 0; i < listA.length; i++) {
                varA += Math.pow((listA[i] - meanA), 2);
                varB += Math.pow((listB[i] - meanB), 2);
                covarAB += ((listB[i] - meanB) * (listA[i] - meanA));
            }
            var R1 = covarAB / Math.sqrt(varA * varB);
            var R11 = Math.round(10000000 * R1) / 10000000;
            //console.log("First Order Serial-Correlation: " + R11);
            model.firstO = R11;
            //******************
            var varA2 = 0;
            var varC = 0;
            var covarA2C = 0;
            for (i = 0; i < listA2.length; i++) {
                varA2 += Math.pow((listA2[i] - meanA2), 2);
                varC += Math.pow((listC[i] - meanC), 2);
                covarA2C += ((listA2[i] - meanA2) * (listC[i] - meanC));
            }
            var R2 = covarA2C / Math.sqrt(varA2 * varC);
            var R21 = Math.round(10000000 * R2) / 10000000;
            //console.log("Second Order Serial-Correlation: " + R21);
            model.secondO = R21;


            var ERR = residual[-1];
            var SUMABSERR = Math.abs(ERR);
            var SSE = residual[-1] * residual[-1];
            var DWNN = 0;
            var DWND = (residual[-1] * residual[-1]);
            var SUMERR = residual[-1];
            var DWN = 0; var MAE = 0;
            for (i = 1; i < this.n; i++) {
                ERR = residual[i - 1];
                SUMERR = SUMERR + ERR;
                SUMABSERR = SUMABSERR + Math.abs(ERR);
                DWNN = DWNN + (residual[i - 1] - residual[i - 2]) * (residual[i - 1] - residual[i - 2]);
                DWND = DWND + (residual[i - 1] * residual[i - 1]);
                SSE = SSE + ERR * ERR;
            }
            var MAE = SUMABSERR / this.n;
            var DW = DWNN / DWND;
            MAE = Math.round(MAE * 100000) / 100000;
            //console.log("Mean Absolute Error: " + MAE);
            model.meanAbsE = MAE;
            DW = Math.round(DW * 100000) / 100000;
            //console.log("Durbin Watson Statistic: " + DW);
            model.durbanWatson = DW;

            //NORMALITY
            var SUMF = 0;
            var FXX = 0;
            var FX = 0;
            var xvalN = new Array();
            var freq = new Array();


            for (i = 0; i < len; i++) {
                xvalN[i] = residual[i];
                freq[i] = 1
            }


            //calculate FX and FXX
            for (i2 = 0; i2 < xvalN.length; i2++) {
                SUMF += parseFloat(freq[i2]);
                FX += parseFloat(xvalN[i2]) * parseFloat(freq[i2]);
                FXX += parseFloat(freq[i2]) * (Math.pow(parseFloat(xvalN[i2]), 2));
            }
            //calculate Standard Deviation
            var SN2 = FXX - ((FX * FX) / SUMF);
            SN2 = SN2 / (SUMF);
            var stdN = Math.sqrt(SN2);
            var meanN = FX / SUMF;

            //Standardize the Data
            var zval = new Array();
            for (i3 = 0; i3 < xvalN.length; i3++) {
                zval[i3] = (xvalN[i3] - meanN) / stdN;
            }

            //sort the list Z(I)
            var zvalS = new Array();
            for (i = 0; i < zval.length; i++) {
                zvalS[i] = zval[i];
            }
            for (i = 0; i < zvalS.length - 1; i++) {
                for (j = i + 1; j < zvalS.length; j++) {
                    if (eval(zvalS[j]) < eval(zvalS[i])) {
                        temp = zvalS[i];
                        zvalS[i] = zvalS[j];
                        zvalS[j] = temp;
                    }
                }
            }
            //Corresponding Frequecies
            var freqS = new Array();
            for (i = 0; i < freq.length; i++) {
                freqS[i] = freq[i];
            }
            for (i = 0; i < zval.length; i++) {
                for (j = 0; j < zval.length; j++) {
                    if (zvalS[i] == zval[j]) {
                        freqS[i] = freq[j];
                    }
                }
            }
            //calculate F from here
            var fval = new Array();
            var F1 = 0;
            for (i6 = 0; i6 < zvalS.length; i6++) {
                F1 = Norm(zvalS[i6]);
                if (zvalS[i6] >= 0) {
                    fval[i6] = 1 - (F1) / 2;
                }
                else {
                    fval[i6] = F1 / 2;
                }
                F1 = 0;
            }

            //calculate J from here
            var jval = new Array();
            jval[0] = freqS[0] / SUMF;

            for (i7 = 1; i7 < zvalS.length; i7++) {
                jval[i7] = jval[i7 - 1] + (freqS[i7] / SUMF);
            }

            var DP = new Array();
            DP[0] = Math.abs(jval[0] - fval[0]);

            for (i = 1; i < this.n; i++) {
                A = Math.abs(jval[i] - fval[i]);
                B = Math.abs(fval[i] - jval[i - 1]);
                DP[i] = Math.max(A, B);
            }

            //sort the list DP(I)
            for (i = 0; i < DP.length - 1; i++) {
                for (j = i + 1; j < DP.length; j++) {
                    if (eval(DP[j]) < eval(DP[i])) {
                        temp = DP[i];
                        DP[i] = DP[j];
                        DP[j] = temp;
                    }
                }
            }
            var DPP = DP[DP.length - 1];
            var D = DPP;
            var td = D + "";   //forcing to be a string

            var A0 = Math.sqrt(SUMF);
            var C1 = A0 - 0.01 + (0.85 / A0);
            var D15 = 0.775 / C1;
            var D10 = 0.819 / C1;
            var D05 = 0.895 / C1;
            var D025 = 0.995 / C1;
            var t2N = D;


            //determine the conclusion
            if (t2N > D025) {
                //console.log("Evidence against normality");
                model.normalityCond = "Evidence against normality";
            }
            else if ((t2N <= D025) && (t2N > D05)) {
                //console.log("Sufficient evidence against normality");
                model.normalityCond = "Sufficient evidence against normality";
            }
            else if ((t2N <= D05) && (t2N > D10)) {
                //console.log("Suggestive evidence against normality");
                model.normalityCond = "Suggestive evidence against normality";
            }
            else if ((t2N <= D10) && (t2N > D15)) {
                //console.log("Little evidence against normality");
                model.normalityCond = "Little evidence against normality";
            }
            else if (t2N <= D15) {
                //console.log("No evidences against normality");
                model.normalityCond = "No evidences against normality";
            }
            else {
                //console.log("Evidence against normality");
                model.normalityCond = "Evidence against normality";
            }

        }

        console.log(model);
        return model;
    }

    /***** member variables *****/

    //Number of rows (datapoints)
    calc.n = 0;
    calc.maxN = 16;
    //Number of parameters (independent)
    calc.m = 0;
    calc.indep;
    calc.dep;
    calc.xBar;
    calc.SX = 0;
    calc.SY = 0;
    calc.SXX = 0;
    calc.SXY = 0;
    calc.SYY = 0;
    calc.m = 0;
    calc.regrCoeff = new Array;
    calc.sigDig = 3;
    // calc.B;
    // calc.P;
    // calc.invP;
    calc.y;

    return calc;
}

module.exports = new slidingRegression();
/*
function buildxy() {

    with (Math) {
        N = 0;
        var searching = true;

        //This is set to the number of independent because we have in our json
        var numvariables = Object.keys(json.independent).length;

        var independentKeys = Object.keys(json.independent);
        var dependentKeys = Object.keys(json.dependent);


        //Runs through as many rows as there are dates available
        for (var i = 0; i < json.date.Date.length; i++) {

            for (var j = 0; j < numvariables; j++) {
                var key = independentKeys[j];
                X[j + 1][N] = json["independent"][key][N];
            }

            Y[N] = json["dependent"][dependentKeys[0]][N];

            N++;

        }
    }
    this.m = numvariables;
}

function calc2() {

    var num = calc2.arguments[0];
    json = calc2.arguments[1];
    var model = {
        fittedModel: "",
        params: [],
        yValues: "",
        rSquare: "",
        fStatistic: "",
        pval: "",
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

    if (num == 1) {
    }
    else if (num == 2) {

    }
    else if (num == 3) {
    }
    else if (num == 4) {
    }
    else if (num == 5) {
        with (Math) {
            buildxy();
            // alert("here");
            linregr();

            var predicted = new Array;
            var residual = new Array;
            var output = "Y = " + this.roundSigDig(regrCoeff[0], sigDig);
            var SE = 0;
            var ST = 0;


            for (i = 1; i <= this.m; i++) {
                output += " + (" + this.roundSigDig(regrCoeff[i], sigDig) + ")f" + i;
                model.params[i - 1] = this.roundSigDig(regrCoeff[i], sigDig);
            }

            //console.log("The Fitted Model is :" + output);

            model.fittedModel = output;

            for (i = -1; i < N - 1; i++) {
                y = regrCoeff[0];


                for (j = 1; j <= this.m; j++) y += regrCoeff[j] * X[j][i + 1];

                //console.log("Predicted Y Value " + (i+2) + ": " + this.roundSigDig(y, sigDig));
                model.yValues[i + 2] = "Predicted Y Value " + (i + 2) + ": " + this.roundSigDig(y, sigDig);

                predicted[i] = this.roundSigDig(y, sigDig);

                residual[i] = (Y[i + 1] - predicted[i]);

                //console.log("ith Residual: " + "("+(i+2)+")"+ Math.round(residual[i]*Math.pow(10,4))/Math.pow(10,4)+"    ");

                model.iResidual[i + 1] = ("(" + (i + 2) + ") " + Math.round(residual[i] * Math.pow(10, 4)) / Math.pow(10, 4) + "\t\t");

                SE += residual[i];
                ST += Y[i + 1];

            }


            var MSE = 0;
            var MST = 0;

            MSE = SE / N;
            MST = ST / N;

            var SSE = 0;
            var SST = 0;


            for (i = 0; i < N; i++) {
                SSE += (residual[i - 1] - MSE) * (residual[i - 1] - MSE);

                SST += (Y[i] - MST) * (Y[i] - MST);

            }
            var FR;
            var RRSQ;

            RRSQ = 1 - (SSE / SST);

            FR = ((N - this.m - 1) * (SST - SSE)) / (this.m * SSE);
            //console.log("F-Statistic: " + FR);
            model.fStatistic = FR;
            //console.log("R-Square: " + RRSQ);
            model.rSquare = RRSQ;


        }

        //start analysis************************************************************


        var Pi = Math.PI; var PiD2 = Pi / 2; var PiD4 = Pi / 4; var Pi2 = 2 * Pi
        var e = 2.718281828459045235; var e10 = 1.105170918075647625
        var Deg = 180 / Pi

        function Norm(z) {
            z = Math.abs(z)
            var p = 1 + z * (0.04986735 + z * (0.02114101 + z * (0.00327763 + z * (0.0000380036 + z * (0.0000488906 + z * 0.000005383)))))
            p = p * p; p = p * p; p = p * p
            return 1 / (p * p)
        }

        function CalcNr(theForm) {
            console.log("NR: " + Fmt(ANorm(eval(document.theForm.pn.value))));
        }

        function ANorm(p) {
            var v = 0.5; var dv = 0.5; var z = 0
            while (dv > 1e-6) { z = 1 / v - 1; dv = dv / 2; if (Norm(z) > p) { v = v - dv } else { v = v + dv } }
            return z
        }

        function Fmt(x) {
            var v
            if (x >= 0) { v = '' + (x + 0.00005) } else { v = '' + (x - 0.00005) }
            return v.substring(0, v.indexOf('.') + 5)
        }
        function FishF(f, n1, n2) {
            var x = n2 / (n1 * f + n2)
            if ((n1 % 2) == 0) { return StatCom(1 - x, n2, n1 + n2 - 4, n2 - 2) * Math.pow(x, n2 / 2) }
            if ((n2 % 2) == 0) { return 1 - StatCom(x, n1, n1 + n2 - 4, n1 - 2) * Math.pow(1 - x, n1 / 2) }

            var th = Math.atan(Math.sqrt(n1 * f / n2)); var a = th / PiD2; var sth = Math.sin(th); var cth = Math.cos(th)
            if (n2 > 1) { a = a + sth * cth * StatCom(cth * cth, 2, n2 - 3, -1) / PiD2 }
            if (n1 == 1) { return 1 - a }
            var c = 4 * StatCom(sth * sth, n2 + 1, n1 + n2 - 4, n2 - 2) * sth * Math.pow(cth, n2) / Pi
            if (n2 == 1) { return 1 - a + c / 2 }
            var k = 2; while (k <= (n2 - 1) / 2) { c = c * k / (k - .5); k = k + 1 }
            return 1 - a + c
        }
        function StatCom(q, i, j, b) {
            var zz = 1; var z = zz; var k = i; while (k <= j) { zz = zz * q * k / (k - b); z = z + zz; k = k + 2 }
            return z
        }

        function AFishF(p, n1, n2) {
            var v = 0.5; var dv = 0.5; var f = 0
            while (dv > 1e-10) { f = 1 / v - 1; dv = dv / 2; if (FishF(f, n1, n2) > p) { v = v - dv } else { v = v + dv } }
            return f
        }

        var SUME = 0.0;
        var StdE = 0.0;
        for (i = 0; i < N - 1; i++) {
            SUME += residual[i - 1];
        }
        var len = N - 1;
        var mid = Math.floor(len / 2);
        var SUME1 = 0;
        var SUME2 = 0;
        var NE1 = 0;
        var NE2 = 0;
        for (i = 0; i < mid; i++) {
            SUME1 += residual[i - 1];
            NE1++;
        }
        for (i = mid; i < len; i++) {
            SUME2 += residual[i - 1];
            NE2++;
        }
        var mean1 = SUME1 / NE1;
        var mean2 = SUME2 / NE2;
        // Do the math
        var XE = SUME / len;
        var XE1 = Math.round(10000000 * XE) / 10000000;
        var mn1 = Math.round(10000000 * mean1) / 10000000;
        var mn2 = Math.round(10000000 * mean2) / 10000000;
        //console.log("Mean: " + XE1);
        model.mean = XE1;
        //console.log("Mean: First Half: " + mn1);
        model.mean_1 = mn1;
        //console.log("Mean: Second Half: " + mn2);
        model.mean_2 = mn2;

        //calculate Standard Deviation
        // Run through all the input, add those that have valid values
        for (i = 0; i < N - 1; i++) {
            StdE += Math.pow((residual[i - 1] - XE), 2);
        }
        var V1 = StdE / (len - 2);
        var Vari2 = Math.round(V1 * 10000000) / 10000000;
        //console.log("Variance : " + Vari2);
        model.variance = Vari2;
        //Standard deviation for both parts
        var StdE1 = 0;
        var StdE2 = 0;
        for (i = 0; i < mid; i++) {
            StdE1 += Math.pow(((residual[i - 1]) - mean1), 2);
        }
        for (i = mid; i < len; i++) {
            StdE2 += Math.pow(((residual[i - 1]) - mean2), 2);
        }
        var VR1 = StdE1 / (NE1 - 2);
        var var1 = Math.round(10000000 * VR1) / 10000000;
        //console.log("Variance: The First Half: " + var1);
        model.vari1 = var1;
        var VR2 = StdE2 / (NE2 - 2);
        var var2 = Math.round(10000000 * VR2) / 10000000;
        //console.log("Variance: The Second Half: " + var2);
        model.vari2 = var2;

        //AUTO CORRELATIONS
        var listA = new Array();
        var listB = new Array();
        var listC = new Array();
        var listA2 = new Array();
        var a1 = 0;
        var sumA = 0;
        for (i = 1; i < len; i++) {
            listA[a1] = parseFloat(residual[i - 1]);
            sumA += parseFloat(residual[i - 1]);
            a1++;
        }
        var a4 = 0;
        var sumA2 = 0;
        for (i = 2; i < len; i++) {
            listA2[a4] = parseFloat(residual[i - 1]);
            sumA2 += parseFloat(residual[i - 1]);
            a4++;
        }
        var a2 = 0;
        var sumB = 0;
        for (i = 0; i < len - 1; i++) {
            listB[a2] = parseFloat(residual[i - 1]);
            sumB += parseFloat(residual[i - 1]);
            a2++;
        }
        var a3 = 0;
        var sumC = 0;
        for (i = 0; i < len - 2; i++) {
            listC[a3] = parseFloat(residual[i - 1]);
            sumC += parseFloat(residual[i - 1]);
            a3++;
        }
        var meanA = sumA / a1;
        var meanA2 = sumA2 / a4;
        var meanB = sumB / a2;
        var meanC = sumC / a3;
        //calculate variance and co-variance
        var varA = 0;
        var varB = 0;
        var covarAB = 0;
        for (i = 0; i < listA.length; i++) {
            varA += Math.pow((listA[i] - meanA), 2);
            varB += Math.pow((listB[i] - meanB), 2);
            covarAB += ((listB[i] - meanB) * (listA[i] - meanA));
        }
        var R1 = covarAB / Math.sqrt(varA * varB);
        var R11 = Math.round(10000000 * R1) / 10000000;
        //console.log("First Order Serial-Correlation: " + R11);
        model.firstO = R11;
        //******************
        var varA2 = 0;
        var varC = 0;
        var covarA2C = 0;
        for (i = 0; i < listA2.length; i++) {
            varA2 += Math.pow((listA2[i] - meanA2), 2);
            varC += Math.pow((listC[i] - meanC), 2);
            covarA2C += ((listA2[i] - meanA2) * (listC[i] - meanC));
        }
        var R2 = covarA2C / Math.sqrt(varA2 * varC);
        var R21 = Math.round(10000000 * R2) / 10000000;
        //console.log("Second Order Serial-Correlation: " + R21);
        model.secondO = R21;


        var ERR = residual[-1];
        var SUMABSERR = Math.abs(ERR);
        var SSE = residual[-1] * residual[-1];
        var DWNN = 0;
        var DWND = (residual[-1] * residual[-1]);
        var SUMERR = residual[-1];
        var DWN = 0; var MAE = 0;
        for (i = 1; i < N; i++) {
            ERR = residual[i - 1];
            SUMERR = SUMERR + ERR;
            SUMABSERR = SUMABSERR + Math.abs(ERR);
            DWNN = DWNN + (residual[i - 1] - residual[i - 2]) * (residual[i - 1] - residual[i - 2]);
            DWND = DWND + (residual[i - 1] * residual[i - 1]);
            SSE = SSE + ERR * ERR;
        }
        var MAE = SUMABSERR / N;
        var DW = DWNN / DWND;
        MAE = Math.round(MAE * 100000) / 100000;
        //console.log("Mean Absolute Error: " + MAE);
        model.meanAbsE = MAE;
        DW = Math.round(DW * 100000) / 100000;
        //console.log("Durbin Watson Statistic: " + DW);
        model.durbanWatson = DW;

        //NORMALITY
        var SUMF = 0;
        var FXX = 0;
        var FX = 0;
        var xvalN = new Array();
        var freq = new Array();


        for (i = 0; i < len; i++) {
            xvalN[i] = residual[i];
            freq[i] = 1
        }


        //calculate FX and FXX
        for (i2 = 0; i2 < xvalN.length; i2++) {
            SUMF += parseFloat(freq[i2]);
            FX += parseFloat(xvalN[i2]) * parseFloat(freq[i2]);
            FXX += parseFloat(freq[i2]) * (Math.pow(parseFloat(xvalN[i2]), 2));
        }
        //calculate Standard Deviation
        var SN2 = FXX - ((FX * FX) / SUMF);
        SN2 = SN2 / (SUMF);
        var stdN = Math.sqrt(SN2);
        var meanN = FX / SUMF;

        //Standardize the Data
        var zval = new Array();
        for (i3 = 0; i3 < xvalN.length; i3++) {
            zval[i3] = (xvalN[i3] - meanN) / stdN;
        }

        //sort the list Z(I)
        var zvalS = new Array();
        for (i = 0; i < zval.length; i++) {
            zvalS[i] = zval[i];
        }
        for (i = 0; i < zvalS.length - 1; i++) {
            for (j = i + 1; j < zvalS.length; j++) {
                if (eval(zvalS[j]) < eval(zvalS[i])) {
                    temp = zvalS[i];
                    zvalS[i] = zvalS[j];
                    zvalS[j] = temp;
                }
            }
        }
        //Corresponding Frequecies
        var freqS = new Array();
        for (i = 0; i < freq.length; i++) {
            freqS[i] = freq[i];
        }
        for (i = 0; i < zval.length; i++) {
            for (j = 0; j < zval.length; j++) {
                if (zvalS[i] == zval[j]) {
                    freqS[i] = freq[j];
                }
            }
        }
        //calculate F from here
        var fval = new Array();
        var F1 = 0;
        for (i6 = 0; i6 < zvalS.length; i6++) {
            F1 = Norm(zvalS[i6]);
            if (zvalS[i6] >= 0) {
                fval[i6] = 1 - (F1) / 2;
            }
            else {
                fval[i6] = F1 / 2;
            }
            F1 = 0;
        }

        //calculate J from here
        var jval = new Array();
        jval[0] = freqS[0] / SUMF;

        for (i7 = 1; i7 < zvalS.length; i7++) {
            jval[i7] = jval[i7 - 1] + (freqS[i7] / SUMF);
        }

        var DP = new Array();
        DP[0] = Math.abs(jval[0] - fval[0]);

        for (i = 1; i < N; i++) {
            A = Math.abs(jval[i] - fval[i]);
            B = Math.abs(fval[i] - jval[i - 1]);
            DP[i] = Math.max(A, B);
        }

        //sort the list DP(I)
        for (i = 0; i < DP.length - 1; i++) {
            for (j = i + 1; j < DP.length; j++) {
                if (eval(DP[j]) < eval(DP[i])) {
                    temp = DP[i];
                    DP[i] = DP[j];
                    DP[j] = temp;
                }
            }
        }
        var DPP = DP[DP.length - 1];
        var D = DPP;
        var td = D + "";   //forcing to be a string

        var A0 = Math.sqrt(SUMF);
        var C1 = A0 - 0.01 + (0.85 / A0);
        var D15 = 0.775 / C1;
        var D10 = 0.819 / C1;
        var D05 = 0.895 / C1;
        var D025 = 0.995 / C1;
        var t2N = D;


        //determine the conclusion
        if (t2N > D025) {
            //console.log("Evidence against normality");
            model.normalityCond = "Evidence against normality";
        }
        else if ((t2N <= D025) && (t2N > D05)) {
            //console.log("Sufficient evidence against normality");
            model.normalityCond = "Sufficient evidence against normality";
        }
        else if ((t2N <= D05) && (t2N > D10)) {
            //console.log("Suggestive evidence against normality");
            model.normalityCond = "Suggestive evidence against normality";
        }
        else if ((t2N <= D10) && (t2N > D15)) {
            //console.log("Little evidence against normality");
            model.normalityCond = "Little evidence against normality";
        }
        else if (t2N <= D15) {
            //console.log("No evidences against normality");
            model.normalityCond = "No evidences against normality";
        }
        else {
            //console.log("Evidence against normality");
            model.normalityCond = "Evidence against normality";
        }

    }
    else if (num == 6) {
    }
    return model;
}
*/


