import React from 'react';
import { Box, Text } from 'ink';

interface KeyBinding {
  key: string;
  description: string;
}

interface KeyBindingsProps {
  bindings: KeyBinding[];
}

export const KeyBindings: React.FC<KeyBindingsProps> = ({ bindings }) => {
  return (
    <Box flexDirection="column" marginTop={1} paddingX={1}>
      <Box borderStyle="round" borderColor="gray" paddingX={2} paddingY={0}>
        {bindings.map((binding, index) => (
          <Box key={index} marginRight={2}>
            <Text color="cyan" bold>
              {binding.key}
            </Text>
            <Text color="gray" dimColor>
              {' '}
              {binding.description}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
