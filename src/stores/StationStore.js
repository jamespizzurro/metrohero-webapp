import Reflux from 'reflux';
import request from 'superagent';
import ImmutableStoreMixin from 'reflux-immutable';
import ls from 'local-storage';
import moment from 'moment';
import _ from 'lodash';

import StationActions from '../actions/StationActions';

import Utilities from '../utilities/Utilities';

export default Reflux.createStore({

  listenables: StationActions,

  mixins: [
    ImmutableStoreMixin
  ],

  _defaultState: {
    isLoading: false,
    lastSuccessfulUpdate: null,
    error: null,
    data: null,
    stationCode: null
  },

  _persistingStateKeys: [
    'stationCode'
  ],

  init() {
    const now = moment();
    const lastActive = ls.get('lastActive');
    const shouldRestoreState = lastActive && (now.diff(lastActive, 'minutes') <= 2) && Utilities.isMobileDevice();
    if (shouldRestoreState) {
      const restoredState = {};
      for (let stateKey of this._persistingStateKeys) {
        const stateValue = ls.get('StationStore.' + stateKey);
        if (stateValue) {
          restoredState[stateKey] = stateValue;
        }
      }
      this.setState(_.defaults(restoredState, this._defaultState));
    } else {
      this.setState(this._defaultState);
    }
  },

  onGetStationInfo(stationCode) {
    if (!stationCode) {
      return;
    }

    this.setState({
      isLoading: true,
      stationCode: stationCode
    });
    ls.set('StationStore.stationCode', stationCode);

    request
      .get('%BASE_URL%/station/' + encodeURIComponent(stationCode) + '?id=null')
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(4000)
      .end((err, res) => {
        if (err) {
          StationActions.getStationInfo.failed(err);
        } else {
          StationActions.getStationInfo.completed(res.body);
        }
      });
  },

  onGetStationInfoFailed(err) {
    this.setState({
      error: err
    });

    setTimeout(() => {
      this.setState({
        isLoading: false
      });
    }, 1000);
  },

  onGetStationInfoCompleted(data) {
    this.setState({
      lastSuccessfulUpdate: moment().format("h:mm:ssa"),
      error: null,
      data: data
    });

    setTimeout(() => {
      this.setState({
        isLoading: false
      });
    }, 1000);
  },

  onClearStationInfo() {
    this.setState({
      isLoading: false,
      lastSuccessfulUpdate: null,
      error: null,
      data: null
    });
  }
});
