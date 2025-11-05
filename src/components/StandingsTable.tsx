import React from 'react';
import { Box, Text } from 'ink';
import { stylePosition, stylePoints, formatDriverName, formatTeamName } from '../themes/tokyo-night.js';
import type { DriverStanding, ConstructorStanding } from '../types/f1.js';

interface DriverTableProps {
  standings: DriverStanding[];
  selectedIndex: number;
}

interface ConstructorTableProps {
  standings: ConstructorStanding[];
  selectedIndex: number;
}

export const DriverTable: React.FC<DriverTableProps> = ({ standings, selectedIndex }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box>
        <Box width={5}>
          <Text color="cyan" bold>
            Pos
          </Text>
        </Box>
        <Box width={25}>
          <Text color="cyan" bold>
            Driver
          </Text>
        </Box>
        <Box width={25}>
          <Text color="cyan" bold>
            Team
          </Text>
        </Box>
        <Box width={8}>
          <Text color="cyan" bold>
            Points
          </Text>
        </Box>
        <Box width={6}>
          <Text color="cyan" bold>
            Wins
          </Text>
        </Box>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(69)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Box key={standing.Driver.driverId}>
            <Box width={5}>
              <Text>{stylePosition(standing.position)}</Text>
            </Box>
            <Box width={25}>
              <Text>
                {formatDriverName(
                  standing.Driver.givenName,
                  standing.Driver.familyName,
                  standing.Driver.code
                )}
              </Text>
            </Box>
            <Box width={25}>
              <Text color="magenta">{standing.Constructors[0]?.name || 'N/A'}</Text>
            </Box>
            <Box width={8}>
              <Text>{stylePoints(standing.points)}</Text>
            </Box>
            <Box width={6}>
              <Text color="yellow">{standing.wins}</Text>
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
          {standings.length} drivers
        </Text>
      </Box>
    </Box>
  );
};

export const ConstructorTable: React.FC<ConstructorTableProps> = ({ standings, selectedIndex }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box>
        <Box width={5}>
          <Text color="magenta" bold>
            Pos
          </Text>
        </Box>
        <Box width={30}>
          <Text color="magenta" bold>
            Constructor
          </Text>
        </Box>
        <Box width={8}>
          <Text color="magenta" bold>
            Points
          </Text>
        </Box>
        <Box width={6}>
          <Text color="magenta" bold>
            Wins
          </Text>
        </Box>
      </Box>

      {/* Divider */}
      <Box>
        <Text color="gray" dimColor>
          {'─'.repeat(49)}
        </Text>
      </Box>

      {/* Rows */}
      {standings.map((standing, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Box key={standing.Constructor.constructorId}>
            <Box width={5}>
              <Text>{stylePosition(standing.position)}</Text>
            </Box>
            <Box width={30}>
              <Text>{formatTeamName(standing.Constructor.name)}</Text>
            </Box>
            <Box width={8}>
              <Text>{stylePoints(standing.points)}</Text>
            </Box>
            <Box width={6}>
              <Text color="yellow">{standing.wins}</Text>
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
          {standings.length} constructors
        </Text>
      </Box>
    </Box>
  );
};
