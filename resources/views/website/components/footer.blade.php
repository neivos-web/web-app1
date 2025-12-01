<section class="pxa_footer" 
    style="background: linear-gradient(135deg, #08B3E5, #22E4AC);
           padding: 25px 20px 20px; color: white; position: relative;">
    <div class="container text-center">

        <!-- Texte -->
        <p class="mb-2" style="font-size: 14px; font-weight: 500;">
            Vous avez des questions ? Contactez-nous — nous sommes à votre disposition.
        </p>

        <!-- Bouton plus petit -->
        <a href="{{ route('website.contact-us') }}"
           class="btn btn-outline-light rounded-pill px-4 py-2 d-inline-block mb-2"
           style="border: 1.5px solid white; font-size: 14px; font-weight: 600;">
            Contactez-nous
        </a>

        <!-- Réseaux sociaux -->
        <div class="my-2">
            <a href="#" class="text-white mx-2 fs-5 opacity-70"><i class="fab fa-linkedin-in"></i></a>
            <a href="#" class="text-white mx-2 fs-5 opacity-70"><i class="fab fa-instagram"></i></a>
            <a href="#" class="text-white mx-2 fs-5 opacity-70"><i class="fab fa-facebook-f"></i></a>
        </div>

        <!-- Logo plus petit -->
        <div class="my-3">
            <img src="{{ asset('frontend/public/pages/assets/images/footer_logo.png') }}"
                 alt="Outsiders Logo"
                 width="120"
                 class="img-fluid">
        </div>

        <!-- Mentions légales -->
        <div class="border-top border-white border-opacity-20 pt-2 small">
            <div class="d-flex justify-content-center gap-3 flex-wrap mb-1">
                <a href="{{ route('website.privacy-policy') }}" class="text-white text-decoration-none opacity-80">Mentions légales</a>
                <a href="{{ route('website.terms-and-conditions') }}" class="text-white text-decoration-none opacity-80">Confidentialité</a>
            </div>
            <p class="mb-0 opacity-60" style="font-size: 12px;">
                © {{ date('Y') }} Outsiders. Tous droits réservés.
            </p>
        </div>
    </div>

    <!-- Back to top -->
    <a href="#" id="back-to-top" 
       class="position-fixed bottom-0 end-0 mb-3 me-3 rounded-circle bg-white text-primary d-flex align-items-center justify-content-center shadow"
       style="width: 38px; height: 38px; z-index: 1050; display: none;">
        <i class="fas fa-arrow-up" style="font-size: 14px;"></i>
    </a>
</section>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => 
        b.style.display = window.scrollY > 300 ? 'flex' : 'none'
    );
    b.onclick = e => { 
        e.preventDefault(); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };
});
</script>
