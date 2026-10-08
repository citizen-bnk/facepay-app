import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { GoldButton, Screen, T } from '../src/ui/kit';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <T w="bold" size={22}>
          Page not found
        </T>
        <T color="#8E98AD" style={{ marginVertical: 12, textAlign: 'center' }}>
          That screen does not exist.
        </T>
        <GoldButton label="Go to Home" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
