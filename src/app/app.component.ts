import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { version } from '../../package.json';

import { PushapeService } from 'src/app/services/pushape.service';
import { PlaygroundService } from 'src/app/services/playground.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  selectedIndex = 0;
  pushId?: string;

  readonly version = version;
  readonly appPages = [
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
    private readonly platform: Platform,
    private readonly splashScreen: SplashScreen,
    private readonly statusBar: StatusBar,
    private readonly pushape: PushapeService,
    private readonly playground: PlaygroundService
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.pushape.notification$.subscribe(() => {
      // Here you can trigger routing events into your application when notifications happens
    });
  }

  async initializeApp() {
    await this.platform.ready();

    this.statusBar.styleDefault();
    this.splashScreen.hide();

    if (this.playground.isNotificationActivated()) {
      console.log('[APPCOMPONENT] Notifications Enabled');

      const pushapeConfig = this.playground.getPushapeDefaultConfig();
      this.pushape.init(pushapeConfig);
    } else {
      console.log('[APPCOMPONENT] Notifications Disabled');
    }
  }
}
