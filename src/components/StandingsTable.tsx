import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import type { DriverStanding, ConstructorStanding } from '../types/f1.js';
import {
  getDriverNameWidth,
  getTeamNameWidth,
  formatDriverName,
  formatTeamName
} from '../utils/responsive.js';

interface DriverTableProps {
  standings: DriverStanding[];
  selectedIndex: number;
}

interface ConstructorTableProps {
  standings: ConstructorStanding[];
  selectedIndex: number;
}

// Strip ANSI codes to get actual visible length
const getVisibleLength = (str: string): number => {
  return str.replace(/\x1b\[[0-9;]*m/g, '').length;
};

// Pad string to the right (accounts for ANSI codes)
const padEnd = (str: string | number, length: number): string => {
  const text = String(str);
  const visibleLength = getVisibleLength(text);
  const padLength = Math.max(0, length - visibleLength);
  return text + ' '.repeat(padLength);
};

// Pad string to the left (accounts for ANSI codes)
const padStart = (str: string | number, length: number): string => {
  const text = String(str);
  const visibleLength = getVisibleLength(text);
  const padLength = Math.max(0, length - visibleLength);
  return ' '.repeat(padLength) + text;
};

export const DriverTable = React.memo<DriverTableProps>(({ standings, selectedIndex }) => {
  // Calculate responsive column widths based on terminal size
  const { driverWidth, teamWidth, totalWidth } = useMemo(() => {
    const driverW = getDriverNameWidth();
    const teamW = getTeamNameWidth();
    const total = 4 + 1 + driverW + 1 + teamW + 1 + 6 + 1 + 6; // pos + spaces + driver + spaces + team + spaces + pts + spaces + wins

    return {
      driverWidth: driverW,
      teamWidth: teamW,
      totalWidth: total,
    };
  }, []);

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        <Text color="cyan" bold>
          {padEnd('Pos', 4)} {padEnd('Driver', driverWidth)} {padEnd('Team', teamWidth)} {padStart('Pts', 6)} {padStart('Wins', 6)}
        </Text>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(totalWidth)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;
        const position = standing.position;

        // Format driver name responsively
        const displayDriver = formatDriverName(
          standing.Driver.givenName,
          standing.Driver.familyName,
          standing.Driver.code
        );

        // Format team name responsively
        const teamName = standing.Constructors[0]?.name || 'N/A';
        const displayTeam = formatTeamName(teamName, teamWidth);

        const points = standing.points;
        const wins = standing.wins;

        // Improved color scheme with better visibility
        const positionColor = position === '1' ? 'yellow' :
                             position === '2' ? 'white' :
                             position === '3' ? '#ff9e64' :
                             'white';

        return (
          <Box key={standing.Driver.driverId}>
            <Text>
              <Text color={positionColor} bold={parseInt(position) <= 3}>
                {padEnd(position, 4)}
              </Text>
              <Text color="cyan">
                {padEnd(displayDriver, driverWidth)}
              </Text>
              <Text color="magenta">
                {padEnd(displayTeam, teamWidth)}
              </Text>
              <Text color="green" bold>
                {padStart(points, 6)}
              </Text>
              <Text color="yellow">
                {padStart(wins, 6)}
              </Text>
              {isSelected && (
                <Text color="cyan" bold> ← </Text>
              )}
            </Text>
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Total: {standings.length} drivers
        </Text>
      </Box>
    </Box>
  );
});

DriverTable.displayName = 'DriverTable';

export const ConstructorTable = React.memo<ConstructorTableProps>(({ standings, selectedIndex }) => {
  // Calculate responsive column widths based on terminal size
  const { teamWidth, totalWidth } = useMemo(() => {
    const teamW = getTeamNameWidth();
    const total = 4 + 1 + teamW + 1 + 6 + 1 + 6; // pos + spaces + team + spaces + pts + spaces + wins

    return {
      teamWidth: teamW,
      totalWidth: total,
    };
  }, []);

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        <Text color="magenta" bold>
          {padEnd('Pos', 4)} {padEnd('Constructor', teamWidth)} {padStart('Pts', 6)} {padStart('Wins', 6)}
        </Text>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(totalWidth)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;
        const position = standing.position;

        // Format team name responsively
        const teamName = standing.Constructor.name;
        const displayTeam = formatTeamName(teamName, teamWidth);

        const points = standing.points;
        const wins = standing.wins;

        // Improved color scheme with better visibility
        const positionColor = position === '1' ? 'yellow' :
                             position === '2' ? 'white' :
                             position === '3' ? '#ff9e64' :
                             'white';

        return (
          <Box key={standing.Constructor.constructorId}>
            <Text>
              <Text color={positionColor} bold={parseInt(position) <= 3}>
                {padEnd(position, 4)}
              </Text>
              <Text color="magenta" bold>
                {padEnd(displayTeam, teamWidth)}
              </Text>
              <Text color="green" bold>
                {padStart(points, 6)}
              </Text>
              <Text color="yellow">
                {padStart(wins, 6)}
              </Text>
              {isSelected && (
                <Text color="cyan" bold> ← </Text>
              )}
            </Text>
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Total: {standings.length} constructors
        </Text>
      </Box>
    </Box>
  );
});

ConstructorTable.displayName = 'ConstructorTable';
