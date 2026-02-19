// 1. 헤더 스크롤 효과
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
});

// 2. 3D 카러셀 로직
const items = document.querySelectorAll('.carousel-item');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentIndex = 0;

function rotateCarousel() {
    items.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        
        // 3개 게시글 순환 배치
        if (index === currentIndex) {
            item.classList.add('active');
        } else if (index === (currentIndex + 1) % items.length) {
            item.classList.add('next');
        } else {
            item.classList.add('prev');
        }
    });
}

// 다음 버튼
nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % items.length;
    rotateCarousel();
});

// 이전 버튼
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    rotateCarousel();
});

// 자동 회전 (5초)
setInterval(() => {
    currentIndex = (currentIndex + 1) % items.length;
    rotateCarousel();
}, 5000);