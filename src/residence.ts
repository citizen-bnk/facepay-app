import { freshLocation, geocodeHome } from './device-location';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import { mobileRequest } from './mobile-api';
const TASK='facepay-residence-daily-v1';
const CONTEXT='facepay-residence-context';
type Context={homeHour:number;timezone:string;reminderIds?:string[]};
export type ResidenceStatus={id:string;address:string;homeHour:number;timezone:string;startedAt:string;elapsedDays:number;qualifyingDays:number;scorePercent:number;status:string;samples:{day_index:number;qualifies:boolean;reason:string}[]};
const context=async():Promise<Context|null>=>{if(Platform.OS==='web')return null;const value=await SecureStore.getItemAsync(CONTEXT);return value?JSON.parse(value):null};
export const getResidenceStatus=()=>mobileRequest<ResidenceStatus>('/residence');
export async function stopResidenceSchedule(){
 if(Platform.OS==='web')return;
 const config=await context();
 if(await TaskManager.isTaskRegisteredAsync(TASK))await BackgroundTask.unregisterTaskAsync(TASK);
 for(const id of config?.reminderIds||[])await Notifications.cancelScheduledNotificationAsync(id);
 await SecureStore.deleteItemAsync(CONTEXT);
}
export async function captureResidence(){
 if(Platform.OS==='web')throw new Error('Location evidence is collected only in the installed native app.');
 const status=await getResidenceStatus();
 if(status.elapsedDays>=15){await stopResidenceSchedule();return 'Your 15-day check is complete. Open your report.'}
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:status.timezone,hour:'2-digit',hourCycle:'h23'}).format(Date.now()));
 if((hour-status.homeHour+24)%24>=2)throw new Error('Check during your selected two-hour home window.');
 if(status.samples.some(s=>s.day_index===status.elapsedDays&&s.qualifies))return 'Today’s qualifying check is already recorded.';
 if(!(await Location.getForegroundPermissionsAsync()).granted)throw new Error('Location access is disabled. Enable it to record a daily check.');
 const point=await freshLocation();
 if(point.accuracy>50)throw new Error('GPS accuracy is not within 50 metres. Try near a window or outdoors at home.');
 const result=await mobileRequest<{qualifies:boolean;reason:string}>('/residence/sample',{method:'POST',body:{latitude:point.latitude,longitude:point.longitude,accuracy:point.accuracy,timestamp:point.timestamp,mocked:point.mocked===true}});
 return result.qualifies?'Today’s home check qualifies.':result.reason==='away_from_home'?'This reading is outside your home radius. It does not qualify.':'This reading did not qualify. Try again during your home window.';
}
if(Platform.OS!=='web'&&!TaskManager.isTaskDefined(TASK))TaskManager.defineTask(TASK,async()=>{
 try{const config=await context();if(!config)return BackgroundTask.BackgroundTaskResult.Success;await captureResidence();return BackgroundTask.BackgroundTaskResult.Success}catch{return BackgroundTask.BackgroundTaskResult.Failed}
});
export async function startResidence(input:{address:string;homeHour:number;consent:boolean;background:boolean;reminders:boolean}){
 if(!input.consent)throw new Error('Your explicit consent is required.');
 if(Platform.OS==='web')throw new Error('Install the native app to start residence verification.');
 if(!(await Location.requestForegroundPermissionsAsync()).granted)throw new Error('Location permission was not granted. No residence check was started.');
 // Geocoding occurs only after the user has explicitly consented.
 const home=await geocodeHome(input.address);
 const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone;
 const result=await mobileRequest<{id:string}>('/residence',{method:'POST',body:{address:input.address,home,timezone,homeHour:input.homeHour,consent:true,consentVersion:'residence-v1-2026-10'}});
 const config:Context={homeHour:input.homeHour,timezone};
 await SecureStore.setItemAsync(CONTEXT,JSON.stringify(config));
 let backgroundEnabled=false,reminderEnabled=false;
 if(input.background){
  try{const permission=await Location.requestBackgroundPermissionsAsync();if(permission.granted&&(await BackgroundTask.getStatusAsync())===BackgroundTask.BackgroundTaskStatus.Available){await BackgroundTask.registerTaskAsync(TASK,{minimumInterval:60});backgroundEnabled=true}}catch{/* Manual check-in remains available if the OS restricts background work. */}
 }
 if(input.reminders){try{if((await Notifications.requestPermissionsAsync()).granted){if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('residence',{name:'Residence check reminders',importance:Notifications.AndroidImportance.DEFAULT});config.reminderIds=[];for(let day=0;day<15;day++){const date=new Date();date.setDate(date.getDate()+day);date.setHours(input.homeHour,0,0,0);if(date.getTime()<=Date.now())continue;config.reminderIds.push(await Notifications.scheduleNotificationAsync({content:{title:'FACEPAY home check',body:'At home? Open FACEPAY to record your daily residence check.',data:{route:'/residence'}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date,channelId:'residence'}}))};reminderEnabled=true;await SecureStore.setItemAsync(CONTEXT,JSON.stringify(config))}}catch{/* Notification permission is optional. */}}
 return {...result,backgroundEnabled,reminderEnabled};
}
export async function revokeResidence(){await stopResidenceSchedule();await mobileRequest('/residence',{method:'DELETE'})}
