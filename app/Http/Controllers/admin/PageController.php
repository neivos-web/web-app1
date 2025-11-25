<?php

namespace App\Http\Controllers\admin;

use App\Models\Page;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $pages = Page::all();
        return view('backend.page.index',compact('pages'));
    }

    /**
     * Show the form for creating a new resource.
     */ 
    public function create()
    {
        //

        return view('backend.page.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Page $page)
    {
        //


        // [
        //         'pageName' => 'Home',
        //         'slug' => 'home',
        //         'pageUrl' => 'home',
        //         'metaTitle' => 'Home',
        //         'metaKeywords' => 'Home',
        //         'metaDescription' => 'Home',
        //         'headerScript' => '',
        //         'footerScript' => '',
        //         'pageStatus' => 'publish'
        //     ]



        $page->pageName = $request->pageName;
        $page->slug = Str::slug($request->pageName);
        $page->pageUrl = $request->pageUrl;
        $page->pageDescription = $request->description;
        $page->metaTitle = $request->metaTitle;
        $page->metaKeywords = $request->metaKeywords;
        $page->metaDescription = $request->metaDescription;

        $page->headerScript = $request->headerScript;
        $page->footerScript = $request->footerScript;
        $page->pageStatus = $request->pageStatus;
        $page->save();

        $notification = [
            'message' => 'Page Created Successfully',
            'alert-type' => 'success',
            'data' => 'Created',
        ];

        return redirect()->route('page.index')->with($notification);
    }

    /**
     * Display the specified resource.
     */
    public function show(Page $page)
    {
        //

        return view('backend.page.view', compact('page'));

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Page $page)
    {
        //

        return view('backend.page.edit', compact('page'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page)
    {
        //
        $page->pageName = $request->pageName;
        $page->slug = Str::slug($request->pageName);
        $page->pageUrl = $request->pageUrl;
        $page->pageDescription = $request->description;
        $page->metaTitle = $request->metaTitle;
        $page->metaKeywords = $request->metaKeywords;
        $page->metaDescription = $request->metaDescription;

        $page->headerScript = $request->headerScript;
        $page->footerScript = $request->footerScript;
        $page->pageStatus = $request->pageStatus;
        $page->save();

        $notification = [
            'message' => 'Page Updated Successfully',
            'alert-type' => 'success',
            'data' => 'Updated',
        ];

        return redirect()->route('page.index')->with($notification);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        //
        //  $page->destroy($page->id);
        $page->delete();
        // Page::destroy($page->id);

        $notification = [
            'message' => 'Page Deleted Successfully',
            'alert-type' => 'error',
            'data' => 'Deleted',
        ];

        return redirect()->route('page.index')->with($notification);
    }
}
