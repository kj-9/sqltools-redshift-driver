import * as vscode from "vscode";
import {
  IExtension,
  IExtensionPlugin,
  IDriverExtensionApi,
} from "@sqltools/types";
import { ExtensionContext } from "vscode";
import { DRIVER_ALIAS } from "./constants";
import { publisher, name, displayName } from "../package.json";

export async function activate(
  extContext: ExtensionContext
): Promise<IDriverExtensionApi> {
  const sqltools = vscode.extensions.getExtension<IExtension>("mtxr.sqltools");
  if (!sqltools) {
    throw new Error("SQLTools not installed");
  }
  await sqltools.activate();

  const api = sqltools.exports;

  const extensionId = `${publisher}.${name}`;
  const plugin: IExtensionPlugin = {
    extensionId,
    name: `${displayName} Plugin`,
    type: "driver",
    async register(extension) {
      // register ext part here
      extension.resourcesMap().set(`driver/${DRIVER_ALIAS.value}/icons`, {
        active: extContext.asAbsolutePath("icons/active.png"),
        default: extContext.asAbsolutePath("icons/default.png"),
        inactive: extContext.asAbsolutePath("icons/inactive.png"),
      });
      extension
        .resourcesMap()
        .set(`driver/${DRIVER_ALIAS.value}/extension-id`, extensionId);
      extension
        .resourcesMap()
        .set(
          `driver/${DRIVER_ALIAS.value}/connection-schema`,
          extContext.asAbsolutePath("connection.schema.json")
        );
      extension
        .resourcesMap()
        .set(
          `driver/${DRIVER_ALIAS.value}/ui-schema`,
          extContext.asAbsolutePath("ui.schema.json")
        );

      await extension.client.sendRequest("ls/RegisterPlugin", {
        path: extContext.asAbsolutePath("out/ls/plugin.js"),
      });
    },
  };
  api.registerPlugin(plugin);
  return {
    driverName: displayName,
    parseBeforeSaveConnection: ({ connInfo }) => {
      /**
       * This hook is called before saving the connection using the assistant
       * so you can do any transformations before saving it to disk.active
       * EG: relative file path transformation, string manipulation etc
       * Below is the exmaple for SQLite, where we save the DB path relative to workspace
       * and later we transform it back to absolute before editing
       */
      const propsToRemove = ["connectionMethod", "id", "usePassword"];
      if (connInfo.usePassword) {
        if (connInfo.usePassword.toString().toLowerCase().includes("ask")) {
          propsToRemove.push("password");
        } else if (
          connInfo.usePassword.toString().toLowerCase().includes("empty")
        ) {
          connInfo.password = "";
          propsToRemove.push("askForPassword");
        } else if (
          connInfo.usePassword.toString().toLowerCase().includes("save")
        ) {
          propsToRemove.push("askForPassword");
        }
      }
      propsToRemove.forEach((p) => delete connInfo[p]);
      connInfo.pgOptions = connInfo.pgOptions || {};
      if (connInfo.pgOptions.enableSsl === "Enabled") {
        if (
          typeof connInfo.pgOptions.ssl === "object" &&
          Object.keys(connInfo.pgOptions.ssl).length === 0
        ) {
          connInfo.pgOptions.ssl = true;
        }
      } else if (connInfo.pgOptions.enableSsl === "Disabled") {
        delete connInfo.pgOptions.ssl;
      }
      delete connInfo.pgOptions.enableSsl;
      if (Object.keys(connInfo.pgOptions).length === 0) {
        delete connInfo.pgOptions;
      }

      return connInfo;
    },
    parseBeforeEditConnection: ({ connInfo }) => {
      /**
       * This hook is called before editing the connection using the assistant
       * so you can do any transformations before editing it.
       * EG: absolute file path transformation, string manipulation etc
       * Below is the exmaple for SQLite, where we use relative path to save,
       * but we transform to asolute before editing
       */
      const formData: typeof connInfo = {
        ...connInfo,
        connectionMethod: "Server and Port",
      };
      if (connInfo.socketPath) {
        formData.connectionMethod = "Socket File";
      } else if (connInfo.connectString) {
        formData.connectionMethod = "Connection String";
      }

      if (connInfo.askForPassword) {
        formData.usePassword = "Ask on connect";
        delete formData.password;
      } else if (typeof connInfo.password === "string") {
        delete formData.askForPassword;
        formData.usePassword = connInfo.password
          ? "Save password"
          : "Use empty password";
      }

      formData.pgOptions = formData.pgOptions || {};
      if (formData.pgOptions.ssl) {
        formData.pgOptions.enableSsl = "Enabled";
        if (typeof formData.pgOptions.ssl === "boolean") {
          formData.pgOptions.ssl = {};
        }
      } else {
        formData.pgOptions.enableSsl = "Disabled";
      }

      return formData;
    },
    driverAliases: [DRIVER_ALIAS],
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
