<section class="pxa_header_wr pxa_megaMenu_wraper pxa_dropdown_menu mt_bgtempconatainer">

    <!-- INLINE CSS -->
    <style>
        .pxa_megamenu_list { position: relative; }

        .pxa_header_Subnav.pxa_drop_menu {
            position: absolute;
            top: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%) translateY(-6px);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity .22s ease, transform .22s cubic-bezier(.2,.9,.3,1);
            min-width: 200px;
            max-width: 340px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            padding: 10px 14px;
            z-index: 9999;
        }

        .pxa_header_Subnav.pxa_drop_menu::before {
            content: "";
            position: absolute;
            top: -6px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background: #fff;
        }

        .pxa_megamenu_list:hover > .pxa_header_Subnav.pxa_drop_menu,
        .pxa_megamenu_list.open > .pxa_header_Subnav.pxa_drop_menu {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateX(-50%) translateY(0);
        }

        .pxa_megamenu_item li a {
            display:block;
            padding:8px 10px;
            color:#2b2b2b;
            border-radius:6px;
            transition:background .12s ease, color .12s ease;
            text-decoration:none;
        }
        .pxa_megamenu_item li a:hover {
            background:rgba(0,0,0,0.04);
            color:#0aa;
        }

        /* Si tu veux que le dropdown soit plus étroit et centré sous l'item */
        .pxa_header_Subnav.pxa_drop_menu { min-width: 180px; max-width: 320px; }

        @media (max-width: 991px) {
            .pxa_header_Subnav.pxa_drop_menu {
                position: static;
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
                transform: none;
                box-shadow: none;
                padding: 6px 0;
                border-radius: 0;
            }
        }
    </style>

    <div class="pxa_header_full">
        <div class="pxa_header_flex">

            <div class="pxa_header_logo">
                <a href="{{ route('website.home') }}">
                    <img src="{{ asset('frontend') }}/public/pages/assets/images/pxa_logo.png"
                         alt="Logo" height="40" width="158">
                </a>
            </div>

            <div class="pxa_header_nav">
                <ul class="pxa_menu_list pxa_dropdown_flex pxa-tabs">

                    <li class="navActive">
                        <a href="{{ route('website.home') }}">Home</a>
                    </li>

                    <li>
                        <a href="{{ route('website.about-us') }}">About</a>
                    </li>

                    <!-- SERVICE DROPDOWN (reste comme avant) -->
                    <li class="pxa_megamenu_list">
                        <a href="#">Service</a>
                        <div class="pxa_header_Subnav pxa_drop_menu">
                            <div class="pxa_megamenu_grid">
                                <ul class="pxa_megamenu_item pxa_header_Subnav_01">
                                    @foreach($serviceCategory as $item)
                                        <li>
                                            <a href="#">
                                                <span><i class="fa fa-lock"></i></span>
                                                <h4 class="pxa_megamenu_details">{{ $item->title }}</h4>
                                            </a>
                                        </li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>
                    </li>

                    <li><a href="{{ route('website.blog') }}">Actualités/Blog</a></li>
                    <li><a href="{{ route('website.gallery') }}">Gallery</a></li>

                    <!-- PAGES DYNAMIQUES : si une page a des enfants, on crée un dropdown sous cet item -->
                    @foreach($publishedPages as $page)
                        @if(isset($page->children) && $page->children->count() > 0)
                            <li class="pxa_megamenu_list">
                                <a href="{{ route('website.page.show', $page->slug) }}">{{ $page->pageName }}</a>

                                <div class="pxa_header_Subnav pxa_drop_menu">
                                    <div class="pxa_megamenu_grid">
                                        <ul class="pxa_megamenu_item pxa_header_Subnav_01">
                                            @foreach($page->children as $child)
                                                <li>
                                                    <a href="{{ route('website.page.show', $child->slug) }}">
                                                        {{ $child->pageName }}
                                                    </a>
                                                </li>
                                            @endforeach
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        @else
                            <li>
                                <a href="{{ route('website.page.show', $page->slug) }}">
                                    {{ $page->pageName }}
                                </a>
                            </li>
                        @endif
                    @endforeach

                    <li><a href="{{ route('website.contact-us') }}">Contact</a></li>
                </ul>
            </div>

            <div class="pxa_header_toggle">
                <i class="fa fa-bars"></i>
            </div>
        </div>
    </div>

    <!-- INLINE JS -->
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const items = document.querySelectorAll('.pxa_megamenu_list');

            items.forEach(item => {
                const link = item.querySelector(':scope > a');
                const dropdown = item.querySelector(':scope > .pxa_header_Subnav');
                if (!link) return;

                // si pas de dropdown, on ne touche pas au lien
                if (!dropdown) return;

                link.addEventListener('click', function (e) {
                    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth);

                    if (vw < 992) {
                        if (!item.classList.contains('open')) {
                            e.preventDefault();

                            // fermer autres ouverts
                            document.querySelectorAll('.pxa_megamenu_list.open')
                                .forEach(other => { if (other !== item) other.classList.remove('open'); });

                            item.classList.add('open');
                            return;
                        }
                        // si déjà open -> laisser suivre le lien (deuxième tap)
                    }
                    // desktop: hover gère l'affichage
                }, { passive: false });
            });

            // fermer si clique en dehors
            document.addEventListener('click', function (e) {
                document.querySelectorAll('.pxa_megamenu_list.open').forEach(item => {
                    if (!item.contains(e.target)) item.classList.remove('open');
                });
            });

            // fermer sur Escape
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.pxa_megamenu_list.open').forEach(item => item.classList.remove('open'));
                }
            });
        });
    </script>

</section>
