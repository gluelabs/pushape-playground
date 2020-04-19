import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PushapeService } from './pushape.service';
import { Device } from '@ionic-native/device/ngx';
import { BehaviorSubject } from 'rxjs';

/**
 * Playground Service include all the Custom -extra pushape- 
 * functions needed to this app
 */
@Injectable({
  providedIn: 'root'
})
export class PlaygroundService {
  isNotificationActivated$: BehaviorSubject<boolean> = new BehaviorSubject(this.isNotificationActivated());
  constructor(
    private pushape: PushapeService,
    private device: Device
  ) { }

  /**
   * Return the app id wrapped into a promise.
   * Try to find appId in local storage (to ovverryde the dafault one).
   * If It doesn't exists return the Envirinment App Id
   */
  getAppId(): any {
    const appId = window.localStorage.getItem('appId');
    if (appId) return appId;
    else return environment.pushape_app;
  }

  /**
   * Set a different AppId for testing Purpose.
   * This scenario is not the normal Scenario 
   * You are expected to use.
   */
  setAppId(appId) {
    window.localStorage.setItem('appId', appId);
  }

  /**
   * Set a different AppId for testing Purpose.
   * This scenario is not the normal Scenario 
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
    return window.localStorage.getItem('notificationStatus') == 'DISACTIVATED' ? false : true;
  }
  /**
   * Reload Pushape Subscription with a custom appId
   */
  renewPushape(appId) {
    let pushapeConfig = {
      enabled: true,
      android: {
        'senderID': environment.sender_id
      },
      ios: {
        //OPTIONS
        alert: "true",
        badge: true,
        sound: "false"
      },
      pushape: {
        "id_app": environment.pushape_app, //your pushape app id
        "platform": this.device.platform, //ios or android
        "uuid": this.device.uuid
      },
      "id_user": "OPTIONAL" //YOUR USER ID, in order to send notification using your custom id
    };

    pushapeConfig.pushape.id_app = appId;
    this.pushape.unregister();
    setTimeout(() => {
      this.pushape.init(pushapeConfig);
    }, 1000);
  }


  getPushapeDefaultConfig() {
    /**
       * We exec the following line in order to allow to customize the app id
       * NORMALLY we DO NOT expect the appID to change runtime
       * In your app you can just pass the configuration
       * wiht your app id, so remove this line
       */
    const id_app = this.getAppId();
    return {
      enabled: true,
      android: {
        'senderID': environment.sender_id
      },
      ios: {
        //OPTIONS
        alert: "true",
        badge: true,
        sound: "false"
      },
      pushape: {
        "id_app": id_app, //your pushape app id
        "platform": this.device.platform, //ios or android
        "uuid": this.device.uuid
      },
      "id_user": "Pushape_user" //YOUR USER ID, in order to send notification using your custom id
    };
  }
}
