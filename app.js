const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');

const app = express();
const port = 5000;

// Add necessary CORS headers

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/data/energy', (req, res) => {
  const results = [];

  // Read in the CSV file, parse it using parser library
  fs.createReadStream('./data/HalfHourlyEnergyData.csv')
    .pipe(csvParser())
    .on('data', (data) => {
      // Convert each timestamp into epoch format
      data.Timestamp = Date.parse(data.Timestamp)
      results.push(data)
    })
    .on('end', () => {
      res.json(results);
    });
});
app.get('/api/data/energyAnomalies', (req, res) => {
  const results = [];

  // Read in the CSV file, parse it using parser library
  fs.createReadStream('./data/HalfHourlyEnergyDataAnomalies.csv')
    .pipe(csvParser())
    .on('data', (data) => {
      // Convert each timestamp into epoch format
      data.Timestamp = Date.parse(data.Timestamp)
      results.push(data)
    })
    .on('end', () => {
      res.json(results);
    });
});
app.get('/api/data/weather', (req, res) => {
  const results = [];

  // Read in the CSV file, parse it using parser library
  fs.createReadStream('./data/Weather.csv')
    .pipe(csvParser({
      // Fix headers because 'Date' was being read incorrectly
      headers: ['Date', 'AverageTemperature', 'AverageHumidity']
    }))
    .on('data', (data) => {
      // We have to reformat these timestamps so that we can convert them to epochs
      const [datePart, timePart] = data.Date.split(' ');
      const [day, month, year] = datePart.split('/');
      const outputDateString = `${month}/${day}/${year} ${timePart}`;
      data.Date = Date.parse(outputDateString)
      results.push(data)
    })
    .on('end', () => {
      res.json(results);
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});