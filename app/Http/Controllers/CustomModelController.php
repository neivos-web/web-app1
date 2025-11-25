<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class CustomModelController extends Controller
{
    //

    public function index()  {

        return view('database-design.model.index');
        
    } public function create()  {

        return view('database-design.model.create');
        
    }
     public function store(Request $request)  {

        // $modelName = $request->ModelName;
        // $folder = $request->type;
        // // $make = "make:model";


        // $createName = $folder . "/" . $modelName;

        // if($createName){

        // }
        // else{

        // }

        // $list = Artisan::call("make:model". $folder ."/". $modelName);
        // $list = Artisan::call("make:model". $folder ."/". $modelName);
        // Artisan::call("make:model"." ". $createName);
        // $list = Artisan::call("make:model" . " " . $createName);

        // dd(Artisan::output());
        // return response($list)->json('create',"Model create success");

        // return response()->json(['success' => 'Model Create ' . $list . ' Success']);


        $request->validate([
            'name' => [
                'required',
                // Allow namespace-like "Admin/Post" segments too
                'regex:/^[A-Za-z][A-Za-z0-9_\/]*$/'
            ],
        ]);

        $folder = $request->type;
        // Normalize to StudlyCase for each segment
        $segments = collect(explode('/', $request->name))
            ->filter() // remove empty
            ->map(fn($seg) => Str::studly($seg));

        $modelName = $segments->implode('/'); // e.g. Admin/Post


        $options = [
            'name' => $modelName,
        ];

        if ($request->boolean('with_migration')) {
            $options['--migration'] = true;
        }
        if ($request->boolean('with_controller')) {
            $options['--controller'] = true;
        }
        if ($request->boolean('with_factory')) {
            $options['--factory'] = true;
        }
        // if ($request->boolean('with_seeder')) {
        //     $options['--seeder'] = true;
        // }
        // if ($request->boolean('with_request')) {
        //     $options['--request'] = true;
        // }
        
        if ($request->boolean('with_resource')) {
            $options['--resource'] = true;
        }
        if ($request->boolean('with_pivot')) {
            $options['--pivot'] = true;
        }

        // $exitCode = Artisan::call("make:model" . $folder . "/" . $options);
        $exitCode = Artisan::call('make:model', $options);
        $output   = Artisan::output();

        // exitCode 0 মানে সফল
        $message = "Exit code: {$exitCode}\n" . $output;

        return back()->with('status', $message)->withInput();

        // $notification = array(
        //     'message' => 'Model Created successfully',

        
        //     'alert-type' => 'success',
        //     'data' => 'Created',
        // );
        // return redirect()->route('model.index')->with($notification);
    }
}
