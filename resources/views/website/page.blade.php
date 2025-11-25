@extends('layouts.website')

@section('title', $page->metaTitle ?? $page->pageName)
@section('meta_description', $page->metaDescription ?? '')

@section('content')
  <section class="mt_bgtempconatainer">
    <div class="container">
      <h1 class="mb-3">{{ $page->pageName }}</h1>

      {{-- Si tu as du contenu HTML trusté (éditeur WYSIWYG) --}}
      <div class="page-content">
        {!! $page->pageDescription !!}
      </div>

      {{-- Si tu veux afficher d'autres meta --}}
      @if($page->headerScript)
        @push('head-scripts')
          {!! $page->headerScript !!}
        @endpush
      @endif

      @if($page->footerScript)
        @push('footer-scripts')
          {!! $page->footerScript !!}
        @endpush
      @endif
    </div>
  </section>
@endsection
