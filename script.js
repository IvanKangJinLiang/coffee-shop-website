document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. MENU LOGIC ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav');
    const navLinks = document.querySelectorAll('header nav ul li a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) menuToggle.classList.remove('active');
            if (nav) nav.classList.remove('active');
        });
    });

    // --- GSAP SETUP ---
    gsap.registerPlugin(ScrollTrigger);

    // 1. HERO INTRO
    gsap.timeline()
        .from("header", { y: -50, opacity: 0, duration: 1 })
        .from(".banner .title", { y: 100, opacity: 0, duration: 1 }, "-=0.5")
        .from(".banner p", { y: 20, opacity: 0, duration: 0.8 }, "-=0.5");


    // ==================================================
    // 2. MAIN BREW TIMELINE
    // ==================================================
    const isMobile = window.innerWidth < 768;
    
    // Set initial scale
    gsap.set(".realistic-brew", { scale: isMobile ? 0.7 : 1 });

    // --- NEW: BOILING PHYSICS ---
    
    // 0. FIX: HIDE BUBBLES INITIALLY (So they don't show in empty cup)
    gsap.set(".boil-bubble", { opacity: 0 });

    // 1. Random Simmer Loop (Always Active but invisible at start)
    gsap.to(".boil-bubble", {
        scale: 1.1,
        y: -5, // Move up slightly
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
            each: 0.1,
            from: "random"
        }
    });

    const brewTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            end: isMobile ? "+=3000" : "+=4000", 
            scrub: 1, 
            pin: true, 
            anticipatePin: 1
        }
    });

    brewTl
        // --- 0. Stage ---
        .to(".machine-glow", { opacity: 0.3, duration: 1 })

        // --- A. Machine ---
        .to(".r-bean", { 
            y: 280, rotation: 360, opacity: 1, ease: "power1.in", stagger: 0.1, duration: 1.5 
        }, "<")
        .to(".r-bean", { opacity: 0, scale: 0, duration: 0.3, stagger: 0.1 }, "-=1.0")
        .to(".machine-glow", { opacity: 0.8, scale: 1.2, duration: 0.5 }, "<")

        // --- B. Pour & BOIL ---
        .to(".r-stream", { height: 180, duration: 2, ease: "none" })
        .to(".realistic-brew", { scale: isMobile ? 0.85 : 1.1, duration: 4, ease: "none" }, "<")

        // *** THE BOIL EFFECT (Expansion) ***
        .to(".boil-bubble", { 
            scale: 1.5, 
            y: -10, 
            duration: 0.5, 
            ease: "rough({ strength: 2, points: 10, template: none, taper: none, randomize: true, clamp: false })"
        }, "<")

        // 4. Fill Cup & FADE IN BUBBLES
        // The bubbles fade in exactly when liquid starts rising
        .to(".r-liquid-fill", { height: "85%", duration: 3, ease: "none" }, "<0.5")
        .to(".boil-bubble", { opacity: 1, duration: 0.5 }, "<") // <--- THIS FIXES THE VISUAL BUG
        
        .to(".machine-glow", { opacity: 0.5, scale: 1, duration: 2 }, "<")

        // 5. Finish
        .to(".r-stream", { height: 0, opacity: 0, duration: 0.5 })

        // *** SETTLE DOWN ***
        .to(".boil-bubble", { 
            scale: 1.0, 
            y: 0, 
            duration: 1, 
            ease: "power2.out" 
        }, "<")
        
        // 6. Steam
        .to(".steam-puff", { 
            y: -50, opacity: 0.8, scale: 1.5, duration: 2, stagger: 0.3, ease: "power1.out"
        }, "-=0.2"); 


    // ==================================================
    // 3. ORIGINS SECTION
    // ==================================================
    gsap.to(".origins-bg-layer", {
        scrollTrigger: { trigger: "#origins", start: "top bottom", end: "bottom top", scrub: 1 },
        y: 150, ease: "none", force3D: true
    });

    gsap.to(".fore-leaf", {
        scrollTrigger: { trigger: "#origins", start: "top bottom", end: "bottom top", scrub: 1.5 },
        y: -200, rotation: 15, ease: "none", force3D: true
    });

    const originElements = document.querySelectorAll(".origins-content h2, .origins-content p, .origins-content a");
    gsap.set(originElements, { y: 50, opacity: 0 }); 

    gsap.to(originElements, {
        scrollTrigger: {
            trigger: "#origins", start: "top 60%", toggleActions: "play none none reverse"
        },
        y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out"
    });


    // ==================================================
    // 4. MENU SECTION
    // ==================================================
    gsap.from(".menu-header", {
        scrollTrigger: { trigger: ".menu-section", start: "top 70%", toggleActions: "play none none reverse" },
        y: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.set(".menu-card", { opacity: 0, y: 100 }); 

    ScrollTrigger.batch(".menu-card", {
        start: "top 85%",
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.2, duration: 1.2, ease: "power3.out" })
    });
    
    // Magnetic Effect (Desktop Only)
    if (window.matchMedia("(min-width: 769px)").matches) {
        const cards = document.querySelectorAll('.menu-card');
        cards.forEach(card => {
            const image = card.querySelector('.coffee-img');
            const number = card.querySelector('.card-bg-text');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(image, { x: x * 0.2, y: (y * 0.2) - 50, rotation: x * 0.05, duration: 0.6, ease: "power2.out" });
                gsap.to(number, { x: -x * 0.1, y: -y * 0.1, duration: 0.6, ease: "power2.out" });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(image, { x: 0, y: -50, rotation: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
                gsap.to(number, { x: 0, y: 0, duration: 1, ease: "power2.out" });
            });
        });
    }
});