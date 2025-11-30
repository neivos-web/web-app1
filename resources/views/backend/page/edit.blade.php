{{-- resources/views/backend/page/edit.blade.php --}}
@extends('layouts.admin-form')

@section('title', 'Modifier la page')

@section('content')
<div class="content-wrapper">
    <section class="content-header">
        <div class="container-fluid">
            <div class="row mb-2">
                <div class="col-sm-6"><h1>Modifier la page</h1></div>
                <div class="col-sm-6">
                    <ol class="breadcrumb float-sm-right">
                        <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Accueil</a></li>
                        <li class="breadcrumb-item"><a href="{{ route('page.index') }}">Pages</a></li>
                        <li class="breadcrumb-item active">Modifier</li>
                    </ol>
                </div>
            </div>
        </div>
    </section>

    <section class="content">
        <div class="container-fluid">
            <div class="card card-primary card-outline">
                <div class="card-header">
                    <h3 class="card-title">Modifier la page</h3>
                </div>

                <form action="{{ route('page.update', $page->id) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')

                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-7">
                                <div class="form-group">
                                    <label>Nom de la page <span class="text-danger">*</span></label>
                                    <input type="text" name="pageName" id="pageName"
                                           class="form-control @error('pageName') is-invalid @enderror"
                                           value="{{ old('pageName', $page->pageName) }}" required>
                                    @error('pageName') <div class="invalid-feedback">{{ $message }}</div> @enderror
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>URL (slug)</label>
                                    <input type="text" name="pageUrl" id="pageUrl" class="form-control"
                                           value="{{ old('pageUrl', $page->pageUrl) }}" placeholder="auto si vide">
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class="form-group">
                                    <label>Statut</label>
                                    <select name="pageStatus" class="form-control">
                                        <option value="publish" {{ old('pageStatus', $page->pageStatus) === 'publish' ? 'selected' : '' }}>Publier</option>
                                        <option value="unpublish" {{ old('pageStatus', $page->pageStatus) === 'unpublish' ? 'selected' : '' }}>Dépublier</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Description générale</label>
                            <textarea name="description" id="summernote" class="form-control">{{ old('description', $page->pageDescription) }}</textarea>
                        </div>

                        <!-- SECTIONS -->
                        <div class="card card-success">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h3 class="card-title mb-0">Sections de la page</h3>
                                <button type="button" id="add-section" class="btn btn-success btn-sm">Ajouter une section</button>
                            </div>
                            <div class="card-body bg-light" id="sections-container">
                                {{-- Si old('sections') existe, reconstruire à partir de old --}}
                                @if(old('sections'))
                                    @foreach(old('sections') as $i => $s)
                                        @php
                                            $type = $s['type'] ?? 'text';
                                            $position = $s['position'] ?? 'right';
                                            $content = $s['content'] ?? '';
                                        @endphp
                                        <div class="section-block card mb-4 border shadow-sm" data-index="{{ $i }}">
                                            <input type="hidden" name="sections[{{ $i }}][id]" value="{{ $s['id'] ?? '' }}">
                                            <div class="card-header bg-white">
                                                <div class="row align-items-center">
                                                    <div class="col-md-3">
                                                        <label class="font-weight-bold mb-1">Type</label>
                                                        <select name="sections[{{ $i }}][type]" class="form-control section-type">
                                                            <option value="text" {{ $type === 'text' ? 'selected' : '' }}>Texte seul</option>
                                                            <option value="image" {{ $type === 'image' ? 'selected' : '' }}>Image + Texte</option>
                                                            <option value="video" {{ $type === 'video' ? 'selected' : '' }}>Vidéo + Texte</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <label class="font-weight-bold mb-1">Position du média</label>
                                                        <select name="sections[{{ $i }}][position]" class="form-control section-position" {{ $type === 'text' ? 'disabled' : '' }}>
                                                            <option value="left" {{ $position === 'left' ? 'selected' : '' }}>À gauche</option>
                                                            <option value="right" {{ $position === 'right' ? 'selected' : '' }}>À droite</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-md-2">
                                                        <label class="font-weight-bold mb-1">Ordre</label>
                                                        <input type="number" name="sections[{{ $i }}][order]" class="form-control" value="{{ $s['order'] ?? ($i+1) }}">
                                                    </div>
                                                    <div class="col-md-4 text-right">
                                                        <button type="button" class="btn btn-danger btn-sm remove-section float-right">Supprimer</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="card-body">
                                                <!-- TEXTAREA UNIQUE -->
                                                <div class="form-group">
                                                    <label>Texte</label>
                                                    <textarea name="sections[{{ $i }}][content]" class="form-control content-textarea" rows="8">{{ $content }}</textarea>
                                                </div>

                                                <!-- MEDIA WRAPPER -->
                                                <div class="media-wrapper" style="display: {{ $type === 'text' ? 'none' : 'block' }};">
                                                    <div class="row">
                                                        <div class="col-lg-6 order-{{ $position === 'left' ? '2' : '1' }}"></div>
                                                        <div class="col-lg-6 order-{{ $position === 'left' ? '1' : '2' }}">
                                                            @if(!empty($s['current_media'] ?? false))
                                                                <div class="mb-3">
                                                                    <strong>Média actuel :</strong><br>
                                                                    <img src="{{ $s['current_media'] }}" class="img-fluid rounded" style="max-height:200px">
                                                                </div>
                                                            @endif
                                                            <div class="form-group">
                                                                <label>Nouveau fichier</label>
                                                                <input type="file" name="sections_media[{{ $i }}]" class="form-control-file">
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Ou URL externe (YouTube, Vimeo...)</label>
                                                                <input type="text" name="sections[{{ $i }}][media_url]" class="form-control" value="{{ $s['media_url'] ?? '' }}">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach

                                {{-- Sinon, reconstruire à partir des sections existantes $page->sections --}}
                                @else
                                    @php
                                        // trier par ordre si disponible
                                        $sectionsToShow = $page->sections->sortBy('order')->values();
                                    @endphp

                                    @foreach($sectionsToShow as $i => $sec)
                                        @php
                                            $type = $sec->type ?? 'text';
                                            $position = $sec->position ?? 'right';
                                            $content = $sec->content ?? '';
                                            // current media : si c'est un chemin stocké (storage) ou une URL
                                            $currentMedia = null;
                                            if ($sec->media) {
                                                // si c'est une URL absolue, on l'affiche telle quelle, sinon on prend storage path
                                                if (filter_var($sec->media, FILTER_VALIDATE_URL)) {
                                                    $currentMedia = $sec->media;
                                                } else {
                                                    $currentMedia = asset('storage/' . ltrim($sec->media, '/'));
                                                }
                                            }
                                        @endphp

                                        <div class="section-block card mb-4 border shadow-sm" data-index="{{ $i }}">
                                            <input type="hidden" name="sections[{{ $i }}][id]" value="{{ $sec->id }}">
                                            <div class="card-header bg-white">
                                                <div class="row align-items-center">
                                                    <div class="col-md-3">
                                                        <label class="font-weight-bold mb-1">Type</label>
                                                        <select name="sections[{{ $i }}][type]" class="form-control section-type">
                                                            <option value="text" {{ $type === 'text' ? 'selected' : '' }}>Texte seul</option>
                                                            <option value="image" {{ $type === 'image' ? 'selected' : '' }}>Image + Texte</option>
                                                            <option value="video" {{ $type === 'video' ? 'selected' : '' }}>Vidéo + Texte</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <label class="font-weight-bold mb-1">Position du média</label>
                                                        <select name="sections[{{ $i }}][position]" class="form-control section-position" {{ $type === 'text' ? 'disabled' : '' }}>
                                                            <option value="left" {{ $position === 'left' ? 'selected' : '' }}>À gauche</option>
                                                            <option value="right" {{ $position === 'right' ? 'selected' : '' }}>À droite</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-md-2">
                                                        <label class="font-weight-bold mb-1">Ordre</label>
                                                        <input type="number" name="sections[{{ $i }}][order]" class="form-control" value="{{ $sec->order ?? ($i+1) }}">
                                                    </div>
                                                    <div class="col-md-4 text-right">
                                                        <button type="button" class="btn btn-danger btn-sm remove-section float-right">Supprimer</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="card-body">
                                                <!-- TEXTAREA UNIQUE -->
                                                <div class="form-group">
                                                    <label>Texte</label>
                                                    <textarea name="sections[{{ $i }}][content]" class="form-control content-textarea" rows="8">{{ old("sections.$i.content", $content) }}</textarea>
                                                </div>

                                                <!-- MEDIA WRAPPER -->
                                                <div class="media-wrapper" style="display: {{ $type === 'text' ? 'none' : 'block' }};">
                                                    <div class="row">
                                                        <div class="col-lg-6 order-{{ $position === 'left' ? '2' : '1' }}"></div>
                                                        <div class="col-lg-6 order-{{ $position === 'left' ? '1' : '2' }}">
                                                            @if($currentMedia)
                                                                <div class="mb-3">
                                                                    <strong>Média actuel :</strong><br>
                                                                    <img src="{{ $currentMedia }}" class="img-fluid rounded" style="max-height:200px">
                                                                </div>
                                                            @endif
                                                            <div class="form-group">
                                                                <label>Nouveau fichier</label>
                                                                <input type="file" name="sections_media[{{ $i }}]" class="form-control-file">
                                                            </div>
                                                            <div class="form-group">
                                                                <label>Ou URL externe (YouTube, Vimeo...)</label>
                                                                <input type="text" name="sections[{{ $i }}][media_url]" class="form-control" value="{{ old("sections.$i.media_url", $sec->media) }}">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                @endif
                            </div>
                        </div>

                        <div class="form-group mt-4">
                            <label>Page parente (optionnel)</label>
                            <select name="parent_id" class="form-control">
                                <option value="">-- Aucune --</option>
                                @foreach(\App\Models\Page::orderBy('pageName')->get() as $p)
                                    <option value="{{ $p->id }}" {{ old('parent_id', $page->parent_id) == $p->id ? 'selected' : '' }}>{{ $p->pageName }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div class="card-footer text-right">
                        <a href="{{ route('page.index') }}" class="btn btn-default mr-2">Annuler</a>
                        <button type="submit" class="btn btn-primary">Enregistrer les modifications</button>
                    </div>
                </form>
            </div>
        </div>
    </section>
</div>
@endsection

@push('scripts')
<script src="{{ asset('backend/plugins/summernote/summernote-bs4.min.js') }}"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    $('#summernote').summernote({ height: 200 });

    // Slug auto
    $('#pageName').on('input', function () {
        if (!$('#pageUrl').val()) {
            const slug = this.value.trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s-]/gi, '')
                .replace(/\s+/g, '-').toLowerCase();
            $('#pageUrl').val(slug);
        }
    });

    let sectionIndex = 0;

    // Si on a des sections déjà en DOM, initialiser sectionIndex correctement
    const existingBlocks = document.querySelectorAll('#sections-container .section-block');
    if (existingBlocks.length) {
        existingBlocks.forEach(b => {
            const idx = parseInt(b.getAttribute('data-index'));
            if (!isNaN(idx) && idx >= sectionIndex) sectionIndex = idx + 1;
        });
    }

    // Fonction d'ajout (utilisée par le bouton)
    window.addSection = function(data = {}) {
        const i = sectionIndex++;
        const type = data.type || 'text';
        const position = data.position || 'right';
        // Échapper backticks pour template literal safety
        const content = (data.content ?? '').replace(/`/g, '\\`').replace(/<\/?script/gi, '');

        const html = `
        <div class="section-block card mb-4 border shadow-sm" data-index="${i}">
            <input type="hidden" name="sections[${i}][id]" value="${data.id || ''}">
            <div class="card-header bg-white">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <label class="font-weight-bold mb-1">Type</label>
                        <select name="sections[${i}][type]" class="form-control section-type">
                            <option value="text" ${type === 'text' ? 'selected' : ''}>Texte seul</option>
                            <option value="image" ${type === 'image' ? 'selected' : ''}>Image + Texte</option>
                            <option value="video" ${type === 'video' ? 'selected' : ''}>Vidéo + Texte</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="font-weight-bold mb-1">Position du média</label>
                        <select name="sections[${i}][position]" class="form-control section-position" ${type === 'text' ? 'disabled' : ''}>
                            <option value="left" ${position === 'left' ? 'selected' : ''}>À gauche</option>
                            <option value="right" ${position === 'right' ? 'selected' : ''}>À droite</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="font-weight-bold mb-1">Ordre</label>
                        <input type="number" name="sections[${i}][order]" class="form-control" value="${data.order ?? (i+1)}">
                    </div>
                    <div class="col-md-4 text-right">
                        <button type="button" class="btn btn-danger btn-sm remove-section float-right">Supprimer</button>
                    </div>
                </div>
            </div>

            <div class="card-body">
                <!-- TEXTAREA UNIQUE -->
                <div class="form-group">
                    <label>Texte</label>
                    <textarea name="sections[${i}][content]" class="form-control content-textarea" rows="8">${content}</textarea>
                </div>

                <!-- MEDIA WRAPPER -->
                <div class="media-wrapper" style="display: ${type === 'text' ? 'none' : 'block'};">
                    <div class="row">
                        <div class="col-lg-6 order-${position === 'left' ? '2' : '1'}"></div>
                        <div class="col-lg-6 order-${position === 'left' ? '1' : '2'}">
                            <div class="form-group">
                                <label>Nouveau fichier</label>
                                <input type="file" name="sections_media[${i}]" class="form-control-file">
                            </div>
                            <div class="form-group">
                                <label>Ou URL externe (YouTube, Vimeo...)</label>
                                <input type="text" name="sections[${i}][media_url]" class="form-control" value="${data.media_url ?? ''}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        document.getElementById('sections-container').insertAdjacentHTML('beforeend', html);
    };

    // Ajouter la première section si aucune n'est présente (comportement existant)
    if (document.querySelectorAll('#sections-container .section-block').length === 0) {
        addSection();
    }

    // Bouton Ajouter
    document.getElementById('add-section').addEventListener('click', function(e){
        e.preventDefault();
        addSection();
    });

    // Supprimer section (délégation)
    document.getElementById('sections-container').addEventListener('click', function(e) {
        const rem = e.target.closest('.remove-section');
        if (rem) {
            rem.closest('.section-block').remove();
        }
    });

    // Changement de type / position (délégation)
    document.getElementById('sections-container').addEventListener('change', function(e) {
        const block = e.target.closest('.section-block');
        if (!block) return;

        const typeSelect = block.querySelector('.section-type');
        const positionSelect = block.querySelector('.section-position');
        const mediaWrapper = block.querySelector('.media-wrapper');

        if (e.target === typeSelect) {
            const type = typeSelect.value;
            if (type === 'text') {
                mediaWrapper.style.display = 'none';
                positionSelect.disabled = true;
            } else {
                mediaWrapper.style.display = 'block';
                positionSelect.disabled = false;
            }
        }

        if (e.target === positionSelect) {
            const pos = positionSelect.value;
            const cols = block.querySelectorAll('.media-wrapper .row > div');
            if (cols.length >= 2) {
                cols[0].className = `col-lg-6 order-${pos === 'left' ? '2' : '1'}`;
                cols[1].className = `col-lg-6 order-${pos === 'left' ? '1' : '2'}`;
            }
        }
    });
});
</script>

<!-- CKEditor 5 -->
<script src="https://cdn.ckeditor.com/ckeditor5/41.0.0/classic/ckeditor.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function () {
    // Transformer tous les textarea existants en éditeur riche (summernote reste pour description)
    document.querySelectorAll('textarea').forEach((el) => {
        // éviter d'initialiser l'éditeur deux fois
        if (!el.classList.contains('ck-init')) {
            ClassicEditor
                .create(el)
                .then(editor => {
                    el.classList.add('ck-init');
                })
                .catch(error => console.error(error));
        }
    });
});
</script>

@endpush
