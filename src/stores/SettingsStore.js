import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';
import ls from 'local-storage';

import SettingsActions from '../actions/SettingsActions';
import Utilities from "../utilities/Utilities";

export default Reflux.createStore({

  listenables: SettingsActions,

  mixins: [
    ImmutableStoreMixin
  ],

  _isDarkMode() {
    let isDarkMode = ls.get('isDarkMode');
    if (!isDarkMode) {
      ls.set('isDarkMode', 'false');
      isDarkMode = ls.get('isDarkMode');
      if (!isDarkMode) {
        isDarkMode = 'false';
      }
    }
    return (isDarkMode === 'true');
  },

  _isPersonalized() {
    let isPersonalized = ls.get('isPersonalized');
    if (!isPersonalized) {
      ls.set('isPersonalized', 'true');
      isPersonalized = ls.get('isPersonalized');
      if (!isPersonalized) {
        isPersonalized = 'true';
      }
    }
    return (isPersonalized === 'true');
  },

  _isNerdMode() {
    let isNerdMode = ls.get('isNerdMode');
    if (!isNerdMode) {
      ls.set('isNerdMode', 'false');
      isNerdMode = ls.get('isNerdMode');
      if (!isNerdMode) {
        isNerdMode = 'false';
      }
    }
    return (isNerdMode === 'true');
  },

  init() {
    this.setState({
      isDarkMode: this._isDarkMode(),
      isPersonalized: this._isPersonalized(),
      isNerdMode: this._isNerdMode(),
      defaultPage: Utilities.setDefaultPage()
    });
  },

  onUpdateState(obj) {
    if (obj.isDarkMode !== this.state.isDarkMode) {
      ls.set('isDarkMode', (obj.isDarkMode === true) ? 'true' : 'false');
    }

    if (obj.isPersonalized !== this.state.isPersonalized) {
      ls.set('isPersonalized', (obj.isPersonalized === true) ? 'true' : 'false');
    }

    if (obj.isNerdMode !== this.state.isNerdMode) {
      ls.set('isNerdMode', (obj.isNerdMode === true) ? 'true' : 'false');
    }

    if (obj.defaultPage !== this.state.defaultPage) {
      ls.set('defaultPage', obj.defaultPage);
    }

    this.setState(obj);
  }
});
