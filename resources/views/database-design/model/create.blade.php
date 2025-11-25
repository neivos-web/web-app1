@extends('layouts.admin-app')
@section('title', 'Model')
@section('content')

    <div class="content-wrapper">
        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <h1 class="text-2xl font-bold mb-6">Generate Model (via Artisan::call)</h1>
                            </div>

                            @if (session('status'))
                                <div class="p-4 bg-green-100 border border-green-300 rounded mb-4">
                                    <pre class="whitespace-pre-wrap text-sm">{{ session('status') }}</pre>
                                </div>
                            @endif

                            @if ($errors->any())
                                <div class="p-4 bg-red-100 border border-red-300 rounded mb-4">
                                    <ul class="list-disc list-inside text-sm">
                                        @foreach ($errors->all() as $err)
                                            <li>{{ $err }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif

                            <!-- /.card-header -->
                            <div class="card-body">
                                <form action="{{ route('model.store') }}" method="POST" enctype="multipart/form-data">
                                    @csrf
                                    <div class="mb-4">
                                        <label class="block font-medium mb-1">Model Name (StudlyCase)</label>
                                        <input type="text" name="name" value="{{ old('name') }}"
                                            class="w-full border rounded px-3 py-2" placeholder="Post or Blog/Post">
                                        <small class="text-gray-500">You can also pass a sub-namespace like
                                            <code>Admin/Post</code>
                                        </small>
                                    </div>

                                    <div class="mb-4">
                                        <label class="block font-medium mb-1">Options</label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="with_migration" value="1"
                                                {{ old('with_migration') ? 'checked' : '' }}>
                                            <span class="ml-1">--Migration</span>
                                        </label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="with_controller" value="1"
                                                {{ old('with_controller') ? 'checked' : '' }}>
                                            <span class="ml-1">--Controller</span>
                                        </label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="with_factory" value="1"
                                                {{ old('with_factory') ? 'checked' : '' }}>
                                            <span class="ml-1">--factory</span>
                                        </label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="with_seeder" value="1"
                                                {{ old('with_seeder') ? 'checked' : '' }}>
                                            <span class="ml-1">--Seeder</span>
                                        </label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="with_request" value="1"
                                                {{ old('with_request') ? 'checked' : '' }}>
                                            <span class="ml-1">--Request</span>
                                        </label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="with_resource" value="1"
                                                {{ old('with_resource') ? 'checked' : '' }}>
                                            <span class="ml-1">--Resource</span>
                                        </label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="with_pivot" value="1"
                                                {{ old('with_pivot') ? 'checked' : '' }}>
                                            <span class="ml-1">--pivot</span>
                                        </label>
                                        <label class="inline-flex items-center mr-4">
                                            <input type="checkbox" name="all" value="1"
                                                {{ old('all') ? 'checked' : '' }}>
                                            <span class="ml-1">All</span>
                                        </label>
                                        <small class="text-gray-500">All click to all select</small>
                                    </div>

                                    <div class="form-group col-sm-3">
                                        <label for="type">Type:</label>
                                        <select name="type" id="type"
                                            class="form-control @error('type') is-invalid @enderror">
                                            <option value=""> >> Choose Type << </option>
                                            <option value="frontend">Frontend</option>
                                            <option value="backend">Backend</option>

                                        </select>
                                        @error('type')
                                            <span class="text-danger pt-2">{{ $message }}</span>
                                        @enderror
                                    </div>

                                    <button type="submit" class="btn btn-success">
                                        Generate
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
