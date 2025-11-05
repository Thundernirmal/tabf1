import React from 'react';
import { useApp, useInput } from 'ink';
import { useAppStore } from './hooks/useAppStore.js';
import { Dashboard } from './screens/Dashboard.js';
import { Races } from './screens/Races.js';
import { DriverDetail } from './screens/DriverDetail.js';
import { ConstructorDetail } from './screens/ConstructorDetail.js';
import { RaceDetail } from './screens/RaceDetail.js';

export const App: React.FC = () => {
  const { exit } = useApp();
  const currentScreen = useAppStore((state) => state.currentScreen);

  // Global quit handler
  useInput((input) => {
    if (input === 'q' && currentScreen === 'dashboard') {
      exit();
    }
  });

  switch (currentScreen) {
    case 'dashboard':
      return <Dashboard />;
    case 'races':
      return <Races />;
    case 'driver-detail':
      return <DriverDetail />;
    case 'constructor-detail':
      return <ConstructorDetail />;
    case 'race-detail':
      return <RaceDetail />;
    default:
      return <Dashboard />;
  }
};
