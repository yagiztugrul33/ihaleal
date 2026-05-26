import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

const homeIcon = require('@/assets/images/tabIcons/home.png');
const exploreIcon = require('@/assets/images/tabIcons/explore.png');

export default function TabsLayout() {
  const scheme = useColorScheme();
  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={palette.background}
      indicatorColor={palette.backgroundElement}
      labelStyle={{ selected: { color: palette.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Ana</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={homeIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="borsa">
        <NativeTabs.Trigger.Label>Borsa</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={exploreIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ilanlar">
        <NativeTabs.Trigger.Label>İlanlar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={homeIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="degerleme">
        <NativeTabs.Trigger.Label>Değerleme</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={exploreIcon} renderingMode="template" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profil">
        <NativeTabs.Trigger.Label>Profil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={homeIcon} renderingMode="template" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
