{{-- jQuery (une seule fois) --}}
<script src="{{ asset('backend/plugins/jquery/jquery.min.js') }}"></script>

{{-- jQuery UI --}}
<script src="{{ asset('backend/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
<script>
    // Resolve conflict with Bootstrap tooltip
    if ($.ui && $.ui.button) {
        $.widget.bridge('uibutton', $.ui.button);
    }
</script>

{{-- Bootstrap --}}
<script src="{{ asset('backend/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>

{{-- Plugins (charge les fichiers qui existent) --}}
<script src="{{ asset('backend/plugins/chart.js/Chart.min.js') }}"></script>
<script src="{{ asset('backend/plugins/sparklines/sparkline.js') }}"></script>
<script src="{{ asset('backend/plugins/jqvmap/jquery.vmap.min.js') }}"></script>
<script src="{{ asset('backend/plugins/jqvmap/maps/jquery.vmap.usa.js') }}"></script>
<script src="{{ asset('backend/plugins/jquery-knob/jquery.knob.min.js') }}"></script>
<script src="{{ asset('backend/plugins/moment/moment.min.js') }}"></script>
<script src="{{ asset('backend/plugins/daterangepicker/daterangepicker.js') }}"></script>
<script src="{{ asset('backend/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}"></script>
<script src="{{ asset('backend/plugins/summernote/summernote-bs4.min.js') }}"></script>
<script src="{{ asset('backend/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js') }}"></script>
<script src="{{ asset('backend/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables/jquery.dataTables.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-bs4/js/dataTables.bootstrap4.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-responsive/js/dataTables.responsive.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-responsive/js/responsive.bootstrap4.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-buttons/js/dataTables.buttons.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-buttons/js/buttons.bootstrap4.min.js') }}"></script>
<script src="{{ asset('backend/plugins/jszip/jszip.min.js') }}"></script>
<script src="{{ asset('backend/plugins/pdfmake/pdfmake.min.js') }}"></script>
<script src="{{ asset('backend/plugins/pdfmake/vfs_fonts.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-buttons/js/buttons.html5.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-buttons/js/buttons.print.min.js') }}"></script>
<script src="{{ asset('backend/plugins/datatables-buttons/js/buttons.colVis.min.js') }}"></script>

{{-- AdminLTE --}}
<script src="{{ asset('backend/dist/js/adminlte.js') }}"></script>
<script src="{{ asset('backend/dist/js/pages/dashboard.js') }}"></script>

{{-- Select2 --}}
<script src="{{ asset('backend/plugins/select2/js/select2.full.min.js') }}"></script>

{{-- Toastify (CSS + JS) --}}
<link rel="stylesheet" href="{{ asset('backend/plugins/toastify/toastify.min.css') }}">
<script src="{{ asset('backend/plugins/toastify/toastify.min.js') }}"></script>

{{-- Toastr --}}
<script src="{{ asset('backend/plugins/toastr/toastr.min.js') }}"></script>

{{-- SweetAlert2 --}}
<script src="{{ asset('backend/plugins/sweetalert2/sweetalert2.min.js') }}"></script>

{{-- Dropify --}}
<script src="{{ asset('backend/dropify/js/dropify.min.js') }}"></script>

{{-- Custom JS (après jQuery et plugins) --}}
<script src="{{ asset('backend/dist/js/custom.js') }}"></script>

{{-- Ionic / Iconpicker --}}
<script type="module" src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js"></script>
<script nomodule src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-iconpicker/1.10.0/js/bootstrap-iconpicker.bundle.min.js"></script>

{{-- Google Maps init (ne s'exécute que si #googleMap existe et si clé fournie) --}}
<script>
    function initMap() {
        var mapDiv = document.getElementById("googleMap");
        if (!mapDiv) return;
        var myLatLng = { lat: 23.0626318, lng: 89.8829389 };
        var map = new google.maps.Map(mapDiv, { zoom: 10, center: myLatLng });
        new google.maps.Marker({ position: myLatLng, map: map, title: "Marker" });
    }
    window.initMap = initMap;
</script>
@if(env('GOOGLE_MAP_KEY'))
    <script defer src="https://maps.googleapis.com/maps/api/js?key={{ env('GOOGLE_MAP_KEY') }}&callback=initMap&v=weekly"></script>
@endif

{{-- Initialisations robustes et Repeater --}}
<script>
$(function () {
    try {
        // Summernote
        if ($('#summernote').length && $.fn.summernote) {
            $('#summernote').summernote({
                placeholder: 'write here...',
                height: 250,
                disableResizeEditor: true
            });
        }

        // CodeMirror (protégé)
        if (typeof CodeMirror !== 'undefined' && document.getElementById('codeMirrorDemo')) {
            CodeMirror.fromTextArea(document.getElementById("codeMirrorDemo"), { mode: "htmlmixed", theme: "monokai" });
        }

        // Dropify
        if ($.fn.dropify && $('.dropify').length) {
            $('.dropify').dropify({ messages: { 'default': 'Drag and drop a file here or click', 'replace': 'Drag and drop or click to replace', 'remove': 'Remove', 'error': 'Ooops, something wrong happended.' }, height: 350 });
        }

        // Select2
        if ($.fn.select2) {
            if ($('.select2').length) $('.select2').select2();
            if ($('.select2bs4').length) $('.select2bs4').select2({ theme: 'bootstrap4' });
        }

        // Iconpicker
        if ($.fn.iconpicker) {
            if ($('.demo').length) $('.demo').iconpicker();
            if ($('.iconpicker').length) $('.iconpicker').iconpicker();
        }

        // Toastr messages from session (Blade -> safe JS)
        @if (Session::has('message'))
            (function(){
                var type = "{{ Session::get('alert-type', 'info') }}";
                var msg = "{{ Session::get('message') }}";
                if (typeof toastr !== 'undefined' && toastr[type]) {
                    toastr[type](msg);
                } else if (typeof Toastify !== 'undefined') {
                    Toastify({ text: msg, duration: 3000 }).showToast();
                } else {
                    console.log('Message:', type, msg);
                }
            })();
        @endif

        // SweetAlert helper functions
        window.confirmDelete = function(ev) {
            ev.preventDefault();
            var url = ev.currentTarget.getAttribute('href');
            Swal.fire({ title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!" })
                .then(function(result){ if (result.isConfirmed) window.location.href = url; });
        };

        window.DeleteConfirm = function(ev) {
            ev.preventDefault();
            var form = ev.currentTarget.closest('form');
            Swal.fire({ title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!" })
                .then(function(result){ if (result.isConfirmed) form.submit(); });
        };

        // Repeater: Ajouter un bloc (robuste)
        (function(){
            var $container = $('#sections-container');
            var idx = $container.children('.section-block').length || 0;

            $(document).on('click', '#add-section-btn', function(e){
                e.preventDefault();
                var html = '\
                <div class="section-block border p-3 mb-3" data-index="'+idx+'">\
                    <input type="hidden" name="sections['+idx+'][id]" value="">\
                    <div class="form-row">\
                        <div class="form-group col-md-3">\
                            <label>Type</label>\
                            <select name="sections['+idx+'][type]" class="form-control section-type">\
                                <option value="text" selected>Texte</option>\
                                <option value="image">Image</option>\
                                <option value="video">Vidéo</option>\
                            </select>\
                        </div>\
                        <div class="form-group col-md-3">\
                            <label>Position média</label>\
                            <select name="sections['+idx+'][position]" class="form-control">\
                                <option value="left">Gauche</option>\
                                <option value="right">Droite</option>\
                            </select>\
                        </div>\
                        <div class="form-group col-md-2">\
                            <label>Ordre</label>\
                            <input type="number" name="sections['+idx+'][order]" class="form-control" value="'+idx+'">\
                        </div>\
                        <div class="form-group col-md-4 text-right">\
                            <label>&nbsp;</label><br>\
                            <button type="button" class="btn btn-danger btn-sm remove-section-btn"><i class="fas fa-trash"></i> Supprimer</button>\
                        </div>\
                    </div>\
                    <div class="form-group section-media d-none">\
                        <label>Media (fichier ou URL)</label>\
                        <input type="file" name="sections_media['+idx+']" class="form-control-file mb-1">\
                        <input type="text" name="sections['+idx+'][media_url]" class="form-control" placeholder="Ou URL">\
                    </div>\
                    <div class="form-group section-content">\
                        <label>Contenu texte</label>\
                        <textarea name="sections['+idx+'][content]" class="form-control" rows="4"></textarea>\
                    </div>\
                </div>';

                $container.append(html);
                idx++;
            });

            $(document).on('click', '.remove-section-btn', function(){
                $(this).closest('.section-block').remove();
            });

            $(document).on('change', '.section-type', function(){
                var $block = $(this).closest('.section-block');
                if ($(this).val() === 'text') {
                    $block.find('.section-content').removeClass('d-none');
                    $block.find('.section-media').addClass('d-none');
                } else {
                    $block.find('.section-content').addClass('d-none');
                    $block.find('.section-media').removeClass('d-none');
                }
            });
        })();

        // Protections rapides pour widgets qui plantent si éléments manquent
        if ($('#sparkline-1').length && typeof Sparkline !== 'undefined') {
            try { new Sparkline($('#sparkline-1')[0], { width: 100, height: 30 }); } catch(e){ console.warn(e); }
        }

        if ($('#areaChart').length && typeof Chart !== 'undefined') {
            try {
                var ctx = $('#areaChart')[0].getContext('2d');
                new Chart(ctx, { type: 'line', data: { labels: [], datasets: [] } });
            } catch(e){ console.warn(e); }
        }

    } catch (err) {
        console.error('Init scripts error:', err);
    }
});
</script>
{{-- Repeater amélioré pour Page Create/Edit --}}

