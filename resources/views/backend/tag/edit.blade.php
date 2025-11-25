@extends('layouts.admin-app')
@section('title', 'Tag')
@section('content')

    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>Edit Tag</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Home</a></li>
                            <li class="breadcrumb-item active">Tag</li>
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
                            <h3 class="card-title pt-2">
                                <i class="fas fa-plus"></i>
                                Edit Tag
                            </h3>
                            <a href="{{ route('tag.index') }}"
                                class="btn btn-outline-success float-right d-flex gap-3 align-item-center">
                                <i class="fas fa-list pt-1 pr-1"></i>
                                Tag List
                            </a>
                        </div>

                        <!-- /.card-header -->
                        <div class="card-body">
                            <form action="{{ route('tag.update',$tag->id) }}" method="POST" enctype="multipart/form-data">
                                @csrf
                                @method('PUT')
                                <div class="form-group">
                                    <label for="name">Tag Name:</label>
                                    <input type="text" name="name"
                                        class="form-control @error('TagName') is-invalid @enderror"
                                        placeholder="Enter TagName..." id="name" value="{{ old('name',$tag->name) }}">

                                    @error('name')
                                        <span class="text-danger">{{ $message }}</span>
                                    @enderror
                                </div>

                                <button type="submit" class="btn btn-success">
                                    <i class="fas fa-save"></i> Update
                                </button>
                            </form>
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
