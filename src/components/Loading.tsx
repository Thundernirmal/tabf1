import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface LoadingProps {
  message?: string;
}

export const Loading = React.memo<LoadingProps>(({ message = 'Loading...' }) => {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" padding={2}>
      <Box marginBottom={1}>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text color="cyan" bold>
          {' '}
          {message}
        </Text>
      </Box>
      <Text color="gray" dimColor>
        🏎️💨
      </Text>
    </Box>
  );
});

Loading.displayName = 'Loading';
