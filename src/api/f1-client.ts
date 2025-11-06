// F1 API Client with intelligent caching

import fs from 'fs';
import path from 'path';
import type {
  DriverStanding,
  ConstructorStanding,
  Race,
  DriverLastResult,
  ConstructorLastResult,
  CacheEntry,
} from '../types/f1.js';

const CACHE_FILE = path.join(process.cwd(), 'f1_cache.json');
const API_BASE = 'http://api.jolpi.ca/ergast/f1';

class F1ApiClient {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private currentSeason: string;

  constructor() {
    this.currentSeason = new Date().getFullYear().toString();
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      // Ignore cache errors and start fresh
      this.cache = new Map();
    }
  }

  private saveCache(): void {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      const tempFile = `${CACHE_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(cacheObj, null, 2));
      fs.renameSync(tempFile, CACHE_FILE);
    } catch (error) {
      // Silently fail on cache save errors
    }
  }

  private async fetchWithCache<T>(
    endpoint: string,
    key: string,
    expireMinutes: number = 1440,
    force: boolean = false
  ): Promise<T> {
    const now = Date.now();

    // Check cache first
    if (!force && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (now < entry.expiresAt) {
        return entry.data;
      }
    }

    // Fetch from API
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const json: any = await response.json();
    const data = json.MRData;

    // Cache the result
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + expireMinutes * 60 * 1000,
    });

    this.saveCache();
    return data;
  }

  async getDriverStandings(force: boolean = false): Promise<DriverStanding[]> {
    try {
      const data = await this.fetchWithCache<any>(
        `/current/driverStandings.json`,
        'driver_standings',
        1440,
        force
      );

      return data.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    } catch (error) {
      throw new Error(`Failed to fetch driver standings: ${(error as Error).message}`);
    }
  }

  async getConstructorStandings(force: boolean = false): Promise<ConstructorStanding[]> {
    try {
      const data = await this.fetchWithCache<any>(
        `/current/constructorStandings.json`,
        'constructor_standings',
        1440,
        force
      );

      return data.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
    } catch (error) {
      throw new Error(`Failed to fetch constructor standings: ${(error as Error).message}`);
    }
  }

  async getAllRaces(season?: string, force: boolean = false): Promise<Race[]> {
    const year = season || this.currentSeason;

    try {
      const data = await this.fetchWithCache<any>(
        `/${year}/results.json?limit=100`,
        `races_${year}`,
        1440,
        force
      );

      const races: Race[] = data.RaceTable?.Races || [];

      // Also fetch schedule to get future races
      const scheduleData = await this.fetchWithCache<any>(
        `/${year}.json`,
        `schedule_${year}`,
        1440,
        force
      );

      const allRaces: Race[] = scheduleData.RaceTable?.Races || [];

      // Merge results with schedule
      return allRaces.map((race) => {
        const raceWithResults = races.find((r) => r.round === race.round);
        return raceWithResults || race;
      });
    } catch (error) {
      throw new Error(`Failed to fetch races: ${(error as Error).message}`);
    }
  }

  async getDriverLastResults(driverId: string, limit: number = 10): Promise<DriverLastResult[]> {
    try {
      const data = await this.fetchWithCache<any>(
        `/current/drivers/${driverId}/results.json?limit=${limit}`,
        `driver_${driverId}_results`,
        60
      );

      return data.RaceTable?.Races || [];
    } catch (error) {
      throw new Error(`Failed to fetch driver results: ${(error as Error).message}`);
    }
  }

  async getConstructorLastResults(
    constructorId: string,
    limit: number = 10
  ): Promise<ConstructorLastResult[]> {
    try {
      const data = await this.fetchWithCache<any>(
        `/current/constructors/${constructorId}/results.json?limit=${limit}`,
        `constructor_${constructorId}_results`,
        60
      );

      return data.RaceTable?.Races || [];
    } catch (error) {
      throw new Error(`Failed to fetch constructor results: ${(error as Error).message}`);
    }
  }

  async getRaceResults(season: string, round: string): Promise<Race | null> {
    try {
      const data = await this.fetchWithCache<any>(
        `/${season}/${round}/results.json`,
        `race_${season}_${round}`,
        60
      );

      const races = data.RaceTable?.Races || [];
      return races[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch race results: ${(error as Error).message}`);
    }
  }

  getCurrentSeason(): string {
    return this.currentSeason;
  }
}

export const f1Client = new F1ApiClient();
