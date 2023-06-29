import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import TrainDialogTagsActions from '../actions/TrainDialogTagsActions';
import TrainDialogTagsStore from '../stores/TrainDialogTagsStore';

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
    trainId: PropTypes.string
  },

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(TrainDialogTagsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  UNSAFE_componentWillMount() {
    if (!this.loader) {
      TrainDialogTagsActions.getTags(this.props.trainId);
      this.loader = setInterval(() => {
        TrainDialogTagsActions.getTags(this.props.trainId);
      }, 5000);
    }
  },

  componentWillUnmount() {
    if (this.loader) {
      clearInterval(this.loader);
      this.loader = null;
    }

    TrainDialogTagsActions.clearState();
  },

  getStoreState() {
    return {
      data: TrainDialogTagsStore.get('data'),
      negativePopoverOpen: TrainDialogTagsStore.get('negativePopoverOpen'),
      negativePopoverAnchor: TrainDialogTagsStore.get('negativePopoverAnchor'),
      positivePopoverOpen: TrainDialogTagsStore.get('positivePopoverOpen'),
      positivePopoverAnchor: TrainDialogTagsStore.get('positivePopoverAnchor'),
      isMobileDevice: TrainDialogTagsStore.get('isMobileDevice')
    };
  },

  _tagTypeCodeToName(tagTypeCode) {
    let tagTypeName;

    if (tagTypeCode === "GOOD_OPERATOR") {
      tagTypeName = "Good Operator";
    } else if (tagTypeCode === "GOOD_RIDE") {
      tagTypeName = "Smooooth Ride";
    } else if (tagTypeCode === "NEW_TRAIN") {
      tagTypeName = "New Train!";
    } else if (tagTypeCode === "EMPTY") {
      tagTypeName = "(Mostly) Empty";
    } else if (tagTypeCode === "BAD_OPERATOR") {
      tagTypeName = "Bad Operator";
    } else if (tagTypeCode === "CROWDED") {
      tagTypeName = "Too Crowded";
    } else if (tagTypeCode === "UNCOMFORTABLE_TEMPS") {
      tagTypeName = "Too Hot/Cold";
    } else if (tagTypeCode === "RECENTLY_OFFLOADED") {
      tagTypeName = "Recently Offloaded";
    } else if (tagTypeCode === "UNCOMFORTABLE_RIDE") {
      tagTypeName = "Bumpy/Jerky Ride";
    } else if (tagTypeCode === "ISOLATED_CARS") {
      tagTypeName = "Isolated Cars";
    } else if (tagTypeCode === "WRONG_NUM_CARS") {
      tagTypeName = "Wrong # of Cars";
    } else if (tagTypeCode === "WRONG_DESTINATION") {
      tagTypeName = "Wrong Destination";
    } else if (tagTypeCode === "NEEDS_WORK") {
      tagTypeName = "Needs Cleaning/Work";
    } else if (tagTypeCode === "BROKEN_INTERCOM") {
      tagTypeName = "Broken Intercom";
    } else if (tagTypeCode === "DISRUPTIVE_PASSENGER") {
      tagTypeName = "Disruptive Passenger";
    }

    return tagTypeName;
  },

  _isTagPositive(tagTypeCode) {
    return (tagTypeCode === "GOOD_OPERATOR" || tagTypeCode === "GOOD_RIDE" || tagTypeCode === "NEW_TRAIN" || tagTypeCode === "EMPTY");
  },

  render() {
    if (!this.props.trainId) {
      return false;
    }

    const positiveTags = [];
    let didUserVotePositive = false;
    const negativeTags = [];
    let didUserVoteNegative = false;
    const trainId = this.props.trainId;
    const shouldEnable = trainId && this.state.data && this.state.data.get('numTagsByType');

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
            onClick={this.state.isMobileDevice ? (event => hasUserVote ? TrainDialogTagsActions.untag(trainId, tagType) : TrainDialogTagsActions.tag(trainId, tagType)) : null}
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
      <div className="TrainDialogTags">
        <div className="clickable" onClick={(event) => {event.preventDefault(); if (shouldEnable) {TrainDialogTagsActions.updateState({negativePopoverOpen: true, negativePopoverAnchor: event.currentTarget});}}}>
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
          onRequestClose={() => TrainDialogTagsActions.updateState({negativePopoverOpen: false})}
        >
          <Menu width={230}>
            {negativeTags}
          </Menu>
        </Popover>
        <span style={{display: 'inline-block', verticalAlign: 'super'}}>/</span>
        <div className="clickable" onClick={(event) => {event.preventDefault(); if (shouldEnable) {TrainDialogTagsActions.updateState({positivePopoverOpen: true, positivePopoverAnchor: event.currentTarget});}}}>
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
          onRequestClose={() => TrainDialogTagsActions.updateState({positivePopoverOpen: false})}
        >
          <Menu width={200}>
            {positiveTags}
          </Menu>
        </Popover>
      </div>
    );
  }
});
