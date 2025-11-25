@extends('layouts.admin-app')
@section('title', 'Model List')
@section('content')

    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-sm-6 pl-2">
                        <h4>Model</h4>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Home</a></li>
                            <li class="breadcrumb-item active">Model</li>
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
                                <i class="fas fa-list mr-2"></i>All Model</h3>
                            {{-- <button type="button" class="btn btn-primary float-right" data-toggle="modal"
                                data-target="#CreateCtegory">
                                Add Category
                            </button> --}}

                            <a href="{{ route('model.create') }}" class="btn btn-success float-right">
                                <i class="fas fa-plus pt-1 pr-1"></i>
                                Create Model
                            </a>

                        </div>
                        <!-- /.card-header -->
                        <div class="card-body">
                            <table id="example2" class="table table-bordered table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th># Sl No</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Picture</th>
                                        <th>Status</th>
                                        <th>Ation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                   

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
