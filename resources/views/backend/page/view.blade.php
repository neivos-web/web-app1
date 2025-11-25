@extends('layouts.admin-app')
@section('title', 'page')
@section('content')

    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>page</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Home</a></li>
                            <li class="breadcrumb-item active">page</li>
                        </ol>
                    </div>
                </div>
            </div><!-- /.container-fluid -->
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <div class="row"></div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title pt-2"><i class="fas fa-eye pr-1"></i>Show page</h3>
                            <a href="{{ route('page.index') }}" class="btn btn-outline-success float-right">
                                <i class="fas fa-list"></i> page List
                            </a>
                        </div>
                        <!-- /.card-header -->
                        <div class="card-body">

                            <table class="table table-bordered table-striped">

                                <tbody>
                                    <tr>
                                        <th>Page Name</th>
                                        <th>:</th>
                                        <td>{{ $page->pageName }} </td>
                                    </tr>
                                    <tr>
                                        <th>Page Url </th>
                                        <th>:</th>
                                        <td>{{ $page->pageUrl }}</td>
                                    </tr>

                                    <tr>
                                        <th>Meta Title</th>
                                        <th>:</th>
                                        <td>{{ $page->metaTitle }}</td>
                                    </tr>
                                    <tr>
                                        <th>Meta Keyword</th>
                                        <th>:</th>
                                        <td>{{ $page->metaKeywords }}</td>
                                    </tr>
                                    <tr>
                                        <th>Meta Description</th>
                                        <th>:</th>
                                        <td>{{ $page->metaDescription }}</td>
                                    </tr>
                                    <tr>
                                        <th>Header Script</th>
                                        <th>:</th>
                                        <td>{{ $page->headerScript }}</td>
                                    </tr>
                                    <tr>
                                        <th>Footer Script</th>
                                        <th>:</th>
                                        <td>{{ $page->footerScript }}</td>
                                    </tr>


                                    <tr>
                                        <th>Status</th>
                                        <th>:</th>
                                        <td>
                                            @if ($page->status == 'publish')
                                                <span class="badge bg-success">Publish</span>
                                            @else
                                                <span class="badge bg-danger">Draft</span>
                                            @endif
                                        </td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                        <!-- /.card-body -->
                    </div>
                    <!-- /.card -->
                </div>
                <!-- /.col -->
            </div>
            <!-- /.row -->


        </section>
        <!-- /.content -->
    </div>





@endsection
