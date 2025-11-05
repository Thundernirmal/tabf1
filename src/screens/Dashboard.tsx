import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { KeyBindings } from '../components/KeyBindings.js';
import { Loading } from '../components/Loading.js';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { DriverTable, ConstructorTable } from '../components/StandingsTable.js';
import { f1Client } from '../api/f1-client.js';
import { useAppStore } from '../hooks/useAppStore.js';
import type { DriverStanding, ConstructorStanding } from '../types/f1.js';

type FocusPanel = 'drivers' | 'constructors';

const KEY_BINDINGS = [
  { key: '←/→', description: 'switch panel' },
  { key: '↑/↓', description: 'navigate' },
  { key: 'enter', description: 'details' },
  { key: 'R', description: 'races' },
  { key: 'r', description: 'refresh' },
  { key: 'q', description: 'quit' },
];

export const Dashboard: React.FC = () => {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusPanel, setFocusPanel] = useState<FocusPanel>('drivers');
  const [selectedDriverIndex, setSelectedDriverIndex] = useState(0);
  const [selectedConstructorIndex, setSelectedConstructorIndex] = useState(0);

  const { goToRaces, goToDriverDetail, goToConstructorDetail } = useAppStore();

  const loadData = useCallback(async (force: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const [drivers, constructors] = await Promise.all([
        f1Client.getDriverStandings(force),
        f1Client.getConstructorStandings(force),
      ]);

      setDriverStandings(drivers);
      setConstructorStandings(constructors);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useInput(useCallback((input, key) => {
    if (isLoading) return;

    // Global shortcuts
    if (input === 'r') {
      loadData(true);
      return;
    }

    if (input === 'R') {
      goToRaces();
      return;
    }

    // Panel switching
    if (key.leftArrow || input === 'h') {
      setFocusPanel('drivers');
      return;
    }

    if (key.rightArrow || input === 'l') {
      setFocusPanel('constructors');
      return;
    }

    if (key.tab) {
      setFocusPanel((prev) => (prev === 'drivers' ? 'constructors' : 'drivers'));
      return;
    }

    // Navigation within panels
    if (key.upArrow || input === 'k') {
      if (focusPanel === 'drivers') {
        setSelectedDriverIndex((prev) => Math.max(0, prev - 1));
      } else {
        setSelectedConstructorIndex((prev) => Math.max(0, prev - 1));
      }
      return;
    }

    if (key.downArrow || input === 'j') {
      if (focusPanel === 'drivers') {
        setSelectedDriverIndex((prev) => Math.min(driverStandings.length - 1, prev + 1));
      } else {
        setSelectedConstructorIndex((prev) => Math.min(constructorStandings.length - 1, prev + 1));
      }
      return;
    }

    // Open detail view
    if (key.return || input === 'o') {
      if (focusPanel === 'drivers') {
        const driver = driverStandings[selectedDriverIndex];
        if (driver) {
          goToDriverDetail(driver.Driver.driverId);
        }
      } else {
        const constructor = constructorStandings[selectedConstructorIndex];
        if (constructor) {
          goToConstructorDetail(constructor.Constructor.constructorId);
        }
      }
      return;
    }
  }, [isLoading, loadData, goToRaces, focusPanel, driverStandings, constructorStandings, selectedDriverIndex, selectedConstructorIndex, goToDriverDetail, goToConstructorDetail]));

  const season = useMemo(() => f1Client.getCurrentSeason(), []);

  if (isLoading && driverStandings.length === 0) {
    return (
      <Box flexDirection="column">
        <Header season={season} />
        <Loading message="Loading standings..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Header season={season} />
        <ErrorMessage message={error} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header season={season} />

      <Box>
        {/* Drivers Panel */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={focusPanel === 'drivers' ? 'cyan' : 'gray'}
          paddingX={1}
          paddingY={0}
          marginRight={1}
          width="50%"
        >
          <Box justifyContent="center" marginBottom={1}>
            <Text color="cyan" bold>
              🏎️  DRIVER STANDINGS
            </Text>
          </Box>
          <DriverTable standings={driverStandings} selectedIndex={selectedDriverIndex} />
        </Box>

        {/* Constructors Panel */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={focusPanel === 'constructors' ? 'magenta' : 'gray'}
          paddingX={1}
          paddingY={0}
          width="50%"
        >
          <Box justifyContent="center" marginBottom={1}>
            <Text color="magenta" bold>
              🏁  CONSTRUCTOR STANDINGS
            </Text>
          </Box>
          <ConstructorTable
            standings={constructorStandings}
            selectedIndex={selectedConstructorIndex}
          />
        </Box>
      </Box>

      <KeyBindings bindings={KEY_BINDINGS} />
    </Box>
  );
};
