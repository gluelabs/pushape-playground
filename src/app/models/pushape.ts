// tslint:disable-next-line:no-reference
/// <reference path="../../../plugins/pushape-cordova-push/types/index.d.ts" />

/**
 * All of the properties below are copy and paste from original TS Push Plugin definition because they haven't a specific type.
 * It's use to add an internal custom property.
 */
export interface PushAndroidInitOptions {
  /**
   * The name of a drawable resource to use as the small-icon. The name should not include the extension.
   */
  icon?: string;
  /**
   * Sets the background color of the small icon on Android 5.0 and greater.
   * Supported Formats - http://developer.android.com/reference/android/graphics/Color.html#parseColor(java.lang.String)
   */
  iconColor?: string;
  /**
   * If true it plays the sound specified in the push data or the default system sound. Default is true.
   */
  sound?: boolean;
  /**
   * If true the device vibrates on receipt of notification. Default is true.
   */
  vibrate?: boolean;
  /**
   * If true the icon badge will be cleared on init and before push messages are processed. Default is false.
   */
  clearBadge?: boolean;
  /**
   * If true the app clears all pending notifications when it is closed. Default is true.
   */
  clearNotifications?: boolean;
  /**
   * If true will always show a notification, even when the app is on the foreground. Default is false.
   */
  forceShow?: boolean;
  /**
   * If the array contains one or more strings each string will be used to subscribe to a GcmPubSub topic.
   */
  topics?: string[];
  /**
   * The key to search for text of notification. Default is 'message'.
   */
  messageKey?: string;
  /**
   * The key to search for title of notification. Default is 'title'.
   */
  titleKey?: string;
}

export enum PushEvent {
  REGISTRATION = 'registration',
  NOTIFICATION = 'notification',
  ERROR = 'error',
}

export interface PushapeEventRegistrationData extends PhonegapPluginPush.RegistrationEventResponse {
  push_id: string;
  status: number;
}

export interface PushapeInitOptions extends PhonegapPluginPush.InitOptions {
  enabled?: boolean;
  android?: PushAndroidInitOptions & {
    senderID: string;
  };
  pushape: {
    id_app: number | string;
    platform: string;
    uuid: string;
  };
  id_user: string;
}

export interface PushapeNotification extends PhonegapPluginPush.PushNotification {
  init(config: PushapeInitOptions): void;
}
