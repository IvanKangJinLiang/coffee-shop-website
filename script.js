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
    // 2. GENERATE BEANS (OPTIMIZED)
    // ==================================================
    const floorContainer = document.querySelector('.bean-floor-container');
    
    if (floorContainer) {
        const beanSVGString = `
            <svg viewBox="0 0 100 100" style="width:100%; height:100%;">
                <path d="M50,90 C20,90 10,50 30,20 C50,-10 90,10 90,40 C90,70 70,90 50,90 M45,25 Q55,50 45,80" 
                fill="#4B3621" stroke="#3E2B1F" stroke-width="3" />
            </svg>`;

        // OPTIMIZATION: Check screen width
        const isMobile = window.innerWidth < 768;
        
        // Mobile: 50 beans (Performance) | Desktop: 180 beans (Density)
        const beanCount = isMobile ? 50 : 180; 

        for (let i = 0; i < beanCount; i++) {
            const div = document.createElement('div');
            div.classList.add('floor-bean');
            div.innerHTML = beanSVGString;
            
            // Positioning
            const randomLeft = Math.random() * 100;
            div.style.left = randomLeft + "%";
            
            // Store specific data for the vacuum later (Avoids layout thrashing)
            div.dataset.left = randomLeft; 

            // Weighted Height Logic
            let landPosition;
            if (Math.random() < 0.9) {
                landPosition = Math.random() * 15; 
            } else {
                landPosition = 15 + Math.random() * 25; 
            }

            div.style.bottom = landPosition + "px"; 
            
            // Random Rotation
            div.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random() * 0.5})`;
            
            // Optimization: Static z-index on mobile avoids layer blending costs
            div.style.zIndex = isMobile ? 2 : Math.floor(Math.random() * 6); 
            
            floorContainer.appendChild(div);
        }

        // --- ANIMATION A: THE RAIN ---
        gsap.from(".floor-bean", {
            scrollTrigger: {
                trigger: "#process",
                start: "top 60%", 
                toggleActions: "play none none none"
            },
            y: -window.innerHeight, 
            opacity: 1,
            duration: 1.2,
            ease: "bounce.out",
            force3D: true, // Use GPU
            stagger: { amount: 1, from: "random" }
        });
    }

    // ==================================================
    // 3. MAIN BREW TIMELINE
    // ==================================================
    // Optimization: Shorter scroll distance on mobile prevents "stuck" feeling
    const isMobile = window.innerWidth < 768;
    
    const brewTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            // Mobile: 2000px scroll (faster) | Desktop: 4000px (slower)
            end: isMobile ? "+=2000" : "+=4000", 
            scrub: 1, 
            pin: true, 
            anticipatePin: 1
        }
    });

    brewTl
        // --- A. Machine Brewing ---
        .to(".r-bean", { y: 200, rotation: 360, ease: "power1.in", stagger: 0.1, duration: 2 })
        .to(".r-bean", { opacity: 0, scale: 0.5, duration: 0.5 }, "-=0.5")
        .to(".r-stream", { height: 180, duration: 2, ease: "none" })
        .to(".r-liquid-fill", { height: "85%", duration: 3, ease: "none" }, "<0.5")
        .to(".r-steam", { opacity: 0.8, y: -50, duration: 2 }, "<")
        .to(".r-stream", { height: 0, opacity: 0, duration: 0.5 })

        // --- B. The Floor Whirlpool Effect (Optimized) ---
        .to(".floor-bean", {
            duration: 3, 
            ease: "expo.in", 
            force3D: true, // Use GPU
            
            // 1. SUCK INWARDS (Horizontal Center)
            // Optimization: Calculate percentage distance instead of pixels
            // 50% is center. If bean is at 10%, it needs to move +40%.
            x: (i, target) => {
                const currentLeft = parseFloat(target.dataset.left); // Read from data, not DOM
                const distanceToCenter = 50 - currentLeft;
                return distanceToCenter + "vw"; // Move in Viewport Width units
            },
            
            // 2. SINK INTO FLOOR
            y: (i, target) => {
                return parseFloat(target.style.bottom); 
            },

            scale: 0,       
            opacity: 0,     
            rotation: 1080, 
            
            stagger: {
                amount: 1.5,
                from: "center" 
            }
        }, "+=0.1");


    // ==================================================
    // 4. ORIGINS SECTION (Parallax + Text Reveal)
    // ==================================================
    
    // A. Background Parallax
    gsap.to(".origins-bg-layer", {
        scrollTrigger: { 
            trigger: "#origins", 
            start: "top bottom", 
            end: "bottom top", 
            scrub: 1 
        },
        y: 150, 
        ease: "none",
        force3D: true
    });

    // B. Leaf Parallax
    gsap.to(".fore-leaf", {
        scrollTrigger: { 
            trigger: "#origins", 
            start: "top bottom", 
            end: "bottom top", 
            scrub: 1.5 
        },
        y: -200, 
        rotation: 15, 
        ease: "none",
        force3D: true
    });

    // C. Content Reveal (Robust)
    // 1. Hide elements immediately via JS
    const originElements = document.querySelectorAll(".origins-content h2, .origins-content p, .origins-content a");
    gsap.set(originElements, { y: 50, opacity: 0 }); // <--- HIDE HERE

    // 2. Animate them in
    gsap.to(originElements, {
        scrollTrigger: {
            trigger: "#origins",
            start: "top 60%", 
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2, 
        ease: "power3.out"
    });


    // ==================================================
    // 5. MENU SECTION (Cascading Cards)
    // ==================================================
    
    // A. Title Animation
    const menuTitle = document.querySelector(".menu-section h2");
    gsap.set(menuTitle, { y: 30, opacity: 0 }); // Hide first

    gsap.to(menuTitle, {
        scrollTrigger: {
            trigger: ".menu-section",
            start: "top 70%",
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    });

    // B. Cards Animation
    // Hide all cards first
    gsap.set(".menu-item", { y: 50, opacity: 0 });

    ScrollTrigger.batch(".menu-item", {
        start: "top 80%", // Triggers slightly earlier for better feel
        onEnter: batch => gsap.to(batch, { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            stagger: 0.15, 
            ease: "power2.out",
            force3D: true 
        }),
        // Reset when scrolling back up so they animate again
        onLeaveBack: batch => gsap.to(batch, { 
            opacity: 0, 
            y: 50, 
            duration: 0.5 
        })
    });

});