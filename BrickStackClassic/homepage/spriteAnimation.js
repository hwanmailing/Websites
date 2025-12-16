// GameObject 기반 캐릭터 애니메이션 시스템
document.addEventListener('DOMContentLoaded', function() {
    const characterSprites = document.querySelectorAll('.character-sprite');
    
    // 게임 매니저 시작
    gameManager.start();
    
    characterSprites.forEach((sprite, index) => {
        const spriteUrl = sprite.getAttribute('data-sprite');
        const fullUrl = `./resources/Sprites/${spriteUrl}`;
        
        // Character 인스턴스 생성
        const character = new Character(
            fullUrl,
            0, 0,           // x, y 위치
            200, 200,       // width, height
            512, 512,       // frameWidth, frameHeight
            32              // totalFrames
        );
        
        // 게임 매니저에 추가
        gameManager.addGameObject(character);
        
        // 캔버스를 DOM에 추가
        sprite.appendChild(character.getCanvas());
        
        // 호버 이벤트를 큰 박스(character-card)에 추가
        const characterCard = sprite.closest('.character-card');
        if (characterCard) {
            characterCard.addEventListener('mouseenter', () => {
                character.startAnimation();
            });
            
            characterCard.addEventListener('mouseleave', () => {
                character.stopAnimation();
            });
        }
    });
});
