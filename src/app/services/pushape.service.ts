import { Injectable } from '@angular/core';
import {
  PushapePush,
  NotificationEventResponse,
  PushObject,
  PushapeOptions,
  PushapeRegistrationEventResponse
} from '@ionic-native/pushape-push/ngx';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

// tslint:disable:variable-name
export class PushapeStatus {
  app_id: string | number | null = null;
  push_id: string | null = null;
  subscription_status: 'unsubscribed' | 'pending' | 'first_subscription' | 'subscribed' | 'error' = 'unsubscribed';
  internal_id: string | null = null;
}

@Injectable({
  providedIn: 'root',
})
export class PushapeService {
  private status: PushapeStatus = {
    app_id: null,
    push_id: null,
    subscription_status: 'unsubscribed',
    internal_id: null
  };

  readonly status$ = new BehaviorSubject<PushapeStatus>(this.status);
  readonly notification$ = new Subject<NotificationEventResponse | undefined>();
  readonly hasPermissions$ = new BehaviorSubject<boolean>(false);

  private pushapeObject?: PushObject;

  constructor(
    private readonly pushapePush: PushapePush,
  ) {
    this.checkPermissions();
  }

  init(config: PushapeOptions) {
    this.status.app_id = config.pushape.id_app;
    this.status.internal_id = config.id_user;
    this.status.subscription_status = 'pending';

    this.propagateStatus();
    this.cordovaInit(config);
  }

  checkPermissions():void {
    console.log('[PUSHAPE] Check Permission');
    this.pushapePush.hasPermission(
      (data: any) => {
        console.log('[PUSHAPE] Check Permission Data', data);
        this.hasPermissions$.next(data.isEnabled);
        if (!data.isEnabled) {
          console.log('[PUSHAPE] !data.isEnabled, Retry');
          setTimeout(() => { this.checkPermissions() }, 1000);
        }
      }
    );
  }
  getPermissions$():Observable<boolean> {
    return this.hasPermissions$.asObservable();
  }

  resetBadge():void {
    if (!this.pushapeObject) {
      console.log('[PUSHAPE] resetBadge ERROR: !this.pushapeObject');
      return;
    }
    this.pushapeObject.clearAllNotifications()
      .then(() => {
        console.log('[PUSHAPE] clearAllNotifications SUCCESS');
      })
      .catch((err: any) => {
        console.log('[PUSHAPE] clearAllNotifications ERRORE:', err);
      })
  }

  unregister() {
    console.log('[PUSHAPE] Unregister');

    if (!this.pushapeObject) {
      throw new Error('[PUSHAPE] Cannot complete unregister without a valid pushape object');
    }

    this.pushapeObject.unregister()
      .then(() => {
        console.log('[PUSHAPE] Unregister success');

        this.status.subscription_status = 'unsubscribed';
        this.propagateStatus();
      })
      .catch(() => {
        console.log('[PUSHAPE] Unregister error');

        this.status.subscription_status = 'unsubscribed';
        this.propagateStatus();
      });
  }

  private cordovaInit(config: PushapeOptions) {
    this.pushapeObject = this.pushapePush.init(config);

    this.pushapeObject.on('registration').subscribe((serializedData: unknown) => {
      const data: PushapeRegistrationEventResponse = JSON.parse(serializedData as string);
      this.setRegistrationsData(data);
    });

    this.pushapeObject.on('notification').subscribe((data) => {
      this.onNotification(data);
    });

    this.pushapeObject.on('error').subscribe((e: Error) => {
      console.log('[PUSHAPE] Error', e);

      this.status.subscription_status = 'error';
      this.propagateStatus();
    });
  }

  /**
   * Set locally the registration data and propagate them to the subscribed functions.
   */
  private setRegistrationsData(data: PushapeRegistrationEventResponse) {
    console.log('[PUSHAPE] Registration\'s data', data);

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
  private onNotification(data: NotificationEventResponse) {
    console.log('[PUSHAPE] Notification', data);
    this.notification$.next(data);
  }

}
