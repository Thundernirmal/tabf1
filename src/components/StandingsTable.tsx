import React from 'react';
import { Box, Text } from 'ink';
import type { DriverStanding, ConstructorStanding } from '../types/f1.js';
import {
  getDriverTableWidths,
  getConstructorTableWidths,
  formatDriverName,
  formatTeamName,
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
  const widths = getDriverTableWidths();

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        <Text color="cyan" bold>
          {padEnd('Pos', widths.position)} {padEnd('Driver', widths.driver)} {padEnd('Team', widths.team)} {padStart('Pts', widths.points)} {padStart('Wins', widths.wins)}
        </Text>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="#7aa2f7">
          {'─'.repeat(widths.total)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;
        const position = standing.position;
        const displayDriver = formatDriverName(
          standing.Driver.givenName,
          standing.Driver.familyName,
          standing.Driver.code,
          widths.driver
        );
        const teamName = standing.Constructors[0]?.name || 'N/A';
        const displayTeam = formatTeamName(teamName, widths.team);
        const points = standing.points;
        const wins = standing.wins;

        return (
          <Box key={standing.Driver.driverId}>
            <Text>
              <Text color={position === '1' ? '#ffd700' : position === '2' ? '#c0c0c0' : position === '3' ? '#ff9e64' : '#c0caf5'} bold={parseInt(position) <= 3}>
                {padEnd(position, widths.position)}
              </Text>
              <Text color="#7dcfff">
                {padEnd(displayDriver, widths.driver)}
              </Text>
              <Text color="#bb9af7">
                {padEnd(displayTeam, widths.team)}
              </Text>
              <Text color="#9ece6a" bold>
                {padStart(points, widths.points)}
              </Text>
              <Text color="#e0af68">
                {padStart(wins, widths.wins)}
              </Text>
              {isSelected && (
                <Text color="#7dcfff" bold> ← </Text>
              )}
            </Text>
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="#9aa5ce">
          Total: {standings.length} drivers
        </Text>
      </Box>
    </Box>
  );
});

DriverTable.displayName = 'DriverTable';

export const ConstructorTable = React.memo<ConstructorTableProps>(({ standings, selectedIndex }) => {
  const widths = getConstructorTableWidths();

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box>
        <Text color="magenta" bold>
          {padEnd('Pos', widths.position)} {padEnd('Constructor', widths.constructor)} {padStart('Pts', widths.points)} {padStart('Wins', widths.wins)}
        </Text>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="#7aa2f7">
          {'─'.repeat(widths.total)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;
        const position = standing.position;
        const teamName = standing.Constructor.name;
        const displayTeam = formatTeamName(teamName, widths.constructor);
        const points = standing.points;
        const wins = standing.wins;

        return (
          <Box key={standing.Constructor.constructorId}>
            <Text>
              <Text color={position === '1' ? '#ffd700' : position === '2' ? '#c0c0c0' : position === '3' ? '#ff9e64' : '#c0caf5'} bold={parseInt(position) <= 3}>
                {padEnd(position, widths.position)}
              </Text>
              <Text color="#bb9af7" bold>
                {padEnd(displayTeam, widths.constructor)}
              </Text>
              <Text color="#9ece6a" bold>
                {padStart(points, widths.points)}
              </Text>
              <Text color="#e0af68">
                {padStart(wins, widths.wins)}
              </Text>
              {isSelected && (
                <Text color="#7dcfff" bold> ← </Text>
              )}
            </Text>
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="#9aa5ce">
          Total: {standings.length} constructors
        </Text>
      </Box>
    </Box>
  );
});

ConstructorTable.displayName = 'ConstructorTable';
