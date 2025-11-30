<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['image','video','text'])->default('text');
            // Pour image: path du fichier; pour video: url ou path; pour text: null
            $table->string('media')->nullable();
            $table->longText('content')->nullable();
            $table->enum('position', ['left','right'])->default('left'); // position du média (gauche/droite)
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};
