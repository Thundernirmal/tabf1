import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { KeyBindings } from '../components/KeyBindings.js';
import { Loading } from '../components/Loading.js';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { f1Client } from '../api/f1-client.js';
import { useAppStore } from '../hooks/useAppStore.js';
import { stylePosition, stylePoints } from '../themes/tokyo-night.js';
import type { ConstructorLastResult } from '../types/f1.js';

export const ConstructorDetail: React.FC = () => {
  const [results, setResults] = useState<ConstructorLastResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedConstructorId, goBack } = useAppStore();

  const loadData = async () => {
    if (!selectedConstructorId) {
      goBack();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const constructorResults = await f1Client.getConstructorLastResults(selectedConstructorId, 10);
      setResults(constructorResults);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedConstructorId]);

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
        <Loading message="Loading constructor details..." />
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
        borderColor="magenta"
        paddingX={1}
        paddingY={0}
        marginX={2}
      >
        <Box justifyContent="center" marginBottom={1}>
          <Text color="magenta" bold>
            🏁  CONSTRUCTOR PERFORMANCE - LAST {results.length} RACES
          </Text>
        </Box>

        <Box flexDirection="column" paddingX={1}>
          {/* Header */}
          <Box>
            <Box width={6}>
              <Text color="magenta" bold>
                Round
              </Text>
            </Box>
            <Box width={30}>
              <Text color="magenta" bold>
                Grand Prix
              </Text>
            </Box>
            <Box width={6}>
              <Text color="magenta" bold>
                Car #
              </Text>
            </Box>
            <Box width={20}>
              <Text color="magenta" bold>
                Driver
              </Text>
            </Box>
            <Box width={8}>
              <Text color="magenta" bold>
                Finish
              </Text>
            </Box>
            <Box width={8}>
              <Text color="magenta" bold>
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
          {results.flatMap((race) =>
            race.Results.map((result, idx) => (
              <Box key={`${race.round}-${idx}`}>
                <Box width={6}>
                  <Text color="yellow">{race.round}</Text>
                </Box>
                <Box width={30}>
                  <Text color="white">{race.raceName.replace(' Grand Prix', ' GP')}</Text>
                </Box>
                <Box width={6}>
                  <Text color="gray">{result.number}</Text>
                </Box>
                <Box width={20}>
                  <Text color="cyan">
                    {result.Driver.code || result.Driver.familyName}
                  </Text>
                </Box>
                <Box width={8}>
                  <Text>{stylePosition(result.position)}</Text>
                </Box>
                <Box width={8}>
                  <Text>{stylePoints(result.points)}</Text>
                </Box>
              </Box>
            ))
          )}

          {/* Summary */}
          <Box marginTop={1}>
            <Text color="gray" dimColor>
              Total Points:{' '}
            </Text>
            <Text color="green" bold>
              {results.reduce(
                (sum, race) =>
                  sum + race.Results.reduce((raceSum, r) => raceSum + parseFloat(r.points), 0),
                0
              )}
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
