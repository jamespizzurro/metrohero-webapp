import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';

import {Card, CardTitle, CardText} from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';

import SettingsActions from "../actions/SettingsActions";
import SettingsStore from "../stores/SettingsStore";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(SettingsStore, 'onStoreChange')
  ],

  getStoreState() {
    return {
      isDarkMode: SettingsStore.get('isDarkMode'),
      isPersonalized: SettingsStore.get('isPersonalized'),
      isNerdMode: SettingsStore.get('isNerdMode'),
      defaultPage: SettingsStore.get('defaultPage')
    };
  },

  _toggleDarkMode() {
    SettingsActions.updateState({
      isDarkMode: !this.state.isDarkMode
    });
  },

  _toggleNerdMode() {
    SettingsActions.updateState({
      isNerdMode: !this.state.isNerdMode
    });
  },

  _setDefaultPage(event, index, value) {
    SettingsActions.updateState({
      defaultPage: value
    });
  },

  render() {
    return (
      <div
        className="Settings vertical-scrolling"
      >
        <div
          style={{
            margin: '0 auto 92px',
            maxWidth: 300
          }}
        >
          <Card
            style={{
              marginTop: 8,
              marginBottom: 8
            }}
          >
            <CardTitle
              title="Settings"
              style={{
                paddingBottom: 0
              }}
            />
            <CardText>
              <Subheader>Default page</Subheader>
              <SelectField
                value={this.state.defaultPage}
                onChange={this._setDefaultPage}
                autoWidth
                style={{
                  width: 185,
                  marginLeft: 16,
                  marginTop: -16
                }}
              >
                <MenuItem
                  value='/dashboard'
                  primaryText="Dashboard"
                />
                <MenuItem
                  value='/my-commute'
                  primaryText="My Commute"
                />
                <MenuItem
                  value='/system-map'
                  primaryText="System Map"
                />
                <MenuItem
                  value='/line-red'
                  primaryText="Red Line Map"
                />
                <MenuItem
                  value='/line-orange'
                  primaryText="Orange Line Map"
                />
                <MenuItem
                  value='/line-silver'
                  primaryText="Silver Line Map"
                />
                <MenuItem
                  value='/line-blue'
                  primaryText="Blue Line Map"
                />
                <MenuItem
                  value='/line-yellow'
                  primaryText="Yellow Line Map"
                />
                <MenuItem
                  value='/line-green'
                  primaryText="Green Line Map"
                />
                <MenuItem
                  value='/realtime-map'
                  primaryText="Live Google Map"
                />
              </SelectField>
              <Subheader>Dark mode</Subheader>
              <Toggle
                toggled={this.state.isDarkMode}
                onClick={this._toggleDarkMode}
                style={{
                  width: 'initial',
                  marginTop: -4,
                  marginLeft: 8
                }}
              />
              <Subheader>Nerd mode</Subheader>
              <Toggle
                toggled={this.state.isNerdMode}
                onClick={this._toggleNerdMode}
                style={{
                  width: 'initial',
                  marginTop: -4,
                  marginLeft: 8
                }}
              />
            </CardText>
          </Card>
        </div>
      </div>
    );
  }
});
