import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import _ from 'lodash';
import moment from 'moment';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import {Line} from 'react-chartjs-2';

import {Card, CardText} from 'material-ui/Card';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

import DashboardHistoryActions from '../actions/DashboardHistoryActions';
import DashboardHistoryStore from '../stores/DashboardHistoryStore';
import SettingsStore from "../stores/SettingsStore";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(DashboardHistoryStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isLoading: DashboardHistoryStore.get('isLoading'),
      error: DashboardHistoryStore.get('error'),
      results: DashboardHistoryStore.get('results'),
      params: DashboardHistoryStore.get('params').toJS(),
      currentMetric: DashboardHistoryStore.get('currentMetric'),
      currentLineCode: DashboardHistoryStore.get('currentLineCode'),
      isNerdMode: SettingsStore.get('isNerdMode')
    };
  },

  UNSAFE_componentWillMount() {
    DashboardHistoryActions.get(null);
  },

  render() {
    let loading;
    if (this.state.isLoading) {
      loading = (
        <RefreshIndicator size={40} left={-20} top={230} status="loading" style={{marginLeft: '50%'}} />
      );
    }

    let backgroundColor = "rgba(0, 0, 0, 0.2)";
    let borderColor = "rgba(0, 0, 0, 1)";
    let pointBorderColor = "rgba(0, 0, 0, 1)";
    if (this.state.currentLineCode === 'RD') {
      backgroundColor = "rgba(229, 22, 54, 0.2)";
      borderColor = "rgba(229, 22, 54, 1)";
      pointBorderColor = "rgba(229, 22, 54, 1)";
    } else if (this.state.currentLineCode === 'OR') {
      backgroundColor = "rgba(246, 135, 18, 0.2)";
      borderColor = "rgba(246, 135, 18, 1)";
      pointBorderColor = "rgba(246, 135, 18, 1)";
    } else if (this.state.currentLineCode === 'SV') {
      backgroundColor = "rgba(157, 159, 156, 0.2)";
      borderColor = "rgba(157, 159, 156, 1)";
      pointBorderColor = "rgba(157, 159, 156, 1)";
    } else if (this.state.currentLineCode === 'BL') {
      backgroundColor = "rgba(21, 116, 196, 0.2)";
      borderColor = "rgba(21, 116, 196, 1)";
      pointBorderColor = "rgba(21, 116, 196, 1)";
    } else if (this.state.currentLineCode === 'YL') {
      backgroundColor = "rgba(252, 208, 6, 0.2)";
      borderColor = "rgba(252, 208, 6, 1)";
      pointBorderColor = "rgba(252, 208, 6, 1)";
    } else if (this.state.currentLineCode === 'GR') {
      backgroundColor = "rgba(15, 171, 75, 0.2)";
      borderColor = "rgba(15, 171, 75, 1)";
      pointBorderColor = "rgba(15, 171, 75, 1)";
    }

    let lineChart;
    if (this.state.results && !this.state.isLoading) {
      const dashboardLineHistories = this.state.results.get('dashboardLineHistories');

      // format the timestamps we receive from the backend
      const timestamps = dashboardLineHistories.get(this.state.currentLineCode).get('timestamps').split(',');
      const longestTimestampFormat = "M/D/YY h:mm:ssa";
      const removeSecondsIfAppropriate = function (thisMoment, timestampFormat) {
        return (moment(thisMoment).second() === 0) ? timestampFormat.replace(":ss", "") : timestampFormat;
      };
      const firstMoment = moment.unix(timestamps[0]);
      const formattedTimestamps = [firstMoment.format(removeSecondsIfAppropriate(firstMoment, longestTimestampFormat))];
      for (let i = 1; i < timestamps.length; i++) {
        const previousMoment = moment.unix(timestamps[i - 1]);
        const thisMoment = moment.unix(timestamps[i]);
        if (thisMoment.isSame(previousMoment, "year")) {
          if (thisMoment.isSame(previousMoment, "month")) {
            if (thisMoment.isSame(previousMoment, "week")) {
              if (thisMoment.isSame(previousMoment, "day")) {
                formattedTimestamps.push(thisMoment.format(removeSecondsIfAppropriate(thisMoment, "h:mm:ssa")));
              } else {
                formattedTimestamps.push(thisMoment.format(removeSecondsIfAppropriate(thisMoment, "M/D h:mm:ssa")));
              }
            } else {
              formattedTimestamps.push(thisMoment.format(removeSecondsIfAppropriate(thisMoment, "M/D h:mm:ssa")));
            }
          } else {
            formattedTimestamps.push(thisMoment.format(removeSecondsIfAppropriate(thisMoment, "M/D h:mm:ssa")));
          }
        } else {
          formattedTimestamps.push(thisMoment.format(removeSecondsIfAppropriate(thisMoment, longestTimestampFormat)));
        }
      }

      const datasets = [{
        label: this.state.currentLineCode,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        pointBorderColor: pointBorderColor,
        data: _.map(dashboardLineHistories.get(this.state.currentLineCode).get(this.state.currentMetric).split(','), (n) => {
          if (n !== '-1') {
            return parseFloat(n);
          } else {
            return null;
          }
        })
      }];

      if (this.state.currentMetric === 'avgNumTrains') {
        datasets.push({
          label: "scheduled",
          backgroundColor: "rgba(85, 85, 85, 0.2)",
          borderColor: "rgba(85, 85, 85, 1)",
          pointBorderColor: "rgba(85, 85, 85, 1)",
          data: _.map(dashboardLineHistories.get(this.state.currentLineCode).get('expNumTrains').split(','), (n) => {
            if (n !== '-1') {
              return parseInt(n, 10);
            } else {
              return null;
            }
          })
        });
      } else if (this.state.currentMetric === 'avgTrainFrequency') {
        datasets.push({
          label: "scheduled",
          backgroundColor: "rgba(85, 85, 85, 0.2)",
          borderColor: "rgba(85, 85, 85, 1)",
          pointBorderColor: "rgba(85, 85, 85, 1)",
          data: _.map(dashboardLineHistories.get(this.state.currentLineCode).get('expTrainFrequency').split(','), (n) => {
            if (n !== '-1') {
              return parseFloat(n);
            } else {
              return null;
            }
          })
        });
      } else if (this.state.currentMetric === 'avgPlatformWaitTime') {
        datasets.push({
          label: "scheduled",
          backgroundColor: "rgba(85, 85, 85, 0.2)",
          borderColor: "rgba(85, 85, 85, 1)",
          pointBorderColor: "rgba(85, 85, 85, 1)",
          data: _.map(dashboardLineHistories.get(this.state.currentLineCode).get('expPlatformWaitTime').split(','), (n) => {
            if (n !== '-1') {
              return parseFloat(n);
            } else {
              return null;
            }
          })
        });
      } else if (this.state.currentMetric === 'stdDevTrainFrequency') {
        datasets.push({
          label: "scheduled",
          backgroundColor: "rgba(85, 85, 85, 0.2)",
          borderColor: "rgba(85, 85, 85, 1)",
          pointBorderColor: "rgba(85, 85, 85, 1)",
          data: _.map(dashboardLineHistories.get(this.state.currentLineCode).get('expStdDevTrainFrequency').split(','), (n) => {
            if (n !== '-1') {
              return parseFloat(n);
            } else {
              return null;
            }
          })
        });
      }

      const averageAcrossTime = _.round(_(dashboardLineHistories.get(this.state.currentLineCode).get(this.state.currentMetric).split(',')).reduce(function(a, m, i, p) {
        return a + m/p.length;
      }, 0), 2);
      lineChart = (
        <div>
          <div>Average Across Selected Time Period: {averageAcrossTime}</div>
          <Line redraw data={{
            labels: formattedTimestamps,
            datasets: datasets
          }}
          options={{
            datasetFill: false,
            legend: {
              display: false
            },
            scales: {
              xAxes: [{
                ticks: {
                  fontColor: this.context.muiTheme.palette.secondaryTextColor
                }
              }],
              yAxes: [{
                ticks: {
                  fontColor: this.context.muiTheme.palette.secondaryTextColor
                }
              }]
            }
          }}
          width={600} height={400} />
        </div>
      );
    } else if (!this.state.isLoading) {
      lineChart = (
        <p className="no-results">No data to display!<br/>Check your query syntax and try again.</p>
      )
    }

    const chartSubtitle = (
      <div>
        <span style={{marginRight: 8}}>for</span>
        <SelectField className="inline-field" value={this.state.currentLineCode} style={{width: 144}} labelStyle={{top: 23, marginTop: -27, paddingRight: 16}} onChange={(e, index, object) => {
          DashboardHistoryActions.updateState({
            currentLineCode: object
          });
        }} disabled={this.state.isLoading}>
          <MenuItem value="RD" primaryText="Red Line" />
          <MenuItem value="OR" primaryText="Orange Line" />
          <MenuItem value="SV" primaryText="Silver Line" />
          <MenuItem value="BL" primaryText="Blue Line" />
          <MenuItem value="YL" primaryText="Yellow Line" />
          <MenuItem value="GR" primaryText="Green Line" />
          <MenuItem value="ALL" primaryText="All Lines" />
        </SelectField>
        <span style={{marginLeft: 8, marginRight: 8}}>from</span>
        <TimePicker className="inline-field" hintText="Start Time" format={this.state.isNerdMode ? '24hr' : 'ampm'} defaultTime={moment.unix(this.state.params.observedDateTimestampMin).toDate()} style={{display: "inline"}} textFieldStyle={{width: 75}} onChange={(event, time) => {
          if (time) {
            const selectedMoment = moment(time);
            const newMoment = moment.unix(this.state.params.observedDateTimestampMin).hours(selectedMoment.hours()).minutes(selectedMoment.minutes());
            DashboardHistoryActions.updateParams({
              interval: Math.max(Math.ceil(((this.state.params.observedDateTimestampMax - newMoment.unix()) / 60) / 30), 1),
              observedDateTimestampMin: newMoment.unix()
            });
          }
        }} disabled={this.state.isLoading} />
        <span style={{marginLeft: 8, marginRight: 8}}>on</span>
        <DatePicker className="inline-field" hintText="Start Date" defaultDate={moment.unix(this.state.params.observedDateTimestampMin).toDate()} style={{display: "inline-block"}} minDate={moment.unix(parseInt(this.state.results ? this.state.results.get('firstTimestamp') : "0", 10)).toDate()} textFieldStyle={{width: 70}} formatDate={date => moment(date).format('M/D/YY')} onChange={(event, date) => {
          if (date) {
            const selectedMoment = moment(date);
            const newMoment = moment.unix(this.state.params.observedDateTimestampMin).year(selectedMoment.year()).dayOfYear(selectedMoment.dayOfYear());
            DashboardHistoryActions.updateParams({
              interval: Math.max(Math.ceil(((this.state.params.observedDateTimestampMax - newMoment.unix()) / 60) / 30), 1),
              observedDateTimestampMin: newMoment.unix()
            });
          }
        }} disabled={this.state.isLoading} firstDayOfWeek={0} />
        <span style={{marginLeft: 8, marginRight: 8}}>to</span>
        <TimePicker className="inline-field" hintText="End Time" format={this.state.isNerdMode ? '24hr' : 'ampm'} defaultTime={moment.unix(this.state.params.observedDateTimestampMax).toDate()} style={{display: "inline"}} textFieldStyle={{width: 75}} onChange={(event, time) => {
          if (time) {
            const selectedMoment = moment(time);
            const newMoment = moment.unix(this.state.params.observedDateTimestampMax).hours(selectedMoment.hours()).minutes(selectedMoment.minutes());
            DashboardHistoryActions.updateParams({
              interval: Math.max(Math.ceil(((newMoment.unix() - this.state.params.observedDateTimestampMin) / 60) / 30), 1),
              observedDateTimestampMax: newMoment.unix()
            });
          }
        }} disabled={this.state.isLoading} />
        <span style={{marginLeft: 8, marginRight: 8}}>on</span>
        <DatePicker className="inline-field" hintText="End Date" defaultDate={moment.unix(this.state.params.observedDateTimestampMax).toDate()} style={{display: "inline-block"}} minDate={moment.unix(this.state.params.observedDateTimestampMin).toDate()} textFieldStyle={{width: 70}} formatDate={date => moment(date).format('M/D/YY')} onChange={(event, date) => {
          if (date) {
            const selectedMoment = moment(date);
            const newMoment = moment.unix(this.state.params.observedDateTimestampMax).year(selectedMoment.year()).dayOfYear(selectedMoment.dayOfYear());
            DashboardHistoryActions.updateParams({
              interval: Math.max(Math.ceil(((newMoment.unix() - this.state.params.observedDateTimestampMin) / 60) / 30), 1),
              observedDateTimestampMax: newMoment.unix()
            });
          }
        }} disabled={this.state.isLoading} firstDayOfWeek={0} />
      </div>
    );

    return (
      <div className="DashboardHistory">
        <div style={{width: '675px', margin: '16px auto 36px'}}>
          <Card>
            <div>
              <SelectField value={this.state.currentMetric} style={{width: 375}} onChange={(e, index, object) => {
                  DashboardHistoryActions.updateState({
                    currentMetric: object
                  });
                }} disabled={this.state.isLoading}>
                <MenuItem value="avgNumCars" primaryText="Average # Cars" />
                <MenuItem value="avgNumTrains" primaryText="Average # Trains" />
                <MenuItem value="avgNumDelayedTrains" primaryText="Average # Tardy Trains" />
                <MenuItem value="avgNumEightCarTrains" primaryText="Average # 8-car Trains" />
                <MenuItem value="avgPercentTrainsDelayed" primaryText="Average % Tardy Trains" />
                <MenuItem value="avgPercentEightCarTrains" primaryText="Average % 8-car Trains" />
                <MenuItem value="avgTrainDelay" primaryText="Average Train Tardiness (secs)" />
                <MenuItem value="avgMinimumHeadways" primaryText="Average Minimum Headways (mins)" />
                <MenuItem value="avgTrainFrequency" primaryText="Average Train Frequency (mins)" />
                <MenuItem value="stdDevTrainFrequency" primaryText="Average Train Spacing Consistency (mins)" />
                <MenuItem value="avgPlatformWaitTime" primaryText="Average Platform Wait Time (mins)" />
                <MenuItem value="avgHeadwayAdherence" primaryText="Average Headway Adherence (%)" />
                <MenuItem value="avgScheduleAdherence" primaryText="Average Schedule Adherence (%)" />
              </SelectField>
              {chartSubtitle}
            </div>
            <CardText>
              <div className="line-chart-container" style={{width: 600, height: 400, margin: "0 auto"}}>
                {lineChart}
              </div>
              {loading}
            </CardText>
            <CardText>
              <span><strong>Disclaimer:</strong></span>
              <p>Terms like 'Cars' and 'Trains' refer to those in active revenue service; cars and trains that are not explicitly labeled by WMATA as carrying passengers are not included in our data.</p>
              <p>We process the data we receive directly from WMATA and calculate our metrics about every 30 seconds. Because this data isn't perfect (and thus our processing of it can never be perfect), there may be some discrepancies, so while this is a useful tool for spotting trends and making comparisons, know that we nor WMATA can't make any guarantees about the data's integrity.</p>
              <p>For more information, check out <a href="/faq" target="_blank">our FAQ</a>.</p>
            </CardText>
          </Card>
        </div>
      </div>
    )
  }
});
