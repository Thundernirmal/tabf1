// Type definitions for F1 API data structures

export interface DriverStanding {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    permanentNumber?: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  time?: string;
  Results?: RaceResult[];
}

export interface RaceResult {
  number: string;
  position: string;
  points: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  grid: string;
  laps: string;
  status: string;
  Time?: {
    time: string;
  };
  FastestLap?: {
    rank: string;
    Time: {
      time: string;
    };
  };
}

export interface DriverLastResult {
  round: string;
  raceName: string;
  date: string;
  Results: Array<{
    position: string;
    points: string;
    grid: string;
    status: string;
  }>;
}

export interface ConstructorLastResult {
  round: string;
  raceName: string;
  date: string;
  Results: Array<{
    position: string;
    points: string;
    number: string;
    Driver: {
      code: string;
      givenName: string;
      familyName: string;
    };
  }>;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export type Screen = 'dashboard' | 'races' | 'driver-detail' | 'constructor-detail' | 'race-detail';

export interface AppState {
  currentScreen: Screen;
  selectedDriverId: string | null;
  selectedConstructorId: string | null;
  selectedRaceRound: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
}
