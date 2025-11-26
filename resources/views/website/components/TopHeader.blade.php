<section class="pxa_header_wr pxa_megaMenu_wraper pxa_dropdown_menu mt_bgtempconatainer">
<style>
/* Dropdown */
.pxa_header_Subnav.pxa_drop_menu {
    position: absolute;
    top: 55px;
    left: 0;
    background: #fff;
    border-radius: 6px;
    padding: 8px 12px;
    min-width: 260px;
    width: auto;
    max-width: none;
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    display: none;
    z-index: 9999;

    /* IMPORTANT : pas de retour à la ligne */
    white-space: nowrap;
}

/* Arrow */
.pxa_header_Subnav.pxa_drop_menu::before {
    content: "";
    position: absolute;
    top: -6px;
    left: 14px;
    width: 10px;
    height: 10px;
    background: #fff;
    transform: rotate(45deg);
    box-shadow: -1px -1px 2px rgba(0,0,0,0.04);
}

/* Liste interne */
.pxa_megamenu_item.pxa_header_Subnav_01 {
    padding: 0;
    margin: 0;
    list-style: none;
}

.pxa_megamenu_item.pxa_header_Subnav_01 li {
    margin: 3px 0;
}

.pxa_megamenu_item.pxa_header_Subnav_01 li a {
    padding: 6px 8px;
    display: block;
    font-size: 15px;
    color: #333;
    border-radius: 4px;

    /* IMPORTANT : tout sur une seule ligne */
    white-space: nowrap;

    line-height: 1.25;
    transition: background .1s ease;
}

.pxa_megamenu_item.pxa_header_Subnav_01 li a:hover {
    background: #f6f6f6;
}

/* Structure menu */
.pxa_menu_list.pxa-tabs > li {
    margin: 0 10px;
    position: relative;
    display: inline-block;
}

/* Hover desktop */
.pxa_menu_list.pxa-tabs > li:hover > .pxa_header_Subnav.pxa_drop_menu {
    display: block;
}

/* Responsive mode mobile */
@media (max-width: 991px) {
    .pxa_menu_list.pxa-tabs > li { display: block; margin: 0; }
    .pxa_header_Subnav.pxa_drop_menu {
        position: static;
        display: block;
        transform: none;
        opacity: 1;
        visibility: visible;
        box-shadow: none;
        border-radius: 0;
        padding: 6px 0;
        min-width: auto;
        white-space: nowrap;
    }
    .pxa_header_Subnav.pxa_drop_menu::before { display: none; }
}
</style>



<script>
document.addEventListener("DOMContentLoaded", function () {
    const items = document.querySelectorAll(".pxa_megamenu_list");

    items.forEach(item => {
        const parentLink = item.querySelector(":scope > a");
        const dropdown = item.querySelector(":scope > .pxa_header_Subnav");

        if (!dropdown || !parentLink) return;

        /* Mobile : 1er tap ouvre, 2ème tap suit le lien */
        parentLink.addEventListener('click', function (e) {
            const vw = window.innerWidth;

            if (vw <= 991) {
                if (!item.classList.contains('open')) {
                    e.preventDefault();
                    document.querySelectorAll('.pxa_megamenu_list.open')
                        .forEach(it => it.classList.remove('open'));
                    item.classList.add('open');
                    dropdown.style.display = 'block';
                    return;
                }
            }
        }, { passive: false });

        document.addEventListener('click', function (ev) {
            if (!item.contains(ev.target)) {
                item.classList.remove('open');
                dropdown.style.display = '';
            }
        });
    });

    window.addEventListener('resize', function () {
        document.querySelectorAll('.pxa_megamenu_list.open')
            .forEach(it => it.classList.remove('open'));
        document.querySelectorAll('.pxa_header_Subnav.pxa_drop_menu')
            .forEach(dd => dd.style.display = '');
    });
});
</script>

    <div class="pxa_header_full">
        <div class="pxa_header_flex">

            <!-- LOGO -->
            <div class="pxa_header_logo">
                <a href="{{ route('website.home') }}">
                    <img src="{{ asset('frontend') }}/public/pages/assets/images/pxa_logo.png"
                         alt="Logo" height="40" width="158">
                </a>
            </div>

            <!-- MENU -->
            <div class="pxa_header_nav">
                <ul class="pxa_menu_list pxa_dropdown_flex pxa-tabs">

                    <li><a href="{{ route('website.home') }}">Acceuil</a></li>
                    {{-- Pages dynamiques --}}
                    @foreach($publishedPages as $page)
                        <li class="pxa_megamenu_list">
                            <a href="{{ route('website.page.show', $page->slug) }}">
                                {{ $page->pageName }}
                            </a>

                            @if($page->children->count() > 0)
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
                            @endif

                        </li>
                    @endforeach
                    <!--
                    <li class="pxa_megamenu_list">
                        <a href="#">Service</a>
                        <div class="pxa_header_Subnav pxa_drop_menu">
                            <div class="pxa_megamenu_grid">
                                <ul class="pxa_megamenu_item pxa_header_Subnav_01">
                                    @foreach($serviceCategory as $item)
                                    <li>
                                        <a href="#">
                                            {{ $item->title }}
                                        </a>
                                    </li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>
                    </li><-->

                    <li><a href="{{ route('website.blog') }}">Actualités/Blog</a></li>
                    <li><a href="{{ route('website.gallery') }}">Gallerie</a></li>

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
    const items = document.querySelectorAll(".pxa_megamenu_list");

    items.forEach(item => {
        const parentLink = item.querySelector(":scope > a");
        const dropdown = item.querySelector(":scope > .pxa_header_Subnav");

        if (!dropdown || !parentLink) return;

        /* Mobile : 1er tap ouvre, 2ème tap suit le lien */
        parentLink.addEventListener('click', function (e) {
            const vw = window.innerWidth;

            if (vw <= 991) {
                if (!item.classList.contains('open')) {
                    e.preventDefault();
                    document.querySelectorAll('.pxa_megamenu_list.open')
                        .forEach(it => it.classList.remove('open'));
                    item.classList.add('open');
                    dropdown.style.display = 'block';
                    return;
                }
            }
        }, { passive: false });

        document.addEventListener('click', function (ev) {
            if (!item.contains(ev.target)) {
                item.classList.remove('open');
                dropdown.style.display = '';
            }
        });
    });

    window.addEventListener('resize', function () {
        document.querySelectorAll('.pxa_megamenu_list.open')
            .forEach(it => it.classList.remove('open'));
        document.querySelectorAll('.pxa_header_Subnav.pxa_drop_menu')
            .forEach(dd => dd.style.display = '');
    });
});
</script>


</section>
