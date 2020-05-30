import React,{Component} from 'react';
import {
    View,
    Text,
    Dimensions,
    Picker,
    TouchableHighlight
} from 'react-native';

// Map
import MapView from 'react-native-maps';

// Styles
var styles = require('../Styles');

// Utils
var utils = require('../Utils');

// i18n
var i18n = require('../i18n/I18n');

// Local Storage
var dbfunc = require('../models/Functions');

// Service
import MapService from '../services/MapService';

//utils
import Utils from '../Utils';

//Location and permissions
import RNLocation from 'react-native-location';
import { PermissionsAndroid } from 'react-native';

//Location by default in Medellin
export default class Map extends Component {
  state = {
      focusedLocation: {
          latitude: 6.250685,
          longitude: -75.568742,
          latitudeDelta: 0.0112,
          longitudeDelta:
        (Dimensions.get('window').width / Dimensions.get('window').height) *
        0.0122,
      },
      locationChosen: false,
      name: null,
      location: '',
  };

  constructor(props) {
      super(props);
      this.state.location = 'home'
  }

  componentDidMount() {
      this.requestAccess();
  }
  requestAccess = async () => {
      try {
          const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                  'title': i18n.u('Location_permission'),
                  'message': i18n.u('app_permission')
              }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              RNLocation.getLatestLocation({ timeout: 6000 }).then(position => {
                  const coordsEvent = {
                      nativeEvent: {
                          coordinate: {
                              latitude: position.latitude,
                              longitude: position.longitude
                          }
                      }
                  };
                  this.pickLocationHandler(coordsEvent);
              },        
              (error) => this.setState({ error: error.message }),      
              { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
              );    
          } else {
              Utils.logError(i18n.u('Location_permission_denied'));
          }
      } catch (err) {
          Utils.logError("Error: " + err);
      }
  }

  pickLocationHandler = event => {
      const coords = event.nativeEvent.coordinate;
      this.map.animateToRegion({
          ...this.state.focusedLocation,
          latitude: coords.latitude,
          longitude: coords.longitude,
      });
      this.setState(prevState => {
          return {
              focusedLocation: {
                  ...prevState.focusedLocation,
                  latitude: coords.latitude,
                  longitude: coords.longitude,
              },
              locationChosen: true,
          };
      });
  };

  saveLocation = async () => {
      if (this.state.locationChosen || dbfunc.isOwner()) {
          try {
              MapService.saveMapTrace(this.state);
          } catch (err) {
              alert.log(err);
          }
      }
      alert(i18n.u('save_location'));
  };

  render() {
      let marker = null;
      if (this.state.locationChosen) {
          marker = <MapView.Marker coordinate={this.state.focusedLocation} />;
      }
      return (
          <View style={styles.containerGoogle}>
              <View style={utils.getTreatMainContainerStyle()}>
                  {utils.renderNavBar('maps')}
              </View>
              <MapView
                  initialRegion={this.state.focusedLocation}
                  region={
                      !this.state.locationChosen ? this.state.focusedLocation : null
                  }
                  style={styles.mapGoogle}
                  onPress={this.pickLocationHandler}
                  ref={ref => (this.map = ref)}>
                  {marker}
              </MapView>
              <View style={styles.inputIOS}>
                  <Text>{i18n.u('my_place')}</Text>
                  <Picker selectedValue= {this.state.location}
                      onValueChange={(itemValue) =>
                          this.setState({ location: itemValue })
                      }>
                      <Picker.Item label={i18n.u('home')} value="home"></Picker.Item>              
                      <Picker.Item label={i18n.u('work')} value="work"></Picker.Item>
                  </Picker>
              </View>  
              <View style={styles.buttonsContainerGoogle} >
                  <TouchableHighlight style={styles.pButtonGoogle} onPress={this.saveLocation} underlayColor='#8D8DFF'>
                      <Text style={utils.getButtonTextStyle()}>{i18n.u('save')}</Text>
                  </TouchableHighlight>
              </View>  
          </View>

      );
  }
}
