<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
// use App\Http\Controllers\Controller;

use App\Helpers\NotificationHelper;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class TagController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $tags = Tag::latest()->get();
        return view('backend.tag.index', compact('tags'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

        return view('backend.tag.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Tag $tag)
    {
        //validation
        $request->validate([
            'name' => 'required|string',
        ]);
        //insert data
        // Tag::create([
        //     'name' => $request->name,
        // ]);
        $tag->name = $request->name;
        $tag->save();

        // NotificationHelper::notify('Tag Inserted Successfully', 'success', 'Success');

        // helper function use
        // NotificationHelper::notify('Tag Inserted Successfully', 'Success');


        //redirect
        return redirect()->route('tag.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tag $tag)
    {
        //
        return $tag;
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tag $tag)
    {
        //

        return view('backend.tag.edit', compact('tag'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tag $tag)
    {
        //
        $tag->name = $request->name;
        $tag->save();

        // $notification = NotificationHelper::notify(
        //     'User created successfully!',
        //     'success',
        //     'Success'
        // );

        // notify()->success('Welcome to Laravel Notify ⚡️')
        notify()->success('Welcome to Laravel Notify ⚡️', 'My custom title');

        // return redirect()->route('tag.index');
        return redirect()->route('tag.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tag $tag)
    {
        //
        $tag->delete();


        // return Redirect::route('tag.index');
        $notification = array(
            'message' => 'Tag Deleted successfully',
            'alert-type' => 'error',
            'data' => 'Delete',
        );

        return redirect()->route('tag.index')->with($notification);
    }
}
