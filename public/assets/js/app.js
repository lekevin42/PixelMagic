var lock = new Auth0Lock('vfLylkoXp3xNi2MAN-1-DHH2_wxiHSem', 'bgiang93.auth0.com');

var btn_login = document.getElementById('btn-login');

btn_login.addEventListener('click', function() {
  lock.show();
});

lock.on("authenticated", function(authResult) {
  lock.getProfile(authResult.idToken, function(error, profile) {
    if (error) {
      // Handle error
      return;
    }
    localStorage.setItem('id_token', authResult.idToken);
    // Display user information
    show_profile_info(profile);
  });
});
