import Reflux from 'reflux';
import request from 'superagent';
import ImmutableStoreMixin from 'reflux-immutable';

import AuditActions from '../actions/AuditActions';

export default Reflux.createStore({

  listenables: AuditActions,

  mixins: [
    ImmutableStoreMixin
  ],

  _defaultState: {
    isLoading: false,
    error: null,
    data: null,

    selectedDepartureStationCode: null,
    selectedLineCode: null,
    selectedDirectionNumber: null,
    selectedDestinationStationCode: null,
    selectedMetric: 'headwayDeviation',

    _refreshIntervalTimerId: null
  },

  init() {
    this.onResetState();
  },

  onSetState(obj) {
    this.setState(obj);
  },

  onResetState() {
    let _refreshIntervalTimerId = this.get('_refreshIntervalTimerId');
    if (_refreshIntervalTimerId) {
      clearInterval(_refreshIntervalTimerId);
    }

    this.setState(this._defaultState);
  },

  getData(params) {
    let _refreshIntervalTimerId;
    if (params) {
      // new params; invalidate any other pending network requests
      clearInterval(this.get('_refreshIntervalTimerId'));
      _refreshIntervalTimerId = setInterval(this.getData, 30000);
    } else {
      _refreshIntervalTimerId = this.get('_refreshIntervalTimerId');
    }

    const data = params ? null : this.get('data');
    const error = params ? null : this.get('error');
    const selectedDepartureStationCode = (params && params.selectedDepartureStationCode !== undefined) ? params.selectedDepartureStationCode : this.get('selectedDepartureStationCode');
    const selectedLineCode = (params && params.selectedLineCode !== undefined) ? params.selectedLineCode : this.get('selectedLineCode');
    const selectedDirectionNumber = (params && params.selectedDirectionNumber !== undefined) ? params.selectedDirectionNumber : this.get('selectedDirectionNumber');
    const selectedDestinationStationCode = (params && params.selectedDestinationStationCode !== undefined) ? params.selectedDestinationStationCode : this.get('selectedDestinationStationCode');
    const selectedMetric = (params && params.selectedMetric !== undefined) ? params.selectedMetric : this.get('selectedMetric');

    this.setState({
      isLoading: true,
      data,
      error,
      selectedDepartureStationCode,
      selectedLineCode,
      selectedDirectionNumber,
      selectedDestinationStationCode,
      selectedMetric,
      _refreshIntervalTimerId
    });

    request
      .get(`%BASE_URL%/departuresByLine`)
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .query({
        departureStationCode: selectedDepartureStationCode,
        lineCode: selectedLineCode,
        directionNumber: selectedDirectionNumber,
        destinationStationCode: selectedDestinationStationCode
      })
      .timeout(5000)
      .end((err, res) => {
        if (err) {
          AuditActions.getData.failed(err, _refreshIntervalTimerId);
        } else {
          AuditActions.getData.completed(res.body, _refreshIntervalTimerId);
        }
      });
  },

  getDataFailed(err, _refreshIntervalTimerId) {
    if (this.get('_refreshIntervalTimerId') !== _refreshIntervalTimerId) {
      // some other network request has interrupted this one
      clearInterval(_refreshIntervalTimerId);
      return;
    }

    this.setState({
      isLoading: false,
      error: err
    });
  },

  getDataCompleted(data, _refreshIntervalTimerId) {
    if (this.get('_refreshIntervalTimerId') !== _refreshIntervalTimerId) {
      // some other network request has interrupted this one
      clearInterval(_refreshIntervalTimerId);
      return;
    }

    this.setState({
      isLoading: false,
      error: null,
      data: data
    });
  }
});
