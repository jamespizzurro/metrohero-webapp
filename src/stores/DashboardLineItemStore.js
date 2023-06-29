import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';

import DashboardLineItemActions from '../actions/DashboardLineItemActions';

export default Reflux.createStore({

  listenables: DashboardLineItemActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      showDetails: []
    });
  },

  onUpdateState(obj) {
    this.setState(obj);
  }
});
