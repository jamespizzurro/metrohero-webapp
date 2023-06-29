import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';
import ls from 'local-storage';
import moment from 'moment';
import _ from 'lodash';

import StationDialogActions from '../actions/StationDialogActions';

import Utilities from '../utilities/Utilities';

export default Reflux.createStore({

  listenables: StationDialogActions,

  mixins: [
    ImmutableStoreMixin
  ],

  _defaultState: {
    showDialog: false,
    tabValue: null,
    selectedTrainId: null
  },

  _persistingStateKeys: [
    'showDialog',
    'tabValue',
    'selectedTrainId'
  ],

  init() {
    const now = moment();
    const lastActive = ls.get('lastActive');
    const shouldRestoreState = lastActive && (now.diff(lastActive, 'minutes') <= 2) && Utilities.isMobileDevice();
    if (shouldRestoreState) {
      const restoredState = {};
      for (let stateKey of this._persistingStateKeys) {
        const stateValue = ls.get('StationDialogStore.' + stateKey);
        if (stateValue) {
          restoredState[stateKey] = stateValue;
        }
      }
      this.setState(_.defaults(restoredState, this._defaultState));
    } else {
      this.setState(this._defaultState);
    }
  },

  onUpdateState(obj) {
    this.setState(obj);

    for (let stateKey of this._persistingStateKeys) {
      const stateValue = obj[stateKey];
      if (stateValue !== undefined) {
        ls.set('StationDialogStore.' + stateKey, stateValue);
      }
    }
  }
});
