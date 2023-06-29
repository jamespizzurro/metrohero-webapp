import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';

import AppActions from '../actions/AppActions';
import Utilities from '../utilities/Utilities';

export default Reflux.createStore({

  listenables: AppActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      isDrawerOpen: false,
      playbackEnabled: false,
      isMobileDevice: Utilities.isMobileDevice(),
      isShowingAnySnackbar: false,
      isAppUpdateAvailable: false,
      defaultPage: Utilities.setDefaultPage()
    });
  },

  onUpdateState(obj) {
    this.setState(obj);
  }
});
