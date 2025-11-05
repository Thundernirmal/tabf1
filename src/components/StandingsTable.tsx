import React from 'react';
import { Box, Text } from 'ink';
import type { DriverStanding, ConstructorStanding } from '../types/f1.js';

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
  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        <Text color="cyan" bold>
          {'Pos'.padEnd(4)} {'Driver'.padEnd(20)} {'Team'.padEnd(25)} {'Pts'.padStart(6)} {'Wins'.padStart(6)}
        </Text>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(65)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;
        const position = standing.position;
        const driverCode = standing.Driver.code || standing.Driver.familyName.substring(0, 3).toUpperCase();
        const driverName = `${standing.Driver.givenName} ${standing.Driver.familyName}`;
        const displayDriver = driverCode.length <= 3 ? driverCode : driverName.substring(0, 18);
        const teamName = standing.Constructors[0]?.name || 'N/A';
        const displayTeam = teamName.length > 23 ? teamName.substring(0, 23) : teamName;
        const points = standing.points;
        const wins = standing.wins;

        return (
          <Box key={standing.Driver.driverId}>
            <Text>
              <Text color={position === '1' ? 'yellow' : position === '2' ? 'gray' : position === '3' ? '#cd7f32' : 'white'} bold={parseInt(position) <= 3}>
                {padEnd(position, 4)}
              </Text>
              <Text color="cyan">
                {padEnd(displayDriver, 20)}
              </Text>
              <Text color="magenta">
                {padEnd(displayTeam, 25)}
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
  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        <Text color="magenta" bold>
          {'Pos'.padEnd(4)} {'Constructor'.padEnd(35)} {'Pts'.padStart(6)} {'Wins'.padStart(6)}
        </Text>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(55)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;
        const position = standing.position;
        const teamName = standing.Constructor.name;
        const displayTeam = teamName.length > 33 ? teamName.substring(0, 33) : teamName;
        const points = standing.points;
        const wins = standing.wins;

        return (
          <Box key={standing.Constructor.constructorId}>
            <Text>
              <Text color={position === '1' ? 'yellow' : position === '2' ? 'gray' : position === '3' ? '#cd7f32' : 'white'} bold={parseInt(position) <= 3}>
                {padEnd(position, 4)}
              </Text>
              <Text color="magenta" bold>
                {padEnd(displayTeam, 35)}
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
