import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import SpeedRestrictionDialogActions from '../actions/SpeedRestrictionDialogActions';
import SpeedRestrictionDialogStore from '../stores/SpeedRestrictionDialogStore';
import AppStore from '../stores/AppStore';
import PredictionsStore from '../stores/PredictionsStore';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(SpeedRestrictionDialogStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    speedRestrictionId: PropTypes.number,
    onHide: PropTypes.func,
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return this._getStoreState(this.props.speedRestrictionId);
  },

  _getStoreState(speedRestrictionId) {
    const speedRestriction = this._getSpeedRestriction(speedRestrictionId);

    const fromStationName = speedRestriction ? speedRestriction.get('fromStationName') : null;
    const toStationName = speedRestriction ? speedRestriction.get('toStationName') : null;
    const trackNumber = speedRestriction ? speedRestriction.get('trackNumber') : null;
    const maximumSpeed = speedRestriction ? speedRestriction.get('maximumSpeed') : null;
    const description = speedRestriction ? speedRestriction.get('description') : null;
    const asOf = speedRestriction ? speedRestriction.get('asOf') : null;
    const source = speedRestriction ? speedRestriction.get('source') : null;

    return {
      showDialog: SpeedRestrictionDialogStore.get('showDialog'),
      isMobileDevice: AppStore.get('isMobileDevice'),
      fromStationName,
      toStationName,
      trackNumber,
      maximumSpeed,
      description,
      asOf,
      source
    };
  },

  _getSpeedRestriction(speedRestrictionId) {
    const speedRestrictions = PredictionsStore.get('data') ? PredictionsStore.get('data').get('speedRestrictions') : null;

    if (!speedRestrictions || !speedRestrictionId) {
      return null;
    }

    let selectedSpeedRestriction;

    speedRestrictions.forEach((speedRestriction, index) => {
      if (speedRestriction.get('id') === speedRestrictionId) {
        selectedSpeedRestriction = speedRestriction;
        return false;
      }
    });

    return selectedSpeedRestriction;
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.speedRestrictionId !== this.props.speedRestrictionId) {
      // using this.props.speedRestrictionId in getStoreState necessitates a manual state update when this.props.speedRestrictionId changes
      this.setState(this._getStoreState(nextProps.speedRestrictionId));
    }
  },

  componentWillUnmount() {
    this.hide();
  },

  show() {
    SpeedRestrictionDialogActions.updateState({
      showDialog: true
    });
  },

  hide() {
    SpeedRestrictionDialogActions.updateState({
      showDialog: false
    });

    if (this.props.onHide) {
      this.props.onHide();
    }
  },

  render() {
    if (!this.props.speedRestrictionId) {
      return false;
    }

    const style = {
      width: 32,
      height: 48,
      margin: '16px auto 0',
      borderRadius: 4,
      textAlign: 'center',
      border: `1px solid ${this.context.muiTheme.palette.textColor}`,
      color: this.context.muiTheme.palette.textColor,
      background: this.context.muiTheme.palette.canvasColor
    };

    let text = '';

    if (this.state.source) {
      text += `According to ${this.state.source}, `;
      if (this.state.asOf) {
        text += `as of ${this.state.asOf}, there's `;
      } else {
        text += 'there\'s ';
      }
    } else {
      if (this.state.asOf) {
        text += `As of ${this.state.asOf}, there's `;
      } else {
        text += 'There\'s ';
      }
    }

    if (this.state.maximumSpeed) {
      text += `a possible ${this.state.maximumSpeed} mph speed restriction `;
    } else {
      text += 'a possible speed restriction ';
    }

    if (this.state.toStationName) {
      text += `from ${this.state.fromStationName} to ${this.state.toStationName} `;
    } else {
      text += `at ${this.state.fromStationName} `;
    }

    text += `on track ${this.state.trackNumber} `;

    if (this.state.description) {
      text += this.state.description;
    }

    return (
      <Dialog
        actions={(
          <FlatButton label='Close' primary={true} keyboardFocused={true} onClick={this.hide} />
        )}
        modal={this.state.isMobileDevice}
        open={this.state.showDialog}
        onRequestClose={this.hide}
        autoScrollBodyContent
        contentStyle={{width: '95%', maxWidth: 450}}
        bodyClassName="scrolling-dialog-body"
        bodyStyle={{padding: 0, color: this.context.muiTheme.palette.textColor}}
      >
        <div>
          <div style={style}>
            <div style={{fontSize: '10px', fontWeight: 500, lineHeight: '11px', marginTop: '1px'}}>SPEED</div>
            <div style={{fontSize: '10px', fontWeight: 500, lineHeight: '11px'}}>LIMIT</div>
            <div style={{fontSize: '24px', fontWeight: 600, lineHeight: '24px'}}>{this.state.maximumSpeed ? this.state.maximumSpeed : '!'}</div>
          </div>
          <p style={{margin: 16}}>
            {text}
          </p>
        </div>
      </Dialog>
    );
  }
});
