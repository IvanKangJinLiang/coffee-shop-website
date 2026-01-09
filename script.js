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
    // 2. MAIN BREW TIMELINE (CLEAN - NO RAIN)
    // ==================================================
    const isMobile = window.innerWidth < 768;
    
    const brewTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            // Adjusted scroll length slightly since we removed the floor part
            end: isMobile ? "+=3000" : "+=4000", 
            scrub: 1, 
            pin: true, 
            anticipatePin: 1
        }
    });

    brewTl
        // --- A. Machine Brewing ---
        // 1. Beans Fall & Fade In
        .to(".r-bean", { 
            y: 280,       // Drop into machine
            rotation: 360, 
            opacity: 1,   // Visible as they fall
            ease: "power1.in", 
            stagger: 0.1, 
            duration: 1.5 
        })
        
        // 2. Beans Vanish (The "Grind" Effect)
        .to(".r-bean", { 
            opacity: 0,   // Fade out completely
            scale: 0,     // Shrink to nothing
            duration: 0.3, 
            stagger: 0.1  // Fade out one by one
        }, "-=1.2")       // Start fading 1.2s before the fall ends

        // 3. The Stream Starts
        .to(".r-stream", { height: 180, duration: 2, ease: "none" })
        .to(".r-liquid-fill", { height: "85%", duration: 3, ease: "none" }, "<0.5")
        .to(".r-steam", { opacity: 0.8, y: -50, duration: 2 }, "<")
        .to(".r-stream", { height: 0, opacity: 0, duration: 0.5 });

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