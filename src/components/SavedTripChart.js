import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import _ from 'lodash';
import {Line} from 'react-chartjs-2';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    times: PropTypes.string,
    predictedRideTimes: PropTypes.string,
    expectedRideTimes: PropTypes.string
  },

  render() {
    if (!this.props.times || this.props.times === 'null') {
      return false;
    }

    const timesArray = this.props.times ? this.props.times.split(',') : [];
    const expectedRideTimesArray = this.props.expectedRideTimes ? this.props.expectedRideTimes.split(',') : [];

    let predictedRideTimesBorderColor = this.context.muiTheme.palette.textColor;
    const predictedRideTimesArray = this.props.predictedRideTimes ? this.props.predictedRideTimes.split(',') : [];

    if (this.props.predictedRideTimes) {
      const lastPointBorderColor = predictedRideTimesBorderColor;
      predictedRideTimesBorderColor = _.fill(new Array(predictedRideTimesArray.length), "rgba(0, 0, 0, 0)");
      predictedRideTimesBorderColor[predictedRideTimesArray.length - 1] = lastPointBorderColor;
    }

    return (
      <Line
        data={{
          labels: timesArray,
          datasets: [{
            label: "predicted",
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: this.context.muiTheme.palette.textColor,
            pointBorderColor: predictedRideTimesBorderColor,
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            data: _.map(predictedRideTimesArray, (n) => {
              if (n === '-1') {
                // no data for this time
                return null;
              } else {
                return parseFloat(n);
              }
            })
          }, {
            label: "expected",
            backgroundColor: this.context.muiTheme.palette.borderColor,
            borderColor: "rgba(0, 0, 0, 0)",
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            data: _.map(expectedRideTimesArray, (n) => {
              if (n === '-1') {
                // no data for this time
                return null;
              } else {
                return parseFloat(n);
              }
            })
          }]
        }}
        options={{
          datasetFill: false,
          title: {
            display: true,
            text: "ride duration over the past hour",
            fontColor: this.context.muiTheme.palette.secondaryTextColor,
            fontStyle: 'normal',
            fontSize: 12,
            padding: 8
          },
          legend: {
            display: true,
            position: 'bottom',
            reverse: false,
            labels: {
              fontColor: this.context.muiTheme.palette.secondaryTextColor,
              fontSize: 10,
              usePointStyle: true
            }
          },
          tooltips: {
            enabled: false
          },
          events: [],
          scales: {
            xAxes: [{
              ticks: {
                fontColor: this.context.muiTheme.palette.secondaryTextColor,
                fontSize: 10,
                autoSkipPadding: 10
              },
              afterFit: (scale) => {
                scale.height = 40;
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                fontColor: this.context.muiTheme.palette.secondaryTextColor,
                labelString: "mins"
              },
              ticks: {
                fontColor: this.context.muiTheme.palette.secondaryTextColor,
                maxTicksLimit: 3,
                stepSize: 1,
                beginAtZero: false
              }
            }]
          }
        }}
      />
    );
  }
});
