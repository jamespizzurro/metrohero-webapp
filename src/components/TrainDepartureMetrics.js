import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import _ from 'lodash';

import TrainDeparturesActions from '../actions/TrainDeparturesActions';
import TrainDeparturesStore from '../stores/TrainDeparturesStore';

import RefreshIndicator from 'material-ui/RefreshIndicator';
import {Card, CardHeader, CardText} from 'material-ui/Card';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDeparturesStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isLoadingMetrics: TrainDeparturesStore.get('isLoadingMetrics'),
      metricsError: TrainDeparturesStore.get('metricsError'),
      metricsData: TrainDeparturesStore.get('metricsData')
    };
  },

  _getMetricsHeaderColor(value) {
    // slightly modified version of AuditTrainIcon._getTrainColor
    const hue= ((1 - value) * 120).toString(10);
    return ["hsl(", hue, ",65%,75%)"].join("");
  },

  _buildMetricCard(title, color, percent, count) {
    return (
      <Card
        style={{display: 'inline-block', width: 200, margin: 4}}
      >
        <CardHeader
          title={title}
          style={{padding: 6, backgroundColor: color}}
          textStyle={{paddingRight: 0}}
          titleStyle={{color: 'rgba(0, 0, 0, 0.87)'}}
        />
        <CardText
          style={{paddingTop: 4, paddingBottom: 0}}
        >
          <div style={{fontSize: 36}}>{percent}%</div>
          <div>{count} departure{(count === 1) ? '' : 's'}</div>
        </CardText>
      </Card>
    );
  },

  render() {
    const {metricsData} = this.state;

    let metrics;
    if (metricsData) {
      const numObservedDepartures = metricsData.get('numObservedDepartures') || 0;
      const numScheduledDepartures = metricsData.get('numScheduledDepartures') || 0;
      const numMissedDepartures = metricsData.get('numMissedDepartures') || 0;
      const pctMissedDepartures = metricsData.get('pctMissedDepartures') || 0;
      const numUnscheduledDepartures = metricsData.get('numUnscheduledDepartures') || 0;
      const pctUnscheduledDepartures = metricsData.get('pctUnscheduledDepartures') || 0;
      const avgObservedTrainFrequency = metricsData.get('avgObservedTrainFrequency') || 0;
      const avgScheduledTrainFrequency = metricsData.get('avgScheduledTrainFrequency') || 0;
      const avgTrainFrequencyPercentVariance = metricsData.get('avgTrainFrequencyPercentVariance') || 0;
      const observedTrainFrequencyConsistency = metricsData.get('observedTrainFrequencyConsistency') || 0;
      const scheduledTrainFrequencyConsistency = metricsData.get('scheduledTrainFrequencyConsistency') || 0;
      const trainFrequencyConsistencyPercentVariance = metricsData.get('trainFrequencyConsistencyPercentVariance') || 0;
      const avgObservedPlatformWaitTime = metricsData.get('avgObservedPlatformWaitTime') || 0;
      const avgScheduledPlatformWaitTime = metricsData.get('avgScheduledPlatformWaitTime') || 0;
      const avgPlatformWaitTimePercentVariance = metricsData.get('avgPlatformWaitTimePercentVariance') || 0;
      const avgHeadwayDeviation = metricsData.get('avgHeadwayDeviation') || 0;
      const numOnTimeOrEarlyDeparturesByHeadwayAdherence = metricsData.get('numOnTimeOrEarlyDeparturesByHeadwayAdherence') || 0;
      const pctOnTimeOrEarlyDeparturesByHeadwayAdherence = metricsData.get('pctOnTimeOrEarlyDeparturesByHeadwayAdherence') || 0;
      const numLateDeparturesByHeadwayAdherence = metricsData.get('numLateDeparturesByHeadwayAdherence') || 0;
      const pctLateDeparturesByHeadwayAdherence = metricsData.get('pctLateDeparturesByHeadwayAdherence') || 0;
      const numVeryLateDeparturesByHeadwayAdherence = metricsData.get('numVeryLateDeparturesByHeadwayAdherence') || 0;
      const pctVeryLateDeparturesByHeadwayAdherence = metricsData.get('pctVeryLateDeparturesByHeadwayAdherence') || 0;
      const avgScheduleDeviation = metricsData.get('avgScheduleDeviation') || 0;
      const numOnTimeDeparturesByScheduleAdherence = metricsData.get('numOnTimeDeparturesByScheduleAdherence') || 0;
      const pctOnTimeDeparturesByScheduleAdherence = metricsData.get('pctOnTimeDeparturesByScheduleAdherence') || 0;
      const numOffScheduleDeparturesByScheduleAdherence = metricsData.get('numOffScheduleDeparturesByScheduleAdherence') || 0;
      const pctOffScheduleDeparturesByScheduleAdherence = metricsData.get('pctOffScheduleDeparturesByScheduleAdherence') || 0;
      const numVeryOffScheduleDeparturesByScheduleAdherence = metricsData.get('numVeryOffScheduleDeparturesByScheduleAdherence') || 0;
      const pctVeryOffScheduleDeparturesByScheduleAdherence = metricsData.get('pctVeryOffScheduleDeparturesByScheduleAdherence') || 0;

      metrics = (
        <div style={{color: this.context.muiTheme.palette.textColor}}>
          <div
            style={{
              marginTop: 16
            }}
          >
            <div><strong style={{fontSize: 20}}>{numObservedDepartures}</strong> observed train departure{(numObservedDepartures === 1) ? '' : 's'}; <span style={{color: 'rgb(205, 92, 92)'}}>{numUnscheduledDepartures} ({_.round(pctUnscheduledDepartures)}%) unscheduled</span></div>
            <div><strong>{numScheduledDepartures}</strong> scheduled train departure{(numScheduledDepartures === 1) ? '' : 's'}; <span style={{color: 'rgb(205, 92, 92)'}}>{numMissedDepartures} ({_.round(pctMissedDepartures)}%) missed</span></div>
          </div>

          <div
            style={{
              marginTop: 16,
              marginBottom: 8,
              fontSize: 14
            }}
          >
            <div>Trains departed stations on average every {_.round(avgObservedTrainFrequency, 2)} minutes ({_.round(avgScheduledTrainFrequency, 2)} expected; {_.round(Math.abs(avgTrainFrequencyPercentVariance))}% {(avgTrainFrequencyPercentVariance < 0) ? "better" : "worse"} than scheduled)</div>
            <div>Riders saw trains departing stations on average every {_.round(avgObservedPlatformWaitTime, 2)} minutes ({_.round(avgScheduledPlatformWaitTime, 2)} expected; {_.round(Math.abs(avgPlatformWaitTimePercentVariance))}% {(avgPlatformWaitTimePercentVariance < 0) ? "better" : "worse"} than scheduled)</div>
            <div>Train departure frequency varied by {_.round(observedTrainFrequencyConsistency, 2)} minutes ({_.round(scheduledTrainFrequencyConsistency, 2)} expected; {_.round(Math.abs(trainFrequencyConsistencyPercentVariance))}% {(trainFrequencyConsistencyPercentVariance < 0) ? "better" : "worse"} than scheduled)</div>
          </div>

          <div>
            <Card
              style={{
                display: 'inline-block',
                marginTop: 16,
                marginLeft: 8,
                marginRight: 8
              }}
            >
              <CardText>
                <div
                  style={{
                    marginBottom: 8
                  }}
                >
                  <div><strong>Headway Adherence</strong></div>
                  <div>average headway deviation: {_.round(Math.abs(avgHeadwayDeviation), 2)} minutes {(avgHeadwayDeviation >= 0) ? 'late' : 'early'}</div>
                </div>
                {this._buildMetricCard("On-time or early", this._getMetricsHeaderColor(0), _.round(pctOnTimeOrEarlyDeparturesByHeadwayAdherence), numOnTimeOrEarlyDeparturesByHeadwayAdherence)}
                {this._buildMetricCard("Late", this._getMetricsHeaderColor(0.5), _.round(pctLateDeparturesByHeadwayAdherence), numLateDeparturesByHeadwayAdherence)}
                {this._buildMetricCard("Very late", this._getMetricsHeaderColor(1), _.round(pctVeryLateDeparturesByHeadwayAdherence), numVeryLateDeparturesByHeadwayAdherence)}
              </CardText>
            </Card>

            <Card
              style={{
                display: 'inline-block',
                marginTop: 16,
                marginLeft: 8,
                marginRight: 8
              }}
            >
              <CardText>
                <div
                  style={{
                    marginBottom: 8
                  }}
                >
                  <div><strong>Schedule Adherence</strong></div>
                  <div>average schedule deviation: {_.round(Math.abs(avgScheduleDeviation), 2)} minutes {(avgScheduleDeviation >= 0) ? 'late' : 'early'}</div>
                </div>
                {this._buildMetricCard("On-time", this._getMetricsHeaderColor(0), _.round(pctOnTimeDeparturesByScheduleAdherence), numOnTimeDeparturesByScheduleAdherence)}
                {this._buildMetricCard("Off-schedule", this._getMetricsHeaderColor(0.5), _.round(pctOffScheduleDeparturesByScheduleAdherence), numOffScheduleDeparturesByScheduleAdherence)}
                {this._buildMetricCard("Very off-schedule", this._getMetricsHeaderColor(1), _.round(pctVeryOffScheduleDeparturesByScheduleAdherence), numVeryOffScheduleDeparturesByScheduleAdherence)}
              </CardText>
            </Card>
          </div>
        </div>
      );
    }

    let loadingIndicator;
    if (this.state.isLoadingMetrics) {
      loadingIndicator = (
        <div style={{position: 'absolute', width: '100%'}}>
          <RefreshIndicator
            size={40} top={8} left={0}
            status={'loading'}
            style={{display: 'inline-block', position: 'relative'}}
            />
        </div>
      );
    }

    return (
      <div style={{margin: '24px 0 12px', position: 'relative'}}>
        {loadingIndicator}
        {metrics}
      </div>
    );
  }
});
