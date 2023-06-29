import Reflux from 'reflux';
import ImmutableStoreMixin from 'reflux-immutable';

import NotificationActions from '../actions/NotificationActions';

export default Reflux.createStore({

  listenables: NotificationActions,

  mixins: [
    ImmutableStoreMixin
  ],

  _defaultState: {
    _hideNotificationTimerId: null,

    shouldShowNotification: false,
    notificationType: '',
    notificationText: ''
  },

  _reset() {
    this.setState(this._defaultState);
  },

  init() {
    this._reset();
  },

  onShowNotification(notificationType, notificationText) {
    if (this.get('_hideNotificationTimerId')) {
      clearTimeout(this.get('_hideNotificationTimerId'));
    }

    this.setState({
      _hideNotificationTimerId: setTimeout(() => {
        this._reset();
      }, 5000),

      shouldShowNotification: true,
      notificationType,
      notificationText
    });
  }
});
