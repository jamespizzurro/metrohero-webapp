import Reflux from 'reflux';
import request from 'superagent';
import ImmutableStoreMixin from 'reflux-immutable';
import {OrderedMap} from 'immutable';

import StationDialogTagsActions from '../actions/StationDialogTagsActions';
import NotificationActions from '../actions/NotificationActions';

import Utilities from '../utilities/Utilities';

export default Reflux.createStore({

  listenables: StationDialogTagsActions,

  mixins: [
    ImmutableStoreMixin
  ],

  init() {
    this.setState({
      error: null,
      data: null,
      negativePopoverOpen: false,
      negativePopoverAnchor: null,
      positivePopoverOpen: false,
      positivePopoverAnchor: null,
      isMobileDevice: Utilities.isMobileDevice()
    });
  },

  _getUserId() {
    return Utilities.getUserId() || 'null';
  },

  onUpdateState(obj) {
    this.setState(obj);
  },

  onClearState() {
    this.setState({
      error: null,
      data: null,
      negativePopoverOpen: false,
      negativePopoverAnchor: null,
      positivePopoverOpen: false,
      positivePopoverAnchor: null
    });
  },

  onGetTags(stationCode) {
    if (!stationCode) {
      return;
    }

    request
      .get('%BASE_URL%/station/' + stationCode + '/tags?userId=' + this._getUserId())
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(4000)
      .end((err, res) => {
        if (err) {
          StationDialogTagsActions.getTags.failed(err);
        } else {
          StationDialogTagsActions.getTags.completed(res.body);
        }
      });
  },

  onGetTagsFailed(err) {
    this.setState({
      error: err
    });
  },

  onGetTagsCompleted(data) {
    if (data && data.numTagsByType) {
      data.numTagsByType = OrderedMap(data.numTagsByType);
    }

    this.setState({
      error: null,
      data: data
    });
  },

  onTag(stationCode, tagType) {
    if (!stationCode || !tagType) {
      return;
    }

    request
      .post('%BASE_URL%/station/' + stationCode + '/tag')
      .query({
        userId: this._getUserId(),
        tagType: tagType
      })
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(5000)
      .end((err, res) => {
        if (err) {
          StationDialogTagsActions.tag.failed(err);
        } else {
          StationDialogTagsActions.tag.completed(res.body);
        }
      });
  },

  onTagFailed(err) {
    NotificationActions.showNotification('danger', `Failed to tag station!<br/>Check your network connection.`);

    this.setState({
      error: err
    });
  },

  onTagCompleted(data) {
    if (data && data.numTagsByType) {
      data.numTagsByType = OrderedMap(data.numTagsByType);
    }

    if (!data.userTaggedTypes || (this.get('data') && this.get('data').get('userTaggedTypes') && this.get('data').get('userTaggedTypes').size === data.userTaggedTypes.length)) {
      NotificationActions.showNotification('warning', `Failed to tag station!<br/>You have tagged stations too many times recently.<br/>Try again in a little bit.`);
    }

    this.setState({
      error: null,
      data: data
    });
  },

  onUntag(stationCode, tagType) {
    if (!stationCode || !tagType) {
      return;
    }

    request
      .post('%BASE_URL%/station/' + stationCode + '/untag')
      .query({
        userId: this._getUserId(),
        tagType: tagType
      })
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(5000)
      .end((err, res) => {
        if (err) {
          StationDialogTagsActions.untag.failed(err);
        } else {
          StationDialogTagsActions.untag.completed(res.body);
        }
      });
  },

  onUntagFailed(err) {
    NotificationActions.showNotification('danger', `Failed to untag station!<br/>Check your network connection.`);

    this.setState({
      error: err
    });
  },

  onUntagCompleted(data) {
    if (data && data.numTagsByType) {
      data.numTagsByType = OrderedMap(data.numTagsByType);
    }

    this.setState({
      error: null,
      data: data
    });
  }
});
