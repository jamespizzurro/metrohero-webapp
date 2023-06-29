import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import AddSavedTripActions from '../actions/AddSavedTripActions';
import AddSavedTripStore from '../stores/AddSavedTripStore';

import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import SavedTrip from './SavedTrip';

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(AddSavedTripStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    isDarkMode: PropTypes.bool.isRequired,
  },

  getStoreState() {
    return {
      selectedFromStationCode: AddSavedTripStore.get('selectedFromStationCode'),
      selectedToStationCode: AddSavedTripStore.get('selectedToStationCode'),
      savedTrip: AddSavedTripStore.get('savedTrip'),
      isSavedTripLoading: AddSavedTripStore.get('isSavedTripLoading'),
      stationNameCodeMap: AddSavedTripStore.get('stationNameCodeMap'),
      isAddingSavedTrip: AddSavedTripStore.get('isAddingSavedTrip')
    };
  },

  componentWillUnmount() {
    this._cancelAddingSavedTrip();
  },

  _cancelAddingSavedTrip() {
    AddSavedTripActions.updateState({
      selectedFromStationCode: null,
      selectedToStationCode: null,
      savedTrip: null,
      isAddingSavedTrip: false
    });
  },

  _saveTrip() {
    AddSavedTripActions.saveTrip();
    this._cancelAddingSavedTrip();
  },

  render() {
    const menuItems = [];
    this.state.stationNameCodeMap.forEach((stationCode, stationName) => {
      menuItems.push(
        <MenuItem
          key={stationCode}
          value={stationCode}
          primaryText={stationName}
        />
      );
    });

    return (
      <div className="AddSavedTrip">
        <h4 style={{marginTop: 16, marginBottom: 4}}>ADD A NEW TRIP</h4>
        <SelectField
          floatingLabelText='From Station'
          value={this.state.selectedFromStationCode}
          onChange={(event, index, value) => {
            AddSavedTripActions.updateState({
              selectedFromStationCode: value
            });
            AddSavedTripActions.getStationTrip();
          }}
          maxHeight={200}
          style={{
            textAlign: 'left'
          }}
        >
          {menuItems}
        </SelectField>
        <SelectField
          floatingLabelText='To Station'
          value={this.state.selectedToStationCode}
          onChange={(event, index, value) => {
            AddSavedTripActions.updateState({
              selectedToStationCode: value
            });
            AddSavedTripActions.getStationTrip();
          }}
          maxHeight={200}
          style={{
            textAlign: 'left'
          }}
        >
          {menuItems}
        </SelectField>
        <div style={{marginBottom: 8}}>
          <SavedTrip
            savedTrip={this.state.savedTrip ? this.state.savedTrip.toJS() : null}
            isPreview={true}
            isSavedTripLoading={this.state.isSavedTripLoading}
            isDarkMode={this.props.isDarkMode}
          />
        </div>
        <div>
          <FlatButton label='Cancel' primary={true} keyboardFocused={false} onClick={this._cancelAddingSavedTrip} />
          <FlatButton label='Save New Trip' primary={true} keyboardFocused={false} onClick={this._saveTrip}
                      disabled={!this.state.selectedFromStationCode || !this.state.selectedToStationCode} />
        </div>
      </div>
    );
  }
});
