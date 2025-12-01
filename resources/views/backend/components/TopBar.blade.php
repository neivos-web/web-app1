
<nav x-data="{ open: false }" class="main-header navbar navbar-expand navbar-white navbar-light shadow-sm border-bottom">

    <!-- Left navbar -->
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#">
                <i class="fas fa-bars"></i>
            </a>
        </li>
    </ul>

    <!-- Right navbar -->
    <ul class="navbar-nav ml-auto">

        <!-- User Dropdown -->
        <li class="nav-item dropdown">

            <!-- User Button -->
            <a class="nav-link d-flex align-items-center py-2 px-3 hover-bg"
               data-toggle="dropdown" href="#">

                <img src="{{ asset('backend/dist/img/user1-128x128.jpg') }}"
                     alt="User"
                     class="rounded-circle mr-2"
                     style="width:28px; height:28px; object-fit:cover;">

                <span class="text-sm font-weight-medium">
                    {{ Auth::user()->name }}
                </span>

                <i class="fas fa-angle-down ml-2 text-muted"></i>
            </a>

            <!-- Dropdown Menu -->
            <div class="dropdown-menu dropdown-menu-right p-0 shadow-lg border-0">

                <!-- Header Section -->
                <div class="p-3 text-center bg-light border-bottom">
                    <img src="{{ asset('backend/dist/img/user1-128x128.jpg') }}"
                         alt="Avatar"
                         class="rounded-circle mb-2"
                         style="width:60px; height:60px; object-fit:cover;">

                    <div class="font-weight-bold">{{ Auth::user()->name }}</div>
                    <div class="text-muted small">{{ Auth::user()->email }}</div>
                </div>

                <!-- Profile Link -->
                <a href="{{ route('profile.edit') }}"
                   class="dropdown-item d-flex align-items-center">
                    <i class="fas fa-user mr-2 text-primary"></i> Profile
                </a>

                <div class="dropdown-divider m-0"></div>

                <!-- Logout -->
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit"
                            class="dropdown-item text-danger d-flex align-items-center">
                        <i class="fas fa-sign-out-alt mr-2"></i> {{ __('Log Out') }}
                    </button>
                </form>
            </div>
        </li>

        <!-- Mobile Menu Toggle -->
<!--         <li class="nav-item sm:hidden">
            <button @click="open = !open"
                    class="nav-link border rounded p-2 text-gray-600">
                <i :class="open ? 'fas fa-times' : 'fas fa-bars'"></i>
            </button>
        </li> -->
    </ul>

    <!-- Mobile Responsive Menu -->
    <div :class="{'block': open, 'd-none': !open}"
         class="d-none w-100 bg-white shadow-sm border-top">
        <div class="p-3">
            <div class="font-weight-bold">{{ Auth::user()->name }}</div>
            <div class="text-muted small">{{ Auth::user()->email }}</div>

            <hr>

            <a href="{{ route('profile.edit') }}" class="d-block py-2">
                <i class="fas fa-user mr-2"></i> Profile
            </a>

            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit"
                        class="btn btn-danger btn-block mt-2">
                    {{ __('Log Out') }}
                </button>
            </form>
        </div>
    </div>
</nav>
