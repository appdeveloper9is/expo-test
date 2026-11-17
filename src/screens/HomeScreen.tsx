import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../App';

export default function HomeScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        YouTube player POC
      </Text>
      <Text style={styles.body}>
        The demo plays a YouTube video from a start time with custom controls. Coming back here pauses the
        player.
      </Text>
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => navigation.navigate('Demo')}>
        <Text style={styles.buttonText}>Open player demo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: '#f2f2f7' },
  title: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 15, color: '#636366', textAlign: 'center', maxWidth: 480 },
  button: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#0a63c9' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
