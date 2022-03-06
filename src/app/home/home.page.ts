import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';

import { switchMap, tap } from 'rxjs/operators';

import { PushapeService } from 'src/app/services/pushape.service';
import { PlaygroundService } from 'src/app/services/playground.service';
import { NotificationEventResponse } from '@ionic-native/pushape-push';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  readonly lastNotification$ = this.pushape.notification$
    .pipe(
      //filter((notification): notification is PhonegapPluginPush.NotificationEventResponse => !!notification),
      tap(() => setTimeout(() =>{this.cd.detectChanges()},200)),
    );/**/

  readonly pushapeStatus$ = this.pushape.status$.asObservable().pipe(tap(() => this.cd.detectChanges()));
  readonly notificationEnabled$ = this.playground.isNotificationActivated$.asObservable();
  readonly hasPermission$ = this.pushape.getPermissions$().pipe(tap(() => this.cd.detectChanges()));
  lastPermission: boolean = false;
  ;
  readonly defaultInternalId = 'Pushape_user';

  constructor(
    private readonly pushape: PushapeService,
    private readonly toast: ToastController,
    private readonly playground: PlaygroundService,
    private readonly alertController: AlertController,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.pushape.resetBadge();
    /**
     * TODO: Need to unsubscribe this stream
     */
    this.lastNotification$
      .pipe(
        switchMap((notification: NotificationEventResponse) => {
          return this.toast.create({
            message: notification.title + ': ' + notification.message,
            duration: 3000,
          });
        }),
      )
      .subscribe((toast) => toast.present());


    this.hasPermission$.subscribe(
      (permission: boolean) => {
        if (!this.lastPermission && permission) {
          console.log('[Home Page] Permission Activated, Will Init Pushape to prevente false subscriptios');
          const config = this.playground.getPushapeDefaultConfig();
          this.pushape.init(config);
        } else {
          console.log('[Home Page] Permission Update', permission);
        }
        this.lastPermission = permission;

      })
    /**/
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


  async changeInternalId() {
    const alert = await this.alertController.create({
      header: 'Set Internal Id',
      message: 'You can set your Internal Id to test your notification stack.',
      inputs: [
        {
          name: 'internalId',
          type: 'text',
          placeholder: 'Your Internal Id'
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
            this.playground.resetInternalId();
          }
        }, {
          text: 'Ok',
          handler: (input) => {
            console.log('Confirm Ok', input);
            this.playground.setInternalId(input.internalId);
          }
        }
      ]
    });

    await alert.present();
  }

  checkPermissions() {
    this.pushape.checkPermissions();
  }

}
