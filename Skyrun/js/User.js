class User {
    constructor() {
        this.init();
        this.storageKey = 'user';
        this.load();
    }

    init(){
        this.name = null;
        this.email = null;
        this.picture = null;
    }

    set(name, email, picture) {
        this.name = name;
        this.email = email;
        this.picture = picture;
    }

    get() {
        return {
            name: this.name,
            email: this.email,
            picture: this.picture
        };
    }

    isLogin() {
        return this.email !== null && this.name !== null;
    }

    load() {
        const userStr = localStorage.getItem(this.storageKey);
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                this.set(user.name, user.email, user.picture);
            } catch (error) {
                console.error('Error loading user from storage:', error);
                localStorage.removeItem(this.storageKey);
                this.init();
            }
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.get()));
    }

}

const g_pUser = new User();
