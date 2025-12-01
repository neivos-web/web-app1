<?php

namespace App\Http\Controllers\admin; 

use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage; 

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::with('parent')->orderBy('pageName')->get();
        return view('backend.page.index', compact('pages'));
    }

    public function create()
    {
        $pages = Page::where('pageStatus', 'publish')->orderBy('pageName')->get();
        return view('backend.page.create', compact('pages'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'pageName'         => 'required|string|max:255',
            'pageUrl'          => 'nullable|string|max:255|unique:pages,pageUrl',
            'pageStatus'       => 'nullable|in:publish,unpublish',
            'parent_id'        => 'nullable|exists:pages,id',
            'description'      => 'nullable|string',
            'sections_media.*' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi,webm|max:51200',
        ]);

        DB::transaction(function () use ($request) {
            $page = Page::create([
                'pageName'        => $request->pageName,
                'slug'            => Str::slug($request->pageName),
                'pageUrl'         => $request->pageUrl ?? Str::slug($request->pageName),
                'pageDescription' => $request->description,
                'pageStatus'      => $request->pageStatus ?? 'publish',
                'parent_id'       => $request->parent_id ?: null,
            ]);

            // LIGNE MANQUANTE → C'EST ELLE QUI SAUVAIT TOUT !
            $this->syncSections($page, $request);
        });

        return redirect()->route('page.index')
            ->with('message', 'Page créée avec succès !')
            ->with('alert-type', 'success');
    }
  

    public function show(Page $page)
    {
        $page->load('sections');
        return view('backend.page.view', compact('page'));
    }

    public function edit(Page $page)
    {
        $page->load('sections');
        $parentPages = Page::where('id', '!=', $page->id)
            ->where('pageStatus', 'publish')
            ->orderBy('pageName')
            ->get();

        return view('backend.page.edit', compact('page', 'parentPages'));
    }

    public function update(Request $request, Page $page)
    {
        $request->validate([
            'pageName'         => 'required|string|max:255',
            'pageUrl'          => 'nullable|string|max:255|unique:pages,pageUrl,' . $page->id,
            'pageStatus'       => 'nullable|in:publish,unpublish',
            'parent_id'        => 'nullable|exists:pages,id',
            'description'      => 'nullable|string',
            'sections_media.*' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi,webm|max:51200',
        ]);

        DB::transaction(function () use ($request, $page) {
            $page->update([
                'pageName'        => $request->pageName,
                'slug'            => Str::slug($request->pageName),
                'pageUrl'         => $request->pageUrl ?? Str::slug($request->pageName),
                'pageDescription' => $request->description,
                'pageStatus'      => $request->pageStatus ?? 'publish',
                'parent_id'       => $request->parent_id ?: null,
            ]);

            $this->syncSections($page, $request);
        });

        return redirect()->route('page.index')
            ->with('message', 'Page modifiée avec succès !')
            ->with('alert-type', 'success');
    }

    /**
     * Synchronise les sections (création + édition)
     */
    private function syncSections(Page $page, Request $request)
    {
        // Supprimer les sections retirées du formulaire
        $incomingIds = collect($request->input('sections', []))
            ->pluck('id')
            ->filter()
            ->toArray();

        if (!empty($incomingIds)) {
            $page->sections()->whereNotIn('id', $incomingIds)->delete();
        } else {
            // si aucune section entrante, on peut supprimer toutes les existantes
            if (!$request->has('sections')) {
                $page->sections()->delete();
                return;
            }
        }

        // Si pas de sections dans la requête, on sort
        if (!$request->has('sections')) {
            return;
        }

        foreach ($request->input('sections', []) as $index => $data) {
            // Assurer index int
            $index = is_numeric($index) ? (int)$index : $index;

            // Détecter si la section contient quelque chose d'utile
            $contentRaw = $data['content'] ?? '';
            $contentTrim = is_string($contentRaw) ? trim($contentRaw) : '';

            $mediaUrl = $data['media_url'] ?? '';
            $hasFile = $request->hasFile("sections_media.$index");

            $hasData = ($data['type'] ?? '') !== ''
                || $contentTrim !== ''
                || (!empty($mediaUrl))
                || $hasFile;

            if (!$hasData) {
                // ignorer cette section totalement vide
                continue;
            }

            // Normaliser le contenu : on stocke NULL si vide, sinon la valeur (on garde le HTML si l'éditeur l'envoie)
            $content = $contentTrim === '' ? null : $contentRaw;

            $section = PageSection::updateOrCreate(
                ['id' => $data['id'] ?? null],
                [
                    'page_id'  => $page->id,
                    'type'     => $data['type'] ?? 'text',
                    'position' => $data['position'] ?? 'right',
                    'order'    => $data['order'] ?? ($index + 1),
                    'content'  => $content,
                ]
            );

            // Gestion du média (priorité au fichier uploadé)
            if ($hasFile) {
                // supprimer ancien fichier si présent et si c'est un chemin local
                if ($section->media && !filter_var($section->media, FILTER_VALIDATE_URL)) {
                    Storage::disk('public')->delete($section->media);
                }
                $path = $request->file("sections_media.$index")->store('pages/sections', 'public');
                $section->media = $path;
                $section->save();
            } elseif (!empty($mediaUrl)) {
                $section->media = $mediaUrl;
                $section->save();
            } else {
                // Ne rien faire — garder la valeur existante si aucune modification
            }
        }
    }

    public function destroy(Page $page)
    {
        // Supprime aussi les sections liées (cascade ou manuellement)
        $page->sections()->delete();
        $page->delete();

        return redirect()
            ->route('page.index')
            ->with('message', 'Page supprimée définitivement.')
            ->with('alert-type', 'success');
    }
}