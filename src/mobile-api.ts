import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
export const MOBILE_API_URL=(process.env.EXPO_PUBLIC_MOBILE_API_URL||'https://facepay-core.vercel.app').replace(/\/+$/,'');
let memoryToken:string|null=null;
export async function mobileToken(){return Platform.OS==='web'?memoryToken:SecureStore.getItemAsync('facepay-mobile-token')}
export async function saveMobileToken(token:string){memoryToken=token;if(Platform.OS!=='web')await SecureStore.setItemAsync('facepay-mobile-token',token)}
export async function clearMobileToken(){memoryToken=null;if(Platform.OS!=='web')await SecureStore.deleteItemAsync('facepay-mobile-token')}
export async function mobileRequest<T>(path:string,options:{method?:string;body?:unknown;public?:boolean}={}):Promise<T>{
 const token=options.public?null:await mobileToken();if(!options.public&&!token)throw new Error('Verify your phone through the live WhatsApp service before using residence verification.');
 const response=await fetch(MOBILE_API_URL+'/mobile'+path,{method:options.method||'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:options.body===undefined?undefined:JSON.stringify(options.body),signal:AbortSignal.timeout(20000)});
 const data=await response.json();if(!response.ok)throw new Error(data.error?.message||'The service could not complete your request.');return data as T;
}
