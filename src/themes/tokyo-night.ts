// Tokyo Night theme colors

import chalk from 'chalk';

export const theme = {
  // Primary colors
  primary: '#7dcfff', // Cyan - bright, high visibility
  secondary: '#bb9af7', // Purple - bright, high visibility
  success: '#9ece6a', // Green - bright, high visibility
  warning: '#e0af68', // Yellow - bright, high visibility
  error: '#f7768e', // Red - bright, high visibility
  info: '#7aa2f7', // Blue - bright, high visibility

  // Podium colors - enhanced for better visibility
  gold: '#ffd700',      // Gold for 1st place
  silver: '#e8e8e8',    // Brighter silver for 2nd place
  bronze: '#ff9e64',    // Bronze for 3rd place

  // Text colors - improved contrast
  text: '#e8e8e8',      // Brighter white for better readability
  textMuted: '#a9b1d6', // Slightly brighter for secondary text
  textDim: '#787c99',   // Brighter dim text for better visibility

  // Background colors
  bg: '#1a1b26',
  bgLight: '#24283b',
  bgHighlight: '#2e3144',

  // Border colors
  border: '#414868',
  borderActive: '#7dcfff',
};

export const colors = {
  // Position styling
  position1: chalk.hex(theme.gold).bold,
  position2: chalk.hex(theme.silver).bold,
  position3: chalk.hex(theme.bronze).bold,
  points: chalk.hex(theme.success),
  noPoints: chalk.hex(theme.textMuted),

  // UI elements
  primary: chalk.hex(theme.primary),
  secondary: chalk.hex(theme.secondary),
  success: chalk.hex(theme.success),
  warning: chalk.hex(theme.warning),
  error: chalk.hex(theme.error),
  info: chalk.hex(theme.info),

  // Text
  text: chalk.hex(theme.text),
  textMuted: chalk.hex(theme.textMuted),
  textDim: chalk.hex(theme.textDim),
  textBold: chalk.hex(theme.text).bold,

  // Special
  highlight: chalk.hex(theme.primary).bold,
  dimmed: chalk.dim,
  bold: chalk.bold,
};

export function stylePosition(position: string | number): string {
  const pos = typeof position === 'string' ? parseInt(position) : position;

  switch (pos) {
    case 1:
      return colors.position1(`P${pos}`);
    case 2:
      return colors.position2(`P${pos}`);
    case 3:
      return colors.position3(`P${pos}`);
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      return colors.points(`P${pos}`);
    default:
      return colors.noPoints(`P${pos}`);
  }
}

export function stylePoints(points: string | number): string {
  const pts = typeof points === 'string' ? parseFloat(points) : points;

  if (pts > 0) {
    return colors.success(pts.toString());
  }

  return colors.textMuted(pts.toString());
}

export function formatDriverName(givenName: string, familyName: string, code?: string): string {
  if (code) {
    return `${colors.textBold(code)} ${colors.text(familyName)}`;
  }
  return colors.text(`${givenName.charAt(0)}. ${familyName}`);
}

export function formatTeamName(name: string): string {
  return colors.secondary(name);
}
