import { IDriverAlias } from '@sqltools/types';

const { displayName } = require('../package.json');

/**
 * Aliase for the driver
 */
export const DRIVER_ALIAS: IDriverAlias = { displayName: displayName, value: displayName };
