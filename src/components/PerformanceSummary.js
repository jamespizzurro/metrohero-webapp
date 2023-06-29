import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import _ from 'lodash';
import moment from 'moment';
import {Line, Bar} from 'react-chartjs-2';
import queryString from 'query-string';
import addressbar from 'addressbar';
const Papa = require('papaparse');
import { withRouter } from "react-router-dom";

import AppStore from '../stores/AppStore';
import PerformanceSummaryActions from '../actions/PerformanceSummaryActions';
import PerformanceSummaryStore from '../stores/PerformanceSummaryStore';

import {Card, CardTitle, CardHeader, CardText} from 'material-ui/Card';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import UltimatePaginationMaterialUi from 'react-ultimate-pagination-material-ui';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import Divider from 'material-ui/Divider';
import MDSpinner from "react-md-spinner";
import RaisedButton from 'material-ui/RaisedButton';
import FileFileDownload from 'material-ui/svg-icons/file/file-download';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import Utilities from "../utilities/Utilities";

export default withRouter(createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PerformanceSummaryStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isMobileDevice: AppStore.get('isMobileDevice'),
      isLoading: PerformanceSummaryStore.get('isLoading'),
      data: PerformanceSummaryStore.get('data'),
      lastUpdated: PerformanceSummaryStore.get('lastUpdated'),
      filteredData: PerformanceSummaryStore.get('filteredData'),
      selectedStartDate: PerformanceSummaryStore.get('selectedStartDate'),
      selectedEndDate: PerformanceSummaryStore.get('selectedEndDate'),
      selectedServicePeriod: PerformanceSummaryStore.get('selectedServicePeriod'),
      selectedLineCodes: PerformanceSummaryStore.get('selectedLineCodes'),
      pageSize: PerformanceSummaryStore.get('pageSize'),
      currentPage: PerformanceSummaryStore.get('currentPage'),
      totalNumPages: PerformanceSummaryStore.get('totalNumPages'),
      byTimeOfDay: PerformanceSummaryStore.get('byTimeOfDay'),
      minDate: PerformanceSummaryStore.get('minDate'),
      maxDate: PerformanceSummaryStore.get('maxDate')
    };
  },

  UNSAFE_componentWillMount() {
    const params = queryString.parse(this.props.history.location.search);
    if (params && !_.isEmpty(params)) {
      const newState = {};

      const byTimeOfDay = params.byTimeOfDay;
      if (byTimeOfDay) {
        newState.byTimeOfDay = (byTimeOfDay.toLowerCase() === 'true');
      }

      const startDate = params.startDate;
      if (startDate) {
        newState.selectedStartDate = startDate;
      }

      const endDate = params.endDate;
      if (endDate) {
        newState.selectedEndDate = endDate;
      }

      const servicePeriods = params.servicePeriods;
      if (servicePeriods) {
        newState.selectedServicePeriod = servicePeriods.split(',');
      }

      const lineCodes = params.lineCodes;
      if (lineCodes) {
        newState.selectedLineCodes = lineCodes.split(',');
      }

      PerformanceSummaryActions.setState(newState, PerformanceSummaryActions.get);
    } else {
      PerformanceSummaryActions.get();
    }
  },

  componentDidUpdate(prevProps, prevState) {
    addressbar.value = this._getUrl();
  },

  componentWillUnmount() {
    PerformanceSummaryActions.reset();
  },

  _buildLineDot(lineCode) {
    const lineDotStyle = {
      height: 24,
      width: 24,
      margin: 2,
      marginRight: 8,
      textAlign: 'center',
      display: 'inline-block',
      color: '#ffffff',
      paddingTop: 5,
      fontSize: 13,
      verticalAlign: 'middle',
      lineHeight: 1
    };

    if (lineCode === 'RD') {
      lineDotStyle.backgroundColor = "#E51636"
    } else if (lineCode === 'OR') {
      lineDotStyle.backgroundColor = "#F68712"
    } else if (lineCode === 'SV') {
      lineDotStyle.backgroundColor = "#9D9F9C"
    } else if (lineCode === 'BL') {
      lineDotStyle.backgroundColor = "#1574C4"
    } else if (lineCode === 'YL') {
      lineDotStyle.backgroundColor = "#FCD006"
    } else if (lineCode === 'GR') {
      lineDotStyle.backgroundColor = "#0FAB4B"
    }

    return (
      <Paper
        key={lineCode}
        circle={true}
        zDepth={1}
        style={lineDotStyle}
      >
        {lineCode}
      </Paper>
    )
  },

  _lineCodeToName(lineCode) {
    let lineName;

    if (lineCode === "RD") {
      lineName = "Red";
    } else if (lineCode === "OR") {
      lineName = "Orange";
    } else if (lineCode === "SV") {
      lineName = "Silver";
    } else if (lineCode === "BL") {
      lineName = "Blue";
    } else if (lineCode === "YL") {
      lineName = "Yellow";
    } else if (lineCode === "GR") {
      lineName = "Green";
    } else {
      lineName = lineCode;
    }

    return lineName;
  },

  _getLineColors(lineCode) {
    let backgroundColor = this.context.muiTheme.palette.borderColor;
    let borderColor = this.context.muiTheme.palette.textColor;
    let pointBorderColor = this.context.muiTheme.palette.textColor;

    if (lineCode === 'RD') {
      backgroundColor = "rgba(229, 22, 54, 0.2)";
      borderColor = "rgba(229, 22, 54, 1)";
      pointBorderColor = "rgba(229, 22, 54, 1)";
    } else if (lineCode === 'OR') {
      backgroundColor = "rgba(246, 135, 18, 0.2)";
      borderColor = "rgba(246, 135, 18, 1)";
      pointBorderColor = "rgba(246, 135, 18, 1)";
    } else if (lineCode === 'SV') {
      backgroundColor = "rgba(157, 159, 156, 0.2)";
      borderColor = "rgba(157, 159, 156, 1)";
      pointBorderColor = "rgba(157, 159, 156, 1)";
    } else if (lineCode === 'BL') {
      backgroundColor = "rgba(21, 116, 196, 0.2)";
      borderColor = "rgba(21, 116, 196, 1)";
      pointBorderColor = "rgba(21, 116, 196, 1)";
    } else if (lineCode === 'YL') {
      backgroundColor = "rgba(252, 208, 6, 0.2)";
      borderColor = "rgba(252, 208, 6, 1)";
      pointBorderColor = "rgba(252, 208, 6, 1)";
    } else if (lineCode === 'GR') {
      backgroundColor = "rgba(15, 171, 75, 0.2)";
      borderColor = "rgba(15, 171, 75, 1)";
      pointBorderColor = "rgba(15, 171, 75, 1)";
    }

    return {
      backgroundColor,
      borderColor,
      pointBorderColor
    };
  },

  _getSelectedLineColors() {
    let backgroundColor = this.context.muiTheme.palette.borderColor;
    let borderColor = this.context.muiTheme.palette.textColor;
    let pointBorderColor = this.context.muiTheme.palette.textColor;

    if (!this.state.selectedLineCodes || this.state.selectedLineCodes.size !== 1) {
      return {
        backgroundColor,
        borderColor,
        pointBorderColor
      };
    }

    return this._getLineColors(this.state.selectedLineCodes.get(0));
  },

  _buildMetricCard(title, subtitle, observedValue, expectedValue, yAxisLabel, unitText, isHigherBetter, chartLabelsArray, chartObservedValues, chartExpectedValuesArray, disclaimerSpan, shouldUseBarGraph, chartMinimumValues, chartMaximumValues) {
    const hasExpectedValue = (expectedValue && expectedValue !== 'N/A');
    let didMeetOrExceedGoal;

    let expected;
    if (hasExpectedValue) {
      const percentDifference = _.round((unitText !== "%") ? (((observedValue - expectedValue) / expectedValue) * 100) : (observedValue - expectedValue));

      if (isHigherBetter) {
        didMeetOrExceedGoal = (percentDifference >= 0);
      } else {
        didMeetOrExceedGoal = (percentDifference <= 0);
      }

      expected = (
        <div>
          {(percentDifference === 0) ? 'on target' : `${Math.abs(percentDifference)}% ${didMeetOrExceedGoal ? 'better' : 'worse'} than expected`}
        </div>
      );
    }

    let disclaimer;
    if (disclaimerSpan) {
      disclaimer = (
        <CardText
          style={{fontSize: 12}}
        >
          {disclaimerSpan}
        </CardText>
      );
    }

    let chart;
    if (chartLabelsArray && chartLabelsArray.length > 1) {
      const lineColors = this._getSelectedLineColors();

      const datasets = [];
      if (Array.isArray(chartObservedValues)) {
        datasets.push({
          label: (chartMinimumValues || chartMaximumValues) ? "median" : "calculated",
          backgroundColor: "rgba(0, 0, 0, 0)",
          borderColor: lineColors.borderColor,
          pointBorderColor: "rgba(0, 0, 0, 0)",
          pointBackgroundColor: "rgba(0, 0, 0, 0)",
          data: chartObservedValues,
          fill: false
        });
      } else {
        // if chartObservedValues, assume it's an object, where each key is a label and each value is an array of values for that label
        Object.keys(chartObservedValues).forEach((lineCode) => {
          const chartObservedValuesArray = chartObservedValues[lineCode];
          if (this.state.selectedLineCodes && this.state.selectedLineCodes.includes(lineCode)) {
            const specificLineColors = this._getLineColors(lineCode);
            datasets.push({
              label: lineCode,
              backgroundColor: specificLineColors.borderColor,
              borderColor: specificLineColors.borderColor,
              pointBorderColor: "rgba(0, 0, 0, 0)",
              pointBackgroundColor: "rgba(0, 0, 0, 0)",
              data: chartObservedValuesArray,
              fill: false
            });
          }
        });
      }

      const data = {
        labels: chartLabelsArray,
        datasets: datasets
      };

      const options = {
        maintainAspectRatio: false,
          datasetFill: false,
          layout: {
          padding: {
            right: 20 // for overflowing x-axis labels
          }
        },
        title: {
          display: false
        },
        tooltips: {
          enabled: !this.state.isMobileDevice,
          mode: 'index',
          intersect: false,
          position: 'nearest',
          displayColors: false
        },
        legend: {
          display: !shouldUseBarGraph,
            position: 'bottom',
            labels: {
            fontColor: this.context.muiTheme.palette.secondaryTextColor,
              fontSize: 10,
              usePointStyle: true,
              padding: 20
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: this.context.muiTheme.palette.secondaryTextColor,
              fontSize: 10,
              autoSkipPadding: 12
            },
            afterFit: (scale) => {
              if (!shouldUseBarGraph) {
                scale.height = 50;
              }
            }
          }],
            yAxes: [{
            scaleLabel: {
              display: true,
              fontColor: this.context.muiTheme.palette.secondaryTextColor,
              labelString: yAxisLabel || '',
            },
            ticks: {
              fontColor: this.context.muiTheme.palette.secondaryTextColor,
              beginAtZero: true
            }
          }]
        }
      };

      if (shouldUseBarGraph) {
        options.tooltips.yAlign = 'no-transform';
        options.tooltips.displayColors = true;
        options.tooltips.itemSort = (a, b, data) => b.datasetIndex - a.datasetIndex;
        options.scales.xAxes[0].stacked = true;
        options.scales.yAxes[0].stacked = true;
        options.scales.yAxes[0].ticks.callback = (value, index, values) => {
          if (Math.floor(value) === value) {
            return value;
          }
        };

        chart = (
          <Bar
            data={data}
            options={options}
            width={200}
            height={220}
          />
        );
      } else {
        if (chartExpectedValuesArray) {
          data.datasets.push({
            label: "expected",
            backgroundColor: lineColors.backgroundColor,
            borderColor: "rgba(0, 0, 0, 0)",
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            data: chartExpectedValuesArray
          });
        }

        if (chartMinimumValues) {
          data.datasets.push({
            label: "minimum",
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: lineColors.backgroundColor,
            borderDash: [5],
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            data: chartMinimumValues
          });
        }

        if (chartMaximumValues) {
          data.datasets.push({
            label: "maximum",
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderColor: lineColors.backgroundColor,
            borderDash: [5],
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointBackgroundColor: "rgba(0, 0, 0, 0)",
            data: chartMaximumValues
          });
        }

        chart = (
          <Line
            data={data}
            options={options}
            width={200}
            height={220}
          />
        );
      }
    }

    const servicePeriods = this.state.selectedServicePeriod.join(" and ");
    const selectedLineCodes = `${this.state.selectedLineCodes.map(this._lineCodeToName).join(', ').replace(/,(?=[^,]*$)/, (this.state.selectedLineCodes.size > 2) ? ", and " : " and ")} ${(this.state.selectedLineCodes.size > 1) ? "lines" : "line"}`;
    const selectedStartDate = moment(this.state.selectedStartDate, 'M/D/YY').format("M/D/YY");
    const selectedEndDate = moment(this.state.selectedEndDate, 'M/D/YY').format("M/D/YY");
    const additionalSubTitleText = ` during ${servicePeriods} on the ${selectedLineCodes} ${(selectedStartDate === selectedEndDate) ? `on ${selectedStartDate}` : `from ${selectedStartDate} to ${selectedEndDate}`}`;

    const observedValueClassName = hasExpectedValue ? (didMeetOrExceedGoal ? 'better-than-expected' : 'worse-than-expected') : '';
    return (
      <Card
        className="metric-card"
      >
        <CardHeader
          title={title}
          subtitle={subtitle + additionalSubTitleText}
          style={{minHeight: 100}}
        />
        <CardText>
          <span className={observedValueClassName} style={{fontSize: 42}}>{observedValue}</span>{expectedValue ? ` / ${expectedValue}` : ''} {unitText ? unitText : ''}*
          {expected}
        </CardText>
        <div
          style={{
            marginLeft: 16,
            marginRight: 16
          }}
        >
          {chart}
        </div>
        {disclaimer}
      </Card>
    );
  },

  _downloadCsv() {
    const csvString = Papa.unparse(this.state.filteredData.toJS());
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString));
    element.setAttribute('download', 'performance.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  _buildTableRows(rows) {
    const tableRows = [];

    rows.forEach((row) => {
      const date = row.get('date');
      const timeOfDay = row.get('timeOfDay');
      const line = this._buildLineDot(row.get('lineCode'));
      const averageCalculatedHeadwayAdherence = (row.get('averageCalculatedHeadwayAdherence') != null) ? _.round(row.get('averageCalculatedHeadwayAdherence')) + "%" : "";
      const averageCalculatedScheduleAdherence = (row.get('averageCalculatedScheduleAdherence') != null) ? _.round(row.get('averageCalculatedScheduleAdherence')) + "%" : "";
      const averageObservedTrainFrequency = (row.get('averageObservedTrainFrequency') != null) ? _.round(row.get('averageObservedTrainFrequency'), 2) : "";
      const averageCalculatedPlatformWaitTime = (row.get('averageCalculatedPlatformWaitTime') != null) ? _.round(row.get('averageCalculatedPlatformWaitTime'), 2) : "";
      const averageObservedTrains = (row.get('averageObservedTrains') != null) ? _.round(row.get('averageObservedTrains'), 2) : "";
      const averageObservedEightCarTrains = (row.get('averageObservedEightCarTrains') != null) ? _.round(row.get('averageObservedEightCarTrains'), 2) : "";
      const averageObservedTrainCars = (row.get('averageObservedTrainCars') != null) ? _.round(row.get('averageObservedTrainCars'), 2) : "";

      tableRows.push(
        <TableRow
          key={date + timeOfDay + row.get('lineCode')}
        >
          <TableRowColumn>{date}</TableRowColumn>
          <TableRowColumn>{timeOfDay}</TableRowColumn>
          <TableRowColumn>{line}</TableRowColumn>
          <TableRowColumn>{averageCalculatedHeadwayAdherence}</TableRowColumn>
          <TableRowColumn>{averageCalculatedScheduleAdherence}</TableRowColumn>
          <TableRowColumn>{averageObservedTrainFrequency}</TableRowColumn>
          <TableRowColumn>{averageCalculatedPlatformWaitTime}</TableRowColumn>
          <TableRowColumn>{averageObservedTrains}</TableRowColumn>
          <TableRowColumn>{averageObservedEightCarTrains}</TableRowColumn>
          <TableRowColumn>{averageObservedTrainCars}</TableRowColumn>
        </TableRow>
      );
    });

    return tableRows;
  },

  _getUrl() {
    const params = {};

    const byTimeOfDay = this.state.byTimeOfDay;
    if (byTimeOfDay != null) {
      params.byTimeOfDay = (!!byTimeOfDay ? 'true' : 'false');
    }

    const selectedStartDate = this.state.selectedStartDate;
    if (selectedStartDate) {
      params.startDate = selectedStartDate;
    }

    const selectedEndDate = this.state.selectedEndDate;
    if (selectedEndDate) {
      params.endDate = selectedEndDate;
    }

    const selectedServicePeriods = this.state.selectedServicePeriod;
    if (selectedServicePeriods) {
      params.servicePeriods = selectedServicePeriods.join(',');
    }

    const selectedLineCodes = this.state.selectedLineCodes;
    if (selectedLineCodes) {
      params.lineCodes = selectedLineCodes.join(',');
    }

    return location.origin + this.props.history.location.pathname + "?" + queryString.stringify(params);
  },

  render() {
    const title = (
      <div>
        <CardTitle
          title="Performance Summary"
          subtitle="How is Metrorail performing? Let's find out…"
        />
        <Divider />
      </div>
    );

    if (!this.state.filteredData) {
      return (
        <div
          className="PerformanceSummary vertical-scrolling"
        >
          {title}
          <div
            style={{
              width: '100%',
              margin: '24px 0 auto',
              textAlign: 'center'
            }}
          >
            <MDSpinner
              size={64}
              singleColor={this.context.muiTheme.palette.accent1Color}
            />
          </div>
        </div>
      );
    }

    let labelsArray = [];
    let averageCalculatedHeadwayAdherencesArray = [];
    let averageCalculatedScheduleAdherencesArray = [];
    let averageObservedTrainFrequenciesArray = [];
    let averageExpectedTrainFrequenciesArray = [];
    let standardDeviationObservedTrainFrequenciesArray = [];
    let standardDeviationExpectedTrainFrequenciesArray = [];
    let averageCalculatedPlatformWaitTimesArray = [];
    let averageExpectedPlatformWaitTimesArray = [];
    let averageObservedTrainsArray = [];
    let averageExpectedTrainsArray = [];
    let averageObservedEightCarTrainsArray = [];
    let averageExpectedEightCarTrainsArray = [];
    let averageObservedTrainCarsArray = [];
    let averageExpectedTrainCarsArray = [];
    let maximumObservedDelayedTrainsArray = [];
    let medianObservedTrainDelaysArray = [];
    let minimumObservedTrainDelaysArray = [];
    let maximumObservedTrainDelaysArray = [];

    let observedNumRedLineOffloadsArray = [];
    let observedNumOrangeLineOffloadsArray = [];
    let observedNumSilverLineOffloadsArray = [];
    let observedNumBlueLineOffloadsArray = [];
    let observedNumYellowLineOffloadsArray = [];
    let observedNumGreenLineOffloadsArray = [];
    let expectedNumOffloadsArray = [];

    let observedNumRedLineIncidentsArray = [];
    let observedNumOrangeLineIncidentsArray = [];
    let observedNumSilverLineIncidentsArray = [];
    let observedNumBlueLineIncidentsArray = [];
    let observedNumYellowLineIncidentsArray = [];
    let observedNumGreenLineIncidentsArray = [];
    let expectedNumIncidentsArray = [];

    let numRedLineNegativeTrainTagsArray = [];
    let numOrangeLineNegativeTrainTagsArray = [];
    let numSilverLineNegativeTrainTagsArray = [];
    let numBlueLineNegativeTrainTagsArray = [];
    let numYellowLineNegativeTrainTagsArray = [];
    let numGreenLineNegativeTrainTagsArray = [];
    let expectedNumNegativeTrainTagsArray = [];

    const groupedFilteredData = this.state.filteredData.groupBy(row => `${row.get('date')}_(${row.get('timeOfDay')})`);
    groupedFilteredData.forEach((group, groupKey) => {
      labelsArray.push(groupKey.split('_'));

      let averageCalculatedHeadwayAdherenceSum = 0;
      let averageCalculatedScheduleAdherenceSum = 0;
      let averageObservedTrainFrequencySum = 0;
      let averageExpectedTrainFrequencySum = 0;
      let standardDeviationObservedTrainFrequencySum = 0;
      let standardDeviationExpectedTrainFrequencySum = 0;
      let averageCalculatedPlatformWaitTimeSum = 0;
      let averageExpectedPlatformWaitTimeSum = 0;
      let averageObservedTrainsSum = 0;
      let averageExpectedTrainsSum = 0;
      let averageObservedEightCarTrainsSum = 0;
      let averageExpectedEightCarTrainsSum = 0;
      let averageObservedTrainCarsSum = 0;
      let averageExpectedTrainCarsSum = 0;
      let maximumObservedDelayedTrainsSum = 0;
      let medianObservedTrainDelaysRawArray = [];
      let minimumObservedTrainDelays = null;
      let maximumObservedTrainDelays = null;

      let numAverageCalculatedHeadwayAdherenceSamples = 0;
      let numAverageCalculatedScheduleAdherenceSamples = 0;
      let numAverageObservedTrainFrequencySamples = 0;
      let numAverageExpectedTrainFrequencySamples = 0;
      let numStandardDeviationObservedTrainFrequencySamples = 0;
      let numStandardDeviationExpectedTrainFrequencySamples = 0;
      let numAverageCalculatedPlatformWaitTimeSamples = 0;
      let numAverageExpectedPlatformWaitTimeSamples = 0;
      let numAverageObservedTrainsSamples = 0;
      let numAverageExpectedTrainsSamples = 0;
      let numAverageObservedEightCarTrainsSamples = 0;
      let numAverageExpectedEightCarTrainsSamples = 0;
      let numAverageObservedTrainCarsSamples = 0;
      let numAverageExpectedTrainCarsSamples = 0;
      let numMaximumObservedDelayedTrainsSamples = 0;

      let numObservedRedLineOffloadsSum = 0;
      let numObservedOrangeLineOffloadsSum = 0;
      let numObservedSilverLineOffloadsSum = 0;
      let numObservedBlueLineOffloadsSum = 0;
      let numObservedYellowLineOffloadsSum = 0;
      let numObservedGreenLineOffloadsSum = 0;

      let numObservedRedLineIncidentsSum = 0;
      let numObservedOrangeLineIncidentsSum = 0;
      let numObservedSilverLineIncidentsSum = 0;
      let numObservedBlueLineIncidentsSum = 0;
      let numObservedYellowLineIncidentsSum = 0;
      let numObservedGreenLineIncidentsSum = 0;

      let numRedLineNegativeTrainTagsSum = 0;
      let numOrangeLineNegativeTrainTagsSum = 0;
      let numSilverLineNegativeTrainTagsSum = 0;
      let numBlueLineNegativeTrainTagsSum = 0;
      let numYellowLineNegativeTrainTagsSum = 0;
      let numGreenLineNegativeTrainTagsSum = 0;

      group.forEach((row) => {
        const averageCalculatedHeadwayAdherence = row.get('averageCalculatedHeadwayAdherence');
        if (averageCalculatedHeadwayAdherence != null) {
          averageCalculatedHeadwayAdherenceSum += averageCalculatedHeadwayAdherence;
          numAverageCalculatedHeadwayAdherenceSamples++;
        }

        const averageCalculatedScheduleAdherence = row.get('averageCalculatedScheduleAdherence');
        if (averageCalculatedScheduleAdherence != null) {
          averageCalculatedScheduleAdherenceSum += averageCalculatedScheduleAdherence;
          numAverageCalculatedScheduleAdherenceSamples++;
        }

        const averageObservedTrainFrequency = row.get('averageObservedTrainFrequency');
        if (averageObservedTrainFrequency != null) {
          averageObservedTrainFrequencySum += averageObservedTrainFrequency;
          numAverageObservedTrainFrequencySamples++;
        }

        const averageExpectedTrainFrequency = row.get('averageExpectedTrainFrequency');
        if (averageExpectedTrainFrequency != null) {
          averageExpectedTrainFrequencySum += averageExpectedTrainFrequency;
          numAverageExpectedTrainFrequencySamples++;
        }

        const standardDeviationObservedTrainFrequency = row.get('standardDeviationObservedTrainFrequency');
        if (standardDeviationObservedTrainFrequency != null) {
          standardDeviationObservedTrainFrequencySum += standardDeviationObservedTrainFrequency;
          numStandardDeviationObservedTrainFrequencySamples++;
        }

        const standardDeviationExpectedTrainFrequency = row.get('standardDeviationExpectedTrainFrequency');
        if (standardDeviationExpectedTrainFrequency != null) {
          standardDeviationExpectedTrainFrequencySum += standardDeviationExpectedTrainFrequency;
          numStandardDeviationExpectedTrainFrequencySamples++;
        }

        const averageCalculatedPlatformWaitTime = row.get('averageCalculatedPlatformWaitTime');
        if (averageCalculatedPlatformWaitTime != null) {
          averageCalculatedPlatformWaitTimeSum += averageCalculatedPlatformWaitTime;
          numAverageCalculatedPlatformWaitTimeSamples++;
        }

        const averageExpectedPlatformWaitTime = row.get('averageExpectedPlatformWaitTime');
        if (averageExpectedPlatformWaitTime != null) {
          averageExpectedPlatformWaitTimeSum += averageExpectedPlatformWaitTime;
          numAverageExpectedPlatformWaitTimeSamples++;
        }

        const averageObservedTrains = row.get('averageObservedTrains');
        if (averageObservedTrains != null) {
          averageObservedTrainsSum += averageObservedTrains;
          numAverageObservedTrainsSamples++;
        }

        const averageExpectedTrains = row.get('averageExpectedTrains');
        if (averageExpectedTrains != null) {
          averageExpectedTrainsSum += averageExpectedTrains;
          numAverageExpectedTrainsSamples++;
        }

        const averageObservedEightCarTrains = row.get('averageObservedEightCarTrains');
        if (averageObservedEightCarTrains != null) {
          averageObservedEightCarTrainsSum += averageObservedEightCarTrains;
          numAverageObservedEightCarTrainsSamples++;
        }

        const averageExpectedEightCarTrains = row.get('averageExpectedEightCarTrains');
        if (averageExpectedEightCarTrains != null) {
          averageExpectedEightCarTrainsSum += averageExpectedEightCarTrains;
          numAverageExpectedEightCarTrainsSamples++;
        }

        const averageObservedTrainCars = row.get('averageObservedTrainCars');
        if (averageObservedTrainCars != null) {
          averageObservedTrainCarsSum += averageObservedTrainCars;
          numAverageObservedTrainCarsSamples++;
        }

        const averageExpectedTrainCars = row.get('averageExpectedTrainCars');
        if (averageExpectedTrainCars != null) {
          averageExpectedTrainCarsSum += averageExpectedTrainCars;
          numAverageExpectedTrainCarsSamples++;
        }

        const maximumObservedDelayedTrains = row.get('maximumObservedDelayedTrains');
        if (maximumObservedDelayedTrains != null) {
          maximumObservedDelayedTrainsSum += maximumObservedDelayedTrains;
          numMaximumObservedDelayedTrainsSamples++;
        }

        const medianObservedTrainDelays = row.get('medianObservedTrainDelays');
        if (medianObservedTrainDelays != null) {
          medianObservedTrainDelaysRawArray.push(medianObservedTrainDelays);
        }

        if (row.get('minimumObservedTrainDelays') != null && (minimumObservedTrainDelays == null || row.get('minimumObservedTrainDelays') < minimumObservedTrainDelays)) {
          minimumObservedTrainDelays = row.get('minimumObservedTrainDelays');
        }

        if (row.get('maximumObservedTrainDelays') != null && (maximumObservedTrainDelays == null || row.get('maximumObservedTrainDelays') > maximumObservedTrainDelays)) {
          maximumObservedTrainDelays = row.get('maximumObservedTrainDelays');
        }

        const numOffloads = row.get('numOffloads');
        if (numOffloads != null) {
          const lineCode = row.get('lineCode');
          if (lineCode === 'RD') {
            numObservedRedLineOffloadsSum += numOffloads;
          } else if (lineCode === 'OR') {
            numObservedOrangeLineOffloadsSum += numOffloads;
          } else if (lineCode === 'SV') {
            numObservedSilverLineOffloadsSum += numOffloads;
          } else if (lineCode === 'BL') {
            numObservedBlueLineOffloadsSum += numOffloads;
          } else if (lineCode === 'YL') {
            numObservedYellowLineOffloadsSum += numOffloads;
          } else if (lineCode === 'GR') {
            numObservedGreenLineOffloadsSum += numOffloads;
          }
        }

        const numIncidents = row.get('numIncidents');
        if (numIncidents != null) {
          const lineCode = row.get('lineCode');
          if (lineCode === 'RD') {
            numObservedRedLineIncidentsSum += numIncidents;
          } else if (lineCode === 'OR') {
            numObservedOrangeLineIncidentsSum += numIncidents;
          } else if (lineCode === 'SV') {
            numObservedSilverLineIncidentsSum += numIncidents;
          } else if (lineCode === 'BL') {
            numObservedBlueLineIncidentsSum += numIncidents;
          } else if (lineCode === 'YL') {
            numObservedYellowLineIncidentsSum += numIncidents;
          } else if (lineCode === 'GR') {
            numObservedGreenLineIncidentsSum += numIncidents;
          }
        }

        const numNegativeTrainTags = row.get('numNegativeTrainTags');
        if (numNegativeTrainTags != null) {
          const lineCode = row.get('lineCode');
          if (lineCode === 'RD') {
            numRedLineNegativeTrainTagsSum += numNegativeTrainTags;
          } else if (lineCode === 'OR') {
            numOrangeLineNegativeTrainTagsSum += numNegativeTrainTags;
          } else if (lineCode === 'SV') {
            numSilverLineNegativeTrainTagsSum += numNegativeTrainTags;
          } else if (lineCode === 'BL') {
            numBlueLineNegativeTrainTagsSum += numNegativeTrainTags;
          } else if (lineCode === 'YL') {
            numYellowLineNegativeTrainTagsSum += numNegativeTrainTags;
          } else if (lineCode === 'GR') {
            numGreenLineNegativeTrainTagsSum += numNegativeTrainTags;
          }
        }
      });

      const averageCalculatedHeadwayAdherence = numAverageCalculatedHeadwayAdherenceSamples ? _.round(averageCalculatedHeadwayAdherenceSum / numAverageCalculatedHeadwayAdherenceSamples) : null;
      const averageCalculatedScheduleAdherence = numAverageCalculatedScheduleAdherenceSamples ? _.round(averageCalculatedScheduleAdherenceSum / numAverageCalculatedScheduleAdherenceSamples) : null;
      const averageObservedTrainFrequency = numAverageObservedTrainFrequencySamples ? _.round(averageObservedTrainFrequencySum / numAverageObservedTrainFrequencySamples, 2) : null;
      const averageExpectedTrainFrequency = numAverageExpectedTrainFrequencySamples ? _.round(averageExpectedTrainFrequencySum / numAverageExpectedTrainFrequencySamples, 2) : null;
      const standardDeviationObservedTrainFrequency = numStandardDeviationObservedTrainFrequencySamples ? _.round(standardDeviationObservedTrainFrequencySum / numStandardDeviationObservedTrainFrequencySamples, 2) : null;
      const standardDeviationExpectedTrainFrequency = numStandardDeviationExpectedTrainFrequencySamples ? _.round(standardDeviationExpectedTrainFrequencySum / numStandardDeviationExpectedTrainFrequencySamples, 2) : null;
      const averageCalculatedPlatformWaitTime = numAverageCalculatedPlatformWaitTimeSamples ? _.round(averageCalculatedPlatformWaitTimeSum / numAverageCalculatedPlatformWaitTimeSamples, 2) : null;
      const averageExpectedPlatformWaitTime = numAverageExpectedPlatformWaitTimeSamples ? _.round(averageExpectedPlatformWaitTimeSum / numAverageExpectedPlatformWaitTimeSamples, 2) : null;
      const averageObservedTrains = numAverageObservedTrainsSamples ? _.round(averageObservedTrainsSum, 2) : null;
      const averageExpectedTrains = numAverageExpectedTrainsSamples ? _.round(averageExpectedTrainsSum, 2) : null;
      const averageObservedEightCarTrains = numAverageObservedEightCarTrainsSamples ? _.round(averageObservedEightCarTrainsSum, 2) : null;
      const averageExpectedEightCarTrains = numAverageExpectedEightCarTrainsSamples ? _.round(averageExpectedEightCarTrainsSum, 2) : null;
      const averageObservedTrainCars = numAverageObservedTrainCarsSamples ? _.round(averageObservedTrainCarsSum, 2) : null;
      const averageExpectedTrainCars = numAverageExpectedTrainCarsSamples ? _.round(averageExpectedTrainCarsSum, 2) : null;
      const maximumObservedDelayedTrains = numMaximumObservedDelayedTrainsSamples ? _.round(maximumObservedDelayedTrainsSum, 2) : null;
      const medianObservedTrainDelays = (medianObservedTrainDelaysRawArray.length > 0) ? _.round(Utilities.getMedian(medianObservedTrainDelaysRawArray), 2) : null;

      averageCalculatedHeadwayAdherencesArray.push(averageCalculatedHeadwayAdherence);
      averageCalculatedScheduleAdherencesArray.push(averageCalculatedScheduleAdherence);
      // averageExpectedScheduleAdherencesArray.push(100);  // a bit of a hack; it's always 100%
      averageObservedTrainFrequenciesArray.push(averageObservedTrainFrequency);
      averageExpectedTrainFrequenciesArray.push(averageExpectedTrainFrequency);
      standardDeviationObservedTrainFrequenciesArray.push(standardDeviationObservedTrainFrequency);
      standardDeviationExpectedTrainFrequenciesArray.push(standardDeviationExpectedTrainFrequency);
      averageCalculatedPlatformWaitTimesArray.push(averageCalculatedPlatformWaitTime);
      averageExpectedPlatformWaitTimesArray.push(averageExpectedPlatformWaitTime);
      averageObservedTrainsArray.push(averageObservedTrains);
      averageExpectedTrainsArray.push(averageExpectedTrains);
      averageObservedEightCarTrainsArray.push(averageObservedEightCarTrains);
      averageExpectedEightCarTrainsArray.push(averageExpectedEightCarTrains);
      averageObservedTrainCarsArray.push(averageObservedTrainCars);
      averageExpectedTrainCarsArray.push(averageExpectedTrainCars);
      maximumObservedDelayedTrainsArray.push(maximumObservedDelayedTrains);
      medianObservedTrainDelaysArray.push(medianObservedTrainDelays);
      minimumObservedTrainDelaysArray.push(minimumObservedTrainDelays);
      maximumObservedTrainDelaysArray.push(maximumObservedTrainDelays);

      observedNumRedLineOffloadsArray.push(numObservedRedLineOffloadsSum);
      observedNumOrangeLineOffloadsArray.push(numObservedOrangeLineOffloadsSum);
      observedNumSilverLineOffloadsArray.push(numObservedSilverLineOffloadsSum);
      observedNumBlueLineOffloadsArray.push(numObservedBlueLineOffloadsSum);
      observedNumYellowLineOffloadsArray.push(numObservedYellowLineOffloadsSum);
      observedNumGreenLineOffloadsArray.push(numObservedGreenLineOffloadsSum);
      // expectedNumOffloadsArray.push(0); // a bit of a hack; it's always 0

      observedNumRedLineIncidentsArray.push(numObservedRedLineIncidentsSum);
      observedNumOrangeLineIncidentsArray.push(numObservedOrangeLineIncidentsSum);
      observedNumSilverLineIncidentsArray.push(numObservedSilverLineIncidentsSum);
      observedNumBlueLineIncidentsArray.push(numObservedBlueLineIncidentsSum);
      observedNumYellowLineIncidentsArray.push(numObservedYellowLineIncidentsSum);
      observedNumGreenLineIncidentsArray.push(numObservedGreenLineIncidentsSum);
      // expectedNumIncidentsArray.push(0); // a bit of a hack; it's always 0

      numRedLineNegativeTrainTagsArray.push(numRedLineNegativeTrainTagsSum);
      numOrangeLineNegativeTrainTagsArray.push(numOrangeLineNegativeTrainTagsSum);
      numSilverLineNegativeTrainTagsArray.push(numSilverLineNegativeTrainTagsSum);
      numBlueLineNegativeTrainTagsArray.push(numBlueLineNegativeTrainTagsSum);
      numYellowLineNegativeTrainTagsArray.push(numYellowLineNegativeTrainTagsSum);
      numGreenLineNegativeTrainTagsArray.push(numGreenLineNegativeTrainTagsSum);
      // expectedNumNegativeTrainTagsArray.push(0); // a bit of a hack; it's always 0
    });

    const averageObservedTrainsCompactedArray = _.without(averageObservedTrainsArray, null);
    const averageExpectedTrainsCompactedArray = _.without(averageExpectedTrainsArray, null);
    const averageObservedEightCarTrainsCompactedArray = _.without(averageObservedEightCarTrainsArray, null);
    const averageExpectedEightCarTrainsCompactedArray = _.without(averageExpectedEightCarTrainsArray, null);
    const averageObservedTrainCarsCompactedArray = _.without(averageObservedTrainCarsArray, null);
    const averageExpectedTrainCarsCompactedArray = _.without(averageExpectedTrainCarsArray, null);
    const maximumObservedDelayedTrainsCompactedArray = _.without(maximumObservedDelayedTrainsArray, null);
    const medianObservedTrainDelaysCompactedArray = _.without(medianObservedTrainDelaysArray, null);

    const averageObservedTrains = (averageObservedTrainsCompactedArray.length > 0) ? _.round(_.mean(averageObservedTrainsCompactedArray), 2) : 'N/A';
    const averageExpectedTrains = (averageExpectedTrainsCompactedArray.length > 0) ? _.round(_.mean(averageExpectedTrainsCompactedArray), 2) : 'N/A';
    const averageObservedEightCarTrains = (averageObservedEightCarTrainsCompactedArray.length > 0) ? _.round(_.mean(averageObservedEightCarTrainsCompactedArray), 2) : 'N/A';
    const averageExpectedEightCarTrains = (averageExpectedEightCarTrainsCompactedArray.length > 0) ? _.round(_.mean(averageExpectedEightCarTrainsCompactedArray), 2) : 'N/A';
    const averageObservedTrainCars = (averageObservedTrainCarsCompactedArray.length > 0) ? _.round(_.mean(averageObservedTrainCarsCompactedArray), 2) : 'N/A';
    const averageExpectedTrainCars = (averageExpectedTrainCarsCompactedArray.length > 0) ? _.round(_.mean(averageExpectedTrainCarsCompactedArray), 2) : 'N/A';
    const maximumObservedDelayedTrains = (maximumObservedDelayedTrainsCompactedArray.length > 0) ? _.round(_.max(maximumObservedDelayedTrainsCompactedArray), 2) : 'N/A';
    const medianObservedTrainDelays = (medianObservedTrainDelaysCompactedArray.length > 0) ? _.round(Utilities.getMedian(medianObservedTrainDelaysCompactedArray), 2) : 'N/A';

    let averageCalculatedHeadwayAdherenceSum = 0;
    let averageCalculatedScheduleAdherenceSum = 0;
    let averageObservedTrainFrequencySum = 0;
    let averageExpectedTrainFrequencySum = 0;
    let standardDeviationObservedTrainFrequencySum = 0;
    let standardDeviationExpectedTrainFrequencySum = 0;
    let averageCalculatedPlatformWaitTimeSum = 0;
    let averageExpectedPlatformWaitTimeSum = 0;

    let numAverageCalculatedHeadwayAdherenceSamples = 0;
    let numAverageCalculatedScheduleAdherenceSamples = 0;
    let numAverageObservedTrainFrequencySamples = 0;
    let numAverageExpectedTrainFrequencySamples = 0;
    let numStandardDeviationObservedTrainFrequencySamples = 0;
    let numStandardDeviationExpectedTrainFrequencySamples = 0;
    let numAverageCalculatedPlatformWaitTimeSamples = 0;
    let numAverageExpectedPlatformWaitTimeSamples = 0;

    let numObservedOffloadsSum = 0;

    let numObservedIncidentsSum = 0;

    let numNegativeTrainTagsSum = 0;

    this.state.filteredData.forEach((row) => {
      const averageCalculatedHeadwayAdherence = row.get('averageCalculatedHeadwayAdherence');
      if (averageCalculatedHeadwayAdherence != null) {
        averageCalculatedHeadwayAdherenceSum += averageCalculatedHeadwayAdherence;
        numAverageCalculatedHeadwayAdherenceSamples++;
      }

      const averageCalculatedScheduleAdherence = row.get('averageCalculatedScheduleAdherence');
      if (averageCalculatedScheduleAdherence != null) {
        averageCalculatedScheduleAdherenceSum += averageCalculatedScheduleAdherence;
        numAverageCalculatedScheduleAdherenceSamples++;
      }

      const averageObservedTrainFrequency = row.get('averageObservedTrainFrequency');
      if (averageObservedTrainFrequency != null) {
        averageObservedTrainFrequencySum += averageObservedTrainFrequency;
        numAverageObservedTrainFrequencySamples++;
      }

      const averageExpectedTrainFrequency = row.get('averageExpectedTrainFrequency');
      if (averageExpectedTrainFrequency != null) {
        averageExpectedTrainFrequencySum += averageExpectedTrainFrequency;
        numAverageExpectedTrainFrequencySamples++;
      }

      const standardDeviationObservedTrainFrequency = row.get('standardDeviationObservedTrainFrequency');
      if (standardDeviationObservedTrainFrequency != null) {
        standardDeviationObservedTrainFrequencySum += standardDeviationObservedTrainFrequency;
        numStandardDeviationObservedTrainFrequencySamples++;
      }

      const standardDeviationExpectedTrainFrequency = row.get('standardDeviationExpectedTrainFrequency');
      if (standardDeviationExpectedTrainFrequency != null) {
        standardDeviationExpectedTrainFrequencySum += standardDeviationExpectedTrainFrequency;
        numStandardDeviationExpectedTrainFrequencySamples++;
      }

      const averageCalculatedPlatformWaitTime = row.get('averageCalculatedPlatformWaitTime');
      if (averageCalculatedPlatformWaitTime != null) {
        averageCalculatedPlatformWaitTimeSum += averageCalculatedPlatformWaitTime;
        numAverageCalculatedPlatformWaitTimeSamples++;
      }

      const averageExpectedPlatformWaitTime = row.get('averageExpectedPlatformWaitTime');
      if (averageExpectedPlatformWaitTime != null) {
        averageExpectedPlatformWaitTimeSum += averageExpectedPlatformWaitTime;
        numAverageExpectedPlatformWaitTimeSamples++;
      }

      const numOffloads = row.get('numOffloads');
      if (numOffloads != null) {
        numObservedOffloadsSum += numOffloads;
      }

      const numIncidents = row.get('numIncidents');
      if (numIncidents != null) {
        numObservedIncidentsSum += numIncidents;
      }

      const numNegativeTrainTags = row.get('numNegativeTrainTags');
      if (numNegativeTrainTags != null) {
        numNegativeTrainTagsSum += numNegativeTrainTags;
      }
    });

    const averageCalculatedHeadwayAdherence = numAverageCalculatedHeadwayAdherenceSamples ? _.round(averageCalculatedHeadwayAdherenceSum / numAverageCalculatedHeadwayAdherenceSamples) : 'N/A';
    const averageCalculatedScheduleAdherence = numAverageCalculatedScheduleAdherenceSamples ? _.round(averageCalculatedScheduleAdherenceSum / numAverageCalculatedScheduleAdherenceSamples) : 'N/A';
    const averageObservedTrainFrequency = numAverageObservedTrainFrequencySamples ? _.round(averageObservedTrainFrequencySum / numAverageObservedTrainFrequencySamples, 2) : 'N/A';
    const averageExpectedTrainFrequency = numAverageExpectedTrainFrequencySamples ? _.round(averageExpectedTrainFrequencySum / numAverageExpectedTrainFrequencySamples, 2) : 'N/A';
    const standardDeviationObservedTrainFrequency = numStandardDeviationObservedTrainFrequencySamples ? _.round(standardDeviationObservedTrainFrequencySum / numStandardDeviationObservedTrainFrequencySamples, 2) : 'N/A';
    const standardDeviationExpectedTrainFrequency = numStandardDeviationExpectedTrainFrequencySamples ? _.round(standardDeviationExpectedTrainFrequencySum / numStandardDeviationExpectedTrainFrequencySamples, 2) : 'N/A';
    const averageCalculatedPlatformWaitTime = numAverageCalculatedPlatformWaitTimeSamples ? _.round(averageCalculatedPlatformWaitTimeSum / numAverageCalculatedPlatformWaitTimeSamples, 2) : 'N/A';
    const averageExpectedPlatformWaitTime = numAverageExpectedPlatformWaitTimeSamples ? _.round(averageExpectedPlatformWaitTimeSum / numAverageExpectedPlatformWaitTimeSamples, 2) : 'N/A';

    const lineDots = [];
    let lineCodesForDots;
    if (this.state.selectedLineCodes && this.state.selectedLineCodes.size > 0) {
      lineCodesForDots = this.state.selectedLineCodes;
    } else {
      lineCodesForDots = PerformanceSummaryStore.defaultState.selectedLineCodes;
    }
    lineCodesForDots.forEach((lineCode) => {
      lineDots.push(this._buildLineDot(lineCode));
    });

    let table;
    if (!this.state.isMobileDevice) {
      const pagination = (
        <UltimatePaginationMaterialUi
          currentPage={this.state.currentPage}
          totalPages={this.state.totalNumPages}
          onChange={(newPage) => {
            if (!this.state.isLoading) {
              PerformanceSummaryActions.setState({
                currentPage: newPage
              });
            }
          }}
        />
      );

      const maxResultCountSelector = (
        <SelectField
          style={{width: 120, float: 'right', position: 'absolute', bottom: 0, right: 16, textAlign: 'left'}}
          floatingLabelText="Max Results"
          value={this.state.pageSize}
          onChange={(e, index, object) => {
            PerformanceSummaryActions.setState({
              pageSize: object,
              currentPage: 1,
              totalNumPages: Math.max(Math.ceil(this.state.filteredData.size / object), 1)
            });
          }}
          disabled={this.state.isLoading}
        >
          <MenuItem value={25} primaryText={'25'}/>
          <MenuItem value={50} primaryText={'50'}/>
          <MenuItem value={75} primaryText={'75'}/>
          <MenuItem value={100} primaryText={'100'}/>
        </SelectField>
      );

      const pageStart = (this.state.currentPage - 1) * this.state.pageSize;
      const pageEnd = this.state.currentPage * this.state.pageSize;
      const paginatedData = this.state.filteredData.slice(pageStart, pageEnd);

      table = (
        <Card
          style={{marginTop: 8}}
        >
          <Table
            multiSelectable={true}
          >
            <TableHeader
              displaySelectAll={false}
              adjustForCheckbox={false}
              enableSelectAll={false}
            >
              <TableRow>
                <TableHeaderColumn
                  colSpan={10}
                  style={{paddingTop: 8, textAlign: 'center'}}
                >
                  <RaisedButton
                    label="Download CSV"
                    icon={<FileFileDownload />}
                    onClick={this._downloadCsv}
                    disabled={this.state.isLoading}
                    style={{
                      position: 'absolute',
                      left: 16
                    }}
                  />
                  {pagination}
                  {maxResultCountSelector}
                </TableHeaderColumn>
              </TableRow>
              <TableRow>
                {this.state.byTimeOfDay ? <TableHeaderColumn>Time</TableHeaderColumn> : <TableHeaderColumn>Date</TableHeaderColumn>}
                <TableHeaderColumn>Service<br/>Period</TableHeaderColumn>
                <TableHeaderColumn>Line</TableHeaderColumn>
                <TableHeaderColumn>Headway<br/>Adherence</TableHeaderColumn>
                <TableHeaderColumn>Schedule<br/>Adherence</TableHeaderColumn>
                <TableHeaderColumn>Train<br/>Frequency<br/>(in minutes)</TableHeaderColumn>
                <TableHeaderColumn>Platform<br/>Wait Time<br/>(in minutes)</TableHeaderColumn>
                <TableHeaderColumn># Trains</TableHeaderColumn>
                <TableHeaderColumn># 8-car<br/>Trains</TableHeaderColumn>
                <TableHeaderColumn># Train<br/>Cars</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              showRowHover={true}
            >
              {this._buildTableRows(paginatedData)}
            </TableBody>
          </Table>
          <div
            style={{padding: 8, textAlign: 'center'}}
          >
            {pagination}
          </div>
        </Card>
      );
    } else {
      table = (
        <Card
          style={{marginTop: 8, textAlign: 'center'}}
        >
          <CardText>
            For more info, including a full data table that breaks down each of the metrics above, please visit this page on Desktop instead of on a mobile device.
          </CardText>
        </Card>
      );
    }

    return (
      <div
        className="PerformanceSummary vertical-scrolling"
      >
        {title}
        <div
          style={{
            maxWidth: 740,
            margin: '0 auto',
            marginTop: 8
          }}
        >
          <CardText
            style={{paddingTop: 0}}
          >
            <div
              style={{
                position: 'relative',
                marginBottom: 8
              }}
            >
              <SelectField
                floatingLabelText="View trends…"
                value={this.state.byTimeOfDay}
                onChange={(e, index, object) => {
                  PerformanceSummaryActions.setState({
                    byTimeOfDay: object,
                  });
                  PerformanceSummaryActions.get();
                }}
                disabled={this.state.isLoading}
                style={{
                  position: 'relative',
                  left: '50%',
                  marginLeft: -128
                }}
              >
                <MenuItem value={false} primaryText={"Across date range"} />
                <MenuItem value={true} primaryText={"By time of day"} />
              </SelectField>
            </div>
            <Divider />
            <DatePicker
              floatingLabelText="Start Date"
              defaultDate={this.state.minDate}
              minDate={this.state.minDate}
              maxDate={this.state.maxDate}
              firstDayOfWeek={0}
              formatDate={(date) => {
                return moment(date).format('M/D/YY');
              }}
              onChange={(event, date) => {
                PerformanceSummaryActions.setState({
                  selectedStartDate: moment(date).format('M/D/YY')
                });
                if (this.state.byTimeOfDay) {
                  PerformanceSummaryActions.get();
                } else {
                  PerformanceSummaryActions.applyFilters();
                }
              }}
              disabled={this.state.isLoading}
              style={{display: 'inline-block', verticalAlign: 'top', marginRight: 8}}
              textFieldStyle={{width: 85}}
              value={moment(this.state.selectedStartDate, 'M/D/YY').toDate()}
            />
            <DatePicker
              floatingLabelText="End Date"
              defaultDate={this.state.maxDate}
              minDate={this.state.minDate}
              maxDate={this.state.maxDate}
              firstDayOfWeek={0}
              formatDate={(date) => {
                return moment(date).format('M/D/YY');
              }}
              onChange={(event, date) => {
                PerformanceSummaryActions.setState({
                  selectedEndDate: moment(date).format('M/D/YY')
                });
                if (this.state.byTimeOfDay) {
                  PerformanceSummaryActions.get();
                } else {
                  PerformanceSummaryActions.applyFilters();
                }
              }}
              disabled={this.state.isLoading}
              style={{display: 'inline-block', verticalAlign: 'top', marginRight: 8}}
              textFieldStyle={{width: 85}}
              value={moment(this.state.selectedEndDate, 'M/D/YY').toDate()}
            />
            <SelectField
              multiple={true}
              floatingLabelText="Service Period"
              value={this.state.selectedServicePeriod && this.state.selectedServicePeriod.toJS()}
              onChange={(event, index, values) => {
                PerformanceSummaryActions.setState({
                  selectedServicePeriod: (values && values.length > 0) ? values : ['AM Rush', 'PM Rush']
                });
                PerformanceSummaryActions.applyFilters();
              }}
              disabled={this.state.isLoading}
              style={{marginRight: 8}}
            >
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedServicePeriod && this.state.selectedServicePeriod.includes('AM Rush')}
                value={'AM Rush'}
                primaryText={"AM Rush"}
              />
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedServicePeriod && this.state.selectedServicePeriod.includes('PM Rush')}
                value={'PM Rush'}
                primaryText={"PM Rush"}
              />
            </SelectField>
            <SelectField
              multiple={true}
              floatingLabelText="Line"
              value={this.state.selectedLineCodes && this.state.selectedLineCodes.toJS()}
              onChange={(event, index, values) => {
                PerformanceSummaryActions.setState({
                  selectedLineCodes: (values && values.length > 0) ? values : ['RD', 'OR', 'SV', 'BL', 'YL', 'GR']
                });
                PerformanceSummaryActions.applyFilters();
              }}
              disabled={this.state.isLoading}
            >
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedLineCodes && this.state.selectedLineCodes.includes('RD')}
                value={'RD'}
                primaryText={"Red Line"}
              />
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedLineCodes && this.state.selectedLineCodes.includes('OR')}
                value={'OR'}
                primaryText={"Orange Line"}
              />
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedLineCodes && this.state.selectedLineCodes.includes('SV')}
                value={'SV'}
                primaryText={"Silver Line"}
              />
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedLineCodes && this.state.selectedLineCodes.includes('BL')}
                value={'BL'}
                primaryText={"Blue Line"}
              />
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedLineCodes && this.state.selectedLineCodes.includes('YL')}
                value={'YL'}
                primaryText={"Yellow Line"}
              />
              <MenuItem
                insetChildren={true}
                checked={this.state.selectedLineCodes && this.state.selectedLineCodes.includes('GR')}
                value={'GR'}
                primaryText={"Green Line"}
              />
            </SelectField>
          </CardText>
        </div>
        <div
          style={{
            textAlign: 'center'
          }}
        >
          {lineDots}
        </div>
        <CardText
          style={{paddingTop: 12, paddingBottom: 12, textAlign: 'center', fontSize: 12, fontStyle: 'italic'}}
        >
          <div>
            data below last updated on <span style={{whiteSpace: 'nowrap'}}>{this.state.lastUpdated ? moment(this.state.lastUpdated).format("M/D/YY") : "…"} at {this.state.lastUpdated ? moment(this.state.lastUpdated).format("h:mma") : "…"}</span>
          </div>
          <RaisedButton
            label="Refresh"
            icon={<NavigationRefresh />}
            onClick={() => {
              PerformanceSummaryActions.get();
            }}
            disabled={this.state.isLoading}
            style={{
              marginTop: 8
            }}
          />
        </CardText>
        <div
          className="metric-card-container"
        >
          {this._buildMetricCard(
            "Headway adherence",
            "How often trains were observed arriving at scheduled station stops in no more than two minutes over their scheduled headway, on average,",
            averageCalculatedHeadwayAdherence,
            'N/A',
            "avg adherence (%)",
            "%",
            true,
            labelsArray,
            averageCalculatedHeadwayAdherencesArray,
            null,
            <span>* higher is better; calculated using <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a>; WMATA measures headway adherence differently as "Train On-Time Performance," defined in <a href="https://www.wmata.com/about/board/meetings/board-pdfs/upload/3A-Q1-FY2018-Vital-Signs-TO-POST.pdf#page=43" target="_blank">WMATA's latest Vital Signs Report</a></span>
          )}
          {this._buildMetricCard(
            "Schedule adherence",
            "How often trains were observed arriving at scheduled station stops within two minutes of their scheduled arrival time, on average,",
            averageCalculatedScheduleAdherence,
            'N/A',
            "avg adherence (%)",
            "%",
            true,
            labelsArray,
            averageCalculatedScheduleAdherencesArray,
            null,
            <span>* higher is better; calculated using <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a>; WMATA does not currently measure schedule adherence, nor do they define a target for us to compare against</span>
          )}
        </div>
        <div
          className="metric-card-container"
        >
          {this._buildMetricCard(
            "Train frequency",
            "How often trains were observed arriving at stations, on average,",
            averageObservedTrainFrequency,
            averageExpectedTrainFrequency,
            "avg train freq (mins)",
            "minutes",
            false,
            labelsArray,
            averageObservedTrainFrequenciesArray,
            averageExpectedTrainFrequenciesArray,
            <span>* lower is better; calculated using <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a></span>
          )}
          {this._buildMetricCard(
            "Train spacing consistency",
            "The variance in the frequency at which trains were observed arriving at stations, on average,",
            standardDeviationObservedTrainFrequency,
            standardDeviationExpectedTrainFrequency,
            "stddev train freq (mins)",
            "minutes",
            false,
            labelsArray,
            standardDeviationObservedTrainFrequenciesArray,
            standardDeviationExpectedTrainFrequenciesArray,
            <span>* lower is better; calculated using <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a> and the standard deviation (stddev) of train arrivals at stations</span>
          )}
          {this._buildMetricCard(
            "Platform wait time",
            "The estimated amount of time a rider was waiting for a given train on any given station platform, on average,",
            averageCalculatedPlatformWaitTime,
            averageExpectedPlatformWaitTime,
            "avg platform wait (mins)",
            "minutes",
            false,
            labelsArray,
            averageCalculatedPlatformWaitTimesArray,
            averageExpectedPlatformWaitTimesArray,
            <span>* lower is better; calculated using <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a> and the following formula published <a href="http://pubsonline.informs.org/doi/abs/10.1287/trsc.9.3.248" target="_blank">here</a>: <span style={{whiteSpace: 'nowrap'}}>(&mu; (1 + &sigma;&sup2; / &mu;&sup2;) / 2)</span>, "where &mu; and &sigma; are respectively the mean and standard deviation of the time headways" between train arrivals at stations, and assuming riders' arrival at station platforms is random, which is the worst-case scenario; our calculations optimistically assume every rider is able to board the first train they're waiting for, which is not always the case, but WMATA does not make any real-time ridership data available for us to use</span>
          )}
        </div>
        <div
          className="metric-card-container"
        >
          {this._buildMetricCard(
            "Number of service incidents",
            "The estimated number of service incidents (derived from MetroAlerts)",
            numObservedIncidentsSum,
            'N/A',
            "# estimated incidents",
            null,
            false,
            labelsArray,
            {
              "RD": observedNumRedLineIncidentsArray,
              "OR": observedNumOrangeLineIncidentsArray,
              "SV": observedNumSilverLineIncidentsArray,
              "BL": observedNumBlueLineIncidentsArray,
              "YL": observedNumYellowLineIncidentsArray,
              "GR": observedNumGreenLineIncidentsArray
            },
            expectedNumIncidentsArray,
            <span>* lower is better; not all incidents result in a MetroAlert; incidents affecting multiple lines are counted against each line individually, which can result in the same incident being counted more than once in the overall total number of incidents across all lines; WMATA does not currently define a target number of incidents for us to compare against</span>,
            true
          )}
          {this._buildMetricCard(
            "Number of train offloads",
            "The estimated number of train offloads",
            numObservedOffloadsSum,
            'N/A',
            "# estimated train offloads",
            null,
            false,
            labelsArray,
            {
              "RD": observedNumRedLineOffloadsArray,
              "OR": observedNumOrangeLineOffloadsArray,
              "SV": observedNumSilverLineOffloadsArray,
              "BL": observedNumBlueLineOffloadsArray,
              "YL": observedNumYellowLineOffloadsArray,
              "GR": observedNumGreenLineOffloadsArray
            },
            expectedNumOffloadsArray,
            <span>* lower is better; a potential offload occurs when we observe a train going from being in revenue service (e.g. a Red line train to Shady Grove) to 'No Passenger' while on the mainline; WMATA does not currently define a target number of train offloads for us to compare against</span>,
            true
          )}
          {this._buildMetricCard(
            "Number of reported train problems",
            "The number of times MetroHero users reported a problem with a train",
            numNegativeTrainTagsSum,
            null,
            "# reported train problems",
            null,
            false,
            labelsArray,
            {
              "RD": numRedLineNegativeTrainTagsArray,
              "OR": numOrangeLineNegativeTrainTagsArray,
              "SV": numSilverLineNegativeTrainTagsArray,
              "BL": numBlueLineNegativeTrainTagsArray,
              "YL": numYellowLineNegativeTrainTagsArray,
              "GR": numGreenLineNegativeTrainTagsArray
            },
            expectedNumNegativeTrainTagsArray,
            <span>* lower is better; rider reports from MetroHero that factor into this metric include 'Bad Operator', 'Too Crowded', 'Too Hot/Cold', 'Recently Offloaded', 'Bumpy/Jerky Ride', 'Isolated Cars', 'Wrong # of Cars', 'Wrong Destination', 'Needs Cleaning/Work', 'Broken Intercom', and 'Disruptive Passenger'</span>,
            true
          )}
        </div>
        <div
          className="metric-card-container"
        >
          {this._buildMetricCard(
            "Number of trains",
            "The average number of trains in active revenue service",
            averageObservedTrains,
            averageExpectedTrains,
            "avg # trains",
            null,
            true,
            labelsArray,
            averageObservedTrainsArray,
            averageExpectedTrainsArray,
            <span>* higher is better; expected number of trains is derived from <a href="https://www.wmata.com/about/developers/" target="_blank">WMATA's schedule data</a></span>
          )}
          {this._buildMetricCard(
            "Number of eight-car trains",
            "The average number of eight-car trains in active revenue service",
            averageObservedEightCarTrains,
            averageExpectedEightCarTrains,
            "avg # eight-car trains",
            null,
            true,
            labelsArray,
            averageObservedEightCarTrainsArray,
            null,
            <span>* higher is better; we cannot derive the expected number of eight-car trains because the expected number of cars for each train is not included in WMATA's public schedule data</span>
          )}
          {this._buildMetricCard(
            "Number of train cars",
            "The average number of train cars in active revenue service",
            averageObservedTrainCars,
            averageExpectedTrainCars,
            "avg # train cars",
            null,
            true,
            labelsArray,
            averageObservedTrainCarsArray,
            null,
            <span>* higher is better; we cannot derive the expected number of train cars because the expected number of cars for each train is not included in WMATA's public schedule data</span>
          )}
        </div>
        <div
          className="metric-card-container"
        >
          {this._buildMetricCard(
            "Number of tardy trains (BETA)",
            "The maximum number of tardy trains in active revenue service at once",
            maximumObservedDelayedTrains,
            'N/A',
            "max # tardy trains",
            null,
            false,
            labelsArray,
            maximumObservedDelayedTrainsArray,
            null,
            <span>* lower is better; we consider trains to be tardy if they've accumulated delays of 5 minutes or more during their trip so far; trains accumulate delays as they move down the line towards their destination stations by holding or moving slowly at station stops or between station stops during their trip; train delays are cumulative, i.e. they will persist or grow for as long as the train continues down the line without turning around; delays are not accumulated at terminal stations, nor when approaching, holding at, or departing from scheduled turn-back stations; WMATA does not currently define a target number of tardy trains for us to compare against</span>
          )}
          {this._buildMetricCard(
            "Train tardiness (BETA)",
            "The cumulative trip time delays of trains in active revenue service",
            medianObservedTrainDelays,
            'N/A',
            "train delays (mins)",
            "minutes",
            false,
            labelsArray,
            medianObservedTrainDelaysArray,
            null,
            <span>* lower is better; trains accumulate delays as they move down the line towards their destination stations by holding or moving slowly at station stops or between station stops during their trip; train delays are cumulative, i.e. they will persist or grow for as long as the train continues down the line without turning around; delays are not accumulated at terminal stations, nor when approaching, holding at, or departing from scheduled turn-back stations; WMATA does not currently define a target train tardiness for us to compare against</span>,
            false,
            minimumObservedTrainDelaysArray,
            maximumObservedTrainDelaysArray
          )}
        </div>
        {table}
        <div
          style={{height: 92}}
        />
      </div>
    )
  }
}));
