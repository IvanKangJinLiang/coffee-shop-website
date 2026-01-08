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
    const isMobile = window.innerWidth < 768;
    
    const brewTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#process",
            start: "top top",
            // Slower scroll on mobile to give time to see the rolling
            end: isMobile ? "+=3000" : "+=5000", 
            scrub: 1, 
            pin: true, 
            anticipatePin: 1
        }
    });

    brewTl
        // --- A. Machine Brewing (Standard) ---
        .to(".r-bean", { y: 200, rotation: 360, ease: "power1.in", stagger: 0.1, duration: 2 })
        .to(".r-bean", { opacity: 0, scale: 0.5, duration: 0.5 }, "-=0.5")
        .to(".r-stream", { height: 180, duration: 2, ease: "none" })
        .to(".r-liquid-fill", { height: "85%", duration: 3, ease: "none" }, "<0.5")
        .to(".r-steam", { opacity: 0.8, y: -50, duration: 2 }, "<")
        .to(".r-stream", { height: 0, opacity: 0, duration: 0.5 })

        // --- B. The "Rolling into V-Hole" Effect ---
        .to(".floor-bean", {
            duration: 8, // Very long duration so the roll feels heavy/slow
            ease: "none", // Linear speed = looks like constant rolling
            force3D: true,
            
            // 1. ROLL TO CENTER (Horizontal)
            x: (i, target) => {
                const rect = target.getBoundingClientRect();
                const centerX = window.innerWidth / 2;
                // Move bean to the exact center X
                return centerX - rect.left - (rect.width/2);
            },
            
            // 2. DROP INTO ABYSS (Vertical)
            // They stay on the floor for a bit, then drop deep
            y: (i, target) => {
                // Drop 300px down (simulating the deep hole)
                return 300; 
            },

            // 3. PHYSICS ROTATION
            // Calculate actual distance to rotate like a wheel
            rotation: (i, target) => {
                const rect = target.getBoundingClientRect();
                const centerX = window.innerWidth / 2;
                const distanceToTravel = centerX - rect.left;
                
                // Circumference of a 30px bean is ~94px
                // Rotations = Distance / 94 * 360 degrees
                // We multiply by 1.5 to make them spin a bit faster than reality (looks better)
                const rotations = (distanceToTravel / 94) * 360 * 1.5;
                
                return rotations;
            },

            scale: 0.2,     // Shrink as they fall deep
            opacity: 0,     // Fade out at the bottom of the hole
            
            // 4. THE V-SHAPE FORMATION
            // This creates the "Queue". 
            // 'from: center' opens the hole in the middle first.
            // 'amount: 5' means the last bean takes 5 seconds to start falling.
            stagger: {
                amount: 5, 
                from: "center", 
                grid: "auto"
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
    // 5. MENU SECTION (PREMIUM INTERACTION)
    // ==================================================
    
    // A. Staggered Entrance (Cards fade in one by one)
    ScrollTrigger.batch(".menu-card", {
        start: "top 85%",
        onEnter: batch => gsap.to(batch, { 
            opacity: 1, 
            y: 0, 
            stagger: 0.2, 
            duration: 1, 
            ease: "power3.out"
        })
    });
    
    gsap.set(".menu-card", { opacity: 0, y: 100 }); // Set hidden state

    // B. The "Magnetic" Floating Effect
    // When mouse moves over a card, the image moves slightly 
    // in the direction of the mouse (Parallax)
    const cards = document.querySelectorAll('.menu-card');

    cards.forEach(card => {
        const image = card.querySelector('.coffee-img');
        const number = card.querySelector('.card-bg-text');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to center of card
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move Image (Stronger movement)
            gsap.to(image, {
                x: x * 0.15, // Move 15% of mouse distance
                y: y * 0.15 - 50, // Keep the -50px offset we set in CSS
                rotation: x * 0.05, // Slight tilt
                duration: 0.5,
                ease: "power2.out"
            });

            // Move Number (Subtle movement in opposite direction for depth)
            gsap.to(number, {
                x: -x * 0.05,
                y: -y * 0.05,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        // Reset on mouse leave
        card.addEventListener('mouseleave', () => {
            gsap.to(image, {
                x: 0,
                y: -40, // Back to CSS original position
                rotation: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)"
            });
            
            gsap.to(number, {
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    });
});