<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    {{-- <a href="index3.html" class="brand-link">
        <img src="{{ asset('backend') }}/dist/img/AdminLTELogo.png" alt="AdminLTE Logo"
            class="brand-image img-circle elevation-3" style="opacity: .8">
        <span class="brand-text font-weight-light">{{ $website->site_name }}</span>
    </a> --}}
    <a href="{{ route('admin.dashboard') }}" class="brand-link">
        <img @if ($website->site_WhiteLogo) src="{{ asset($website->site_WhiteLogo) }}" @else src="{{ asset('backend') }}/dist/img/AdminLTELogo.png" @endif
            alt="AdminLTE Logo" class="brand-image" style="opacity: .8">
        {{-- <span class="brand-text font-weight-light">{{ $website->site_name }}</span> --}}
    </a>

    <!-- Sidebar -->
    <div class="sidebar">

        <!-- Sidebar Menu -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu"
                data-accordion="false">
                <!-- Add icons to the links using the .nav-icon class
               with font-awesome or any other icon font library -->
                <li class="nav-item">
                    <a href="{{ route('admin.dashboard') }}"
                        class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                        {{-- <span class="icon-dash">
                        </span> --}}
                        <span class="icon-menu">
                            <x-backend.icon.dashboard-icon name="dashboard" />
                        </span>
                        <span class="menu-text">
                            Dashboard
                        </span> 
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('page.index') }}"
                        class="nav-link {{ request()->routeIs('page.index') ? 'active' : '' }}">

                        <span class="icon-menu">
                            <x-backend.icon.page-icon name="category" />
                        </span>
                        <span class="menu-text">
                            Page Management
                        </span>

                    </a>
                </li>


                <li class="nav-item">
                    <a href="{{ route('model-create') }}"
                        class="nav-link {{ request()->routeIs('model-create') ? 'active' : '' }}">

                        <span class="icon-menu">
                            <x-backend.icon.category-icon name="category" />
                        </span>
                        <span class="menu-text">
                            Create Model
                        </span>
                        {{-- <span class="pl-1">Category ( {{ $categorylist->count() }} ) </span> --}}
                    </a>
                </li>


                <li class="nav-item">
                    <a href="{{ route('admin.category') }}"
                        class="nav-link {{ request()->routeIs('admin.category') ? 'active' : '' }}">

                        <span class="icon-menu">
                            <x-backend.icon.category-icon name="category" />
                        </span>
                        <span class="menu-text">
                            Category ( {{ $categorylist->count() }} )
                        </span>
                        {{-- <span class="pl-1">Category ( {{ $categorylist->count() }} ) </span> --}}
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('admin.blog.index') }}"
                        class="nav-link {{ request()->routeIs('admin.blog.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.blog-icon />
                        </span>
                        <span class="menu-text">
                            Blog
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('tag.index') }}"
                        class="nav-link {{ request()->routeIs('tag.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.tag-icon />
                        </span>
                        <span class="menu-text">
                            Tag
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('service.index') }}"
                        class="nav-link {{ request()->routeIs('service.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.service-icon />
                        </span>
                        <span class="menu-text">
                            Service
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('gallery.index') }}"
                        class="nav-link {{ request()->routeIs('gallery.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.gallery-icon />
                        </span>
                        <span class="menu-text">
                            Gallery
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('testimonial.index') }}"
                        class="nav-link {{ request()->routeIs('testimonial.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.testimonial-icon />
                        </span>
                        <span class="menu-text">
                            Testimonial
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('price-plan.index') }}"
                        class="nav-link {{ request()->routeIs('price-plan.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.plan-icon />
                        </span>
                        <span class="menu-text">
                            PricePlan
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('faq.index') }}"
                        class="nav-link {{ request()->routeIs('faq.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.faq-icon />
                        </span>
                        <span class="menu-text">
                            Faq
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('partner.index') }}"
                        class="nav-link {{ request()->routeIs('partner.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.partner-icon />
                        </span>
                        <span class="menu-text">
                            Partner
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('team-member.index') }}"
                        class="nav-link {{ request()->routeIs('team-member.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.team-icon />
                        </span>
                        <span class="menu-text">
                            Our Team
                        </span>
                    </a>
                </li>

                <li class="nav-item">
                    <a href="{{ route('contact.index') }}"
                        class="nav-link {{ request()->routeIs('contact.index') ? 'active' : '' }}">
                        <span class="icon-menu">
                            <x-backend.icon.contact-icon />
                        </span>
                        <span class="menu-text">
                            Contact US
                        </span>
                    </a>
                    {{-- {{ request()->routeIs('setting.website') ? 'menu-open' : '' }} --}}
                </li>
                {{-- <li class="nav-item menu-is-opening @if ('setting.website') ? 'menu-open' : '' @else('setting.mail-setting') ? 'menu-open' : '' @endif "> --}}
                <li class="nav-item menu-is-opening {{ request()->routeIs('setting.website') ? 'menu-open' : '' }}">
                    <a href="#" class="nav-link">
                        {{-- <i class="nav-icon fas fa-chart-pie"></i> --}}
                        {{-- <p>
                            Setting
                            <i class="right fas fa-angle-right"></i>
                        </p> --}}
                        <span class="icon-menu">
                            <x-backend.icon.setting-icon />
                        </span>
                        <span class="menu-text">
                            Setting
                        </span>
                        <i class="right fas fa-angle-left"></i>

                    </a>

                    <ul class="nav nav-treeview">

                        <li class="nav-item">
                            <a href="{{ route('setting.website') }}"
                                class="nav-link {{ request()->routeIs('setting.website') ? 'active' : '' }}">
                                {{-- <i class="far fa-circle nav-icon"></i> --}}
                                <span class="icon-dash"></span>
                                <span class="menu-text"> Website</span>
                            </a>
                        </li>

                        {{-- <li class="nav-item">
                            <a href="{{ route('setting.color') }}" class="nav-link {{ request()->routeIs('setting.color') ? 'active' : '' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Color Setting</p>
                            </a>
                        </li> --}}

                        <li class="nav-item">
                            <a href="{{ route('setting.mail-setting') }}"
                                class="nav-link {{ request()->routeIs('setting.mail-setting') ? 'active' : '' }}">
                                <span class="icon-dash"></span>
                                <span class="menu-text">Mail Setting</span>
                            </a>
                        </li>

                    </ul>
                </li>

                <li class="nav-item">
                    <a href="#" class="nav-link ">
                        <i class="far fa-circle"></i>
                        <p>Logout</p>
                    </a>
                </li>
                <hr class="clear">
                <li class="nav-item">
                    <a href="{{ route('model.index') }}" class="nav-link ">
                        <i class="far fa-circle"></i>
                        <p>Model List</p>
                    </a>
                </li>
            </ul>
        </nav>
        <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
</aside>
