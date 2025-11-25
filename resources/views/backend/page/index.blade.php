@extends('layouts.admin-app')
@section('title', 'Pages')
@section('content')

    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-sm-6 pl-2">
                        <h4>Pages</h4>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Home</a></li>
                            <li class="breadcrumb-item active">Pages</li>
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
                                <i class="fas fa-list mr-2"></i>All Pages</h3>
                            <a href="{{ route('page.create') }}" class="btn btn-success float-right">
                                <i class="fas fa-plus pt-1 pr-1"></i>
                                Create Page
                            </a>

                        </div>
                        <!-- /.card-header -->
                        <div class="card-body">
                            <table id="example2" class="table table-bordered table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th># Sl No</th>
                                        <th>Page Name</th>
                                        <th>Page URL</th>
                                        <th>Meta Title</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($pages as  $page)
                                        <tr>
                                            <td>{{ $loop->index + 1 }}</td>
                                            <td>{{ $page->pageName }}</td>
                                            <td>{{ $page->pageUrl }}</td>
                                            <td>{{ $page->metaTitle }}</td>
                                            
                                            <td>
                                                @if ($page->pageStatus == 'publish')
                                                    <span class="badge bg-success">Publish</span>
                                                @else
                                                    <span class="badge bg-danger">Un Publish</span>
                                                @endif
                                            </td>
                                            <td class="d-flex align-item-center">

                                                <a href="{{ route('page.show', $page->id) }}"
                                                    class="btn btn-warning btn-sm mr-2">
                                                    <i class="fa fa-eye" aria-hidden="true"></i>
                                                </a>

                                                <a href="{{ route('page.edit', $page->id) }}"
                                                    class="btn btn-info btn-sm mr-2">
                                                    <i class="far fa-edit"></i>
                                                </a>
                                                
                                                <form action="{{ route('page.destroy', $page->id) }}" method="POST">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="btn btn-danger btn-sm" onclick="DeleteConfirm(event)">
                                                        <i class="fas fa-trash-alt"></i>
                                                    </button>
                                                </form>

                                                {{-- <a href="{{ route('page.destroy', $page->slug) }}"
                                                    class="btn btn-danger btn-sm" onclick="confirmDelete(event)">
                                                    <i class="fas fa-trash-alt"></i>
                                                </a> --}}

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


@endsection
