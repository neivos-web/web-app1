<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $guarded = [];

    
    public function parent()
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    // Relation sous-pages
    public function children()
    {
        return $this->hasMany(Page::class, 'parent_id');
    }
   
    public function sections()
    {
        return $this->hasMany(PageSection::class)->orderBy('order');
    }
}
