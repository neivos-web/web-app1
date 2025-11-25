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
                                                placeholder="Enter Title..." id="pageName">
                                        </div>

                                        {{-- @php

                                          //   $pages = DB::table('pages')->select('id')->orderBy('id', 'desc')->first();
                                          //   $pageId = $pages->id + 1;
                                            $pageUrl = Str::slug($pageName . '-' . $pageName);

                                        @endphp --}}


                                        <div class="form-group col-sm-3">
                                            <label for="pageUrl">Page Url:</label>
                                            <input type="text" name="pageUrl" class="form-control" 
                                                placeholder="Enter Title..." id="pageUrl" onchange="pageUrl()">
                                        </div>

                                        <div class="form-group col-sm-2">
                                            <label for="pageStatus">Page Status:</label>
                                            <select name="pageStatus" id="pageStatus" class="form-control">
                                                <option value=""> >> Chouse Type << </option>
                                                <option value="publish">Publish</option>
                                                <option value="unpublish">UnPublish</option>
                                            </select>

                                        </div>

                                    </div>

                                    <div class="form-group">
                                        <label for="pageUrl">Page Description:</label>
                                        <textarea name="description" id="summernote" class="form-control " placeholder="Enter Description...">{{ $page->pageDescription }}</textarea>

                                    </div>

                                    <!-- Page Seo  -->

                                    <div class="form-group">
                                        <label for="metaTitle">Meta Title:</label>
                                        <input type="text" name="metaTitle" class="form-control"
                                            placeholder="Enter Meta Title..." id="metaTitle">
                                    </div>

                                    <div class="form-group">
                                        <label for="metaKeywords">Meta Keywords:</label>
                                        <input type="text" name="metaKeywords" class="form-control"
                                            placeholder="Enter Meta Keywords..." id="metaKeywords">
                                    </div>

                                    <div class="form-group">
                                        <label for="metaDescription">Meta Description:</label>
                                        <textarea class="form-control" name="metaDescription" id="metaDescription" cols="30" rows="5"></textarea>

                                    </div>
                                    <!-- Page Seo  -->

                                    <div class="d-flex">
                                        <div class="form-group col-sm-6">
                                            <label for="">Header Script</label>
                                            <textarea class="form-control" name="headerScript" id="" cols="30" rows="10"></textarea>
                                        </div>
                                        <div class="form-group col-sm-6">
                                            <label for="">Footer Script</label>
                                            <textarea class="form-control" name="footerScript" id="" cols="30" rows="10"></textarea>
                                        </div>
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
