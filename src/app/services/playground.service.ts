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
  internalId: string;

  constructor(
    private readonly pushape: PushapeService,
    private readonly device: Device
  ) {
    this.internalId = this.getInternalId()

  }

  setInternalId(internalId: string) {
    window.localStorage.setItem('internalId', internalId);
    this.internalId = internalId;
    this.renewPushape();
  }

  getInternalId(): string {
    return window.localStorage.getItem('internalId') || 'Pushape_user';
  }


  resetInternalId() {
    window.localStorage.removeItem('internalId');
    this.internalId = 'Pushape_user';
    this.renewPushape()
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
  renewPushape() {
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
        id_app: environment.pushape_app,
        platform: this.device.platform, // ios or android
        uuid: this.device.uuid,
      },
      id_user: this.internalId
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
        id_app: environment.pushape_app,
        platform: this.device.platform,
        uuid: this.device.uuid
      },
      id_user: this.internalId,
    };
  }
}
