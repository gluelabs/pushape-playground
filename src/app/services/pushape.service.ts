import { Injectable, EventEmitter } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import Pushape from 'pushape-cordova-push/www/push';

// tslint:disable:variable-name

export class PushapeStatus {
  app_id: string | number = null;
  push_id: string = null;
  subscription_status: 'unsubscribed' | 'pending' | 'first_subscription' | 'subscribed' | 'error' = 'unsubscribed';
  internal_id: string = null;
}

export class PushapeConfiguration {
  pushape: any;
  android: any;
  ios: any;
  id_user: any;
}
export class PushapeNotification {
  message?: string;
  title?: string;
  count?: string;
  sound?: string;
  image?: string;
  additionalData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PushapeService {
  private status: PushapeStatus = {
    app_id: null,
    push_id: null,
    subscription_status: null,
    internal_id: null
  };

  readonly status$: BehaviorSubject<PushapeStatus> = new BehaviorSubject(this.status);
  readonly notification$: EventEmitter<PushapeNotification> = new EventEmitter();

  private pushapeObject: any;

  constructor() { }

  init(config: PushapeConfiguration) {
    this.status.app_id = config.pushape.id_app;
    this.status.internal_id = config.id_user;
    this.status.subscription_status = 'pending';

    this.propagateStatus();
    this.cordovaInit(config);
  }

  unregister() {
    console.log('[PUSHAPE] Unregister');

    this.pushapeObject.unregister(
      (r: any) => {
        console.log('[PUSHAPE] Unregister Success', r);
        this.status.subscription_status = 'unsubscribed';
        this.propagateStatus();
      },
      (e: any) => {
        console.log('[PUSHAPE] Unregister Error', e);
        this.status.subscription_status = 'unsubscribed';
        this.propagateStatus();
      }
    );
  }

  private cordovaInit(config: PushapeConfiguration) {
    this.pushapeObject = Pushape.init(config);

    this.pushapeObject.on('registration',
      (data: any) => {
        this.setRegistrationsData(JSON.parse(data));
      },
      (e: any) => {
        this.status.subscription_status = 'error';
        this.propagateStatus();
      });

    this.pushapeObject.on('notification', (data: any) => {
      this.onNotification(data);
    });

    this.pushapeObject.on('error', (e: any) => {
      // e.message
      console.log('[PUSHAPE] Error', e);
    });
  }

  /**
   * Set locally the registration data and propagate
   * them to the subscribed functions
   *
   */
  private setRegistrationsData(data: any) {
    console.log('[PUSHAPE] RegistrationsData', data);
    this.status.push_id = data.push_id;
    this.status.subscription_status = data.status === 1 ? 'first_subscription' : 'subscribed';
    this.propagateStatus();
  }
  /**
   * Propagare Pushape status changes
   */
  private propagateStatus() {
    this.status = JSON.parse(JSON.stringify(this.status));
    this.status$.next(this.status);
  }
  /**
   * It's triggered when a Notification occur and
   * propagate it to the subscribed funcions
   */
  private onNotification(data: PushapeNotification) {
    // data.message,
    // data.title,
    // data.count,
    // data.sound,
    // data.image,
    // data.additionalData
    console.log('[PUSHAPE] Notification', data);
    this.notification$.emit(data);
  }

}
