import {BaseLoginProvider} from '../entities/base-login-provider';
import {LoginProviderClass, SocialUser} from '../entities/user';

declare let SC: any;

export class SoundCloudLoginProvider extends BaseLoginProvider {

    public static readonly PROVIDER_ID = 'soundcloud';
    public loginProviderObj: LoginProviderClass = new LoginProviderClass();

    constructor(private clientId: string) {
        super();
        this.loginProviderObj.id = clientId;
        this.loginProviderObj.name = 'soundcloud';
        this.loginProviderObj.url = 'https://connect.soundcloud.com/sdk/sdk-3.3.0.js';
    }

    static drawUser(response: any): SocialUser {
        let user: SocialUser = new SocialUser();
        user.id = response.id;
        user.name = response.name;
        user.email = response.email;
        user.token = response.token;
        user.image = `https://i1.sndcdn.com/avatars-${response.id}-${response.name}-t200x200.jpg`;
        return user;
    }

    initialize(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            this.loadScript(this.loginProviderObj, () => {
                SC.init({
                    appId: this.clientId,
                    autoLogAppEvents: true,
                    cookie: true,
                    xfbml: true,
                    version: 'v2.10'
                });
                SC.AppEvents.logPageView();

                SC.getLoginStatus(function (response: any) {
                    if (response.status === 'connected') {
                        const accessToken = SC.getAuthResponse()['accessToken'];
                        SC.api('/me?fields=name,email,picture', (res: any) => {
                            resolve(SoundCloudLoginProvider.drawUser(
                                Object.assign({}, {
                                        token: accessToken
                                    }, res
                                )
                                )
                            );
                        });
                    }
                });
            });
        });
    }

    signIn(): Promise<SocialUser> {
        return new Promise((resolve, reject) => {
            SC.login((response: any) => {
                if (response.authResponse) {
                    const accessToken = SC.getAuthResponse()['accessToken'];
                    SC.api('/me?fields=name,email,picture', (res: any) => {
                        resolve(SoundCloudLoginProvider.drawUser(Object.assign({}, {
                                token: accessToken
                            }, res)
                            )
                        );
                    });
                }
            }, {scope: 'email,public_profile'});
        });
    }

    signOut(): Promise<any> {
        return new Promise((resolve, reject) => {
            SC.logout((response: any) => {
                resolve();
            });
        });
    }

}
