@extends('layouts.admin-app')
@section('title', 'Page || Create')
@section('content')

    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>Page</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Home</a></li>
                            <li class="breadcrumb-item {{ Route::currentRouteName() ? 'active' : '' }}">Page</li>
                        </ol>
                    </div>
                </div>
            </div><!-- /.container-fluid -->
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title pt-2"><i class="fas fa-plus pr-2"></i>Create Page</h3>
                                <a href="{{ route('page.index') }}" class="btn btn-success float-right"><i
                                        class="fas fa-list pr-2"></i>All Page</a>
                            </div>
                            <!-- /.card-header -->
                            <div class="card-body">

                                <form action="{{ route('page.store') }}" method="POST" enctype="multipart/form-data">
                                    @csrf

                                    <div class="d-flex ga-4 align-item-center">
                                        <div class="form-group col-sm-7">
                                            <label for="pageName">Page Name:</label>
                                            <input type="text" name="pageName" class="form-control"
                                                placeholder="Enter Title..." id="pageName" value="{{ old('pageName') }}">
                                        </div>

                                        <div class="form-group col-sm-3">
                                            <label for="pageUrl">Page Url:</label>
                                            <input type="text" name="pageUrl" class="form-control" 
                                                placeholder="Enter Title..." id="pageUrl" onchange="pageUrl()" value="{{ old('pageUrl') }}">
                                        </div>

                                        <div class="form-group col-sm-2">
                                            <label for="pageStatus">Page Status:</label>
                                            <select name="pageStatus" id="pageStatus" class="form-control">
                                                <option value=""> >> Chouse Type << </option>
                                                <option value="publish" {{ old('pageStatus') == 'publish' ? 'selected' : '' }}>Publish</option>
                                                <option value="unpublish" {{ old('pageStatus') == 'unpublish' ? 'selected' : '' }}>UnPublish</option>
                                            </select>
                                        </div>

                                    </div>

                                    <div class="form-group">
                                        <label for="pageUrl">Page Description:</label>
                                        <textarea name="description" id="summernote" class="form-control " placeholder="Enter Description...">{{ old('description') }}</textarea>
                                    </div>

                                    <!-- Page Seo  -->

                                    <div class="form-group">
                                        <label for="metaTitle">Meta Title:</label>
                                        <input type="text" name="metaTitle" class="form-control"
                                            placeholder="Enter Meta Title..." id="metaTitle" value="{{ old('metaTitle') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="metaKeywords">Meta Keywords:</label>
                                        <input type="text" name="metaKeywords" class="form-control"
                                            placeholder="Enter Meta Keywords..." id="metaKeywords" value="{{ old('metaKeywords') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="metaDescription">Meta Description:</label>
                                        <textarea class="form-control" name="metaDescription" id="metaDescription" cols="30" rows="5">{{ old('metaDescription') }}</textarea>
                                    </div>
                                    <!-- Page Seo  -->

                                    <div class="d-flex">
                                        <div class="form-group col-sm-6">
                                            <label for="">Header Script</label>
                                            <textarea class="form-control" name="headerScript" id="" cols="30" rows="10">{{ old('headerScript') }}</textarea>
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="">Footer Script</label>
                                            <textarea class="form-control" name="footerScript" id="" cols="30" rows="10">{{ old('footerScript') }}</textarea>
                                        </div>
                                    </div>

                                    {{-- NOUVEAU : Champ Parent Page --}}
                                    <div class="form-group mt-2">
                                        <label for="parent_id">Parent Page (optionnel)</label>
                                        <select name="parent_id" id="parent_id" class="form-control">
                                            <option value="">-- Aucun (page principale) --</option>
                                            @php
                                                // récupérer toutes les pages existantes (tu peux filtrer si besoin)
                                                $allPages = \App\Models\Page::orderBy('pageName','asc')->get();
                                            @endphp

                                            @foreach($allPages as $p)
                                                <option value="{{ $p->id }}" {{ old('parent_id') == $p->id ? 'selected' : '' }}>
                                                    {{ $p->pageName }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>

                                    <div class="form-group mt-2">
                                        <button type="submit" class="btn btn-success">
                                            <i class="fas fa-save pr-2"></i>Page Create</button>
                                    </div>
                                </form>
                            </div>
                            <!-- /.card-body -->
                        </div>
                        <!-- /.card -->
                    </div>
                    <!-- /.col -->
                </div>
                <!-- /.row -->

            </div>

        </section>
        <!-- /.content -->
    </div>

    <script>
        function pageUrl() {

            var pageName = document.getElementById('pageName').value;
            var pageUrl = document.getElementById('pageUrl').value = pageName;

            pageUrl = pageUrl.replace(/\s+/g, '-').toLowerCase();

            document.getElementById('pageUrl').value = pageUrl;
        }
    </script>

@endsection
