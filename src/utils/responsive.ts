/**
 * Responsive utilities for terminal UI
 * Provides terminal size detection and responsive layout helpers
 */

/**
 * Get current terminal dimensions
 */
export function getTerminalSize(): { width: number; height: number } {
  // @ts-ignore - process.stdout is available in Node.js environment
  const columns = typeof process !== 'undefined' && process.stdout ? process.stdout.columns : 80;
  // @ts-ignore - process.stdout is available in Node.js environment
  const rows = typeof process !== 'undefined' && process.stdout ? process.stdout.rows : 24;

  return {
    width: columns || 80,
    height: rows || 24,
  };
}

/**
 * Terminal size categories
 */
export type TerminalSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Determine terminal size category based on width
 */
export function getTerminalSizeCategory(): TerminalSize {
  const { width } = getTerminalSize();

  if (width < 80) return 'small';
  if (width < 120) return 'medium';
  if (width < 160) return 'large';
  return 'xlarge';
}

/**
 * Check if terminal width is at least the specified size
 */
export function isTerminalAtLeast(minWidth: number): boolean {
  const { width } = getTerminalSize();
  return width >= minWidth;
}

/**
 * Get responsive column width for driver names
 */
export function getDriverNameWidth(): number {
  const sizeCategory = getTerminalSizeCategory();

  switch (sizeCategory) {
    case 'small':
      return 8;  // Just codes (e.g., "VER")
    case 'medium':
      return 20; // Full name (e.g., "Max Verstappen")
    case 'large':
      return 25; // Full name with spacing
    case 'xlarge':
      return 30; // Full name with extra spacing
  }
}

/**
 * Get responsive column width for team names
 */
export function getTeamNameWidth(): number {
  const sizeCategory = getTerminalSizeCategory();

  switch (sizeCategory) {
    case 'small':
      return 15; // Abbreviated (e.g., "Red Bull")
    case 'medium':
      return 25; // Standard
    case 'large':
      return 30; // Full name
    case 'xlarge':
      return 35; // Full name with spacing
  }
}

/**
 * Get responsive column width for race names
 */
export function getRaceNameWidth(): number {
  const sizeCategory = getTerminalSizeCategory();

  switch (sizeCategory) {
    case 'small':
      return 20; // Abbreviated
    case 'medium':
      return 28; // Standard
    case 'large':
      return 35; // Full name
    case 'xlarge':
      return 40; // Full name with spacing
  }
}

/**
 * Format driver name based on available space
 */
export function formatDriverName(
  givenName: string,
  familyName: string,
  code?: string
): string {
  const sizeCategory = getTerminalSizeCategory();

  switch (sizeCategory) {
    case 'small':
      // Use 3-letter code or family name abbreviation
      return code || familyName.substring(0, 3).toUpperCase();
    case 'medium':
      // Use full name
      return `${givenName} ${familyName}`;
    case 'large':
    case 'xlarge':
      // Use full name
      return `${givenName} ${familyName}`;
  }
}

/**
 * Format team name based on available space
 */
export function formatTeamName(name: string, maxWidth: number): string {
  if (name.length <= maxWidth) {
    return name;
  }

  // Common abbreviations for team names
  const abbreviations: Record<string, string> = {
    'Red Bull Racing': 'Red Bull',
    'Mercedes-AMG Petronas Formula One Team': 'Mercedes',
    'Scuderia Ferrari': 'Ferrari',
    'McLaren Formula 1 Team': 'McLaren',
    'Aston Martin Aramco Cognizant F1 Team': 'Aston Martin',
    'BWT Alpine F1 Team': 'Alpine',
    'Williams Racing': 'Williams',
    'Visa Cash App RB Formula One Team': 'RB',
    'MoneyGram Haas F1 Team': 'Haas',
    'Kick Sauber': 'Sauber',
  };

  // Check if we have an abbreviation
  if (abbreviations[name]) {
    const abbr = abbreviations[name];
    if (abbr.length <= maxWidth) {
      return abbr;
    }
  }

  // Fallback: truncate with ellipsis
  return name.substring(0, maxWidth - 1) + '…';
}

/**
 * Format race name based on available space
 */
export function formatRaceName(name: string, maxWidth: number): string {
  if (name.length <= maxWidth) {
    return name;
  }

  // Replace "Grand Prix" with "GP"
  let formatted = name.replace(' Grand Prix', ' GP');

  if (formatted.length <= maxWidth) {
    return formatted;
  }

  // Truncate with ellipsis
  return formatted.substring(0, maxWidth - 1) + '…';
}

/**
 * Check if terminal should display full information
 */
export function shouldShowFullInfo(): boolean {
  return isTerminalAtLeast(100);
}

/**
 * Check if terminal should display extended information
 */
export function shouldShowExtendedInfo(): boolean {
  return isTerminalAtLeast(140);
}

/**
 * Get responsive table total width
 */
export function getTableWidth(): number {
  const { width } = getTerminalSize();
  return Math.min(width - 4, 120); // Leave some margin
}
