const {withDangerousMod,withMainApplication}=require('expo/config-plugins');const fs=require('fs'),path=require('path');
module.exports=function withDeviceLocation(config){
 config=withMainApplication(config,c=>{const marker='// FACEPAY device location';if(!c.modResults.contents.includes(marker))c.modResults.contents=c.modResults.contents.replace('.packages.apply {','.packages.apply {\n              '+marker+'\n              add(FacePayLocationPackage())');return c});
 return withDangerousMod(config,['android',async c=>{const pkg=c.android.package,dir=path.join(c.modRequest.platformProjectRoot,'app/src/main/java',...pkg.split('.'));fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'FacePayLocationPackage.kt'),`package ${pkg}
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
class FacePayLocationPackage:ReactPackage {
 override fun createNativeModules(context:ReactApplicationContext):List<NativeModule> = listOf(FacePayLocationModule(context))
 override fun createViewManagers(context:ReactApplicationContext):List<ViewManager<*, *>> = emptyList()
}
`);
 fs.writeFileSync(path.join(dir,'FacePayLocationModule.kt'),`package ${pkg}
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.location.Geocoder
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

class FacePayLocationModule(private val app:ReactApplicationContext):ReactContextBaseJavaModule(app) {
 override fun getName()="FacePayLocation"
 @ReactMethod fun geocode(address:String,promise:Promise){Thread{try{
  @Suppress("DEPRECATION") val result=Geocoder(app,Locale.getDefault()).getFromLocationName(address,1)?.firstOrNull()
  if(result==null){promise.reject("ADDRESS_UNAVAILABLE","Your device could not locate that address.");return@Thread}
  val map=Arguments.createMap();map.putDouble("latitude",result.latitude);map.putDouble("longitude",result.longitude);promise.resolve(map)
 }catch(e:Exception){promise.reject("GEOCODER_UNAVAILABLE","Your device's address service is unavailable. Please retry later.")}}.start()}
 @ReactMethod fun getPosition(promise:Promise){
  val manager=app.getSystemService(android.content.Context.LOCATION_SERVICE) as LocationManager
  val handler=Handler(Looper.getMainLooper());val settled=AtomicBoolean(false)
  val provider=if(manager.isProviderEnabled(LocationManager.GPS_PROVIDER))LocationManager.GPS_PROVIDER else if(manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER))LocationManager.NETWORK_PROVIDER else null
  if(provider==null){promise.reject("LOCATION_DISABLED","Enable device location services to record a check.");return}
  lateinit var listener:LocationListener
  val timeout=Runnable{if(settled.compareAndSet(false,true)){manager.removeUpdates(listener);promise.reject("GPS_TIMEOUT","A fresh GPS fix was not available. Try near a window or outdoors at home.")}}
  listener=object:LocationListener{
   override fun onLocationChanged(location:Location){if(!settled.compareAndSet(false,true))return;handler.removeCallbacks(timeout);manager.removeUpdates(this)
    val map=Arguments.createMap();map.putDouble("latitude",location.latitude);map.putDouble("longitude",location.longitude);map.putDouble("accuracy",if(location.hasAccuracy())location.accuracy.toDouble() else 9999.0);map.putDouble("timestamp",location.time.toDouble())
    @Suppress("DEPRECATION") val mocked=location.isFromMockProvider;map.putBoolean("mocked",mocked);promise.resolve(map)
   }
   override fun onProviderEnabled(provider:String){}
   override fun onProviderDisabled(provider:String){}
   @Deprecated("Android compatibility") override fun onStatusChanged(provider:String?,status:Int,extras:Bundle?){}
  }
  handler.post{try{@Suppress("DEPRECATION") manager.requestSingleUpdate(provider,listener,Looper.getMainLooper());handler.postDelayed(timeout,25000)}catch(e:SecurityException){promise.reject("LOCATION_PERMISSION","Location permission is required.")}catch(e:Exception){promise.reject("LOCATION_UNAVAILABLE","Device GPS is not available. Please retry.")}}
 }
}
`);return c}]);
};
