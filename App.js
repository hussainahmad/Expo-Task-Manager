/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Alert
} from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as TaskManager from 'expo-task-manager';
const LOCATION_TASK_NAME = "background-location-task";
class App extends React.Component {

    constructor(props) {
        super(props);
        this.getLocationAsync = this
            .getLocationAsync
            .bind(this);
        this._stopLocationUpdate = this
            ._stopLocationUpdate
            .bind(this);
    }

    componentDidMount() {
        this.getLocationAsync()
    }
    async getLocationAsync() {
        try {
            let {status} = await Permissions.askAsync(Permissions.LOCATION);
            const permissionStatus = await Location.getProviderStatusAsync();
            const isLocationEnabled = permissionStatus.locationServicesEnabled;
            if (!isLocationEnabled) {
                const {navigation} = this.props;
                Alert.alert("Error", "Please Turn On you'r Location", [
                    {
                        text: "OK",
                        onPress: this.openSetting
                    }
                ], {cancelable: false});
            } else {
                //if status is granted or not
                if (status !== "granted") {
                    alert("Permission to access location was denied");
                    return;
                } else {
                    let a = await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                        accuracy: Location.Accuracy.BestForNavigation,
                        timeInterval: 1000,
                        showsBackgroundLocationIndicator: true,
                        foregroundService: {
                            notificationTitle: 'Demo Location',
                            notificationBody: "Demo",
                            notificationColor: '#fca'
                        }
                    });
                }
            }
        } catch (error) {
            if (__DEV__) {
                console.log(error)
            }
        }
    };

    async _stopLocationUpdate() {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
    }
    render() {
        return (

            <View>
                <Text>test</Text>
            </View>
        );
    }
};

TaskManager.defineTask(LOCATION_TASK_NAME, async({data: {
        locations
    }, error}) => {
    if (error) {
        console.log(error.message);
        return;
    }
    try {
        console.log({locations})
        let response = await sendLocation({
            timestamp: parseInt(locations[0].timestamp),
            lat: locations[0].coords.latitude,
            lon: locations[0].coords.longitude
        })
        console.log(JSON.stringify(response))

    } catch (error) {
        console.log(error)
    }
});

export async function sendLocation(params) {
    var esc = encodeURIComponent;
    var query = Object
        .keys(params)
        .map(k => esc(k) + '=' + esc(params[k]))
        .join('&');

    let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    return new Promise((resolve, reject) => {
        fetch('https://a070d644-75d6-4689-8dfd-17c5bb6b9a9e.mock.pstmn.io/api/location', {
            method: 'POST',
            headers: headers,
            // body: query,
            credentials: 'omit'
        }).then(response => {
            if (response.ok) {
                resolve(response)
            } else {
                reject(response)
            }
        }).catch(e => {
            reject(e);
        });
    });
}
export default App;
