import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import StationDialogTagsActions from '../actions/StationDialogTagsActions';
import StationDialogTagsStore from '../stores/StationDialogTagsStore';

import Avatar from 'material-ui/Avatar';
import ActionThumbUp from 'material-ui/svg-icons/action/thumb-up';
import ActionThumbDown from 'material-ui/svg-icons/action/thumb-down';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import {red200, red400, green200, green400} from 'material-ui/styles/colors';

export default createReactClass({

  propTypes: {
    stationCode: PropTypes.string
  },

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationDialogTagsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  UNSAFE_componentWillMount() {
    if (!this.loader) {
      StationDialogTagsActions.getTags(this.props.stationCode);
      this.loader = setInterval(() => {
        StationDialogTagsActions.getTags(this.props.stationCode);
      }, 5000);
    }
  },

  componentWillUnmount() {
    if (this.loader) {
      clearInterval(this.loader);
      this.loader = null;
    }

    StationDialogTagsActions.clearState();
  },

  switchStationCode(stationCode) {
    if (this.loader) {
      clearInterval(this.loader);
      this.loader = null;
    }
    if (!this.loader) {
      StationDialogTagsActions.getTags(stationCode);
      this.loader = setInterval(() => {
        StationDialogTagsActions.getTags(stationCode);
      }, 5000);
    }
  },

  getStoreState() {
    return {
      data: StationDialogTagsStore.get('data'),
      negativePopoverOpen: StationDialogTagsStore.get('negativePopoverOpen'),
      negativePopoverAnchor: StationDialogTagsStore.get('negativePopoverAnchor'),
      positivePopoverOpen: StationDialogTagsStore.get('positivePopoverOpen'),
      positivePopoverAnchor: StationDialogTagsStore.get('positivePopoverAnchor'),
      isMobileDevice: StationDialogTagsStore.get('isMobileDevice')
    };
  },

  _tagTypeCodeToName(tagTypeCode) {
    let tagTypeName;

    if (tagTypeCode === "EMPTY") {
      tagTypeName = "(Mostly) Empty";
    } else if (tagTypeCode === "FRIENDLY_OR_HELPFUL_STAFF") {
      tagTypeName = "Friendly/Helpful Staff";
    } else if (tagTypeCode === "AMPLE_SECURITY") {
      tagTypeName = "Ample Security";
    } else if (tagTypeCode === "FREE_MASKS_AVAILABLE") {
      tagTypeName = "Free Masks";
    } else if (tagTypeCode === "FREE_HAND_SANITIZER_AVAILABLE") {
      tagTypeName = "Free Hand Sanitizer";
    } else if (tagTypeCode === "CROWDED") {
      tagTypeName = "Too Crowded";
    } else if (tagTypeCode === "UNCOMFORTABLE_TEMPS") {
      tagTypeName = "Too Hot/Cold";
    } else if (tagTypeCode === "LONG_WAITING_TIME") {
      tagTypeName = "Loooong Waiting Time";
    } else if (tagTypeCode === "POSTED_TIMES_INACCURATE") {
      tagTypeName = "Posted Times Inaccurate";
    } else if (tagTypeCode === "NEEDS_WORK") {
      tagTypeName = "Needs Cleaning/Work";
    } else if (tagTypeCode === "BROKEN_ELEVATOR") {
      tagTypeName = "Broken Elevator";
    } else if (tagTypeCode === "BROKEN_ESCALATOR") {
      tagTypeName = "Broken Escalator";
    } else if (tagTypeCode === "UNFRIENDLY_OR_UNHELPFUL_STAFF") {
      tagTypeName = "Unfriendly/Unhelpful Staff";
    } else if (tagTypeCode === "SMOKE_OR_FIRE") {
      tagTypeName = "Smoke or Fire";
    } else if (tagTypeCode === "NO_FREE_MASKS") {
      tagTypeName = "No Free Masks";
    } else if (tagTypeCode === "NO_FREE_HAND_SANITIZER") {
      tagTypeName = "No Free Hand Sanitizer";
    }

    return tagTypeName;
  },

  _isTagPositive(tagTypeCode) {
    return (tagTypeCode === "EMPTY" || tagTypeCode === "FRIENDLY_OR_HELPFUL_STAFF" || tagTypeCode === "AMPLE_SECURITY" || tagTypeCode === "FREE_MASKS_AVAILABLE" || tagTypeCode === "FREE_HAND_SANITIZER_AVAILABLE");
  },

  render() {
    const positiveTags = [];
    let didUserVotePositive = false;
    const negativeTags = [];
    let didUserVoteNegative = false;
    const stationCode = this.props.stationCode;
    const shouldEnable = stationCode && this.state.data && this.state.data.get('numTagsByType');

    if (shouldEnable) {
      this.state.data.get('numTagsByType').forEach((numTags, tagType) => {
        const hasVote = (numTags > 0);
        const hasUserVote = (this.state.data.get('userTaggedTypes') && this.state.data.get('userTaggedTypes').contains(tagType));
        const rightIcon = (
          <Avatar size={24} style={{marginTop: 12}} color={'rgb(255, 255, 255)'} backgroundColor={hasUserVote ? this._isTagPositive(tagType) ? green400 : red400 : hasVote ? this._isTagPositive(tagType) ? green200 : red200 : this.context.muiTheme.palette.borderColor}>{numTags}</Avatar>
        );
        const tag = (
          <MenuItem
            key={tagType}
            primaryText={this._tagTypeCodeToName(tagType)}
            secondaryText={rightIcon}
            disabled={!this.state.isMobileDevice}
            onClick={this.state.isMobileDevice ? (event => hasUserVote ? StationDialogTagsActions.untag(stationCode, tagType) : StationDialogTagsActions.tag(stationCode, tagType)) : null}
          />
        );
        if (this._isTagPositive(tagType)) {
          positiveTags.push(tag);
          if (!didUserVotePositive && hasUserVote) {
            didUserVotePositive = true;
          }
        } else {
          negativeTags.push(tag);
          if (!didUserVoteNegative && hasUserVote) {
            didUserVoteNegative = true;
          }
        }
      });
    }

    const negativeTagsBadgeColor = this.state.data && this.state.data.get('numNegativeTags') > 0 ? didUserVoteNegative ? red400 : red200 : this.context.muiTheme.palette.borderColor;
    const positiveTagsBadgeColor = this.state.data && this.state.data.get('numPositiveTags') > 0 ? didUserVotePositive ? green400 : green200 : this.context.muiTheme.palette.borderColor;

    return (
      <div className="StationDialogTags">
        <div className="clickable" onClick={(event) => {event.preventDefault(); if (shouldEnable) {StationDialogTagsActions.updateState({negativePopoverOpen: true, negativePopoverAnchor: event.currentTarget});}}}>
          <div style={{
            fontWeight: 500,
            fontSize: 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            float: 'left',
            textAlign: 'center',
            color: 'rgb(255, 255, 255)',
            lineHeight: '24px',
            backgroundColor: negativeTagsBadgeColor
          }}>
            {this.state.data ? this.state.data.get('numNegativeTags') : ''}
          </div>
          <IconButton tooltipPosition="top-center" disabled={!this.state.data} style={{float: 'left', padding: 0, height: 24, marginLeft: -8}}>
            <ActionThumbDown />
          </IconButton>
        </div>
        <Popover
          animated={false}
          open={this.state.negativePopoverOpen}
          anchorEl={this.state.negativePopoverAnchor}
          anchorOrigin={{"horizontal":"middle", "vertical":"center"}}
          targetOrigin={{"horizontal":"left", "vertical":"bottom"}}
          onRequestClose={() => StationDialogTagsActions.updateState({negativePopoverOpen: false})}
        >
          <Menu width={230}>
            {negativeTags}
          </Menu>
        </Popover>
        <span style={{display: 'inline-block', verticalAlign: 'super'}}>/</span>
        <div className="clickable" onClick={(event) => {event.preventDefault(); if (shouldEnable) {StationDialogTagsActions.updateState({positivePopoverOpen: true, positivePopoverAnchor: event.currentTarget});}}}>
          <IconButton tooltipPosition="top-center" disabled={!this.state.data} style={{float: 'left', padding: 0, height: 24, marginRight: -8}}>
            <ActionThumbUp />
          </IconButton>
          <div style={{
            fontWeight: 500,
            fontSize: 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            float: 'left',
            textAlign: 'center',
            color: 'rgb(255, 255, 255)',
            lineHeight: '24px',
            backgroundColor: positiveTagsBadgeColor
          }}>
            {this.state.data ? this.state.data.get('numPositiveTags') : ''}
          </div>
        </div>
        <Popover
          animated={false}
          open={this.state.positivePopoverOpen}
          anchorEl={this.state.positivePopoverAnchor}
          anchorOrigin={{"horizontal":"middle", "vertical":"center"}}
          targetOrigin={{"horizontal":"left", "vertical":"bottom"}}
          onRequestClose={() => StationDialogTagsActions.updateState({positivePopoverOpen: false})}
        >
          <Menu width={200}>
            {positiveTags}
          </Menu>
        </Popover>
      </div>
    );
  }
});
