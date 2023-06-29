import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import AppStore from '../stores/AppStore';

import MDSpinner from "react-md-spinner";
import FloatingActionButton from 'material-ui/FloatingActionButton';
import DeviceGpsFixed from 'material-ui/svg-icons/device/gps-fixed';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    baseBottomPosition: PropTypes.number.isRequired,
    shouldAutoPress: PropTypes.bool,
    onGetCurrentPositionSuccess: PropTypes.func,
    onGetCurrentPositionFailed: PropTypes.func,
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isShowingAnySnackbar: AppStore.get('isShowingAnySnackbar')
    };
  },

  getInitialState() {
    return {
      isLoading: false
    };
  },

  componentDidMount() {
    if (this.props.shouldAutoPress) {
      this._getCurrentPosition();
    }
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if ((nextProps.shouldAutoPress !== this.props.shouldAutoPress) && nextProps.shouldAutoPress) {
      this._getCurrentPosition();
    }
  },

  _getCurrentPosition() {
    if (navigator.geolocation) {
      this.setState({
        isLoading: true
      });

      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          isLoading: false
        });
        if (this.props.onGetCurrentPositionSuccess) {
          this.props.onGetCurrentPositionSuccess(position);
        }
      }, (positionError) => {
        this.setState({
          isLoading: false
        });
        if (this.props.onGetCurrentPositionFailed) {
          this.props.onGetCurrentPositionFailed(positionError);
        }
      }, {
        enableHighAccuracy: false,
        timeout: 3000 /* 3 seconds */,
        maximumAge: 60000 /* 1 minute */
      });
    }
  },

  render() {
    let loadingSpinner;
    if (this.state.isLoading) {
      loadingSpinner = (
        <MDSpinner
          size={40}
          singleColor={this.context.muiTheme.palette.accent1Color}
          style={{position: 'absolute', left: 0}}
        />
      );
    }

    const bottom = this.props.baseBottomPosition + (this.state.isShowingAnySnackbar ? 60 : 16);

    return (
      <FloatingActionButton
        mini={true}
        style={{position: 'fixed', bottom: bottom, right: 16, zIndex: 2}}
        onClick={this._getCurrentPosition}
        disabled={this.state.isLoading}
      >
        <DeviceGpsFixed />
        {loadingSpinner}
      </FloatingActionButton>
    );
  }
});
