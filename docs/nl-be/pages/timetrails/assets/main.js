// 移动端汉堡菜单开合
(function () {
    const toggleBtn = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', () => {
            const opened = navMenu.classList.toggle('open');
            toggleBtn.classList.toggle('open', opened);
            toggleBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    // 点击菜单项后自动关闭（小屏体验更好）
    if (navMenu) {
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('open');
                toggleBtn && toggleBtn.classList.remove('open');
                toggleBtn && toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
})();

// 平滑滚动到锚点
(function () {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((a) => {
        a.addEventListener('click', (e) => {
            const hash = a.getAttribute('href');
            if (!hash || hash === '#') return;
            const target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
})();

// IntersectionObserver 做进场 reveal 动画
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || els.length === 0) {
        // 兼容性兜底：直接全部显示
        els.forEach((el) => el.classList.add('show'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                io.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    els.forEach((el) => io.observe(el));
})();

// footer 年份自动更新
(function () {
    const y = document.getElementById('year');
    if (y) {
        y.textContent = new Date().getFullYear().toString();
    }
})();
