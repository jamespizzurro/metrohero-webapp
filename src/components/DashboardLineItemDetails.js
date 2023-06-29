import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import PredictionsStore from '../stores/PredictionsStore';

import ActionTrendingUp from 'material-ui/svg-icons/action/trending-up';
import ActionTrendingDown from 'material-ui/svg-icons/action/trending-down';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  propTypes: {
    lineCode: PropTypes.string.isRequired,
    directionNumber: PropTypes.string.isRequired,
    showDetails: PropTypes.bool.isRequired
  },

  getStoreState() {
    let averagePlatformWaitTime;
    let trainFrequencyStatus;
    let platformWaitTimeTrendStatus;
    let direction;
    let towardsStationName;
    let numTrains;
    let numEightCarTrains;
    let numDelayedTrains;
    let percentageTrainsDelayed;
    let medianTrainDelay;
    let averageMinimumHeadways;
    let averageTrainFrequency;
    let expectedTrainFrequency;
    let standardDeviationTrainFrequency;
    let expectedStandardDeviationTrainFrequency;
    let expectedPlatformWaitTime;
    let averageHeadwayAdherence;
    let averageScheduleAdherence;

    const destinationMetrics = (
      PredictionsStore.get('data') ?
        PredictionsStore.get('data').get('systemMetrics') ?
          PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine') ?
            PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine').get(this.props.lineCode) ?
              PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine').get(this.props.lineCode).get('directionMetricsByDirection') ?
                PredictionsStore.get('data').get('systemMetrics').get('lineMetricsByLine').get(this.props.lineCode).get('directionMetricsByDirection').get(this.props.directionNumber)
                : null
              : null
            : null
          : null
        : null
    );
    if (destinationMetrics) {
      averagePlatformWaitTime = destinationMetrics.get('averagePlatformWaitTime');
      trainFrequencyStatus = destinationMetrics.get('trainFrequencyStatus');
      platformWaitTimeTrendStatus = destinationMetrics.get('platformWaitTimeTrendStatus');
      direction = destinationMetrics.get('direction');
      towardsStationName = destinationMetrics.get('towardsStationName');
      numTrains = destinationMetrics.get('numTrains');
      numEightCarTrains = destinationMetrics.get('numEightCarTrains');
      numDelayedTrains = destinationMetrics.get('numDelayedTrains');
      percentageTrainsDelayed = destinationMetrics.get('percentageTrainsDelayed');
      medianTrainDelay = destinationMetrics.get('medianTrainDelay');
      averageMinimumHeadways = destinationMetrics.get('averageMinimumHeadways');
      averageTrainFrequency = destinationMetrics.get('averageTrainFrequency');
      expectedTrainFrequency = destinationMetrics.get('expectedTrainFrequency');
      standardDeviationTrainFrequency = destinationMetrics.get('standardDeviationTrainFrequency');
      expectedStandardDeviationTrainFrequency = destinationMetrics.get('expectedStandardDeviationTrainFrequency');
      expectedPlatformWaitTime = destinationMetrics.get('expectedPlatformWaitTime');
      averageHeadwayAdherence = destinationMetrics.get('averageHeadwayAdherence');
      averageScheduleAdherence = destinationMetrics.get('averageScheduleAdherence');
    }

    return {
      averagePlatformWaitTime,
      trainFrequencyStatus,
      platformWaitTimeTrendStatus,
      direction,
      towardsStationName,
      numTrains,
      numEightCarTrains,
      numDelayedTrains,
      percentageTrainsDelayed,
      medianTrainDelay,
      averageMinimumHeadways,
      averageTrainFrequency,
      expectedTrainFrequency,
      standardDeviationTrainFrequency,
      expectedStandardDeviationTrainFrequency,
      expectedPlatformWaitTime,
      averageHeadwayAdherence,
      averageScheduleAdherence
    };
  },

  render() {
    let content;
    if (!!this.props.showDetails) {
      let percentageEightCarTrains;
      if ((this.state.numEightCarTrains || this.state.numEightCarTrains === 0) && this.state.numTrains) {
        percentageEightCarTrains = Math.round((this.state.numEightCarTrains / this.state.numTrains) * 100);
      } else if (this.state.numTrains === 0) {
        percentageEightCarTrains = 0;
      } else {
        percentageEightCarTrains = '?';
      }

      let percentageDelayedTrains;
      if ((this.state.numDelayedTrains || this.state.numDelayedTrains === 0) && this.state.numTrains) {
        percentageDelayedTrains = Math.round((this.state.numDelayedTrains / this.state.numTrains) * 100);
      } else if (this.state.numTrains === 0) {
        percentageDelayedTrains = 0;
      } else {
        percentageDelayedTrains = '?';
      }

      content = (
        <div className="DashboardLineItemDetails">
          <div className="direction-text">
            <div className="direction-name">
              {this.state.direction}
              </div>
            <div className="destination-name">
              &nbsp;{`towards ${this.state.towardsStationName}`}
            </div>
          </div>
          <div className="destination-metric-description-column">
            <div className="destination-metric-description">
              active:
            </div>
            <div className="destination-metric-description">
              eight-car:
            </div>
            <div className="destination-metric-description">
              tardy:
            </div>
            <div className="destination-metric-description">
              tardiness:
            </div>
            <div className="destination-metric-description">
              avg hdwy:
            </div>
            <div className="destination-metric-description">
              avg freq:
            </div>
            <div className="destination-metric-description-detail">
              (expected
            </div>
            <div className="destination-metric-description">
              freq var:
            </div>
            <div className="destination-metric-description-detail">
              (expected
            </div>
            <div className="destination-metric-description">
              avg wait:
            </div>
            <div className="destination-metric-description-detail">
              (expected
            </div>
            <div className="destination-metric-description">
              headways:
            </div>
            <div className="destination-metric-description">
              schedule:
            </div>
          </div>
          <div className="destination-metric-value-column">
            <div className="destination-metric-value">
              {(this.state.numTrains || this.state.numTrains === 0) ? this.state.numTrains : 'N/A'}
            </div>
            <div className="destination-metric-value">
              {(this.state.numEightCarTrains || this.state.numEightCarTrains === 0) ? `${this.state.numEightCarTrains} (${percentageEightCarTrains}%)` : 'N/A'}
            </div>
            <div className="destination-metric-value">
              {(this.state.numDelayedTrains || this.state.numDelayedTrains === 0) ? `${this.state.numDelayedTrains} (${percentageDelayedTrains}%)` : 'N/A'}
            </div>
            <div className="destination-metric-value">
              {(this.state.medianTrainDelay || this.state.medianTrainDelay === 0) ? `${(Math.round(this.state.medianTrainDelay / 60.0) < 1) ? '<1' : Math.round(this.state.medianTrainDelay / 60.0)} mins` : 'N/A'}
            </div>
            <div className="destination-metric-value">
              {(this.state.averageMinimumHeadways || this.state.averageMinimumHeadways === 0) ? `${(Math.round(this.state.averageMinimumHeadways) < 1) ? '<1' : Math.round(this.state.averageMinimumHeadways)} mins` : 'N/A'}
            </div>
            <div className="destination-metric-value">
              {(this.state.averageTrainFrequency || this.state.averageTrainFrequency === 0) ? `${(Math.round(this.state.averageTrainFrequency) < 1) ? '<1' : Math.round(this.state.averageTrainFrequency)} mins` : 'N/A'}
            </div>
            <div className="destination-metric-value-detail">
              {(this.state.expectedTrainFrequency || this.state.expectedTrainFrequency === 0) ? `${(Math.round(this.state.expectedTrainFrequency) < 1) ? '<1' : Math.round(this.state.expectedTrainFrequency)} mins` : 'N/A'})
            </div>
            <div className="destination-metric-value">
              {(this.state.standardDeviationTrainFrequency || this.state.standardDeviationTrainFrequency === 0) ? `${(Math.round(this.state.standardDeviationTrainFrequency) < 1) ? '<1' : Math.round(this.state.standardDeviationTrainFrequency)} mins` : 'N/A'}
            </div>
            <div className="destination-metric-value-detail">
              {(this.state.expectedStandardDeviationTrainFrequency || this.state.expectedStandardDeviationTrainFrequency === 0) ? `${(Math.round(this.state.expectedStandardDeviationTrainFrequency) < 1) ? '<1' : Math.round(this.state.expectedStandardDeviationTrainFrequency)} mins` : 'N/A'})
            </div>
            <div className="destination-metric-value">
              {(this.state.averagePlatformWaitTime || this.state.averagePlatformWaitTime === 0) ? `${(Math.round(this.state.averagePlatformWaitTime) < 1) ? '<1' : Math.round(this.state.averagePlatformWaitTime)} mins` : 'N/A'}
            </div>
            <div className="destination-metric-value-detail">
              {(this.state.expectedPlatformWaitTime || this.state.expectedPlatformWaitTime === 0) ? `${(Math.round(this.state.expectedPlatformWaitTime) < 1) ? '<1' : Math.round(this.state.expectedPlatformWaitTime)} mins` : 'N/A'})
            </div>
            <div className="destination-metric-value">
              {(this.state.averageHeadwayAdherence || this.state.averageHeadwayAdherence === 0) ? `${Math.round(this.state.averageHeadwayAdherence)}%` : 'N/A'}
            </div>
            <div className="destination-metric-value">
              {(this.state.averageScheduleAdherence || this.state.averageScheduleAdherence === 0) ? `${Math.round(this.state.averageScheduleAdherence)}%` : 'N/A'}
            </div>
          </div>
        </div>
      );
    } else {
      const averageTrainFrequency = Math.round(this.state.averageTrainFrequency);
      const waitTimeStatus = (averageTrainFrequency || averageTrainFrequency === 0) ? (averageTrainFrequency !== 0 ? (averageTrainFrequency + ' minute' + (averageTrainFrequency !== 1 ? 's' : '')) : '<1 minute') : 'N/A';
      const waitTimeStatusClassName = (this.state.trainFrequencyStatus && waitTimeStatus !== 'N/A') ? this.state.trainFrequencyStatus.toLowerCase() : 'unknown';

      let platformWaitTimeTrendStatusComponent;
      if (this.state.platformWaitTimeTrendStatus === 'INCREASING') {
        platformWaitTimeTrendStatusComponent = <ActionTrendingUp color={'#fff'} style={{width: 16, height: 16}} />;
      } else if (this.state.platformWaitTimeTrendStatus === 'DECREASING') {
        platformWaitTimeTrendStatusComponent = <ActionTrendingDown color={'#fff'} style={{width: 16, height: 16}} />;
      }
      if (platformWaitTimeTrendStatusComponent) {
        platformWaitTimeTrendStatusComponent = (
          <div className="destination-trend">
            {platformWaitTimeTrendStatusComponent}
            <div className={'fadingEffect ' + waitTimeStatusClassName} />
          </div>
        );
      }

      content = (
        <div className='DashboardLineItemDetailsMini'>
          <div className="direction-text">
            <div className="direction-name">
              {this.state.direction}
            </div>
            <div className="destination-name">
              {`towards ${this.state.towardsStationName}`}
            </div>
          </div>
          <div style={{display: 'inline-block', width: '42%', textAlign: 'right'}}>
            <div className={'destination-health ' + waitTimeStatusClassName}>
              {platformWaitTimeTrendStatusComponent}
              {waitTimeStatus}
            </div>
          </div>
        </div>
      );
    }

    return content;
  }
});
