// Libraries
import {remote} from 'electron';
import curseforge from 'mc-curseforge-api';

// Classes
import Profile from './objects/profile';

// Type Definitions
import { Options } from '../interfaces';

/**
 * Provides bindings from the UI library to Magi. 
 * Ideally, the business logic in Magi 2.0 should be view layer agnostic.
 */
export default class Magi {
  version = remote.app.getVersion();
  
  // Profile state
  activeProfile = "";
  profiles: Profile[] = [];

  // Search state
  searchResults: ModFile[] = [];

  search = async (options: Options) => curseforge.getMods(options)

}