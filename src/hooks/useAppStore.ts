// Global app state management using Zustand

import { create } from 'zustand';
import type { Screen } from '../types/f1.js';

interface AppState {
  // Current screen
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;

  // Selected items
  selectedDriverId: string | null;
  setSelectedDriverId: (id: string | null) => void;

  selectedConstructorId: string | null;
  setSelectedConstructorId: (id: string | null) => void;

  selectedRaceRound: string | null;
  setSelectedRaceRound: (round: string | null) => void;

  selectedRaceSeason: string | null;
  setSelectedRaceSeason: (season: string | null) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  lastUpdate: number;
  setLastUpdate: (timestamp: number) => void;

  // Navigation helpers
  goBack: () => void;
  goToDashboard: () => void;
  goToRaces: () => void;
  goToDriverDetail: (driverId: string) => void;
  goToConstructorDetail: (constructorId: string) => void;
  goToRaceDetail: (season: string, round: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentScreen: 'dashboard',
  selectedDriverId: null,
  selectedConstructorId: null,
  selectedRaceRound: null,
  selectedRaceSeason: null,
  isLoading: false,
  error: null,
  lastUpdate: Date.now(),

  // Setters
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setSelectedDriverId: (id) => set({ selectedDriverId: id }),
  setSelectedConstructorId: (id) => set({ selectedConstructorId: id }),
  setSelectedRaceRound: (round) => set({ selectedRaceRound: round }),
  setSelectedRaceSeason: (season) => set({ selectedRaceSeason: season }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error: error }),
  setLastUpdate: (timestamp) => set({ lastUpdate: timestamp }),

  // Navigation methods
  goBack: () => {
    const { currentScreen } = get();

    switch (currentScreen) {
      case 'driver-detail':
      case 'constructor-detail':
        set({ currentScreen: 'dashboard', selectedDriverId: null, selectedConstructorId: null });
        break;
      case 'race-detail':
        set({ currentScreen: 'races', selectedRaceRound: null, selectedRaceSeason: null });
        break;
      case 'races':
        set({ currentScreen: 'dashboard' });
        break;
      default:
        break;
    }
  },

  goToDashboard: () => {
    set({
      currentScreen: 'dashboard',
      selectedDriverId: null,
      selectedConstructorId: null,
      selectedRaceRound: null,
      selectedRaceSeason: null,
    });
  },

  goToRaces: () => {
    set({ currentScreen: 'races' });
  },

  goToDriverDetail: (driverId) => {
    set({ currentScreen: 'driver-detail', selectedDriverId: driverId });
  },

  goToConstructorDetail: (constructorId) => {
    set({ currentScreen: 'constructor-detail', selectedConstructorId: constructorId });
  },

  goToRaceDetail: (season, round) => {
    set({ currentScreen: 'race-detail', selectedRaceSeason: season, selectedRaceRound: round });
  },
}));
