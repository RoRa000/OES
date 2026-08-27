/* =========================================================
   OES COMMON EMERALD SPLASH SYSTEM
   ========================================================= */

(function () {

    /* =====================================================
       CREATE SPLASH HTML
    ===================================================== */

    const splashHTML = `

        <div id="oesSplash">

            <div class="oes-splash-content">

                <div class="oes-splash-logo">
                    OES
                </div>

                <div class="oes-splash-title">
                    ONLINE EXAMINATION SYSTEM
                </div>

                <div class="oes-splash-line"></div>

            </div>

        </div>

    `;


    /* =====================================================
       CREATE SPLASH CSS
    ===================================================== */

    const splashCSS = `

        /* =================================================
           OES SPLASH
        ================================================= */

        #oesSplash {

            position: fixed;

            inset: 0;

            z-index: 999999;

            display: flex;

            align-items: center;

            justify-content: center;

            background:
                radial-gradient(
                    circle at 50% 45%,
                    #064e3b 0%,
                    #022c22 38%,
                    #011c16 70%,
                    #000c09 100%
                );

            overflow: hidden;

            opacity: 1;

            visibility: visible;

            transition:
                opacity 0.8s ease,
                visibility 0.8s ease;

        }


        /* =================================================
           SPLASH HIDE
        ================================================= */

        #oesSplash.hide {

            opacity: 0;

            visibility: hidden;

            pointer-events: none;

        }


        /* =================================================
           SPLASH CONTENT
        ================================================= */

        .oes-splash-content {

            position: relative;

            z-index: 2;

            text-align: center;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

        }


        /* =================================================
           OES LOGO
        ================================================= */

        .oes-splash-logo {

            width: 150px;

            height: 150px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 32px;

            background:
                linear-gradient(
                    145deg,
                    #ffffff 0%,
                    #ecfdf5 45%,
                    #d1fae5 100%
                );

            color: #059669;

            font-size: 48px;

            font-weight: 900;

            letter-spacing: 4px;

            border: 2px solid
                rgba(52, 211, 153, 0.60);

            box-shadow:

                0 0 0 1px
                rgba(255, 255, 255, 0.15),

                0 0 20px
                rgba(16, 185, 129, 0.45),

                0 0 45px
                rgba(16, 185, 129, 0.30),

                0 0 80px
                rgba(16, 185, 129, 0.18),

                0 20px 60px
                rgba(0, 0, 0, 0.55);

            text-shadow:

                0 0 6px
                rgba(16, 185, 129, 0.35),

                0 0 15px
                rgba(16, 185, 129, 0.20);

            animation:
                oesLogoPop 1s
                cubic-bezier(.17,.67,.28,1.25)
                forwards;

            transform: scale(0.2);

            opacity: 0;

        }


        /* =================================================
           LOGO POP
        ================================================= */

        @keyframes oesLogoPop {

            0% {

                transform:
                    scale(0.2)
                    rotate(-8deg);

                opacity: 0;

            }

            55% {

                transform:
                    scale(1.08)
                    rotate(2deg);

                opacity: 1;

            }

            75% {

                transform:
                    scale(0.96)
                    rotate(0deg);

            }

            100% {

                transform:
                    scale(1)
                    rotate(0deg);

                opacity: 1;

            }

        }


        /* =================================================
           SPLASH TITLE
        ================================================= */

        .oes-splash-title {

            margin-top: 25px;

            color: #34d399;

            font-size: 17px;

            font-weight: 800;

            letter-spacing: 4px;

            text-shadow:

                0 0 5px
                rgba(52, 211, 153, 0.80),

                0 0 12px
                rgba(16, 185, 129, 0.60),

                0 0 25px
                rgba(16, 185, 129, 0.35);

            opacity: 0;

            animation:
                oesTitleFade 0.8s
                ease
                0.45s
                forwards;

        }


        /* =================================================
           TITLE FADE
        ================================================= */

        @keyframes oesTitleFade {

            from {

                opacity: 0;

                transform:
                    translateY(12px);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0);

            }

        }


        /* =================================================
           LOADING LINE
        ================================================= */

        .oes-splash-line {

            width: 0;

            height: 3px;

            margin-top: 22px;

            background:
                linear-gradient(
                    90deg,
                    #059669,
                    #10b981,
                    #34d399,
                    #6ee7b7
                );

            border-radius: 10px;

            box-shadow:

                0 0 8px
                rgba(16, 185, 129, 0.90),

                0 0 18px
                rgba(16, 185, 129, 0.70),

                0 0 35px
                rgba(16, 185, 129, 0.35);

            animation:
                oesLineLoad 1s
                ease
                0.5s
                forwards;

        }


        @keyframes oesLineLoad {

            from {

                width: 0;

            }

            to {

                width: 150px;

            }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 600px) {

            .oes-splash-logo {

                width: 125px;

                height: 125px;

                font-size: 40px;

                border-radius: 26px;

            }


            .oes-splash-title {

                font-size: 12px;

                letter-spacing: 2.5px;

            }

        }

    `;


    /* =====================================================
       ADD CSS TO PAGE
    ===================================================== */

    const style = document.createElement("style");

    style.id = "oesSplashStyle";

    style.textContent = splashCSS;

    document.head.appendChild(style);


    /* =====================================================
       ADD SPLASH TO PAGE
    ===================================================== */

    function createSplash() {

        if (document.getElementById("oesSplash")) {

            return;

        }

        document.body.insertAdjacentHTML(
            "afterbegin",
            splashHTML
        );

    }


    /* =====================================================
       PAGE FLIP SOUND
    ===================================================== */

    function playPageFlipSound() {

        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {

                return;

            }

            const audioContext =
                new AudioContext();

            const now =
                audioContext.currentTime;


            /* First sound */

            const oscillator =
                audioContext.createOscillator();

            const gain =
                audioContext.createGain();


            oscillator.type =
                "triangle";


            oscillator.frequency.setValueAtTime(
                1800,
                now
            );


            oscillator.frequency.exponentialRampToValueAtTime(
                450,
                now + 0.18
            );


            gain.gain.setValueAtTime(
                0.0001,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.16,
                now + 0.015
            );


            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.22
            );


            oscillator.connect(gain);

            gain.connect(
                audioContext.destination
            );


            oscillator.start(now);

            oscillator.stop(
                now + 0.23
            );


            /* Second soft sound */

            const oscillator2 =
                audioContext.createOscillator();

            const gain2 =
                audioContext.createGain();


            oscillator2.type =
                "sine";


            oscillator2.frequency.setValueAtTime(
                900,
                now + 0.05
            );


            oscillator2.frequency.exponentialRampToValueAtTime(
                250,
                now + 0.28
            );


            gain2.gain.setValueAtTime(
                0.0001,
                now
            );


            gain2.gain.exponentialRampToValueAtTime(
                0.07,
                now + 0.06
            );


            gain2.gain.exponentialRampToValueAtTime(
                0.0001,
                now + 0.3
            );


            oscillator2.connect(gain2);

            gain2.connect(
                audioContext.destination
            );


            oscillator2.start(
                now + 0.05
            );


            oscillator2.stop(
                now + 0.31
            );


        } catch (error) {

            console.log(
                "OES splash sound unavailable:",
                error
            );

        }

    }


    /* =====================================================
       START SPLASH
    ===================================================== */

    function startSplash() {

        createSplash();


        const splash =
            document.getElementById(
                "oesSplash"
            );


        if (!splash) {

            return;

        }


        playPageFlipSound();


        /* Keep popup visible */

        setTimeout(function () {

            splash.classList.add("hide");


            /* Remove after fade */

            setTimeout(function () {

                if (splash) {

                    splash.remove();

                }

            }, 800);


        }, 2200);

    }


    /* =====================================================
       PAGE READY
    ===================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            startSplash
        );

    } else {

        startSplash();

    }

})();