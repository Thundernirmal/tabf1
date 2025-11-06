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
        <Text color="#7dcfff">
          <Spinner type="dots" />
        </Text>
        <Text color="#7dcfff" bold>
          {' '}
          {message}
        </Text>
      </Box>
      <Text color="#9aa5ce">
        Please wait...
      </Text>
    </Box>
  );
});

Loading.displayName = 'Loading';
