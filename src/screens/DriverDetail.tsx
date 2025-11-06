import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { KeyBindings } from '../components/KeyBindings.js';
import { Loading } from '../components/Loading.js';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { f1Client } from '../api/f1-client.js';
import { useAppStore } from '../hooks/useAppStore.js';
import { stylePosition, stylePoints } from '../themes/tokyo-night.js';
import { formatStatus } from '../utils/formatters.js';
import type { DriverLastResult } from '../types/f1.js';

export const DriverDetail: React.FC = () => {
  const [results, setResults] = useState<DriverLastResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedDriverId, goBack } = useAppStore();

  const loadData = async () => {
    if (!selectedDriverId) {
      goBack();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const driverResults = await f1Client.getDriverLastResults(selectedDriverId, 10);
      setResults(driverResults);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDriverId]);

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      goBack();
      return;
    }

    if (input === 'r') {
      loadData();
      return;
    }
  });

  if (isLoading) {
    return (
      <Box flexDirection="column">
        <Header season={f1Client.getCurrentSeason()} />
        <Loading message="Loading driver details..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Header season={f1Client.getCurrentSeason()} />
        <ErrorMessage message={error} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header season={f1Client.getCurrentSeason()} />

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
            DRIVER PERFORMANCE - LAST {results.length} RACES
          </Text>
        </Box>

        <Box flexDirection="column" paddingX={1}>
          {/* Header */}
          <Box>
            <Box width={6}>
              <Text color="cyan" bold>
                Round
              </Text>
            </Box>
            <Box width={30}>
              <Text color="cyan" bold>
                Grand Prix
              </Text>
            </Box>
            <Box width={6}>
              <Text color="cyan" bold>
                Grid
              </Text>
            </Box>
            <Box width={8}>
              <Text color="cyan" bold>
                Finish
              </Text>
            </Box>
            <Box width={20}>
              <Text color="cyan" bold>
                Status
              </Text>
            </Box>
            <Box width={8}>
              <Text color="cyan" bold>
                Points
              </Text>
            </Box>
          </Box>

          {/* Divider */}
          <Box>
            <Text color="gray" dimColor>
              {'─'.repeat(78)}
            </Text>
          </Box>

          {/* Results */}
          {results.map((race) => {
            const result = race.Results[0];
            return (
              <Box key={race.round}>
                <Box width={6}>
                  <Text color="yellow">{race.round}</Text>
                </Box>
                <Box width={30}>
                  <Text color="white">{race.raceName.replace(' Grand Prix', ' GP')}</Text>
                </Box>
                <Box width={6}>
                  <Text color="gray">{result.grid}</Text>
                </Box>
                <Box width={8}>
                  <Text>{stylePosition(result.position)}</Text>
                </Box>
                <Box width={20}>
                  <Text color="gray">{formatStatus(result.status)}</Text>
                </Box>
                <Box width={8}>
                  <Text>{stylePoints(result.points)}</Text>
                </Box>
              </Box>
            );
          })}

          {/* Summary */}
          <Box marginTop={1}>
            <Text color="gray" dimColor>
              Total Points:{' '}
            </Text>
            <Text color="green" bold>
              {results.reduce((sum, race) => sum + parseFloat(race.Results[0].points), 0)}
            </Text>
          </Box>
        </Box>
      </Box>

      <KeyBindings
        bindings={[
          { key: 'r', description: 'refresh' },
          { key: 'esc/q', description: 'back' },
        ]}
      />
    </Box>
  );
};
