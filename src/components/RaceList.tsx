import React from 'react';
import { Box, Text } from 'ink';
import { formatDate } from '../utils/formatters.js';
import type { Race } from '../types/f1.js';

interface RaceListProps {
  races: Race[];
  selectedIndex: number;
}

export const RaceList: React.FC<RaceListProps> = ({ races, selectedIndex }) => {
  const getRaceStatus = (race: Race): { status: string; color: string } => {
    const now = new Date();
    const raceDate = new Date(race.date);

    if (race.Results && race.Results.length > 0) {
      return { status: '✓ Completed', color: 'green' };
    } else if (raceDate < now) {
      return { status: '⏳ No Data', color: 'yellow' };
    } else {
      return { status: '📅 Scheduled', color: 'gray' };
    }
  };

  const getWinner = (race: Race): string => {
    if (race.Results && race.Results.length > 0) {
      const winner = race.Results[0];
      return `${winner.Driver.code || winner.Driver.familyName}`;
    }
    return 'TBD';
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box>
        <Box width={4}>
          <Text color="cyan" bold>
            Rnd
          </Text>
        </Box>
        <Box width={28}>
          <Text color="cyan" bold>
            Grand Prix
          </Text>
        </Box>
        <Box width={15}>
          <Text color="cyan" bold>
            Date
          </Text>
        </Box>
        <Box width={10}>
          <Text color="cyan" bold>
            Winner
          </Text>
        </Box>
        <Box width={15}>
          <Text color="cyan" bold>
            Status
          </Text>
        </Box>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(72)}
        </Text>
      </Box>

      {/* Rows */}
      {races.map((race, index) => {
        const isSelected = index === selectedIndex;
        const status = getRaceStatus(race);
        const winner = getWinner(race);

        return (
          <Box key={race.round}>
            <Box width={4}>
              <Text color="yellow">{race.round}</Text>
            </Box>
            <Box width={28}>
              <Text color="white">{race.raceName.replace(' Grand Prix', ' GP')}</Text>
            </Box>
            <Box width={15}>
              <Text color="gray">{formatDate(race.date)}</Text>
            </Box>
            <Box width={10}>
              <Text color="cyan">{winner}</Text>
            </Box>
            <Box width={15}>
              <Text color={status.color as any}>{status.status}</Text>
            </Box>
            {isSelected && (
              <Text color="cyan" bold>
                {' ← '}
              </Text>
            )}
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          {races.length} races
        </Text>
      </Box>
    </Box>
  );
};
