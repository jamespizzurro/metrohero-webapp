import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import ga from 'react-ga4';

import Utilities from '../utilities/Utilities';

import StationActions from '../actions/StationActions';
import StationStore from '../stores/StationStore';
import StationDialogActions from '../actions/StationDialogActions';
import StationDialogStore from '../stores/StationDialogStore';
import AppStore from '../stores/AppStore';

import MDSpinner from "react-md-spinner";
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {Tabs, Tab} from 'material-ui/Tabs';
import AlertError from 'material-ui/svg-icons/alert/error';
import AvShuffle from 'material-ui/svg-icons/av/shuffle';

import TrainDialog from './TrainDialog';
import StationDialogTrainList from './StationDialogTrainList';
import StationDialogAlerts from './StationDialogAlerts';
import StationDialogTags from './StationDialogTags';
import StationDialogOutages from './StationDialogOutages';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange'),
    Reflux.listenTo(StationDialogStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  propTypes: {
    stationName: PropTypes.string,
    onHide: PropTypes.func,
    switchedStationCode: PropTypes.string,
    onSwitchStationCode: PropTypes.func
  },

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  getStoreState() {
    return {
      stationCode: StationStore.get('stationCode'),
      showDialog: StationDialogStore.get('showDialog'),
      selectedTrainId: StationDialogStore.get('selectedTrainId'),
      isMobileDevice: AppStore.get('isMobileDevice'),
      isShowingAnySnackbar: AppStore.get('isShowingAnySnackbar')
    };
  },

  componentDidMount() {
    if (this.state.showDialog && this.state.stationCode) {
      // restored state
      StationActions.getStationInfo(this.state.stationCode);
      this.loader = setInterval(() => {
        StationActions.getStationInfo(this.state.stationCode);
      }, 5000);
    }
  },

  componentWillUnmount() {
    this.hide();
  },

  show(stationCode, tabValue) {
    if (this.state.isMobileDevice) {
      // SOURCE: https://stackoverflow.com/a/25665232/1072621
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this._interceptBackNavigation);
    }

    if (this.loader) {
      clearInterval(this.loader);
      this.loader = null;
      this.refs.actionBar.refs.tagsComponent.switchStationCode(stationCode);
    }
    if (!this.loader) {
      StationActions.getStationInfo(stationCode);
      this.loader = setInterval(() => {
        StationActions.getStationInfo(stationCode);
      }, 5000);
    }

    const newState = {
      showDialog: true
    };
    if (tabValue) {
      newState.tabValue = tabValue;
    }
    StationDialogActions.updateState(newState);
  },

  hide() {
    if (this.state.isMobileDevice) {
      window.removeEventListener('popstate', this._interceptBackNavigation);
    }

    if (this.loader) {
      clearInterval(this.loader);
      this.loader = null;
    }

    StationDialogActions.updateState({
      showDialog: false,
      tabValue: null,
      selectedTrainId: null
    });

    StationActions.clearStationInfo();

    if (this.props.onHide) {
      this.props.onHide();
    }
  },

  _interceptBackNavigation() {
    // if this modal is visible when the user presses the back button,
    // close this modal without navigating away from the page it's on
    if (this.state.showDialog) {
      this.hide();
      history.replaceState(null, null, document.URL);
    }
  },

  _onClickTrain(trainId) {
    ga.send(Utilities.getDataForModalView(window.location.pathname + "#" + this.state.stationCode + "#" + trainId));
    ga.event({
      category: 'Line Map',
      action: 'Displayed Train Modal',
      label: 'From Station'
    });

    StationDialogActions.updateState({
      selectedTrainId: trainId
    });
    this.refs.trainDialog.show();
  },

  _onTrainDialogHide() {
    StationDialogActions.updateState({
      selectedTrainId: null
    });
  },

  render() {
    if (!this.state.stationCode) {
      return false;
    }

    return (
      <div>
        <Dialog
          className="StationDialog"
          title={
            <StationDialogTitle
              stationName={this.props.stationName}
            />
          }
          actions={
            <StationDialogActionBar
              ref="actionBar"
              stationCode={this.state.stationCode}
              switchedStationCode={this.props.switchedStationCode}
              onSwitchStationCode={this.props.onSwitchStationCode}
              onHide={this.hide}
            />
          }
          modal={this.state.isMobileDevice}
          open={this.state.showDialog}
          onRequestClose={this.hide}
          autoScrollBodyContent
          contentStyle={{top: (this.state.isMobileDevice ? -80 : 'initial'), width: (this.state.isMobileDevice ? '100%' : '95%'), maxWidth: (this.state.isMobileDevice ? 'initial' : 450)}}
          repositionOnUpdate={!this.state.isMobileDevice}
          titleStyle={{borderBottom: 0}}
          bodyClassName="scrolling-dialog-body"
          bodyStyle={{borderTop: 0, padding: 0, color: this.context.muiTheme.palette.textColor, minHeight: (this.state.isMobileDevice ? (window.innerHeight - (this.state.isShowingAnySnackbar ? 150 : 106)) : 'initial')}}
        >
          <StationDialogBody
            stationCode={this.state.stationCode}
            stationName={this.props.stationName}
            isMobileDevice={this.state.isMobileDevice}
            onClickTrain={this._onClickTrain}
          />
        </Dialog>
        <TrainDialog
          ref="trainDialog"
          trainId={this.state.selectedTrainId}
          stationName={this.props.stationName}
          shouldRender={!!this.state.showDialog}
          storeName={'StationStore'}
          onHide={this._onTrainDialogHide}
        />
      </div>
    );
  }
});

const StationDialogTitle = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    stationName: PropTypes.string
  },

  getStoreState() {
    const isLoading = StationStore.get('isLoading') || !!StationStore.get('error');

    return {
      isLoading
    };
  },

  render() {
    let loadingContent;
    if (this.state.isLoading) {
      loadingContent = (
        <MDSpinner
          size={42}
          singleColor={this.context.muiTheme.palette.accent1Color}
          style={{position: 'absolute', top: 5, right: 4}}
        />
      );
    }

    return (
      <div className="station-dialog-title" style={{backgroundColor: this.context.muiTheme.palette.primary1Color, color: this.context.muiTheme.palette.alternateTextColor}}>
        <div className="station-dialog-title-primary" style={{color: this.context.muiTheme.palette.alternateTextColor}}>{this.props.stationName}</div>
        {loadingContent}
      </div>
    );
  }
});

const StationDialogActionBar = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin
  ],

  propTypes: {
    stationCode: PropTypes.string,
    switchedStationCode: PropTypes.string,
    onSwitchStationCode: PropTypes.func,
    onHide: PropTypes.func.isRequired
  },

  render() {
    let switchStationButton;
    if (this.props.switchedStationCode) {
      switchStationButton = (
        <FlatButton
          icon={<AvShuffle />}
          primary={false}
          keyboardFocused={false}
          onClick={this.props.onSwitchStationCode ? this.props.onSwitchStationCode : null}
          style={{minWidth: '36px', marginRight: '8px'}}
        />
      )
    }

    return (
      <div className="station-dialog-actions">
        <StationDialogTags ref="tagsComponent" stationCode={this.props.stationCode} />
        {switchStationButton}
        <FlatButton label="Close" primary={true} keyboardFocused={true} onClick={this.props.onHide} />
      </div>
    );
  }
});

const StationDialogBody = createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(StationStore, 'onStoreChange'),
    Reflux.listenTo(StationDialogStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  propTypes: {
    stationCode: PropTypes.string,
    stationName: PropTypes.string,
    isMobileDevice: PropTypes.bool.isRequired,
    onClickTrain: PropTypes.func.isRequired
  },

  getStoreState() {
    const crowdingStatus = StationStore.get('data') ? StationStore.get('data').get('crowdingStatus') : null;
    const tabValue = StationDialogStore.get('tabValue');

    const hasRailIncidents = StationStore.get('data') ? StationStore.get('data').get('railIncidents') ? StationStore.get('data').get('railIncidents').size > 0 : false : false;
    const hasTwitterProblems = StationStore.get('data') ? StationStore.get('data').get('tweetResponse') ? StationStore.get('data').get('tweetResponse').size > 0 : false : false;
    const hasElevatorOutages = StationStore.get('data') ? StationStore.get('data').get('elevatorOutages') ? StationStore.get('data').get('elevatorOutages').size > 0 : false : false;
    const hasEscalatorOutages = StationStore.get('data') ? StationStore.get('data').get('escalatorOutages') ? StationStore.get('data').get('escalatorOutages').size > 0 : false : false;

    return {
      crowdingStatus,
      tabValue,
      hasRailIncidents,
      hasTwitterProblems,
      hasElevatorOutages,
      hasEscalatorOutages
    };
  },

  componentDidMount() {
    this._resizeHack();
  },

  componentDidUpdate() {
    this._resizeHack();
  },

  _resizeHack() {
    if (!this.props.isMobileDevice) {
      // workaround, see: https://github.com/callemall/material-ui/issues/5793#issuecomment-301282845
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0);
    }
  },

  _handleTabChange(value) {
    StationDialogActions.updateState({
      tabValue: value || 'train-etas'
    });
  },

  render() {
    const tabContentHackedStyle = { // for older browsers
      display: 'block',
      margin: '0 auto',
      lineHeight: '38px'
    };

    let stationProblemsLabel;
    if (this.state.hasRailIncidents || this.state.hasTwitterProblems) {
      stationProblemsLabel = (<span style={tabContentHackedStyle}>Alerts&nbsp;<AlertError style={{width: 16, height: 16}} color="#ccc"/></span>);
    } else {
      stationProblemsLabel = (<span style={tabContentHackedStyle}>Alerts</span>);
    }

    let stationOutagesLabel;
    if (this.state.hasElevatorOutages || this.state.hasEscalatorOutages) {
      stationOutagesLabel = (<span style={tabContentHackedStyle}>Outages&nbsp;<AlertError style={{width: 16, height: 16}} color="#ccc"/></span>);
    } else {
      stationOutagesLabel = (<span style={tabContentHackedStyle}>Outages</span>);
    }

    return (
      <Tabs value={this.state.tabValue} onChange={this._handleTabChange} tabItemContainerStyle={{display: 'block', height: 38}}>
        <Tab label={<span style={tabContentHackedStyle}>Train ETAs</span>} value='train-etas' style={{height: 38}}>
          {this.state.crowdingStatus ?
            <div style={{marginTop: 8, marginBottom: 8, fontSize: 12, textAlign: 'center'}}>
              This station is <span style={{fontWeight: 500}}>{this.state.crowdingStatus}</span>.
              <br/>
              <span style={{fontSize: 10}}>(crowding data from Google)</span>
            </div> : null
          }
          <StationDialogTrainList
            onClickTrain={this.props.onClickTrain}
          />
        </Tab>
        <Tab label={stationProblemsLabel} value='station-problems' style={{height: 38}}>
          <StationDialogAlerts />
        </Tab>
        <Tab label={stationOutagesLabel} value='station-outages' style={{height: 38}}>
          <StationDialogOutages />
        </Tab>
      </Tabs>
    );
  }
});
