import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GoldWave } from '../src/ui/GoldWave';
import { colors, gradients } from '../src/theme';
import { Logo, Screen, T, lightSub, lightText } from '../src/ui/kit';

/** 02 Onboarding: Pay with a look. Fast. Secure. Convenient. (light screen per design). */
export default function Onboarding() {
  const router = useRouter();
  return (
    <Screen style={{ backgroundColor: colors.white, paddingHorizontal: 24 }}>
      <View style={{ alignItems: 'flex-end', paddingTop: 12 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip" hitSlop={12} onPress={() => router.push('/login')}>
          <T size={12} color={lightSub}>
            Skip
          </T>
        </Pressable>
      </View>
      <T w="bold" size={28} color={lightText} style={{ marginTop: 20, lineHeight: 36 }}>
        Pay Smarter{'\n'}with Just Your Face
      </T>
      <T size={14} color={lightSub} style={{ marginTop: 12, lineHeight: 21, maxWidth: 300 }}>
        A faster, safer and more connected way to pay across all your favorite places.
      </T>
      <View style={{flex:1,minHeight:230,marginTop:24,marginBottom:24,backgroundColor:colors.black,borderRadius:24,overflow:'hidden',alignItems:'center',justifyContent:'center'}}><View style={{position:'absolute',bottom:0,left:0,right:0,height:180}}><GoldWave/></View><Logo width={240}/><T size={17} style={{marginTop:25}}>Look. Pay. Go.</T></View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 18 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: i === 0 ? 20 : 7, height: 7, borderRadius: 4, marginHorizontal: 3, backgroundColor: i === 0 ? colors.gold : '#D8DBE3' }} />
        ))}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Get Started" onPress={() => router.push('/login')} style={{ marginBottom: 24 }}>
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 52, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <T w="bold" size={15} color={colors.black}>
            Get Started
          </T>
          <Ionicons name="arrow-forward" size={18} color={colors.black} style={{ position: 'absolute', right: 22 }} />
        </LinearGradient>
      </Pressable>
    </Screen>
  );
}
