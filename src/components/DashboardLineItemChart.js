import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import _ from 'lodash';
import {Line} from 'react-chartjs-2';
import moment from 'moment';

import PredictionsStore from '../stores/PredictionsStore';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    lineCode: PropTypes.string.isRequired,
  },

  getStoreState() {
    const { lineCode } = this.props;

    const recentTrainFrequencyDataLabels = (
      PredictionsStore.get('data') ?
        PredictionsStore.get('data').get('recentTrainFrequencyData') ?
          PredictionsStore.get('data').get('recentTrainFrequencyData').get('times')
          : null
        : null
    );
    const recentAverageTrainFrequencyData = (
      PredictionsStore.get('data') ?
        PredictionsStore.get('data').get('recentTrainFrequencyData') ?
          PredictionsStore.get('data').get('recentTrainFrequencyData').get(`${lineCode.toLowerCase()}AverageTrainFrequencies`)
          : null
        : null
    );
    const recentExpectedTrainFrequencyData = (
      PredictionsStore.get('data') ?
        PredictionsStore.get('data').get('recentTrainFrequencyData') ?
          PredictionsStore.get('data').get('recentTrainFrequencyData').get(`${lineCode.toLowerCase()}ExpectedTrainFrequencies`)
          : null
        : null
    );

    return {
      recentTrainFrequencyDataLabels,
      recentAverageTrainFrequencyData,
      recentExpectedTrainFrequencyData
    };
  },

  render() {
    if (!this.state.recentTrainFrequencyDataLabels || this.state.recentTrainFrequencyDataLabels === 'null') {
      return false;
    }

    let backgroundColor = "rgba(0, 0, 0, 0.2)";
    let borderColor = "rgba(0, 0, 0, 1)";
    let pointBorderColor = "rgba(0, 0, 0, 0)";
    if (this.props.lineCode === 'RD') {
      backgroundColor = "rgba(229, 22, 54, 0.2)";
      borderColor = "rgba(229, 22, 54, 1)";
      pointBorderColor = "rgba(229, 22, 54, 1)";
    } else if (this.props.lineCode === 'OR') {
      backgroundColor = "rgba(246, 135, 18, 0.2)";
      borderColor = "rgba(246, 135, 18, 1)";
      pointBorderColor = "rgba(246, 135, 18, 1)";
    } else if (this.props.lineCode === 'SV') {
      backgroundColor = "rgba(157, 159, 156, 0.2)";
      borderColor = "rgba(157, 159, 156, 1)";
      pointBorderColor = "rgba(157, 159, 156, 1)";
    } else if (this.props.lineCode === 'BL') {
      backgroundColor = "rgba(21, 116, 196, 0.2)";
      borderColor = "rgba(21, 116, 196, 1)";
      pointBorderColor = "rgba(21, 116, 196, 1)";
    } else if (this.props.lineCode === 'YL') {
      backgroundColor = "rgba(252, 208, 6, 0.2)";
      borderColor = "rgba(252, 208, 6, 1)";
      pointBorderColor = "rgba(252, 208, 6, 1)";
    } else if (this.props.lineCode === 'GR') {
      backgroundColor = "rgba(15, 171, 75, 0.2)";
      borderColor = "rgba(15, 171, 75, 1)";
      pointBorderColor = "rgba(15, 171, 75, 1)";
    }

    const recentTrainFrequencyDataLabels = this.state.recentTrainFrequencyDataLabels ? this.state.recentTrainFrequencyDataLabels.split(',') : [];

    const recentAverageTrainFrequenciesArray = this.state.recentAverageTrainFrequencyData ? this.state.recentAverageTrainFrequencyData.split(',') : [];
    if (this.state.recentAverageTrainFrequencyData) {
      const lastPointBorderColor = pointBorderColor;
      pointBorderColor = _.fill(new Array(recentAverageTrainFrequenciesArray.length), 'rgba(0, 0, 0, 0)');
      pointBorderColor[recentAverageTrainFrequenciesArray.length - 1] = lastPointBorderColor;
    }

    const recentExpectedTrainFrequenciesArray = this.state.recentExpectedTrainFrequencyData ? this.state.recentExpectedTrainFrequencyData.split(',') : [];

    return (
      <Line
        data={{
          labels: recentTrainFrequencyDataLabels,
          datasets: [{
            label: "observed",
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: borderColor,
            pointBorderColor: pointBorderColor,
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            data: _.map(recentAverageTrainFrequenciesArray, (n) => {
              if (n === '-1') {
                // no data for this time
                return null;
              } else {
                return parseFloat(n);
              }
            })
          }, {
            label: "expected",
            backgroundColor: backgroundColor,
            borderColor: "rgba(0, 0, 0, 0)",
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            data: _.map(recentExpectedTrainFrequenciesArray, (n) => {
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
            text: "avg time btwn trains over the past hour",
            fontColor: this.context.muiTheme.palette.secondaryTextColor,
            fontStyle: 'normal',
            fontSize: 11,
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
                labelString: 'mins'
              },
              ticks: {
                fontColor: this.context.muiTheme.palette.secondaryTextColor,
                maxTicksLimit: 3,
                stepSize: 1,
                beginAtZero: true
              }
            }]
          }
        }}
        width={258}
        height={130}
      />
    );
  }
});
