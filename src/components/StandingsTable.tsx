import React from 'react';
import { Box, Text } from 'ink';
import { stylePosition, stylePoints } from '../themes/tokyo-night.js';
import type { DriverStanding, ConstructorStanding } from '../types/f1.js';

interface DriverTableProps {
  standings: DriverStanding[];
  selectedIndex: number;
}

interface ConstructorTableProps {
  standings: ConstructorStanding[];
  selectedIndex: number;
}

const padEnd = (str: string, length: number): string => {
  const cleaned = str.replace(/\x1b\[[0-9;]*m/g, '');
  const padLength = Math.max(0, length - cleaned.length);
  return str + ' '.repeat(padLength);
};

const padStart = (str: string, length: number): string => {
  const cleaned = str.replace(/\x1b\[[0-9;]*m/g, '');
  const padLength = Math.max(0, length - cleaned.length);
  return ' '.repeat(padLength) + str;
};

export const DriverTable = React.memo<DriverTableProps>(({ standings, selectedIndex }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Box flexDirection="column">
        {/* Header */}
        <Text color="cyan" bold>
          Pos  Driver                Team                      Pts  Wins
        </Text>

        {/* Divider */}
        <Text color="gray" dimColor>
          ───────────────────────────────────────────────────────────
        </Text>

        {/* Rows */}
        {standings.map((standing, index) => {
          const isSelected = index === selectedIndex;
          const driver = standing.Driver.code || standing.Driver.familyName.substring(0, 3).toUpperCase();
          const team = (standing.Constructors[0]?.name || 'N/A').substring(0, 23);

          return (
            <Box key={standing.Driver.driverId}>
              <Text>
                {padEnd(stylePosition(standing.position), 5)}
                {padEnd(driver, 22)}
                <Text color="magenta">{padEnd(team, 26)}</Text>
                {padStart(stylePoints(standing.points), 5)}
                <Text color="yellow">{padStart(standing.wins, 5)}</Text>
                {isSelected && <Text color="cyan" bold> ←</Text>}
              </Text>
            </Box>
          );
        })}

        {/* Footer */}
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            {standings.length} drivers
          </Text>
        </Box>
      </Box>
    </Box>
  );
});

DriverTable.displayName = 'DriverTable';

export const ConstructorTable = React.memo<ConstructorTableProps>(({ standings, selectedIndex }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Box flexDirection="column">
        {/* Header */}
        <Text color="magenta" bold>
          Pos  Constructor                    Pts  Wins
        </Text>

        {/* Divider */}
        <Text color="gray" dimColor>
          ─────────────────────────────────────────────
        </Text>

        {/* Rows */}
        {standings.map((standing, index) => {
          const isSelected = index === selectedIndex;
          const teamName = standing.Constructor.name.substring(0, 28);

          return (
            <Box key={standing.Constructor.constructorId}>
              <Text>
                {padEnd(stylePosition(standing.position), 5)}
                <Text color="magenta">{padEnd(teamName, 31)}</Text>
                {padStart(stylePoints(standing.points), 5)}
                <Text color="yellow">{padStart(standing.wins, 5)}</Text>
                {isSelected && <Text color="cyan" bold> ←</Text>}
              </Text>
            </Box>
          );
        })}

        {/* Footer */}
        <Box marginTop={1}>
          <Text color="gray" dimColor>
            {standings.length} constructors
          </Text>
        </Box>
      </Box>
    </Box>
  );
});

ConstructorTable.displayName = 'ConstructorTable';
