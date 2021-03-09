import { Injectable } from '@angular/core';
import { Device } from '@ionic-native/device/ngx';
import { PushapeOptions } from '@ionic-native/pushape-push';

import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { PushapeService } from 'src/app/services/pushape.service';

/**
 * Playground Service include all the Custom -extra pushape-
 * functions needed to this app
 */
@Injectable({
  providedIn: 'root',
})
export class PlaygroundService {
  readonly isNotificationActivated$ = new BehaviorSubject(this.isNotificationActivated());

  constructor(
    private readonly pushape: PushapeService,
    private readonly device: Device
  ) {
  }

  /**
   * Return the app id wrapped into a promise.
   *
   * Try to find appId in local storage (to overide the dafault one).
   * If it doesn't exists return the environment App Id.
   */
  getAppId() {
    const appId = window.localStorage.getItem('appId');
    return appId || environment.pushape_app;
  }

  getInternalId() {
    const internalId = window.localStorage.getItem('internalId');
    return internalId || 'Pushape_user';
  }

  /**
   * Set a different AppId for testing Purpose.
   * This scenario is not the normal flow.
   * You are expected to use.
   */
  setAppId(appId: string) {
    window.localStorage.setItem('appId', appId);
  }

  /**
   * Set a different InternalId for testing purpose. 
   */
  setInternalId(internalId: string) {
    window.localStorage.setItem('internalId', internalId);
  }

  /**
   * Set a different AppId for testing Purpose.
   * This scenario is not the normal flow.
   * You are expected to use.
   */
  resetAppId() {
    window.localStorage.removeItem('appId');
  }

  /**
   * Set into the storage if notifications are active or disactive
   * @param targetStatus boolean
   */
  setNotificationStatus(targetStatus: boolean) {
    const activated = targetStatus ? 'ACTIVATED' : 'DISACTIVATED';
    this.isNotificationActivated$.next(targetStatus);
    window.localStorage.setItem('notificationStatus', activated);
  }

  /**
   * Return a boolen indicating if the notification are setted
   * Activated or Not
   */
  isNotificationActivated() {
    return window.localStorage.getItem('notificationStatus') === 'DISACTIVATED' ? false : true;
  }

  /**
   * Reload Pushape Subscription with a custom appId
   */
  renewPushape(appId: string, internalId: string) {

    const _appId = appId || this.getAppId();
    const _internalId = this.getInternalId() || internalId;

    const pushapeConfig: PushapeOptions = {
      enabled: true,
      android: {
        senderID: environment.sender_id
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false',
      },
      pushape: {
        id_app: _appId || environment.pushape_app,
        platform: this.device.platform, // ios or android
        uuid: this.device.uuid,
      },
      id_user: _internalId // YOUR USER ID, in order to send notification using your custom id
    };

    this.pushape.unregister();

    setTimeout(() => {
      this.pushape.init(pushapeConfig);
    }, 1000);
  }

  getPushapeDefaultConfig(): PushapeOptions {
    /**
     * We exec the following line in order to allow to customize the app id
     * NORMALLY we DO NOT expect the appID to change runtime
     *
     * In your app you can just pass the configuration wiht your app id, so remove this line.
     */
    const appId = this.getAppId();
    const internalId = this.getInternalId();
    return {
      enabled: true,
      android: {
        senderID: environment.sender_id
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      pushape: {
        id_app: appId,
        platform: this.device.platform,
        uuid: this.device.uuid
      },
      id_user: internalId,
    };
  }
}
