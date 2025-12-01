{{-- resources/views/website/pages/show.blade.php --}}
@extends('layouts.website')

@section('content')
<style>
    /* BOX PRINCIPAL */
    .custom-section-card {
        background: #ffffff;
        border-radius: 16px;
        padding: 32px;
        gap: 40px;
        box-shadow: 0 10px 30px rgba(33, 47, 61, 0.08);
        overflow: hidden;
        margin-bottom: 3rem;
        transition: transform 0.3s ease;
    }
    .custom-section-card:hover {
        transform: translateY(-5px);
    }

    /* MEDIA WRAPPER */
    .custom-media-wrapper {
        flex: 0 0 420px;
        max-width: 420px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .custom-media {
        width: 100%;
        height: auto;
        border-radius: 12px;
        object-fit: cover;
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }

    .custom-embed {
        position: relative;
        width: 100%;
        padding-top: 56.25%; /* 16:9 */
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }
    .custom-embed iframe,
    .custom-embed video {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }

    /* CONTENT WRAPPER */
    .custom-content-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
    }
    .custom-content-inner {
        font-size: 17px;
        line-height: 1.8;
        color: #2c3e50;
    }
    .custom-content-inner h1,
    .custom-content-inner h2,
    .custom-content-inner h3 {
        color: #2c3e50;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
    }

    /* Texte seul : pleine largeur */
    .text-only-card {
        text-align: center;
        padding: 50px 40px;
    }
    .text-only-card .custom-content-inner {
        max-width: 900px;
        margin: 0 auto;
        font-size: 18px;
    }

    /* Responsive */
    @media (max-width: 992px) {
        .custom-section-card {
            flex-direction: column;
            padding: 28px;
            gap: 28px;
        }
        .custom-media-wrapper {
            flex: none;
            max-width: 100%;
        }
        .text-only-card {
            padding: 40px 20px;
        }
    }

    /* Container centré */
    .pxa_container .row.justify-content-center > div {
        max-width: 1100px;
    }
</style>

{{-- Header de page --}}
<section class="pxa_page_title mt_bgtempconatainer"
    style="background-image: url({{ asset('frontend/public/pages/assets/images/Breadcrumbs.jpg') }})">
    <div class="pxa_container">
        <div class="pxa_page_title_opacity">
            <h2>{{ $page->pageName }}</h2>
            <ul>
                <li><a href="{{ url('/') }}">Accueil</a> /</li>
                <li>{{ $page->pageName }}</li>
            </ul>
        </div>
    </div>
</section>

{{-- Description générale --}}
@if($page->pageDescription)
<section class="pxa_about py-5">
    <div class="pxa_container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-10">
                <div class="custom-section-card text-only-card">
                    @if($page->pageDescription)
<section class="pxa_about py-5">
    <div class="pxa_container">
        <div class="row justify-content-center">
            <div class="col-12 col-lg-10">
                <div class="custom-section-card text-only-card">
                    <div class="custom-content-inner">
                        {!! $page->pageDescription !!}
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
@endif

                </div>
            </div>
        </div>
    </div>
</section>
@endif

{{-- Sections dynamiques --}}
<section class="pxa_about py-4">
    <div class="pxa_container">

        @forelse($page->sections()->orderBy('order')->get() as $section)
            @if($section->type === 'text' && $section->content)
                <!-- Texte seul -->
                <div class="row justify-content-center mb-5">
                    <div class="col-12 col-lg-10">
                        <div class="custom-section-card text-only-card">
                            <div class="custom-content-inner">
                                {!! $section->content !!}
                            </div>
                        </div>
                    </div>
                </div>

            @elseif(($section->type === 'image' || $section->type === 'video') && ($section->media || $section->content))
                <!-- Image ou Vidéo + Texte -->
                <div class="row justify-content-center mb-5">
                    <div class="col-12 col-lg-10">
                        <div class="custom-section-card d-flex flex-column flex-lg-row align-items-stretch
                            {{ $section->position === 'left' ? 'flex-lg-row-reverse' : '' }}">

                            {{-- Média (gauche ou droite selon position) --}}
                            <div class="custom-media-wrapper">
                                @if($section->type === 'image' && $section->media)
                                    <img src="{{ $section->media && filter_var($section->media, FILTER_VALIDATE_URL)
                                        ? $section->media
                                        : asset('storage/' . $section->media) }}"
                                         class="custom-media" alt="Image section">

                                @elseif($section->type === 'video' && $section->media)
                                    <div class="custom-embed">
                                        @if(filter_var($section->media, FILTER_VALIDATE_URL))
                                            {{-- YouTube / Vimeo / URL externe --}}
                                            <iframe src="{{ $section->media }}" allowfullscreen loading="lazy"></iframe>
                                        @else
                                            {{-- Vidéo locale --}}
                                            <video controls preload="metadata">
                                                <source src="{{ asset('storage/' . $section->media) }}" type="video/mp4">
                                                Votre navigateur ne supporte pas la vidéo.
                                            </video>
                                        @endif
                                    </div>
                                @endif
                            </div>

                            {{-- Texte --}}
                            <div class="custom-content-wrapper">
                                <div class="custom-content-inner">
                                    @if($section->content)
                                        {!! $section->content !!}
                                    @else
                                        <p class="text-muted fst-italic">Aucun texte pour cette section.</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endif
        @empty
            <div class="text-center py-5">
                <p class="text-muted">Aucune section pour cette page.</p>
            </div>
        @endforelse

    </div>
</section>
@endsection