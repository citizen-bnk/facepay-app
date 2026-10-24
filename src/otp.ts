import { Platform } from 'react-native';
import { mobileRequest, saveMobileToken } from './mobile-api';
export { normalisePhone } from './phone';
export const DEMO_OTP = '123456';
export const DEMO_OTP_ENABLED = process.env.EXPO_PUBLIC_DEMO_MODE === 'true' || (Platform.OS === 'web' && process.env.EXPO_PUBLIC_DEMO_MODE !== 'false');
let requestedPhone:string|null=null;
let challengeId:string|null=null;
export async function requestOtp(phone:string):Promise<string>{
 if(DEMO_OTP_ENABLED){requestedPhone=phone;await new Promise(r=>setTimeout(r,300));return 'demo'}
 const result=await mobileRequest<{challengeId:string;channel:string}>('/otp/start',{method:'POST',public:true,body:{phone}});challengeId=result.challengeId;requestedPhone=phone;return result.channel;
}
export async function otpDeliveryStatus():Promise<'demo'|'whatsapp'|'sms'>{
 if(DEMO_OTP_ENABLED)return 'demo';if(!challengeId)return 'whatsapp';
 const result=await mobileRequest<{channel:'whatsapp'|'sms'}>('/otp/status/'+challengeId,{public:true});return result.channel;
}
export async function verifyOtp(phone:string,code:string):Promise<boolean>{
 if(requestedPhone!==phone)return false;
 if(DEMO_OTP_ENABLED){const valid=code===DEMO_OTP;if(valid)requestedPhone=null;return valid}
 if(!challengeId)return false;
 const result=await mobileRequest<{token:string}>('/otp/verify',{method:'POST',public:true,body:{challengeId,code}});await saveMobileToken(result.token);requestedPhone=null;challengeId=null;return true;
}
