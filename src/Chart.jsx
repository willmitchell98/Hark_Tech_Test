import React, {useEffect, useState} from "react";
import axios from "axios";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

export default function Chart() {

  // Set up initial chartOptions, with empty series data objects

  const [chartOptions, setChartOptions] = useState({
      type: 'Line',
      title: {
        text: 'Energy Consumption vs Temperature'
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: 'Date'
        }
      },
      series: [
        {
          name: 'Energy Consumption',
          data: [],
        },
        {
          name: 'Temperature',
          data: [],
        }
      ],
      tooltip: {
        shared: true,
        pointFormatter: function () {
        // Add Anomaly warning to tooltip if point is an anomaly
        if (this.options.anomaly) {
          return `<span style="color: red"><b>Anomaly detected!</b></span><br><span style="color: ${this.color}">${this.series.name}: <b>${this.y}</b></span><br>`;
        }
        return `<span style="color: ${this.color}">${this.series.name}: <b>${this.y}</b></span><br>`;
      },
      },
      chart: {
        zoomType: 'x',
      }
    })

  useEffect(() => {
    // Typically this would be a custom hook, such as useGetEnergyData
    // which would query the API, perform the relevant transformation on
    // the data, and return what we want.
    const fetchData = async () => {
      try {
        const energyResponse = await axios.get("http://localhost:5000/api/data/energy");
        const anomaliesResponse = await axios.get("http://localhost:5000/api/data/energyAnomalies");
        const weatherResponse = await axios.get("http://localhost:5000/api/data/weather");

        // Map the data into highcharts preferred format, initially all point are not anomalies
        const energyData = energyResponse.data.map(item => ({
          x: item.Timestamp,
          y: parseFloat(item.Consumption),
          anomaly: false,
        }));

        // Go through the anomaly array and update the energy array to set any anomalies
        anomaliesResponse.data.forEach(anomalyPoint => {
          const matchingEnergyPoint = energyData.find(energyPoint => energyPoint.x === anomalyPoint.Timestamp);
          if (matchingEnergyPoint) {
            matchingEnergyPoint.anomaly = true; // Mark anomaly as true when timestamps align
            matchingEnergyPoint.marker = {
              enabled: true,
              fillColor: 'red',
            };
          }
        });

        // Map weather data into highcharts format
        const seriesData = weatherResponse.data.map(item => ({
          x: item.Date,
          y: parseFloat(item.AverageTemperature)
        }));

        // Update chartOptions to include our new data
        setChartOptions(prevOptions => ({
          ...prevOptions,
          series: [
            { ...prevOptions.series[0], data: energyData },
            { ...prevOptions.series[1], data: seriesData }
          ]
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [])

return (
  <div style={{marginTop: '5%', width: '90%'}}>
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
    />
  </div>
  )
}
