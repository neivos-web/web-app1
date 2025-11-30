<section class="pxa_header_wr pxa_megaMenu_wraper pxa_dropdown_menu mt_bgtempconatainer">
<style>
    /* Menu principal */
    .pxa_menu_list.pxa-tabs {
        display: flex;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
        flex-wrap: wrap;
    }

    .pxa_menu_list.pxa-tabs > li {
        position: relative;
        margin: 0 15px;
    }

    .pxa_menu_list.pxa-tabs > li > a {
        color: #333;
        font-weight: 500;
        padding: 10px 0;
        display: block;
        text-decoration: none;
        transition: color 0.2s;
        white-space: nowrap;
    }

    .pxa_menu_list.pxa-tabs > li > a:hover {
        color: #007bff;
    }

    /* Dropdown */
    .pxa_header_Subnav.pxa_drop_menu {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        min-width: 220px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        padding: 12px 0;
        margin-top: 12px;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: all 0.25s ease;
        z-index: 9999;
    }

    /* Flèche centrée */
    .pxa_header_Subnav.pxa_drop_menu::before {
        content: "";
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 14px;
        height: 14px;
        background: #ffffff;
        box-shadow: -3px -3px 8px rgba(0, 0, 0, 0.08);
        z-index: -1;
    }

    /* Ouverture au hover */
    .pxa_megamenu_list:hover > .pxa_header_Subnav.pxa_drop_menu {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        margin-top: 8px;
    }

    /* Items du sous-menu */
    .pxa_megamenu_item.pxa_header_Subnav_01 {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .pxa_megamenu_item.pxa_header_Subnav_01 li {
        margin: 0;
    }

    .pxa_megamenu_item.pxa_header_Subnav_01 li a {
        display: block;
        padding: 10px 20px;
        color: #444;
        font-size: 15px;
        text-decoration: none;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .pxa_megamenu_item.pxa_header_Subnav_01 li a:hover {
        background: #f8f9fa;
        color: #007bff;
        padding-left: 24px;
    }

    /* Mobile : menu burger */
    @media (max-width: 991px) {
        .pxa_menu_list.pxa-tabs {
            display: none;
            flex-direction: column;
            background: white;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            padding: 15px 0;
        }

        .pxa_menu_list.pxa-tabs.active {
            display: flex;
        }

        .pxa_menu_list.pxa-tabs > li {
            margin: 0;
            width: 100%;
            text-align: left;
        }

        .pxa_menu_list.pxa-tabs > li > a {
            padding: 12px 20px;
            border-bottom: 1px solid #eee;
        }

        .pxa_header_Subnav.pxa_drop_menu {
            position: static;
            transform: none;
            box-shadow: none;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 8px 20px;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            display: none;
        }

        .pxa_header_Subnav.pxa_drop_menu::before { display: none; }

        .pxa_megamenu_list.open > .pxa_header_Subnav.pxa_drop_menu {
            display: block;
        }
    }
</style>

<div class="pxa_header_full">
    <div class="pxa_header_flex">
        <!-- LOGO -->
        <div class="pxa_header_logo">
            <a href="{{ route('website.home') }}">
                <img src="{{ asset('frontend/public/pages/assets/images/pxa_logo.png') }}" alt="Logo" height="40">
            </a>
        </div>

        <!-- MENU -->
        <div class="pxa_header_nav">
            <ul class="pxa_menu_list pxa-tabs">
                <li><a href="{{ route('website.home') }}">Accueil</a></li>

                @foreach($publishedPages as $page)
                    <li class="pxa_megamenu_list">
                        <a href="{{ route('website.page.show', $page->slug) }}">
                            {{ trim($page->pageName) }}
                        </a>

                        @if($page->children->count() > 0)
                            <div class="pxa_header_Subnav pxa_drop_menu">
                                <ul class="pxa_megamenu_item pxa_header_Subnav_01">
                                    @foreach($page->children as $child)
                                        @if(trim($child->pageName))
                                            <li>
                                                <a href="{{ route('website.page.show', $child->slug) }}">
                                                    {{ trim($child->pageName) }}
                                                </a>
                                            </li>
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

        <!-- BURGER -->
        <div class="pxa_header_toggle">
            <i class="fa fa-bars"></i>
        </div>
    </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
    // Burger menu mobile
    document.querySelector('.pxa_header_toggle').addEventListener('click', function () {
        document.querySelector('.pxa_menu_list.pxa-tabs').classList.toggle('active');
    });

    // Gestion mobile : tap pour ouvrir le sous-menu
    document.querySelectorAll('.pxa_megamenu_list > a').forEach(link => {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 991) {
                const parent = this.parentElement;
                const dropdown = parent.querySelector('.pxa_header_Subnav');
                if (dropdown) {
                    e.preventDefault();
                    parent.classList.toggle('open');
                }
            }
        });
    });

    // Fermer au clic dehors
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.pxa_header_nav') && !e.target.closest('.pxa_header_toggle')) {
            document.querySelectorAll('.pxa_megamenu_list.open').forEach(el => el.classList.remove('open'));
            document.querySelectorAll('.pxa_menu_list.pxa-tabs').forEach(el => el.classList.remove('active'));
        }
    });
});
</script>
</section>