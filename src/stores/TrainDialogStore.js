import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';
import ls from 'local-storage';
import moment from 'moment';
import _ from 'lodash';

import TrainDialogActions from '../actions/TrainDialogActions';

import Utilities from '../utilities/Utilities';

export default Reflux.createStore({

  listenables: TrainDialogActions,

  mixins: [
    ImmutableStoreMixin
  ],

  _defaultState: {
    showDialog: false,
    tabValue: null
  },

  _persistingStateKeys: [
    'showDialog',
    'tabValue'
  ],

  init() {
    const now = moment();
    const lastActive = ls.get('lastActive');
    const shouldRestoreState = lastActive && (now.diff(lastActive, 'minutes') <= 2) && Utilities.isMobileDevice();
    if (shouldRestoreState) {
      const restoredState = {};
      for (let stateKey of this._persistingStateKeys) {
        const stateValue = ls.get('TrainDialogStore.' + stateKey);
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
        ls.set('TrainDialogStore.' + stateKey, stateValue);
      }
    }
  }
});
