import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';

import SpeedRestrictionDialogActions from '../actions/SpeedRestrictionDialogActions';

export default Reflux.createStore({

  listenables: SpeedRestrictionDialogActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      showDialog: false
    });
  },

  onUpdateState(obj) {
    this.setState(obj);
  }
});
