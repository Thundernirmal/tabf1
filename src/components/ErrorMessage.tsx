import React from 'react';
import { Box, Text } from 'ink';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={2}
      borderStyle="round"
      borderColor="red"
    >
      <Text color="red" bold>
        ❌ Error
      </Text>
      <Text color="red">{message}</Text>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          Press 'r' to retry or 'q' to quit
        </Text>
      </Box>
    </Box>
  );
};
