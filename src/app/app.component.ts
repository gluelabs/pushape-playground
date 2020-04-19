import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { PushapeService, PushapeNotification } from './services/pushape.service';
import { version } from '../../package.json';
import { PlaygroundService } from './services/playground.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public version: string = version;
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'The Project',
      url: '/project',
      icon: 'information-circle'
    }
  ];

  

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private pushape: PushapeService,
    private playground: PlaygroundService
  ) {
    this.initializeApp();
  }

  push_id: string;

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if(this.playground.isNotificationActivated()){
        console.log("[APPCOMPONENT] Notifications Enabled");
        const pushapeConfig = this.playground.getPushapeDefaultConfig();
        this.pushape.init(pushapeConfig);
      }else{
        console.log("[APPCOMPONENT] Notifications Disabled");
      }
      
    });
  }

  ngOnInit() {

    this.pushape.notification$.subscribe(
      (notification: PushapeNotification) => {
        //Here you can trigger routing events into 
        //your application when notifications happens
      }
    )
  }


}
