import Reflux from 'reflux';
import request from 'superagent';
import ImmutableStoreMixin from 'reflux-immutable';
import {OrderedMap} from 'immutable';

import TrainDialogTagsActions from '../actions/TrainDialogTagsActions';
import NotificationActions from '../actions/NotificationActions';

import Utilities from '../utilities/Utilities';

export default Reflux.createStore({

  listenables: TrainDialogTagsActions,

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

  onGetTags(trainId) {
    if (!trainId) {
      return;
    }

    request
      .get('%BASE_URL%/train/' + trainId + '?userId=' + this._getUserId())
      .set({
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
      })
      .timeout(4000)
      .end((err, res) => {
        if (err) {
          TrainDialogTagsActions.getTags.failed(err);
        } else {
          TrainDialogTagsActions.getTags.completed(res.body);
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

  onTag(trainId, tagType) {
    if (!trainId || !tagType) {
      return;
    }

    request
      .post('%BASE_URL%/train/' + trainId + '/tag')
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
          TrainDialogTagsActions.tag.failed(trainId, err);
        } else {
          TrainDialogTagsActions.tag.completed(trainId, res.body);
        }
      });
  },

  onTagFailed(trainId, err) {
    NotificationActions.showNotification('danger', "Failed to tag train!<br/>Check your network connection.");

    this.setState({
      error: err
    });
  },

  onTagCompleted(trainId, data) {
    if (data && data.numTagsByType) {
      data.numTagsByType = OrderedMap(data.numTagsByType);
    }

    if (!data.userTaggedTypes || (this.get('data') && this.get('data').get('userTaggedTypes') && this.get('data').get('userTaggedTypes').size === data.userTaggedTypes.length)) {
      NotificationActions.showNotification('warning', "Failed to tag train!<br/>You have tagged trains too many times recently.<br/>Try again in a little bit.");
    }

    this.setState({
      error: null,
      data: data
    });
  },

  onUntag(trainId, tagType) {
    if (!trainId || !tagType) {
      return;
    }

    request
      .post('%BASE_URL%/train/' + trainId + '/untag')
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
          TrainDialogTagsActions.untag.failed(trainId, err);
        } else {
          TrainDialogTagsActions.untag.completed(res.body);
        }
      });
  },

  onUntagFailed(trainId, err) {
    NotificationActions.showNotification('danger', `Failed to untag train #${trainId}!<br/>Check your network connection.`);

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
