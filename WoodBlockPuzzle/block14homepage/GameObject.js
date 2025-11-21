// GameObject Class - 게임 오브젝트 기본 클래스
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isActive = true;
        this.tag = 'GameObject';
    }
    
    update(deltaTime) {
        // 기본 업데이트 로직 (자식 클래스에서 오버라이드)
    }
    
    draw(ctx) {
        // 기본 그리기 로직 (자식 클래스에서 오버라이드)
    }
    
    destroy() {
        this.isActive = false;
    }
}

// Character Class - 캐릭터 전용 클래스
class Character extends GameObject {
    constructor(spriteUrl, x, y, width, height, frameWidth = 512, frameHeight = 512, totalFrames = 99) {
        super(x, y, width, height);
        this.tag = 'Character';
        
        this.spriteUrl = spriteUrl;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.totalFrames = totalFrames;
        this.currentFrame = 0;
        this.fps = 30;
        this.frameTime = 0;
        this.isAnimating = false;
        
        this.canvas = null;
        this.ctx = null;
        this.spriteImage = null;
        
        this.init();
    }
    
    init() {
        // 캔버스 생성
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.frameWidth;
        this.canvas.height = this.frameHeight;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.borderRadius = '15px';
        
        // 컨텍스트 가져오기
        this.ctx = this.canvas.getContext('2d');
        
        // 스프라이트 이미지 로드
        this.loadSprite();
    }
    
    loadSprite() {
        this.spriteImage = new Image();
        this.spriteImage.onload = () => {
            // 이미지 로드 완료 후 첫 프레임 그리기
            this.draw();
        };
        this.spriteImage.src = this.spriteUrl;
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.frameTime = 0;
    }
    
    stopAnimation() {
        this.isAnimating = false;
        this.currentFrame = 0;
        this.draw(); // 첫 프레임으로 복귀
    }
    
    update(deltaTime) {
        if (!this.isAnimating) return;
        
        // FPS 기반 프레임 업데이트
        this.frameTime += deltaTime;
        const frameInterval = 1000 / this.fps;
        
        if (this.frameTime >= frameInterval) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.frameTime = 0;
            
            // 프레임이 변경될 때마다 화면 다시 그리기
            this.draw();
        }
    }
    
    draw(ctx) {
        if (!this.spriteImage || !this.ctx) return;
        
        // 캔버스 클리어
        this.ctx.clearRect(0, 0, this.frameWidth, this.frameHeight);
        
        // 현재 프레임 계산
        const framesPerRow = 10; // 한 줄에 10개
        const row = Math.floor(this.currentFrame / framesPerRow);
        const col = this.currentFrame % framesPerRow;
        
        // 스프라이트에서 현재 프레임 추출
        const sourceX = col * this.frameWidth;
        const sourceY = row * this.frameHeight;
        
        // 캔버스에 그리기
        this.ctx.drawImage(
            this.spriteImage,
            sourceX, sourceY,           // 소스 이미지의 시작점
            this.frameWidth, this.frameHeight,  // 소스 이미지의 크기
            0, 0,                       // 캔버스의 시작점
            this.frameWidth, this.frameHeight   // 캔버스에 그릴 크기
        );
    }
    
    setSpeed(fps) {
        this.fps = fps;
    }
    
    getCanvas() {
        return this.canvas;
    }
}

// GameManager Class - 게임 전체 관리
class GameManager {
    constructor() {
        this.gameObjects = [];
        this.lastTime = 0;
        this.isRunning = false;
        this.animationId = null;
    }
    
    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
    }
    
    removeGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 모든 게임 오브젝트 업데이트
        this.update(deltaTime);
        
        // 다음 프레임 예약
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    update(deltaTime) {
        // 활성화된 게임 오브젝트만 업데이트
        this.gameObjects.forEach(gameObject => {
            if (gameObject.isActive) {
                gameObject.update(deltaTime);
            }
        });
    }
    
    getGameObjectsByTag(tag) {
        return this.gameObjects.filter(obj => obj.tag === tag);
    }
}

// 전역 게임 매니저 인스턴스
const gameManager = new GameManager();
