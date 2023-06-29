import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import NotificationStore from '../stores/NotificationStore';

import {Tooltip} from 'react-tippy';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(NotificationStore, 'onStoreChange')
  ],

  getStoreState() {
    return {
      shouldShowNotification: NotificationStore.get('shouldShowNotification'),
      notificationType: NotificationStore.get('notificationType'),
      notificationText: NotificationStore.get('notificationText')
    };
  },

  render() {
    return (
      <Tooltip
        title={this.state.notificationText}
        position="top"
        open={this.state.shouldShowNotification}
        animateFill={false}
        distance={6}
        theme={this.state.notificationType}
        style={{
          position: 'relative',
          left: '50%'
        }}
      >
      </Tooltip>
    );
  }
});
