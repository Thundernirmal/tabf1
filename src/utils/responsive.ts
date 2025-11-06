// Responsive utilities for terminal size detection and column sizing

/**
 * Get current terminal dimensions
 */
export function getTerminalSize(): { columns: number; rows: number } {
  return {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
}

/**
 * Terminal size categories
 */
export type TerminalSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Determine terminal size category based on column count
 * - small: < 80 columns
 * - medium: 80-119 columns
 * - large: 120-159 columns
 * - xlarge: >= 160 columns
 */
export function getTerminalSizeCategory(): TerminalSize {
  const { columns } = getTerminalSize();

  if (columns < 80) return 'small';
  if (columns < 120) return 'medium';
  if (columns < 160) return 'large';
  return 'xlarge';
}

/**
 * Check if terminal is wide enough for full names
 */
export function shouldShowFullNames(): boolean {
  const { columns } = getTerminalSize();
  return columns >= 120;
}

/**
 * Get responsive column widths for driver standings table
 */
export function getDriverTableWidths(): {
  position: number;
  driver: number;
  team: number;
  points: number;
  wins: number;
  total: number;
} {
  const size = getTerminalSizeCategory();

  switch (size) {
    case 'xlarge':
      return {
        position: 4,
        driver: 30,
        team: 35,
        points: 8,
        wins: 6,
        total: 83,
      };
    case 'large':
      return {
        position: 4,
        driver: 25,
        team: 30,
        points: 8,
        wins: 6,
        total: 73,
      };
    case 'medium':
      return {
        position: 4,
        driver: 18,
        team: 24,
        points: 7,
        wins: 5,
        total: 58,
      };
    default: // small
      return {
        position: 3,
        driver: 12,
        team: 18,
        points: 6,
        wins: 4,
        total: 43,
      };
  }
}

/**
 * Get responsive column widths for constructor standings table
 */
export function getConstructorTableWidths(): {
  position: number;
  constructor: number;
  points: number;
  wins: number;
  total: number;
} {
  const size = getTerminalSizeCategory();

  switch (size) {
    case 'xlarge':
      return {
        position: 4,
        constructor: 40,
        points: 8,
        wins: 6,
        total: 58,
      };
    case 'large':
      return {
        position: 4,
        constructor: 35,
        points: 8,
        wins: 6,
        total: 53,
      };
    case 'medium':
      return {
        position: 4,
        constructor: 28,
        points: 7,
        wins: 5,
        total: 44,
      };
    default: // small
      return {
        position: 3,
        constructor: 22,
        points: 6,
        wins: 4,
        total: 35,
      };
  }
}

/**
 * Get responsive column widths for race list
 */
export function getRaceListWidths(): {
  round: number;
  grandPrix: number;
  date: number;
  winner: number;
  status: number;
  total: number;
} {
  const size = getTerminalSizeCategory();

  switch (size) {
    case 'xlarge':
      return {
        round: 6,
        grandPrix: 40,
        date: 16,
        winner: 20,
        status: 16,
        total: 98,
      };
    case 'large':
      return {
        round: 5,
        grandPrix: 35,
        date: 15,
        winner: 18,
        status: 15,
        total: 88,
      };
    case 'medium':
      return {
        round: 4,
        grandPrix: 28,
        date: 14,
        winner: 12,
        status: 14,
        total: 72,
      };
    default: // small
      return {
        round: 3,
        grandPrix: 20,
        date: 12,
        winner: 8,
        status: 12,
        total: 55,
      };
  }
}

/**
 * Get responsive column widths for driver detail screen
 */
export function getDriverDetailWidths(): {
  round: number;
  grandPrix: number;
  grid: number;
  finish: number;
  status: number;
  points: number;
  total: number;
} {
  const size = getTerminalSizeCategory();

  switch (size) {
    case 'xlarge':
      return {
        round: 6,
        grandPrix: 40,
        grid: 6,
        finish: 8,
        status: 25,
        points: 8,
        total: 93,
      };
    case 'large':
      return {
        round: 6,
        grandPrix: 35,
        grid: 6,
        finish: 8,
        status: 22,
        points: 8,
        total: 85,
      };
    case 'medium':
      return {
        round: 5,
        grandPrix: 28,
        grid: 5,
        finish: 7,
        status: 18,
        points: 7,
        total: 70,
      };
    default: // small
      return {
        round: 4,
        grandPrix: 18,
        grid: 4,
        finish: 6,
        status: 12,
        points: 6,
        total: 50,
      };
  }
}

/**
 * Get responsive column widths for constructor detail screen
 */
export function getConstructorDetailWidths(): {
  round: number;
  grandPrix: number;
  carNumber: number;
  driver: number;
  finish: number;
  points: number;
  total: number;
} {
  const size = getTerminalSizeCategory();

  switch (size) {
    case 'xlarge':
      return {
        round: 6,
        grandPrix: 40,
        carNumber: 7,
        driver: 25,
        finish: 8,
        points: 8,
        total: 94,
      };
    case 'large':
      return {
        round: 6,
        grandPrix: 35,
        carNumber: 7,
        driver: 22,
        finish: 8,
        points: 8,
        total: 86,
      };
    case 'medium':
      return {
        round: 5,
        grandPrix: 28,
        carNumber: 6,
        driver: 18,
        finish: 7,
        points: 7,
        total: 71,
      };
    default: // small
      return {
        round: 4,
        grandPrix: 18,
        carNumber: 5,
        driver: 12,
        finish: 6,
        points: 6,
        total: 51,
      };
  }
}

/**
 * Get responsive column widths for race detail screen
 */
export function getRaceDetailWidths(): {
  position: number;
  driver: number;
  team: number;
  grid: number;
  timeStatus: number;
  points: number;
  total: number;
} {
  const size = getTerminalSizeCategory();

  switch (size) {
    case 'xlarge':
      return {
        position: 5,
        driver: 28,
        team: 32,
        grid: 6,
        timeStatus: 18,
        points: 8,
        total: 97,
      };
    case 'large':
      return {
        position: 5,
        driver: 24,
        team: 28,
        grid: 6,
        timeStatus: 16,
        points: 8,
        total: 87,
      };
    case 'medium':
      return {
        position: 4,
        driver: 18,
        team: 22,
        grid: 5,
        timeStatus: 14,
        points: 7,
        total: 70,
      };
    default: // small
      return {
        position: 3,
        driver: 12,
        team: 16,
        grid: 4,
        timeStatus: 10,
        points: 6,
        total: 51,
      };
  }
}

/**
 * Truncate text to fit within a maximum length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format driver name based on available width
 */
export function formatDriverName(
  givenName: string,
  familyName: string,
  code: string | undefined,
  maxWidth: number
): string {
  const fullName = `${givenName} ${familyName}`;
  const shortName = `${givenName.charAt(0)}. ${familyName}`;
  const codeOrShort = code || familyName.substring(0, 3).toUpperCase();

  if (maxWidth >= 25 && fullName.length <= maxWidth) {
    return fullName;
  } else if (maxWidth >= 18 && shortName.length <= maxWidth) {
    return shortName;
  } else if (maxWidth >= 12) {
    return truncateText(shortName, maxWidth);
  } else {
    return codeOrShort;
  }
}

/**
 * Format team name based on available width
 */
export function formatTeamName(name: string, maxWidth: number): string {
  if (name.length <= maxWidth) {
    return name;
  }
  return truncateText(name, maxWidth);
}
