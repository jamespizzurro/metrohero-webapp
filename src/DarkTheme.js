import {
  indigo500, indigo700,
  grey600, grey800,
  lightBlueA200, lightBlueA400, lightBlueA100,
  fullWhite, white,
  darkBlack
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  background: '#121212',
  lighterBackground: grey600,
  palette: {
    primary1Color: indigo700,
    primary2Color: indigo700,
    primary3Color: grey600,
    accent1Color: lightBlueA200,
    accent2Color: lightBlueA400,
    accent3Color: lightBlueA100,
    textColor: fullWhite,
    secondaryTextColor: fade(fullWhite, 0.54),
    alternateTextColor: white,
    canvasColor: grey800,
    borderColor: fade(fullWhite, 0.3),
    disabledColor: fade(fullWhite, 0.3),
    pickerHeaderColor: fade(fullWhite, 0.12),
    clockCircleColor: fade(fullWhite, 0.12)
  },
  appBar: {
    height: 56
  },
  snackbar: {
    backgroundColor: darkBlack
  },
  toolbar: {
    height: 48,
    backgroundColor: indigo500
  },
  flatButton: {
    primaryTextColor: lightBlueA200
  },
  raisedButton: {
    color: 'rgba(255, 255, 255, 0.09)'
  },
  bottomNavigation: {
    selectedColor: lightBlueA200
  },
  textField: {
    focusColor: lightBlueA200
  },
  paper: {
    backgroundColor: '#272727'
  },
  dialog: {
    bodyColor: '#272727'
  }
};
