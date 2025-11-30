{{-- resources/views/page/partials/section-block.blade.php --}}
<div class="section-block border p-3 mb-3 bg-light rounded" data-index="{{ $i }}">
    <input type="hidden" name="sections[{{ $i }}][id]" value="{{ $section['id'] ?? '' }}">

    <div class="row">
        <div class="col-md-3 form-group">
            <label>Type</label>
            <select name="sections[{{ $i }}][type]" class="form-control section-type">
                <option value="text" {{ ($section['type'] ?? '') == 'text' ? 'selected' : '' }}>Texte</option>
                <option value="image" {{ ($section['type'] ?? '') == 'image' ? 'selected' : '' }}>Image</option>
                <option value="video" {{ ($section['type'] ?? '') == 'video' ? 'selected' : '' }}>Vidéo</option>
            </select>
        </div>
        <div class="col-md-3 form-group">
            <label>Position média</label>
            <select name="sections[{{ $i }}][position]" class="form-control">
                <option value="left" {{ ($section['position'] ?? '') == 'left' ? 'selected' : '' }}>Gauche</option>
                <option value="right" {{ ($section['position'] ?? '') == 'right' ? 'selected' : '' }}>Droite</option>
            </select>
        </div>
        <div class="col-md-2 form-group">
            <label>Ordre</label>
            <input type="number" name="sections[{{ $i }}][order]" class="form-control" value="{{ $section['order'] ?? $i + 1 }}">
        </div>
        <div class="col-md-4 form-group text-right">
            <label>&nbsp;</label><br>
            <button type="button" class="btn btn-danger btn-sm remove-section-btn">
                <i class="fas fa-trash"></i> Supprimer
            </button>
        </div>
    </div>

    <div class="form-group section-media {{ ($section['type'] ?? '') == 'text' ? 'd-none' : '' }}">
        <label>Média</label>
        <input type="file" name="sections_media[{{ $i }}]" class="form-control-file mb-2">
        <input type="text" name="sections[{{ $i }}][media_url]" class="form-control" placeholder="Ou URL" value="{{ $section['media_url'] ?? '' }}">
    </div>

    <div class="form-group section-content {{ ($section['type'] ?? '') != 'text' ? 'd-none' : '' }}">
        <label>Contenu texte</label>
        <textarea name="sections[{{ $i }}][content]" class="form-control" rows="5">{{ $section['content'] ?? '' }}</textarea>
    </div>
</div>