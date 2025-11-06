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
      borderColor="#f7768e"
    >
      <Text color="#f7768e" bold>
        Error
      </Text>
      <Text color="#f7768e">{message}</Text>
      <Box marginTop={1}>
        <Text color="#9aa5ce">
          Press 'r' to retry or 'q' to quit
        </Text>
      </Box>
    </Box>
  );
};
