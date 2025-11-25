<?php

namespace App\Http\Controllers\frontend;

use App\Http\Controllers\Controller;
use App\Models\Page;

class PageController extends Controller
{
    public function show($slug)
    {
        
        $page = Page::where('slug', $slug)
                    ->where('pageStatus', 'publish')
                    ->firstOrFail();

        return view('website.page', compact('page'));
    }
}

