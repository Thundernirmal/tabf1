import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { KeyBindings } from '../components/KeyBindings.js';
import { Loading } from '../components/Loading.js';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { RaceList } from '../components/RaceList.js';
import { f1Client } from '../api/f1-client.js';
import { useAppStore } from '../hooks/useAppStore.js';
import type { Race } from '../types/f1.js';

const KEY_BINDINGS = [
  { key: '↑/↓', description: 'navigate' },
  { key: 'enter', description: 'view results' },
  { key: 'r', description: 'refresh' },
  { key: 'esc/q', description: 'back' },
];

export const Races: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { goBack, goToRaceDetail } = useAppStore();

  const loadData = useCallback(async (force: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const raceData = await f1Client.getAllRaces(undefined, force);
      setRaces(raceData);
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

    if (key.escape || input === 'q') {
      goBack();
      return;
    }

    if (input === 'r') {
      loadData(true);
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => Math.min(races.length - 1, prev + 1));
      return;
    }

    if (key.return || input === 'o') {
      const race = races[selectedIndex];
      if (race && race.Results && race.Results.length > 0) {
        goToRaceDetail(race.season, race.round);
      }
      return;
    }
  }, [isLoading, loadData, goBack, races, selectedIndex, goToRaceDetail]));

  const season = useMemo(() => f1Client.getCurrentSeason(), []);

  if (isLoading && races.length === 0) {
    return (
      <Box flexDirection="column">
        <Header season={season} />
        <Loading message="Loading race calendar..." />
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

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        paddingX={1}
        paddingY={0}
        marginX={2}
      >
        <Box justifyContent="center" marginBottom={1}>
          <Text color="cyan" bold>
            🏁  RACE CALENDAR & RESULTS
          </Text>
        </Box>
        <RaceList races={races} selectedIndex={selectedIndex} />
      </Box>

      <KeyBindings bindings={KEY_BINDINGS} />
    </Box>
  );
};
