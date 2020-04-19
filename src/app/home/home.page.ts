import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PushapeService, PushapeStatus, PushapeNotification } from '../services/pushape.service';
import { ToastController, AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Device } from '@ionic-native/device/ngx';
import { config, Subscription } from 'rxjs';
import { PathLocationStrategy } from '@angular/common';
import { PlaygroundService } from '../services/playground.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  pushapeStatus: PushapeStatus;
  lastNotification: PushapeNotification = null;
  notificationEnabled: boolean = this.playground.isNotificationActivated();
  garbage: Subscription[] = [];
  defaultAppId:any = environment.pushape_app;


  constructor(
    public pushape: PushapeService,
    private cd: ChangeDetectorRef,
    private toast: ToastController,
    private playground: PlaygroundService,
    private alertController: AlertController,
  ) { }

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
    const p = this.pushape.notification$.subscribe(
      async (notification: PushapeNotification) => {
        if (notification) {
          const toast = await this.toast.create({
            message: notification.title + ": " + notification.message,
            duration: 3000
          });
          toast.present();
          this.lastNotification = notification;
        }

      }
    );

    const n = this.playground.isNotificationActivated$.subscribe(
      (r) => {
        this.notificationEnabled = r;
        this.cd.detectChanges();
      }
    );

  }
  /*
    ionViewWillLeave() {
      this.garbage.forEach(
        (j)=>{
          j.unsubscribe();
        }
      )
    }
    */
   



   setNotificationStatus(e) {
    const targetStatus = e.detail.checked;
    this.playground.setNotificationStatus(targetStatus);

    if (targetStatus) {
      const c = this.playground.getPushapeDefaultConfig();
      this.pushape.init(c);
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
            console.log('Confirm Ok',input);
            this.setAppId(input.appId);
          }
        }
      ]
    });

    await alert.present();
  }

  setAppId(appId){
    console.log('setAppId',appId);
    if(appId){
      this.playground.setAppId(appId);
      this.playground.renewPushape(appId);
    }
  }









}
