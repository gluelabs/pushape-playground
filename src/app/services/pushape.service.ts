import { Injectable, EventEmitter } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import Pushape from 'pushape-cordova-push/www/push';

import {
  PushapeNotification,
  PushapeInitOptions,
  PushEvent,
  PushapeEventRegistrationData,
} from 'src/app/models/pushape';

// tslint:disable:variable-name
export class PushapeStatus {
  app_id: string | number = null;
  push_id: string = null;
  subscription_status: 'unsubscribed' | 'pending' | 'first_subscription' | 'subscribed' | 'error' = 'unsubscribed';
  internal_id: string = null;
}

@Injectable({
  providedIn: 'root',
})
export class PushapeService {
  private status: PushapeStatus = {
    app_id: null,
    push_id: null,
    subscription_status: null,
    internal_id: null
  };

  readonly status$: BehaviorSubject<PushapeStatus> = new BehaviorSubject(this.status);
  readonly notification$: EventEmitter<PhonegapPluginPush.NotificationEventResponse | undefined> = new EventEmitter();

  private pushapeObject: PushapeNotification;

  constructor() { }

  init(config: PushapeInitOptions) {
    this.status.app_id = config.pushape.id_app;
    this.status.internal_id = config.id_user;
    this.status.subscription_status = 'pending';

    this.propagateStatus();
    this.cordovaInit(config);
  }

  unregister() {
    console.log('[PUSHAPE] Unregister');

    this.pushapeObject.unregister(
      () => {
        console.log('[PUSHAPE] Unregister success');
        this.status.subscription_status = 'unsubscribed';
        this.propagateStatus();
      },
      () => {
        console.log('[PUSHAPE] Unregister error');
        this.status.subscription_status = 'unsubscribed';
        this.propagateStatus();
      }
    );
  }

  private cordovaInit(config: PushapeInitOptions) {
    this.pushapeObject = Pushape.init(config);

    // TODO: Try to remove `any` and use real type
    this.pushapeObject.on(PushEvent.REGISTRATION, (data: any) => {
      console.log('[PUSHAPE] Data on registration without parse', data),
      this.setRegistrationsData(JSON.parse(data));
    });

    this.pushapeObject.on(PushEvent.NOTIFICATION, (data) => {
      this.onNotification(data);
    });

    this.pushapeObject.on(PushEvent.ERROR, (e: Error) => {
      console.log('[PUSHAPE] Error', e);

      this.status.subscription_status = 'error';
      this.propagateStatus();
    });
  }

  /**
   * Set locally the registration data and propagate them to the subscribed functions.
   */
  private setRegistrationsData(data: PushapeEventRegistrationData) {
    console.log('[PUSHAPE] RegistrationsData', data);

    this.status.push_id = data.push_id;
    this.status.subscription_status = data.status === 1 ? 'first_subscription' : 'subscribed';

    this.propagateStatus();
  }

  /**
   * Propagate Pushape status changes.
   */
  private propagateStatus() {
    this.status = JSON.parse(JSON.stringify(this.status));
    this.status$.next(this.status);
  }

  /**
   * It's triggered when a Notification occur and propagate it to the subscribed funcions.
   */
  private onNotification(data: PhonegapPluginPush.NotificationEventResponse) {
    console.log('[PUSHAPE] Notification', data);
    this.notification$.emit(data);
  }

}
