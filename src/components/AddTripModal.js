import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import AddSavedTripActions from '../actions/AddSavedTripActions';
import AddSavedTripStore from "../stores/AddSavedTripStore";
import AppStore from '../stores/AppStore';

import MDSpinner from "react-md-spinner";
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import SelectField from "material-ui/SelectField";
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import SavedTrip from "./SavedTrip";
import ARIESSavedTrip from "./ARIESSavedTrip";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(AddSavedTripStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired
  },

  getStoreState() {
    return {
      isMobileDevice: AppStore.get('isMobileDevice'),
      isShowingAnySnackbar: AppStore.get('isShowingAnySnackbar'),
      showDialog: AddSavedTripStore.get('showDialog'),
      stationNameCodeMap: AddSavedTripStore.get('stationNameCodeMap'),
      selectedSystemName: AddSavedTripStore.get('selectedSystemName'),
      selectedFromStationCode: AddSavedTripStore.get('selectedFromStationCode'),
      selectedToStationCode: AddSavedTripStore.get('selectedToStationCode'),
      isSavedTripLoading: AddSavedTripStore.get('isSavedTripLoading'),
      isAddingSavedTrip: AddSavedTripStore.get('isAddingSavedTrip'),
      savedTrip: AddSavedTripStore.get('savedTrip')
    };
  },

  componentWillUnmount() {
    this.hide();
  },

  show() {
    if (this.state.isMobileDevice) {
      // SOURCE: https://stackoverflow.com/a/25665232/1072621
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this._interceptBackNavigation);
    }

    AddSavedTripActions.updateState({
      showDialog: true
    });
  },

  hide() {
    if (this.state.isMobileDevice) {
      window.removeEventListener('popstate', this._interceptBackNavigation);
    }

    AddSavedTripActions.updateState({
      showDialog: false,
      selectedSystemName: 'Metrorail',
      selectedFromStationCode: null,
      selectedToStationCode: null,
      savedTrip: null,
      isSavedTripLoading: false,
      isAddingSavedTrip: false
    });
  },

  _interceptBackNavigation() {
    // if this modal is visible when the user presses the back button,
    // close this modal without navigating away from the page it's on
    if (this.state.showDialog) {
      this.hide();
      history.replaceState(null, null, document.URL);
    }
  },

  render() {
    let preview;
    if (this.state.savedTrip) {
      if (this.state.selectedSystemName === 'Metrorail') {
        preview = (
          <SavedTrip
            savedTrip={this.state.savedTrip ? this.state.savedTrip.toJS() : null}
            isPreview={true}
            isSavedTripLoading={this.state.isSavedTripLoading}
            isDarkMode={this.props.isDarkMode}
          />
        );
      } else {
        preview = (
          <ARIESSavedTrip
            savedTrip={this.state.savedTrip ? this.state.savedTrip.toJS() : null}
            systemName={this.state.selectedSystemName}
            canDelete={false}
            isPreview={true}
            isSavedTripLoading={this.state.isSavedTripLoading}
            isDarkMode={this.props.isDarkMode}
          />
        );
      }
    } else if (this.state.isSavedTripLoading) {
      preview = (
        <div
          style={{
            padding: 48
          }}
        >
          <MDSpinner
            size={42}
            singleColor={this.context.muiTheme.palette.accent1Color}
          />
        </div>
      );
    } else {
      preview = (
        <div
          style={{
            padding: 36,
            fontSize: 14
          }}
        >
          <div>Input your origin and destination {(this.state.selectedSystemName === 'Metrorail') ? "station" : "stop"}s to preview your trip.</div>
          <div style={{
            fontStyle: 'italic',
            marginTop: 8
          }}
          >
            Note: if your commute includes a transfer, add each leg of the commute as its own trip.
          </div>
        </div>
      )
    }

    let fromStopComponent;
    let toStopComponent;
    let disabled;
    if (this.state.selectedSystemName === 'Metrorail') {
      fromStopComponent = (
        <AutoComplete
          floatingLabelText="From Station"
          dataSource={this.state.stationNameCodeMap.keySeq().toArray()}
          value={this.state.selectedFromStationCode}
          onNewRequest={(t) => {
            const stationCode = this.state.stationNameCodeMap.get(t);
            if (stationCode) {
              AddSavedTripActions.updateState({
                selectedFromStationCode: stationCode
              });
              AddSavedTripActions.getStationTrip();
            }
          }}
          onUpdateInput={(t) => {
            if (!t) {
              AddSavedTripActions.updateState({
                selectedFromStationCode: null
              });
              AddSavedTripActions.getStationTrip();
            }
          }}
          filter={(searchText, key) => {
            if (searchText.length <= 0) return false;
            let searchTextModified = searchText.toLowerCase();
            searchTextModified = searchTextModified.replace(/[‘’]/g, "'");
            return (key.toLowerCase().indexOf(searchTextModified) >= 0);
          }}
          maxSearchResults={5}
          style={{
            marginLeft: 8,
            marginRight: 8,
            textAlign: 'left',
            verticalAlign: 'top'
          }}
        />
      );

      toStopComponent = (
        <AutoComplete
          floatingLabelText="To Station"
          dataSource={this.state.stationNameCodeMap.keySeq().toArray()}
          value={this.state.selectedToStationCode}
          onNewRequest={(t) => {
            const stationCode = this.state.stationNameCodeMap.get(t);
            if (stationCode) {
              AddSavedTripActions.updateState({
                selectedToStationCode: stationCode
              });
              AddSavedTripActions.getStationTrip();
            }
          }}
          onUpdateInput={(t) => {
            if (!t) {
              AddSavedTripActions.updateState({
                selectedToStationCode: null
              });
              AddSavedTripActions.getStationTrip();
            }
          }}
          filter={(searchText, key) => {
            if (searchText.length <= 0) return false;
            let searchTextModified = searchText.toLowerCase();
            searchTextModified = searchTextModified.replace(/[‘’]/g, "'");
            return (key.toLowerCase().indexOf(searchTextModified) >= 0);
          }}
          maxSearchResults={5}
          style={{
            marginLeft: 8,
            marginRight: 8,
            textAlign: 'left',
            verticalAlign: 'top'
          }}
        />
      );

      disabled = (
        !this.state.selectedFromStationCode ||
        !this.state.selectedToStationCode ||
        this.state.isSavedTripLoading ||
        !this.state.savedTrip ||
        (this.state.savedTrip && !this.state.savedTrip.get('expectedRideTime') && !this.state.savedTrip.get('lineCodes'))
      );
    } else {
      fromStopComponent = (
        <TextField
          floatingLabelText="From Stop"
          hintText="7-digit stop code"
          onChange={(event, newValue) => {
            newValue = newValue.trim();
            if (newValue.length !== 7) {
              newValue = null;
            } else if (this.state.selectedFromStationCode === newValue) {
              return;
            }

            AddSavedTripActions.updateState({
              selectedFromStationCode: newValue
            });
            AddSavedTripActions.getStationTrip();
          }}
          style={{
            marginLeft: 8,
            marginRight: 8,
            textAlign: 'left'
          }}
        />
      );

      toStopComponent = (
        <TextField
          floatingLabelText="To Stop"
          hintText="7-digit stop code"
          onChange={(event, newValue) => {
            newValue = newValue.trim();
            if (newValue.length !== 7) {
              newValue = null;
            } else if (this.state.selectedToStationCode === newValue) {
              return;
            }

            AddSavedTripActions.updateState({
              selectedToStationCode: newValue
            });
            AddSavedTripActions.getStationTrip();
          }}
          style={{
            marginLeft: 8,
            marginRight: 8,
            textAlign: 'left'
          }}
        />
      );

      disabled = (
        !this.state.selectedFromStationCode ||
        !this.state.selectedToStationCode ||
        this.state.isSavedTripLoading ||
        !this.state.savedTrip ||
        (this.state.savedTrip && !this.state.savedTrip.get('usualRideTime'))
      );
    }

    return (
      <div>
        <Dialog
          className="StationDialog"
          title="Add New Trip"
          actions={
            <div className="station-dialog-actions">
              <FlatButton
                label="Cancel"
                onClick={this.hide}
              />
              <FlatButton
                label="Save New Trip"
                primary={true}
                keyboardFocused={true}
                disabled={disabled}
                onClick={() => {
                  AddSavedTripActions.saveTrip();
                  this.hide();
                }}
              />
            </div>
          }
          modal={this.state.isMobileDevice}
          open={this.state.showDialog}
          onRequestClose={this.hide}
          autoScrollBodyContent
          contentStyle={{
            top: (this.state.isMobileDevice ? -80 : 'initial'),
            width: (this.state.isMobileDevice ? '100%' : '95%'),
            maxWidth: (this.state.isMobileDevice ? 'initial' : 320)
          }}
          repositionOnUpdate={!this.state.isMobileDevice}
          titleStyle={{
            padding: '24px 24px 8px',
            borderBottom: 0
          }}
          bodyClassName="scrolling-dialog-body"
          bodyStyle={{
            borderTop: 0,
            padding: 0,
            color: this.context.muiTheme.palette.textColor,
            minHeight: (this.state.isMobileDevice ? (window.innerHeight - (this.state.isShowingAnySnackbar ? 150 : 106)) : 'initial'),
            margin: '0 auto',
            textAlign: 'center'
          }}
          style={{
            paddingTop: 8
          }}
        >
          <SelectField
            style={{
              width: 160,
              marginLeft: 8,
              marginRight: 8,
              textAlign: 'left'
            }}
            floatingLabelText={"System"}
            value={this.state.selectedSystemName}
            onChange={(event, index, value) => {
              AddSavedTripActions.updateState({
                selectedSystemName: value,
                selectedFromStationCode: null,
                selectedToStationCode: null
              });
              AddSavedTripActions.getStationTrip();
            }}
            autoWidth
          >
            <MenuItem
              value='Metrorail'
              primaryText={
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92.386 71.959" height={24} width={24} style={{verticalAlign: 'middle', marginRight: 4}}>
                    <path fill={this.context.muiTheme.palette.textColor} d="M46.484 0a29.43 8.656 0 00-29.318 8.042c-.148.093-.244.192-.284.298C6.784 35.43 6.116 64.667 13.238 64.7c1.616.008 3.545.011 5.507.014-.105.273-.165.57-.165.88v3.917a2.442 2.442 0 002.448 2.447h50.75a2.442 2.442 0 002.447-2.447v-3.917c0-.31-.06-.607-.164-.88 1.962-.003 3.89-.006 5.506-.014 7.12-.034 6.455-29.25-3.634-56.334A29.43 8.656 0 0046.521 0a29.43 8.656 0 00-.037 0zM36.173 4.563h20.46A2.443 2.443 0 0159.08 7.01v.422a2.442 2.442 0 01-2.448 2.447H36.173a2.442 2.442 0 01-2.448-2.447V7.01a2.443 2.443 0 012.448-2.447zm33.003 3.196a3.01 3.01 0 013.011 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.011-3.01 3.01 3.01 0 013.01-3.01zm-45.479.529a3.01 3.01 0 01.001 0 3.01 3.01 0 013.01 3.01 3.01 3.01 0 01-3.01 3.01 3.01 3.01 0 01-3.01-3.01 3.01 3.01 0 013.01-3.01zm14.22 9.602h16.971v21.879h-16.97zm-16.205 2.862h7.157a2.245 2.245 0 012.249 2.25v14.517a2.245 2.245 0 01-2.25 2.25h-7.156c-3.595.293-4.65-1.9-4.452-3.13l2.203-13.637c.199-1.23 1.003-2.25 2.25-2.25zm42.224 0h7.157c1.246 0 2.05 1.02 2.25 2.25l2.202 13.636c.199 1.23-.856 3.424-4.452 3.13h-7.157a2.244 2.244 0 01-2.249-2.249V23.002a2.244 2.244 0 012.25-2.25zM20.293 46.175a4.038 4.038 0 014.038 4.039 4.038 4.038 0 01-4.038 4.038 4.038 4.038 0 01-4.039-4.038 4.038 4.038 0 014.039-4.039zm51.79 0a4.038 4.038 0 014.039 4.039 4.038 4.038 0 01-4.039 4.038 4.038 4.038 0 01-4.038-4.038 4.038 4.038 0 014.038-4.039zm-40.717 3.231a4.993 4.993 0 01.014 0 4.993 4.993 0 014.993 4.993 4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993zm29.616 0a4.993 4.993 0 01.014 0A4.993 4.993 0 0165.99 54.4a4.993 4.993 0 01-4.993 4.993 4.993 4.993 0 01-4.993-4.993 4.993 4.993 0 014.979-4.993z"/>
                  </svg>
                  <span>Metrorail</span>
                </span>
              }
            />
            <MenuItem
              value='Metrobus'
              primaryText={
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75.769 71.959" height={20} width={20} style={{verticalAlign: 'middle', marginLeft: 2, marginRight: 6}}>
                    <path fill={this.context.muiTheme.palette.textColor} d="M70.588 17.393a8.105 8.105 0 00-2.2.44c-.675.242-1.291.51-1.726 1.168l1.668 1.103c-.032.05.263-.221.73-.388a6.34 6.34 0 011.651-.327c.569-.035 1.098.035 1.36.137.26.102.172.03.173.082 0 .049-.012 2.296-.02 3.444l2 .011c.008-1.16.02-3.482.02-3.482v-.035c-.028-.905-.75-1.611-1.447-1.883-.696-.272-1.448-.316-2.209-.27zM10.268 0C8.672 0 7.387 1.629 7.387 3.652v14.183l-.006-.002a8.106 8.106 0 00-2.2-.44c-.76-.047-1.514-.002-2.21.27-.697.272-1.417.977-1.446 1.883l-.002.017v.018l.001.172H.81c-.448 0-.809.319-.809.714v5.09c0 .396.36.714.809.714h3.576c.448 0 .808-.318.808-.713v-5.091c0-.395-.36-.714-.808-.714h-.86l-.002-.145c.002-.052-.087.02.174-.082.261-.102.793-.171 1.362-.137.568.035 1.18.16 1.648.327.336.12.579.29.68.36V61.89c0 2.024 1.285 3.652 2.881 3.652h3.418v2.764c0 2.023 1.285 3.652 2.882 3.652h6.013c1.597 0 2.882-1.629 2.882-3.652v-2.764h25.27v2.398c0 2.023 1.285 3.652 2.881 3.652h6.013c1.597 0 2.883-1.629 2.883-3.652v-2.398h3.233c1.596 0 2.881-1.628 2.881-3.652V3.652C68.624 1.629 67.34 0 65.743 0zm8.715 3.617h38.046c1.106 0 1.998 1.393 1.998 3.122 0 1.73-.892 3.121-1.998 3.121H18.983c-1.107 0-1.998-1.392-1.998-3.12 0-1.73.891-3.123 1.998-3.123zm-2.826 12.964H35.64a6.722 6.722 0 00-.013.405v22.352H16.157c-1.597 0-2.882-1.618-2.882-3.627V20.208c0-2.01 1.285-3.627 2.882-3.627zm24.213 0h19.485c1.596 0 2.881 1.618 2.881 3.627v15.503c0 2.01-1.285 3.627-2.881 3.627H40.384V16.986c0-.137-.005-.272-.014-.405zM15.353 52.377h6.087c.79 0 1.427.988 1.427 2.217V56.2c0 1.228-.636 2.217-1.427 2.217h-6.087c-.79 0-1.427-.989-1.427-2.217v-1.607c0-1.229.637-2.217 1.427-2.217zm39.218 0h6.088c.79 0 1.426.988 1.426 2.217V56.2c0 1.228-.636 2.217-1.426 2.217H54.57c-.79 0-1.427-.989-1.427-2.217v-1.607c0-1.229.636-2.217 1.427-2.217zM74.96 19.753h-3.576c-.448 0-.809.318-.809.714v5.09c0 .396.361.714.81.714h3.575c.448 0 .809-.318.809-.713v-5.091c0-.396-.36-.714-.809-.714z" />
                  </svg>
                  <span>Metrobus</span>
                </span>
              }
            />
          </SelectField>
          <div
            style={{
              display: 'inline-block',
              verticalAlign: 'top'
            }}
          >
            {fromStopComponent}
            {toStopComponent}
          </div>
          <div
            style={{
              marginBottom: 8
            }}>
            {preview}
          </div>
        </Dialog>
      </div>
    );
  }
});
