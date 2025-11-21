class GoogleLogin {
    constructor(element) {
        this.sClientID = "926501929839-tljv04j9lahpim1gi52dig7qtkpc7p2h.apps.googleusercontent.com";
        this.loginButton = element;
        this.userMenu = document.querySelector('.user-menu');
        this.userAvatar = document.querySelector('.user-avatar');
        this.logoutItem = document.querySelector('.logout-item');
        this.userButton = document.querySelector('.user-button');
        this.userDropdown = document.querySelector('.user-dropdown');
        
        this.setupEventListeners();
        
        console.log(element);
        const pGoogleLogin = this;
        window.onload = function () {
            if( typeof google === 'undefined' )return; 

            google.accounts.id.initialize({
                client_id: pGoogleLogin.sClientID,
                'data-context': "signin",
                callback: pGoogleLogin.onGoogleSignIn.bind(pGoogleLogin),
                auto_select: true, /* 자동 로그인 (페이지 로딩시 자동 로그인) */
                // cancel_on_tap_outside: true
            });

            /* 로그인 창에 있는 구글로 로그인 버튼 */
            google.accounts.id.renderButton(
                element,
                { theme: "outline", size: "large" }
            );
            
            // One Tap 프롬프트 표시
            if( g_pUser.isLogin() ){
                pGoogleLogin.updateUserMenu(g_pUser.get().picture);
            } else{
                google.accounts.id.prompt();
            }
        }
    }


    setupEventListeners() {
        // Logout click handler
        this.logoutItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });

        // 사용자 버튼 클릭 핸들러
        this.userButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.userDropdown.classList.toggle('show');
        });

        // 외부 클릭 핸들러
        document.addEventListener('click', (e) => {
            if (!this.userMenu.contains(e.target)) {
                this.userDropdown.classList.remove('show');
            }
        });
    }

    updateUserMenu(picture) {
        this.userAvatar.src = picture;
        this.loginButton.style.display = 'none';
        this.userMenu.style.display = 'inline-block';
    }

    handleLogout() {
        g_pUser.init();
        this.loginButton.style.display = 'inline-block';
        this.userMenu.style.display = 'none';
        this.userDropdown.classList.remove('show');
        // localStorage에서 사용자 정보 제거
        localStorage.removeItem('user');
        // 자동 로그인 비활성화
        google.accounts.id.disableAutoSelect();
        // One Tap 프롬프트 다시 표시
        //google.accounts.id.prompt();
    }

    decodeJwtResponse(token) {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('JWT format is invalid');
        }

        const base64UrlDecode = (str) => {
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            const jsonStr = atob(base64);
            return JSON.parse(jsonStr);
        };

        const payload = base64UrlDecode(parts[1]);
        return payload;
    }

    onGoogleSignIn = async (googleResponse) => {
        /* 로그인 되어 있으면 페이지 시작시 onGoogleSignIn()가 무조건 호출된다.  */
        const oUser = this.decodeJwtResponse(googleResponse.credential);
        
        try {
            const apiResponse = await fetch('/api/users/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${googleResponse.credential}`
                },
                body: JSON.stringify({
                    name: oUser.name,
                    id: oUser.sub,
                    email: oUser.email,
                    picture: oUser.picture
                })
            });

            //console.log(apiResponse);
            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.message || 'Authentication failed');
            }

            const data = await apiResponse.json();
            if( !data.success ){
                throw new Error('Authentication failed');
            }
            //console.log(data);
            
            // 사용자 정보를 localStorage에 저장

            g_pUser.set(oUser.name, oUser.email, oUser.picture);
            g_pUser.save();
            
            // Update UI with user info
            this.updateUserMenu(oUser.picture);
            
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please try again.');
        }
    }

}

const g_pLogin = new GoogleLogin(document.getElementById("google-login-button"));