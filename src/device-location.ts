import { NativeModules, Platform } from 'react-native';
import * as Location from 'expo-location';
type NativePoint={latitude:number;longitude:number;accuracy:number;timestamp:number;mocked:boolean};
const device=NativeModules.FacePayLocation as {geocode(address:string):Promise<{latitude:number;longitude:number}>;getPosition():Promise<NativePoint>}|undefined;
export async function geocodeHome(address:string){if(Platform.OS==='android'&&device)return device.geocode(address);const rows=await Location.geocodeAsync(address);if(!rows[0])throw new Error('Your address could not be located. Include suburb, city and postal code.');return {latitude:rows[0].latitude,longitude:rows[0].longitude}}
export async function freshLocation():Promise<NativePoint>{if(Platform.OS==='android'&&device)return device.getPosition();const p=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});return {latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:p.coords.accuracy??9999,timestamp:p.timestamp,mocked:p.mocked===true}}
