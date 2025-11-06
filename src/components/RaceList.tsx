import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import { formatDate } from '../utils/formatters.js';
import type { Race } from '../types/f1.js';
import {
  getRaceNameWidth,
  formatRaceName,
  getTerminalSizeCategory
} from '../utils/responsive.js';

interface RaceListProps {
  races: Race[];
  selectedIndex: number;
}

export const RaceList: React.FC<RaceListProps> = ({ races, selectedIndex }) => {
  // Calculate responsive column widths based on terminal size
  const { raceNameWidth, dateWidth, winnerWidth, statusWidth, totalWidth } = useMemo(() => {
    const sizeCategory = getTerminalSizeCategory();
    const raceW = getRaceNameWidth();

    // Responsive widths
    const dateW = sizeCategory === 'small' ? 10 : 15;
    const winnerW = sizeCategory === 'small' ? 8 : sizeCategory === 'medium' ? 10 : 15;
    const statusW = sizeCategory === 'small' ? 10 : 15;
    const total = 4 + 1 + raceW + 1 + dateW + 1 + winnerW + 1 + statusW;

    return {
      raceNameWidth: raceW,
      dateWidth: dateW,
      winnerWidth: winnerW,
      statusWidth: statusW,
      totalWidth: total,
    };
  }, []);

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
      const code = winner.Driver.code || winner.Driver.familyName.substring(0, 3).toUpperCase();
      const fullName = `${winner.Driver.givenName} ${winner.Driver.familyName}`;

      // Show full name on larger terminals
      if (winnerWidth >= 15) {
        return fullName.length <= winnerWidth ? fullName : code;
      }
      return code;
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
        <Box width={raceNameWidth}>
          <Text color="cyan" bold>
            Grand Prix
          </Text>
        </Box>
        <Box width={dateWidth}>
          <Text color="cyan" bold>
            Date
          </Text>
        </Box>
        <Box width={winnerWidth}>
          <Text color="cyan" bold>
            Winner
          </Text>
        </Box>
        <Box width={statusWidth}>
          <Text color="cyan" bold>
            Status
          </Text>
        </Box>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(totalWidth)}
        </Text>
      </Box>

      {/* Rows */}
      {races.map((race, index) => {
        const isSelected = index === selectedIndex;
        const status = getRaceStatus(race);
        const winner = getWinner(race);
        const displayRaceName = formatRaceName(race.raceName, raceNameWidth);

        return (
          <Box key={race.round}>
            <Box width={4}>
              <Text color="yellow">{race.round}</Text>
            </Box>
            <Box width={raceNameWidth}>
              <Text color="white">{displayRaceName}</Text>
            </Box>
            <Box width={dateWidth}>
              <Text color="gray">{formatDate(race.date)}</Text>
            </Box>
            <Box width={winnerWidth}>
              <Text color="cyan">{winner}</Text>
            </Box>
            <Box width={statusWidth}>
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
