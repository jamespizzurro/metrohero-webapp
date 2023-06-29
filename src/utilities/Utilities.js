import uuid from 'node-uuid';
import ls from 'local-storage';

export default {

  getUserId() {
    // get user id, generating one if it doesn't exist already
    let userId = ls.get('userId');
    if (!userId) {
      ls.set('userId', uuid.v4());
      userId = ls.get('userId');
      if (!userId) {
        userId = null;
      }
    }
    return userId;
  },

  isMobileDevice() {
    let isMobileDevice = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))isMobileDevice = true})(navigator.userAgent||navigator.vendor||window.opera);
    return isMobileDevice;
  },

  addRecentlyVisitedStation(stationCode, lineColor, stationName) {
    const station = {stationCode, lineColor, stationName};
    let stations = ls.get('recentlyVisitedStations');
    if (!stations) {
      stations = [station];
    } else {
      stations = JSON.parse(stations);

      // determine if this station is already in our recent stations list
      let stationIndex = -1;
      stations.some((station, index) => {
        const isSameStationCode = ((station.stationCode === stationCode) && (station.lineColor === lineColor));
        if (isSameStationCode) {
          stationIndex = index;
        }
        return isSameStationCode;
      });

      if (stationIndex !== -1) {
        // station is already a recent station, so drop it so that it will then be added to the top of the list
        stations.splice(stationIndex, 1);
      } else if (stations.length >= 5) {
        // too many recent stations, so drop the station that's been around the longest to make room for this one
        stations.splice(-1, 1);
      }
      stations.unshift(station);
    }
    ls.set('recentlyVisitedStations', JSON.stringify(stations));
  },

  getRecentlyVisitedStations() {
    const stations = ls.get('recentlyVisitedStations');
    return stations ? JSON.parse(stations) : [];
  },

  addRecentlyVisitedLine(lineCode) {
    let lineCodes = ls.get('recentlyVisitedLines');
    if (lineCodes) {
      lineCodes = JSON.parse(lineCodes);
    } else {
      lineCodes = ['RD', 'OR', 'SV', 'BL', 'YL', 'GR'];
    }

    let lineIndex = -1;
    lineCodes.some((code, index) => {
      const isSameLineCode = (lineCode === code);
      if (isSameLineCode) {
        lineIndex = index;
      }
      return isSameLineCode;
    });
    if (lineIndex !== -1) {
      lineCodes.splice(lineIndex, 1);
      lineCodes.unshift(lineCode);
    }

    ls.set('recentlyVisitedLines', JSON.stringify(lineCodes));
  },

  getRecentlyVisitedLines() {
    const lineCodes = ls.get('recentlyVisitedLines');
    return lineCodes ? JSON.parse(lineCodes) : ['RD', 'OR', 'SV', 'BL', 'YL', 'GR'];
  },

  getStationNameCodeMap() {
    return {
      "Addison Road-Seat Pleasant": "G03",
      "Anacostia": "F06",
      "Archives-Navy Mem'l-Penn Quarter": "F02",
      "Arlington Cemetery": "C06",
      "Ashburn": "N12",
      "Ballston-MU": "K04",
      "Benning Road": "G01",
      "Bethesda": "A09",
      "Braddock Road": "C12",
      "Branch Avenue": "F11",
      "Brookland-CUA": "B05",
      "Capitol Heights": "G02",
      "Capitol South": "D05",
      "Cheverly": "D11",
      "Clarendon": "K02",
      "Cleveland Park": "A05",
      "College Park-U of MD": "E09",
      "Columbia Heights": "E04",
      "Congress Heights": "F07",
      "Court House": "K01",
      "Crystal City": "C09",
      "Deanwood": "D10",
      "Dulles International Airport": "N10",
      "Dunn Loring-Merrifield": "K07",
      "Dupont Circle": "A03",
      "East Falls Church": "K05",
      "Eastern Market": "D06",
      "Eisenhower Ave": "C14",
      "Farragut North": "A02",
      "Farragut West": "C03",
      "Federal Center SW": "D04",
      "Federal Triangle": "D01",
      "Foggy Bottom-GWU": "C04",
      "Forest Glen": "B09",
      "Fort Totten (RD)": "B06",
      "Fort Totten (YL/GR)": "E06",
      "Franconia-Springfield": "J03",
      "Friendship Heights": "A08",
      "Gallery Pl-Chinatown (RD)": "B01",
      "Gallery Pl-Chinatown (YL/GR)": "F01",
      "Georgia Ave-Petworth": "E05",
      "Glenmont": "B11",
      "Greenbelt": "E10",
      "Greensboro": "N03",
      "Grosvenor-Strathmore": "A11",
      "Herndon": "N08",
      "Huntington": "C15",
      "Innovation Center": "N09",
      "Judiciary Square": "B02",
      "King Street": "C13",
      "L'Enfant Plaza (OR/SV/BL)": "D03",
      "L'Enfant Plaza (YL/GR)": "F03",
      "Landover": "D12",
      "Downtown Largo": "G05",
      "Loudoun Gateway": "N11",
      "McLean": "N01",
      "McPherson Sq": "C02",
      "Medical Center": "A10",
      "Metro Center (OR/SV/BL)": "C01",
      "Metro Center (RD)": "A01",
      "Minnesota Ave": "D09",
      "Morgan Boulevard": "G04",
      "Mt Vernon Sq/7th St-Convention Center": "E01",
      "Navy Yard-Ballpark": "F05",
      "Naylor Road": "F09",
      "New Carrollton": "D13",
      "NoMa-Gallaudet U": "B35",
      "Pentagon": "C07",
      "Pentagon City": "C08",
      "Potomac Ave": "D07",
      "Hyattsville Crossing": "E08",
      "Reston Town Center": "N07",
      "Rhode Island Ave-Brentwood": "B04",
      "Rockville": "A14",
      "Ronald Reagan Washington National Airport": "C10",
      "Rosslyn": "C05",
      "Shady Grove": "A15",
      "Shaw-Howard U": "E02",
      "Silver Spring": "B08",
      "Smithsonian": "D02",
      "Southern Ave": "F08",
      "Spring Hill": "N04",
      "Stadium-Armory": "D08",
      "Suitland": "F10",
      "Takoma": "B07",
      "Tenleytown-AU": "A07",
      "Twinbrook": "A13",
      "Tysons": "N02",
      "U St/African-Amer Civil War Memorial/Cardozo": "E03",
      "Union Station": "B03",
      "Van Dorn Street": "J02",
      "Van Ness-UDC": "A06",
      "Vienna/Fairfax-GMU": "K08",
      "Virginia Sq-GMU": "K03",
      "Waterfront-SEU": "F04",
      "West Falls Church-VT": "K06",
      "West Hyattsville": "E07",
      "Wheaton": "B10",
      "North Bethesda": "A12",
      "Wiehle-Reston East": "N06",
      "Woodley Park-Zoo/Adams Morgan": "A04"
    };
  },
  getStationCodeNameMap() {
    const codeNameMap = {};

    const nameCodeMap = this.getStationNameCodeMap();
    for (const key in nameCodeMap) {
      codeNameMap[nameCodeMap[key]] = key;
    }

    return codeNameMap;
  },

  _convertSavedTripsToMyCommute() {
    const savedTripsString = ls.get('savedTrips');
    if (!savedTripsString) {
      // nothing to convert
      return;
    }

    // split saved trips into two groups: morning and evening
    // (as a heuristic, try to make the buckets equal in size; seems rare that someone would have an odd number of saved trips)

    const savedTrips = JSON.parse(savedTripsString);
    const threshold = Math.floor(savedTrips.length / 2);

    const savedMorningTrips = [];
    for (let i = 0; i < threshold; i++) {
      const savedTrip = savedTrips[i];
      savedMorningTrips.push(savedTrip);
    }
    ls.set('savedMorningTrips', JSON.stringify(savedMorningTrips));

    if (threshold > 0) {
      const savedEveningTrips = [];
      for (let i = threshold; i < savedTrips.length; i++) {
        const savedTrip = savedTrips[i];
        savedEveningTrips.push(savedTrip);
      }
      ls.set('savedEveningTrips', JSON.stringify(savedEveningTrips));
    }

    // clear out old local storage variable
    ls.set('savedTrips', '');
  },

  getSavedMorningTrips() {
    this._convertSavedTripsToMyCommute();

    const savedMorningTrips = ls.get('savedMorningTrips');
    return savedMorningTrips ? JSON.parse(savedMorningTrips) : [];
  },

  getSavedEveningTrips() {
    this._convertSavedTripsToMyCommute();

    const savedEveningTrips = ls.get('savedEveningTrips');
    return savedEveningTrips ? JSON.parse(savedEveningTrips) : [];
  },

  displaySeconds(seconds, shouldRound) {
    const minutes = seconds / 60.0;

    if (minutes < 1) {
      return 'a few seconds';
    }

    const hours = minutes / 60.0;

    if (hours < 1) {
      const flooredMinutes = shouldRound ? Math.round(minutes) : Math.floor(minutes);
      return `${flooredMinutes} minute${(flooredMinutes === 1) ? '' : 's'}`;
    }

    const flooredHours = Math.floor(hours);
    const flooredRemainingMinutes = shouldRound ? Math.round(minutes % 60) : Math.floor(minutes % 60);
    return `${flooredHours} hour${(flooredHours === 1) ? '' : 's'}${(flooredRemainingMinutes > 0) ? ` and ${flooredRemainingMinutes} minute${(flooredRemainingMinutes === 1) ? '' : 's'}`: ''}`;
  },

  getMedian(values) {
    const sortedValues = values.slice().sort((a, b) => a - b);
    const lowMiddle = Math.floor((sortedValues.length - 1) / 2);
    const highMiddle = Math.ceil((sortedValues.length - 1) / 2);
    return (sortedValues[lowMiddle] + sortedValues[highMiddle]) / 2;
  },

  setDefaultPage() {
    let defaultPage = ls.get('defaultPage');
    if (!defaultPage) {
      if (this.isMobileDevice()) {
        ls.set('defaultPage', '/my-commute');
      } else {
        ls.set('defaultPage', '/dashboard');
      }
    }
    return ls.get('defaultPage');
  },

  removeLeadingSlash(string) {
    if (string.substring(0, 1) === '/') {
      return string.substring(1);
    }

    return string;
  },
  trim(s) {
    return s && s.toString().replace(/^\s+|\s+$/g, '');
  },
  // adapted from react-ga's 'modalview' function: https://github.com/react-ga/react-ga/blob/984a29c61d393eda13058a9e62e0e42ed170fb6e/src/core.js#L237
  getDataForModalView(rawModalName) {
    if (!rawModalName) {
      console.debug('modalName is required in .modalview(modalName)');
      return;
    }

    const modalName = this.removeLeadingSlash(this.trim(rawModalName));
    if (modalName === '') {
      console.debug('modalName cannot be an empty string or a single / in .modalview()');
      return;
    }

    return {
      hitType: 'pageview',
      page: '/modal/' + modalName
    };
  }
};
