import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

import { switchMap, filter, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { PushapeService } from 'src/app/services/pushape.service';
import { PlaygroundService } from 'src/app/services/playground.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  readonly lastNotification$ = this.pushape.notification$.asObservable().pipe(
    filter((notification): notification is PhonegapPluginPush.NotificationEventResponse => !!notification),
    tap(() => this.cd.detectChanges()),
  );

  readonly pushapeStatus$ = this.pushape.status$.asObservable().pipe(tap(() => this.cd.detectChanges()));
  readonly notificationEnabled$ = this.playground.isNotificationActivated$.asObservable();

  readonly defaultAppId = environment.pushape_app;

  constructor(
    private readonly pushape: PushapeService,
    private readonly toast: ToastController,
    private readonly playground: PlaygroundService,
    private readonly alertController: AlertController,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    /**
     * If you need to trigger routing event consider
     * to subscribe to this event emitter in your
     * app.component.ts
     *
     * TODO: Need to unsubscribe this stream
     */
    this.lastNotification$
      .pipe(
        switchMap((notification) => {
          return this.toast.create({
            message: notification.title + ': ' + notification.message,
            duration: 3000,
          });
        }),
      )
      .subscribe((toast) => toast.present());
  }

  setNotificationStatus(event: { detail: { checked: boolean } }) {
    const targetStatus = event.detail.checked;
    this.playground.setNotificationStatus(targetStatus);

    if (targetStatus) {
      const config = this.playground.getPushapeDefaultConfig();
      this.pushape.init(config);
    } else {
      this.pushape.unregister();
    }
  }

  async changeAppId() {
    const alert = await this.alertController.create({
      header: 'Customize your App Id',
      message: 'You can set your Pushape AppId to test your notification stack. <b>You can get a Pushape AppId from www.pushape.com</b>',
      inputs: [
        {
          name: 'appId',
          type: 'text',
          placeholder: 'Your App Id'
        },

      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        },
        {
          text: 'Back to Default',
          cssClass: 'secondary',
          handler: () => {
            console.log('Set Default');
            this.setAppId(this.defaultAppId);
          }
        }, {
          text: 'Ok',
          handler: (input) => {
            console.log('Confirm Ok', input);
            this.setAppId(input.appId);
          }
        }
      ]
    });

    await alert.present();
  }

  private setAppId(appId: string) {
    console.log('setAppId', appId);
    if (appId) {
      this.playground.setAppId(appId);
      this.playground.renewPushape(appId);
    }
  }
}
