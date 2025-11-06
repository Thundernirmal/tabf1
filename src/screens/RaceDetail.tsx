import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { KeyBindings } from '../components/KeyBindings.js';
import { Loading } from '../components/Loading.js';
import { ErrorMessage } from '../components/ErrorMessage.js';
import { f1Client } from '../api/f1-client.js';
import { useAppStore } from '../hooks/useAppStore.js';
import { stylePosition, stylePoints } from '../themes/tokyo-night.js';
import { formatRaceTime, formatStatus, formatDate } from '../utils/formatters.js';
import type { Race } from '../types/f1.js';
import {
  getDriverNameWidth,
  getTeamNameWidth,
  formatDriverName,
  formatTeamName,
  getTerminalSizeCategory
} from '../utils/responsive.js';

export const RaceDetail: React.FC = () => {
  const [race, setRace] = useState<Race | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedRaceSeason, selectedRaceRound, goBack } = useAppStore();

  const loadData = useCallback(async () => {
    if (!selectedRaceSeason || !selectedRaceRound) {
      goBack();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const raceData = await f1Client.getRaceResults(selectedRaceSeason, selectedRaceRound);
      setRace(raceData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRaceSeason, selectedRaceRound, goBack]);

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
        <Loading message="Loading race results..." />
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

  if (!race || !race.Results || race.Results.length === 0) {
    return (
      <Box flexDirection="column">
        <Header season={f1Client.getCurrentSeason()} />
        <Box
          borderStyle="round"
          borderColor="yellow"
          padding={2}
          marginX={2}
          justifyContent="center"
        >
          <Text color="yellow">No results available for this race yet.</Text>
        </Box>
        <KeyBindings bindings={[{ key: 'esc/q', description: 'back' }]} />
      </Box>
    );
  }

  // Calculate responsive column widths based on terminal size
  const { driverWidth, teamWidth, statusWidth, totalWidth } = useMemo(() => {
    const sizeCategory = getTerminalSizeCategory();
    const driverW = getDriverNameWidth();
    const teamW = getTeamNameWidth();

    // Responsive widths
    const statusW = sizeCategory === 'small' ? 10 : sizeCategory === 'medium' ? 12 : 15;
    const total = 5 + 1 + driverW + 1 + teamW + 1 + 6 + 1 + statusW + 1 + 7;

    return {
      driverWidth: driverW,
      teamWidth: teamW,
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
        <Box justifyContent="center" marginBottom={0}>
          <Text color="cyan" bold>
            {race.raceName.toUpperCase()}
          </Text>
        </Box>
        <Box justifyContent="center" marginBottom={1}>
          <Text color="gray" dimColor>
            {race.Circuit.circuitName} • {formatDate(race.date, race.time)}
          </Text>
        </Box>

        <Box flexDirection="column" paddingX={1}>
          {/* Header */}
          <Box>
            <Box width={5}>
              <Text color="cyan" bold>
                Pos
              </Text>
            </Box>
            <Box width={driverWidth}>
              <Text color="cyan" bold>
                Driver
              </Text>
            </Box>
            <Box width={teamWidth}>
              <Text color="cyan" bold>
                Team
              </Text>
            </Box>
            <Box width={6}>
              <Text color="cyan" bold>
                Grid
              </Text>
            </Box>
            <Box width={statusWidth}>
              <Text color="cyan" bold>
                Time/Status
              </Text>
            </Box>
            <Box width={7}>
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
          {race.Results.map((result) => {
            const displayDriver = formatDriverName(
              result.Driver.givenName,
              result.Driver.familyName,
              result.Driver.code
            );
            const displayTeam = formatTeamName(result.Constructor.name, teamWidth);
            const statusText = result.Time ? formatRaceTime(result.Time.time) : formatStatus(result.status);
            const truncatedStatus = statusText.length > statusWidth
              ? statusText.substring(0, statusWidth - 1) + '…'
              : statusText;

            return (
              <Box key={result.position}>
                <Box width={5}>
                  <Text>{stylePosition(result.position)}</Text>
                </Box>
                <Box width={driverWidth}>
                  <Text color="white">{displayDriver}</Text>
                </Box>
                <Box width={teamWidth}>
                  <Text color="magenta">{displayTeam}</Text>
                </Box>
                <Box width={6}>
                  <Text color="gray">{result.grid}</Text>
                </Box>
                <Box width={statusWidth}>
                  <Text color="gray">{truncatedStatus}</Text>
                </Box>
                <Box width={7}>
                  <Text>{stylePoints(result.points)}</Text>
                </Box>
              </Box>
            );
          })}

          {/* Footer */}
          <Box marginTop={1}>
            <Text color="gray" dimColor>
              {race.Results.length} classified finishers
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
