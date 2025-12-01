<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PageSection extends Model
{
    use HasFactory;

    protected $table = 'page_sections';

    protected $fillable = [
        'page_id',
        'type',         // text, image, video
        'position',     // left, right
        'order',
        'content',
        'media',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    // GARANTIE ABSOLUE : chaîne vide devient NULL en base
    public function setContentAttribute($value)
    {
        $this->attributes['content'] = (is_string($value) && trim($value) === '') ? null : $value;
    }

    // nettoyer les espaces inutiles
    public function getContentAttribute($value)
    {
        return $value;
    }

    // Relation avec la page
    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    // Accessor pour URL complète du média (pratique dans les vues)
    public function getMediaUrlAttribute()
    {
        if (!$this->media) {
            return null;
        }

        // Si c'est une URL externe (YouTube, Vimeo, etc.)
        if (filter_var($this->media, FILTER_VALIDATE_URL)) {
            return $this->media;
        }

        // Sinon c'est un fichier stocké localement
        return asset('storage/' . $this->media);
    }

    // Suppression propre du fichier quand la section est supprimée
    protected static function booted()
    {
        static::deleting(function ($section) {
            if ($section->media && !filter_var($section->media, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($section->media);
            }
        });
    }
}
