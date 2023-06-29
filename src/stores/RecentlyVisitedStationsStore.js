import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';

import RecentlyVisitedStationsActions from '../actions/RecentlyVisitedStationsActions';

export default Reflux.createStore({

  listenables: RecentlyVisitedStationsActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      shouldShowMoreStations: false
    });
  },

  onUpdateState(obj) {
    this.setState(obj);
  }
});
