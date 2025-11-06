import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  getRaceNameWidth,
  formatRaceName,
  getTerminalSizeCategory
} from '../utils/responsive.js';

export const DriverDetail: React.FC = () => {
  const [results, setResults] = useState<DriverLastResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedDriverId, goBack } = useAppStore();

  const loadData = useCallback(async () => {
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
  }, [selectedDriverId, goBack]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Calculate responsive column widths based on terminal size
  const { raceNameWidth, statusWidth, totalWidth } = useMemo(() => {
    const sizeCategory = getTerminalSizeCategory();
    const raceW = getRaceNameWidth();

    // Responsive widths
    const statusW = sizeCategory === 'small' ? 12 : sizeCategory === 'medium' ? 15 : 20;
    const total = 6 + 1 + raceW + 1 + 6 + 1 + 8 + 1 + statusW + 1 + 8;

    return {
      raceNameWidth: raceW,
      statusWidth: statusW,
      totalWidth: total,
    };
  }, []);

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
            <Box width={raceNameWidth}>
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
            <Box width={statusWidth}>
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
              {'─'.repeat(totalWidth)}
            </Text>
          </Box>

          {/* Results */}
          {results.map((race) => {
            const result = race.Results[0];
            const displayRaceName = formatRaceName(race.raceName, raceNameWidth);
            const displayStatus = formatStatus(result.status);
            const truncatedStatus = displayStatus.length > statusWidth
              ? displayStatus.substring(0, statusWidth - 1) + '…'
              : displayStatus;

            return (
              <Box key={race.round}>
                <Box width={6}>
                  <Text color="yellow">{race.round}</Text>
                </Box>
                <Box width={raceNameWidth}>
                  <Text color="white">{displayRaceName}</Text>
                </Box>
                <Box width={6}>
                  <Text color="gray">{result.grid}</Text>
                </Box>
                <Box width={8}>
                  <Text>{stylePosition(result.position)}</Text>
                </Box>
                <Box width={statusWidth}>
                  <Text color="gray">{truncatedStatus}</Text>
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
