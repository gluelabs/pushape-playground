# Pushape Playground 


## Installation

Run `npm install` inside the project.

## Environment

Remember to add these two variables in `enviroment.ts` and `environment.prod.ts`:

```
  sender_id: '<YOUR_SENDER_ID>',
  pushape_app: '<YOUR_PUSHAPE_APP_ID>'
```

## PushApe

### pushape-plugin-push

After install it (already done in this project) following [Pushape Getting Started](https://github.com/gluelabs/pushape-cordova-push/blob/master/docs/PUSHAPE.md).

Add lines below in `package.json`:

```
  "cordova": {
    "plugins": {
      ...
      "pushape-cordova-push": {
        "ANDROID_SUPPORT_V13_VERSION": "27.+",
        "FCM_VERSION": "17.0.+"
      },
      ...
    }
  }
```

Add `google-services.json` from Firebase and check this line inside `config.xml`:

```
<resource-file src="google-services.json" target="app/google-services.json" />
```

#### TypeScript

In order to configure types follow [Pushape TypeScript](https://github.com/gluelabs/pushape-cordova-push/blob/master/docs/PUSHAPE_TYPESCRIPT.md).

## Android

Prepare app and plugins:

- `ionic cordova platform add android`
- `ionic cordova platform prepare android`

Build app:

- `ionic cordova build android` (unsigned APK)


## TODO

- [ ] Improve error handling UI
- [ ] Avoid to manually trigger change detection when pushape status change
- [ ] Test app on iOS
- [ ] Add Ionic Native plugin instead plain cordova lib
