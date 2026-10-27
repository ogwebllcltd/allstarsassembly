/* =============================================
   ALL STARS ASSEMBLY — Public Website JS
   ============================================= */

'use strict';

// ─── Page Loader ──────────────────────────────
(function () {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(function () { loader.classList.add('hide'); }, 600);
    }
}());

// ─── Hero Slider ──────────────────────────────
(function () {
    const carousel = document.getElementById('heroCarousel');
    if (!carousel) return;

    // Force auto-play regardless of hover or other interference
    const bsCarousel = new bootstrap.Carousel(carousel, {
        interval: 5000,
        ride: 'carousel',
        pause: false,
        wrap: true
    });

    var typingTimer = null;

    function typeText(el, text, speed) {
        if (typingTimer) clearInterval(typingTimer);
        el.textContent = '';
        el.classList.remove('typed');
        var i = 0;
        typingTimer = setInterval(function () {
            el.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(typingTimer);
                typingTimer = null;
                el.classList.add('typed');
            }
        }, speed);
    }

    // Type the first slide on page load
    var firstHeading = carousel.querySelector('.carousel-item.active .slide-heading');
    if (firstHeading) {
        typeText(firstHeading, firstHeading.dataset.text, 65);
    }

    // Type heading when a new slide finishes transitioning in
    carousel.addEventListener('slid.bs.carousel', function (e) {
        var heading = e.relatedTarget.querySelector('.slide-heading');
        if (heading) {
            // Reset all other headings
            carousel.querySelectorAll('.slide-heading').forEach(function (h) {
                if (h !== heading) { h.textContent = ''; h.classList.remove('typed'); }
            });
            typeText(heading, heading.dataset.text, 65);
        }
    });
}());

// ─── Navbar scroll effect ─────────────────────
const navbar = document.querySelector('.site-navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ─── Smooth scroll to anchors ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ─── Auto-dismiss alerts ──────────────────────
document.querySelectorAll('.alert-dismissible').forEach(el => {
    setTimeout(() => {
        try { bootstrap.Alert.getOrCreateInstance(el)?.close(); } catch {}
    }, 5000);
});

// ─── Copy share link ──────────────────────────
window.copyShareLink = function(url, btn) {
    navigator.clipboard.writeText(url).then(function() {
        if (btn) {
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check me-1"></i>Copied!';
            setTimeout(function() { btn.innerHTML = orig; }, 2000);
        }
    }).catch(function() {
        window.prompt('Copy this link:', url);
    });
};


// ─── Donation form — Paystack placeholder ─────
const donationForm = document.getElementById('donationForm');
if (donationForm) {
    donationForm.addEventListener('submit', function(e) {
        const method = this.querySelector('[name="payment_method"]')?.value;
        if (method === 'card') {
            // To integrate real Paystack, replace this block with:
            // const handler = PaystackPop.setup({ key: PUBLIC_KEY, email, amount: amount * 100, ... });
            // handler.openIframe();
            console.log('[Paystack] Card payment flow would trigger here');
            // Let the form submit for now to record pending donation
        }
    });
}
