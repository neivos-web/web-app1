<section class="pxa_header_wr pxa_megaMenu_wraper pxa_dropdown_menu mt_bgtempconatainer">
<style>
    /* === TOUT LE CSS DE MA DERNIÈRE RÉPONSE (copie-colle exactement) === */
    .pxa_menu_list.pxa-tabs { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; }
    .pxa_menu_list.pxa-tabs > li { position: relative; margin: 0 18px; }
    .pxa_menu_list.pxa-tabs > li > a { color: #333; font-weight: 500; padding: 10px 0; text-decoration: none; white-space: nowrap; }
    .pxa_menu_list.pxa-tabs > li > a:hover { color: #007bff; }

    .pxa_header_Subnav.pxa_drop_menu {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #fff;
        min-width: 240px;
        border-radius: 12px;
        box-shadow: 0 12px 35px rgba(0,0,0,0.15);
        padding: 14px 0;
        margin-top: 12px;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: all 0.25s ease;
        z-index: 9999;
    }

    .pxa_header_Subnav.pxa_drop_menu::before {
        content: "";
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 16px;
        height: 16px;
        background: #fff;
        box-shadow: -3px -3px 10px rgba(0,0,0,0.1);
    }

    .pxa_megamenu_list:hover > .pxa_header_Subnav.pxa_drop_menu {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        margin-top: 8px;
    }

    .pxa_megamenu_item.pxa_header_Subnav_01 {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .pxa_megamenu_item.pxa_header_Subnav_01 a {
        display: block;
        padding: 11px 24px;
        color: #444;
        font-size: 15px;
        text-decoration: none;
        transition: all 0.2s;
    }

    .pxa_megamenu_item.pxa_header_Subnav_01 a:hover {
        background: #f0f8ff;
        color: #007bff;
        padding-left: 30px;
    }

    /* Mobile */
    @media (max-width: 991px) {
        .pxa_menu_list.pxa-tabs {
            display: none;
            flex-direction: column;
            background: white;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
            padding: 10px 0;
        }
        .pxa_menu_list.pxa-tabs.active { display: flex; }
        .pxa_header_Subnav.pxa_drop_menu {
            position: static;
            transform: none;
            box-shadow: none;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 8px 20px;
            opacity: 1;
            visibility: visible;
            display: none;
        }
        .pxa_header_Subnav.pxa_drop_menu::before { display: none; }
        .pxa_megamenu_list.open > .pxa_header_Subnav.pxa_drop_menu { display: block; }
    }
</style>

<div class="pxa_header_full">
    <div class="pxa_header_flex">
        <div class="pxa_header_logo">
            <a href="{{ route('website.home') }}">
                <img src="{{ asset('frontend/public/pages/assets/images/pxa_logo.png') }}" alt="Logo" height="40">
            </a>
        </div>

        <div class="pxa_header_nav">
            <ul class="pxa_menu_list pxa-tabs">
                <li><a href="{{ route('website.home') }}">Accueil</a></li>

                @foreach($publishedPages as $page)
                    <li class="pxa_megamenu_list">
                        <a href="{{ route('website.page.show', $page->slug) }}">{{ trim($page->pageName) }}</a>

                        @if($page->children->count() > 0)
                            <div class="pxa_header_Subnav pxa_drop_menu">
                                <ul class="pxa_megamenu_item pxa_header_Subnav_01">
                                    @foreach($page->children as $child)
                                        @if(trim($child->pageName))
                                            <li><a href="{{ route('website.page.show', $child->slug) }}">{{ trim($child->pageName) }}</a></li>
                                        @endif
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                    </li>
                @endforeach

                <li><a href="{{ route('website.blog') }}">Actualités/Blog</a></li>
                <li><a href="{{ route('website.contact-us') }}">Contact</a></li>
            </ul>
        </div>

        <div class="pxa_header_toggle">
            <i class="fa fa-bars"></i>
        </div>
    </div>
</div>

{{-- UN SEUL SCRIPT – JAMAIS DE DOUBLON --}}
<script>
document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector('.pxa_header_toggle');
    const menu = document.querySelector('.pxa_menu_list.pxa-tabs');

    burger.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    document.querySelectorAll('.pxa_megamenu_list > a').forEach(link => {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 991) {
                const parent = this.parentElement;
                const submenu = parent.querySelector('.pxa_header_Subnav');
                if (submenu) {
                    e.preventDefault();
                    parent.classList.toggle('open');
                }
            }
        });
    });

    // Fermer si clic dehors
    document.addEventListener('click', e => {
        if (!e.target.closest('.pxa_header_nav') && !e.target.closest('.pxa_header_toggle')) {
            menu.classList.remove('active');
            document.querySelectorAll('.pxa_megamenu_list.open').forEach(el => el.classList.remove('open'));
        }
    });
});
</script>
</section>