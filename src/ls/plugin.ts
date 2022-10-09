import { ILanguageServerPlugin } from '@sqltools/types';
import RedshiftDriver from './driver';
import { DRIVER_ALIAS } from './../constants';

const RedshiftDriverPlugin: ILanguageServerPlugin = {
  register(server) {
      server.getContext().drivers.set(DRIVER_ALIAS.value, RedshiftDriver as any);
  }
}

export default RedshiftDriverPlugin;
