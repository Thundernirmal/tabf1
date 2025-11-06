import React from 'react';
import { Box, Text } from 'ink';
import { formatDate } from '../utils/formatters.js';
import { getRaceListWidths, formatDriverName, truncateText } from '../utils/responsive.js';
import type { Race } from '../types/f1.js';

interface RaceListProps {
  races: Race[];
  selectedIndex: number;
}

export const RaceList: React.FC<RaceListProps> = ({ races, selectedIndex }) => {
  const widths = getRaceListWidths();

  const getRaceStatus = (race: Race): { status: string; color: string } => {
    const now = new Date();
    const raceDate = new Date(race.date);

    if (race.Results && race.Results.length > 0) {
      return { status: 'Completed', color: '#9ece6a' };
    } else if (raceDate < now) {
      return { status: 'No Data', color: '#e0af68' };
    } else {
      return { status: 'Scheduled', color: '#9aa5ce' };
    }
  };

  const getWinner = (race: Race, maxWidth: number): string => {
    if (race.Results && race.Results.length > 0) {
      const winner = race.Results[0];
      if (maxWidth >= 18) {
        return formatDriverName(
          winner.Driver.givenName,
          winner.Driver.familyName,
          winner.Driver.code,
          maxWidth
        );
      } else {
        return winner.Driver.code || winner.Driver.familyName.substring(0, maxWidth);
      }
    }
    return 'TBD';
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box>
        <Box width={widths.round}>
          <Text color="cyan" bold>
            Rnd
          </Text>
        </Box>
        <Box width={widths.grandPrix}>
          <Text color="cyan" bold>
            Grand Prix
          </Text>
        </Box>
        <Box width={widths.date}>
          <Text color="cyan" bold>
            Date
          </Text>
        </Box>
        <Box width={widths.winner}>
          <Text color="cyan" bold>
            Winner
          </Text>
        </Box>
        <Box width={widths.status}>
          <Text color="cyan" bold>
            Status
          </Text>
        </Box>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="#7aa2f7">
          {'─'.repeat(widths.total)}
        </Text>
      </Box>

      {/* Rows */}
      {races.map((race, index) => {
        const isSelected = index === selectedIndex;
        const status = getRaceStatus(race);
        const winner = getWinner(race, widths.winner);
        const raceName = truncateText(race.raceName.replace(' Grand Prix', ' GP'), widths.grandPrix);

        return (
          <Box key={race.round}>
            <Box width={widths.round}>
              <Text color="#e0af68">{race.round}</Text>
            </Box>
            <Box width={widths.grandPrix}>
              <Text color="#c0caf5">{raceName}</Text>
            </Box>
            <Box width={widths.date}>
              <Text color="#9aa5ce">{formatDate(race.date)}</Text>
            </Box>
            <Box width={widths.winner}>
              <Text color="#7dcfff">{winner}</Text>
            </Box>
            <Box width={widths.status}>
              <Text color={status.color}>{status.status}</Text>
            </Box>
            {isSelected && (
              <Text color="#7dcfff" bold>
                {' ← '}
              </Text>
            )}
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="#9aa5ce">
          {races.length} races
        </Text>
      </Box>
    </Box>
  );
};
