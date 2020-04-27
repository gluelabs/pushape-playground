import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

import { switchMap, filter, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { PushapeService, PushapeStatus } from 'src/app/services/pushape.service';
import { PlaygroundService } from 'src/app/services/playground.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pushapeStatus?: PushapeStatus;
  lastNotification?: PhonegapPluginPush.NotificationEventResponse;

  notificationEnabled = this.playground.isNotificationActivated();

  defaultAppId: string = environment.pushape_app;

  constructor(
    readonly pushape: PushapeService,
    private readonly cd: ChangeDetectorRef,
    private readonly toast: ToastController,
    private readonly playground: PlaygroundService,
    private readonly alertController: AlertController,
  ) {
  }

  ngOnInit() {
    this.pushape.status$.subscribe((status: PushapeStatus) => {
      this.pushapeStatus = status;
      this.cd.detectChanges();
    });

    /**
     * If you need to trigger routing event consider
     * to subscribe to this event emitter in your
     * app.component.ts
     */
    this.pushape.notification$
      .pipe(
        filter((notification): notification is PhonegapPluginPush.NotificationEventResponse => !!notification),
        tap((notification) => this.lastNotification = notification),
        switchMap((notification) => {
          return this.toast.create({
            message: notification.title + ': ' + notification.message,
            duration: 3000,
          });
        }),
      )
      .subscribe((toast) => toast.present());

    this.playground.isNotificationActivated$.subscribe((r) => {
      this.notificationEnabled = r;
      this.cd.detectChanges();
    });

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
