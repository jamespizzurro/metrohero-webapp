import Reflux from 'reflux';
import request from 'superagent';
import ImmutableStoreMixin from 'reflux-immutable';
import _ from 'lodash';
import moment from 'moment';

import PerformanceSummaryActions from '../actions/PerformanceSummaryActions';

export default Reflux.createStore({

  listenables: PerformanceSummaryActions,

  mixins: [
    ImmutableStoreMixin
  ],

  defaultState: {
    isLoading: false,
    error: null,
    data: null,
    lastUpdated: null,
    filteredData: null,
    selectedStartDate: null,
    selectedEndDate: null,
    selectedServicePeriod: ['AM Rush', 'PM Rush'],
    selectedLineCodes: ['RD', 'OR', 'SV', 'BL', 'YL', 'GR'],
    pageSize: 25,
    currentPage: 1,
    totalNumPages: 1,
    byTimeOfDay: false,
    minDate: undefined,
    maxDate: undefined
  },

  _reset() {
    this.setState(this.defaultState);
  },

  _filterDataRow(row) {
    // filter data by selected filters

    if (!this.get('byTimeOfDay')) {
      if (this.get('selectedStartDate')) {
        const date = moment(row.date || row.get('date'), 'M/D/YY');  // data can either be in immutable form, or not
        const selectedStartDate = moment(this.get('selectedStartDate'), 'M/D/YY').startOf('day');
        if (date.isBefore(selectedStartDate)) {
          return false;
        }
      }

      if (this.get('selectedEndDate')) {
        const date = moment(row.date || row.get('date'), 'M/D/YY');  // data can either be in immutable form, or not
        const selectedEndDate = moment(this.get('selectedEndDate'), 'M/D/YY').endOf('day');
        if (date.isAfter(selectedEndDate)) {
          return false;
        }
      }
    }

    if (this.get('selectedServicePeriod') && this.get('selectedServicePeriod').size > 0) {
      const timeOfDay = row.timeOfDay || row.get('timeOfDay');  // data can either be in immutable form, or not
      if (!this.get('selectedServicePeriod').includes(timeOfDay)) {
        return false;
      }
    }

    if (this.get('selectedLineCodes') && this.get('selectedLineCodes').size > 0) {
      const lineCode = row.lineCode || row.get('lineCode'); // data can either be in immutable form, or not
      if (!this.get('selectedLineCodes').includes(lineCode)) {
        return false;
      }
    }

    return true;
  },

  _filterData(data) {
    if (data) {
      // data can either be in immutable form, or not
      if (data.length) {
        return _.filter(data, this._filterDataRow);
      } else {
        return data.filter(this._filterDataRow);
      }
    }
  },

  init() {
    this._reset();
  },

  onSetState(obj, callback) {
    this.setState(obj, callback);
  },

  onReset() {
    this._reset();
  },

  onGet() {
    this.setState({
      isLoading: true
    });

    request
      .post(this.get('byTimeOfDay') ? '%BASE_URL%/history/performance/byTimeOfDay' : '%BASE_URL%/history/performance')
      .query({
        fromUnixTimestamp: (this.get('byTimeOfDay') && this.get('selectedStartDate')) ? moment(this.get('selectedStartDate'), "M/D/YY").startOf('day').unix() : null,
        toUnixTimestamp: (this.get('byTimeOfDay') && this.get('selectedEndDate')) ? moment(this.get('selectedEndDate'), "M/D/YY").endOf('day').unix() : null
      })
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .end((err, res) => {
        if (err) {
          PerformanceSummaryActions.get.failed(err);
        } else {
          PerformanceSummaryActions.get.completed(res.body);
        }
      });
  },

  onGetFailed(err) {
    this.setState({
      isLoading: false,
      error: err,
      data: null
    });

    setTimeout(() => {
      PerformanceSummaryActions.get();
    }, 5000);
  },

  onGetCompleted(data) {
    const filteredData = this._filterData(data);
    const newState = {
      isLoading: false,
      error: null,
      data: data,
      lastUpdated: moment().toISOString(),
      filteredData: filteredData,
      currentPage: 1,
      totalNumPages: filteredData ? Math.max(Math.ceil(filteredData.length / this.get('pageSize')), 1) : 1
    };

    if (!this.get('byTimeOfDay')) {
      const minDateString = data[0]['date'];
      const maxDateString = data[data.length - 1]['date'];

      newState.minDate = (data && data.length > 0) ? moment(minDateString, 'M/D/YY').toDate() : undefined;
      newState.maxDate = (data && data.length > 0) ? moment(maxDateString, 'M/D/YY').toDate() : undefined;

      if (!this.get('selectedStartDate')) {
        newState.selectedStartDate = minDateString;
      }

      if (!this.get('selectedEndDate')) {
        newState.selectedEndDate = maxDateString;
      }
    }

    this.setState(newState);
  },

  onApplyFilters() {
    const filteredData = this._filterData(this.get('data'));
    this.setState({
      filteredData: filteredData,
      currentPage: 1,
      totalNumPages: filteredData ? Math.max(Math.ceil(filteredData.size / this.get('pageSize')), 1) : 1
    });
  }
});
