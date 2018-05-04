# Sliding-Regression-Tool

**Summary**

This is a application used to preform linear regression based math on excel files of energy data to find rSquare values, savings percentages, fitted models, and p values (still in the works). Data is shown through two different ways, the first being a heatmap based on rSquare values, and the second being a graph of both rSquare and savings percentage.

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/ORNL-AMO/Sliding-Regression-Tool.git
# Go into the repository
cd Sliding-Regression-Tool
# Install dependencies
npm install
# Run the app
npm start
```

Once the program is started drag and drop a simple one page .xlsx. The .xlsx must have its far left column as the date column, with the following columns being data columns for dependent and independent variables with no particular order.

## License

[MIT](LICENSE.md)
