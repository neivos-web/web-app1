@extends('layouts.website')
@section('content')

    <h1>{{ $page->pageName }}</h1>
    {!! $page->pageDescription !!}
@endsection
