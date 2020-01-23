import SecureLS from "secure-ls";
const ls = new SecureLS({ encodingType: "aes", isCompression: false });

export default class GoogleAuthService {
  constructor () {
    this.authenticated = this.isAuthenticated();
    this.authInstance = null;

    this.offlineAccessCode = null;
    this.getOfflineAccessCode = this.getOfflineAccessCode.bind(this);
    this.grantOfflineAccess = this.grantOfflineAccess.bind(this);
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.isSignedIn = this.isSignedIn.bind(this);
    this.listenUserSignIn = this.listenUserSignIn.bind(this)
  }

  /**
   * Private method that takes in an authResult and returns the authResult expiration time
   *
   * @name _expiresAt
   *
   * @since 0.0.10
   *
   * @access Private
   *
   * @param { object } authResult
   *   authResult object from google
   *
   * @returns
   *   a string of when the google auth token expires
   */
  _expiresAt (authResult) {
    return JSON.stringify(authResult.expires_in * 1000 + new Date().getTime())
  }

  /**
   *  Private method that takes in an authResult and a user Profile setting the values in locaStorage
   *
   * @name _setStorage
   *
   * @since 0.0.10
   *
   * @access Private
   *
   * @param { object } authResult
   *  authResult object from google
   * @param { object } profile
   *  Default is null and if not passed it will be null this is the google user profile object
   *
   * @fires ls.set
   *
   */
  _setStorage (authResult, profile = null) {
    ls.set('gapi.access_token', authResult.access_token);
    ls.set('gapi.id_token', authResult.id_token);
    ls.set('gapi.expires_at', this._expiresAt(authResult));

    if (profile) {
      ls.set('gapi.id', profile.getId());
      ls.set('gapi.full_name', profile.getName());
      ls.set('gapi.first_name', profile.getGivenName());
      ls.set('gapi.last_name', profile.getFamilyName());
      ls.set('gapi.image_url', profile.getImageUrl());
      ls.set('gapi.email', profile.getEmail())
    }
  }

  /**
   *  Private method used to remove all gapi named spaced item from localStorage
   *
   * @name _clearStorage
   *
   * @since 0.0.10
   *
   * @access Private
   *
   * @fires ls.remove
   *
   */
  _clearStorage () {
    ls.remove('gapi.access_token');
    ls.remove('gapi.id_token');
    ls.remove('gapi.expires_at');
    ls.remove('gapi.id');
    ls.remove('gapi.full_name');
    ls.remove('gapi.first_name');
    ls.remove('gapi.last_name');
    ls.remove('gapi.image_url');
    ls.remove('gapi.email')
  }

  _setOfflineAccessCode (authResult) {
    if (authResult.code) {
      this.offlineAccessCode = authResult.code
    } else {
      throw new Error('Offline access code missing from result', authResult)
    }
  }

  _setSession (response) {
    const profile = this.authInstance.currentUser.get().getBasicProfile();
    const authResult = this.authInstance.currentUser.get().getAuthResponse(true);
    this._setStorage(authResult, profile);
    this.authenticated = true
  }

  getOfflineAccessCode () {
    return this.offlineAccessCode
  }

  grantOfflineAccess (event) {
    if (!this.authInstance) throw new Error('gapi not initialized');
    return this.authInstance.grantOfflineAccess()
      .then(this._setOfflineAccessCode.bind(this))
  }

  login (event) {
    if (!this.authInstance) throw new Error('gapi not initialized');
    const this$1 = this;
    return new Promise((res, rej) => {
      this$1.authInstance.signIn()
        .then(function (response) {
          this$1._setSession(response);
          res()
        })
    })
  }

  async refreshToken () {
    if (!this.authInstance) throw new Error('gapi not initialized');
    const GoogleUser = this.authInstance.currentUser.get();
    const authResult = await GoogleUser.reloadAuthResponse();
    this._setStorage(authResult);
  }

  logout (event) {
    if (!this.authInstance) throw new Error('gapi not initialized');
    const this$1 = this;
    return new Promise((res, rej) => {
      this$1.authInstance.signOut()
        .then(function () {
          this$1._clearStorage();
          this$1.authenticated = false;
          res()
        })
    })
  }

  disconnect (event) {
    if (!this.authInstance) throw new Error('gapi not initialized');
    const this$1 = this;
    return new Promise((res, rej) => {
      this$1.authInstance.disconnect()
        .then(function () {
          this$1._clearStorage();
          this$1.authenticated = false;
          res()
        })
    })
  }

  /**
   * Will determine if the login token is valid using localStorage
   *
   * @name isAuthenticated
   *
   * @since 0.0.10
   *
   * @return Boolean
   *
   */
  isAuthenticated () {
    const expiresAt = parseInt(ls.get('gapi.expires_at'));
    return new Date().getTime() < expiresAt
  }

  /**
   * Will determine if the login token is valid using google methods
   *
   * @name isSignedIn
   *
   * @since 0.0.10
   *
   * @return Boolean
   *
   */
  isSignedIn () {
    if (!this.authInstance) throw new Error('gapi not initialized');
    const GoogleUser = this.authInstance.currentUser.get();
    return GoogleUser.isSignedIn()
  }

  /**
   * Accept the callback to be notified when the authentication status changes.
   * Will also determine if the login token is valid using google methods and return UserData or false
   *
   * @name listenUserSignIn
   *
   * @since 0.0.10
   *
   * @param { function } Callback
   *   the callback function to be notified of an authentication status change
   * @return Boolean. False if NOT authenticated, UserData if authenticated
   *
   */
  listenUserSignIn (callback) {
    if (!this.authInstance) throw new Error('gapi not initialized');
    this.authInstance.isSignedIn.listen(callback);
    if (this.authInstance.currentUser.get().isSignedIn()) {
      return this.getUserData()
    } else {
      return false
    }
  }

  /**
   * Gets the user data from local storage
   *
   * @name getUserData
   *
   * @since 0.0.10
   *
   * @return object with user data from localStorage
   */
  getUserData () {
    return {
      id: ls.get('gapi.id'),
      firstName: ls.get('gapi.first_name'),
      lastName: ls.get('gapi.last_name'),
      fullName: ls.get('gapi.full_name'),
      email: ls.get('gapi.email'),
      imageUrl: ls.get('gapi.image_url'),
      expiresAt: ls.get('gapi.expires_at'),
      accessToken: ls.get('gapi.access_token'),
      idToken: ls.get('gapi.id_token')
    }
  }
}
