import React, {Component} from 'react';
import {
  View,
  Image,
  Button,
  StyleSheet,
  Text,
  Dimensions,
  TextInput,
} from 'react-native';
import MapView from 'react-native-maps';
import AsyncStorage from '@react-native-community/async-storage';

export default class App extends Component {
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
  };

  constructor(props) {
    super(props);
    this.getData();
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
    if (this.state.locationChosen) {
      try {
        await AsyncStorage.multiSet([
          ['latitude', JSON.stringify(this.state.focusedLocation.latitude)],
          ['longitude', JSON.stringify(this.state.focusedLocation.longitude)],
        ]);
        alert(JSON.stringify(this.state.focusedLocation.longitude));
      } catch (err) {
        console.log(err);
      }
    }
    console.log('state', this.state);
  };

  getData = async () => {
    try {
      const latitude = await AsyncStorage.getItem('latitude');
      const longitude = await AsyncStorage.getItem('longitude');
      const parseLatitude = JSON.parse(latitude);
      const parseLongitude = JSON.parse(longitude);
      console.log(parseLatitude)
      console.log(parseLongitude)

      if (parseLatitude !== null) {
        this.setState.focusedLocation.latitude('parseLatitude');
      }
      if (parseLongitude !== null) {
        this.setState.focusedLocation.longitude(parseLongitude);
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    let marker = null;

    if (this.state.locationChosen) {
      marker = <MapView.Marker coordinate={this.state.focusedLocation} />;
    }

    return (
      <View style={styles.container}>
        <MapView
          initialRegion={this.state.focusedLocation}
          region={
            !this.state.locationChosen ? this.state.focusedLocation : null
          }
          style={styles.map}
          onPress={this.pickLocationHandler}
          ref={ref => (this.map = ref)}>
          {marker}
        </MapView>
        <View style={styles.button}>
          <View>
            <Text> Ingresar Coordenada X</Text>
            <TextInput
              placeholder="Coordenada x"
              value={this.state.focusedLocation.latitude}
              onChangeText={val => this.setState({latitude: val})}
            />
          </View>
          <View>
            <Text> Ingresar Coordenada Y</Text>
            <TextInput
              placeholder="Coordenada y"
              value={this.state.focusedLocation.longitude}
            />
          </View>
        </View>
        <View>
          <Button title="Submit" onPress={this.saveLocation} />
          <Button title="Deleted" onPress={this.DeleteLocation} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: 500,
  },
  button: {
    margin: 8,
  },
});
