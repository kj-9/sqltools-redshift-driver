import { IDriverAlias } from "@sqltools/types";

import { displayName } from "../package.json";

/**
 * Aliase for the driver
 */
export const DRIVER_ALIAS: IDriverAlias = {
  displayName: displayName,
  value: displayName,
};
