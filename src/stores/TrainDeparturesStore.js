import Reflux from 'reflux';
import request from 'superagent';
import moment from 'moment';
import ImmutableStoreMixin from 'reflux-immutable';

import TrainDeparturesActions from '../actions/TrainDeparturesActions';

export default Reflux.createStore({

  listenables: TrainDeparturesActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      isDirty: false,
      isLoadingMetrics: false,
      isLoadingTable: false,
      metricsError: null,
      tableError: null,
      metricsData: null,
      tableData: null,
      totalNumTableResults: 0,
      params: {
        fromDateUnixTimestamp: moment().startOf('day').unix(),
        toDateUnixTimestamp: moment().endOf('day').unix(),
        departureStationCode: null,
        lineCode: null,
        directionNumber: null,
        sortByColumn: null,
        sortByOrder: null,
        maxResultCount: 25,
        resultCountOffset: 0
      },
      firstDepartureTime: null,
      lastUpdated: null
    });
  },

  onUpdateParams(params) {
    this.setState({
      isDirty: true,
      params: this.get('params').merge(params)
    });
  },

  onGetFirstDepartureTime() {
    request
      .get('%BASE_URL%/api/trainDepartures/earliestDepartureTime')
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(5000)
      .end(function(err, res) {
        if (err) {
          TrainDeparturesActions.getFirstDepartureTime.failed(err);
        } else {
          TrainDeparturesActions.getFirstDepartureTime.completed(res.body);
        }
      });
  },

  onGetFirstDepartureTimeFailed(err) {

  },

  onGetFirstDepartureTimeCompleted(data) {
    this.setState({
      firstDepartureTime: data
    });
  },

  onGetTrainDepartureMetrics() {
    this.setState({
      isLoadingMetrics: true
    });

    request
      .get('%BASE_URL%/api/trainDepartures/metrics')
      .query(this.get('params').toJS())
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(5000)
      .end(function(err, res) {
        if (err) {
          TrainDeparturesActions.getTrainDepartureMetrics.failed(err);
        } else {
          TrainDeparturesActions.getTrainDepartureMetrics.completed(res.body);
        }
      });
  },

  onGetTrainDepartureMetricsFailed(err) {
    this.setState({
      isLoadingMetrics: false,
      metricsError: err
    });
  },

  onGetTrainDepartureMetricsCompleted(data) {
    this.setState({
      isLoadingMetrics: false,
      isDirty: false,
      metricsError: null,
      metricsData: data,
      lastUpdated: moment().toISOString()
    });
  },

  onGetTrainDepartures() {
    this.setState({
      isLoadingTable: true
    });

    request
      .get('%BASE_URL%/api/trainDepartures')
      .query(this.get('params').toJS())
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(5000)
      .end(function(err, res) {
        if (err) {
          TrainDeparturesActions.getTrainDepartures.failed(err);
        } else {
          TrainDeparturesActions.getTrainDepartures.completed(res.body);
        }
      });
  },

  onGetTrainDeparturesFailed(err) {
    this.setState({
      isLoadingTable: false,
      tableError: err
    });
  },

  onGetTrainDeparturesCompleted(data) {
    this.setState({
      isLoadingTable: false,
      isDirty: false,
      tableError: null,
      tableData: data.trainDepartures,
      totalNumTableResults: data.totalNumTrainDepartures
    });
  }
});
