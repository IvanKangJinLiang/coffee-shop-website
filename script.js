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
    // 2. GENERATE BEANS
    // ==================================================
    const floorContainer = document.querySelector('.bean-floor-container');
    
    if (floorContainer) {
        const beanSVGString = `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
                <path d="M50,90 C20,90 10,50 30,20 C50,-10 90,10 90,40 C90,70 70,90 50,90 M45,25 Q55,50 45,80" 
                fill="#4B3621" stroke="#3E2B1F" stroke-width="3" />
            </svg>`;

        // Mobile check
        const isMobile = window.innerWidth < 768;
        const beanCount = isMobile ? 50 : 180; 

        for (let i = 0; i < beanCount; i++) {
            const div = document.createElement('div');
            div.classList.add('floor-bean');
            div.innerHTML = beanSVGString;
            
            // Positioning
            const randomLeft = Math.random() * 100;
            div.style.left = randomLeft + "%";
            div.dataset.left = randomLeft; 

            // Weighted Height
            let landPosition;
            if (Math.random() < 0.9) {
                landPosition = Math.random() * 15; 
            } else {
                landPosition = 15 + Math.random() * 25; 
            }

            div.style.bottom = landPosition + "px"; 
            
            // Random Rotation
            div.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random() * 0.5})`;
            div.style.zIndex = isMobile ? 2 : Math.floor(Math.random() * 6); 
            
            // INITIAL STATE: Hide them immediately so no "frozen ceiling"
            gsap.set(div, { opacity: 0 });

            floorContainer.appendChild(div);
        }

        // --- ANIMATION A: THE RAIN (FIXED) ---
        gsap.to(".floor-bean", {
            scrollTrigger: {
                trigger: "#process",
                start: "top 60%", 
                toggleActions: "play none none none"
            },
            // We use .fromTo logic here by animating TO the natural state
            // Initial state was set above by gsap.set
            startAt: { y: -window.innerHeight * 1.5, opacity: 1 }, // Start WAY higher & Visible
            y: 0, // Land at bottom
            duration: 1.2,
            ease: "bounce.out",
            force3D: true, 
            stagger: { amount: 1, from: "random" }
        });
    }

    // ==================================================
    // 3. MAIN BREW TIMELINE (WITH ROLLING V-TUNNEL)
    // ==================================================
    const isMobile = window.innerWidth < 768;
    
    const brewTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            end: isMobile ? "+=3000" : "+=5000", 
            scrub: 1, 
            pin: true, 
            anticipatePin: 1
        }
    });

    brewTl
        // --- A. Machine Brewing (FIXED) ---
        // 1. Beans Fall & Fade In
        .to(".r-bean", { 
            y: 280,       // Drop deeper (was 200)
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
            stagger: 0.1  // Fade out one by one matching the fall
        }, "-=1.2")       // Start fading 1.2s before the fall ends (Overlap)

        // 3. The Stream Starts
        .to(".r-stream", { height: 180, duration: 2, ease: "none" })
        .to(".r-liquid-fill", { height: "85%", duration: 3, ease: "none" }, "<0.5")
        .to(".r-steam", { opacity: 0.8, y: -50, duration: 2 }, "<")
        .to(".r-stream", { height: 0, opacity: 0, duration: 0.5 })

        // --- B. The "Rolling into V-Hole" Effect ---
        .to(".floor-bean", {
            duration: 8, // Slow roll
            ease: "none", 
            force3D: true,
            
            // 1. ROLL TO CENTER
            x: (i, target) => {
                const rect = target.getBoundingClientRect();
                const centerX = window.innerWidth / 2;
                return centerX - rect.left - (rect.width/2);
            },
            
            // 2. DROP INTO ABYSS (Deep Drop)
            y: (i, target) => {
                return 300; // Drops 300px down
            },

            // 3. PHYSICS ROTATION (Wheel Roll)
            rotation: (i, target) => {
                const rect = target.getBoundingClientRect();
                const centerX = window.innerWidth / 2;
                const distanceToTravel = centerX - rect.left;
                // Calculate rotation based on distance
                return (distanceToTravel / 94) * 360 * 1.5;
            },

            scale: 0.2,     
            opacity: 0,     
            
            // 4. THE V-SHAPE FORMATION
            stagger: {
                amount: 5, 
                from: "center", // Middle drops first
                grid: "auto"
            }
        }, "+=0.1");


    // ==================================================
    // 4. ORIGINS SECTION
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
    // 5. MENU SECTION
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