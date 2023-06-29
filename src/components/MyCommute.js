import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Reflux from 'reflux';
import PureRenderIgnoreFunctionsMixin from 'react-pure-render-ignore-functions';
import StoreMixin from 'reflux-immutable/StoreMixin';
import SwipeableViews from 'react-swipeable-views';
import ga from 'react-ga4';

import Utilities from '../utilities/Utilities';

import PredictionsStore from '../stores/PredictionsStore';
import AddSavedTripActions from "../actions/AddSavedTripActions";
import AddSavedTripStore from "../stores/AddSavedTripStore";
import AppStore from "../stores/AppStore";

import {Tabs, Tab} from 'material-ui/Tabs';
import ImageWbSunny from 'material-ui/svg-icons/image/wb-sunny';
import ImageBrightness3 from 'material-ui/svg-icons/image/brightness-3';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import SavedTrip from './SavedTrip';
import ARIESSavedTrip from './ARIESSavedTrip';
import AddTripModal from './AddTripModal';
import TrainDialog from "./TrainDialog";
import DashboardActions from "../actions/DashboardActions";
import DashboardStore from "../stores/DashboardStore";

export default createReactClass({

  mixins: [
    PureRenderIgnoreFunctionsMixin,
    StoreMixin,
    Reflux.listenTo(AddSavedTripStore, 'onStoreChange'),
    Reflux.listenTo(PredictionsStore, 'onStoreChange'),
    Reflux.listenTo(DashboardStore, 'onStoreChange'),
    Reflux.listenTo(AppStore, 'onStoreChange')
  ],

  contextTypes: {
    muiTheme: PropTypes.object.isRequired
  },

  propTypes: {
    onClickNavItem: PropTypes.func,
    isDarkMode: PropTypes.bool.isRequired
  },

  _timerId: null,

  _tripSvg: `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" width="128px" height="128px" xml:space="preserve">
      <g>
        <g>
          <g>
            <path d="M426.667,106.667c-47.052,0-85.333,38.281-85.333,85.333c0,31.796,36.642,88.85,59.561,121.451 c-1.374,1.042-2.591,2.301-3.353,3.977c-2.313,5.073-0.313,11.01,4.448,13.698c-4.656,2.865-6.438,8.865-3.948,13.854 c1.875,3.74,5.635,5.896,9.552,5.896c1.604,0,3.229-0.365,4.76-1.125l19.033-9.517l0.005-0.001l0.046-0.023l0.012-0.025 c1.421-0.714,2.691-1.73,3.686-3.027C443,326.885,512,235.594,512,192C512,144.948,473.719,106.667,426.667,106.667z M426.667,213.333c-11.76,0-21.333-9.573-21.333-21.333s9.573-21.333,21.333-21.333S448,180.24,448,192 S438.427,213.333,426.667,213.333z"/>
            <path d="M111.383,483.719c22.936-32.664,59.284-89.383,59.284-121.052c0-47.052-38.281-85.333-85.333-85.333 C38.281,277.333,0,315.615,0,362.667c0,43.594,69,134.885,76.865,145.156c2.021,2.635,5.146,4.177,8.469,4.177 c1.68,0,3.302-0.404,4.763-1.133l0.008,0.008l19.083-9.542c5.271-2.635,7.406-9.042,4.771-14.313 C113.307,485.716,112.419,484.613,111.383,483.719z M85.333,384C73.573,384,64,374.427,64,362.667s9.573-21.333,21.333-21.333 c11.76,0,21.333,9.573,21.333,21.333S97.094,384,85.333,384z"/>
            <path d="M234.385,414.875l-33.677,16.844c-5.271,2.635-7.406,9.042-4.771,14.313c1.875,3.74,5.635,5.896,9.552,5.896 c1.604,0,3.229-0.365,4.76-1.125l33.677-16.844c5.271-2.635,7.406-9.042,4.771-14.313 C246.052,414.375,239.635,412.26,234.385,414.875z"/>
            <path d="M369.135,347.5l-33.688,16.844c-5.271,2.635-7.406,9.042-4.771,14.313c1.875,3.74,5.635,5.896,9.552,5.896 c1.604,0,3.229-0.365,4.76-1.125l33.688-16.844c5.271-2.635,7.406-9.042,4.771-14.313 C380.813,347.01,374.396,344.896,369.135,347.5z"/>
            <path d="M167.021,448.563l-33.688,16.844c-5.271,2.635-7.406,9.042-4.771,14.313c1.875,3.74,5.635,5.896,9.552,5.896 c1.604,0,3.229-0.365,4.76-1.125l33.688-16.844c5.271-2.635,7.406-9.042,4.771-14.313 C178.688,448.063,172.281,445.958,167.021,448.563z"/>
            <path d="M301.76,381.188l-33.688,16.844c-5.271,2.635-7.406,9.042-4.771,14.313c1.875,3.74,5.635,5.896,9.552,5.896 c1.604,0,3.229-0.365,4.76-1.125l33.688-16.844c5.271-2.635,7.406-9.042,4.771-14.313 C313.427,380.688,307.031,378.563,301.76,381.188z"/>
            <path d="M368.073,314.708c4.063,0,7.938-2.323,9.719-6.25c2.438-5.365,0.073-11.688-5.292-14.125l-39.167-17.802 c-5.427-2.458-11.698-0.052-14.125,5.292c-2.438,5.365-0.073,11.688,5.292,14.125l39.167,17.802 C365.104,314.406,366.604,314.708,368.073,314.708z"/>
            <path d="M240.885,246.219c-2.438,5.365-0.073,11.688,5.292,14.125l39.156,17.802c1.438,0.656,2.938,0.958,4.406,0.958 c4.063,0,7.938-2.323,9.719-6.25c2.438-5.365,0.073-11.688-5.292-14.125l-39.156-17.802 C249.615,238.458,243.302,240.875,240.885,246.219z"/>
            <path d="M211.406,243.49c4.063,0,7.938-2.323,9.719-6.25c2.438-5.365,0.063-11.688-5.292-14.125l-7.367-3.348 c20.206-27.582,68.867-97.78,68.867-134.434C277.333,38.281,239.052,0,192,0s-85.333,38.281-85.333,85.333 c0,43.594,69,134.885,76.865,145.156c1.055,1.375,2.424,2.41,3.952,3.125c0.066,0.031,0.03,0.061,0.1,0.094L207,242.531 C208.438,243.188,209.938,243.49,211.406,243.49z M170.667,85.333C170.667,73.573,180.24,64,192,64s21.333,9.573,21.333,21.333 c0,11.76-9.573,21.333-21.333,21.333S170.667,97.094,170.667,85.333z"/>
          </g>
        </g>
      </g>
    </svg>
  `,

  getStoreState() {
    return {
      selectedTimeOfDay: AddSavedTripStore.get('selectedTimeOfDay'),
      savedMorningTrips: AddSavedTripStore.get('savedMorningTrips'),
      savedEveningTrips: AddSavedTripStore.get('savedEveningTrips'),
      loadedSavedTrips: PredictionsStore.get('data') ? PredictionsStore.get('data').get('savedTrips') : null,
      loadedSavedTripsFromARIES: AddSavedTripStore.get('loadedSavedTripsFromARIES'),
      isShowingAnySnackbar: AppStore.get('isShowingAnySnackbar'),
      isMobileDevice: AppStore.get('isMobileDevice'),

      selectedTrainId: AddSavedTripStore.get('selectedTrainId'),
      selectedStationName: AddSavedTripStore.get('selectedStationName'),
      selectedSavedTripKey: AddSavedTripStore.get('selectedSavedTripKey')
    };
  },

  componentDidMount() {
    if (!this._timerId) {
      this._timerId = setInterval(() => {
        AddSavedTripActions.getSavedTripsFromARIES();
      }, 5000);
      AddSavedTripActions.getSavedTripsFromARIES();
    }
  },

  componentWillUnmount() {
    if (this._timerId) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  },

  _buildSavedTripComponents(savedTrips) {
    const savedTripComponents = [];

    if (savedTrips) {
      savedTrips.forEach((savedTripKey) => {
        const splitSavedTripKey = savedTripKey.split("_");
        const fromStationCode = splitSavedTripKey[0];
        const toStationCode = splitSavedTripKey[1];

        let systemName;
        let oldSavedTripKey;
        let newSavedTripKey;
        if (splitSavedTripKey.length <= 2) {
          systemName = 'Metrorail';
          oldSavedTripKey = savedTripKey;
          newSavedTripKey = `${oldSavedTripKey}_${systemName}`;
        } else {

          systemName = splitSavedTripKey[2];
          oldSavedTripKey = `${fromStationCode}_${toStationCode}`;
          newSavedTripKey = savedTripKey;
        }

        let savedTrip = this.state.loadedSavedTrips ? this.state.loadedSavedTrips.get(oldSavedTripKey) : null;
        if (!savedTrip) {
          savedTrip = this.state.loadedSavedTripsFromARIES.get(newSavedTripKey);
        }

        if (systemName === 'Metrorail') {
          savedTripComponents.push(
            <SavedTrip
              key={savedTripKey}
              savedTripKey={savedTripKey}
              savedTrip={savedTrip}
              onClickNavItem={this.props.onClickNavItem}
              onClickTrain={this._handleClickTrain}
              isDarkMode={this.props.isDarkMode}
            />
          );
        } else {
          savedTripComponents.push(
            <ARIESSavedTrip
              key={savedTripKey}
              savedTrip={savedTrip}
              systemName={systemName}
              originStopId={fromStationCode}
              destinationStopId={toStationCode}
              canDelete={!!this.props.onClickNavItem}
              isDarkMode={this.props.isDarkMode}
            />
          );
        }
      });
    }

    return savedTripComponents;
  },

  _handleClickTrain(trainId, stationName, savedTripKey) {
    ga.send(Utilities.getDataForModalView(window.location.pathname + "#" + trainId));
    ga.event({
      category: 'My Commute',
      action: 'Displayed Train Modal',
      label: 'Not From Station'
    });

    AddSavedTripActions.updateState({
      selectedTrainId: trainId,
      selectedStationName: stationName,
      selectedSavedTripKey: savedTripKey
    });
    this.refs.trainDialog.show();
  },

  _onTrainDialogHide() {
    AddSavedTripActions.updateState({
      selectedTrainId: null,
      selectedStationName: null,
      selectedSavedTripKey: null
    });
  },

  render() {
    let morningContent;
    if (this.state.savedMorningTrips && !this.state.savedMorningTrips.isEmpty()) {
      morningContent = this._buildSavedTripComponents(this.state.savedMorningTrips);
    } else {
      morningContent = (
        <div
          style={{
            width: '100%',
            marginTop: 32,
            textAlign: 'center'
          }}
        >
          <div
            dangerouslySetInnerHTML={{__html: this._tripSvg}}
          />
          <div
            style={{
              padding: 24,
              color: this.context.muiTheme.palette.secondaryTextColor
            }}
          >
            Tap the + button to add a new trip to your morning commute.
          </div>
        </div>
      );
    }

    let eveningContent;
    if (this.state.savedEveningTrips && !this.state.savedEveningTrips.isEmpty()) {
      eveningContent = this._buildSavedTripComponents(this.state.savedEveningTrips);
    } else {
      eveningContent = (
        <div
          style={{
            width: '100%',
            marginTop: 32,
            textAlign: 'center'
          }}
        >
          <div
            dangerouslySetInnerHTML={{__html: this._tripSvg}}
          />
          <div
            style={{
              padding: 24,
              color: this.context.muiTheme.palette.secondaryTextColor
            }}
          >
            Tap the + button to add a new trip to your evening commute.
          </div>
        </div>
      );
    }

    const fabBottom = this.state.isShowingAnySnackbar ? 60 : 16;

    const shuttingDownAlert = (
      <div className="alert alert-danger" style={{margin: 12, width: '100%'}}>
        <strong>This {this.state.isMobileDevice ? "app" : "website"} will stop working on July 1st, 2023!</strong><br/>
        The MetroHero project is shutting down.<br/>
        For more info, please check out <a href="https://www.patreon.com/posts/end-of-era-78380459" target="_blank">our blog post</a>.
      </div>
    );

    return (
      <div
        className="MyCommute"
      >
        <Tabs
          key={this.state.selectedTimeOfDay}
          value={(this.state.selectedTimeOfDay === 'morning') ? 0 : 1}
          onChange={(newIndex) => {
            AddSavedTripActions.updateState({
              selectedTimeOfDay: (newIndex === 0) ? 'morning': 'evening'
            });
          }}
        >
          <Tab
            label="Morning"
            icon={<ImageWbSunny />}
            value={0}
          />
          <Tab
            label="Evening"
            icon={<ImageBrightness3 />}
            value={1}
          />
        </Tabs>
        <SwipeableViews
          index={(this.state.selectedTimeOfDay === 'morning') ? 0 : 1}
          onChangeIndex={(newIndex) => {
            AddSavedTripActions.updateState({
              selectedTimeOfDay: (newIndex === 0) ? 'morning': 'evening'
            });
          }}
        >
          <div
            className="saved-trips-container vertical-scrolling"
          >
            <div
              className="saved-trips-inner-container"
            >
              {shuttingDownAlert}
              {morningContent}
            </div>
          </div>
          <div
            className="saved-trips-container vertical-scrolling"
          >
            <div
              className="saved-trips-inner-container"
            >
              {shuttingDownAlert}
              {eveningContent}
            </div>
          </div>
        </SwipeableViews>
        <FloatingActionButton
          style={{
            position: 'fixed',
            bottom: fabBottom,
            right: 16,
            zIndex: 1
          }}
          onClick={() => {
            this.refs.addTripModal.show();
          }}
        >
          <ContentAdd/>
        </FloatingActionButton>
        <TrainDialog
          ref="trainDialog"
          trainId={this.state.selectedTrainId}
          stationName={this.state.selectedStationName}
          shouldRender={true}
          storeName={'PredictionsStore'}
          savedTripKey={this.state.selectedSavedTripKey}
          onHide={this._onTrainDialogHide}
        />
        <AddTripModal
          ref="addTripModal"
          isDarkMode={this.props.isDarkMode}
        />
      </div>
    );
  }
});
