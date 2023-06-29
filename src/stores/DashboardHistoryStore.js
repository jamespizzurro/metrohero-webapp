import Reflux from 'reflux';
import request from 'superagent';
import moment from 'moment';
import ImmutableStoreMixin from 'reflux-immutable';

import DashboardHistoryActions from '../actions/DashboardHistoryActions';

export default Reflux.createStore({

  listenables: DashboardHistoryActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      isLoading: false,
      error: null,
      results: null,
      params: {
        interval: Math.max(Math.ceil(((moment().unix() - moment().startOf('day').unix()) / 60) / 120), 1), // in minutes
        observedDateTimestampMin: moment().startOf('day').unix(),
        observedDateTimestampMax: moment().unix()
      },
      currentLineCode: 'ALL',
      currentMetric: "avgHeadwayAdherence"
    });
  },

  onGet(newParams) {
    const newState = {
      isLoading: true
    };
    if (newParams) {
      newState.params = this.get('params').merge(newParams);
    }
    this.setState(newState);

    request
      .post('%BASE_URL%/history/dashboard')
      .query(this.get('params').toJS())
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .end(function(err, res) {
        if (err) {
          DashboardHistoryActions.get.failed(err);
        } else {
          DashboardHistoryActions.get.completed(res.body);
        }
      });
  },

  onGetFailed(err) {
    setTimeout(() => {
      this.setState({
        isLoading: false,
        error: err,
        results: null
      });
    }, 500);
  },

  onGetCompleted(results) {
    setTimeout(() => {
      this.setState({
        isLoading: false,
        error: null,
        results: results
      });
    }, 500);
  },

  onUpdateParams(newParams) {
    DashboardHistoryActions.get(newParams);
  },

  onUpdateState(obj) {
    this.setState(obj);
  },

  onClear() {
    this.setState({
      results: null
    });
  }
});
