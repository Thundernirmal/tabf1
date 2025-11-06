import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  season?: string;
}

export const Header = React.memo<HeaderProps>(({ season }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box
        borderStyle="round"
        borderColor="cyan"
        paddingX={2}
        paddingY={0}
        justifyContent="center"
      >
        <Text>
          <Text color="cyan" bold>
            TabF1 - F1 Dashboard
          </Text>
        </Text>
      </Box>
      <Box justifyContent="center" marginTop={0}>
        <Text color="#e0af68">
          {season ? `${season} Season` : 'Live Standings & Results'}
        </Text>
      </Box>
    </Box>
  );
});

Header.displayName = 'Header';
