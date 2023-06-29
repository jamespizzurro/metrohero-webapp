import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';
import ls from 'local-storage';

import DashboardActions from '../actions/DashboardActions';

export default Reflux.createStore({

  listenables: DashboardActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({});
  },

  onSetState(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        ls.set(key, obj[key].toString().toLowerCase());
      }
    }

    this.setState(obj);
  }
});
