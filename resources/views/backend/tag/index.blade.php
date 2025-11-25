@extends('layouts.admin-app')
@section('title', 'Tag')
@section('content')

    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-sm-6 pl-2">
                        <h4>Tag</h4>
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
                                <i class="fas fa-list mr-2"></i>All Tag
                            </h3>
                            {{-- <button type="button" class="btn btn-primary float-right" data-toggle="modal"
                                data-target="#CreateCtegory">
                                Add Tag
                            </button> --}}

                            <a href="{{ route('tag.create') }}" class="btn btn-success float-right">
                                <i class="fas fa-plus pt-1 pr-1"></i>
                                Create Tag
                            </a>

                        </div>
                        <!-- /.card-header -->
                        <div class="card-body">
                            <table id="example2" class="table table-bordered table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th># Sl No</th>
                                        <th>Name</th>
                                        <th>Ation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($tags as  $tag)
                                        <tr>
                                            <td>{{ $loop->index + 1 }}</td>
                                            <td>{{ $tag->name }}</td>
                                            <td class="d-flex flex-wrap">
                                                <a href="{{ route('tag.show', $tag->id) }}" class="btn btn-warning btn-sm">
                                                    <i class="fa fa-eye" aria-hidden="true"></i>
                                                </a>

                                                <a href="{{ route('tag.edit', $tag->id) }}" class="btn btn-info btn-sm ml-2">
                                                    <i class="far fa-edit"></i>
                                                </a>

                                                <form action="{{ route('tag.destroy', $tag->id) }}" method="POST">
                                                    @csrf
                                                    @method('Delete')
                                                    <button type="submit" class="btn btn-danger btn-sm ml-2"
                                                        onclick="DeleteConfirm(event)"><i
                                                            class="fas fa-trash-alt"></i></button>

                                                </form>

                                            </td>
                                        </tr>
                                    @empty
                                        <td colspan="5" class="text-center">
                                            <span class="text-danger text-bold">
                                                No Data Found
                                            </span>
                                        </td>
                                    @endforelse

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

    @if(session('notification'))
    <script>
        const notification = @json(session('notification'));

        toastr[notification.type](notification.message, notification.title, {
            positionClass: "toast-" + notification.position,
            progressBar: notification.progressBar,
            timeOut: notification.timeOut,
            extendedTimeOut: notification.extendedTimeOut,
            closeButton: notification.closeButton,
            closeHtml: notification.closeHtml,
            showMethod: notification.showMethod,
            hideMethod: notification.hideMethod,
        });
    </script>
@endif
@endsection
